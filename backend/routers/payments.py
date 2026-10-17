import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Request, Depends, status
from pydantic import BaseModel, Field
from backend.services.razorpay_service import (
    create_razorpay_order,
    verify_razorpay_signature,
    verify_webhook_signature,
    is_razorpay_configured
)
from backend.services.supabase_client import get_supabase_admin
from backend.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["Razorpay Payments"])

class CreatePaymentOrderRequest(BaseModel):
    amountInr: float = Field(..., gt=0, description="Amount in Indian Rupees")
    orderId: str = Field(..., description="Internal system order ID")
    customerName: Optional[str] = "Farmer"
    customerPhone: Optional[str] = None
    customerEmail: Optional[str] = None

class VerifyPaymentRequest(BaseModel):
    razorpayOrderId: str
    razorpayPaymentId: str
    razorpaySignature: str
    internalOrderId: str

@router.get("/status")
def get_payment_system_status():
    """
    Returns payment gateway configuration status.
    Never pretends payments are configured when keys are missing.
    """
    configured = is_razorpay_configured()
    return {
        "provider": "Razorpay",
        "currency": "INR",
        "isLiveConfigured": configured,
        "keyIdConfigured": bool(settings.RAZORPAY_KEY_ID),
        "secretConfigured": bool(settings.RAZORPAY_KEY_SECRET),
        "message": (
            "Razorpay live gateway is active." if configured
            else "Razorpay credentials not yet configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env."
        )
    }

from backend.routers.auth import get_current_user_and_role

@router.post("/create-order")
def create_payment_order(
    payload: CreatePaymentOrderRequest,
    current_user: dict = Depends(get_current_user_and_role)
):
    """
    Creates an official Razorpay order with server-side validation.
    Requires authenticated farmer user.
    """
    if not is_razorpay_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Razorpay payment credentials are not configured on this server. "
                "Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env."
            )
        )

    try:
        order = create_razorpay_order(
            amount_inr=payload.amountInr,
            receipt_id=payload.orderId,
            notes={
                "customerName": current_user.get("name") or payload.customerName or "Farmer",
                "customerPhone": payload.customerPhone or "",
                "userId": current_user["id"],
                "internalOrderId": payload.orderId
            }
        )
        return {
            "success": True,
            "razorpayOrderId": order["id"],
            "amountPaise": order["amount"],
            "currency": order["currency"],
            "keyId": settings.RAZORPAY_KEY_ID
        }
    except Exception as e:
        logger.error(f"Failed to create Razorpay order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment order. Please try again.")

@router.post("/verify")
def verify_payment(
    payload: VerifyPaymentRequest,
    current_user: dict = Depends(get_current_user_and_role)
):
    """
    Cryptographically verifies Razorpay payment signature server-side.
    Marks internal order as confirmed in Supabase database upon successful verification.
    Enforces user ownership to prevent broken object level authorization (IDOR).
    """
    if not is_razorpay_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cannot verify signature: Razorpay credentials are not configured."
        )

    is_valid = verify_razorpay_signature(
        razorpay_order_id=payload.razorpayOrderId,
        razorpay_payment_id=payload.razorpayPaymentId,
        razorpay_signature=payload.razorpaySignature
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature. Payment could not be verified."
        )

    # Update order in Supabase enforcing user ownership
    supabase = get_supabase_admin()
    if supabase:
        try:
            # Check that the order belongs to the authenticated user
            existing = supabase.table("orders").select("user_id").eq("id", payload.internalOrderId).single().execute()
            if existing.data and existing.data.get("user_id") != current_user["id"]:
                logger.warning(f"IDOR attempt: User {current_user['id']} tried to confirm order {payload.internalOrderId} owned by {existing.data.get('user_id')}")
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this order.")

            supabase.table("orders").update({
                "status": "confirmed",
                "payment_details": {
                    "razorpay_order_id": payload.razorpayOrderId,
                    "razorpay_payment_id": payload.razorpayPaymentId,
                    "verified": True
                }
            }).eq("id", payload.internalOrderId).execute()
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Could not update order status in Supabase: {e}")

    return {
        "success": True,
        "verified": True,
        "message": "Payment verified successfully by backend.",
        "razorpayPaymentId": payload.razorpayPaymentId,
        "internalOrderId": payload.internalOrderId
    }

@router.post("/webhook")
async def razorpay_webhook(request: Request):
    """
    Listens for Razorpay webhook events (e.g. payment.captured).
    """
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    if not verify_webhook_signature(body, signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    logger.info("Razorpay webhook event received and verified.")
    return {"status": "ok"}
