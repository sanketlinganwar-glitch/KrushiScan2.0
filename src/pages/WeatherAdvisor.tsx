import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Calendar, 
  Info, 
  TrendingDown, 
  TrendingUp, 
  Compass, 
  Sprout, 
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  fetchSevenDayAgroWeather,
  VIDARBHA_DISTRICTS_COORDS,
  IMD_DRY_DAY_THRESHOLD_MM,
  DrySpellEvaluation,
  DailyForecastDay,
  CropMoistureVulnerability,
} from '../lib/weatherAdvisor';

export const WeatherAdvisor: React.FC = () => {
  const { language } = useLanguage();
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Yavatmal');
  const [thresholdMm, setThresholdMm] = useState<number>(IMD_DRY_DAY_THRESHOLD_MM);
  const [selectedCropId, setSelectedCropId] = useState<string>('cotton');
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluation, setEvaluation] = useState<DrySpellEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadForecast = async (district: string, threshold: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSevenDayAgroWeather(district, threshold);
      setEvaluation(data);
    } catch (err: any) {
      console.error('Failed to load agro weather forecast:', err);
      setError('हवामान माहिती लोड करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast(selectedDistrict, thresholdMm);
  }, [selectedDistrict, thresholdMm]);

  const selectedCrop = evaluation?.cropRisks.find((c) => c.cropId === selectedCropId) || evaluation?.cropRisks[0];

  const severityBadge = (sev: string) => {
    switch (sev) {
      case 'none':
        return <Badge variant="success">{language === 'mr' ? 'अनुकूल' : language === 'hi' ? 'अनुकूल' : 'Optimal'}</Badge>;
      case 'mild':
        return <Badge variant="warning">{language === 'mr' ? 'हलका कोरडा काळ' : language === 'hi' ? 'हल्का शुष्क काल' : 'Mild Dry Spell'}</Badge>;
      case 'moderate':
        return <Badge variant="warning">{language === 'mr' ? 'मध्यम कोरडा काळ' : language === 'hi' ? 'मध्यम शुष्क काल' : 'Moderate Dry Spell'}</Badge>;
      case 'severe':
        return <Badge variant="danger">{language === 'mr' ? 'तीव्र कोरडा काळ' : language === 'hi' ? 'गंभीर सूखा' : 'Severe Dry Spell'}</Badge>;
      case 'excess_rain':
        return <Badge variant="danger">{language === 'mr' ? 'अतिवृष्टी इशारा' : language === 'hi' ? 'अतिवृष्टि' : 'Heavy Rain'}</Badge>;
      default:
        return <Badge variant="neutral">सामान्य</Badge>;
    }
  };

  const getBarColor = (rain: number, isDry: boolean) => {
    if (rain >= 20) return 'bg-[#0B5137]';
    if (!isDry) return 'bg-[#2F9E59]';
    if (rain > 0) return 'bg-[#E9A23B]';
    return 'bg-[#DDE8DC]';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Header & District Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#DDE8DC] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#E6F2E5] text-[#0B5137] border border-[#DDE8DC] flex items-center justify-center">
              <CloudRain className="w-5 h-5 text-[#2F9E59]" />
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E6F2E5] text-[#0B5137] border border-[#DDE8DC]">
              {language === 'mr' ? '७-दिवसीय कृषी-हवामान विश्लेषण' : language === 'hi' ? '7-दिवसीय कृषि-मौसम विश्लेषण' : '7-Day Agro-Meteorological Advisor'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#152D24] mt-1.5 tracking-tight">
            {language === 'mr'
              ? 'कोरडा काळ व पीक हवामान-ताण सल्लागार'
              : language === 'hi'
              ? 'शुष्क काल व फसल मौसम-तनाव परामर्श'
              : 'Dry-Spell & Crop Moisture-Stress Advisor'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5F7065] mt-0.5">
            {language === 'mr'
              ? 'विदर्भातील कपाशी, सोयाबीन, तूर व संत्रा पिकांसाठी डॉ. पंदेकृवि मार्गदर्शक तत्त्वांवर आधारित अधिकृत सल्ला'
              : language === 'hi'
              ? 'विदर्भ के मुख्य फसलों के लिए डॉ. पंजाबराव देशमुख कृषि विद्यापीठ (PDKV) आधारित सलाह'
              : 'Grounded in Dr. PDKV Akola & IMD agrometeorological dry-spell management guidelines'}
          </p>
        </div>

        {/* District and Refresh Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#F6F8F0] px-3 py-1.5 rounded-2xl border border-[#DDE8DC]">
            <Compass className="w-4 h-4 text-[#2F9E59]" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#152D24] focus:outline-hidden cursor-pointer"
            >
              {Object.entries(VIDARBHA_DISTRICTS_COORDS).map(([key, val]) => (
                <option key={key} value={key}>
                  {language === 'mr' ? val.labelMr : language === 'hi' ? val.labelHi : val.labelEn}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadForecast(selectedDistrict, thresholdMm)}
            disabled={loading}
            className="text-xs font-bold border-[#DDE8DC] text-[#152D24] hover:bg-[#E6F2E5]"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            {loading ? 'लोड होत आहे...' : language === 'mr' ? 'रिफ्रेश' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* 2. Key Meteorological KPI Metric Cards */}
      {evaluation && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Consecutive Dry Days */}
          <Card variant="white" className="p-4 border-[#DDE8DC] relative overflow-hidden">
            <div className="flex items-center justify-between text-[#5F7065] text-xs font-medium">
              <span>{language === 'mr' ? 'सलग कोरडे दिवस' : language === 'hi' ? 'लगातार शुष्क दिन' : 'Dry Spell Streak'}</span>
              <Calendar className="w-4 h-4 text-[#E9A23B]" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`text-3xl font-black ${evaluation.consecutiveDryDays >= 5 ? 'text-[#C83E3E]' : evaluation.consecutiveDryDays >= 3 ? 'text-[#E9A23B]' : 'text-[#152D24]'}`}>
                {evaluation.consecutiveDryDays}
              </span>
              <span className="text-xs font-semibold text-[#5F7065]">
                {language === 'mr' ? 'दिवस' : language === 'hi' ? 'दिन' : 'days'}
              </span>
            </div>
            <p className="text-[11px] text-[#5F7065] mt-1">
              {language === 'mr' ? `निकष: पाऊस < ${thresholdMm} मिमी` : `Threshold: < ${thresholdMm} mm`}
            </p>
          </Card>

          {/* Card 2: 7-Day Rainfall Forecast Accumulation */}
          <Card variant="white" className="p-4 border-[#DDE8DC]">
            <div className="flex items-center justify-between text-[#5F7065] text-xs font-medium">
              <span>{language === 'mr' ? '७-दिवस एकूण पाऊस' : language === 'hi' ? '7-दिन कुल बारिश' : '7-Day Total Rain'}</span>
              <CloudRain className="w-4 h-4 text-[#2F9E59]" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#0B5137]">
                {evaluation.totalRainForecastMm}
              </span>
              <span className="text-xs font-semibold text-[#5F7065]">मिमी (mm)</span>
            </div>
            <p className="text-[11px] text-[#5F7065] mt-1 font-medium">
              {language === 'mr' ? 'भविष्यातील अंदाजित पाऊस' : 'Forecast Cumulative'}
            </p>
          </Card>

          {/* Card 3: Evaporative Demand (ET0) */}
          <Card variant="white" className="p-4 border-[#DDE8DC]">
            <div className="flex items-center justify-between text-[#5F7065] text-xs font-medium">
              <span>{language === 'mr' ? 'एकूण बाष्पीभवन (ET₀)' : language === 'hi' ? 'कुल वाष्पीकरण' : 'Evaporative Loss (ET₀)'}</span>
              <Sun className="w-4 h-4 text-[#E9A23B]" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#E9A23B]">
                {evaluation.totalEt0ForecastMm}
              </span>
              <span className="text-xs font-semibold text-[#5F7065]">मिमी (mm)</span>
            </div>
            <p className="text-[11px] text-[#5F7065] mt-1">
              FAO-56 Penman-Monteith
            </p>
          </Card>

          {/* Card 4: Moisture Deficit */}
          <Card variant="white" className="p-4 border-[#DDE8DC]">
            <div className="flex items-center justify-between text-[#5F7065] text-xs font-medium">
              <span>{language === 'mr' ? 'पाण्याची तूट / समतोल' : language === 'hi' ? 'जल संतुलन' : 'Water Deficit (ET₀-Rain)'}</span>
              {evaluation.waterDeficitMm > 0 ? (
                <TrendingDown className="w-4 h-4 text-[#C83E3E]" />
              ) : (
                <TrendingUp className="w-4 h-4 text-[#21864A]" />
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`text-3xl font-black ${evaluation.waterDeficitMm > 20 ? 'text-[#C83E3E]' : 'text-[#21864A]'}`}>
                {evaluation.waterDeficitMm > 0 ? `-${evaluation.waterDeficitMm}` : `+${Math.abs(evaluation.waterDeficitMm)}`}
              </span>
              <span className="text-xs font-semibold text-[#5F7065]">मिमी</span>
            </div>
            <p className="text-[11px] text-[#5F7065] mt-1">
              {evaluation.waterDeficitMm > 0 ? (language === 'mr' ? 'बाष्पीभवन पावसापेक्षा जास्त' : 'Deficit') : (language === 'mr' ? 'ओलावा समतोल' : 'Surplus')}
            </p>
          </Card>
        </div>
      )}

      {/* 3. Agrometeorological Severity Headline Banner */}
      {evaluation && (
        <div
          className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all ${
            evaluation.drySpellSeverity === 'severe'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : evaluation.drySpellSeverity === 'moderate'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : evaluation.drySpellSeverity === 'excess_rain'
              ? 'bg-blue-50 border-blue-300 text-blue-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-2xl bg-white shadow-xs shrink-0 mt-0.5">
                {evaluation.drySpellSeverity === 'severe' || evaluation.drySpellSeverity === 'excess_rain' ? (
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                ) : evaluation.drySpellSeverity === 'moderate' ? (
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    {evaluation.severityHeadline[language]}
                  </h3>
                  {severityBadge(evaluation.drySpellSeverity)}
                </div>
                <p className="text-xs sm:text-sm mt-1 text-slate-700 leading-relaxed font-medium">
                  {evaluation.severityExplanation[language]}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Configurable Rainfall Threshold Toggle Bar */}
      <Card variant="white" className="p-4 border-[#DDE8DC]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#2F9E59]" />
            <span className="text-xs font-bold text-[#152D24]">
              {language === 'mr' ? 'कोरड्या दिवसाचा निकष (Dry Day Threshold):' : 'Dry Day Rainfall Threshold:'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {[
              { val: 1.0, label: '१.० मिमी (हलकी जमीन)' },
              { val: 2.5, label: '२.५ मिमी (IMD / PDKV अधिकृत मानक)' },
              { val: 5.0, label: '५.० मिमी (मध्यम पाऊस)' },
            ].map((th) => (
              <button
                key={th.val}
                onClick={() => setThresholdMm(th.val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  thresholdMm === th.val
                    ? 'bg-[#0B5137] text-white border-[#0B5137] shadow-xs'
                    : 'bg-[#F6F8F0] text-[#5F7065] border-[#DDE8DC] hover:bg-[#E6F2E5]'
                }`}
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-[#5F7065] mt-2 border-t border-[#DDE8DC] pt-2">
          {language === 'mr'
            ? '💡 भारतीय हवामान विभाग (IMD) व डॉ. पंदेकृवि नियमावलीनुसार दैनिक पाऊस २.५ मिमी पेक्षा कमी असल्यास तो "कोरडा दिवस" मानला जातो; कारण विदर्भातील उष्ण तापमानात २.५ मिमीपेक्षा कमी पाऊस त्वरित बाष्पीभवन होऊन जमिनीत मुळांपर्यंत झिरपत नाही.'
            : '💡 Indian Meteorological Department (IMD) and PDKV scientifically define an agricultural rainy day as >= 2.5 mm. Sub-2.5 mm precipitation evaporates rapidly under Vidarbha heat and fails to penetrate into the active crop root zone.'}
        </p>
      </Card>

      {/* 5. 7-Day Rainfall Forecast & Daily Accumulation Visual Chart */}
      {evaluation && (
        <Card variant="white" className="p-5 border-[#DDE8DC]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#DDE8DC]">
            <div>
              <h3 className="text-base font-black text-[#152D24] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2F9E59]" />
                <span>{language === 'mr' ? '७-दिवसीय दैनिक अंदाज व पर्जन्यमान तक्ता' : '7-Day Daily Forecast & Precipitation Breakdown'}</span>
              </h3>
              <p className="text-xs text-[#5F7065] mt-0.5">
                {language === 'mr'
                  ? 'टीप: हा अंदाज संख्यात्मक मॉडेलवर आधारित आहे (मागील प्रत्यक्ष नोंदी नव्हेत)'
                  : 'Notice: Predictive forecast model numbers; distinct from past historical records'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-[#5F7065] text-[11px]">
                <span className="w-3 h-3 rounded-sm bg-[#21864A] inline-block" />
                {language === 'mr' ? 'पाऊस (>=२.५ मिमी)' : 'Rain'}
              </span>
              <span className="flex items-center gap-1 text-[#5F7065] text-[11px]">
                <span className="w-3 h-3 rounded-sm bg-[#E9A23B] inline-block" />
                {language === 'mr' ? 'हलकी रिमझिम' : 'Drizzle'}
              </span>
              <span className="flex items-center gap-1 text-[#5F7065] text-[11px]">
                <span className="w-3 h-3 rounded-sm bg-[#DDE8DC] inline-block" />
                {language === 'mr' ? 'कोरडा दिवस' : 'Dry Day'}
              </span>
            </div>
          </div>

          {/* Daily Cards Grid */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2.5">
            {evaluation.dailyForecast.map((day, idx) => (
              <div
                key={day.date}
                className={`p-3 rounded-2xl border text-center transition flex flex-col justify-between ${
                  day.isDryDay
                    ? 'bg-[#F6F8F0] border-[#DDE8DC]'
                    : 'bg-[#E6F2E5]/50 border-[#DDE8DC]'
                }`}
              >
                <div>
                  <div className="text-xs font-black text-[#152D24]">
                    {day.dayName[language]}
                  </div>
                  <div className="text-[10px] text-[#5F7065] font-medium">
                    {day.date.slice(5)}
                  </div>

                  <div className="my-2.5 flex items-center justify-center">
                    {day.rainMm >= 2.5 ? (
                      <CloudRain className="w-6 h-6 text-[#2F9E59]" />
                    ) : day.rainMm > 0 ? (
                      <Droplets className="w-6 h-6 text-[#2F9E59]" />
                    ) : (
                      <Sun className="w-6 h-6 text-[#E9A23B]" />
                    )}
                  </div>

                  {/* Temperature */}
                  <div className="text-xs font-bold text-[#152D24]">
                    {day.tempMax}° / <span className="text-[#5F7065] font-normal">{day.tempMin}°</span>
                  </div>

                  {/* Rainfall mm */}
                  <div className="mt-2 pt-2 border-t border-[#DDE8DC]">
                    <span className="text-[10px] uppercase font-bold text-[#5F7065] block">
                      {language === 'mr' ? 'अंदाजित पाऊस' : 'Forecast'}
                    </span>
                    <span className="text-sm font-black text-[#0B5137]">
                      {day.rainMm} <span className="text-[10px] font-normal">मिमी</span>
                    </span>
                    <div className="text-[10px] text-[#5F7065]">
                      शक्यता: {day.rainProb}%
                    </div>
                  </div>
                </div>

                {/* Dry vs Rainy Indicator Badge */}
                <div className="mt-2.5">
                  {day.isDryDay ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DDE8DC] text-[#152D24] font-semibold inline-block w-full">
                      {language === 'mr' ? 'कोरडा' : 'Dry'}
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0B5137] text-white font-semibold inline-block w-full shadow-xs">
                      {language === 'mr' ? 'पावसाळी' : 'Rainy'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 6. Crop-Specific Moisture Risk & Agronomic Advisory Card */}
      {evaluation && (
        <Card variant="white" className="p-5 border-[#DDE8DC]">
          <div className="pb-3 border-b border-[#DDE8DC]">
            <h3 className="text-base font-black text-[#152D24] flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[#2F9E59]" />
              <span>{language === 'mr' ? 'पीकनिहाय ओलावा-ताण व डॉ. पंदेकृवि शिफारशी' : 'Crop-Specific Moisture Stress & PDKV Rescue Recommendations'}</span>
            </h3>
            <p className="text-xs text-[#5F7065] mt-0.5">
              {language === 'mr' ? 'तुमचे पीक निवडा व सध्याच्या वाढीच्या अवस्थेतील हवामान-धोका जाणून घ्या:' : 'Select your crop to see stage-specific moisture stress analysis:'}
            </p>
          </div>

          {/* Crop Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            {evaluation.cropRisks.map((c) => (
              <button
                key={c.cropId}
                onClick={() => setSelectedCropId(c.cropId)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition border flex items-center gap-1.5 ${
                  selectedCropId === c.cropId
                    ? 'bg-[#0B5137] text-white border-[#0B5137] shadow-xs'
                    : 'bg-[#F6F8F0] text-[#152D24] border-[#DDE8DC] hover:bg-[#E6F2E5]'
                }`}
              >
                <span>{c.cropName[language]}</span>
              </button>
            ))}
          </div>

          {/* Selected Crop Detail Container */}
          {selectedCrop && (
            <div className="mt-3 p-4 rounded-2xl bg-[#F6F8F0] border border-[#DDE8DC] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DDE8DC]">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-[#152D24]">
                      {selectedCrop.cropName[language]}
                    </h4>
                    <span className="text-[11px] font-semibold text-[#5F7065]">
                      ({language === 'mr' ? 'अवस्था: ' : 'Stage: '} {selectedCrop.currentStage[language]})
                    </span>
                  </div>
                  <div className="text-xs text-[#5F7065] mt-0.5">
                    {language === 'mr' ? 'पाण्याची संवेदनशीलता: ' : 'Moisture Sensitivity: '}
                    <strong className="text-[#152D24]">{selectedCrop.sensitivityRating}</strong>
                  </div>
                </div>

                <div>
                  {selectedCrop.stressLevel === 'severe_stress' && (
                    <Badge variant="danger">
                      {language === 'mr' ? 'तीव्र पाण्याचा ताण धोका' : 'Severe Stress Risk'}
                    </Badge>
                  )}
                  {selectedCrop.stressLevel === 'mild_stress' && (
                    <Badge variant="warning">
                      {language === 'mr' ? 'मध्यम ताण धोका' : 'Mild Stress Risk'}
                    </Badge>
                  )}
                  {selectedCrop.stressLevel === 'excess_water_risk' && (
                    <Badge variant="danger">
                      {language === 'mr' ? 'पाणी साचण्याचा धोका' : 'Waterlogging Risk'}
                    </Badge>
                  )}
                  {selectedCrop.stressLevel === 'normal' && (
                    <Badge variant="success">
                      {language === 'mr' ? 'हवामान अनुकूल' : 'Normal / Low Risk'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stress Impact Description */}
              <div>
                <h5 className="text-xs font-bold text-[#152D24] uppercase tracking-wide">
                  {language === 'mr' ? 'संभाव्य परिणाम (Agrometeorological Impact):' : 'Agrometeorological Impact:'}
                </h5>
                <p className="text-xs sm:text-sm text-[#152D24] mt-1 leading-relaxed">
                  {selectedCrop.impactExplanation[language]}
                </p>
              </div>

              {/* Verified Actionable PDKV Guidance */}
              <div className="bg-white p-3.5 rounded-xl border border-[#DDE8DC]">
                <h5 className="text-xs font-bold text-[#0B5137] flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-[#2F9E59]" />
                  <span>{language === 'mr' ? 'डॉ. पंदेकृवि अधिकृत उपाययोजना (PDKV Recommendations):' : 'Verified PDKV Rescue Measures:'}</span>
                </h5>
                <ul className="mt-2 space-y-1.5 text-xs text-[#152D24]">
                  {selectedCrop.pdkvGuidance[language].map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2F9E59] shrink-0 mt-1.5" />
                      <span className="leading-snug">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 7. General Farm Actions */}
      {evaluation && (
        <Card variant="white" className="p-5 border-[#DDE8DC]">
          <h4 className="text-sm font-black text-[#152D24] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2F9E59]" />
            <span>{language === 'mr' ? 'विदर्भ शेतकरी कृती आराखडा (General Action Plan)' : 'General Vidarbha Farmer Action Plan'}</span>
          </h4>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {evaluation.generalActions[language].map((act, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#F6F8F0] border border-[#DDE8DC] text-xs text-[#152D24] flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0B5137] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed font-medium">{act}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 8. Scientific Soil Disclaimer & Forecast Distinction */}
      {evaluation && (
        <div className="space-y-2">
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-900">
                {evaluation.scientificSoilDisclaimer[language]}
              </p>
              <p className="text-[11px] text-amber-800/90 font-medium">
                {evaluation.forecastVsHistoricalClarification[language]}
              </p>
            </div>
          </div>

          <div className="text-center text-[11px] text-[#5F7065] font-medium pt-2">
            डेटा स्रोत: {evaluation.dataSource} • विदर्भ कृषी विद्यापीठ (PDKV अकोला) कृषी-हवामान मानक
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherAdvisor;
