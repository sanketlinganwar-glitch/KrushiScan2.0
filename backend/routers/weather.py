from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from backend.services.weather_service import get_live_weather, VIDARBHA_COORDINATES

router = APIRouter(prefix="/api/weather", tags=["Weather Integration"])

@router.get("/live")
async def get_district_weather(
    district: str = Query("Yavatmal", description="Vidarbha district name"),
    lat: Optional[float] = Query(None, description="Optional custom latitude"),
    lon: Optional[float] = Query(None, description="Optional custom longitude")
):
    """
    Returns real-time weather metrics, 7-day forecast, and PDKV spray advisories
    from Open-Meteo API. No fake or simulated numbers.
    """
    try:
        data = await get_live_weather(district=district, lat=lat, lon=lon)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail="Unable to fetch live meteorological data from Open-Meteo at this time."
        )

@router.get("/districts")
def list_supported_districts():
    """
    Returns list of all 11 Vidarbha districts with verified center coordinates.
    """
    return {
        "region": "Vidarbha, Maharashtra",
        "districts": list(VIDARBHA_COORDINATES.keys()),
        "coordinates": VIDARBHA_COORDINATES
    }
