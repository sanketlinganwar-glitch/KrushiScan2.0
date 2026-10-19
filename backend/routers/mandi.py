from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query, HTTPException, Header, status
from pydantic import BaseModel, Field
from backend.services.mandi_service import (
    fetch_mandi_prices,
    calculate_net_return,
    compare_multiple_mandis,
    update_mandi_cache_with_records
)

router = APIRouter(prefix="/api/mandi", tags=["Mandi Rates & Net Return"])

class MandiSyncPayload(BaseModel):
    records: List[Dict[str, Any]]
    source: Optional[str] = "Government of India AGMARKNET (data.gov.in)"
    sourceUrl: Optional[str] = "https://data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    arrivalDate: Optional[str] = None

class NetReturnRequest(BaseModel):
    modalPricePerQuintal: float = Field(..., gt=0, description="Modal price in INR per quintal")
    quantityQuintals: float = Field(..., gt=0, description="Sale quantity in quintals")
    distanceKm: float = Field(..., ge=0, description="Distance from farm to mandi in km")
    ratePerKm: float = Field(default=25.0, ge=0, description="Transport cost per km in INR")
    laborPerQuintal: float = Field(default=35.0, ge=0, description="Loading/unloading labor per quintal")
    otherCess: float = Field(default=50.0, ge=0, description="Weighbridge / market entry cess")

class MultiMandiCompareRequest(BaseModel):
    quantityQuintals: float = Field(..., gt=0)
    commodity: Optional[str] = "कापूस"
    distancesMap: Dict[str, float] = Field(default_factory=dict, description="Market ID to distance in km")
    ratePerKm: float = 25.0
    laborPerQuintal: float = 35.0
    otherCess: float = 50.0

@router.get("/rates")
async def get_mandi_rates(
    commodity: Optional[str] = Query(None, description="Crop filter e.g. कापूस, सोयाबीन, तूर"),
    district: Optional[str] = Query(None, description="District filter e.g. Yavatmal, Wardha, Akola"),
    refresh: bool = Query(False, description="Bypass cache and force refresh from official Agmarknet feed")
):
    """
    Returns official APMC Mandi rates and arrival records across Vidarbha.
    """
    try:
        response_data = await fetch_mandi_prices(commodity=commodity, district=district, refresh=refresh)
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch APMC market rates at this time.")

@router.post("/sync")
def sync_mandi_rates(
    payload: MandiSyncPayload,
    x_sync_secret: Optional[str] = Header(None, alias="X-Sync-Secret"),
    authorization: Optional[str] = Header(None)
):
    """
    Authenticated scheduled data ingestion endpoint.
    Accepts genuine validated records fetched from official Data.gov.in / Agmarknet source.
    """
    from backend.config import settings
    expected_secret = settings.MANDI_SYNC_SECRET.strip()

    provided_secret = None
    if x_sync_secret:
        provided_secret = x_sync_secret.strip()
    elif authorization and authorization.startswith("Bearer "):
        provided_secret = authorization.replace("Bearer ", "").strip()

    if not provided_secret or provided_secret != expected_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Mandi synchronization authorization secret."
        )

    try:
        result = update_mandi_cache_with_records(
            raw_records=payload.records,
            source_name=payload.source or "Government of India AGMARKNET (data.gov.in)",
            source_url=payload.sourceUrl or "https://data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
            arrival_date=payload.arrivalDate
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process mandi sync: {e}")

@router.post("/calculate-net-return")
def post_calculate_net_return(payload: NetReturnRequest):
    """
    Mandated Formula:
    Estimated gross revenue = expected sale quantity * applicable price per unit.
    Estimated net return = estimated gross revenue - transport costs - other entered costs.
    """
    try:
        result = calculate_net_return(
            modal_price_per_quintal=payload.modalPricePerQuintal,
            quantity_quintals=payload.quantityQuintals,
            distance_km=payload.distanceKm,
            rate_per_km=payload.ratePerKm,
            labor_per_quintal=payload.laborPerQuintal,
            other_cess=payload.otherCess
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.post("/compare")
async def post_compare_mandis(payload: MultiMandiCompareRequest):
    """
    Compares net returns across multiple APMC markets to recommend highest net earning.
    """
    mandis_data = await fetch_mandi_prices(commodity=payload.commodity)
    mandis = mandis_data.get("records", []) if isinstance(mandis_data, dict) else mandis_data
    if not mandis:
        raise HTTPException(status_code=404, detail="No mandi records found for comparison.")

    results = compare_multiple_mandis(
        mandis_data=mandis,
        quantity_quintals=payload.quantityQuintals,
        distances_map=payload.distancesMap,
        rate_per_km=payload.ratePerKm,
        labor_per_quintal=payload.laborPerQuintal,
        other_cess=payload.otherCess
    )
    return {
        "quantity": payload.quantityQuintals,
        "bestOption": results[0] if results else None,
        "allOptions": results
    }

@router.get("/probe")
def probe_upstream_connectivity():
    import socket, urllib.request, time
    from backend.config import settings

    diag = {}
    host = "api.data.gov.in"
    port = 443
    key = (settings.DATA_GOV_IN_API_KEY or "").strip()

    # 1. DNS Resolution
    try:
        addr_info = socket.getaddrinfo(host, port)
        diag["dns_resolved"] = [f"{a[0].name}:{a[4][0]}" for a in addr_info]
    except Exception as e:
        diag["dns_error"] = str(e)

    # 2. Raw TCP Connect to IPv4
    try:
        t0 = time.time()
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5.0)
        s.connect(("164.100.61.198", 443))
        s.close()
        diag["tcp_connect_ipv4"] = f"OK in {round(time.time() - t0, 3)}s"
    except Exception as e:
        diag["tcp_connect_ipv4_error"] = str(e)

    # 3. HTTP GET via urllib
    try:
        url = f"https://{host}/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key={key}&format=json&filters[state]=Maharashtra&limit=2"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        )
        t0 = time.time()
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            diag["urllib_status"] = resp.status
            body = resp.read(200).decode("utf-8", errors="replace")
            diag["urllib_body_preview"] = body
    except Exception as e:
        diag["urllib_error"] = str(e)

    return diag
