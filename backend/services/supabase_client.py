import logging
from typing import Optional
from supabase import create_client, Client
from backend.config import settings

logger = logging.getLogger(__name__)

_supabase_admin_client: Optional[Client] = None
_supabase_anon_client: Optional[Client] = None

def get_supabase_admin() -> Optional[Client]:
    """
    Returns an administrative Supabase client using SUPABASE_SERVICE_ROLE_KEY.
    Used for server-side auth validation, admin verification, and secure table access.
    """
    global _supabase_admin_client
    if _supabase_admin_client is not None:
        return _supabase_admin_client
    
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    if not url or not key:
        logger.warning("Supabase credentials not configured in backend environment.")
        return None
    
    try:
        _supabase_admin_client = create_client(url, key)
        return _supabase_admin_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase admin client: {e}")
        return None

def get_supabase_anon() -> Optional[Client]:
    """
    Returns an anonymous Supabase client using SUPABASE_KEY.
    """
    global _supabase_anon_client
    if _supabase_anon_client is not None:
        return _supabase_anon_client
    
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_KEY
    if not url or not key:
        return None
    
    try:
        _supabase_anon_client = create_client(url, key)
        return _supabase_anon_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase anon client: {e}")
        return None
