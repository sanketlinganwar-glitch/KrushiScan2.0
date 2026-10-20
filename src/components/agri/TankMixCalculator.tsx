import React, { useState, useMemo } from 'react';
import { 
  FlaskConical, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Info, 
  RotateCcw,
  BookOpen,
  Droplets,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  VIDARBHA_CHEMICAL_REGISTRY, 
  evaluateTankMix 
} from '../../lib/tankMixData';
import { ChemicalCategory, ChemicalItem } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface TankMixCalculatorProps {
  initialChemicalIds?: string[];
  embedded?: boolean;
}

export const TankMixCalculator: React.FC<TankMixCalculatorProps> = ({ 
  initialChemicalIds = ['copper-oxychloride-wp', 'streptocycline-sp'],
  embedded = false 
}) => {
  const { language } = useLanguage();

  const [selectedIds, setSelectedIds] = useState<string[]>(initialChemicalIds);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<ChemicalCategory | 'all'>('all');
  const [showJarTestGuide, setShowJarTestGuide] = useState(false);
  const [showAllChemicalsModal, setShowAllChemicalsModal] = useState(false);

  // Evaluate the mix based on current selections
  const evaluation = useMemo(() => {
    return evaluateTankMix(selectedIds);
  }, [selectedIds]);

  const handleToggleChemical = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert(
          language === 'mr'
            ? 'एका वेळी कमाल ४ उत्पादने निवडता येतात.'
            : language === 'hi'
            ? 'एक समय में अधिकतम 4 उत्पाद चुने जा सकते हैं।'
            : 'Maximum 4 products can be selected simultaneously.'
        );
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveChemical = (id: string) => {
    setSelectedIds(selectedIds.filter((item) => item !== id));
  };

  const handleReset = () => {
    setSelectedIds([]);
  };

  const handleApplyPreset = (ids: string[]) => {
    setSelectedIds(ids);
  };

  // Filter chemicals
  const filteredChemicals = useMemo(() => {
    if (activeCategoryFilter === 'all') return VIDARBHA_CHEMICAL_REGISTRY;
    return VIDARBHA_CHEMICAL_REGISTRY.filter((c) => c.category === activeCategoryFilter);
  }, [activeCategoryFilter]);

  // Status visual variants
  const statusConfig = {
    verified_compatible: {
      bg: 'bg-gradient-to-r from-emerald-900 to-teal-900 text-white border-emerald-600',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      jarColor: 'from-emerald-400 to-teal-300',
      statusText: { mr: 'सुसंगत व सुरक्षित (Verified Compatible)', hi: 'अनुकूल एवं सुरक्षित (Verified)', en: 'Verified Compatible' },
    },
    incompatible: {
      bg: 'bg-gradient-to-r from-rose-950 to-red-900 text-white border-rose-600',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400',
      icon: XCircle,
      iconColor: 'text-rose-400',
      jarColor: 'from-rose-500 to-red-600',
      statusText: { mr: 'धोकादायक! एकत्र मिसळू नका (Incompatible)', hi: 'असंगत! साथ न मिलाएं (Incompatible)', en: 'Incompatible Mixture' },
    },
    caution_jar_test: {
      bg: 'bg-gradient-to-r from-amber-950 to-orange-900 text-white border-amber-600',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      jarColor: 'from-amber-400 to-orange-400',
      statusText: { mr: 'सावधगिरी: जार चाचणी आवश्यक (Caution)', hi: 'सावधानी: जार टेस्ट जरूरी (Caution)', en: 'Caution / Jar Test Required' },
    },
    unverified: {
      bg: 'bg-gradient-to-r from-slate-900 to-blue-950 text-white border-slate-600',
      badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-400',
      icon: HelpCircle,
      iconColor: 'text-slate-300',
      jarColor: 'from-slate-400 to-blue-400',
      statusText: { mr: 'सुसंगतता असत्यापित (Not Verified)', hi: 'अनुकूलता असत्यापित (Not Verified)', en: 'Compatibility Not Verified' },
    },
  }[evaluation.overallStatus];

  const StatusIcon = statusConfig.icon;

  // Evidence badge styling and localization helper
  const getEvidenceBadge = (evidenceType?: string) => {
    switch (evidenceType) {
      case 'university_recommendation':
        return {
          label: { 
            mr: 'कृषी विद्यापीठ शिफारस (University POP)', 
            hi: 'विश्वविद्यालय अनुशंसा (University POP)', 
            en: 'University Package of Practices' 
          },
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400',
        };
      case 'statutory_label_leaflet':
        return {
          label: { 
            mr: 'CIBRC वैधानिक लेबल (Statutory Label)', 
            hi: 'CIBRC वैधानिक लेबल (Statutory Label)', 
            en: 'CIBRC Approved Product Label' 
          },
          bg: 'bg-teal-500/20 text-teal-300 border-teal-400',
        };
      case 'incompatibility_science':
        return {
          label: { 
            mr: 'रासायनिक विसंगती विज्ञान (Incompatibility Science)', 
            hi: 'रासायनिक असंगतता (Incompatibility Science)', 
            en: 'Incompatibility Science (Precipitation / Hydrolysis)' 
          },
          bg: 'bg-rose-500/20 text-rose-300 border-rose-400',
        };
      case 'conditional_field_practice':
        return {
          label: { 
            mr: 'शेतकरी पद्धत - जार चाचणी आवश्यक', 
            hi: 'प्रचलित प्रथा - जार टेस्ट जरूरी', 
            en: 'Conditional Field Practice (Jar Test Req.)' 
          },
          bg: 'bg-amber-500/20 text-amber-300 border-amber-400',
        };
      default:
        return {
          label: { 
            mr: 'सुसंगतता असत्यापित (Unverified)', 
            hi: 'अनुकूलता असत्यापित (Unverified)', 
            en: 'Compatibility Not Verified' 
          },
          bg: 'bg-slate-500/20 text-slate-300 border-slate-400',
        };
    }
  };

  const jarTestSteps = {
    mr: [
      'एका पारदर्शक १ लिटर काचेच्या किंवा प्लास्टिकच्या बाटलीत ५०० मिली शेताचे पाणी घ्या.',
      'W.A.L.E.S. क्रमाने सर्व औषधांचे प्रमाणबद्ध थेंब किंवा चिमूटभर पावडर बाटलीत टाका.',
      'बाटलीचे झाकण लावून १० वेळा चांगली हलवा आणि १५ मिनिटे स्थिर ठेवा.',
      'निरीक्षण करा: जर पाणी दुधासारखे एकसंध राहिले तर औषध भौतिकदृष्ट्या योग्य आहे. जर तळाशी घट्ट साका (Curdling) जमा झाला, तेल वेगळे तरंगू लागले, किंवा बाटली गरम झाली, तर हे मिश्रण पंपात कधीही वापरू नका!',
    ],
    hi: [
      'एक पारदर्शी 1 लीटर कांच या प्लास्टिक की बोतल में 500 मिली खेत का पानी लें।',
      'W.A.L.E.S. क्रम के अनुसार सभी दवाओं की आनुपातिक बूंदें या चुटकी भर पाउडर बोतल में डालें।',
      'बोतल का ढक्कन बंद कर 10 बार अच्छी तरह हिलाएं और 15 मिनट के लिए स्थिर रख दें।',
      'निरीक्षण करें: यदि पानी दूध जैसा एकसमान रहता है तो मिश्रण भौतिक रूप से सही है। यदि नीचे गाढ़ा थक्का (Curdling) जमे, तेल अलग तैरे, या बोतल गर्म हो, तो यह मिश्रण कभी न छिड़कें!',
    ],
    en: [
      'Take 500 ml of your actual farm/well water in a transparent 1-liter glass or clean plastic container.',
      'Add proportionate drops or pinch quantities of each chemical following the W.A.L.E.S. sequence.',
      'Cap tightly, invert or shake 10 times to mix thoroughly, then let it stand undisturbed for 15 minutes.',
      'Inspect: If solution remains uniformly suspended like milk, physical compatibility is verified. If flocculation, curdling, curd-like sludge, surface oil separation, or exothermic heat occurs, NEVER spray this mix!',
    ],
  };

  const jarTestLimits = {
    mr: {
      title: 'जार चाचणीची वैज्ञानिक मर्यादा (५ महत्त्वाचे पैलू):',
      desc: 'जार चाचणी केवळ (१) भौतिक सुसंगतता (विरघळणे/गाठी न होणे) तपासते. ती (२) रासायनिक स्थिरता (विघटन न होणे), (३) पीक सुरक्षितता (करपा न येणे), (४) जैविक परिणामकारकता (कीड नियंत्रण क्षमता) किंवा (५) वैधानिक नोंदणी (CIBRC लेबल मंजुरी) सिद्ध करत नाही. नवीन मिश्रणाची नेहमी उत्पादनाच्या लेबल निर्देशानुसार शेतातील २ ते ३ झाडांवर आधी चाचणी करावी.',
    },
    hi: {
      title: 'जार परीक्षण की वैज्ञानिक सीमाएं (5 प्रमुख आयाम):',
      desc: 'जार टेस्ट केवल (1) भौतिक अनुकूलता (घुलनशीलता/थक्का न बनना) की पुष्टि करता है। यह (2) रासायनिक स्थिरता, (3) फसल सुरक्षा (झुलसा न आना), (4) जैविक प्रभावशीलता या (5) वैधानिक पंजीकरण प्रमाणित नहीं करता। उपयोग से पहले उत्पाद लेबल पढ़ें और 2-3 पौधों पर परीक्षण करें।',
    },
    en: {
      title: 'Scientific & Statutory Limitations of the Jar Test (5 Dimensions):',
      desc: 'A jar test validates ONLY (1) Physical Compatibility (dissolution/absence of curdling). It does NOT confirm (2) Chemical Stability (active ingredient degradation), (3) Crop Safety (prevention of foliar phytotoxicity), (4) Biological Efficacy (retained pest control), or (5) Statutory Regulatory Approval (CIBRC registration). Always adhere to product labels and perform a micro-trial on 2 to 3 plants prior to full field application.',
    },
  };

  return (
    <div className={`space-y-6 ${embedded ? '' : 'max-w-5xl mx-auto'}`}>
      {/* Header Banner */}
      <div className="bg-[#0B5137] text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-[#073D2A] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-[#2F9E59]/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <FlaskConical className="w-6 h-6 text-[#2F9E59]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {language === 'mr' ? 'रासायनिक टँक-मिक्स सुसंगतता कॅल्क्युलेटर' : language === 'hi' ? 'कृषि रसायन टैंक-मिक्स अनुकूलता कैलकुलेटर' : 'Chemical & Fertilizer Tank-Mix Compatibility'}
                </h2>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#2F9E59]/30 text-white border border-[#2F9E59]/40 uppercase">
                  PDKV / ICAR / CIBRC मार्गदर्शक
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium leading-relaxed max-w-2xl">
                {language === 'mr'
                  ? 'कीटकनाशके, बुरशीनाशके आणि विद्राव्य खते एकत्र मिसळताना औषध फुटणे (साका होणे) किंवा झाडावर करपा येणे टाळण्यासाठी वैज्ञानिक तपासणी करा.'
                  : language === 'hi'
                  ? 'कीटनाशक, फफूंदनाशी एवं घुलनशील खाद का मिश्रण करने से पहले वैज्ञानिक अनुकूलता एवं मिलाने का सही क्रम जांचें।'
                  : 'Verify physical and chemical compatibility of tank mixtures, preventing precipitation, chemical curdling, and crop phytotoxicity.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {selectedIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-slate-500 text-slate-200 hover:bg-slate-800 text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                {language === 'mr' ? 'रीसेट' : language === 'hi' ? 'रीसेट' : 'Clear'}
              </Button>
            )}
          </div>
        </div>

        {/* Quick Presets for Farmers */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <span className="text-xs font-bold text-slate-300 block mb-2">
            {language === 'mr' ? 'विदर्भातील प्रचलित फवारणी उदाहरणे (क्लिक करून पहा):' : language === 'hi' ? 'विदर्भ के मुख्य छिड़काव संयोजन (क्लिक करके जांचें):' : 'Common Vidarbha Field Mixtures (Click to test):'}
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            <button
              onClick={() => handleApplyPreset(['copper-oxychloride-wp', 'streptocycline-sp'])}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold whitespace-nowrap transition border border-white/10 flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{language === 'mr' ? 'कापूस करपा: COC + स्ट्रेप्टोसायक्लीन' : language === 'hi' ? 'कपास झुलसा: COC + स्ट्रेप्टोसाइक्लिन' : 'Cotton Blight: COC + Strepto'}</span>
            </button>
            <button
              onClick={() => handleApplyPreset(['magnesium-sulphate', 'npk-19-19-19-wsf'])}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold whitespace-nowrap transition border border-white/10 flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{language === 'mr' ? 'लाल्या उपाय: MgSO4 + 19:19:19' : language === 'hi' ? 'लाल पत्ती उपचार: MgSO4 + 19:19:19' : 'Lalya Cure: MgSO4 + 19:19:19'}</span>
            </button>
            <button
              onClick={() => handleApplyPreset(['copper-oxychloride-wp', 'profenofos-50-ec'])}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold whitespace-nowrap transition border border-rose-500/40 flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>{language === 'mr' ? 'असंगत: कॉपर + प्रोफेनोफॉस' : language === 'hi' ? 'असंगत: कॉपर + प्रोफेनोफॉस' : 'Hazard: Copper + Profenofos'}</span>
            </button>
            <button
              onClick={() => handleApplyPreset(['calcium-nitrate', 'magnesium-sulphate'])}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold whitespace-nowrap transition border border-rose-500/40 flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>{language === 'mr' ? 'साका: कॅल्शियम + सल्फेट' : language === 'hi' ? 'तलछट: कैल्शियम + सल्फेट' : 'Sludge: Calcium + Sulfate'}</span>
            </button>
            <button
              onClick={() => handleApplyPreset(['azoxy-difen-sc', 'silicon-spreader'])}
              className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 font-semibold whitespace-nowrap transition border border-teal-500/40 flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>{language === 'mr' ? 'सुसंगत: अँमिस्टार + सिलिकॉन' : language === 'hi' ? 'अनुकूल: एमिस्टार + सिलिकॉन' : 'Label: Amistar + Spreader'}</span>
            </button>
            <button
              onClick={() => handleApplyPreset(['copper-oxychloride-wp', 'streptocycline-sp', 'npk-19-19-19-wsf'])}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold whitespace-nowrap transition border border-amber-500/40 flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{language === 'mr' ? '३ उत्पादने कॉकटेल (सावध)' : language === 'hi' ? '3 उत्पाद कॉकटेल (सावधानी)' : '3-Product Cocktail'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Selector & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chemical Selection Box (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-4 sm:p-5 border-slate-200 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-[#152D24] flex items-center gap-2">
                  <span>
                    {language === 'mr' ? '१. फवारणीसाठी औषधे व खते निवडा' : language === 'hi' ? '1. छिड़काव हेतु दवाएं व खाद चुनें' : '1. Select Chemicals & Fertilizers to Mix'}
                  </span>
                  <span className="text-xs font-normal text-[#5F7065]">
                    ({selectedIds.length}/4 {language === 'mr' ? 'निवडले' : language === 'hi' ? 'चुने' : 'Selected'})
                  </span>
                </h3>
                <p className="text-xs text-[#5F7065] mt-0.5">
                  {language === 'mr' ? 'खालील यादीतून २ ते ४ उत्पादने निवडा:' : language === 'hi' ? 'सूची से 2 से 4 उत्पाद चुनें:' : 'Select 2 to 4 products to mix:'}
                </p>
              </div>

              {selectedIds.length >= 2 && (
                <Badge variant="success" className="bg-[#E6F2E5] text-[#21864A] border-[#21864A]/30 font-bold text-xs">
                  {selectedIds.length} {language === 'mr' ? 'निवडले' : language === 'hi' ? 'चुने' : 'Selected'}
                </Badge>
              )}
            </div>

            {/* Selected Chips Tray */}
            {selectedIds.length > 0 && (
              <div className="p-3 bg-[#F6F8F0] border border-[#DDE8DC] rounded-2xl mb-4">
                <span className="text-[11px] font-bold text-[#5F7065] block mb-2 uppercase tracking-wider">
                  {language === 'mr' ? 'सध्या निवडलेली उत्पादने:' : language === 'hi' ? 'वर्तमान में चयनित उत्पाद:' : 'Currently Selected In Tank:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {evaluation.selectedChemicals.map((chem) => (
                    <span 
                      key={chem.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#152D24] border border-[#DDE8DC] shadow-2xs text-xs font-bold"
                    >
                      <span className="px-1.5 py-0.2 rounded-md bg-[#0B5137] text-white text-[10px] font-mono">
                        {chem.formulation}
                      </span>
                      <span>{chem.name}</span>
                      <button
                        onClick={() => handleRemoveChemical(chem.id)}
                        className="text-[#5F7065] hover:text-[#C83E3E] transition ml-1"
                        title={language === 'mr' ? 'काढून टाका' : language === 'hi' ? 'हटाएं' : 'Remove'}
                        aria-label="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#DDE8DC] text-xs scrollbar-none">
              {[
                { id: 'all', label: { mr: 'सर्व (All)', hi: 'सभी (All)', en: 'All' } },
                { id: 'insecticide', label: { mr: 'कीटकनाशके', hi: 'कीटनाशक', en: 'Insecticides' } },
                { id: 'fungicide', label: { mr: 'बुरशीनाशके', hi: 'फफूंदनाशी', en: 'Fungicides' } },
                { id: 'fertilizer', label: { mr: 'विद्राव्य खते', hi: 'घुलनशील खाद', en: 'Foliar NPK' } },
                { id: 'biocontrol', label: { mr: 'जैविक', hi: 'जैविक नियंत्रण', en: 'Biocontrol' } },
                { id: 'adjuvant', label: { mr: 'स्टिकर', hi: 'स्टीकर/स्प्रेडर', en: 'Adjuvants' } },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                    activeCategoryFilter === tab.id
                      ? 'bg-[#0B5137] text-white shadow-xs'
                      : 'bg-[#F6F8F0] text-[#5F7065] hover:bg-[#E6F2E5]'
                  }`}
                >
                  {tab.label[language]}
                </button>
              ))}
            </div>

            {/* Chemical Selector List */}
            <div className="mt-3 space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredChemicals.map((chem) => {
                const isSelected = selectedIds.includes(chem.id);
                return (
                  <div
                    key={chem.id}
                    onClick={() => handleToggleChemical(chem.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 shadow-xs ring-1 ring-teal-500'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {chem.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300">
                          {chem.formulation}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {chem.tradeNameExample} • {chem.commonTarget[language]}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                      aria-label="निवडा"
                    >
                      {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Compatibility Verdict & W.A.L.E.S. Sequence (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Verdict Card */}
          <div className={`rounded-3xl p-5 border shadow-md transition-all ${statusConfig.bg}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${statusConfig.badgeBg}`}>
                    {statusConfig.statusText[language]}
                  </span>
                  {evaluation.isMultiProductCaution && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
                      3+ MIX
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black tracking-tight text-white">
                  {evaluation.statusHeadline[language]}
                </h3>
              </div>
            </div>

            {/* Detailed Explanation */}
            <p className="text-xs sm:text-sm text-slate-200 mt-3 leading-relaxed font-medium bg-black/20 p-3 rounded-2xl border border-white/10">
              {evaluation.detailedExplanation[language]}
            </p>

            {/* Triggered Specific Authority / Rule citation or Unverified Fallback */}
            {evaluation.rulesTriggered.length > 0 ? (
              <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-300 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <BookOpen className="w-3.5 h-3.5 text-teal-300" />
                    <span>{language === 'mr' ? 'प्रमाणित संदर्भ व पुरावा (Verified Reference):' : language === 'hi' ? 'प्रमाणित संदर्भ एवं साक्ष्य:' : 'Verified Evidence & Reference:'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getEvidenceBadge(evaluation.rulesTriggered[0].evidenceType).bg}`}>
                    {getEvidenceBadge(evaluation.rulesTriggered[0].evidenceType).label[language]}
                  </span>
                </div>
                
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 space-y-1">
                  <p className="text-white font-bold text-[11px]">
                    📄 {evaluation.rulesTriggered[0].documentTitle || evaluation.rulesTriggered[0].sourceAuthority}
                  </p>
                  <p className="text-[10px] text-slate-300">
                    🏛️ <strong>{language === 'mr' ? 'जारीकर्ता संस्था:' : language === 'hi' ? 'जारीकर्ता संस्था:' : 'Issuing Authority:'}</strong> {evaluation.rulesTriggered[0].issuingAuthority || 'Agricultural Research Body'}
                  </p>
                  {evaluation.rulesTriggered[0].sectionOrPage && (
                    <p className="text-[10px] text-teal-300">
                      🔖 <strong>{language === 'mr' ? 'कलम / पृष्ठ:' : language === 'hi' ? 'अध्याय / पृष्ठ:' : 'Section/Page:'}</strong> {evaluation.rulesTriggered[0].sectionOrPage}
                    </p>
                  )}
                  {evaluation.rulesTriggered[0].publicationDate && (
                    <p className="text-[10px] text-slate-400">
                      📅 <strong>{language === 'mr' ? 'आवृत्ती / तारीख:' : language === 'hi' ? 'संस्करण / वर्ष:' : 'Edition/Date:'}</strong> {evaluation.rulesTriggered[0].publicationDate}
                    </p>
                  )}
                </div>

                {evaluation.rulesTriggered[0].applicableConditions && (
                  <p className="text-[11px] text-teal-200 mt-1 font-medium bg-teal-950/40 p-2 rounded-xl border border-teal-500/30">
                    📌 <strong>{language === 'mr' ? 'वापराच्या अधिकृत अटी:' : language === 'hi' ? 'उपयोग के आधिकारिक निर्देश:' : 'Application Guidelines:'}</strong> {evaluation.rulesTriggered[0].applicableConditions[language]}
                  </p>
                )}
              </div>
            ) : (
              selectedIds.length >= 2 && (
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'mr' ? 'पुरावा स्थिती:' : language === 'hi' ? 'साक्ष्य स्थिति:' : 'Evidence Status:'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-400">
                      {language === 'mr' ? 'सुसंगतता असत्यापित (Unverified)' : language === 'hi' ? 'अनुकूलता असत्यापित (Unverified)' : 'Compatibility Not Verified'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-[11px] text-slate-300 leading-relaxed">
                    {language === 'mr'
                      ? 'या विशिष्ट घटकांच्या मिश्रणासाठी डॉ. PDKV अकोला, ICAR किंवा CIBRC कडे कोणतेही अधिकृत टँक-मिक्स चाचणी दस्तऐवज नोंदणीकृत नाही. खबरदारीचा उपाय म्हणून फवारणीपूर्वी उत्पादनाच्या मूळ लेबल सूचनांचे पालन करा आणि आधी १ लिटर जार टेस्ट करा.'
                      : language === 'hi'
                      ? 'इस संयोजन के लिए डॉ. PDKV अकोला, ICAR अथवा CIBRC के पास कोई अधिकृत टैंक-मिक्स रिकॉर्ड उपलब्ध नहीं है। उत्पाद के लेबल निर्देशों का पालन करें एवं जार टेस्ट करें।'
                      : 'No statutory CIBRC label clearance or university trial record is published for this specific tank combination. Strictly consult manufacturer product labels and conduct a 1-liter physical jar test prior to field application.'}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Regional Vidarbha Water Quality Warning Box */}
          {selectedIds.length >= 2 && (
            <div className="p-3.5 rounded-2xl bg-sky-950/60 border border-sky-500/40 text-sky-200 text-xs flex items-start gap-2.5 shadow-sm">
              <Droplets className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-sky-100 flex items-center gap-1.5 flex-wrap">
                  <span>{language === 'mr' ? 'विदर्भ पाणी गुणवत्ता सल्ला:' : language === 'hi' ? 'विदर्भ जल गुणवत्ता परामर्श:' : 'Vidarbha Water Quality Advisory:'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-400/20 text-sky-300 font-mono">
                    {language === 'mr' ? 'लेबलनुसार सामू' : language === 'hi' ? 'लेबल अनुसार pH' : 'Product-Label pH'}
                  </span>
                </span>
                <p className="font-medium text-sky-200/90 leading-relaxed text-[11px]">
                  {evaluation.waterQualityNotice[language]}
                </p>
              </div>
            </div>
          )}

          {/* W.A.L.E.S. Sequence Card */}
          {selectedIds.length >= 2 && (
            <Card className="p-4 sm:p-5 border-slate-200 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[#2F9E59]" />
                  <h4 className="text-sm font-bold text-[#152D24]">
                    {language === 'mr' ? 'W.A.L.E.S. योग्य फवारणी क्रम (Mixing Order)' : language === 'hi' ? 'W.A.L.E.S. सही मिश्रण क्रम (Mixing Order)' : 'W.A.L.E.S. Sequential Tank-Mix Order'}
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F2E5] text-[#0B5137] border border-[#2F9E59]/30">
                  {language === 'mr' ? 'W.A.L.E.S. पद्धत' : language === 'hi' ? 'W.A.L.E.S. विधि' : 'W.A.L.E.S. Standard'}
                </span>
              </div>

              {/* CRITICAL: Manufacturer Product Label Precedence Notice */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E9A23B] shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed text-[11px]">
                  {evaluation.labelPrecedenceNotice[language]}
                </p>
              </div>

              <div className="space-y-2.5">
                {evaluation.mixingOrder.map((step) => (
                  <div 
                    key={step.stepNumber}
                    className="p-3 rounded-2xl bg-[#F6F8F0] border border-[#DDE8DC] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#152D24] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#0B5137] text-white flex items-center justify-center text-[10px]">
                          {step.stepNumber}
                        </span>
                        <span>{step.title[language]}</span>
                      </span>
                    </div>
                    <p className="text-[#5F7065] leading-relaxed font-medium pl-6">
                      {step.instruction[language]}
                    </p>
                    {step.chemicalNames.length > 0 && (
                      <div className="pl-6 pt-1 flex flex-wrap gap-1">
                        {step.chemicalNames.map((name, i) => (
                          <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-800">
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 1-Liter Jar Test Instructions & Statutory Limitations (Trilingual) */}
          <div className="border border-amber-300 rounded-3xl bg-amber-50/70 p-4 text-xs space-y-2.5">
            <button
              onClick={() => setShowJarTestGuide(!showJarTestGuide)}
              className="w-full flex items-center justify-between text-left font-bold text-amber-950 text-xs sm:text-sm"
            >
              <span className="flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-amber-700" />
                <span>
                  {language === 'mr' ? '१ लिटर जार चाचणी कशी करावी? (Jar Test Guide)' : language === 'hi' ? '1 लीटर जार टेस्ट कैसे करें? (Jar Test Guide)' : 'How to Perform a 1-Liter Jar Test?'}
                </span>
              </span>
              {showJarTestGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showJarTestGuide && (
              <div className="space-y-2 pt-2 border-t border-amber-200 text-amber-900 leading-relaxed animate-in fade-in">
                <ol className="list-decimal list-inside space-y-1.5 font-medium">
                  {jarTestSteps[language].map((stepText, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {stepText}
                    </li>
                  ))}
                </ol>

                <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-[11px] text-amber-950 font-bold space-y-1">
                  <div className="flex items-center gap-1 text-rose-700">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{jarTestLimits[language].title}</span>
                  </div>
                  <p className="font-normal text-amber-950 leading-relaxed">
                    {jarTestLimits[language].desc}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Safety & Legal Disclaimers Banner */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>{evaluation.disclaimer[language]}</p>
      </div>
    </div>
  );
};
