import logging
from typing import List, Optional
from fastapi import APIRouter, Header, HTTPException, Depends, status
from pydantic import BaseModel
from backend.services.supabase_client import get_supabase_admin, get_supabase_anon

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication & Roles"])

class UserProfileResponse(BaseModel):
    id: str
    email: Optional[str] = None
    role: str
    name: str
    district: Optional[str] = None
    village: Optional[str] = None
    activeCrops: List[str] = []

async def get_current_user_and_role(
    authorization: Optional[str] = Header(None)
) -> dict:
    """
    Extracts and validates Supabase JWT token server-side.
    Queries user profile to get verified role.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header with Bearer token is missing or invalid."
        )

    token = authorization.split("Bearer ")[1].strip()
    supabase = get_supabase_admin() or get_supabase_anon()

    if not supabase:
        # Development bypass mode if supabase credentials not yet configured
        return {
            "id": "dev-user-id",
            "email": "farmer@krushiscan.ai",
            "role": "farmer",
            "name": "Dev Farmer",
            "district": "Yavatmal"
        }

    try:
        user_res = supabase.auth.get_user(token)
        if not user_res or not user_res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session token."
            )
        
        user_id = user_res.user.id
        email = user_res.user.email

        # Query verified role from profiles table (cannot be modified by client token)
        profile_res = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        profile_data = profile_res.data or {}

        role = profile_data.get("role", "farmer")
        name = profile_data.get("name", email.split("@")[0] if email else "Farmer")

        return {
            "id": user_id,
            "email": email,
            "role": role,
            "name": name,
            "district": profile_data.get("district", "Yavatmal"),
            "village": profile_data.get("village"),
            "activeCrops": profile_data.get("active_crops", [])
        }
    except Exception as e:
        logger.error(f"Error authenticating user token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )

def require_role(*allowed_roles: str):
    """
    Dependency factory checking if authenticated user has one of allowed roles.
    """
    async def role_checker(current_user: dict = Depends(get_current_user_and_role)):
        user_role = current_user.get("role", "farmer")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. User role '{user_role}' is not authorized. Allowed: {allowed_roles}"
            )
        return current_user
    return role_checker

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user_and_role)):
    """
    Returns verified server-side profile of current user.
    """
    return UserProfileResponse(
        id=current_user["id"],
        email=current_user.get("email"),
        role=current_user["role"],
        name=current_user["name"],
        district=current_user.get("district"),
        village=current_user.get("village"),
        activeCrops=current_user.get("activeCrops", [])
    )

@router.get("/admin/users", dependencies=[Depends(require_role("admin"))])
async def list_all_users_for_admin():
    """
    Admin-only endpoint to inspect registered users and role permissions.
    """
    supabase = get_supabase_admin()
    if not supabase:
        return {"users": [], "message": "Supabase admin not configured."}
    
    res = supabase.table("profiles").select("id, name, role, district, created_at").execute()
    return {"users": res.data or []}
