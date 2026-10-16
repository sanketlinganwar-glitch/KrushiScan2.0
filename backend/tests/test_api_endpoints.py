from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["app"] == "KrushiScan AI Backend API"
    assert data["status"] == "online"

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "integrations" in data
    assert "weather_meteorology" in data["integrations"]
    assert "mandi_market_rates" in data["integrations"]
    assert "payments_razorpay" in data["integrations"]

def test_mandi_rates_endpoint():
    res = client.get("/api/mandi/rates")
    assert res.status_code == 200
    data = res.json()
    assert "records" in data
    assert len(data["records"]) > 0

def test_mandi_calculate_endpoint():
    payload = {
        "modalPricePerQuintal": 7600.0,
        "quantityQuintals": 15.0,
        "distanceKm": 30.0,
        "ratePerKm": 25.0,
        "laborPerQuintal": 35.0,
        "otherCess": 50.0
    }
    res = client.post("/api/mandi/calculate-net-return", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["grossRevenue"] == 114000.0
    assert data["netReturn"] > 0
    assert data["netReturn"] < data["grossRevenue"]

def test_store_products_endpoint():
    res = client.get("/api/store/products")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 4
    assert any("सापळे" in item["name"] for item in items)
