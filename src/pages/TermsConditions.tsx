import React from 'react';
import { Scale, AlertTriangle, ShieldAlert, CheckCircle, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const TermsConditions: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#DDE8DC] pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-[#2F9E59] uppercase tracking-wider mb-2">
          <Scale className="w-4 h-4" />
          <span>कायदेशीर नियम • Terms of Service & Agricultural Advisory Disclaimer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#152D24]">
          नियम व अटी (Terms & Conditions)
        </h1>
        <p className="text-xs sm:text-sm text-[#5F7065] mt-1">
          अंतिम अद्यतन दिनांक (Last Updated): १७ ऑक्टोबर २०२६ • आवृत्ती २.०
        </p>
      </div>

      {/* Critical Agricultural Advisory Disclaimer */}
      <Card variant="white" className="p-5 border-l-4 border-l-[#C83E3E] bg-red-50/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#C83E3E] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <h2 className="font-black text-[#C83E3E]">
              महत्त्वाची कृषी सल्ला सूचना व मर्यादा (Agricultural Advisory Disclaimer)
            </h2>
            <p className="text-[#5F7065] leading-relaxed">
              KrushiScan AI प्रणालीद्वारे दिले जाणारे पीक रोग निदान, किडींचे प्रमाण आणि शिफारशी ही केवळ <strong>निर्णय साहाय्यक साधने (Decision-Support Tools)</strong> आहेत. शेतातील प्रत्यक्ष परिणाम स्थानिक हवामान, जमिनीचा प्रकार, पाण्याचा निचरा आणि फवारणीच्या वेळेवर अवलंबून असतात. कोणतीही कीटकनाशके किंवा बुरशीनाशके वापरण्यापूर्वी संबंधित औषधाच्या अधिकृत पाकिटावरील सूचना वाचाव्यात व स्थानिक कृषी विज्ञान केंद्र (KVK) किंवा कृषी अधिकाऱ्यांचा प्रत्यक्ष सल्ला घ्यावा.
            </p>
          </div>
        </div>
      </Card>

      {/* Section 1: Acceptance */}
      <Card variant="white" className="p-6 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          १. अटींची स्वीकृती (Acceptance of Terms)
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065] leading-relaxed">
          KrushiScan AI प्लॅटफॉर्मचा वापर करून किंवा येथे खाते तयार करून आपण या नियम व अटींशी कायदेशीररित्या बांधील राहण्यास मान्यता देता. आपण १८ वर्षांपेक्षा जास्त वयाचे असणे आवश्यक आहे. जर आपण या अटींशी सहमत नसाल, तर कृपया प्लॅटफॉर्मचा वापर थांबवावा.
        </p>
      </Card>

      {/* Section 2: Account Responsibilities */}
      <Card variant="white" className="p-6 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          २. शेतकरी खाते व सुरक्षितता (Account Security)
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#5F7065]">
          <li>आपल्या खात्याचा संकेतशब्द (Password) गोपनीय ठेवण्याची संपूर्ण जबाबदारी आपली राहील.</li>
          <li>खात्याद्वारे होणाऱ्या सर्व कृषी नोंदी, ऑर्डर्स आणि विनंत्यांसाठी खातेधारक जबाबदार असेल.</li>
          <li>चुकीची, दिशाभूल करणारी अथवा दुसऱ्या शेतकऱ्याची वैयक्तिक माहिती टाकण्यास सक्त मनाई आहे.</li>
        </ul>
      </Card>

      {/* Section 3: Agri Store & Purchases */}
      <Card variant="white" className="p-6 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          ३. कृषी दुकान, देयके व खरेदी (Store Purchases & Payments)
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065] leading-relaxed">
          प्लॅटफॉर्मवर सूचीबद्ध असलेली उत्पादने (उदा. कामगंध सापळे, जैविक बुरशीनाशके, प्रमाणित बियाणे) अधिकृत विक्रेत्यांकडून पुरवली जातात.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs text-[#5F7065]">
          <li>किमती भारतीय रुपयांमध्ये (INR) असून सर्व लागू करांसह दर्शवल्या जातात.</li>
          <li>पेमेंट्स Razorpay द्वारे (UPI, किसान क्रेडिट कार्ड / KCC, नेट बँकिंग) अथवा कॅश ऑन डिलिव्हरी (COD) द्वारे स्वीकारली जातात.</li>
          <li>ऑर्डर रद्द करणे व परतावा यासाठी आमचे <strong>रिफंड व शिपिंग धोरण</strong> लागू राहील.</li>
        </ul>
      </Card>

      {/* Section 4: Limitation of Liability & Force Majeure */}
      <Card variant="white" className="p-6 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          ४. दायित्व मर्यादा व नैसर्गिक आपत्ती (Limitation of Liability & Force Majeure)
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065] leading-relaxed">
          KrushiScan AI, त्याचे संचालक, शास्त्रज्ञ किंवा कर्मचारी कोणत्याही पीक नुकसानीसाठी, अवकाळी पाऊस, दुष्काळ, अतिवृष्टी, कीड साथीचा मोठा उद्रेक किंवा नैसर्गिक आपत्तींमुळे होणाऱ्या आर्थिक नुकसानीस जबाबदार असणार नाहीत. कोणत्याही परिस्थितीत आमचे कमाल दायित्व आपण विशिष्ट सेवेसाठी भरलेल्या शुल्कापेक्षा जास्त असणार नाही.
        </p>
      </Card>

      {/* Section 5: Intellectual Property */}
      <Card variant="white" className="p-6 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          ५. बौद्धिक संपदा हक्क (Intellectual Property)
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065] leading-relaxed">
          KrushiScan AI वरील सर्व अल्गोरिदम, डिझाइन, लोगो, सॉफ्टवेअर कोड, कृषी डेटा मॉडेल्स आणि मजकूर हे KrushiScan AI Agritech Private Limited चे विशेष बौद्धिक हक्क आहेत. पूर्वपरवानगीशिवाय प्लॅटफॉर्मचा कोणताही भाग कॉपी किंवा पुनरुत्पादित करण्यास कायद्याने मनाई आहे.
        </p>
      </Card>

      {/* Section 6: Governing Law & Jurisdiction */}
      <Card variant="white" className="p-6 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          ६. लागू कायदा व न्यायक्षेत्र (Governing Law & Jurisdiction)
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065] leading-relaxed">
          या अटींचे नियमन व अर्थ लावण्यासाठी भारतीय कायदे लागू राहतील. या प्लॅटफॉर्मच्या वापरासंदर्भातील कोणत्याही विवादासाठी <strong>यवतमाळ / नागपूर, महाराष्ट्र (भारत)</strong> येथील न्यायालयांचे एकमेव व विशेष अधिकारक्षेत्र राहील.
        </p>
      </Card>

      {/* Corporate Details */}
      <div className="text-xs text-[#5F7065] text-center pt-4">
        कंपनी नोंदणी: KrushiScan AI Agritech Private Limited • GSTIN: 27AABCK1234F1Z5 [FILL IN] • संपर्क: support@krushiscan.ai
      </div>
    </div>
  );
};
