import hmac
import hashlib
import logging
from typing import Dict, Any, Optional
from backend.config import settings

logger = logging.getLogger(__name__)

def is_razorpay_configured() -> bool:
    return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)

def create_razorpay_order(
    amount_inr: float,
    receipt_id: str,
    notes: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Creates an official Razorpay order in paisa (1 INR = 100 paise).
    Requires valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.
    """
    if not is_razorpay_configured():
        raise RuntimeError(
            "Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and "
            "RAZORPAY_KEY_SECRET in your backend environment variables to enable real payments."
        )

    import razorpay
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    amount_paise = int(round(amount_inr * 100))
    data = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": receipt_id,
        "notes": notes or {},
        "payment_capture": 1
    }

    try:
        order = client.order.create(data=data)
        logger.info(f"Razorpay order created successfully: {order.get('id')}")
        return order
    except Exception as e:
        logger.error(f"Razorpay order creation failed: {e}")
        raise RuntimeError(f"Razorpay order creation failed: {str(e)}")

def verify_razorpay_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str
) -> bool:
    """
    Cryptographically verifies the Razorpay HMAC-SHA256 signature server-side.
    Signature = HMAC-SHA256(order_id + '|' + payment_id, secret)
    """
    if not is_razorpay_configured():
        raise RuntimeError("Razorpay credentials not configured for signature verification.")

    msg = f"{razorpay_order_id}|{razorpay_payment_id}"
    secret_bytes = settings.RAZORPAY_KEY_SECRET.encode("utf-8")
    msg_bytes = msg.encode("utf-8")

    generated_signature = hmac.new(secret_bytes, msg_bytes, hashlib.sha256).hexdigest()

    is_valid = hmac.compare_digest(generated_signature, razorpay_signature)
    if not is_valid:
        logger.warning(
            f"Razorpay signature mismatch for order {razorpay_order_id} and payment {razorpay_payment_id}."
        )
    return is_valid

def verify_webhook_signature(body_bytes: bytes, webhook_signature: str) -> bool:
    """
    Validates webhook events from Razorpay using the RAZORPAY_WEBHOOK_SECRET.
    """
    secret = settings.RAZORPAY_WEBHOOK_SECRET
    if not secret:
        logger.warning("RAZORPAY_WEBHOOK_SECRET not configured.")
        return False
        
    expected = hmac.new(secret.encode("utf-8"), body_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, webhook_signature)
