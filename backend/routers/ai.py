import logging
import uuid
from typing import Optional, List, Dict
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Header, status
from pydantic import BaseModel, Field
from backend.services.ai_vision_service import analyze_crop_image
from backend.services.voice_assistant_service import process_agricultural_chat
from backend.services.supabase_client import get_supabase_admin, get_supabase_anon
from backend.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["AI Diagnosis & Voice Assistant"])

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="Farmer query max 1000 characters")
    language: str = Field(default="mr", max_length=5)
    district: str = Field(default="Yavatmal", max_length=50)
    active_crops: Optional[List[str]] = None
    conversation_history: Optional[List[Dict[str, str]]] = None

def is_valid_image_magic(data: bytes, content_type: str) -> bool:
    """Verifies that uploaded file binary header matches stated image MIME type."""
    if len(data) < 12:
        return False
    if content_type in ["image/jpeg", "image/jpg"] and data[:3] == b"\xff\xd8\xff":
        return True
    if content_type == "image/png" and data[:8] == b"\x89PNG\r\n\x1a\n":
        return True
    if content_type == "image/webp" and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return True
    return False

from backend.services.image_validator import validate_image_payload, is_valid_image_magic

@router.post("/scan")
async def scan_crop_disease(
    file: UploadFile = File(...),
    file_underside: Optional[UploadFile] = File(None),
    crop_hint: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    """
    Submits a crop leaf or pest image to the AI vision pipeline.
    Supports optional dual-angle scanning (top surface + underside of the leaf).
    Performs pixel-level decoding, variance checks, and verifies visual content
    before submitting to AI. Rejects blank, corrupt, solid, or zero-dim images with HTTP 400.
    """
    content_type = file.content_type or "image/jpeg"
    image_bytes = await file.read()
    if len(image_bytes) > settings.MAX_IMAGE_UPLOAD_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds 10MB limit. Uploaded size: {len(image_bytes) / (1024*1024):.2f}MB."
        )

    # Pixel-level decoding & variance validation
    validate_image_payload(
        image_bytes=image_bytes,
        content_type=content_type,
        min_dimension=40,
        slot_name="main"
    )

    # Optional underside photo validation
    underside_bytes = None
    underside_mime = None
    if file_underside and file_underside.filename:
        raw_underside = await file_underside.read()
        if len(raw_underside) > settings.MAX_IMAGE_UPLOAD_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"Underside file exceeds 10MB limit. Uploaded size: {len(raw_underside) / (1024*1024):.2f}MB."
            )
        underside_mime = file_underside.content_type or "image/jpeg"
        validate_image_payload(
            image_bytes=raw_underside,
            content_type=underside_mime,
            min_dimension=40,
            slot_name="underside"
        )
        underside_bytes = raw_underside

    # Run AI inference
    diagnosis = await analyze_crop_image(
        image_bytes=image_bytes,
        mime_type=content_type,
        crop_hint=crop_hint,
        underside_bytes=underside_bytes,
        underside_mime=underside_mime
    )

    # Extract verified user_id strictly from Bearer token if present (prevent IDOR)
    verified_user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()
        supabase = get_supabase_admin() or get_supabase_anon()
        if supabase:
            try:
                user_res = supabase.auth.get_user(token)
                if user_res and user_res.user:
                    verified_user_id = user_res.user.id
            except Exception as e:
                logger.debug(f"Scan token check error: {e}")

    # Optional: Save to Supabase Storage and database only for verified authenticated users
    supabase = get_supabase_admin()
    image_url = None
    if supabase and verified_user_id:
        try:
            # Safe sanitized path using strictly UUIDs to prevent directory traversal
            clean_user_prefix = str(uuid.UUID(verified_user_id))
            filename = f"{clean_user_prefix}/{uuid.uuid4().hex}.jpg"
            
            supabase.storage.from_("crop-scans").upload(
                path=filename,
                file=image_bytes,
                file_options={"content-type": content_type}
            )
            image_url = supabase.storage.from_("crop-scans").get_public_url(filename)
            
            # Record in crop_scans table
            supabase.table("crop_scans").insert({
                "user_id": str(clean_user_prefix),
                "crop_name": diagnosis.get("crop_name", "Cotton"),
                "crop_variety": diagnosis.get("crop_variety"),
                "image_url": image_url,
                "disease_name": diagnosis.get("disease_name", "Unknown"),
                "local_disease_name": diagnosis.get("local_disease_name", {}),
                "severity": diagnosis.get("severity", "Moderate"),
                "confidence": diagnosis.get("confidence", 85.0),
                "diagnosis_explanation": diagnosis.get("diagnosis_explanation", ""),
                "symptoms": diagnosis.get("symptoms", []),
                "recommended_treatments": diagnosis.get("recommended_treatments", {}),
                "prevention_methods": diagnosis.get("prevention_methods", [])
            }).execute()
        except Exception as e:
            logger.warning(f"Could not persist scan to Supabase database: {e}")

    diagnosis["stored_image_url"] = image_url
    return diagnosis

@router.post("/assistant")
async def chat_with_assistant(payload: ChatRequest):
    """
    Agricultural conversational voice assistant endpoint in Marathi, Hindi, and English.
    Grounded with real-time Open-Meteo weather and APMC mandi rates.
    """
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
        
    result = await process_agricultural_chat(
        message=payload.message,
        language=payload.language,
        district=payload.district,
        active_crops=payload.active_crops,
        conversation_history=payload.conversation_history
    )
    return result
