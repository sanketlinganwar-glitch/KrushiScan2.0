import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, UserPlus, Phone, User, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Signup: React.FC = () => {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('यवतमाळ (Yavatmal)');
  const [village, setVillage] = useState('');
  const [farmSizeAcres, setFarmSizeAcres] = useState(5);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await signup(
      {
        name,
        phone,
        district,
        village,
        farmSizeAcres: Number(farmSizeAcres),
        activeCrops: ['कापूस (Cotton)', 'सोयाबीन (Soybean)', 'तूर (Pigeonpea)'],
        role: 'farmer',
      },
      password
    );

    setIsLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.');
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF3F8] flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#0A2540] border-2 border-[#FF9933] flex items-center justify-center shadow-lg mx-auto mb-2">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="KrushiScan" className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-[#0A2540]">
          KrushiScan <span className="text-[#0A2540]">AI</span> नोंदणी
        </h1>
        <p className="text-xs text-[#138808] font-bold">
          विदर्भातील शेतकरी बांधवांसाठी मोफत नोंदणी
        </p>
      </div>

      <div className="w-full max-w-md">
        <Card variant="white" className="p-6 sm:p-8 border-[#D5DEE8] shadow-sm">
          <h2 className="text-lg font-black text-[#0A2540] mb-1">नवीन शेतकरी खाते</h2>
          <p className="text-xs text-[#5B6B7D] mb-4 pb-3 border-b border-[#D5DEE8]">
            रोग निदान, पीक व्यवस्थापन व थेट बाजार भावासाठी माहिती भरा
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#C0392B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C0392B]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#0A2540] mb-1">
                शेतकऱ्याचे नाव
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="उदा. गजानन पवार"
                className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A2540] mb-1">
                मोबाईल नंबर
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="उदा. 9876543210"
                className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0A2540] mb-1">
                  जिल्हा
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                >
                  <option value="यवतमाळ (Yavatmal)">यवतमाळ</option>
                  <option value="अमरावती (Amravati)">अमरावती</option>
                  <option value="अकोला (Akola)">अकोला</option>
                  <option value="वर्धा (Wardha)">वर्धा</option>
                  <option value="नागपूर (Nagpur)">नागपूर</option>
                  <option value="बुलढाणा (Buldhana)">बुलढाणा</option>
                  <option value="वाशीम (Washim)">वाशीम</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A2540] mb-1">
                  गाव / तालुका
                </label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="उदा. दारव्हा"
                  className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0A2540] mb-1">
                  शेती क्षेत्र (एकर)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={farmSizeAcres}
                  onChange={(e) => setFarmSizeAcres(Number(e.target.value))}
                  className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A2540] mb-1">
                  पासवर्ड
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-base font-extrabold shadow-sm mt-2"
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              खाते तयार करा (Register)
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#D5DEE8] text-center text-xs text-[#5B6B7D]">
            आधीच खाते आहे का?{' '}
            <Link to="/login" className="text-[#0A2540] font-black underline hover:text-[#3B6EA5]">
              लॉगिन करा (Login)
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
