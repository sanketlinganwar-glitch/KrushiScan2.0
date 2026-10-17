import { WeatherData, SprayWindowAdvisory, SprayRadarHour } from '../types';

// Default Vidarbha coordinates (Yavatmal district center)
const DEFAULT_LAT = 20.3888;
const DEFAULT_LON = 78.1204;

export async function fetchLiveWeather(lat = DEFAULT_LAT, lon = DEFAULT_LON): Promise<WeatherData> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,wind_speed_10m&daily=precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=2`
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
    const sprayWindow = computeSprayWindowAdvisory(data.hourly, windSpeed, rainProb);

    return {
      temp,
      condition,
      humidity,
      windSpeed,
      rainProbability: rainProb,
      location: 'यवतमाळ, विदर्भ (Yavatmal, Vidarbha)',
      advisory: generateAgriAdvisory(temp, humidity, rainProb),
      isLive: true,
      sprayWindow,
    };
  } catch (err) {
    console.warn('Using offline Vidarbha agricultural weather baseline:', err);
    return getOfflineWeatherData();
  }
}

function computeSprayWindowAdvisory(
  hourly: { time?: string[]; temperature_2m?: number[]; precipitation_probability?: number[]; wind_speed_10m?: number[] } | undefined,
  currentWind: number,
  currentRainProb: number
): SprayWindowAdvisory {
  const hours: SprayRadarHour[] = [];
  const now = new Date();
  const currentHourStr = now.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"

  if (hourly?.time && Array.isArray(hourly.time)) {
    // Find closest index
    let startIndex = hourly.time.findIndex((t) => t.startsWith(currentHourStr));
    if (startIndex === -1) startIndex = 0;

    for (let i = startIndex; i < Math.min(startIndex + 12, hourly.time.length); i++) {
      const timeIso = hourly.time[i];
      const dateObj = new Date(timeIso);
      const hourNum = dateObj.getHours();
      const timeStr = `${hourNum.toString().padStart(2, '0')}:00`;

      const tTemp = Math.round(hourly.temperature_2m?.[i] ?? 30);
      const tRain = Math.round(hourly.precipitation_probability?.[i] ?? 10);
      const tWind = Math.round(hourly.wind_speed_10m?.[i] ?? 10);

      let status: 'safe' | 'caution' | 'danger' = 'safe';
      let reason = {
        mr: 'फवारणीसाठी अनुकूल वेळ (वारा शांत व पाऊस नाही)',
        hi: 'छिड़काव के लिए अनुकूल समय (हवा शांत व बारिश नहीं)',
        en: 'Optimal spray conditions (Calm wind & low rain)',
      };

      if (tRain >= 40 || tWind >= 18) {
        status = 'danger';
        reason = {
          mr: tRain >= 40 ? 'पावसाने औषध वाहून जाण्याचा धोका (High Wash-off Risk)' : 'जास्त वाऱ्यामुळे औषध उडून जाणे (High Drift Risk)',
          hi: tRain >= 40 ? 'बारिश से दवा बहने का खतरा (Wash-off Risk)' : 'तेज हवा से दवा उड़ने का खतरा (Drift Risk)',
          en: tRain >= 40 ? 'High wash-off risk from expected rain' : 'High chemical drift risk due to wind > 18 km/h',
        };
      } else if (tRain >= 20 || tWind >= 14) {
        status = 'caution';
        reason = {
          mr: 'हलका पाऊस / वारा संभवतो; औषधात स्टिकर (Spreader) वापरा',
          hi: 'मध्यम हवा / बारिश संभव; दवा में सिलिकॉन स्टीकर मिलाएं',
          en: 'Moderate wind/rain risk; use silicon spreader sticker',
        };
      }

      hours.push({
        timeStr,
        temp: tTemp,
        rainProb: tRain,
        windSpeed: tWind,
        status,
        reason,
      });
    }
  }

  // Fallback if no hourly returned
  if (hours.length === 0) {
    return getFallbackSprayWindow(currentWind, currentRainProb);
  }

  // Calculate wash-off risk based on next 4 hours rain probability
  const next4Hours = hours.slice(0, 4);
  const avgRain = next4Hours.reduce((acc, h) => acc + h.rainProb, 0) / Math.max(1, next4Hours.length);
  const washOffRiskPercentage = Math.min(100, Math.max(5, Math.round(avgRain * 1.3)));

  // Current overall status
  const firstHour = hours[0];
  const currentStatus = firstHour ? firstHour.status : (currentRainProb > 35 ? 'danger' : 'safe');

  let headline = {
    mr: 'सध्या फवारणीसाठी योग्य व अनुकूल वेळ आहे',
    hi: 'वर्तमान में छिड़काव के लिए अनुकूल समय है',
    en: 'Safe Spray Window Available Now',
  };

  let recommendation = {
    mr: 'पुढील ४ तास पावसाची शक्यता कमी असून वारा शांत आहे. कपाशी व सोयाबीनवर कीटकनाशक किंवा विद्राव्य खतांची फवारणी करावी.',
    hi: 'अगले 4 घंटे बारिश की संभावना कम है व हवा शांत है। कीटनाशक व सूक्ष्म पोषक तत्वों का छिड़काव करें।',
    en: 'Next 4 hours are calm with negligible rain. Favorable window for pest management and foliar nutrition.',
  };

  if (currentStatus === 'danger') {
    headline = {
      mr: 'सावधान: सध्या फवारणी तात्काळ पुढे ढकला!',
      hi: 'सावधान: अभी कीटनाशक छिड़काव रोकें!',
      en: 'Warning: Postpone Spraying Immediately!',
    };
    recommendation = {
      mr: 'हवेतील पाऊस किंवा वेगवान वाऱ्यामुळे औषध वाहून जाऊन मोठे आर्थिक नुकसान होऊ शकते. हवा शांत होण्याची प्रतीक्षा करा.',
      hi: 'बारिश या तेज हवा के कारण दवा बहने का भारी खतरा है। मौसम साफ होने तक प्रतीक्षा करें।',
      en: 'High wash-off or drift risk will waste expensive chemicals. Await calm, clear weather.',
    };
  } else if (currentStatus === 'caution') {
    headline = {
      mr: 'मध्यम धोका: फवारणी करताना स्टिकर वापरा',
      hi: 'मध्यम जोखिम: दवा में स्टीकर का प्रयोग करें',
      en: 'Moderate Caution: Use Spreader Sticker',
    };
    recommendation = {
      mr: 'हवेत थोडा वारा किंवा पावसाची शक्यता आहे. औषधाचा प्रभाव टिकण्यासाठी चांगल्या दर्जाचे सिलिकॉन स्टिकर अवश्य मिसळा.',
      hi: 'हवा में थोड़ी गति है। दवा का बेहतर असर बनाए रखने के लिए सिलिकॉन स्टीकर जरूर मिलाएं।',
      en: 'Moderate atmospheric drift detected. Mix a quality silicon spreader-sticker to enhance leaf adherence.',
    };
  }

  return {
    currentStatus,
    headline,
    recommendation,
    washOffRiskPercentage,
    bestSpraySlot: 'सकाळी ६:३० ते ९:३० किंवा संध्याकाळी ४:३० ते ६:३०',
    hourlyRadar: hours,
  };
}

function getFallbackSprayWindow(wind: number, rainProb: number): SprayWindowAdvisory {
  const isDanger = rainProb > 40 || wind > 18;
  const isCaution = rainProb > 20 || wind > 13;
  const status: 'safe' | 'caution' | 'danger' = isDanger ? 'danger' : isCaution ? 'caution' : 'safe';

  return {
    currentStatus: status,
    headline: {
      mr: status === 'danger' ? 'सावधान: फवारणी पुढे ढकला' : status === 'caution' ? 'मध्यम धोका: स्टिकर वापरा' : 'फवारणीसाठी अनुकूल वेळ',
      hi: status === 'danger' ? 'सावधान: छिड़काव टालें' : status === 'caution' ? 'मध्यम जोखिम: स्टीकर मिलाएं' : 'छिड़काव के लिए अनुकूल समय',
      en: status === 'danger' ? 'Caution: Postpone Spraying' : status === 'caution' ? 'Moderate Caution' : 'Safe Spray Window Available',
    },
    recommendation: {
      mr: 'स्थानिक विदर्भ हवामानानुसार सकाळच्या शांत वेळेत फवारणी करणे अधिक फायदेशीर ठरते.',
      hi: 'स्थानीय विदर्भ मौसम अनुसार सुबह के शांत समय में छिड़काव अधिक लाभकारी है।',
      en: 'Morning calm hours provide maximum pesticide retention on foliage in Vidarbha conditions.',
    },
    washOffRiskPercentage: Math.min(100, Math.max(10, Math.round(rainProb * 1.2))),
    bestSpraySlot: 'सकाळी ०६:३० ते ०९:३० वाजता (Morning 6:30 - 9:30 AM)',
    hourlyRadar: [
      { timeStr: '०७:००', temp: 26, rainProb: 10, windSpeed: 7, status: 'safe', reason: { mr: 'शांत वारा', hi: 'शांत हवा', en: 'Calm' } },
      { timeStr: '०९:००', temp: 29, rainProb: 15, windSpeed: 9, status: 'safe', reason: { mr: 'अनुकूल', hi: 'अनुकूल', en: 'Good' } },
      { timeStr: '११:००', temp: 32, rainProb: 20, windSpeed: 12, status: 'caution', reason: { mr: 'उष्णता वाढ', hi: 'धूप व हवा', en: 'High heat' } },
      { timeStr: '१३:००', temp: 34, rainProb: 25, windSpeed: 14, status: 'caution', reason: { mr: 'दुपारची वेळ टाळा', hi: 'दोपहर का समय', en: 'Avoid noon' } },
      { timeStr: '१६:००', temp: 31, rainProb: 15, windSpeed: 10, status: 'safe', reason: { mr: 'संध्याकाळचा स्लॉट', hi: 'शाम का समय', en: 'Evening slot' } },
      { timeStr: '१८:००', temp: 28, rainProb: 10, windSpeed: 8, status: 'safe', reason: { mr: 'उत्तम वेळ', hi: 'उत्तम समय', en: 'Ideal time' } },
    ],
  };
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
    sprayWindow: getFallbackSprayWindow(11, 25),
  };
}
