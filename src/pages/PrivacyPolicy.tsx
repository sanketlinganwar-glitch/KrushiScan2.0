import React from 'react';
import { ShieldCheck, Mail, MapPin, Phone, Lock, FileText, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#DDE8DC] pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-[#21864A] uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>कायदेशीर अनुपालन • Digital Personal Data Protection Act (DPDP Act) 2023</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#152D24]">
          गोपनीयता धोरण (Privacy Policy)
        </h1>
        <p className="text-xs sm:text-sm text-[#5F7065] mt-1">
          अंतिम अद्यतन दिनांक (Last Updated): १७ ऑक्टोबर २०२६ • आवृत्ती २.०
        </p>
      </div>

      {/* Corporate Summary Card */}
      <Card variant="white" className="p-5 border-l-4 border-l-[#21864A]">
        <h2 className="text-sm font-black text-[#152D24] mb-2">कंपनी माहिती (Entity Information)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5F7065]">
          <div>
            <span className="font-bold text-[#152D24]">कायदेशीर नाव (Legal Name):</span>{' '}
            KrushiScan AI Agritech Private Limited [FILL IN]
          </div>
          <div>
            <span className="font-bold text-[#152D24]">नोंदणीकृत पत्ता (Address):</span>{' '}
            Plot No. 42, Krushi Vikas Bhavan, MIDC Area, Yavatmal, Maharashtra - 445001, India [FILL IN]
          </div>
          <div>
            <span className="font-bold text-[#152D24]">संपर्क ईमेल (Contact Email):</span>{' '}
            <a href="mailto:support@krushiscan.ai" className="text-[#2F9E59] underline">support@krushiscan.ai</a> [FILL IN]
          </div>
          <div>
            <span className="font-bold text-[#152D24]">तक्रार निवारण अधिकारी (Grievance Officer):</span>{' '}
            Sanket Linganwar (grievance@krushiscan.ai) [FILL IN]
          </div>
        </div>
      </Card>

      {/* Section 1: Introduction */}
      <Card variant="white" className="p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          १. परिचय व उद्दिष्ट (Introduction & Scope)
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065] leading-relaxed">
          KrushiScan AI (कृषीस्कॅन AI) ही विदर्भातील शेतकरी बांधवांसाठी प्रगत कृषी तंत्रज्ञान, पीक रोग निदान, हवामान अंदाज, आणि बाजारभाव सेवा पुरवणारी प्रणाली आहे. आम्ही भारतीय संसदेने मंजूर केलेल्या <strong>डिजिटल पर्सनल डेटा प्रोटेक्शन कायदा २०२३ (DPDP Act 2023)</strong> आणि माहिती तंत्रज्ञान कायदा २००० (IT Act 2000) च्या नियमांनुसार आपल्या वैयक्तिक डेटाची पूर्ण गोपनीयता व सुरक्षितता राखण्यास वचनबद्ध आहोत.
        </p>
      </Card>

      {/* Section 2: Data We Collect */}
      <Card variant="white" className="p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          २. आम्ही कोणती माहिती गोळा करतो? (Data We Collect)
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-[#5F7065]">
          <div className="p-3 rounded-xl bg-[#E6F2E5]">
            <h3 className="font-bold text-[#152D24] mb-1">अ. शेतकऱ्याची थेट वैयक्तिक माहिती (Personal Identifiers):</h3>
            <p>शेतकऱ्याचे नाव, मोबाईल क्रमांक, गाव, तालुका आणि जिल्हा (उदा. यवतमाळ, अमरावती). ही माहिती खाते तयार करण्यासाठी व संपर्क साधण्यासाठी आवश्यक असते.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#E6F2E5]">
            <h3 className="font-bold text-[#152D24] mb-1">ब. कृषी व पीक व्यवस्थापन माहिती (Agronomic Data):</h3>
            <p>शेती क्षेत्र (एकर), पिकाचे नाव (कापूस, सोयाबीन, तूर), पेरणीची तारीख, जमिनीचा प्रकार (काळी कसदार), सिंचन प्रकार, आणि पिकांच्या पानांचे व किडींचे छायाचित्रे (Photos for AI Vision Diagnosis).</p>
          </div>
          <div className="p-3 rounded-xl bg-[#E6F2E5]">
            <h3 className="font-bold text-[#152D24] mb-1">क. व्यवहार व पेमेंट डेटा (Transaction Data):</h3>
            <p>कृषी सेवा व उत्पादने खरेदी करताना ऑर्डर तपशील व शिपिंग पत्ता. आम्ही क्रेडिट/डेबिट कार्ड क्रमांक किंवा नेट बँकिंग संकेतशब्द आमच्या सर्व्हरवर साठवत नाही; पेमेंट व्यवहार थेट RBI-मान्यताप्राप्त Razorpay इंडिया गेटवेमार्फत एन्क्रिप्टेड स्वरूपात पूर्ण होतात.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#E6F2E5]">
            <h3 className="font-bold text-[#152D24] mb-1">ड. स्वयंचलित तांत्रिक डेटा (Technical & Operational Logs):</h3>
            <p>अ‍ॅप वापरताना सुरक्षिततेसाठी IP पत्ता, ब्राउझर प्रकार, आणि सेवा विनंतीचा वेळ लॉग केला जातो.</p>
          </div>
        </div>
      </Card>

      {/* Section 3: Legal Basis & Purpose */}
      <Card variant="white" className="p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          ३. माहिती संकलनाचा कायदेशीर आधार व उद्देश (Legal Basis & Purpose)
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#5F7065]">
          <li><strong>सहमती (Consent):</strong> आपण नोंदणी करताना दिलेल्या संमतीच्या आधारे आम्ही AI रोग निदान व कृषी सल्ला पुरवतो.</li>
          <li><strong>अचूक हवामान व कृषी विद्यापीठ शिफारशी:</strong> डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV) व ICAR शिफारसी स्थानिक पातळीवर पोहोचवणे.</li>
          <li><strong>बाजार समिती (APMC) थेट दर व निव्वळ नफा गणना:</strong> आपल्या शेतातून नजीकच्या बाजार समितीपर्यंतचा वाहतूक खर्च व निव्वळ नफा मोजण्यासाठी.</li>
          <li><strong>ग्राहक साहाय्य व तज्ज्ञ सल्ला:</strong> शेतकरी बांधवांच्या तक्रारींचे निवारण करण्यासाठी.</li>
        </ul>
      </Card>

      {/* Section 4: Data Retention & Security */}
      <Card variant="white" className="p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          ४. डेटा साठवणूक व सुरक्षा (Data Retention & Security)
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065] leading-relaxed">
          आपला डेटा उद्योग-मानक TLS 1.3 एन्क्रिप्शन आणि PostgreSQL Row Level Security (RLS) द्वारे संरक्षित आहे. शेतकरी जोपर्यंत खाते सक्रिय ठेवतात किंवा स्वतः हटवण्याची विनंती करत नाहीत, तोपर्यंत पीक नोंदी जतन केल्या जातात जेणेकरून मागील हंगामातील रोगांचा अभ्यास करता येईल.
        </p>
      </Card>

      {/* Section 5: Farmer Rights */}
      <Card variant="white" className="p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          ५. शेतकऱ्यांचे हक्क (Your Rights Under DPDP Act 2023)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#5F7065]">
          <div className="border border-[#DDE8DC] p-3 rounded-xl">
            <h3 className="font-bold text-[#152D24]">१. माहिती पाहण्याचा हक्क (Right to Access):</h3>
            <p className="mt-1">आपण प्रोफाइल पेजवर जाऊन आपला सर्व डेटा कधीही पाहू शकता.</p>
          </div>
          <div className="border border-[#DDE8DC] p-3 rounded-xl">
            <h3 className="font-bold text-[#152D24]">२. दुरुस्तीचा हक्क (Right to Correction):</h3>
            <p className="mt-1">चुकीची पीक माहिती, फोन नंबर किंवा पत्ता कधीही अद्ययावत करू शकता.</p>
          </div>
          <div className="border border-[#DDE8DC] p-3 rounded-xl">
            <h3 className="font-bold text-[#152D24]">३. डेटा नष्ट करण्याचा हक्क (Right to Erasure):</h3>
            <p className="mt-1">आपले खाते व सर्व पीक स्कॅन फोटो हटवण्याची विनंती ईमेलद्वारे करू शकता.</p>
          </div>
          <div className="border border-[#DDE8DC] p-3 rounded-xl">
            <h3 className="font-bold text-[#152D24]">४. संमती मागे घेण्याचा हक्क (Withdraw Consent):</h3>
            <p className="mt-1">आपण कधीही आपली संमती मागे घेऊ शकता.</p>
          </div>
        </div>
      </Card>

      {/* Section 6: Third-Party Disclosures */}
      <Card variant="white" className="p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#152D24]">
          ६. तृतीय पक्षांसोबत डेटा देवाणघेवाण (Third-Party Disclosure)
        </h2>
        <p className="text-xs sm:text-sm text-[#5F7065]">
          आम्ही आपला वैयक्तिक डेटा कोणत्याही जाहिरातदार किंवा विपणन कंपन्यांना विकत नाही. केवळ खालील अधिकृत सेवा पुरवठादारांसोबत तांत्रिक अंमलबजावणीसाठी डेटा सामायिक होतो:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs text-[#5F7065]">
          <li><strong>Razorpay Software Private Limited:</strong> सुरक्षित पेमेंट गेटवे व्यवहार (RBI नियमावलीनुसार).</li>
          <li><strong>Open-Meteo Meteorological Service:</strong> भौगोलिक निर्देशांकावर आधारित अचूक स्थानिक हवामान अंदाज.</li>
          <li><strong>Supabase Inc:</strong> एन्क्रिप्टेड PostgreSQL डेटाबेस व सुरक्षित क्लाउड स्टोरेज.</li>
        </ul>
      </Card>

      {/* Section 7: Grievance Redressal */}
      <Card variant="white" className="p-6 space-y-3 bg-[#E6F2E5]/50 border-2 border-[#DDE8DC]">
        <h2 className="text-base sm:text-lg font-black text-[#152D24]">
          ७. तक्रार निवारण अधिकारी (Grievance Officer Contact)
        </h2>
        <p className="text-xs text-[#5F7065]">
          डिजिटल पर्सनल डेटा प्रोटेक्शन कायदा २०२३ आणि IT Rules 2021 च्या नियम ३(२) नुसार नियुक्त अधिकारी:
        </p>
        <div className="text-xs sm:text-sm space-y-1 text-[#152D24] font-semibold pt-2">
          <p><span className="text-[#5F7065]">नाव (Name):</span> Sanket Linganwar [FILL IN]</p>
          <p><span className="text-[#5F7065]">पदनाम (Designation):</span> Data Protection & Grievance Officer</p>
          <p><span className="text-[#5F7065]">पत्ता (Address):</span> Plot No. 42, Krushi Vikas Bhavan, MIDC Area, Yavatmal, Maharashtra - 445001 [FILL IN]</p>
          <p><span className="text-[#5F7065]">ईमेल (Email):</span> <a href="mailto:grievance@krushiscan.ai" className="text-[#2F9E59] underline">grievance@krushiscan.ai</a> [FILL IN]</p>
          <p><span className="text-[#5F7065]">निवारण कालावधी (Response Turnaround):</span> ३० कामकाजाच्या दिवसांच्या आत</p>
        </div>
      </Card>
    </div>
  );
};
