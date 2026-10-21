import pytest
import time
from unittest.mock import patch, MagicMock
import httpx
from backend.config import settings
from backend.services.mandi_service import (
    parse_agmarknet_records,
    fetch_mandi_prices,
    update_mandi_cache_with_records,
    _reset_mandi_cache,
    OFFICIAL_VIDARBHA_MANDIS,
    resolve_commodity_msp,
    _mandi_cache
)

@pytest.fixture(autouse=True)
def ensure_mock_mandi_api_key():
    """Ensure DATA_GOV_IN_API_KEY is configured for unit tests so upstream mock flows are exercised."""
    original_key = settings.DATA_GOV_IN_API_KEY
    if not settings.DATA_GOV_IN_API_KEY:
        settings.DATA_GOV_IN_API_KEY = "test-mock-agmarknet-key"
    yield
    settings.DATA_GOV_IN_API_KEY = original_key

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
            "arrival_date": "19/10/2026"
        },
        # Zero modal price (must be rejected)
        {
            "state": "Maharashtra",
            "district": "Akola",
            "market": "Akola",
            "commodity": "Soyabean",
            "modal_price": "0",
            "min_price": "0",
            "max_price": "0"
        },
        # Missing market name (must be rejected)
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
    _reset_mandi_cache()
    res = await fetch_mandi_prices()
    assert isinstance(res, dict)
    assert res["count"] >= 20
    assert "status" in res
    assert res["status"] in ["live", "cached", "stale", "baseline"]
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

@pytest.mark.asyncio
async def test_upstream_connection_refusal_fallback_to_baseline():
    """
    Requirement 6: Upstream connection refusal (e.g. NIC blocking foreign cloud).
    Must not crash, must return baseline clearly labeled, never claimed as live.
    """
    _reset_mandi_cache()
    
    with patch("httpx.AsyncClient.get", side_effect=httpx.ConnectError("[Errno 111] Connection refused")):
        with patch("urllib.request.urlopen", side_effect=OSError(111, "Connection refused")):
            res = await fetch_mandi_prices(refresh=True)
            assert res["status"] == "baseline"
            assert res["isStale"] is False
            assert "Reference Data" in res["source"]
            assert "Connection refused" in res.get("upstreamError", "")
            assert res["count"] == len(OFFICIAL_VIDARBHA_MANDIS)

@pytest.mark.asyncio
async def test_upstream_connection_refusal_preserves_genuine_cache():
    """
    Requirement 6 & 4: If genuine data was already cached, an upstream connection
    refusal must retain the genuine records, mark them as stale, and never overwrite with baseline.
    """
    _reset_mandi_cache()
    sample_genuine = [{
        "district": "Nagpur",
        "market": "Kalamna",
        "commodity": "Soyabean",
        "modal_price": "4950",
        "min_price": "4700",
        "max_price": "5100",
        "arrivals_in_qtl": "1200",
        "arrival_date": "19/10/2026"
    }]
    update_mandi_cache_with_records(sample_genuine, arrival_date="19/10/2026")

    with patch("httpx.AsyncClient.get", side_effect=httpx.ConnectError("[Errno 111] Connection refused")):
        with patch("urllib.request.urlopen", side_effect=OSError(111, "Connection refused")):
            res = await fetch_mandi_prices(refresh=True)
            assert res["status"] in ["cached", "stale"]
            assert res["isStale"] is True
            assert res["sourceArrivalDate"] == "19/10/2026"
            assert res["source"] == "Government of India AGMARKNET (data.gov.in)"
            assert "Connection refused" in res.get("upstreamError", "")
            assert len(res["records"]) == 1
            assert res["records"][0]["marketName"] == "Kalamna APMC"

@pytest.mark.asyncio
async def test_upstream_timeout_handling():
    """
    Requirement 6: Upstream timeout must be caught cleanly and fall back safely.
    """
    _reset_mandi_cache()
    with patch("httpx.AsyncClient.get", side_effect=httpx.TimeoutException("Read timed out after 25s")):
        with patch("urllib.request.urlopen", side_effect=TimeoutError("Urllib read timeout")):
            res = await fetch_mandi_prices(refresh=True)
            assert res["status"] == "baseline"
            assert "timed out" in res.get("upstreamError", "").lower() or "timeout" in res.get("upstreamError", "").lower()
            assert res["count"] > 0

@pytest.mark.asyncio
async def test_invalid_upstream_responses():
    """
    Requirement 6: Handle HTTP 500, HTML errors, or empty record sets.
    """
    _reset_mandi_cache()
    mock_resp = MagicMock()
    mock_resp.status_code = 502
    mock_resp.text = "<html>502 Bad Gateway</html>"

    with patch("httpx.AsyncClient.get", return_value=mock_resp):
        with patch("urllib.request.urlopen", side_effect=Exception("HTTP Error 502: Bad Gateway")):
            res = await fetch_mandi_prices(refresh=True)
            assert res["status"] == "baseline"
            assert "502" in res.get("upstreamError", "")

@pytest.mark.asyncio
async def test_stale_cache_fallback_after_24_hours():
    """
    Requirement 4 & 6: Data older than 24 hours must be honestly labeled stale.
    """
    _reset_mandi_cache()
    sample_genuine = [{
        "district": "Amravati",
        "market": "Amravati",
        "commodity": "Cotton",
        "modal_price": "7600",
        "min_price": "7400",
        "max_price": "7800",
        "arrivals_in_qtl": "800",
        "arrival_date": "17/10/2026"
    }]
    update_mandi_cache_with_records(sample_genuine, arrival_date="17/10/2026")

    # Force epoch to 25 hours ago (> 86400s)
    from backend.services.mandi_service import _mandi_cache
    _mandi_cache["last_fetched_epoch"] = time.time() - 90000

    # Simulate upstream failing to fetch new data
    with patch("httpx.AsyncClient.get", side_effect=httpx.ConnectError("Connection refused")):
        with patch("urllib.request.urlopen", side_effect=OSError("Connection refused")):
            res = await fetch_mandi_prices(refresh=True)
            assert res["status"] == "stale"
            assert res["isStale"] is True
            assert res["sourceArrivalDate"] == "17/10/2026"
            assert res["count"] == 1

@pytest.mark.asyncio
async def test_recovery_when_official_source_becomes_available():
    """
    Requirement 6: When upstream recovers or sync pushes fresh genuine records,
    system transitions from baseline/stale back to live cleanly.
    """
    _reset_mandi_cache()
    # 1. Initially upstream is down -> baseline
    with patch("httpx.AsyncClient.get", side_effect=httpx.ConnectError("Connection refused")):
        with patch("urllib.request.urlopen", side_effect=OSError("Connection refused")):
            res1 = await fetch_mandi_prices(refresh=True)
            assert res1["status"] == "baseline"

    # 2. Official records arrive (either via sync or recovered API)
    sample_fresh = [{
        "district": "Yavatmal",
        "market": "Yavatmal",
        "commodity": "Cotton",
        "modal_price": "7800",
        "min_price": "7600",
        "max_price": "8000",
        "arrivals_in_qtl": "1500",
        "arrival_date": "19/10/2026"
    }]
    update_mandi_cache_with_records(sample_fresh, arrival_date="19/10/2026")

    # 3. Fetch again -> immediately live, clean status, verified arrival date
    res2 = await fetch_mandi_prices(refresh=False)
    assert res2["status"] == "live"
    assert res2["isStale"] is False
    assert res2["sourceArrivalDate"] == "19/10/2026"
    assert res2.get("upstreamError") is None
    assert len(res2["records"]) == 1
    assert res2["records"][0]["modalPrice"] == 7800.0
