import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  CloudSun, 
  Droplets, 
  Wind, 
  CloudRain, 
  Sprout, 
  Activity, 
  History, 
  BookOpen, 
  TrendingUp, 
  ShoppingBag, 
  MessageSquare, 
  Bell, 
  ChevronRight, 
  Sparkles,
  Leaf,
  FlaskConical
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchLiveWeather, getOfflineWeatherData } from '../lib/weather';
import { WeatherData, ScanResult, Crop } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LOCAL_STORAGE_KEYS } from '../lib/supabase';
import { SprayRadarWidget } from '../components/weather/SprayRadarWidget';
import { CropStageCard } from '../components/agri/CropStageCard';
import { LalyaDeficiencyGuide } from '../components/agri/LalyaDeficiencyGuide';

const INITIAL_SAMPLE_SCANS: ScanResult[] = [
  {
    id: 'sample-scan-1',
    userId: 'current-user',
    cropName: 'कापूस (Cotton)',
    cropVariety: 'BT Cotton BG-II',
    imageUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=400&auto=format&fit=crop&q=80',
    diseaseName: 'Pink Bollworm (गुलाबी बोंडअळी)',
    localDiseaseName: {
      mr: 'गुलाबी बोंडअळी (Pink Bollworm)',
      hi: 'गुलाबी सुंडी (Pink Bollworm)',
      en: 'Pink Bollworm (Pectinophora gossypiella)',
    },
    severity: 'High',
    confidence: 94,
    diagnosisExplanation: 'कापसाच्या पात्या व बोंडांवर गुलाबी बोंडअळीचा प्रादुर्भाव. फुलांचे गुळबेंद झालेले दिसून येत आहे.',
    symptoms: ['फुलांचे गुळबेंद होणे', 'बोंडावर बारीक छिद्रे', 'अकाली बोंडे काळी पडणे'],
    recommendedTreatments: {
      cultural: ['प्रति एकरी ५ कामगंध सापळे लावा'],
      biological: ['५% निंबोळी अर्क (NSKE) फवारा'],
      chemical: ['प्रोफेनोफॉस ५०% EC (२ मिली/लिटर) फवारा'],
      caution: 'रासायनिक औषध वापरताना मास्क वापरा व स्थानिक कृषी अधिकाऱ्यांशी संपर्क साधा.',
    },
    preventionMethods: ['फरदड कापूस घेणे टाळा', 'वेळेवर पेरणी करा'],
    followUpPlan: '७ दिवसांनी कामगंध सापळ्यांची नोंद घ्या.',
    scannedAt: '२ दिवसांपूर्वी (2 days ago)',
    isDemo: false,
  },
  {
    id: 'sample-scan-2',
    userId: 'current-user',
    cropName: 'सोयाबीन (Soybean)',
    cropVariety: 'JS-335',
    imageUrl: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=400&auto=format&fit=crop&q=80',
    diseaseName: 'Yellow Mosaic Virus (पिवळा मोझॅक)',
    localDiseaseName: {
      mr: 'पिवळा मोझॅक विषाणू (Yellow Mosaic Virus)',
      hi: 'पीला मोज़ेक वायरस',
      en: 'Yellow Mosaic Virus (YMV)',
    },
    severity: 'Moderate',
    confidence: 91,
    diagnosisExplanation: 'सोयाबीनच्या पानांवर पिवळसर चट्टे दिसत आहेत. पांढऱ्या माशीमुळे या रोगाचा वेगाने प्रसार होतो.',
    symptoms: ['पानांवर पिवळे व हिरवे चट्टे', 'पानांचा आकार लहान होणे'],
    recommendedTreatments: {
      cultural: ['रोगट झाडे मुळासकट उपटून नष्ट करा'],
      biological: ['निंबोळी तेल १५०० पीपीएम फवारा'],
      chemical: ['थायामेथोक्साम २५% WG (३ ग्रॅम/१० लिटर) फवारा'],
      caution: 'विषाणू थेट नष्ट होत नाही, पांढऱ्या माशीचे नियंत्रण आवश्यक आहे.',
    },
    preventionMethods: ['प्रतिकारक्षम वाण वापरा', 'बीजप्रक्रिया करा'],
    followUpPlan: 'नवीन पानांवर पिवळेपणा थांबला आहे का ते तपासा.',
    scannedAt: '५ दिवसांपूर्वी (5 days ago)',
    isDemo: false,
  },
];

