import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  timestamp: string;
}

interface CookieConsentBannerProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ forceOpen = false, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [allowFunctional, setAllowFunctional] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsVisible(true);
      setShowPreferences(true);
      return;
    }
    const saved = localStorage.getItem('krushiscan_cookie_consent');
    if (!saved) {
      setIsVisible(true);
    } else {
      try {
        const parsed: CookiePreferences = JSON.parse(saved);
        // Re-ask if consent is older than 180 days (6 months)
        const consentAgeDays = (Date.now() - new Date(parsed.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        if (consentAgeDays > 180) {
          setIsVisible(true);
        }
      } catch {
        setIsVisible(true);
      }
    }
  }, [forceOpen]);

  const saveConsent = (functional: boolean) => {
    const preferences: CookiePreferences = {
      essential: true,
      functional,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('krushiscan_cookie_consent', JSON.stringify(preferences));
    setIsVisible(false);
    if (onClose) onClose();
  };

  const handleAcceptAll = () => saveConsent(true);
  const handleRejectNonEssential = () => saveConsent(false);
  const handleSaveCustom = () => saveConsent(allowFunctional);

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5 bg-white border-t-2 border-[#2F9E59] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Text and Privacy Link */}
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-black text-[#152D24]">
              <Cookie className="w-4 h-4 text-[#2F9E59]" aria-hidden="true" />
              <span>डेटा गोपनीयता व कुकीज संमती (Privacy & Cookie Consent)</span>
            </div>
            <p className="text-xs text-[#5F7065] leading-relaxed">
              KrushiScan AI शेतीविषयक अचूक रोग निदान व पीक नोंदी जतन करण्यासाठी आवश्यक स्थानिक साठवणूक (LocalStorage) चा वापर करते. आम्ही कोणतीही जाहिरात ट्रॅकर्स वापरत नाही. अधिक माहितीसाठी आमचे{' '}
              <Link to="/privacy" className="text-[#152D24] font-bold underline hover:text-[#2F9E59]">
                गोपनीयता धोरण (Privacy Policy)
              </Link>
              {' '}आणि{' '}
              <Link to="/cookies" className="text-[#152D24] font-bold underline hover:text-[#2F9E59]">
                कुकी धोरण (Cookie Policy)
              </Link>{' '}
              पहा.
            </p>
          </div>

          {/* Action Buttons (Strict Equal Weight: Accept & Reject) */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="text-xs font-bold text-[#2F9E59] hover:underline px-2 py-2 flex items-center gap-1"
              aria-expanded={showPreferences}
              aria-controls="cookie-preferences-details"
            >
              <span>प्राधान्ये निवडा (Preferences)</span>
              {showPreferences ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Equal Weight Reject Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRejectNonEssential}
              className="flex-1 sm:flex-none border-[#DDE8DC] text-[#152D24] hover:bg-[#E6F2E5] font-bold text-xs"
            >
              केवळ आवश्यक (Reject Non-Essential)
            </Button>

            {/* Equal Weight Accept Button */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-none bg-[#0B5137] hover:bg-[#073D2A] text-white font-bold text-xs shadow-xs"
            >
              सर्व स्वीकारा (Accept All)
            </Button>
          </div>
        </div>

        {/* Detailed Preferences Panel (No pre-ticked non-essential boxes) */}
        {showPreferences && (
          <div id="cookie-preferences-details" className="mt-4 pt-4 border-t border-[#DDE8DC] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-in fade-in">
            <div className="p-3 rounded-xl bg-[#F6F8F0] border border-[#DDE8DC] flex items-start gap-3">
              <input
                type="checkbox"
                id="cookie-essential"
                checked
                disabled
                className="mt-0.5 w-4 h-4 rounded text-[#2F9E59] border-[#DDE8DC] cursor-not-allowed"
              />
              <div>
                <label htmlFor="cookie-essential" className="font-bold text-[#152D24] block">
                  १. अत्यावश्यक कुकीज (Essential - Always Active)
                </label>
                <p className="text-[#5F7065] text-[11px] mt-0.5">
                  शेतकरी लॉगिन ऑथेंटिकेशन आणि सुरक्षा सत्र टोकनसाठी अनिवार्य. याशिवाय प्रणाली कार्यरत राहू शकत नाही.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F6F8F0] border border-[#DDE8DC] flex items-start gap-3">
              <input
                type="checkbox"
                id="cookie-functional"
                checked={allowFunctional}
                onChange={(e) => setAllowFunctional(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#2F9E59] border-[#DDE8DC] focus:ring-[#2F9E59]"
              />
              <div>
                <label htmlFor="cookie-functional" className="font-bold text-[#152D24] block cursor-pointer">
                  २. कार्यात्मक ऑफलाइन डेटा (Functional Offline Storage)
                </label>
                <p className="text-[#5F7065] text-[11px] mt-0.5">
                  विदर्भातील शेतात इंटरनेट नसतानाही पीक नोंदी आणि मागील रोग स्कॅन फोटो स्थानिक मेमरीमध्ये उपलब्ध ठेवणे. (Pre-ticked नाही).
                </p>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end pt-1">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveCustom}
                className="text-xs font-bold"
              >
                माझी निवड जतन करा (Save Preferences)
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
