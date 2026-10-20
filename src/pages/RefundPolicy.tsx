import React from 'react';
import { RotateCcw, Truck, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const RefundPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#DDE8DC] pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-[#21864A] uppercase tracking-wider mb-2">
          <RotateCcw className="w-4 h-4" />
          <span>ग्राहक संरक्षण • Refund, Cancellation & Shipping Policy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#152D24]">
          परतावा, रद्दीकरण व शिपिंग धोरण
        </h1>
        <p className="text-xs sm:text-sm text-[#5F7065] mt-1">
          अंतिम अद्यतन दिनांक (Last Updated): १७ ऑक्टोबर २०२६ • ग्राहक संरक्षण (ई-कॉमर्स) नियम २०२० नुसार
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card variant="white" className="p-4 border-t-4 border-t-[#0B5137]">
          <div className="flex items-center gap-2 font-bold text-xs text-[#152D24] mb-1">
            <Clock className="w-4 h-4 text-[#0B5137]" />
            <span>२४ तास रद्दीकरण</span>
          </div>
          <p className="text-[11px] text-[#5F7065]">ऑर्डर पाठवण्यापूर्वी (Dispatch आधी) मोफत रद्दीकरण.</p>
        </Card>
        <Card variant="white" className="p-4 border-t-4 border-t-[#21864A]">
          <div className="flex items-center gap-2 font-bold text-xs text-[#152D24] mb-1">
            <RotateCcw className="w-4 h-4 text-[#21864A]" />
            <span>७ दिवस परतावा</span>
          </div>
          <p className="text-[11px] text-[#5F7065]">दोषी किंवा खराब वस्तू मिळाल्यास ७ दिवसांत मोफत बदलून मिळेल.</p>
        </Card>
        <Card variant="white" className="p-4 border-t-4 border-t-[#E9A23B]">
          <div className="flex items-center gap-2 font-bold text-xs text-[#152D24] mb-1">
            <Truck className="w-4 h-4 text-[#E9A23B]" />
            <span>२-५ दिवस डिलिव्हरी</span>
          </div>
          <p className="text-[11px] text-[#5F7065]">विदर्भातील सर्व तालुक्यांमध्ये थेट कृषी केंद्र नेटवर्कमार्फत.</p>
        </Card>
      </div>

      {/* Section 1: Order Cancellation */}
      <Card variant="white" className="p-6 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          १. ऑर्डर रद्दीकरण (Order Cancellation)
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065] leading-relaxed">
          शेतकरी बांधव आपली ऑर्डर गोदामातून पाठवण्यापूर्वी (Dispatch होण्याआधी) आमच्या हेल्पलाइनवर कॉल करून किंवा <strong>support@krushiscan.ai</strong> वर ईमेल पाठवून रद्द करू शकतात. एकदा ऑर्डर पाठवल्यानंतर डिलिव्हरीच्या वेळी ती नाकारता येईल, परंतु परतावा प्रक्रियेस सामान्यतः ३ ते ५ दिवस लागतील.
        </p>
      </Card>

      {/* Section 2: Returns & Replacement */}
      <Card variant="white" className="p-6 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          २. परतावा व बदली नियम (Returns & Replacement Policy)
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#5F7065]">
          <li>
            <strong>पात्र उत्पादने (Eligible for Return):</strong> बॅटरी स्प्रेअर पंप, कामगंध सापळे, आणि बंद पॅकेटमधील कृषी साधने जर डिलिव्हरीच्या वेळी तुटलेली किंवा सदोष आढळली, तर डिलिव्हरीच्या ७ दिवसांच्या आत मोफत बदलून मिळतील.
          </li>
          <li>
            <strong>अपात्र उत्पादने (Non-Returnable for Biosecurity):</strong> बियाण्यांचे उघडलेले पाकीट किंवा सील तोडलेले जैविक खत/बुरशीनाशक जैविक सुरक्षेच्या व गुणवत्तेच्या कारणास्तव परत घेतले जात नाही.
          </li>
        </ul>
      </Card>

      {/* Section 3: Refund Timelines */}
      <Card variant="white" className="p-6 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          ३. परतावा कालावधी व पद्धत (Refund Mode & Timelines)
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065] leading-relaxed">
          मान्य झालेल्या परताव्याची रक्कम ज्या मूळ खात्यावरून (Razorpay UPI, किसान क्रेडिट कार्ड / KCC, किंवा बँक खाते) भरणा केला होता, त्याच खात्यात <strong>५ ते ७ कामकाजाच्या दिवसांत (Business Days)</strong> जमा केली जाईल. कॅश ऑन डिलिव्हरी (COD) द्वारे केलेल्या ऑर्डर्ससाठी शेतकऱ्याच्या बँक खात्यात थेट NEFT/UPI द्वारे रक्कम जमा केली जाईल.
        </p>
      </Card>

      {/* Section 4: Shipping & Delivery Network */}
      <Card variant="white" className="p-6 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          ४. शिपिंग व वाहतूक तपशील (Shipping & Local Logistics)
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065] leading-relaxed">
          KrushiScan AI विदर्भातील ११ जिल्ह्यांतील (यवतमाळ, अमरावती, अकोला, वर्धा, बुलढाणा, वाशीम, नागपूर, चंद्रपूर, भंडारा, गोंदिया, गडचिरोली) अधिकृत कृषी विज्ञान केंद्र आणि महाबीज विक्रेत्यांच्या सहकार्याने काम करते. सामान्यतः ऑर्डर दिल्यानंतर २ ते ५ दिवसांत शेतकऱ्यांच्या नजीकच्या तालुका केंद्रावर अथवा पत्त्यावर पोचवली जाते.
        </p>
      </Card>

      {/* Corporate Contact */}
      <div className="text-xs text-[#5F7065] text-center pt-4">
        ऑर्डर व शिपिंग साहाय्य कक्ष: <a href="mailto:support@krushiscan.ai" className="text-[#2F9E59] underline font-bold">support@krushiscan.ai</a> • फोन: +91 98765 43210 [FILL IN]
      </div>
    </div>
  );
};
