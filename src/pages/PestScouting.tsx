import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  BookOpen, 
  Calendar, 
  RotateCcw, 
  Save, 
  Trash2, 
  CheckCircle2, 
  ExternalLink,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  VERIFIED_ETL_RULES, 
  PestEtlRule, 
  evaluatePestScouting, 
  EtlEvaluationResult 
} from '../lib/etlData';

const SCOUTING_STORAGE_KEY = 'krushiscan_scouting_history';

interface SavedScoutingRecord {
  id: string;
  ruleId: string;
  cropName: string;
  pestName: string;
  date: string;
  samplesCount: number;
  totalPestObserved: number;
  calculatedAverage: number;
  unitLabel: string;
  status: 'BELOW_ETL' | 'APPROACHING_ETL' | 'ABOVE_ETL' | 'DATA_INSUFFICIENT';
  statusHeadline: string;
}

export const PestScouting: React.FC = () => {
  const { language } = useLanguage();

  const [selectedCrop, setSelectedCrop] = useState<'cotton' | 'soybean' | 'tur' | 'chana' | 'citrus'>('cotton');
  const availableRules = VERIFIED_ETL_RULES.filter((r) => r.cropId === selectedCrop);
  
  const [selectedRuleId, setSelectedRuleId] = useState<string>(availableRules[0]?.id || 'cotton-jassids');

  // Input states
  const activeRule = VERIFIED_ETL_RULES.find((r) => r.id === selectedRuleId) || VERIFIED_ETL_RULES[0];
  const [samplesCount, setSamplesCount] = useState<number>(activeRule.minRecommendedSamples);
  const [totalPestObserved, setTotalPestObserved] = useState<number>(0);

  // History state
  const [history, setHistory] = useState<SavedScoutingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(SCOUTING_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  // When crop or rule changes, synchronize initial sample count
  useEffect(() => {
    const defaultRule = VERIFIED_ETL_RULES.find((r) => r.cropId === selectedCrop);
    if (defaultRule) {
      setSelectedRuleId(defaultRule.id);
      setSamplesCount(defaultRule.minRecommendedSamples);
      setTotalPestObserved(0);
    }
  }, [selectedCrop]);

  useEffect(() => {
    setSamplesCount(activeRule.minRecommendedSamples);
    setTotalPestObserved(0);
  }, [selectedRuleId]);

  // Evaluate ETL
  let evaluation: EtlEvaluationResult | null = null;
  try {
    evaluation = evaluatePestScouting(selectedRuleId, Math.max(1, samplesCount), Math.max(0, totalPestObserved));
  } catch (err) {
    console.warn('ETL evaluation computation error:', err);
  }

  const handleSaveObservation = () => {
    if (!evaluation) return;

    const record: SavedScoutingRecord = {
      id: 'scout-' + Date.now(),
      ruleId: evaluation.rule.id,
      cropName: evaluation.rule.cropName[language] || evaluation.rule.cropName.mr,
      pestName: evaluation.rule.pestName[language] || evaluation.rule.pestName.mr,
      date: new Date().toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      samplesCount: evaluation.samplesCount,
      totalPestObserved: evaluation.totalPestObserved,
      calculatedAverage: evaluation.calculatedAverage,
      unitLabel: evaluation.rule.unitLabel[language] || evaluation.rule.unitLabel.mr,
      status: evaluation.status,
      statusHeadline: evaluation.statusHeadline[language] || evaluation.statusHeadline.mr,
    };

    const updated = [record, ...history.slice(0, 19)]; // Keep latest 20
    setHistory(updated);
    try {
      localStorage.setItem(SCOUTING_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not save scouting record to localStorage:', err);
    }

    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 3000);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem(SCOUTING_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not update scouting records:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'BELOW_ETL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>ईटीएल खाली (सुरक्षित)</span>
          </span>
        );
      case 'APPROACHING_ETL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>दक्षता पातळी (Warning)</span>
          </span>
        );
      case 'ABOVE_ETL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
            <AlertOctagon className="w-4 h-4 text-red-700" />
            <span>ईटीएल ओलांडली (Action Required)</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#0B5137] text-white flex items-center justify-center shadow-xs">
              <Bug className="w-6 h-6 text-[#E9A23B]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#152D24] tracking-tight">
                कीड सर्वेक्षण व ईटीएल गणक
              </h1>
              <p className="text-xs sm:text-sm text-[#5F7065] font-medium">
                PDKV अकोला व ICAR प्रमाणित आर्थिक नुकसान पातळी (ETL) निर्णय प्रणाली
              </p>
            </div>
          </div>
        </div>

        {/* Scientific Authority Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#DDE8DC] text-xs font-bold text-[#152D24] shadow-xs shrink-0">
          <BookOpen className="w-4 h-4 text-[#2F9E59]" />
          <span>डॉ. पंदेकृवि, अकोला शिफारस</span>
        </div>
      </div>

      {/* Crop Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'cotton', label: 'कापूस (Cotton)', icon: '🌱' },
          { id: 'soybean', label: 'सोयाबीन (Soybean)', icon: '🌿' },
          { id: 'tur', label: 'तूर (Pigeon Pea)', icon: '🌾' },
          { id: 'chana', label: 'हरभरा (Gram / Chana)', icon: '🌱' },
          { id: 'citrus', label: 'संत्रा / मोसंबी (Citrus)', icon: '🍊' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCrop(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition border flex items-center gap-2 ${
              selectedCrop === tab.id
                ? 'bg-[#0B5137] text-white border-[#0B5137] shadow-xs'
                : 'bg-white text-[#5F7065] border-[#DDE8DC] hover:bg-[#E6F2E5] hover:text-[#0B5137]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Pest Rule Selection for Chosen Crop */}
      <Card variant="white" padding="md" className="border-[#DDE8DC] space-y-3">
        <label className="block text-xs font-bold text-[#152D24] uppercase tracking-wider">
          कीड प्रकार निवडा (Select Target Pest):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {availableRules.map((rule) => (
            <button
              key={rule.id}
              type="button"
              onClick={() => setSelectedRuleId(rule.id)}
              className={`p-3.5 rounded-2xl text-left border transition flex flex-col justify-between gap-1.5 ${
                selectedRuleId === rule.id
                  ? 'bg-[#E6F2E5] border-[#0B5137] ring-2 ring-[#0B5137]/20'
                  : 'bg-white border-[#DDE8DC] hover:border-[#2F9E59]'
              }`}
            >
              <div className="font-extrabold text-sm text-[#152D24]">
                {rule.pestName[language] || rule.pestName.mr}
              </div>
              <div className="text-[11px] text-[#5F7065] italic">
                {rule.pestName.scientific}
              </div>
              <div className="text-[11px] font-bold text-[#2F9E59] pt-1 border-t border-[#DDE8DC]/60">
                ईटीएल: {rule.thresholdDisplay[language] || rule.thresholdDisplay.mr}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Main Scouting Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sampling Protocol & Input Steppers */}
        <div className="lg:col-span-6 space-y-5">
          {/* Sampling Protocol Card */}
          <Card variant="white" padding="lg" className="border-[#DDE8DC] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#E6F2E5] text-[#0B5137] flex items-center justify-center shrink-0 border border-[#DDE8DC]">
                <Info className="w-4 h-4 text-[#2F9E59]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#152D24]">
                  शास्त्रोक्त नमुना पद्धत (Sampling Protocol)
                </h3>
                <p className="text-xs text-[#5F7065] mt-1 leading-relaxed font-medium">
                  {activeRule.samplingMethod[language] || activeRule.samplingMethod.mr}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F6F8F0] border border-[#DDE8DC] text-xs text-[#152D24] flex items-center justify-between">
              <span className="font-semibold text-[#5F7065]">लक्ष्य पीक अवस्था:</span>
              <span className="font-extrabold text-[#152D24]">
                {activeRule.targetCropStage[language] || activeRule.targetCropStage.mr}
              </span>
            </div>
          </Card>

          {/* Stepper Inputs Card */}
          <Card variant="white" padding="lg" className="border-[#DDE8DC] space-y-5">
            <h3 className="font-bold text-base text-[#152D24] flex items-center gap-2">
              <Bug className="w-5 h-5 text-[#E9A23B]" />
              <span>प्रत्यक्ष शेतातील निरीक्षणे (Field Counts)</span>
            </h3>

            {/* Input 1: Sample Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#152D24]">
                  तपासलेले नमुने / झाडे / दिवस (Samples Inspected):
                </label>
                <span className="text-xs font-bold text-[#5F7065]">
                  किमान शिफारस: {activeRule.minRecommendedSamples}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSamplesCount((prev) => Math.max(1, prev - 1))}
                  className="w-12 h-12 rounded-2xl bg-[#F6F8F0] border border-[#DDE8DC] text-xl font-bold text-[#152D24] hover:bg-[#E6F2E5] active:scale-95 transition"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={samplesCount}
                  onChange={(e) => setSamplesCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 text-center font-extrabold text-lg py-2.5 bg-white border border-[#DDE8DC] rounded-2xl text-[#152D24] focus:ring-2 focus:ring-[#0B5137] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setSamplesCount((prev) => prev + 1)}
                  className="w-12 h-12 rounded-2xl bg-[#F6F8F0] border border-[#DDE8DC] text-xl font-bold text-[#152D24] hover:bg-[#E6F2E5] active:scale-95 transition"
                >
                  +
                </button>
              </div>
              {samplesCount < activeRule.minRecommendedSamples && (
                <p className="text-[11px] text-[#C83E3E] font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  विश्वसनीय निष्कर्षासाठी किमान {activeRule.minRecommendedSamples} नमुने तपासणे आवश्यक आहे.
                </p>
              )}
            </div>

            {/* Input 2: Total Pest Count */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#152D24]">
                  एकूण आढळलेली कीड / पतंग संख्या (Total Pests Observed):
                </label>
                <span className="text-xs font-bold text-[#2F9E59]">
                  {activeRule.unitLabel[language] || activeRule.unitLabel.mr}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTotalPestObserved((prev) => Math.max(0, prev - 1))}
                  className="w-12 h-12 rounded-2xl bg-[#F6F8F0] border border-[#DDE8DC] text-xl font-bold text-[#152D24] hover:bg-[#E6F2E5] active:scale-95 transition"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={totalPestObserved}
                  onChange={(e) => setTotalPestObserved(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 text-center font-extrabold text-lg py-2.5 bg-white border border-[#DDE8DC] rounded-2xl text-[#152D24] focus:ring-2 focus:ring-[#0B5137] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setTotalPestObserved((prev) => prev + 1)}
                  className="w-12 h-12 rounded-2xl bg-[#F6F8F0] border border-[#DDE8DC] text-xl font-bold text-[#152D24] hover:bg-[#E6F2E5] active:scale-95 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={() => {
                setSamplesCount(activeRule.minRecommendedSamples);
                setTotalPestObserved(0);
              }}
              className="text-xs text-[#5F7065] hover:text-[#0B5137] flex items-center gap-1 font-bold underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              निरीक्षणे पूर्ववत करा (Reset)
            </button>
          </Card>
        </div>

        {/* Right Column: Live Calculation Result & Action Advisory */}
        <div className="lg:col-span-6 space-y-5">
          {evaluation && (
            <Card variant="white" padding="lg" className="border-[#DDE8DC] space-y-5 shadow-xs">
              {/* Verdict Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#DDE8DC]">
                <div>
                  <span className="text-xs font-bold text-[#5F7065] uppercase tracking-wider block">
                    ईटीएल मूल्यमापन निष्कर्ष
                  </span>
                  <h3 className="text-lg font-black text-[#152D24] mt-0.5">
                    {evaluation.statusHeadline[language] || evaluation.statusHeadline.mr}
                  </h3>
                </div>
                <div>{getStatusBadge(evaluation.status)}</div>
              </div>

              {/* Numerical Breakdown Box */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F6F8F0] border border-[#DDE8DC]">
                <div>
                  <span className="text-xs text-[#5F7065] font-bold block">नोंदवलेली सरासरी</span>
                  <span className="text-xl font-black text-[#152D24]">
                    {evaluation.calculatedAverage}{' '}
                    <span className="text-xs font-bold text-[#5F7065]">
                      {evaluation.rule.unitLabel[language] || evaluation.rule.unitLabel.mr}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#5F7065] font-bold block">अधिकृत ईटीएल मर्यादा</span>
                  <span className="text-xl font-black text-[#21864A]">
                    {evaluation.rule.etlThreshold}{' '}
                    <span className="text-xs font-bold text-[#5F7065]">
                      {evaluation.rule.unitLabel[language] || evaluation.rule.unitLabel.mr}
                    </span>
                  </span>
                </div>
              </div>

              {/* Progress Gauge against ETL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#152D24]">ईटीएल प्रमाण (ETL Level)</span>
                  <span
                    className={
                      evaluation.status === 'ABOVE_ETL'
                        ? 'text-[#C83E3E]'
                        : evaluation.status === 'APPROACHING_ETL'
                        ? 'text-[#E9A23B]'
                        : 'text-[#21864A]'
                    }
                  >
                    {evaluation.percentageOfEtl}%
                  </span>
                </div>
                <div className="h-3 w-full bg-[#E6F2E5] rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      evaluation.status === 'ABOVE_ETL'
                        ? 'bg-[#C83E3E]'
                        : evaluation.status === 'APPROACHING_ETL'
                        ? 'bg-[#E9A23B]'
                        : 'bg-[#21864A]'
                    }`}
                    style={{ width: `${Math.min(100, evaluation.percentageOfEtl)}%` }}
                  />
                </div>
              </div>

              {/* Action Advisory Box */}
              <div
                className={`p-4 rounded-2xl border leading-relaxed text-sm ${
                  evaluation.status === 'ABOVE_ETL'
                    ? 'bg-red-50/60 border-red-200 text-red-900'
                    : evaluation.status === 'APPROACHING_ETL'
                    ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                    : 'bg-[#E6F2E5] border-[#DDE8DC] text-[#0B5137]'
                }`}
              >
                <div className="font-extrabold text-xs uppercase tracking-wider mb-1.5">
                  कृषी विद्यापीठ शिफारस (PDKV Agronomic Advice):
                </div>
                <p className="whitespace-pre-line font-medium text-xs sm:text-sm">
                  {evaluation.actionAdvisory[language] || evaluation.actionAdvisory.mr}
                </p>
              </div>

              {/* Save Observation Button */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  className="flex-1 bg-[#0B5137] hover:bg-[#073D2A] text-white"
                  leftIcon={<Save className="w-4 h-4 text-[#E9A23B]" />}
                  onClick={handleSaveObservation}
                >
                  निरीक्षण जतन करा (Save Record)
                </Button>
              </div>

              {savedSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[#21864A]" />
                  <span>निरीक्षण यशस्वीपणे जतन झाले आहे! खालील इतिहासात नोंद झाली.</span>
                </div>
              )}

              {/* Source & Citation Footer */}
              <div className="pt-3 border-t border-[#DDE8DC] text-[11px] text-[#5F7065] space-y-1">
                <div>
                  <span className="font-bold">आधार:</span> {evaluation.rule.sourceDoc} ({evaluation.rule.sourceAuthority})
                </div>
                <div>
                  <span className="font-bold">सुधारणा वर्ष:</span> {evaluation.rule.revisionDate}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Saved Scouting History Section */}
      <div className="pt-6 border-t border-[#DDE8DC] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#152D24] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#2F9E59]" />
            <span>माझे कीड सर्वेक्षण इतिहास (Field Scouting History)</span>
          </h2>
          <span className="text-xs font-bold text-[#5F7065]">
            एकूण नोंदी: {history.length}
          </span>
        </div>

        {history.length === 0 ? (
          <Card variant="white" padding="lg" className="border-[#DDE8DC] text-center p-8 space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#E6F2E5] text-[#5F7065] flex items-center justify-center mx-auto">
              <Bug className="w-6 h-6 text-[#2F9E59]" />
            </div>
            <h4 className="font-bold text-sm text-[#152D24]">कोणतीही नोंद उपलब्ध नाही</h4>
            <p className="text-xs text-[#5F7065]">
              वर दिलेल्या गणकात नमुने भरून "निरीक्षण जतन करा" बटणावर क्लिक करा.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {history.map((record) => (
              <Card key={record.id} variant="white" padding="md" className="border-[#DDE8DC] space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black text-[#5F7065] uppercase tracking-wider block">
                      {record.cropName} • {record.date}
                    </span>
                    <h4 className="font-extrabold text-sm text-[#152D24]">
                      {record.pestName}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteRecord(record.id)}
                    className="p-1.5 text-slate-400 hover:text-[#C83E3E] rounded-lg"
                    title="हटवा"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#DDE8DC]/60">
                  <span className="font-bold text-[#152D24]">
                    सरासरी: {record.calculatedAverage} {record.unitLabel}
                  </span>
                  <div>{getStatusBadge(record.status)}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Statutory Disclaimer Note */}
      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          <strong>वैधानिक इशारा:</strong> ईटीएल (आर्थिक नुकसान पातळी) हे शेतातील कीड व्यवस्थापनासाठीचे वैज्ञानिक मार्गदर्शक मूल्य आहे. ईटीएल खाली असताना रासायनिक कीटकनाशकांची फवारणी टाळल्याने उत्पादन खर्चात बचत होते व मित्रकीटकांचे संवर्धन होते. प्रत्यक्ष फवारणीपूर्वी स्थानिक कृषी सहाय्यक किंवा KVK शास्त्रज्ञांचा सल्ला घ्यावा.
        </p>
      </div>
    </div>
  );
};

export default PestScouting;
