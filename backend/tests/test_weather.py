import pytest
from backend.services.weather_service import (
    generate_pdkv_weather_advisory,
    map_weather_code_to_text,
    get_live_weather,
    VIDARBHA_COORDINATES
)

def test_pdkv_weather_advisory_rain_trigger():
    # Rain prob >= 50% must advise halting spray
    adv = generate_pdkv_weather_advisory(temp=30, humidity=80, rain_prob=65)
    assert "फवारणी" in adv["mr"]
    assert "थांबवा" in adv["mr"]
    assert "Postpone" in adv["en"]

def test_pdkv_weather_advisory_humidity_trigger():
    # Humidity >= 75% must warn about sucking pests and fungal attack
    adv = generate_pdkv_weather_advisory(temp=32, humidity=82, rain_prob=20)
    assert "आर्द्रता" in adv["mr"]
    assert "निंबोळी" in adv["mr"]

def test_map_weather_code():
    assert "निरभ्र" in map_weather_code_to_text(0)
    assert "पावसाची" in map_weather_code_to_text(61)
    assert "वादळ" in map_weather_code_to_text(71)

def test_vidarbha_districts_coordinates():
    assert "Yavatmal" in VIDARBHA_COORDINATES
    assert "Akola" in VIDARBHA_COORDINATES
    assert "Amravati" in VIDARBHA_COORDINATES
    assert len(VIDARBHA_COORDINATES) == 11
