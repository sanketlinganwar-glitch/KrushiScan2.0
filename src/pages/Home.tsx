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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchLiveWeather, getOfflineWeatherData } from '../lib/weather';
import { WeatherData, ScanResult } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LOCAL_STORAGE_KEYS } from '../lib/supabase';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#D5DEE8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#138808] border border-[#138808]/30">
              🌱 विदर्भ शेतकरी पोर्टल (Vidarbha Node)
            </span>
            {weather.isLive ? (
              <span className="text-[11px] font-semibold text-[#138808] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-ping" />
                थेट हवामान (Live)
              </span>
            ) : (
              <span className="text-[11px] text-[#5B6B7D] font-medium">स्थानिक अंदाज (Standard)</span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0A2540] mt-1.5 tracking-tight">
            {t('greetingMorning')},{' '}
            <span className="text-[#138808]">{user?.name || 'गजानन पवार'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B7D] mt-0.5 font-medium">
            तुमचे शेत: <strong className="text-[#0A2540]">{user?.farmSizeAcres || 6.5} एकर</strong> ({user?.district || 'यवतमाळ'}) • मुख्य पिके: कापूस, सोयाबीन, तूर
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/crops">
            <Button variant="outline" size="sm" className="text-xs font-bold">
              शेतातील पिके ({user?.activeCrops?.length || 3})
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Weather & Advisory Card */}
      <Card variant="white" className="overflow-hidden border-[#D5DEE8]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-1">
          {/* Weather Metrics */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EEF3F8] border border-[#D5DEE8] flex items-center justify-center text-[#3B6EA5] shrink-0 shadow-inner">
              <CloudSun className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#0A2540] tracking-tight">
                  {weather.temp}°C
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#5B6B7D]">
                  {weather.condition}
                </span>
              </div>
              <p className="text-xs text-[#5B6B7D] font-medium">
                {weather.location}
              </p>
            </div>
          </div>

          {/* Environmental Indicators */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t md:border-t-0 md:border-l border-[#D5DEE8] pt-3 md:pt-0 md:pl-6 text-center">
            <div className="bg-[#EEF3F8] rounded-xl p-2.5 border border-[#D5DEE8]">
              <div className="flex items-center justify-center gap-1 text-[#5B6B7D] text-[11px] font-medium">
                <CloudRain className="w-3.5 h-3.5 text-[#3B6EA5]" />
                <span>{t('rainfallChance')}</span>
              </div>
              <p className="text-sm font-bold text-[#0A2540] mt-0.5">
                {weather.rainProbability}%
              </p>
            </div>

            <div className="bg-[#EEF3F8] rounded-xl p-2.5 border border-[#D5DEE8]">
              <div className="flex items-center justify-center gap-1 text-[#5B6B7D] text-[11px] font-medium">
                <Droplets className="w-3.5 h-3.5 text-[#3B6EA5]" />
                <span>{t('humidity')}</span>
              </div>
              <p className="text-sm font-bold text-[#0A2540] mt-0.5">
                {weather.humidity}%
              </p>
            </div>

            <div className="bg-[#EEF3F8] rounded-xl p-2.5 border border-[#D5DEE8]">
              <div className="flex items-center justify-center gap-1 text-[#5B6B7D] text-[11px] font-medium">
                <Wind className="w-3.5 h-3.5 text-[#3B6EA5]" />
                <span>{t('windSpeed')}</span>
              </div>
              <p className="text-sm font-bold text-[#0A2540] mt-0.5">
                {weather.windSpeed} km/h
              </p>
            </div>
          </div>
        </div>

        {/* Agricultural Advisory Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-[#138808]/30 text-xs sm:text-sm text-[#0A2540] flex items-start gap-2.5">
          <span className="p-1 rounded-md bg-[#138808] text-white font-bold text-[10px] uppercase shrink-0 mt-0.5">
            {t('agriAdvisory')}
          </span>
          <p className="leading-snug font-medium text-[#0A2540]">
            {weather.advisory[language] || weather.advisory['mr']}
          </p>
        </div>
      </Card>

      {/* 3. Hero Main Action: Big Navy "SCAN YOUR CROP" Banner with Saffron highlight */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0A2540] p-6 sm:p-8 text-white shadow-md border border-[#0A2540]">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-white text-xs font-bold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>AI रोगाची झटपट तपासणी (Instant AI Vision)</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('scanHeroTitle')}
            </h3>
            <p className="text-sm sm:text-base text-slate-300 mt-2 font-medium">
              {t('scanHeroSubtitle')}
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col items-center">
            <Link to="/scan" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="xl"
                className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-2xl group flex items-center justify-center gap-3 border border-white/20"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <span>{t('scanButtonLabel')}</span>
              </Button>
            </Link>
            <span className="text-[11px] text-slate-300 mt-2 text-center font-medium">
              कॅमेऱ्यातून थेट फोटो किंवा गॅलरीतून निवडा
            </span>
          </div>
        </div>
      </div>

      {/* 4. Quick Action Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-base font-bold text-[#0A2540] flex items-center gap-2">
            <span>{t('quickActionsTitle')}</span>
          </h4>
          <span className="text-xs text-[#138808] font-bold">
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
                  className="h-full flex flex-col justify-between p-3.5 sm:p-4 hover:border-[#0A2540] border-[#D5DEE8]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${action.color} group-hover:scale-105 transition`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#5B6B7D] group-hover:text-[#0A2540] group-hover:translate-x-0.5 transition" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#0A2540] group-hover:text-[#138808] transition line-clamp-1">
                      {action.title}
                    </h5>
                    <p className="text-[11px] text-[#5B6B7D] line-clamp-1 mt-0.5 font-medium">
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
      <div className="bg-white border border-[#D5DEE8] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-[#138808]/30 flex items-center justify-center text-[#138808] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0A2540] uppercase tracking-wide">
                आजचे कृषी बाजार भाव (APMC Rates)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#138808] border border-[#138808]/20 font-bold">
                हिंगणघाट / यवतमाळ
              </span>
            </div>
            <p className="text-xs text-[#5B6B7D] mt-0.5 font-medium">
              कापूस (लांब धागा): <strong className="text-[#0A2540] font-bold">₹७,९२०</strong>/क्विंटल • हमीभाव (MSP): ₹७,५२१ • सोयाबीन: <strong className="text-[#0A2540] font-bold">₹४,५८०</strong>/क्विंटल
            </p>
          </div>
        </div>

        <Link to="/mandi">
          <Button variant="outline" size="sm" className="text-xs shrink-0 whitespace-nowrap">
            तपशील व नफा कॅल्क्युलेटर
          </Button>
        </Link>
      </div>

      {/* 6. Recent Crop Scans */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-base font-bold text-[#0A2540] flex items-center gap-2">
            <span>{t('recentScansTitle')}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF3F8] text-[#5B6B7D] font-semibold border border-[#D5DEE8]">
              {scans.length}
            </span>
          </h4>
          <Link
            to="/history"
            className="text-xs font-bold text-[#0A2540] hover:text-[#3B6EA5] flex items-center gap-1 transition"
          >
            {t('viewAllScans')}
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {scans.length === 0 ? (
          <Card variant="white" className="p-8 text-center border-[#D5DEE8]">
            <div className="w-12 h-12 rounded-full bg-[#EEF3F8] flex items-center justify-center mx-auto text-[#5B6B7D] mb-3">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#0A2540]">
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
                className="overflow-hidden flex flex-col sm:flex-row group border border-[#D5DEE8] hover:shadow-sm transition"
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
                      <span className="text-xs font-semibold text-[#138808] bg-emerald-50 px-2 py-0.5 rounded-md border border-[#138808]/20">
                        {scan.cropName}
                      </span>
                      <span className="text-[11px] text-[#5B6B7D]">
                        {scan.scannedAt}
                      </span>
                    </div>

                    <h5 className="font-bold text-base text-[#0A2540] mt-1 line-clamp-1">
                      {scan.localDiseaseName?.[language] || scan.diseaseName}
                    </h5>

                    <p className="text-xs text-[#5B6B7D] line-clamp-2 mt-1 leading-relaxed">
                      {scan.diagnosisExplanation}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#D5DEE8] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#5B6B7D] font-medium">अचूकता:</span>
                      <span className="text-xs font-bold text-[#138808] bg-emerald-50 px-2 py-0.5 rounded-full border border-[#138808]/20">
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
    </div>
  );
};