export const Home: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [weather, setWeather] = useState<WeatherData>(getOfflineWeatherData());
  const [scans] = useState<ScanResult[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SCANS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_SAMPLE_SCANS;
  });

  const [isLalyaModalOpen, setIsLalyaModalOpen] = useState(false);
  const [crops] = useState<Crop[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CROPS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'crop-cotton-1',
        userId: 'current-user',
        name: 'कापूस (Cotton)',
        localName: { mr: 'कापूस', hi: 'कपास', en: 'Cotton' },
        variety: 'BT Cotton BG-II (राशी ६५९)',
        areaAcres: 3.5,
        plotName: 'विहीर लगतचे शेत (Well Plot)',
        sowingDate: '१५ जून २०२४',
        soilType: 'black_cotton',
        irrigationType: 'drip',
        stage: 'boll_formation',
        healthStatus: 'attention',
        latestScanId: 'sample-scan-1',
        latestScanDate: '२ दिवसांपूर्वी',
        latestDiseaseName: 'गुलाबी बोंडअळी (Pink Bollworm)',
        isSample: true,
      },
      {
        id: 'crop-soybean-1',
        userId: 'current-user',
        name: 'सोयाबीन (Soybean)',
        localName: { mr: 'सोयाबीन', hi: 'सोयाबीन', en: 'Soybean' },
        variety: 'JS-335 (महाबीज प्रमाणित)',
        areaAcres: 2.0,
        plotName: 'रस्त्यालगतचे शेत (Roadside Plot)',
        sowingDate: '२० जून २०२४',
        soilType: 'black_cotton',
        irrigationType: 'rainfed',
        stage: 'harvesting',
        healthStatus: 'healthy',
        isSample: true,
      },
    ];
  });

  useEffect(() => {
    let isMounted = true;
    fetchLiveWeather().then((data) => {
      if (isMounted) setWeather(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const quickActions = [
    {
      title: t('navMyCrops'),
      sub: t('actionMyCropsSub'),
      icon: Sprout,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      to: '/crops',
    },
    {
      title: t('navRecovery'),
      sub: t('actionRecoverySub'),
      icon: Activity,
      color: 'text-sky-700 bg-sky-50 border-sky-200',
      to: '/recovery',
    },
    {
      title: t('navHistory'),
      sub: t('actionHistorySub'),
      icon: History,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
      to: '/history',
    },
    {
      title: t('navGuidance'),
      sub: t('actionGuidanceSub'),
      icon: BookOpen,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      to: '/guidance',
    },
    {
      title: t('navTankMix'),
      sub: t('actionTankMixSub'),
      icon: FlaskConical,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
      to: '/tank-mix',
    },
    {
      title: t('navMandi'),
      sub: t('actionMandiSub'),
      icon: TrendingUp,
      color: 'text-green-700 bg-green-50 border-green-200',
      to: '/mandi',
    },
    {
      title: t('navStore'),
      sub: t('actionStoreSub'),
      icon: ShoppingBag,
      color: 'text-orange-700 bg-orange-50 border-orange-200',
      to: '/store',
    },
    {
      title: t('navExpert'),
      sub: t('actionExpertSub'),
      icon: MessageSquare,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      to: '/expert',
    },
    {
      title: t('navAlerts'),
      sub: t('actionAlertsSub'),
      icon: Bell,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      to: '/alerts',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Farmer Welcome Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#DDE8DC] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E6F2E5] text-[#0B5137] border border-[#2F9E59]/30">
              🌱 विदर्भ शेतकरी पोर्टल (Vidarbha Node)
            </span>
            {weather.isLive ? (
              <span className="text-[11px] font-semibold text-[#2F9E59] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F9E59] animate-ping" />
                थेट हवामान (Live)
              </span>
            ) : (
              <span className="text-[11px] text-[#5F7065] font-medium">स्थानिक अंदाज (Standard)</span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#152D24] mt-1.5 tracking-tight">
            {t('greetingMorning')},{' '}
            <span className="text-[#2F9E59]">{user?.name || 'गजानन पवार'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5F7065] mt-0.5 font-medium">
            तुमचे शेत: <strong className="text-[#152D24]">{user?.farmSizeAcres || 6.5} एकर</strong> ({user?.district || 'यवतमाळ'}) • मुख्य पिके: कापूस, सोयाबीन, तूर
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/crops">
            <Button variant="outline" size="sm" className="text-xs font-bold border-[#DDE8DC] text-[#152D24] hover:bg-[#E6F2E5]">
              शेतातील पिके ({user?.activeCrops?.length || 3})
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Weather & Advisory Card */}
      <Card variant="white" className="overflow-hidden border-[#DDE8DC]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-1">
          {/* Weather Metrics */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E6F2E5] border border-[#DDE8DC] flex items-center justify-center text-[#2F9E59] shrink-0 shadow-inner">
              <CloudSun className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#152D24] tracking-tight">
                  {weather.temp}°C
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#5F7065]">
                  {weather.condition}
                </span>
              </div>
              <p className="text-xs text-[#5F7065] font-medium">
                {weather.location}
              </p>
            </div>
          </div>

          {/* Environmental Indicators */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t md:border-t-0 md:border-l border-[#DDE8DC] pt-3 md:pt-0 md:pl-6 text-center">
            <div className="bg-[#F6F8F0] rounded-xl p-2.5 border border-[#DDE8DC]">
              <div className="flex items-center justify-center gap-1 text-[#5F7065] text-[11px] font-medium">
                <CloudRain className="w-3.5 h-3.5 text-[#2F9E59]" />
                <span>{t('rainfallChance')}</span>
              </div>
              <p className="text-sm font-bold text-[#152D24] mt-0.5">
                {weather.rainProbability}%
              </p>
            </div>

            <div className="bg-[#F6F8F0] rounded-xl p-2.5 border border-[#DDE8DC]">
              <div className="flex items-center justify-center gap-1 text-[#5F7065] text-[11px] font-medium">
                <Droplets className="w-3.5 h-3.5 text-[#2F9E59]" />
                <span>{t('humidity')}</span>
              </div>
              <p className="text-sm font-bold text-[#152D24] mt-0.5">
                {weather.humidity}%
              </p>
            </div>

            <div className="bg-[#F6F8F0] rounded-xl p-2.5 border border-[#DDE8DC]">
              <div className="flex items-center justify-center gap-1 text-[#5F7065] text-[11px] font-medium">
                <Wind className="w-3.5 h-3.5 text-[#2F9E59]" />
                <span>{t('windSpeed')}</span>
              </div>
              <p className="text-sm font-bold text-[#152D24] mt-0.5">
                {weather.windSpeed} km/h
              </p>
            </div>
          </div>
        </div>

        {/* Agricultural Advisory Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#E6F2E5] border border-[#2F9E59]/30 text-xs sm:text-sm text-[#152D24] flex items-start gap-2.5">
          <span className="p-1 rounded-md bg-[#0B5137] text-white font-bold text-[10px] uppercase shrink-0 mt-0.5">
            {t('agriAdvisory')}
          </span>
          <p className="leading-snug font-medium text-[#152D24]">
            {weather.advisory[language] || weather.advisory['mr']}
          </p>
        </div>

        {/* Link to 7-Day Dry Spell & Weather Stress Advisor */}
        <div className="mt-3 pt-3 border-t border-[#DDE8DC] flex items-center justify-between text-xs">
          <span className="text-[#5F7065] font-medium flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 text-[#2F9E59]" />
            <span>{language === 'mr' ? '७-दिवसीय कोरडा काळ व पीक-ताण अंदाज' : '7-Day Dry Spell & Crop Stress Forecast'}</span>
          </span>
          <Link
            to="/weather"
            className="font-bold text-[#0B5137] hover:text-[#2F9E59] flex items-center gap-1 transition px-2.5 py-1 rounded-lg hover:bg-[#E6F2E5]"
          >
            <span>{language === 'mr' ? 'सल्लागार उघडा →' : 'Open Advisor →'}</span>
          </Link>
        </div>
      </Card>

      {/* 2b. Suraksha Spray Radar Widget */}
      <SprayRadarWidget sprayWindow={weather.sprayWindow} district={weather.location} />

      {/* 3. Hero Main Action: Forest Green "SCAN YOUR CROP" Banner with Leaf Green highlight */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0B5137] p-6 sm:p-8 text-white shadow-md border border-[#073D2A]">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-white text-xs font-bold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-[#E9A23B]" />
              <span>AI रोगाची झटपट तपासणी (Instant AI Vision)</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('scanHeroTitle')}
            </h3>
            <p className="text-sm sm:text-base text-slate-100 mt-2 font-medium">
              {t('scanHeroSubtitle')}
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col items-center">
            <Link to="/scan" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="xl"
                className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-2xl group flex items-center justify-center gap-3 border border-white/20 bg-[#2F9E59] hover:bg-[#21864A] text-white shadow-lg shadow-[#073D2A]/40"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <span>{t('scanButtonLabel')}</span>
              </Button>
            </Link>
            <span className="text-[11px] text-slate-200 mt-2 text-center font-medium">
              कॅमेऱ्यातून थेट फोटो किंवा गॅलरीतून निवडा
            </span>
          </div>
        </div>
      </div>

      {/* 3b. Vidarbha Cotton Lalya Advisory Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-amber-950">
                {language === 'mr' ? 'कपाशीची पाने लाल पडत आहेत का? (लाल्या प्रतिबंध)' : 'Cotton Leaves Turning Red? (Lalya Guide)'}
              </h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold uppercase">
                PDKV अकोला
              </span>
            </div>
            <p className="text-xs text-amber-900 mt-0.5 font-medium">
              {language === 'mr' 
                ? 'लाल्या हा बुरशीजन्य रोग नसून मॅग्नेशियम कमतरता आहे. ०.५% MgSO4 + १९:१९:१९ चा फवारणी उपाय पहा.' 
                : 'Leaf reddening is a magnesium deficiency, not fungal blight. View the verified foliar recipe.'}
            </p>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsLalyaModalOpen(true)}
          className="border-amber-400 text-amber-950 hover:bg-amber-100 font-bold text-xs shrink-0"
        >
          {language === 'mr' ? 'तपशीलवार उपाय पहा' : 'View Remedy'}
        </Button>
      </div>

      {/* 3b-2. Tank-Mix Compatibility Quick Banner */}
      <div className="bg-[#E6F2E5]/60 border border-[#2F9E59]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B5137] text-white flex items-center justify-center shrink-0 shadow-xs">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-[#152D24]">
                {language === 'mr' ? 'कीटकनाशक व खते एकत्र मिसळणार आहात का?' : language === 'hi' ? 'कीटनाशक व खाद एक साथ मिलाने से पहले जांचें' : 'Mixing Pesticides & Fertilizers in One Tank?'}
              </h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E6F2E5] text-[#0B5137] border border-[#2F9E59]/40 font-extrabold uppercase">
                CIBRC / PDKV
              </span>
            </div>
            <p className="text-xs text-[#5F7065] mt-0.5 font-medium">
              {language === 'mr' 
                ? 'औषध फुटणे (साका होणे) किंवा झाडावर करपा येणे टाळण्यासाठी टँक-मिक्स कॅल्क्युलेटरने सुसंगतता तपासा.' 
                : 'Prevent chemical curdling, nozzle sludge, or crop scorch with the verified tank-mix compatibility tool.'}
            </p>
          </div>
        </div>

        <Link to="/tank-mix">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-[#2F9E59] text-[#0B5137] hover:bg-[#E6F2E5] font-bold text-xs shrink-0"
          >
            {language === 'mr' ? 'सुसंगतता तपासा' : 'Check Compatibility'}
          </Button>
        </Link>
      </div>

      {/* 3c. My Crops Growth Stage & Preventive Alerts */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-base font-bold text-[#152D24] flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#2F9E59]" />
            <span>
              {language === 'mr' ? 'माझी पिके व पीक वाढीचा टप्पा' : language === 'hi' ? 'मेरी फसलें व विकास चरण' : 'My Crops & Phenological Growth Stage'}
            </span>
          </h4>
          <Link to="/crops" className="text-xs font-bold text-[#0B5137] hover:text-[#2F9E59] flex items-center gap-1 transition">
            <span>{language === 'mr' ? 'सर्व पिके पहा' : 'View All'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crops.map((crop) => (
            <CropStageCard key={crop.id} crop={crop} />
          ))}
        </div>
      </div>

      {/* 4. Quick Action Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-base font-bold text-[#152D24] flex items-center gap-2">
            <span>{t('quickActionsTitle')}</span>
          </h4>
          <span className="text-xs text-[#2F9E59] font-bold">
            सोयीस्कर शेती साधने
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link key={idx} to={action.to} className="group">
                <Card
                  variant="white"
                  padding="sm"
                  interactive
                  className="h-full flex flex-col justify-between p-3.5 sm:p-4 hover:border-[#2F9E59] border-[#DDE8DC]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${action.color} group-hover:scale-105 transition`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#5F7065] group-hover:text-[#0B5137] group-hover:translate-x-0.5 transition" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#152D24] group-hover:text-[#2F9E59] transition line-clamp-1">
                      {action.title}
                    </h5>
                    <p className="text-[11px] text-[#5F7065] line-clamp-1 mt-0.5 font-medium">
                      {action.sub}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 5. Live Mandi Ticker Snippet */}
      <div className="bg-white border border-[#DDE8DC] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E6F2E5] border border-[#2F9E59]/30 flex items-center justify-center text-[#0B5137] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#152D24] uppercase tracking-wide">
                आजचे कृषी बाजार भाव (APMC Rates)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6F2E5] text-[#0B5137] border border-[#2F9E59]/20 font-bold">
                हिंगणघाट / यवतमाळ
              </span>
            </div>
            <p className="text-xs text-[#5F7065] mt-0.5 font-medium">
              कापूस (लांब धागा): <strong className="text-[#152D24] font-bold">₹७,९२०</strong>/क्विंटल • हमीभाव (MSP): ₹७,५२१ • सोयाबीन: <strong className="text-[#152D24] font-bold">₹४,५८०</strong>/क्विंटल
            </p>
          </div>
        </div>

        <Link to="/mandi">
          <Button variant="outline" size="sm" className="text-xs shrink-0 whitespace-nowrap border-[#DDE8DC] text-[#152D24] hover:bg-[#E6F2E5]">
            तपशील व नफा कॅल्क्युलेटर
          </Button>
        </Link>
      </div>

      {/* 6. Recent Crop Scans */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-base font-bold text-[#152D24] flex items-center gap-2">
            <span>{t('recentScansTitle')}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#E6F2E5] text-[#0B5137] font-semibold border border-[#DDE8DC]">
              {scans.length}
            </span>
          </h4>
          <Link
            to="/history"
            className="text-xs font-bold text-[#0B5137] hover:text-[#2F9E59] flex items-center gap-1 transition"
          >
            {t('viewAllScans')}
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {scans.length === 0 ? (
          <Card variant="white" className="p-8 text-center border-[#DDE8DC]">
            <div className="w-12 h-12 rounded-full bg-[#F6F8F0] flex items-center justify-center mx-auto text-[#5F7065] mb-3">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#152D24]">
              {t('emptyScansText')}
            </p>
            <div className="mt-4">
              <Link to="/scan">
                <Button variant="primary" size="md">
                  {t('scanButtonLabel')}
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scans.slice(0, 2).map((scan) => (
              <Card
                key={scan.id}
                variant="white"
                padding="none"
                className="overflow-hidden flex flex-col sm:flex-row group border border-[#DDE8DC] hover:border-[#2F9E59] hover:shadow-sm transition"
              >
                {/* Crop Thumbnail */}
                <div className="sm:w-44 h-40 sm:h-auto relative overflow-hidden bg-slate-900 shrink-0">
                  <img
                    src={scan.imageUrl}
                    alt={scan.cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant={
                        scan.severity === 'Critical' || scan.severity === 'High'
                          ? 'danger'
                          : scan.severity === 'Moderate'
                          ? 'warning'
                          : 'success'
                      }
                      size="sm"
                    >
                      {scan.severity}
                    </Badge>
                  </div>
                </div>

                {/* Scan Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#0B5137] bg-[#E6F2E5] px-2 py-0.5 rounded-md border border-[#2F9E59]/30">
                        {scan.cropName}
                      </span>
                      <span className="text-[11px] text-[#5F7065]">
                        {scan.scannedAt}
                      </span>
                    </div>

                    <h5 className="font-bold text-base text-[#152D24] mt-1 line-clamp-1">
                      {scan.localDiseaseName?.[language] || scan.diseaseName}
                    </h5>

                    <p className="text-xs text-[#5F7065] line-clamp-2 mt-1 leading-relaxed">
                      {scan.diagnosisExplanation}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DDE8DC] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#5F7065] font-medium">अचूकता:</span>
                      <span className="text-xs font-bold text-[#21864A] bg-[#E6F2E5] px-2 py-0.5 rounded-full border border-[#21864A]/30">
                        {scan.confidence}% AI
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/history?scanId=${scan.id}`)}
                      className="text-xs font-bold"
                    >
                      {t('diagnosisButton')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lalya Diagnostic Guide Modal */}
      <LalyaDeficiencyGuide 
        isOpen={isLalyaModalOpen} 
        onClose={() => setIsLalyaModalOpen(false)} 
      />
    </div>
  );
};
