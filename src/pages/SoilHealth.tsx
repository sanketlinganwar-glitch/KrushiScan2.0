import React, { useState } from 'react';
import { 
  FlaskConical, 
  Sprout, 
  Info, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Clock, 
  FileText,
  HelpCircle,
  TrendingUp,
  Download
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  CROP_RDF_PROFILES, 
  classifyPh, 
  classifyEc, 
  classifyNutrient, 
  calculateSoilFertilizers,
  FertilizerCalculationResult,
  SoilTestInputs
} from '../lib/soilNutrientData';

export const SoilHealth: React.FC = () => {
  const { language } = useLanguage();

  const [selectedCropId, setSelectedCropId] = useState<string>('cotton_rainfed');
  const [acres, setAcres] = useState<number>(1.0);

  // Soil Health Card inputs (Default initialized to standard Vidarbha vertisol)
  const [ph, setPh] = useState<number>(8.1);
  const [ec, setEc] = useState<number>(0.35);
  const [oc, setOc] = useState<number>(0.52);
  const [nitrogen, setNitrogen] = useState<number>(260);
  const [phosphorus, setPhosphorus] = useState<number>(18);
  const [potassium, setPotassium] = useState<number>(240);
  const [zinc, setZinc] = useState<number>(0.48);
  const [sulfur, setSulfur] = useState<number>(12.0);

  const [selectedPlanTab, setSelectedPlanTab] = useState<'optionDap' | 'optionSsp'>('optionDap');

  // Pre-load representative sample data for Vidarbha Vertisol
  const loadSampleVidarbhaCard = () => {
    setPh(8.2);
    setEc(0.32);
    setOc(0.48);      // Low organic carbon
    setNitrogen(245);  // Low N
    setPhosphorus(16); // Medium P
    setPotassium(260); // Medium K
    setZinc(0.42);     // Deficient (< 0.6 ppm)
    setSulfur(11.5);   // Medium S
  };

  const soilInputs: SoilTestInputs = {
    ph,
    ec,
    organicCarbon: oc,
    nitrogen,
    phosphorus,
    potassium,
    zinc,
    sulfur,
  };

  const phClassification = classifyPh(ph);
  const ecClassification = classifyEc(ec);
  const nRating = classifyNutrient('nitrogen', nitrogen);
  const pRating = classifyNutrient('phosphorus', phosphorus);
  const kRating = classifyNutrient('potassium', potassium);
  const ocRating = classifyNutrient('organicCarbon', oc);

  let calculation: FertilizerCalculationResult | null = null;
  try {
    calculation = calculateSoilFertilizers(selectedCropId, Math.max(0.25, acres), soilInputs);
  } catch (err) {
    console.warn('Fertilizer calculation error:', err);
  }

  const getRatingBadge = (rating: string) => {
    if (rating === 'Low') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-300">
          कमी (Low: +25% खत)
        </span>
      );
    }
    if (rating === 'High') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
          जास्त (High: -25% खत)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
        मध्यम (Medium: प्रमाणशीर)
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0A2540] text-white flex items-center justify-center shadow-xs shrink-0">
            <FlaskConical className="w-6 h-6 text-[#FF9933]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0A2540] tracking-tight">
              मृदा आरोग्य व खत मात्रा गणक
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6B7D] font-medium">
              डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV) अकोला शिफारशीनुसार अचूक खत नियोजन
            </p>
          </div>
        </div>

        {/* Sample Card Loader Button */}
        <button
          type="button"
          onClick={loadSampleVidarbhaCard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D5DEE8] hover:bg-[#EEF3F8] text-xs font-bold text-[#0A2540] shadow-xs transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#138808]" />
          <span>विदर्भ काळी जमीन नमुना भरा</span>
        </button>
      </div>

      {/* Crop & Acreage Selector */}
      <Card variant="white" padding="md" className="border-[#D5DEE8]">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-8 space-y-1.5">
            <label className="block text-xs font-bold text-[#0A2540] uppercase tracking-wider">
              पीक निवडा (Select Crop):
            </label>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="w-full bg-[#EEF3F8] border border-[#D5DEE8] text-[#0A2540] font-extrabold text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-[#0A2540]"
            >
              {Object.values(CROP_RDF_PROFILES).map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name[language] || crop.name.mr}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold text-[#0A2540] uppercase tracking-wider">
              क्षेत्र एकर (Area in Acres):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.25"
                max="100"
                step="0.25"
                value={acres}
                onChange={(e) => setAcres(Math.max(0.25, parseFloat(e.target.value) || 0.25))}
                className="w-full bg-white border border-[#D5DEE8] text-[#0A2540] font-extrabold text-sm rounded-xl px-3.5 py-2.5 text-center focus:ring-2 focus:ring-[#0A2540]"
              />
              <span className="text-xs font-bold text-[#5B6B7D]">एकर</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: Left Inputs, Right Calculations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Soil Health Card Parameters */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="white" padding="lg" className="border-[#D5DEE8] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D5DEE8]">
              <h3 className="font-extrabold text-sm text-[#0A2540] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FF9933]" />
                <span>माती परीक्षण पत्रिका नोंदी (Soil Card Values)</span>
              </h3>
            </div>

            {/* Parameter 1: pH */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0A2540]">
                  १. सामू (Soil pH):
                </label>
                <span className="text-[11px] font-extrabold text-blue-700">
                  {phClassification.headline[language] || phClassification.headline.mr}
                </span>
              </div>
              <input
                type="number"
                min="4.0"
                max="10.5"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(parseFloat(e.target.value) || 7.0)}
                className="w-full bg-[#EEF3F8] border border-[#D5DEE8] text-[#0A2540] font-bold text-sm rounded-xl px-3 py-2"
              />
            </div>

            {/* Parameter 2: EC */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0A2540]">
                  २. विद्युत वाहकता / क्षारता (EC dS/m):
                </label>
                <span className="text-[11px] font-extrabold text-[#138808]">
                  {ecClassification.headline[language] || ecClassification.headline.mr}
                </span>
              </div>
              <input
                type="number"
                min="0.01"
                max="10.0"
                step="0.01"
                value={ec}
                onChange={(e) => setEc(parseFloat(e.target.value) || 0.3)}
                className="w-full bg-[#EEF3F8] border border-[#D5DEE8] text-[#0A2540] font-bold text-sm rounded-xl px-3 py-2"
              />
            </div>

            {/* Parameter 3: Organic Carbon */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0A2540]">
                  ३. सेंद्रिय कर्ब (Organic Carbon %):
                </label>
                <div>{getRatingBadge(ocRating)}</div>
              </div>
              <input
                type="number"
                min="0.05"
                max="2.5"
                step="0.01"
                value={oc}
                onChange={(e) => setOc(parseFloat(e.target.value) || 0.5)}
                className="w-full bg-[#EEF3F8] border border-[#D5DEE8] text-[#0A2540] font-bold text-sm rounded-xl px-3 py-2"
              />
            </div>

            {/* Parameter 4: Nitrogen (N) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0A2540]">
                  ४. उपलब्ध नत्र (Available N kg/ha):
                </label>
                <div>{getRatingBadge(nRating)}</div>
              </div>
              <input
                type="number"
                min="50"
                max="1200"
                step="5"
                value={nitrogen}
                onChange={(e) => setNitrogen(parseInt(e.target.value) || 250)}
                className="w-full bg-[#EEF3F8] border border-[#D5DEE8] text-[#0A2540] font-bold text-sm rounded-xl px-3 py-2"
              />
            </div>

            {/* Parameter 5: Phosphorus (P) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0A2540]">
                  ५. उपलब्ध स्फुरद (Available P₂O₅ kg/ha):
                </label>
                <div>{getRatingBadge(pRating)}</div>
              </div>
              <input
                type="number"
                min="2"
                max="120"
                step="1"
                value={phosphorus}
                onChange={(e) => setPhosphorus(parseInt(e.target.value) || 15)}
                className="w-full bg-[#EEF3F8] border border-[#D5DEE8] text-[#0A2540] font-bold text-sm rounded-xl px-3 py-2"
              />
            </div>

            {/* Parameter 6: Potassium (K) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0A2540]">
                  ६. उपलब्ध पालाश (Available K₂O kg/ha):
                </label>
                <div>{getRatingBadge(kRating)}</div>
              </div>
              <input
                type="number"
                min="50"
                max="1000"
                step="10"
                value={potassium}
                onChange={(e) => setPotassium(parseInt(e.target.value) || 250)}
                className="w-full bg-[#EEF3F8] border border-[#D5DEE8] text-[#0A2540] font-bold text-sm rounded-xl px-3 py-2"
              />
            </div>

            {/* Parameter 7: Zinc (Zn) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0A2540]">
                  ७. उपलब्ध जस्त / झिंक (Zn ppm):
                </label>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${zinc < 0.6 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {zinc < 0.6 ? 'कमतरता (Deficient < 0.6)' : 'पुरेसे (Sufficient)'}
                </span>
              </div>
              <input
                type="number"
                min="0.1"
                max="10.0"
                step="0.05"
                value={zinc}
                onChange={(e) => setZinc(parseFloat(e.target.value) || 0.5)}
                className="w-full bg-[#EEF3F8] border border-[#D5DEE8] text-[#0A2540] font-bold text-sm rounded-xl px-3 py-2"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Calculations & Commercial Fertilizer Bag Plan */}
        <div className="lg:col-span-7 space-y-4">
          {calculation && (
            <>
              {/* Soil Health Diagnostic Insight Card */}
              <Card variant="white" padding="md" className="border-[#D5DEE8] space-y-2.5">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#5B6B7D] flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#0A2540]" />
                  <span>जमीन आरोग्य व सुधारणा सल्ला (Soil Health Insights)</span>
                </h4>
                <p className="text-xs text-[#0A2540] font-medium leading-relaxed">
                  {phClassification.advisory[language] || phClassification.advisory.mr}
                </p>
                {calculation.soilRatings.ocRating === 'Low' && (
                  <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 font-semibold">
                    सेंद्रिय कर्ब कमी आहे ({oc}%): प्रति एकरी किमान ४ ते ५ टन चांगले कुजलेले शेणखत किंवा कंपोस्ट मिसळल्यास खतांची कार्यक्षमता दुपटीने वाढेल.
                  </p>
                )}
              </Card>

              {/* Elemental Nutrient Requirement Summary */}
              <Card variant="white" padding="md" className="border-[#D5DEE8]">
                <div className="text-xs font-extrabold text-[#5B6B7D] uppercase tracking-wider mb-2">
                  {acres} एकरासाठी प्रत्यक्ष शुद्ध अन्नद्रव्यांची गरज (Adjusted N-P-K):
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-[11px] font-bold text-blue-700 block">नत्र (N)</span>
                    <span className="text-lg font-black text-blue-900">
                      {calculation.adjustedNutrientRequirementKg.n} <span className="text-xs">कि.ग्रॅ.</span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[11px] font-bold text-emerald-700 block">स्फुरद (P₂O₅)</span>
                    <span className="text-lg font-black text-emerald-900">
                      {calculation.adjustedNutrientRequirementKg.p} <span className="text-xs">कि.ग्रॅ.</span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200">
                    <span className="text-[11px] font-bold text-orange-700 block">पालाश (K₂O)</span>
                    <span className="text-lg font-black text-orange-900">
                      {calculation.adjustedNutrientRequirementKg.k} <span className="text-xs">कि.ग्रॅ.</span>
                    </span>
                  </div>
                </div>
              </Card>

              {/* Commercial Fertilizer Bag Plan Card */}
              <Card variant="white" padding="lg" className="border-[#D5DEE8] space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D5DEE8]">
                  <div>
                    <h3 className="font-extrabold text-base text-[#0A2540]">
                      बाजारातील गोण्यांचे अचूक प्रमाण (Commercial Fertilizer Bags)
                    </h3>
                    <p className="text-xs text-[#5B6B7D]">
                      दुकानदाराकडून कोणत्या गोण्या किती खरेदी कराव्यात:
                    </p>
                  </div>

                  {/* Plan Switcher Tabs */}
                  <div className="flex items-center gap-1 bg-[#EEF3F8] p-1 rounded-xl border border-[#D5DEE8] shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanTab('optionDap')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                        selectedPlanTab === 'optionDap'
                          ? 'bg-[#0A2540] text-white shadow-xs'
                          : 'text-[#5B6B7D] hover:text-[#0A2540]'
                      }`}
                    >
                      पर्याय अ: DAP
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPlanTab('optionSsp')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                        selectedPlanTab === 'optionSsp'
                          ? 'bg-[#0A2540] text-white shadow-xs'
                          : 'text-[#5B6B7D] hover:text-[#0A2540]'
                      }`}
                    >
                      पर्याय ब: SSP
                    </button>
                  </div>
                </div>

                {/* Selected Plan Details */}
                {selectedPlanTab === 'optionDap' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* DAP Bag */}
                      <div className="p-3 rounded-2xl bg-[#EEF3F8] border border-[#D5DEE8] text-center">
                        <span className="text-[10px] font-bold text-[#5B6B7D] block">डीएपी (DAP 18:46:0)</span>
                        <span className="text-2xl font-black text-[#0A2540]">
                          {calculation.recommendedBagsOptionDap.dapBags50kg}
                        </span>
                        <span className="text-xs font-bold text-[#5B6B7D] block">गोण्या (५० किलो)</span>
                      </div>

                      {/* Urea Bag */}
                      <div className="p-3 rounded-2xl bg-[#EEF3F8] border border-[#D5DEE8] text-center">
                        <span className="text-[10px] font-bold text-[#5B6B7D] block">युरिया (Urea 46% N)</span>
                        <span className="text-2xl font-black text-[#0A2540]">
                          {calculation.recommendedBagsOptionDap.ureaBags45kg}
                        </span>
                        <span className="text-xs font-bold text-[#5B6B7D] block">गोण्या (४५ किलो)</span>
                      </div>

                      {/* MOP Bag */}
                      <div className="p-3 rounded-2xl bg-[#EEF3F8] border border-[#D5DEE8] text-center">
                        <span className="text-[10px] font-bold text-[#5B6B7D] block">पोटॅश (MOP 60% K₂O)</span>
                        <span className="text-2xl font-black text-[#0A2540]">
                          {calculation.recommendedBagsOptionDap.mopBags50kg}
                        </span>
                        <span className="text-xs font-bold text-[#5B6B7D] block">गोण्या (५० किलो)</span>
                      </div>
                    </div>

                    {calculation.recommendedBagsOptionDap.zincSulfateKg && (
                      <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-700 shrink-0" />
                        <span>
                          जमिनीत झिंकची कमतरता आहे: पेरणीवेळी <strong>झिंक सल्फेट (२१% Zn) {calculation.recommendedBagsOptionDap.zincSulfateKg} किलो</strong> जमिनीत मिसळा.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* SSP Bag */}
                      <div className="p-3 rounded-2xl bg-[#EEF3F8] border border-[#D5DEE8] text-center">
                        <span className="text-[10px] font-bold text-[#5B6B7D] block">सिंगल सुपर फॉस्फेट (SSP)</span>
                        <span className="text-2xl font-black text-[#0A2540]">
                          {calculation.recommendedBagsOptionSsp.sspBags50kg}
                        </span>
                        <span className="text-xs font-bold text-[#5B6B7D] block">गोण्या (५० किलो)</span>
                      </div>

                      {/* Urea Bag */}
                      <div className="p-3 rounded-2xl bg-[#EEF3F8] border border-[#D5DEE8] text-center">
                        <span className="text-[10px] font-bold text-[#5B6B7D] block">युरिया (Urea 46% N)</span>
                        <span className="text-2xl font-black text-[#0A2540]">
                          {calculation.recommendedBagsOptionSsp.ureaBags45kg}
                        </span>
                        <span className="text-xs font-bold text-[#5B6B7D] block">गोण्या (४५ किलो)</span>
                      </div>

                      {/* MOP Bag */}
                      <div className="p-3 rounded-2xl bg-[#EEF3F8] border border-[#D5DEE8] text-center">
                        <span className="text-[10px] font-bold text-[#5B6B7D] block">पोटॅश (MOP 60% K₂O)</span>
                        <span className="text-2xl font-black text-[#0A2540]">
                          {calculation.recommendedBagsOptionSsp.mopBags50kg}
                        </span>
                        <span className="text-xs font-bold text-[#5B6B7D] block">गोण्या (५० किलो)</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#138808] bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-bold">
                      विशेष फायदा: SSP वापरल्याने जमिनीत ११% गंधक (Sulfur) व १९% कॅल्शियम मोफत मिळते, ज्यामुळे चुनखडीयुक्त काळ्या जमिनीत बोंडे व दाण्यांची प्रत सुधारते.
                    </p>
                  </div>
                )}

                {/* Application Timeline Schedule */}
                <div className="pt-3 border-t border-[#D5DEE8] space-y-2">
                  <h4 className="font-extrabold text-xs text-[#0A2540] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#138808]" />
                    <span>खतांच्या मात्रा विभागून देण्याचे वेळापत्रक (Split Schedule)</span>
                  </h4>

                  <div className="space-y-2">
                    {calculation.applicationTimeline.map((step, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#EEF3F8]/60 border border-[#D5DEE8] text-xs space-y-1">
                        <div className="flex items-center justify-between font-extrabold text-[#0A2540]">
                          <span>{step.stageTitle[language] || step.stageTitle.mr}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-[#D5DEE8] text-[#5B6B7D]">
                            {step.daysTiming}
                          </span>
                        </div>
                        <p className="text-[#5B6B7D] font-medium">
                          {selectedPlanTab === 'optionDap'
                            ? step.dapOptionInstruction[language] || step.dapOptionInstruction.mr
                            : step.sspOptionInstruction[language] || step.sspOptionInstruction.mr}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Source Citation */}
                <div className="pt-2 text-[11px] text-[#5B6B7D] border-t border-[#D5DEE8]/60">
                  <span className="font-bold">आधार:</span> {calculation.crop.sourceDoc} ({calculation.crop.sourceAuthority})
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          <strong>महत्त्वाची नोंद:</strong> खतांचे वरील प्रमाण हे डॉ. पंदेकृवि, अकोला यांच्या मृदा चाचणी आधारित खत शिफारशीवर (STCR) आधारलेले आहे. स्फुरदयुक्त व पोटॅशयुक्त खते नेहमी पेरणीवेळी बियाण्याखाली ५ सें.मी. खोल पडतील अशी द्यावीत. युरिया नेहमी ओलावा असतानाच जमिनीत झाकून द्यावा.
        </p>
      </div>
    </div>
  );
};

export default SoilHealth;
