import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)
AUTH_HEADER = {"Authorization": "Bearer dev_test_token"}

def test_create_crop_validation_error():
    # Area must be > 0
    invalid_payload = {
        "name": "कापूस (Cotton)",
        "areaAcres": -2.0,
        "plotName": "घराजवळील वावर"
    }
    res = client.post("/api/crops/", json=invalid_payload, headers=AUTH_HEADER)
    assert res.status_code == 422

def test_create_crop_success():
    valid_payload = {
        "name": "सोयाबीन (Soybean)",
        "variety": "JS 335",
        "areaAcres": 4.5,
        "plotName": "विहिरीचे शेत",
        "soilType": "black_cotton",
        "irrigationType": "drip",
        "stage": "vegetative",
        "healthStatus": "healthy"
    }
    res = client.post("/api/crops/", json=valid_payload, headers=AUTH_HEADER)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "सोयाबीन (Soybean)"
    assert data["area_acres"] == 4.5 or data.get("areaAcres") == 4.5

def test_get_crops_authenticated():
    res = client.get("/api/crops/", headers=AUTH_HEADER)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
