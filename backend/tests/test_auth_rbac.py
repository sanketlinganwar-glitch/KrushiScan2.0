import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_auth_me_missing_token_raises_401():
    res = client.get("/api/auth/me")
    assert res.status_code == 401
    assert "Authorization header" in res.json()["detail"]

def test_auth_me_invalid_header_format_raises_401():
    res = client.get("/api/auth/me", headers={"Authorization": "Basic dXNlcjpwYXNz"})
    assert res.status_code == 401

def test_auth_me_with_bearer_token():
    # In dev fallback mode (when Supabase credentials are not yet supplied),
    # the server gracefully authenticates and returns verified profile
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer dev_test_token"})
    assert res.status_code == 200
    data = res.json()
    assert "id" in data
    assert "role" in data
    assert data["role"] in ["farmer", "expert", "retailer", "admin"]

def test_role_based_access_crops():
    # Crops endpoint requires authenticated user
    res_no_auth = client.get("/api/crops/")
    assert res_no_auth.status_code == 401

    res_auth = client.get("/api/crops/", headers={"Authorization": "Bearer dev_test_token"})
    assert res_auth.status_code == 200
    assert isinstance(res_auth.json(), list)
