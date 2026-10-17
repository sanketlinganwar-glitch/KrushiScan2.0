import React from 'react';
import { Leaf, AlertTriangle, CheckCircle2, X, Info, Sparkles, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface LalyaDeficiencyGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LalyaDeficiencyGuide: React.FC<LalyaDeficiencyGuideProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        language === 'mr'
          ? 'कपाशीवरील लाल्या (मॅग्नेशियम कमतरता) विशेष कृषी सल्ला'
          : language === 'hi'
          ? 'कपास में लाल पत्ती (मैग्नीशियम कमी) विशेष सलाह'
          : 'Cotton Leaf Reddening (Magnesium Deficiency) Diagnostic Guide'
      }
      maxWidth="lg"
    >
      <div className="space-y-4 text-slate-800 text-sm">
        {/* Intro Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-base">
              {language === 'mr'
                ? 'लाल्या हा बुरशीजन्य रोग नसून अन्नाची कमतरता आहे!'
                : language === 'hi'
                ? 'लाल पत्ती रोग नहीं बल्कि पोषक तत्व की कमी है!'
                : 'Leaf Reddening is a Nutritional Deficiency, Not a Fungal Disease!'}
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed">
              {language === 'mr'
                ? 'विदर्भातील काळ्या जमिनीत बोंडे भरण्याच्या अवस्थेत झाडातील अन्नद्रव्ये बोंडाकडे खेचली जातात. यामुळे जुनी पाने लाल पडतात. यावर महागडी कीटकनाशके फवारून पैसे वाया घालवू नका.'
                : language === 'hi'
                ? 'विदर्भ की काली मिट्टी में टिंडे भरते समय मैग्नीशियम की कमी से पत्तियां लाल होती हैं। इस पर महंगे कीटनाशक छिड़क कर पैसे न गंवाएं।'
                : 'In Vidarbha black soils, heavy boll load draws magnesium from leaves into bolls, manifesting anthocyanin red pigments. Avoid expensive fungicides.'}
            </p>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="bg-slate-100 p-2.5 font-bold text-xs uppercase tracking-wider text-slate-700">
            {language === 'mr' ? 'फरक ओळखा: लाल्या विरुद्ध बुरशीजन्य करपा' : 'Identification: Nutritional Reddening vs Fungal Blight'}
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-200 text-xs">
            {/* Left: Lalya */}
            <div className="p-3 bg-red-50/40 space-y-2">
              <span className="font-bold text-rose-700 flex items-center gap-1">
                🍂 {language === 'mr' ? 'लाल्या (मॅग्नेशियम कमतरता)' : 'Nutritional Reddening'}
              </span>
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                <li>{language === 'mr' ? 'पानांच्या शिरांमधील भाग प्रथम जांभळट-लाल होतो, शिरा हिरव्या राहतात.' : 'Interveinal tissue turns purple-red; veins stay green.'}</li>
                <li>{language === 'mr' ? 'प्रथम झाडाच्या खालची जुनी पाने लाल पडतात.' : 'Older lower leaves turn red first.'}</li>
                <li>{language === 'mr' ? 'पानांवर कोणतेही बुरशीचे काळे ठिपके नसतात.' : 'No fungal circular spots or necrotic rings.'}</li>
              </ul>
            </div>

            {/* Right: Blight */}
            <div className="p-3 bg-amber-50/40 space-y-2">
              <span className="font-bold text-amber-800 flex items-center gap-1">
                🦠 {language === 'mr' ? 'करपा / पानांवरील ठिपके (बुरशी)' : 'Fungal Blight'}
              </span>
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                <li>{language === 'mr' ? 'पानांवर गोलाकार किंवा कोनीय तपकिरी-काळे डाग पडतात.' : 'Angular brown/black spots with yellow halo.'}</li>
                <li>{language === 'mr' ? 'रोगट भाग सुकतो व पानात छिद्र पडते.' : 'Affected tissue dries up, turns brittle.'}</li>
                <li>{language === 'mr' ? 'हवामानात सतत ढग व पाऊस असताना वेगाने पसरतो.' : 'Spreads rapidly during continuous wet overcast days.'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* PDKV Akola Certified Recipe */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-600 text-white font-bold text-[10px] uppercase">
              PDKV शिफारस
            </span>
            <h4 className="font-bold text-emerald-950">
              {language === 'mr' ? 'डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV) फवारणी उपाय:' : 'Dr. PDKV Akola Recommended Recipe:'}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong>मॅग्नेशियम सल्फेट (MgSO4):</strong>
                <p className="text-slate-600">५० ग्रॅम प्रति १० लिटर पाणी (०.५%)</p>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong>१९:१९:१९ विद्राव्य खत किंवा युरिया:</strong>
                <p className="text-slate-600">१०० ग्रॅम प्रति १० लिटर पाणी (१.०%)</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-emerald-900 pt-1">
            💡 <strong>सल्ला:</strong> ही फवारणी सकाळी ८ ते ११ किंवा संध्याकाळी ४ नंतर करावी. ८ ते १० दिवसांच्या अंतराने दुसरी फवारणी केल्यास झाडे हिरवीगार होऊन बोंडे टपोरी भरतात.
          </p>
        </div>

        {/* Action button */}
        <div className="pt-2 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            {language === 'mr' ? 'समजले, धन्यवाद!' : language === 'hi' ? 'समझ गए, धन्यवाद!' : 'Understood, Close'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
