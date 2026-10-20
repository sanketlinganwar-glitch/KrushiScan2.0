import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Sprout, 
  Globe, 
  LogOut, 
  ShieldCheck, 
  Save, 
  Bell, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Store,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UserRole, Language } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const Profile: React.FC = () => {
  const { user, logout, updateProfile, switchRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || 'यवतमाळ (Yavatmal)');
  const [village, setVillage] = useState(user?.village || 'दारव्हा');
  const [farmSizeAcres, setFarmSizeAcres] = useState(user?.farmSizeAcres || 5);
  const [activeCropsText, setActiveCropsText] = useState(user?.activeCrops?.join(', ') || 'कापूस, सोयाबीन, तूर');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      phone,
      district,
      village,
      farmSizeAcres: Number(farmSizeAcres),
      activeCrops: activeCropsText.split(',').map((c) => c.trim()),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#152D24] flex items-center gap-2">
          <User className="w-6 h-6 text-[#0B5137]" />
          <span>{t('navProfile')} (Farmer Profile & Settings)</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065] mt-0.5">
          तुमची शेतकरी प्रोफाइल, शेती तपशील, भाषा निवड व भूमिका (Role) व्यवस्थापन
        </p>
      </div>

      {/* Role Switching & RBAC Demonstration Panel (Prompt requirement) */}
      <Card variant="white" className="p-5 border-[#DDE8DC] bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DDE8DC]">
          <div>
            <h3 className="font-extrabold text-sm text-[#152D24] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#21864A]" />
              <span>प्रणाली भूमिका व परवानग्या (Role & Access Status)</span>
            </h3>
            <p className="text-xs text-[#5F7065]">
              तुमच्या खात्याची पडताळणी केलेली भूमिका व अधिकृत परवानग्या
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-[#0B5137] text-white font-bold self-start sm:self-auto shadow-2xs">
            चालू भूमिका: {user?.role?.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            {
              role: 'farmer' as UserRole,
              title: 'शेतकरी (Farmer)',
              sub: 'पीक स्कॅन, शेती व्यवस्थापन',
              icon: Sprout,
              color: 'text-[#21864A]',
            },
            {
              role: 'expert' as UserRole,
              title: 'कृषी शास्त्रज्ञ (Expert)',
              sub: 'शेतकऱ्यांचे प्रश्न व निदान',
              icon: Briefcase,
              color: 'text-[#2F9E59]',
            },
            {
              role: 'retailer' as UserRole,
              title: 'कृषी केंद्र (Retailer)',
              sub: 'उत्पादने व साठा व्यवस्थापन',
              icon: Store,
              color: 'text-[#0B5137]',
            },
            {
              role: 'admin' as UserRole,
              title: 'प्रशासक (Admin)',
              sub: 'प्रणाली निरीक्षण व ऑडिट',
              icon: SlidersHorizontal,
              color: 'text-[#5F7065]',
            },
          ].map((r) => {
            const Icon = r.icon;
            const isCurrent = user?.role === r.role;
            return (
              <button
                key={r.role}
                type="button"
                onClick={() => handleRoleChange(r.role)}
                className={`p-3 rounded-2xl text-left border transition ${
                  isCurrent
                    ? 'bg-[#0B5137] text-white border-[#0B5137] shadow-sm'
                    : 'bg-[#E6F2E5] border-[#DDE8DC] hover:bg-white text-[#152D24]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isCurrent ? 'text-white' : r.color} mb-1.5`} />
                <h5 className={`font-bold text-xs leading-tight ${isCurrent ? 'text-white' : 'text-[#152D24]'}`}>
                  {r.title}
                </h5>
                <p className={`text-[10px] mt-0.5 line-clamp-1 ${isCurrent ? 'text-white/80' : 'text-[#5F7065]'}`}>
                  {r.sub}
                </p>
              </button>
            );
          })}
        </div>

        {/* Role-Specific Live Preview Box */}
        {user?.role === 'expert' && (
          <div className="p-3.5 rounded-2xl bg-[#E6F2E5] border border-[#2F9E59]/40 text-xs text-[#152D24] space-y-1">
            <strong className="text-[#0B5137] block font-bold">कृषी शास्त्रज्ञ विशेष कक्ष (Expert Console):</strong>
            <span>तुम्हाला विदर्भातील यवतमाळ, अकोला व अमरावती येथील शेतकऱ्यांचे प्रश्न व रोग अहवाल तपासण्याची अधिकृत परवानगी आहे.</span>
          </div>
        )}

        {user?.role === 'retailer' && (
          <div className="p-3.5 rounded-2xl bg-[#E6F2E5] border border-[#0B5137]/30 text-xs text-[#152D24] space-y-1">
            <strong className="text-[#0B5137] block font-bold">कृषी सेवा केंद्र कक्ष (Retailer Console):</strong>
            <span>तुम्ही बियाणे, जैविक खते व औषधांचा साठा (Inventory) व शेतकऱ्यांच्या मागण्या व्यवस्थापित करू शकता.</span>
          </div>
        )}

        {user?.role === 'admin' && (
          <div className="p-3.5 rounded-2xl bg-[#E6F2E5] border border-[#5F7065]/40 text-xs text-[#152D24] space-y-1">
            <strong className="text-[#0B5137] block font-bold">प्रशासक नियंत्रण कक्ष (System Admin):</strong>
            <span>सर्व ११ विदर्भ जिल्ह्यांचे APMC दर सिंक, AI मॉडेल अचूकता (९४.२%), व सुरक्षित डेटाबेस ॲक्सेस सक्रिय आहे.</span>
          </div>
        )}
      </Card>

      {/* Main Profile Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Avatar & Language */}
        <div className="lg:col-span-4 space-y-4">
          <Card variant="white" className="p-6 text-center space-y-3 border-[#DDE8DC] shadow-sm">
            <div className="relative w-24 h-24 mx-auto">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                alt={user?.name || 'Farmer'}
                className="w-full h-full rounded-full object-cover ring-4 ring-[#2F9E59]/30"
              />
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#21864A] text-white flex items-center justify-center border-2 border-white text-xs">
                ✓
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-[#152D24]">
                {user?.name || 'गजानन पवार'}
              </h3>
              <p className="text-xs text-[#5F7065]">
                {user?.village}, {user?.district}
              </p>
            </div>

            <div className="pt-2 border-t border-[#DDE8DC] flex items-center justify-center gap-2">
              <Badge variant="success" size="sm">
                सक्रिय शेतकरी खाते
              </Badge>
            </div>
          </Card>

          {/* Global Language Switcher Box */}
          <Card variant="white" className="p-4 border-[#DDE8DC] bg-white shadow-sm space-y-3">
            <h4 className="font-bold text-xs text-[#152D24] uppercase tracking-wide flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#2F9E59]" />
              <span>पसंतीची भाषा (Language)</span>
            </h4>

            <div className="space-y-1.5">
              {[
                { code: 'mr' as Language, label: 'मराठी (Vidarbha Focus)' },
                { code: 'hi' as Language, label: 'हिंदी (Hindi)' },
                { code: 'en' as Language, label: 'English' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                    language === lang.code
                      ? 'bg-[#0B5137] text-white border-[#0B5137] shadow-sm'
                      : 'bg-[#E6F2E5] text-[#152D24] border-[#DDE8DC] hover:bg-white'
                  }`}
                >
                  <span>{lang.label}</span>
                  {language === lang.code && <CheckCircle2 className="w-4 h-4 text-[#E6F2E5]" />}
                </button>
              ))}
            </div>
          </Card>

          <Button
            variant="danger"
            size="md"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="w-full text-xs"
          >
            खात्यातून बाहेर पडा (Logout)
          </Button>
        </div>

        {/* Right Column: Editable Profile Fields */}
        <div className="lg:col-span-8">
          <Card variant="white" className="p-6 border-[#DDE8DC] space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE8DC]">
              <h4 className="font-black text-base text-[#152D24]">
                शेतकरी व शेती माहिती संपादन
              </h4>
              {savedSuccess && (
                <span className="text-xs font-bold text-[#21864A] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  माहिती जतन झाली!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#152D24] mb-1">
                    शेतकऱ्याचे नाव
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F6F8F0] border border-[#DDE8DC] text-[#152D24] rounded-xl p-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B5137]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#152D24] mb-1">
                    मोबाईल नंबर
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F6F8F0] border border-[#DDE8DC] text-[#152D24] rounded-xl p-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B5137]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#152D24] mb-1">
                    जिल्हा (District)
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-[#F6F8F0] border border-[#DDE8DC] text-[#152D24] rounded-xl p-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B5137]"
                  >
                    <option value="यवतमाळ (Yavatmal)">यवतमाळ (Yavatmal)</option>
                    <option value="अमरावती (Amravati)">अमरावती (Amravati)</option>
                    <option value="अकोला (Akola)">अकोला (Akola)</option>
                    <option value="वर्धा (Wardha)">वर्धा (Wardha)</option>
                    <option value="नागपूर (Nagpur)">नागपूर (Nagpur)</option>
                    <option value="बुलढाणा (Buldhana)">बुलढाणा (Buldhana)</option>
                    <option value="वाशीम (Washim)">वाशीम (Washim)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#152D24] mb-1">
                    गाव / तालुका
                  </label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full bg-[#F6F8F0] border border-[#DDE8DC] text-[#152D24] rounded-xl p-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B5137]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#152D24] mb-1">
                    शेती क्षेत्रफळ (एकर)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={farmSizeAcres}
                    onChange={(e) => setFarmSizeAcres(Number(e.target.value))}
                    className="w-full bg-[#F6F8F0] border border-[#DDE8DC] text-[#152D24] rounded-xl p-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B5137]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#152D24] mb-1">
                  शेतातील सक्रिय पिके (स्वल्पविराम देऊन लिहा)
                </label>
                <input
                  type="text"
                  required
                  value={activeCropsText}
                  onChange={(e) => setActiveCropsText(e.target.value)}
                  placeholder="उदा. कापूस, सोयाबीन, तूर"
                  className="w-full bg-[#F6F8F0] border border-[#DDE8DC] text-[#152D24] rounded-xl p-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B5137]"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={<Save className="w-4 h-4" />}
                  className="font-bold"
                >
                  बदल जतन करा (Save Changes)
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
