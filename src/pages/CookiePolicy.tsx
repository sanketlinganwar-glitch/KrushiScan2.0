import React from 'react';
import { Cookie, ShieldCheck, RefreshCw, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const CookiePolicy: React.FC = () => {
  const handleClearPreferences = () => {
    localStorage.removeItem('krushiscan_cookie_consent');
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#DDE8DC] pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-[#E9A23B] uppercase tracking-wider mb-2">
          <Cookie className="w-4 h-4" />
          <span>कुकीज व स्थानिक साठवणूक धोरण • Cookie & LocalStorage Policy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#152D24]">
          कुकी धोरण (Cookie Policy)
        </h1>
        <p className="text-xs sm:text-sm text-[#5F7065] mt-1">
          अंतिम अद्यतन दिनांक (Last Updated): १७ ऑक्टोबर २०२६ • आवृत्ती २.०
        </p>
      </div>

      {/* Overview */}
      <Card variant="white" className="p-6 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          १. कुकीज व स्थानिक साठवणूक म्हणजे काय? (What are Cookies & LocalStorage?)
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065] leading-relaxed">
          KrushiScan AI हे शेतकऱ्यांना ऑफलाइन स्थितीतही पीक नोंदी व रोगांची माहिती पाहता यावी यासाठी आधुनिक वेब ब्राउझर <strong>LocalStorage</strong> आणि आवश्यक कुकीजचा वापर करते. आम्ही तृतीय पक्षाच्या जाहिरात ट्रॅकर्स (Ad Pixels) चा वापर करत नाही.
        </p>
      </Card>

      {/* Itemized Table */}
      <Card variant="white" className="p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          २. आम्ही वापरत असलेल्या घटकांची संपूर्ण यादी (Itemized Inventory)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#DDE8DC] rounded-xl overflow-hidden">
            <thead className="bg-[#E6F2E5] text-[#152D24] font-black border-b border-[#DDE8DC]">
              <tr>
                <th className="p-3">घटकाचे नाव (Key Name)</th>
                <th className="p-3">प्रवर्ग (Category)</th>
                <th className="p-3">कालावधी (Duration)</th>
                <th className="p-3">उद्दिष्ट (Purpose)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE8DC] text-[#5F7065]">
              <tr>
                <td className="p-3 font-mono font-bold text-[#152D24]">krushiscan_user_session</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-[#E6F2E5] text-[#21864A] font-bold text-[10px]">
                    अत्यावश्यक (Essential)
                  </span>
                </td>
                <td className="p-3">सत्र संपेपर्यंत (Session / 7 Days)</td>
                <td className="p-3">शेतकरी खात्यात सुरक्षित लॉग इन ठेवण्यासाठी आवश्यक ऑथेंटिकेशन टोकन.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-[#152D24]">krushiscan_cookie_consent</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-[#E6F2E5] text-[#21864A] font-bold text-[10px]">
                    अत्यावश्यक (Essential)
                  </span>
                </td>
                <td className="p-3">१ वर्ष (1 Year)</td>
                <td className="p-3">वापरकर्त्याने कुकी संमती स्वीकारली अथवा नाकारली याची नोंद ठेवणे.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-[#152D24]">krushiscan_crops</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-[#E6F2E5] text-[#0B5137] font-bold text-[10px]">
                    कार्यात्मक (Functional)
                  </span>
                </td>
                <td className="p-3">ब्राउझर साफ करेपर्यंत</td>
                <td className="p-3">इंटरनेट नसतानाही शेतात आपल्या पिकांचे क्षेत्र व नोंदी दाखवणे.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-[#152D24]">krushiscan_scans</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-[#E6F2E5] text-[#0B5137] font-bold text-[10px]">
                    कार्यात्मक (Functional)
                  </span>
                </td>
                <td className="p-3">ब्राउझर साफ करेपर्यंत</td>
                <td className="p-3">मागील पीक रोग स्कॅन व औषधोपचारांची माहिती ऑफलाइन उपलब्ध ठेवणे.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-[#152D24]">krushiscan_orders</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-[#E6F2E5] text-[#0B5137] font-bold text-[10px]">
                    कार्यात्मक (Functional)
                  </span>
                </td>
                <td className="p-3">ब्राउझर साफ करेपर्यंत</td>
                <td className="p-3">शेतकऱ्याने नोंदवलेल्या कृषी ऑर्डर्सचा स्थानिक इतिहास.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Control / Manage Preferences */}
      <Card variant="white" className="p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          ३. आपली प्राधान्ये नियंत्रित करा (Manage Your Cookie Preferences)
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065] leading-relaxed">
          आपण खालील बटणावर क्लिक करून आपली कुकी संमती कधीही रीसेट करू शकता. यामुळे संमती बॅनर पुन्हा दिसेल व आपण प्राधान्य बदलू शकाल.
        </p>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearPreferences}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            कुकी संमती रीसेट करा (Reset Cookie Preferences)
          </Button>
        </div>
      </Card>
    </div>
  );
};
