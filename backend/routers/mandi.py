from typing import Optional, List, Dict
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from backend.services.mandi_service import (
    fetch_mandi_prices,
    calculate_net_return,
    compare_multiple_mandis
)

router = APIRouter(prefix="/api/mandi", tags=["Mandi Rates & Net Return"])

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
    district: Optional[str] = Query(None, description="District filter e.g. Yavatmal, Wardha, Akola")
):
    """
    Returns official APMC Mandi rates and arrival records across Vidarbha.
    """
    try:
        response_data = await fetch_mandi_prices(commodity=commodity, district=district)
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch APMC market rates at this time.")

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
