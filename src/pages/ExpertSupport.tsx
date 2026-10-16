import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Upload, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  HelpCircle, 
  Camera, 
  Sparkles,
  Info
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ExpertInquiry } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LOCAL_STORAGE_KEYS } from '../lib/supabase';

const INITIAL_INQUIRIES: ExpertInquiry[] = [
  {
    id: 'inq-1',
    userId: 'current-user',
    cropName: 'कापूस (Cotton)',
    issueCategory: 'किडीचा प्रादुर्भाव (Pest Problem)',
    description: 'कापसाच्या पात्या गळत आहेत व फुलांची चकती बंद झाली आहे. बोंडअळी असू शकते का?',
    imageUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=500&auto=format&fit=crop&q=80',
    status: 'resolved',
    submittedAt: '१२ ऑक्टोबर २०२४',
    expertResponse: {
      expertName: 'डॉ. प्रमोद वानखडे',
      expertTitle: 'मुख्य कीटकशास्त्रज्ञ (Senior Entomologist)',
      institution: 'डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV), अकोला',
      responseDate: '१३ ऑक्टोबर २०२४',
      recommendation: 'छायाचित्रावरून हे स्पष्टपणे गुलाबी बोंडअळीच्या प्रादुर्भावाचे लक्षण आहे. फुलांची चकती बंद होणे (Rosette flower) हे सुरुवातीचे लक्षण आहे. आपण त्वरित प्रति एकरी ५ कामगंध सापळे लावावेत आणि ५% निंबोळी अर्क किंवा प्रोफेनोफॉस ५०% EC (२ मिली/लिटर) ची फवारणी करावी. रासायनिक औषध मारताना आवश्यक काळजी घ्यावी.',
    },
  },
  {
    id: 'inq-2',
    userId: 'current-user',
    cropName: 'तूर (Pigeonpea)',
    issueCategory: 'झाडे सुकणे / मर रोग (Wilt)',
    description: 'तुरीची काही झाडे पूर्ण हिरवी असताना अचानक माना टाकत आहेत. खोडाच्या बुंध्याशी काळी रेषा दिसते.',
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=500&auto=format&fit=crop&q=80',
    status: 'reviewed',
    submittedAt: 'काल (Yesterday)',
    expertResponse: {
      expertName: 'प्रा. सुधीर ठाकरे',
      expertTitle: 'विभाग प्रमुख - वनस्पती रोगशास्त्र',
      institution: 'कृषी विज्ञान केंद्र (KVK), यवतमाळ',
      responseDate: 'आज सकाळी',
      recommendation: 'हा फ्युजॅरियम उडम बुरशीजन्य मर रोग आहे. रोगट झाडे उपटून त्वरित जाळावीत. शेतातील इतर निरोगी झाडांच्या मुळाशी ट्रायकोडर्मा व्हिरीडी (५ ग्रॅम/लिटर) चे द्रावण आळवणी (drenching) करावे.',
    },
  },
];

