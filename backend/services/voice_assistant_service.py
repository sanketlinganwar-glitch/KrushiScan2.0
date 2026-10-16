import logging
import httpx
from typing import Dict, Any, List, Optional
from backend.config import settings
from backend.services.weather_service import get_live_weather
from backend.services.mandi_service import fetch_mandi_prices

logger = logging.getLogger(__name__)

async def process_agricultural_chat(
    message: str,
    language: str = "mr",
    district: str = "Yavatmal",
    active_crops: Optional[List[str]] = None,
    conversation_history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Real AI Agricultural Farming Assistant grounded with:
    - Real-time Open-Meteo weather
    - Real-time Agmarknet / APMC mandi prices
    - PDKV / ICAR crop pathology and agronomy guidelines
    """
    msg_lower = message.lower()
    
    # Check if query asks for weather or rainfall
    is_weather_query = any(k in msg_lower for k in ["हवामान", "पाऊस", "तापमान", "weather", "rain", "मौसम", "barish"])
    # Check if query asks for mandi or prices
    is_mandi_query = any(k in msg_lower for k in ["भाव", "दर", "बाजार", "mandi", "rate", "price", "apmc", "क्विंटल"])

    live_weather_info: Optional[Dict[str, Any]] = None
    if is_weather_query:
        try:
            live_weather_info = await get_live_weather(district=district)
        except Exception as e:
            logger.warning(f"Failed to fetch live weather for assistant: {e}")

    live_mandi_info: Optional[List[Dict[str, Any]]] = None
    if is_mandi_query:
        try:
            live_mandi_info = await fetch_mandi_prices(district=district)
        except Exception as e:
            logger.warning(f"Failed to fetch live mandi prices for assistant: {e}")

    # If Gemini API key is configured, synthesize grounded answer
    if settings.GEMINI_API_KEY:
        try:
            return await _generate_gemini_assistant_reply(
                message=message,
                language=language,
                district=district,
                active_crops=active_crops,
                weather_data=live_weather_info,
                mandi_data=live_mandi_info,
                history=conversation_history
            )
        except Exception as e:
            logger.warning(f"Gemini chat completion failed, falling back to grounded knowledge response: {e}")

    # Fallback response using verified grounded data
    return _generate_grounded_fallback_reply(
        message=message,
        language=language,
        district=district,
        weather_data=live_weather_info,
        mandi_data=live_mandi_info
    )

async def _generate_gemini_assistant_reply(
    message: str,
    language: str,
    district: str,
    active_crops: Optional[List[str]],
    weather_data: Optional[Dict[str, Any]],
    mandi_data: Optional[List[Dict[str, Any]]],
    history: Optional[List[Dict[str, str]]]
) -> Dict[str, Any]:
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"

    context_prompt = (
        f"You are KrushiScan AI, a trusted agricultural scientist and farming advisor for farmers in Vidarbha, Maharashtra. "
        f"You speak fluently in Marathi (मराठी), Hindi, and English. The farmer's preferred language is '{language}'. "
        f"Farmer District: {district}. Crops grown: {', '.join(active_crops or ['कापूस', 'सोयाबीन', 'तूर'])}.\n"
    )

    if weather_data:
        context_prompt += (
            f"LIVE WEATHER DATA FOR {district}: Temp: {weather_data['temp']}°C, Humidity: {weather_data['humidity']}%, "
            f"Rain Probability: {weather_data['rainProbability']}%, Condition: {weather_data['condition']}. "
            f"Advisory: {weather_data['advisory'].get(language, '')}. NEVER invent different weather numbers.\n"
        )

    if mandi_data:
        mandi_summary = "; ".join([
            f"{m['marketName']} ({m['commodity']}): Modal Price ₹{m['modalPrice']}/Qtl (Min: ₹{m['minPrice']}, Max: ₹{m['maxPrice']})"
            for m in mandi_data[:4]
        ])
        context_prompt += f"LIVE APMC MANDI PRICES: {mandi_summary}. NEVER invent different prices.\n"

    system_instruction = (
        "Provide direct, practical, respectful farming advice tailored to Vidarbha's black cotton soils and dryland conditions. "
        "Recommend ICAR and Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV) Akola approved practices. "
        "Answer in the selected language."
    )

    contents = []
    # Add history
    if history:
        for turn in history[-4:]:
            role = "user" if turn.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": turn.get("content", "")}]})
            
    contents.append({
        "role": "user",
        "parts": [
            {"text": f"{context_prompt}\n{system_instruction}\n\nFarmer Question: {message}"}
        ]
    })

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 600
        }
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.post(api_url, json=payload)
        if res.status_code != 200:
            raise RuntimeError(f"Gemini API returned {res.status_code}")
        
        reply_text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
        return {
            "reply": reply_text,
            "language": language,
            "groundedWithLiveWeather": bool(weather_data),
            "groundedWithLiveMandi": bool(mandi_data),
            "isLiveAI": True
        }

def _generate_grounded_fallback_reply(
    message: str,
    language: str,
    district: str,
    weather_data: Optional[Dict[str, Any]],
    mandi_data: Optional[List[Dict[str, Any]]]
) -> Dict[str, Any]:
    """
    Deterministic rule-based reply using verified agricultural facts and live APIs.
    """
    if weather_data:
        adv = weather_data["advisory"].get(language, weather_data["advisory"]["mr"])
        if language == "mr":
            reply = f"आज {district} मध्ये तापमान {weather_data['temp']}°C, हवेतील आर्द्रता {weather_data['humidity']}% आणि पावसाची शक्यता {weather_data['rainProbability']}% आहे. कृषी सल्ला: {adv}"
        elif language == "hi":
            reply = f"आज {district} में तापमान {weather_data['temp']}°C, आर्द्रता {weather_data['humidity']}% तथा बारिश की संभावना {weather_data['rainProbability']}% है। कृषि सलाह: {adv}"
        else:
            reply = f"Today in {district}: Temp is {weather_data['temp']}°C, humidity {weather_data['humidity']}%, rain probability {weather_data['rainProbability']}%. Advisory: {adv}"
        return {"reply": reply, "language": language, "groundedWithLiveWeather": True, "isLiveAI": False}

    if mandi_data:
        first = mandi_data[0]
        if language == "mr":
            reply = f"{first['marketName']} मध्ये {first['commodity']} चा सरासरी भाव ₹{first['modalPrice']}/क्विंटल (किमान ₹{first['minPrice']} - कमाल ₹{first['maxPrice']}) सुरू आहे. हमीभाव ₹{first['msp']} आहे."
        elif language == "hi":
            reply = f"{first['marketName']} में {first['commodity']} का औसत भाव ₹{first['modalPrice']}/क्विंटल है। न्यूनतम समर्थन मूल्य (MSP) ₹{first['msp']} है।"
        else:
            reply = f"In {first['marketName']}, {first['commodity']} modal price is ₹{first['modalPrice']}/Qtl (Min: ₹{first['minPrice']}, Max: ₹{first['maxPrice']}). MSP is ₹{first['msp']}."
        return {"reply": reply, "language": language, "groundedWithLiveMandi": True, "isLiveAI": False}

    # General crop advisory fallback
    if language == "mr":
        reply = "कृषीस्कॅन AI मध्ये आपले स्वागत आहे! विदर्भातील कपाशी, सोयाबीन आणि तूर पिकांवरील रोग निदान, फवारणी शिफारशी, बाजारभाव किंवा हवामानाविषयी कोणताही प्रश्न विचारू शकता."
    elif language == "hi":
        reply = "कृषिस्कैन AI में आपका स्वागत है! कपास, सोयाबीन और अरहर के कीट-रोग नियंत्रण, मौसम और मंडी भाव संबंधी कोई भी सवाल पूछें।"
    else:
        reply = "Welcome to KrushiScan AI! Ask any question about Vidarbha crop disease diagnosis, PDKV spray recommendations, mandi prices, or weather advisories."
        
    return {"reply": reply, "language": language, "isLiveAI": False}
