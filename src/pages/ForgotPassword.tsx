import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ForgotPassword: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone) {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF3F8] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card variant="white" className="p-6 sm:p-8 border-[#D5DEE8] shadow-sm">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#5B6B7D] hover:text-[#0A2540] font-semibold mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            लॉगिनकडे परत जा
          </Link>

          <h2 className="text-xl font-black text-[#0A2540] mb-1">
            पासवर्ड पुनर्प्राप्ती (Password Reset)
          </h2>
          <p className="text-xs text-[#5B6B7D] mb-4 pb-3 border-b border-[#D5DEE8]">
            तुमचा नोंदणीकृत मोबाईल नंबर टाका. त्यावर ओटीपी (OTP) पाठवला जाईल.
          </p>

          {sent ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#0A2540] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#138808]">
                <CheckCircle2 className="w-5 h-5 text-[#138808]" />
                <span>ओटीपी यशस्वीरित्या पाठवला आहे!</span>
              </div>
              <p>
                मोबाईल नंबर <strong>{phone}</strong> वर सुरक्षित पासवर्ड रीसेट पडताळणी कोड पाठवला आहे. कृपया संदेश तपासा.
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="primary" size="sm" className="w-full">
                    लॉगिन करा
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0A2540] mb-1">
                  नोंदणीकृत मोबाईल नंबर
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#5B6B7D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="उदा. 9876543210"
                    className="w-full bg-white border border-[#D5DEE8] rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full text-sm font-bold">
                ओटीपी पाठवा (Send OTP)
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
