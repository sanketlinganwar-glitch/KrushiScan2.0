import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Upload, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  HelpCircle, 
  Phone,
  PhoneCall,
  ExternalLink,
  Building2,
  MapPin,
  Search,
  ShieldCheck,
  MessageCircle,
  Share2,
  AlertCircle,
  Info,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ExpertInquiry, ScanResult } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LOCAL_STORAGE_KEYS } from '../lib/supabase';
import {
  VIDARBHA_KVK_DIRECTORY,
  VIDARBHA_DISTRICTS,
  getVerifiedInstitutions,
  buildSafeWhatsAppDiagnosticMessage,
  getWhatsAppShareUrl,
  KvkInstitution,
} from '../lib/kvkData';

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

  // Active view tab: 'directory' | 'whatsapp' | 'inquiries'
  const [activeTab, setActiveTab] = useState<'directory' | 'whatsapp' | 'inquiries'>('directory');

  // Directory filter states
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Scans for WhatsApp sharing
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<string>('none');
  const [farmerWhatsAppQuestion, setFarmerWhatsAppQuestion] = useState<string>('');
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  // Online inquiries states
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

  // Inquiry form states
  const [cropName, setCropName] = useState('कापूस (Cotton)');
  const [issueCategory, setIssueCategory] = useState('किडीचा प्रादुर्भाव (Pest Problem)');
  const [description, setDescription] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Load recent scans from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SCANS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentScans(parsed);
          setSelectedScanId(parsed[0].id);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
  }, [inquiries]);

  const verifiedInstitutions = getVerifiedInstitutions(selectedDistrict, searchQuery);

  const selectedScan = recentScans.find((s) => s.id === selectedScanId) || null;
  const safeWhatsAppMessage = buildSafeWhatsAppDiagnosticMessage(
    selectedScanId === 'none' ? null : selectedScan,
    farmerWhatsAppQuestion
  );
  const whatsAppShareUrl = getWhatsAppShareUrl(safeWhatsAppMessage);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(safeWhatsAppMessage);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-[#152D24] flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[#0B5137]" />
          <span>कृषी तज्ज्ञ व KVK साहाय्य (Expert & KVK Support)</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065] mt-0.5">
          डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV), ICAR व विदर्भातील अधिकृत कृषी विज्ञान केंद्रांशी थेट संपर्क
        </p>
      </div>

      {/* PDKV ATIC Toll-Free Helpline Spotlight Card */}
      <Card variant="white" className="p-4 sm:p-5 border-[#2F9E59]/40 bg-gradient-to-r from-[#E6F2E5]/60 to-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0B5137] text-white flex items-center justify-center shrink-0 shadow-sm">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-[#E6F2E5] text-[#0B5137] px-2 py-0.5 rounded-full border border-[#2F9E59]/30">
                  अधिकृत मोफत हेल्पलाइन
                </span>
                <span className="text-[11px] text-[#5F7065]">सकाळी १० ते सायं ५</span>
              </div>
              <h3 className="text-lg font-black text-[#152D24] mt-1">
                डॉ. पंदेकृवि ATIC शेतकरी टोल-फ्री: 1800-233-0724
              </h3>
              <p className="text-xs text-[#5F7065]">
                डॉ. पंजाबराव देशमुख कृषी विद्यापीठ, अकोला द्वारे विदर्भातील सर्व शेतकऱ्यांसाठी मोफत पीक सल्ला
              </p>
            </div>
          </div>

          <a
            href="tel:18002330724"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B5137] hover:bg-[#073D2A] text-white font-extrabold text-sm shadow-md transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>थेट कॉल करा (Toll-Free)</span>
          </a>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#F6F8F0] rounded-2xl border border-[#DDE8DC]">
        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'directory'
              ? 'bg-white text-[#0B5137] shadow-sm'
              : 'text-[#5F7065] hover:text-[#0B5137]'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#2F9E59]" />
          <span>KVK व संशोधन संस्था निर्देशिका ({VIDARBHA_KVK_DIRECTORY.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('whatsapp')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'whatsapp'
              ? 'bg-white text-[#0B5137] shadow-sm'
              : 'text-[#5F7065] hover:text-[#0B5137]'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-[#2F9E59]" />
          <span>WhatsApp तज्ज्ञ विचारणा</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inquiries')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'inquiries'
              ? 'bg-white text-[#0B5137] shadow-sm'
              : 'text-[#5F7065] hover:text-[#0B5137]'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-[#2F9E59]" />
          <span>ऑनलाइन प्रश्न व उत्तरे ({inquiries.length})</span>
        </button>
      </div>

      {/* TAB 1: Verified Agricultural Institutions Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Filter Bar: District & Search */}
          <Card variant="white" className="p-4 border-[#DDE8DC] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#5F7065] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="संस्थेचे नाव, जिल्हा किंवा तालुका शोधा..."
                  className="w-full bg-[#F6F8F0] border border-[#DDE8DC] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#152D24] focus:ring-2 focus:ring-[#0B5137]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    साफ करा
                  </button>
                )}
              </div>

              {/* District Dropdown Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-xs font-bold text-[#152D24]">जिल्हा:</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-white border border-[#DDE8DC] rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-[#152D24] focus:ring-2 focus:ring-[#0B5137]"
                >
                  {VIDARBHA_DISTRICTS.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.nameMr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick District Pills for Mobile Ease */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {VIDARBHA_DISTRICTS.map((dist) => (
                <button
                  key={dist.id}
                  type="button"
                  onClick={() => setSelectedDistrict(dist.id)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition font-medium ${
                    selectedDistrict === dist.id
                      ? 'bg-[#0B5137] text-white font-bold'
                      : 'bg-[#F6F8F0] text-[#5F7065] hover:bg-[#E6F2E5]'
                  }`}
                >
                  {dist.nameMr.split(' ')[0]}
                </button>
              ))}
            </div>
          </Card>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifiedInstitutions.map((inst) => (
              <Card
                key={inst.id}
                variant="white"
                className="p-5 border-[#DDE8DC] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#2F9E59]/50 transition"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#0B5137] text-white text-[11px] font-bold">
                      {inst.districtMr}
                    </span>
                    <Badge variant="success" size="sm" dot>
                      शासकीय संस्था (Verified)
                    </Badge>
                  </div>

                  {/* Institution Name */}
                  <div>
                    <h4 className="text-base font-extrabold text-[#152D24] leading-snug">
                      {inst.name.mr}
                    </h4>
                    <p className="text-xs font-semibold text-[#5F7065] mt-0.5">
                      {inst.name.en}
                    </p>
                  </div>

                  {/* Host Organization */}
                  <div className="text-xs text-[#152D24] bg-[#F6F8F0] p-2.5 rounded-xl border border-[#DDE8DC]">
                    <p className="font-bold text-[#152D24] text-[11px]">नियंत्रक संस्था / विद्यापीठ:</p>
                    <p className="text-xs font-medium text-[#5F7065]">{inst.hostOrganization.mr}</p>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs text-[#5F7065]">
                    <MapPin className="w-4 h-4 text-[#C83E3E] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{inst.address.mr}</p>
                  </div>

                  {/* Verified Phone Numbers */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold text-[#152D24] uppercase tracking-wide">
                      सत्यापित संपर्क दूरध्वनी (Verified Telephones):
                    </p>
                    {inst.phoneNumbers.map((phone, idx) => (
                      <div
                        key={idx}
                        className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-[#F6F8F0] border border-[#DDE8DC]"
                      >
                        <div className="text-xs">
                          <p className="font-bold text-[#152D24]">{phone.label}</p>
                          <p className="font-mono text-[#5F7065]">{phone.formatted}</p>
                        </div>
                        <a
                          href={`tel:${phone.number}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B5137] hover:bg-[#073D2A] text-white text-xs font-bold transition shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>कॉल करा</span>
                        </a>
                      </div>
                    ))}
                  </div>

                  {/* WhatsApp Status Notice (Graceful Transparency) */}
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-[11px] text-amber-950 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">अधिकृत संस्थात्मक व्हॉट्सॲप:</p>
                      <p className="text-slate-700">
                        संस्थेचा अधिकृत व्हॉट्सॲप नंबर उपलब्ध नाही. थेट दूरध्वनी किंवा प्रत्यक्ष कार्यालयास भेट देऊन सल्ला घ्यावा.
                      </p>
                    </div>
                  </div>

                  {inst.notesMr && (
                    <p className="text-xs text-[#5F7065] italic">
                      {inst.notesMr}
                    </p>
                  )}
                </div>

                {/* Footer Links & Verification Citation */}
                <div className="pt-3 border-t border-[#DDE8DC] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <a
                    href={inst.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#2F9E59] font-bold hover:underline"
                  >
                    <span>अधिकृत संकेतस्थळ</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={inst.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline"
                  >
                    सत्यापित स्रोत ({inst.verificationDate})
                  </a>
                </div>
              </Card>
            ))}
          </div>

          {verifiedInstitutions.length === 0 && (
            <Card variant="white" className="p-8 text-center border-[#DDE8DC]">
              <p className="text-sm font-bold text-[#152D24]">या जिल्ह्यासाठी किंवा शोधासाठी संस्था सापडली नाही.</p>
              <p className="text-xs text-[#5F7065] mt-1">कृपया फिल्टर साफ करा किंवा 'सर्व जिल्हे' निवडा.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setSelectedDistrict('all');
                  setSearchQuery('');
                }}
              >
                सर्व संस्था दाखवा
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: Privacy-Safe WhatsApp Diagnostic Consultation */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <Card variant="white" className="p-5 sm:p-6 border-[#DDE8DC] shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#152D24] flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#2F9E59]" />
                <span>व्हॉट्सॲप द्वारे कृषी सल्ला विचारणा (WhatsApp Consultation)</span>
              </h3>
              <p className="text-xs text-[#5F7065] mt-0.5">
                आपल्या स्थानिक कृषी सहाय्यक, कृषी सेवा केंद्र किंवा कृषी शास्त्रज्ञांना व्हॉट्सॲपवर सुरक्षितपणे प्रश्न विचारा.
              </p>
            </div>

            {/* Privacy & Diagnostic Safeguards Notice */}
            <div className="p-3.5 rounded-2xl bg-[#E6F2E5] border border-[#2F9E59]/30 text-xs text-[#152D24] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#0B5137]">
                <ShieldCheck className="w-4 h-4 text-[#2F9E59] shrink-0" />
                <span>गोपनीयता व कृषी सुरक्षा हमी (Privacy & Safety Safeguards)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#5F7065] font-medium">
                <li>कोणतीही वैयक्तिक माहिती, शेताचे लोकेशन, किंवा फोटो आपोआप पाठवले जात नाहीत.</li>
                <li>हे AI प्रणालीचे प्राथमिक निरीक्षण असून अधिकृत प्रयोगशाळा चाचणी नाही.</li>
                <li>'WhatsApp वर उघडा' बटण दाबल्यावर आपल्या फोनमधील WhatsApp ॲप उघडेल; संदेश पाठवण्यापूर्वी आपण तो तपासून बदलू शकता.</li>
              </ul>
            </div>

            {/* Step A: Select Recent Scan */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#152D24]">
                १. AI रोग निदानाची नोंद जोडा (पर्यायी)
              </label>
              {recentScans.length > 0 ? (
                <select
                  value={selectedScanId}
                  onChange={(e) => setSelectedScanId(e.target.value)}
                  className="w-full bg-white border border-[#DDE8DC] rounded-xl p-2.5 text-xs sm:text-sm text-[#152D24] font-medium focus:ring-2 focus:ring-[#0B5137]"
                >
                  <option value="none">-- कोणतेही स्कॅन जोडायचे नाही (केवळ प्रश्न विचारा) --</option>
                  {recentScans.map((scan) => (
                    <option key={scan.id} value={scan.id}>
                      {scan.cropName} — {scan.localDiseaseName?.mr || scan.diseaseName} ({new Date(scan.scannedAt).toLocaleDateString('mr-IN')})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-[#F6F8F0] border border-[#DDE8DC] text-xs text-[#5F7065]">
                  सध्या कोणतीही मागील स्कॅन नोंद नाही. आपण खाली थेट आपला प्रश्न लिहून सल्ला विचारू शकता.
                </div>
              )}
            </div>

            {/* Step B: Farmer Question */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#152D24]">
                २. आपला प्रश्न किंवा शंका लिहा (Farmer Question)
              </label>
              <textarea
                rows={3}
                value={farmerWhatsAppQuestion}
                onChange={(e) => setFarmerWhatsAppQuestion(e.target.value)}
                placeholder="उदा. पात्या गळत आहेत व पानाच्या मागे पांढरी माशी दिसते आहे. फवारणी कोणती करावी? किती औषध वापरावे?"
                className="w-full bg-white border border-[#DDE8DC] rounded-xl p-3 text-xs sm:text-sm text-[#152D24] focus:ring-2 focus:ring-[#0B5137]"
              />
            </div>

            {/* Step C: Formatted Message Live Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#152D24]">
                  ३. व्हॉट्सॲप संदेशाचे पूर्वावलोकन (Live Message Preview)
                </label>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-xs text-[#2F9E59] font-bold hover:underline"
                >
                  {copiedNotice ? '✓ कॉपी केले!' : 'संदेश मजकूर कॉपी करा'}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F6F8F0] border border-[#DDE8DC] font-mono text-[11px] sm:text-xs text-[#152D24] whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {safeWhatsAppMessage}
              </div>
            </div>

            {/* Step D: WhatsApp Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#DDE8DC]">
              <p className="text-[11px] text-[#5F7065]">
                बाहेरील ॲप: 'WhatsApp वर उघडा' दाबल्यास बाह्य WhatsApp ॲप्लिकेशन उघडेल.
              </p>

              <a
                href={whatsAppShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-sm shadow-md transition-colors"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>WhatsApp वर उघडा (Open in WhatsApp)</span>
              </a>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: Interactive Question Form & Previous Expert Responses */}
      {activeTab === 'inquiries' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Left: Ask a Question Form */}
          <div className="lg:col-span-6 space-y-4">
            <Card variant="white" className="p-5 border-[#DDE8DC] shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-[#152D24] flex items-center gap-2 pb-2 border-b border-[#DDE8DC]">
                <HelpCircle className="w-4 h-4 text-[#2F9E59]" />
                <span>नवीन प्रश्न विचारा (Ask Question)</span>
              </h4>

              {submittedSuccess && (
                <div className="p-3 rounded-xl bg-[#E6F2E5] border border-[#2F9E59]/30 text-[#0B5137] text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#21864A]" />
                  <span>तुमचा प्रश्न कृषी तज्ज्ञांकडे पाठवला आहे. उत्तर २४ तासांत प्राप्त होईल.</span>
                </div>
              )}

              <form onSubmit={handleSubmitInquiry} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#152D24] mb-1">
                    पीक निवडा
                  </label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full bg-white border border-[#DDE8DC] rounded-xl p-2.5 text-xs sm:text-sm text-[#152D24] focus:ring-2 focus:ring-[#0B5137] shadow-2xs"
                  >
                    <option value="कापूस (Cotton)">कापूस (Cotton)</option>
                    <option value="सोयाबीन (Soybean)">सोयाबीन (Soybean)</option>
                    <option value="तूर (Pigeonpea)">तूर (Pigeonpea)</option>
                    <option value="हरभरा (Gram)">हरभरा (Gram)</option>
                    <option value="गहू (Wheat)">गहू (Wheat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#152D24] mb-1">
                    समस्येचा प्रकार
                  </label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="w-full bg-white border border-[#DDE8DC] rounded-xl p-2.5 text-xs sm:text-sm text-[#152D24] focus:ring-2 focus:ring-[#0B5137] shadow-2xs"
                  >
                    <option value="किडीचा प्रादुर्भाव (Pest Problem)">किडीचा प्रादुर्भाव (Pest Problem)</option>
                    <option value="बुरशी किंवा पाने पिवळी पडणे (Fungal/Disease)">बुरशी किंवा पाने पिवळी पडणे (Disease)</option>
                    <option value="झाडे सुकणे / मर रोग (Wilt)">झाडे सुकणे / मर रोग (Wilt)</option>
                    <option value="खत व पोषण सल्ला (Fertilizer)">खत व पोषण सल्ला (Fertilizer)</option>
                    <option value="पाणी व सिंचन (Irrigation)">पाणी व सिंचन (Irrigation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#152D24] mb-1">
                    लक्षणे व समस्येचे वर्णन करा
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="पिकात काय बदल दिसतो आहे? किती दिवसांपासून प्रादुर्भाव आहे? आधी कोणती फवारणी केली आहे का ते लिहा..."
                    className="w-full bg-white border border-[#DDE8DC] rounded-xl p-2.5 text-xs sm:text-sm text-[#152D24] focus:ring-2 focus:ring-[#0B5137] placeholder:text-[#5F7065] shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#152D24] mb-1">
                    पिकाचा किंवा पानावरील रोगाचा फोटो जोडा (पर्यायी)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-[#5F7065] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0B5137] file:text-white hover:file:bg-[#073D2A]"
                  />
                </div>

                {attachedImage && (
                  <div className="w-full h-28 rounded-xl overflow-hidden border border-[#DDE8DC] shadow-xs relative">
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
            <h4 className="text-sm font-bold text-[#152D24] uppercase tracking-wide px-1">
              मागील प्रश्न व तज्ज्ञांची उत्तरे ({inquiries.length})
            </h4>

            <div className="space-y-4">
              {inquiries.map((inq) => (
                <Card key={inq.id} variant="white" className="p-4 sm:p-5 border-[#DDE8DC] space-y-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#DDE8DC]">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-[#152D24] bg-[#F6F8F0] px-2 py-0.5 rounded border border-[#DDE8DC]">
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
                      <span className="text-[11px] font-semibold text-[#C83E3E]">
                        {inq.issueCategory}
                      </span>
                    </div>

                    <span className="text-[10px] text-[#5F7065] shrink-0">
                      {inq.submittedAt}
                    </span>
                  </div>

                  {/* Farmer Question */}
                  <div className="flex gap-3">
                    {inq.imageUrl && (
                      <img
                        src={inq.imageUrl}
                        alt="Crop issue"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#DDE8DC]"
                      />
                    )}
                    <p className="text-xs text-[#152D24] leading-relaxed font-medium">
                      {inq.description}
                    </p>
                  </div>

                  {/* Expert Response Box if Available */}
                  {inq.expertResponse ? (
                    <div className="p-3.5 rounded-2xl bg-[#E6F2E5] border border-[#2F9E59]/40 space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#0B5137] text-white flex items-center justify-center font-bold text-xs">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-[#152D24]">
                            {inq.expertResponse.expertName}
                          </h5>
                          <p className="text-[10px] text-[#5F7065]">
                            {inq.expertResponse.expertTitle} • {inq.expertResponse.institution}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-[#152D24] leading-relaxed font-sans font-medium pl-2 border-l-2 border-[#2F9E59]">
                        {inq.expertResponse.recommendation}
                      </p>

                      <span className="text-[10px] text-[#2F9E59] block text-right font-medium">
                        दिनांक: {inq.expertResponse.responseDate}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#E9A23B]/10 border border-[#E9A23B]/30 text-[#152D24] text-xs flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#E9A23B] shrink-0" />
                      <span>कृषी शास्त्रज्ञ तुमच्या प्रश्नाची तपासणी करत आहेत. लवकरच उत्तर दिले जाईल.</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
