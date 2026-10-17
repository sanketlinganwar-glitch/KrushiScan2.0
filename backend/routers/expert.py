import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from backend.routers.auth import get_current_user_and_role, require_role
from backend.services.supabase_client import get_supabase_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/expert", tags=["Expert Support & Ticketing"])

class InquiryCreateRequest(BaseModel):
    cropName: str
    issueCategory: str = "Disease/Pest"
    description: str = Field(..., min_length=10, max_length=2000)
    imageUrl: Optional[str] = None

class ExpertReplyRequest(BaseModel):
    inquiryId: str
    responseText: Optional[str] = Field(None, min_length=10, max_length=5000)
    responseHtml: Optional[str] = None
    suggestedProducts: Optional[List[str]] = None

@router.get("/inquiries")
def list_inquiries(current_user: dict = Depends(get_current_user_and_role)):
    """
    Farmers see only their own tickets. Experts and Admins see all tickets.
    """
    supabase = get_supabase_admin()
    if not supabase:
        return []

    role = current_user.get("role", "farmer")
    user_id = current_user["id"]

    try:
        query = supabase.table("expert_inquiries").select("*")
        if role not in ["expert", "admin"]:
            query = query.eq("user_id", user_id)
        
        res = query.order("submitted_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Failed to fetch inquiries: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch inquiries.")

@router.post("/inquiries", status_code=status.HTTP_201_CREATED)
def submit_inquiry(
    payload: InquiryCreateRequest,
    current_user: dict = Depends(get_current_user_and_role)
):
    """
    Farmer submits a question for agricultural expert review.
    """
    supabase = get_supabase_admin()
    user_id = current_user["id"]
    if not supabase:
        return {
            "id": "inq-mock",
            "user_id": user_id,
            "crop_name": payload.cropName,
            "issue_category": payload.issueCategory,
            "description": payload.description,
            "status": "pending"
        }

    try:
        new_inquiry = {
            "user_id": user_id,
            "crop_name": payload.cropName,
            "issue_category": payload.issueCategory,
            "description": payload.description,
            "image_url": payload.imageUrl,
            "status": "pending"
        }
        res = supabase.table("expert_inquiries").insert(new_inquiry).execute()
        return res.data[0] if res.data else new_inquiry
    except Exception as e:
        logger.error(f"Failed to submit inquiry: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit inquiry.")

@router.post("/reply", dependencies=[Depends(require_role("expert", "admin"))])
def submit_expert_reply(
    payload: ExpertReplyRequest,
    current_user: dict = Depends(get_current_user_and_role)
):
    """
    Verified agricultural expert or admin responds to farmer question.
    Only users with verified 'expert' or 'admin' role can execute this endpoint.
    """
    supabase = get_supabase_admin()
    if not supabase:
        return {"success": True, "message": "Reply saved (mock)."}

    # Sanitize and prefer clean text
    clean_answer = (payload.responseText or payload.responseHtml or "").strip()
    if not clean_answer:
        raise HTTPException(status_code=400, detail="Reply text cannot be empty.")

    try:
        reply_payload = {
            "expert_name": current_user["name"],
            "expert_id": current_user["id"],
            "answer": clean_answer,
            "suggested_products": payload.suggestedProducts or [],
            "replied_at": "now()"
        }

        res = supabase.table("expert_inquiries").update({
            "status": "resolved",
            "expert_response": reply_payload
        }).eq("id", payload.inquiryId).execute()

        return {"success": True, "data": res.data}
    except Exception as e:
        logger.error(f"Failed to submit expert reply: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit expert reply.")
