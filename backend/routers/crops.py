import logging
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from backend.routers.auth import get_current_user_and_role
from backend.services.supabase_client import get_supabase_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/crops", tags=["Crop & Plot Management"])

class CropCreateUpdateRequest(BaseModel):
    name: str = Field(..., description="Crop name e.g. कापूस (Cotton)")
    variety: Optional[str] = None
    areaAcres: float = Field(..., gt=0)
    plotName: str
    sowingDate: Optional[str] = None
    soilType: str = "black_cotton"
    irrigationType: str = "drip"
    stage: str = "vegetative"
    healthStatus: str = "healthy"

@router.get("/")
def get_user_crops(current_user: dict = Depends(get_current_user_and_role)):
    """
    Returns crops owned by authenticated user.
    """
    supabase = get_supabase_admin()
    user_id = current_user["id"]
    if not supabase:
        # Return fallback memory items if Supabase credentials not set
        return []

    try:
        res = supabase.table("crops").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error fetching user crops: {e}")
        raise HTTPException(status_code=500, detail="Unable to retrieve crop records at this time.")

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_crop(
    payload: CropCreateUpdateRequest,
    current_user: dict = Depends(get_current_user_and_role)
):
    """
    Creates a new plot/crop record linked to authenticated user.
    """
    supabase = get_supabase_admin()
    user_id = current_user["id"]
    if not supabase:
        return {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "name": payload.name,
            "variety": payload.variety,
            "area_acres": payload.areaAcres,
            "plot_name": payload.plotName,
            "soil_type": payload.soilType,
            "irrigation_type": payload.irrigationType,
            "stage": payload.stage,
            "health_status": payload.healthStatus
        }

    try:
        new_record = {
            "user_id": user_id,
            "name": payload.name,
            "variety": payload.variety,
            "area_acres": payload.areaAcres,
            "plot_name": payload.plotName,
            "sowing_date": payload.sowingDate,
            "soil_type": payload.soilType,
            "irrigation_type": payload.irrigationType,
            "stage": payload.stage,
            "health_status": payload.healthStatus
        }
        res = supabase.table("crops").insert(new_record).execute()
        return res.data[0] if res.data else new_record
    except Exception as e:
        logger.error(f"Failed to create crop: {e}")
        raise HTTPException(status_code=500, detail="Failed to create crop record.")

@router.put("/{crop_id}")
def update_crop(
    crop_id: str,
    payload: CropCreateUpdateRequest,
    current_user: dict = Depends(get_current_user_and_role)
):
    """
    Updates crop details. Enforces user ownership.
    """
    supabase = get_supabase_admin()
    user_id = current_user["id"]
    if not supabase:
        return {"id": crop_id, "updated": True}

    try:
        # Check ownership
        existing = supabase.table("crops").select("user_id").eq("id", crop_id).single().execute()
        if not existing.data or existing.data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this crop.")

        update_data = {
            "name": payload.name,
            "variety": payload.variety,
            "area_acres": payload.areaAcres,
            "plot_name": payload.plotName,
            "sowing_date": payload.sowingDate,
            "soil_type": payload.soilType,
            "irrigation_type": payload.irrigationType,
            "stage": payload.stage,
            "health_status": payload.healthStatus,
            "updated_at": "now()"
        }
        res = supabase.table("crops").update(update_data).eq("id", crop_id).execute()
        return res.data[0] if res.data else {"id": crop_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update crop {crop_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update crop record.")

@router.delete("/{crop_id}")
def delete_crop(
    crop_id: str,
    current_user: dict = Depends(get_current_user_and_role)
):
    """
    Deletes a crop plot record. Enforces user ownership.
    """
    supabase = get_supabase_admin()
    user_id = current_user["id"]
    if not supabase:
        return {"success": True}

    try:
        existing = supabase.table("crops").select("user_id").eq("id", crop_id).single().execute()
        if not existing.data or existing.data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this crop.")

        supabase.table("crops").delete().eq("id", crop_id).execute()
        return {"success": True, "deletedId": crop_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete crop {crop_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete crop record.")
