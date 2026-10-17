import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, MapPin, Scale, Cookie, RotateCcw, FileText, Heart } from 'lucide-react';

interface FooterProps {
  onOpenCookiePreferences?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCookiePreferences }) => {
  return (
    <footer className="bg-[#0A2540] text-white border-t border-[#1E3A5F] mt-auto" role="contentinfo" aria-label="KrushiScan Footer">
      {/* Signature Tri-color stripe on top of footer */}
      <div className="h-1 w-full flex shrink-0" role="presentation" aria-hidden="true">
        <div className="h-full flex-1 bg-[#FF9933]" />
        <div className="h-full flex-1 bg-white" />
        <div className="h-full flex-1 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand & Purpose */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="KrushiScan AI" className="w-7 h-7" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                KrushiScan <span className="text-[#FF9933]">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              विदर्भातील कापूस, सोयाबीन व तूर उत्पादक शेतकरी बांधवांसाठी प्रगत AI पीक रोग निदान, अचूक हवामान व थेट बाजारभाव प्रणाली.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#4CC46A] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>DPDP Act 2023 व IT Act 2000 सुसंगत</span>
            </div>
          </div>

          {/* Column 2: Legal Policies */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#FF9933]">
              कायदेशीर धोरणे (Legal Policies)
            </h2>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/privacy" className="hover:text-white transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3B6EA5]" aria-hidden="true" />
                  <span>गोपनीयता धोरण (Privacy Policy)</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-sm">
                  <Scale className="w-3.5 h-3.5 text-[#3B6EA5]" aria-hidden="true" />
                  <span>नियम व अटी (Terms & Conditions)</span>
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-sm">
                  <Cookie className="w-3.5 h-3.5 text-[#3B6EA5]" aria-hidden="true" />
                  <span>कुकी धोरण (Cookie Policy)</span>
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-white transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-sm">
                  <RotateCcw className="w-3.5 h-3.5 text-[#3B6EA5]" aria-hidden="true" />
                  <span>परतावा व शिपिंग (Refund Policy)</span>
                </Link>
              </li>
              {onOpenCookiePreferences && (
                <li>
                  <button
                    onClick={onOpenCookiePreferences}
                    className="text-left text-[#4CC46A] hover:underline font-bold text-[11px] pt-1"
                    aria-label="Manage cookie consent preferences"
                  >
                    कुकी प्राधान्ये बदला (Cookie Settings)
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Corporate Details */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#FF9933]">
              कंपनी माहिती (Corporate Info)
            </h2>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">कंपनी नाव:</strong><br />
                KrushiScan AI Agritech Private Limited [FILL IN]
              </p>
              <p>
                <strong className="text-white">GSTIN / नोंदणी:</strong><br />
                27AABCK1234F1Z5 [FILL IN]
              </p>
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#3B6EA5] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Plot No. 42, Krushi Vikas Bhavan, MIDC Area, Yavatmal, Maharashtra - 445001 [FILL IN]</span>
              </p>
            </div>
          </div>

          {/* Column 4: Contact & Grievance */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#FF9933]">
              तक्रार निवारण (Grievance Redressal)
            </h2>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                <strong className="text-white">तक्रार अधिकारी:</strong><br />
                Sanket Linganwar [FILL IN]
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#3B6EA5] shrink-0" aria-hidden="true" />
                <a href="mailto:grievance@krushiscan.ai" className="text-slate-200 hover:text-white underline">
                  grievance@krushiscan.ai [FILL IN]
                </a>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#3B6EA5] shrink-0" aria-hidden="true" />
                <a href="mailto:support@krushiscan.ai" className="text-slate-200 hover:text-white underline">
                  support@krushiscan.ai [FILL IN]
                </a>
              </p>
              <p className="text-[10px] text-slate-400 pt-1">
                तक्रार निवारण कालावधी: ३० कामकाजाचे दिवस
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Accessibility */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <p>
            © {new Date().getFullYear()} KrushiScan AI Agritech Private Limited. सर्व हक्क सुरक्षित (All Rights Reserved).
          </p>
          <p className="flex items-center gap-1 text-[11px]">
            शेतकऱ्यांसाठी प्रेमाने बनवलेले <Heart className="w-3 h-3 text-[#FF9933] inline fill-[#FF9933]" aria-hidden="true" /> विदर्भ, महाराष्ट्र.
          </p>
        </div>
      </div>
    </footer>
  );
};