export const ExpertSupport: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [inquiries, setInquiries] = useState<ExpertInquiry[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.INQUIRIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_INQUIRIES;
  });

  // Form states
  const [cropName, setCropName] = useState('कापूस (Cotton)');
  const [issueCategory, setIssueCategory] = useState('किडीचा प्रादुर्भाव (Pest Problem)');
  const [description, setDescription] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
  }, [inquiries]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newInquiry: ExpertInquiry = {
        id: 'inq-' + Date.now(),
        userId: user?.id || 'current-user',
        cropName,
        issueCategory,
        description,
        imageUrl: attachedImage || undefined,
        status: 'pending',
        submittedAt: 'आत्ताच (Just now)',
      };

      setInquiries([newInquiry, ...inquiries]);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setDescription('');
      setAttachedImage(null);

      setTimeout(() => setSubmittedSuccess(false), 4000);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#0A2540] flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[#0A2540]" />
          <span>{t('navExpert')} (KVK / PDKV Expert Advice)</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#5B6B7D] mt-0.5">
          डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV) व कृषी विज्ञान केंद्रातील (KVK) शास्त्रज्ञांना थेट प्रश्न विचारा
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ask a Question Form */}
        <div className="lg:col-span-6 space-y-4">
          <Card variant="white" className="p-5 border-[#D5DEE8] shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-[#0A2540] flex items-center gap-2 pb-2 border-b border-[#D5DEE8]">
              <HelpCircle className="w-4 h-4 text-[#138808]" />
              <span>नवीन प्रश्न विचारा (Ask Question)</span>
            </h4>

            {submittedSuccess && (
              <div className="p-3 rounded-xl bg-[#138808]/10 border border-[#138808]/30 text-[#138808] text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#138808]" />
                <span>तुमचा प्रश्न कृषी तज्ज्ञांकडे पाठवला आहे. उत्तर २४ तासांत प्राप्त होईल.</span>
              </div>
            )}

            <form onSubmit={handleSubmitInquiry} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0A2540] mb-1">
                  पीक निवडा
                </label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-xs sm:text-sm text-[#0A2540] focus:ring-2 focus:ring-[#0A2540] shadow-2xs"
                >
                  <option value="कापूस (Cotton)">कापूस (Cotton)</option>
                  <option value="सोयाबीन (Soybean)">सोयाबीन (Soybean)</option>
                  <option value="तूर (Pigeonpea)">तूर (Pigeonpea)</option>
                  <option value="हरभरा (Gram)">हरभरा (Gram)</option>
                  <option value="गहू (Wheat)">गहू (Wheat)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A2540] mb-1">
                  समस्येचा प्रकार
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-xs sm:text-sm text-[#0A2540] focus:ring-2 focus:ring-[#0A2540] shadow-2xs"
                >
                  <option value="किडीचा प्रादुर्भाव (Pest Problem)">किडीचा प्रादुर्भाव (Pest Problem)</option>
                  <option value="बुरशी किंवा पाने पिवळी पडणे (Fungal/Disease)">बुरशी किंवा पाने पिवळी पडणे (Disease)</option>
                  <option value="झाडे सुकणे / मर रोग (Wilt)">झाडे सुकणे / मर रोग (Wilt)</option>
                  <option value="खत व पोषण सल्ला (Fertilizer)">खत व पोषण सल्ला (Fertilizer)</option>
                  <option value="पाणी व सिंचन (Irrigation)">पाणी व सिंचन (Irrigation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A2540] mb-1">
                  लक्षणे व समस्येचे वर्णन करा
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="पिकात काय बदल दिसतो आहे? किती दिवसांपासून प्रादुर्भाव आहे? आधी कोणती फवारणी केली आहे का ते लिहा..."
                  className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-xs sm:text-sm text-[#0A2540] focus:ring-2 focus:ring-[#0A2540] placeholder:text-[#5B6B7D] shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A2540] mb-1">
                  पिकाचा किंवा पानावरील रोगाचा फोटो जोडा (पर्यायी)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-[#5B6B7D] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0A2540] file:text-white hover:file:bg-[#081d32]"
                />
              </div>

              {attachedImage && (
                <div className="w-full h-28 rounded-xl overflow-hidden border border-[#D5DEE8] shadow-xs relative">
                  <img src={attachedImage} alt="Attachment" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full text-xs"
                  >
                    हटवा
                  </button>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="w-full text-sm font-bold shadow-md"
                leftIcon={<Send className="w-4 h-4" />}
              >
                शास्त्रज्ञांना प्रश्न पाठवा (Submit Inquiry)
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: Previous Requests and Expert Answers */}
        <div className="lg:col-span-6 space-y-4">
          <h4 className="text-sm font-bold text-[#0A2540] uppercase tracking-wide px-1">
            मागील प्रश्न व तज्ज्ञांची उत्तरे ({inquiries.length})
          </h4>

          <div className="space-y-4">
            {inquiries.map((inq) => (
              <Card key={inq.id} variant="white" className="p-4 sm:p-5 border-[#D5DEE8] space-y-3 shadow-sm">
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#D5DEE8]">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-bold text-[#0A2540] bg-[#EEF3F8] px-2 py-0.5 rounded border border-[#D5DEE8]">
                        {inq.cropName}
                      </span>
                      <Badge
                        variant={
                          inq.status === 'resolved'
                            ? 'success'
                            : inq.status === 'reviewed'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {inq.status === 'resolved'
                          ? 'उत्तर दिले (Answered)'
                          : inq.status === 'reviewed'
                          ? 'तपासणी चालू (Reviewed)'
                          : 'प्रतिक्षेत (Pending)'}
                      </Badge>
                    </div>
                    <span className="text-[11px] font-semibold text-[#C0392B]">
                      {inq.issueCategory}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#5B6B7D] shrink-0">
                    {inq.submittedAt}
                  </span>
                </div>

                {/* Farmer Question */}
                <div className="flex gap-3">
                  {inq.imageUrl && (
                    <img
                      src={inq.imageUrl}
                      alt="Crop issue"
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#D5DEE8]"
                    />
                  )}
                  <p className="text-xs text-[#0A2540] leading-relaxed font-medium">
                    {inq.description}
                  </p>
                </div>

                {/* Expert Response Box if Available */}
                {inq.expertResponse ? (
                  <div className="p-3.5 rounded-2xl bg-[#EEF3F8] border border-[#138808]/40 space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#138808] text-white flex items-center justify-center font-bold text-xs">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-[#0A2540]">
                          {inq.expertResponse.expertName}
                        </h5>
                        <p className="text-[10px] text-[#5B6B7D]">
                          {inq.expertResponse.expertTitle} • {inq.expertResponse.institution}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-[#0A2540] leading-relaxed font-sans font-medium pl-2 border-l-2 border-[#138808]">
                      {inq.expertResponse.recommendation}
                    </p>

                    <span className="text-[10px] text-[#138808] block text-right font-medium">
                      दिनांक: {inq.expertResponse.responseDate}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>कृषी शास्त्रज्ञ तुमच्या प्रश्नाची तपासणी करत आहेत. लवकरच उत्तर दिले जाईल.</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
