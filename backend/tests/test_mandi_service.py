import pytest
import time
from backend.services.mandi_service import (
    parse_agmarknet_records,
    fetch_mandi_prices,
    OFFICIAL_VIDARBHA_MANDIS,
    resolve_commodity_msp
)

def test_resolve_commodity_msp():
    assert resolve_commodity_msp("Cotton (कापूस)") == 7521.0
    assert resolve_commodity_msp("Soyabean (Yellow)") == 4892.0
    assert resolve_commodity_msp("Arhar / Tur (Red)") == 7550.0
    assert resolve_commodity_msp("Gram Raw (Chana)") == 5440.0
    assert resolve_commodity_msp("Wheat (Lokwan)") == 2275.0
    assert resolve_commodity_msp("Paddy Common") == 2300.0
    assert resolve_commodity_msp("Unknown Exotic Herb") is None

def test_parse_agmarknet_records_validation():
    sample_records = [
        {
            "state": "Maharashtra",
            "district": "Wardha",
            "market": "Hinganghat",
            "commodity": "Cotton",
            "variety": "Long Staple",
            "min_price": "7300",
            "max_price": "7850",
            "modal_price": "7650",
            "arrivals_in_qtl": "4500",
            "arrival_date": "18/10/2026"
        },
        # Zero modal price (should be rejected/skipped)
        {
            "state": "Maharashtra",
            "district": "Akola",
            "market": "Akola",
            "commodity": "Soyabean",
            "modal_price": "0",
            "min_price": "0",
            "max_price": "0"
        },
        # Missing market name (should be rejected/skipped)
        {
            "state": "Maharashtra",
            "district": "Yavatmal",
            "market": "",
            "commodity": "Gram",
            "modal_price": "5600"
        }
    ]

    parsed = parse_agmarknet_records(sample_records)
    assert len(parsed) == 1
    rec = parsed[0]
    assert rec["district"] == "Wardha"
    assert rec["marketName"] == "Hinganghat APMC"
    assert rec["modalPrice"] == 7650.0
    assert rec["minPrice"] == 7300.0
    assert rec["maxPrice"] == 7850.0
    assert rec["arrivalsTonnes"] == 450.0  # 4500 qtl / 10 = 450 tonnes
    assert rec["unit"] == "₹/क्विंटल (Quintal)"
    assert rec["msp"] == 7521.0
    assert rec["source"] == "Government of India AGMARKNET (data.gov.in)"

@pytest.mark.asyncio
async def test_fetch_mandi_prices_baseline_coverage():
    res = await fetch_mandi_prices()
    assert isinstance(res, dict)
    assert res["count"] >= 20
    assert "status" in res
    assert res["status"] in ["live", "cached", "baseline"]
    assert res["unit"] == "₹/क्विंटल (Quintal)"
    assert "lastFetchedAt" in res
    assert "source" in res
    assert "disclaimer" in res

    # If in baseline mode, verify coverage across all 11 Vidarbha districts
    if res.get("status") == "baseline":
        districts_covered = {m["district"].lower() for m in res["records"]}
        expected_districts = {
            "wardha", "yavatmal", "akola", "amravati", "buldhana", 
            "nagpur", "washim", "chandrapur", "bhandara", "gondia", "gadchiroli"
        }
        for dist in expected_districts:
            assert dist in districts_covered, f"Missing district coverage for {dist}"
    else:
        # In live mode, verify records contain expected fields
        for r in res["records"]:
            assert "district" in r
            assert "marketName" in r
            assert "modalPrice" in r

@pytest.mark.asyncio
async def test_fetch_mandi_prices_commodity_filter():
    res = await fetch_mandi_prices()
    all_commodities = [r["commodity"] for r in res.get("records", [])]
    if all_commodities:
        target_comm = all_commodities[0]
        filtered_res = await fetch_mandi_prices(commodity=target_comm)
        assert filtered_res["count"] > 0
        first_word = target_comm.split()[0].lower()
        for r in filtered_res["records"]:
            assert first_word in r["commodity"].lower() or (r.get("variety") and first_word in r["variety"].lower())

@pytest.mark.asyncio
async def test_fetch_mandi_prices_district_filter():
    res = await fetch_mandi_prices()
    all_districts = [r["district"] for r in res.get("records", [])]
    if all_districts:
        target_district = all_districts[0]
        filtered_res = await fetch_mandi_prices(district=target_district)
        assert filtered_res["count"] > 0
        d_word = target_district.split()[0].lower()
        for r in filtered_res["records"]:
            assert d_word in r["district"].lower() or (r.get("marketName") and d_word in r["marketName"].lower())
