import { WeatherData } from '../types';

// Default Vidarbha coordinates (Yavatmal district center)
const DEFAULT_LAT = 20.3888;
const DEFAULT_LON = 78.1204;

export async function fetchLiveWeather(lat = DEFAULT_LAT, lon = DEFAULT_LON): Promise<WeatherData> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=precipitation_probability_max&timezone=Asia%2FKolkata`
    );

    if (!res.ok) {
      throw new Error(`Weather API returned ${res.status}`);
    }

    const data = await res.json();
    const temp = Math.round(data.current?.temperature_2m ?? 31);
    const humidity = Math.round(data.current?.relative_humidity_2m ?? 65);
    const windSpeed = Math.round(data.current?.wind_speed_10m ?? 12);
    const rainProb = Math.round(data.daily?.precipitation_probability_max?.[0] ?? 20);

    const condition = getWeatherConditionText(data.current?.weather_code ?? 1);

    return {
      temp,
      condition,
      humidity,
      windSpeed,
      rainProbability: rainProb,
      location: 'यवतमाळ, विदर्भ (Yavatmal, Vidarbha)',
      advisory: generateAgriAdvisory(temp, humidity, rainProb),
      isLive: true,
    };
  } catch (err) {
    console.warn('Using offline Vidarbha agricultural weather baseline:', err);
    return getOfflineWeatherData();
  }
}

function getWeatherConditionText(code: number): string {
  if (code === 0) return 'निरभ्र आकाश (Clear Sky)';
  if (code >= 1 && code <= 3) return 'अंशतः ढगाळ (Partly Cloudy)';
  if (code >= 45 && code <= 48) return 'धुक्याची शक्यता (Foggy/Dew)';
  if (code >= 51 && code <= 67) return 'हलका पाऊस (Light Rain)';
  if (code >= 71 && code <= 77) return 'गारपीट / वादळ (Storm)';
  if (code >= 80 && code <= 82) return 'पावसाच्या सरी (Showers)';
  return 'ढगाळ हवामान (Cloudy)';
}

function generateAgriAdvisory(temp: number, humidity: number, rainProb: number) {
  if (rainProb > 50) {
    return {
      mr: 'पुढील २४ तासांत पावसाची दाट शक्यता आहे. कीटकनाशके व विद्राव्य खतांची फवारणी तात्काळ पुढे ढकला. तुरीच्या शेतात पाणी साचणार नाही याची खबरदारी घ्या.',
      hi: 'अगले 24 घंटों में बारिश की संभावना है। कीटनाशक व खाद का छिड़काव अभी टालें। खेत में जल निकासी की व्यवस्था रखें।',
      en: 'High chance of rainfall in next 24 hrs. Postpone foliar sprays and chemical application. Ensure proper drainage in tur plots.',
    };
  }

  if (humidity > 70) {
    return {
      mr: 'हवेतील आर्द्रता जास्त असल्याने कपाशीवर पांढरी माशी व करपा रोगाचा प्रादुर्भाव वाढू शकतो. शेतात नियमित फेरफटका मारून निरीक्षण करा.',
      hi: 'हवा में नमी अधिक होने से कपास में सफेद मक्खी व फफूंद रोग की संभावना बढ़ सकती है। खेत का नियमित निरीक्षण करें।',
      en: 'High humidity favors sucking pests (whiteflies) and fungal leaf spots in cotton. Inspect under-surface of leaves regularly.',
    };
  }

  return {
    mr: 'सध्याचे हवामान पिकांच्या वाढीसाठी अनुकूल आहे. कपाशीमध्ये बोंड भरण्याच्या अवस्थेत पाण्याचा ताण पडू नये म्हणून ठिबक किंवा ओलिताची सोय ठेवा.',
    hi: 'वर्तमान मौसम फसल की वृद्धि के लिए अनुकूल है। आवश्यकता अनुसार हल्की सिंचाई करें।',
    en: 'Weather is favorable for crop growth. Maintain adequate moisture during boll development and pod-filling stage.',
  };
}

export function getOfflineWeatherData(): WeatherData {
  return {
    temp: 31,
    condition: 'अंशतः ढगाळ (Partly Cloudy)',
    humidity: 68,
    windSpeed: 11,
    rainProbability: 25,
    location: 'यवतमाळ, विदर्भ (Yavatmal, Vidarbha)',
    advisory: {
      mr: 'सध्याचे दमट हवामान पांढरी माशी व गुलाबी बोंडअळीसाठी अनुकूल आहे. कामगंध सापळ्यांचे निरीक्षण करा व आवश्यकतेनुसार जैविक उपाय अवलंबा.',
      hi: 'वर्तमान मौसम चूसक कीटों के अनुकूल है। फेरोमोन ट्रैप की निगरानी रखें व जैविक नियंत्रण अपनाएं।',
      en: 'Current warm & humid conditions favor sucking pests. Check pheromone traps and adopt biological controls.',
    },
    isLive: false,
  };
}
