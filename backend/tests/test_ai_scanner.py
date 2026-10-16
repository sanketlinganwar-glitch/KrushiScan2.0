import io
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.ai_vision_service import AGRICULTURAL_KNOWLEDGE_BASE, _diagnose_with_agri_knowledge_engine

client = TestClient(app)

def test_scan_invalid_mime_type():
    dummy_text = io.BytesIO(b"Hello world, this is a plain text file, not a leaf photo.")
    res = client.post(
        "/api/ai/scan",
        files={"file": ("test.txt", dummy_text, "text/plain")}
    )
    assert res.status_code == 400
    assert "Invalid image format" in res.json()["detail"]

def test_scan_valid_image_payload():
    # Construct a minimal 6KB pseudo-image payload to simulate a crop photo
    pseudo_image = io.BytesIO(b"\xFF\xD8\xFF\xE0" + b"\x00" * 6000)
    res = client.post(
        "/api/ai/scan",
        files={"file": ("leaf.jpg", pseudo_image, "image/jpeg")},
        data={"crop_hint": "कापूस"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "crop_name" in data
    assert "disease_name" in data
    assert "severity" in data
    assert "confidence" in data
    assert data["confidence"] >= 50.0
    assert "recommended_treatments" in data
    treatments = data["recommended_treatments"]
    assert "cultural" in treatments
    assert "biological" in treatments
    assert "chemical" in treatments
    assert "caution" in treatments

def test_agri_knowledge_base_integrity():
    for key, item in AGRICULTURAL_KNOWLEDGE_BASE.items():
        assert "crop" in item
        assert "diseaseName" in item
        assert "localNames" in item
        assert "mr" in item["localNames"]
        assert "severity" in item
        assert item["severity"] in ["Low", "Moderate", "High", "Critical"]
        assert len(item["symptoms"]) > 0
        assert len(item["treatments"]["chemical"]) > 0

def test_voice_assistant_endpoint():
    res = client.post(
        "/api/ai/assistant",
        json={
            "message": "कापसावरील बोंडअळीसाठी काय उपाय आहे?",
            "language": "mr",
            "district": "Yavatmal"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["reply"]) > 10
    assert "language" in data
    assert data["language"] == "mr"
