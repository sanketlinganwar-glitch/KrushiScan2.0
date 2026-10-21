import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.ai_vision_service import AGRICULTURAL_KNOWLEDGE_BASE, _diagnose_with_agri_knowledge_engine

client = TestClient(app)

def make_synthetic_leaf_jpeg(width: int = 120, height: int = 120) -> bytes:
    """Creates a valid, decodable JPEG depicting high-contrast green plant features against a light background."""
    img = Image.new("RGB", (width, height), (245, 245, 245))
    for x in range(width // 4, 3 * width // 4):
        for y in range(height // 4, 3 * height // 4):
            img.putpixel((x, y), (34, 139, 34)) # Forest green leaf
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def make_solid_color_jpeg(width: int = 100, height: int = 100, color=(0, 0, 0)) -> bytes:
    """Creates a decodable JPEG with zero or near-zero variance."""
    img = Image.new("RGB", (width, height), color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_scan_unsupported_mime_type():
    dummy_text = io.BytesIO(b"Hello world, this is a plain text file, not a leaf photo.")
    res = client.post(
        "/api/ai/scan",
        files={"file": ("test.txt", dummy_text, "text/plain")}
    )
    assert res.status_code == 400
    assert "Unsupported format" in res.json()["detail"]

def test_scan_zero_byte_image_rejected():
    empty_file = io.BytesIO(b"")
    res = client.post(
        "/api/ai/scan",
        files={"file": ("empty.jpg", empty_file, "image/jpeg")}
    )
    assert res.status_code == 400
    assert "empty (0 bytes)" in res.json()["detail"]

def test_scan_corrupted_image_rejected():
    corrupted_data = io.BytesIO(b"\xFF\xD8\xFF\xE0" + b"\x00" * 500)
    res = client.post(
        "/api/ai/scan",
        files={"file": ("corrupt.jpg", corrupted_data, "image/jpeg")}
    )
    assert res.status_code == 400
    assert "blank or unreadable" in res.json()["detail"] or "corrupted" in res.json()["detail"]

def test_scan_solid_black_image_rejected():
    black_bytes = make_solid_color_jpeg(100, 100, (0, 0, 0))
    res = client.post(
        "/api/ai/scan",
        files={"file": ("black.jpg", io.BytesIO(black_bytes), "image/jpeg")}
    )
    assert res.status_code == 400
    assert "blank or unreadable" in res.json()["detail"]

def test_scan_solid_white_image_rejected():
    white_bytes = make_solid_color_jpeg(100, 100, (255, 255, 255))
    res = client.post(
        "/api/ai/scan",
        files={"file": ("white.jpg", io.BytesIO(white_bytes), "image/jpeg")}
    )
    assert res.status_code == 400
    assert "blank or unreadable" in res.json()["detail"]

def test_scan_solid_gray_uniform_image_rejected():
    gray_bytes = make_solid_color_jpeg(100, 100, (128, 128, 128))
    res = client.post(
        "/api/ai/scan",
        files={"file": ("gray.jpg", io.BytesIO(gray_bytes), "image/jpeg")}
    )
    assert res.status_code == 400
    assert "blank or unreadable" in res.json()["detail"]

def test_scan_valid_leaf_image_accepted():
    leaf_bytes = make_synthetic_leaf_jpeg(120, 120)
    res = client.post(
        "/api/ai/scan",
        files={"file": ("leaf.jpg", io.BytesIO(leaf_bytes), "image/jpeg")},
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

def test_scan_multi_angle_valid_leaves():
    top_bytes = make_synthetic_leaf_jpeg(120, 120)
    underside_bytes = make_synthetic_leaf_jpeg(120, 120)
    res = client.post(
        "/api/ai/scan",
        files={
            "file": ("top_leaf.jpg", io.BytesIO(top_bytes), "image/jpeg"),
            "file_underside": ("underside_leaf.jpg", io.BytesIO(underside_bytes), "image/jpeg")
        },
        data={"crop_hint": "कापूस"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "angles_analyzed" in data
    assert data["angles_analyzed"] == ["top", "underside"]
    assert "uncertainty_info" in data
    assert "दोन्ही बाजूंच्या" in data["uncertainty_info"]

def test_scan_multi_angle_rejects_blank_underside():
    top_bytes = make_synthetic_leaf_jpeg(120, 120)
    black_underside = make_solid_color_jpeg(100, 100, (0, 0, 0))
    res = client.post(
        "/api/ai/scan",
        files={
            "file": ("top_leaf.jpg", io.BytesIO(top_bytes), "image/jpeg"),
            "file_underside": ("blank_under.jpg", io.BytesIO(black_underside), "image/jpeg")
        },
        data={"crop_hint": "कापूस"}
    )
    assert res.status_code == 400
    assert "blank or unreadable" in res.json()["detail"]

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
