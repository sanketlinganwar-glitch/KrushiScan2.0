import pytest
from backend.services.mandi_service import calculate_net_return, compare_multiple_mandis

def test_calculate_net_return_standard_formula():
    """
    Test prompt requirement:
    Estimated gross revenue = expected sale quantity * applicable price per unit.
    Estimated net return = estimated gross revenue - transport costs - other entered costs.
    """
    modal_price = 7500.0  # ₹/quintal
    quantity = 10.0       # quintals
    distance = 20.0       # km
    rate_km = 25.0        # ₹/km
    labor = 35.0          # ₹/quintal
    cess = 50.0           # ₹ total

    result = calculate_net_return(
        modal_price_per_quintal=modal_price,
        quantity_quintals=quantity,
        distance_km=distance,
        rate_per_km=rate_km,
        labor_per_quintal=labor,
        other_cess=cess
    )

    # Expected:
    # Gross = 10 * 7500 = 75,000
    # Transport = 20 * 25 = 500
    # Labor = 10 * 35 = 350
    # Cess = 50
    # Total deductions = 500 + 350 + 50 = 900
    # Net return = 75,000 - 900 = 74,100
    # Effective rate = 74,100 / 10 = 7,410.0

    assert result["grossRevenue"] == 75000.0
    assert result["transportCost"] == 500.0
    assert result["laborCost"] == 350.0
    assert result["totalDeductions"] == 900.0
    assert result["netReturn"] == 74100.0
    assert result["effectivePricePerQuintal"] == 7410.0

def test_calculate_net_return_invalid_inputs():
    with pytest.raises(ValueError, match="Sale quantity must be greater than zero"):
        calculate_net_return(7500.0, 0, 10, 20, 30, 0)

    with pytest.raises(ValueError, match="Modal market price must be greater than zero"):
        calculate_net_return(0, 10, 10, 20, 30, 0)

    with pytest.raises(ValueError, match="Cost parameters cannot be negative"):
        calculate_net_return(7500.0, 10, -5, 20, 30, 0)

def test_compare_multiple_mandis_ranking():
    mandis = [
        {"id": "mandi-a", "marketName": "Market A", "modalPrice": 7800},
        {"id": "mandi-b", "marketName": "Market B", "modalPrice": 7500},
    ]
    # Market A is 50km away (50 * 25 = 1250 transport)
    # Market B is 5km away (5 * 25 = 125 transport)
    distances = {"mandi-a": 50.0, "mandi-b": 5.0}

    results = compare_multiple_mandis(
        mandis_data=mandis,
        quantity_quintals=10,
        distances_map=distances,
        rate_per_km=25.0,
        labor_per_quintal=30.0,
        other_cess=50.0
    )

    # Market A: 78,000 - (1250 + 300 + 50) = 76,400
    # Market B: 75,000 - (125 + 300 + 50) = 74,525
    assert len(results) == 2
    assert results[0]["marketId"] == "mandi-a"
    assert results[0]["netReturn"] > results[1]["netReturn"]
