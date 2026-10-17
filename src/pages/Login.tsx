import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  AlertCircle,
  Phone,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await login(phoneOrEmail, password);
    setIsLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'लॉगिन अयशस्वी. कृपया तपशील तपासा.');
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF3F8] flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-[#0A2540] border-2 border-[#FF9933] flex items-center justify-center shadow-lg mx-auto mb-3">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="KrushiScan" className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-[#0A2540] tracking-tight">
          KrushiScan <span className="text-[#0A2540]">AI</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#138808] font-bold mt-1">
          {t('tagline')}
        </p>
      </div>

      <div className="w-full max-w-md space-y-5">
        {/* Login Card */}
        <Card variant="white" className="p-6 sm:p-8 border-[#D5DEE8] shadow-sm">
          <div className="pb-4 mb-4 border-b border-[#D5DEE8] text-center">
            <h2 className="text-xl font-black text-[#0A2540]">शेतकरी लॉगिन</h2>
            <p className="text-xs text-[#5B6B7D] mt-0.5">
              तुमच्या खात्यात प्रवेश करण्यासाठी मोबाईल नंबर टाका
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#C0392B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C0392B]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-identifier" className="block text-xs font-bold text-[#0A2540] mb-1">
                मोबाईल नंबर किंवा ईमेल
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#5B6B7D] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="login-identifier"
                  type="text"
                  required
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="उदा. 9876543210"
                  className="w-full bg-white border border-[#D5DEE8] rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-password" className="text-xs font-bold text-[#0A2540]">
                  पासवर्ड / पिन
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#3B6EA5] hover:underline font-bold"
                >
                  पासवर्ड विसरलात?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5B6B7D] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#D5DEE8] rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-base font-extrabold shadow-sm mt-2"
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              लॉगिन करा (Login)
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#D5DEE8] text-center text-xs text-[#5B6B7D]">
            नवीन शेतकरी आहात का?{' '}
            <Link to="/signup" className="text-[#0A2540] font-black underline hover:text-[#3B6EA5]">
              येथे नोंदणी करा (Sign Up)
            </Link>
          </div>
        </Card>

      </div>
    </div>
  );
};
