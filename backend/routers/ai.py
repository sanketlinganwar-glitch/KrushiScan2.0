import logging
import uuid
from typing import Optional, List, Dict
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
from backend.services.ai_vision_service import analyze_crop_image
from backend.services.voice_assistant_service import process_agricultural_chat
from backend.services.supabase_client import get_supabase_admin
from backend.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["AI Diagnosis & Voice Assistant"])

class ChatRequest(BaseModel):
    message: str
    language: str = "mr"
    district: str = "Yavatmal"
    active_crops: Optional[List[str]] = None
    conversation_history: Optional[List[Dict[str, str]]] = None

@router.post("/scan")
async def scan_crop_disease(
    file: UploadFile = File(...),
    crop_hint: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None)
):
    """
    Submits a crop leaf or pest image to the AI vision pipeline.
    Validates MIME type, file size, stores to Supabase Storage if configured,
    and returns structured diagnosis conforming to PDKV / ICAR pathology.
    """
    valid_mimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    content_type = file.content_type or "image/jpeg"
    if content_type not in valid_mimes:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image format: '{content_type}'. Supported: JPEG, PNG, WEBP."
        )

    image_bytes = await file.read()
    if len(image_bytes) > settings.MAX_IMAGE_UPLOAD_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds 10MB limit. Uploaded size: {len(image_bytes) / (1024*1024):.2f}MB."
        )

    # Run AI inference
    diagnosis = await analyze_crop_image(
        image_bytes=image_bytes,
        mime_type=content_type,
        crop_hint=crop_hint
    )

    # Optional: Save to Supabase Storage and database if user_id and Supabase are present
    supabase = get_supabase_admin()
    image_url = None
    if supabase and user_id:
        try:
            filename = f"{user_id}/{uuid.uuid4()}.jpg"
            supabase.storage.from_("crop-scans").upload(
                path=filename,
                file=image_bytes,
                file_options={"content-type": content_type}
            )
            image_url = supabase.storage.from_("crop-scans").get_public_url(filename)
            
            # Record in crop_scans table
            supabase.table("crop_scans").insert({
                "user_id": user_id,
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
