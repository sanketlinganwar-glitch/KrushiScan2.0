import { Language } from '../types';

export const translations = {
  // Brand & General
  appName: {
    mr: 'कृषीस्कॅन AI',
    hi: 'कृषिसकैन AI',
    en: 'KrushiScan AI',
  },
  tagline: {
    mr: 'सोपे तंत्रज्ञान. योग्य शेती निर्णय.',
    hi: 'सरल तकनीक. बेहतर कृषि निर्णय.',
    en: 'Simple Technology. Better Farming Decisions.',
  },
  vidarbhaFocus: {
    mr: 'विदर्भातील शेतकरी बांधवांसाठी समर्पित (कापूस, सोयाबीन, तूर)',
    hi: 'विदर्भ के किसान भाइयों के लिए समर्पित (कपास, सोयाबीन, तुअर)',
    en: 'Dedicated to Vidarbha Farmers (Cotton, Soybean, Tur)',
  },

  // Navigation
  navHome: { mr: 'मुख्यपृष्ठ', hi: 'होम', en: 'Home' },
  navScan: { mr: 'स्कॅन करा', hi: 'स्कैन करें', en: 'Scan' },
  navMyCrops: { mr: 'माझी पिके', hi: 'मेरी फसलें', en: 'My Crops' },
  navGuidance: { mr: 'मार्गदर्शन', hi: 'मार्गदर्शन', en: 'Guidance' },
  navMandi: { mr: 'बाजार भाव', hi: 'मंडी भाव', en: 'Mandi Rates' },
  navStore: { mr: 'कृषी दुकान', hi: 'कृषि स्टोर', en: 'Agri Store' },
  navRecovery: { mr: 'सुधारणा ट्रॅकर', hi: 'सुधार ट्रैकर', en: 'Recovery' },
  navHistory: { mr: 'स्कॅन इतिहास', hi: 'स्कैन इतिहास', en: 'History' },
  navExpert: { mr: 'तज्ज्ञ सल्ला', hi: 'विशेषज्ञ सलाह', en: 'Expert Support' },
  navAlerts: { mr: 'सूचना व इशारे', hi: 'अलर्ट व सूचनाएं', en: 'Alerts' },
  navProfile: { mr: 'माझे प्रोफाइल', hi: 'प्रोफ़ाइल', en: 'Profile' },
  navVoiceAssistant: { mr: 'आवाज AI मदतनीस', hi: 'वॉयस AI सहायक', en: 'Voice AI' },

  // Dashboard Header & Greeting
  greetingMorning: { mr: 'शुभ सकाळ', hi: 'शुभ प्रभात', en: 'Good Morning' },
  greetingAfternoon: { mr: 'शुभ दुपार', hi: 'शुभ दोपहर', en: 'Good Afternoon' },
  greetingEvening: { mr: 'शुभ संध्याकाळ', hi: 'शुभ संध्या', en: 'Good Evening' },
  farmerLocationDefault: { mr: 'यवतमाळ, विदर्भ', hi: 'यवतमाल, विदर्भ', en: 'Yavatmal, Vidarbha' },
  connectedDbBadge: { mr: 'क्लाउड कनेक्टेड', hi: 'क्लाउड कनेक्टेड', en: 'Cloud Connected' },

  // Weather Card
  weatherTitle: { mr: 'स्थानिक हवामान अंदाज', hi: 'स्थानीय मौसम पूर्वानुमान', en: 'Local Weather Forecast' },
  rainfallChance: { mr: 'पावसाची शक्यता', hi: 'बारिश की संभावना', en: 'Rain Probability' },
  humidity: { mr: 'हवेतील आर्द्रता', hi: 'हवा में नमी', en: 'Humidity' },
  windSpeed: { mr: 'वाऱ्याचा वेग', hi: 'हवा की गति', en: 'Wind Speed' },
  agriAdvisory: { mr: 'शेती सल्ला:', hi: 'कृषि सलाह:', en: 'Agri Advisory:' },

  // Big Action Button
  scanHeroTitle: { mr: 'पिकाचा फोटो काढून रोग ओळखा', hi: 'फसल की फोटो खींचकर रोग पहचानें', en: 'SCAN YOUR CROP NOW' },
  scanHeroSubtitle: { mr: 'कापूस, सोयाबीन किंवा तुरीच्या पानाचा फोटो काढा व त्वरित उपाय मिळवा', hi: 'कपास, सोयाबीन या तुअर की पत्ती का फोटो लें और तुरंत समाधान पाएं', en: 'Instant disease identification & remedy for Cotton, Soybean & Tur' },
  scanButtonLabel: { mr: 'कॅमेरा सुरू करा / फोटो निवडा', hi: 'कैमरा चालू करें / फोटो चुनें', en: 'Start Camera / Upload' },

  // Quick Action Grid Titles
  quickActionsTitle: { mr: 'महत्त्वाच्या शेती सेवा', hi: 'मुख्य कृषि सेवाएं', en: 'Key Farming Services' },
  actionMyCropsSub: { mr: 'तुमच्या शेतातील पिकांची नोंद', hi: 'खेत में लगी फसलों का रिकॉर्ड', en: 'Manage your farm plots' },
  actionRecoverySub: { mr: 'फवारणीनंतरचा फरक तपासा', hi: 'दवा के बाद सुधार की जांच', en: 'Track treatment progress' },
  actionHistorySub: { mr: 'मागील सर्व स्कॅन्स', hi: 'पुराने सभी स्कैन', en: 'All previous diagnoses' },
  actionGuidanceSub: { mr: 'खते, रोग व सरकारी योजना', hi: 'खाद, रोग व सरकारी योजनाएं', en: 'Pests, fertilizers & schemes' },
  actionMandiSub: { mr: 'विदर्भातील APMC थेट भाव', hi: 'विदर्भ मंडियों के ताजा भाव', en: 'APMC prices & net return' },
  actionStoreSub: { mr: 'प्रमाणित जैविक व कीटकनाशके', hi: 'प्रमाणित बीज व जैविक उत्पाद', en: 'Certified agri products' },
  actionExpertSub: { mr: 'कृषी विद्यापीठ शास्त्रज्ञांचा सल्ला', hi: 'कृषि वैज्ञानिकों से सीधा सवाल', en: 'Ask KVK / agri scientists' },
  actionAlertsSub: { mr: 'हवामान व किडींचे इशारे', hi: 'मौसम व कीट अलर्ट', en: 'Timely weather & pest alerts' },

  // Recent Scans
  recentScansTitle: { mr: 'नुकतेच केलेले पीक स्कॅन्स', hi: 'हाल ही में किए गए स्कैन', en: 'Recent Crop Scans' },
  viewAllScans: { mr: 'सर्व पहा', hi: 'सभी देखें', en: 'View All' },
  emptyScansText: { mr: 'अद्याप कोणतेही स्कॅन केलेले नाही. तुमचे पहिले पीक स्कॅन करा!', hi: 'अभी कोई स्कैन नहीं है। अपनी पहली फसल स्कैन करें!', en: 'No scans recorded yet. Scan your first crop now!' },
  diagnosisButton: { mr: 'उपाय व निदान पहा', hi: 'निदान व उपाय देखें', en: 'View Diagnosis' },

  // Scanner Steps
  scannerHeading: { mr: 'AI पीक रोग निदान केंद्र', hi: 'AI फसल रोग निदान केंद्र', en: 'AI Crop Disease Scanner' },
  selectCropPrompt: { mr: 'पिकाचा प्रकार निवडा:', hi: 'फसल का प्रकार चुनें:', en: 'Select Crop Type:' },
  autoDetect: { mr: 'स्वयंचलित ओळख (Auto)', hi: 'स्वचालित पहचान (Auto)', en: 'Auto Detect' },
  takePhoto: { mr: 'कॅमेरा सुरू करा', hi: 'कैमरा शुरू करें', en: 'Take Photo' },
  uploadGallery: { mr: 'गॅलरीतून फोटो निवडा', hi: 'गैलरी से फोटो चुनें', en: 'Upload from Gallery' },
  retakePhoto: { mr: 'पुन्हा फोटो काढा', hi: 'फिर से फोटो लें', en: 'Retake Photo' },
  analyzePhoto: { mr: 'AI विश्लेषण करा', hi: 'AI विश्लेषण करें', en: 'Analyze Image' },
  analyzingInProgress: { mr: 'AI मॉडेल पानावरील रोगाची तपासणी करत आहे...', hi: 'AI मॉडल रोग की जांच कर रहा है...', en: 'AI model is analyzing the crop symptoms...' },
  cameraNotAvailable: { mr: 'कॅमेरा उपलब्ध नाही किंवा परवानगी नाकारली गेली. कृपया फाईल अपलोड वापरा.', hi: 'कैमरा उपलब्ध नहीं है। कृपया फाइल अपलोड का उपयोग करें।', en: 'Camera unavailable or permission denied. Please upload an image.' },

  // Diagnosis Details
  confidenceScore: { mr: 'AI अचूकता', hi: 'AI सटीकता', en: 'AI Confidence' },
  severityLabel: { mr: 'तीव्रता:', hi: 'गंभीरता:', en: 'Severity:' },
  symptomsObserved: { mr: 'दिसून येणारी लक्षणे', hi: 'दिखाई देने वाले लक्षण', en: 'Visible Symptoms' },
  recommendedTreatmentsHeading: { mr: 'शिफारस केलेले उपाय (कृषी विद्यापीठ शिफारशीनुसार)', hi: 'सुझाए गए उपचार (कृषि विश्वविद्यालय अनुसार)', en: 'Recommended Treatments' },
  culturalTreatment: { mr: 'मशागतीचे उपाय', hi: 'सांस्कृतिक / जैविक उपाय', en: 'Cultural & Agronomic' },
  biologicalTreatment: { mr: 'जैविक नियंत्रण', hi: 'जैविक नियंत्रण', en: 'Biological Control' },
  chemicalTreatment: { mr: 'रासायनिक फवारणी (आवश्यक असल्यास)', hi: 'रासायनिक छिड़काव (यदि आवश्यक हो)', en: 'Chemical Spray (If Needed)' },
  chemicalCaution: { mr: 'महत्त्वाची सूचना: रासायनिक कीटकनाशके वापरताना प्रमाण तपासा व स्थानिक कृषी अधिकाऱ्यांचा सल्ला घ्या.', hi: 'सावधानी: रसायनों का प्रयोग करते समय लेबल निर्देश पढ़ें व स्थानीय कृषि विशेषज्ञ से सलाह लें।', en: 'Caution: Strictly follow safety guidelines and consult local agricultural extension officers before chemical application.' },
  preventionMethods: { mr: 'भविष्यातील प्रतिबंधात्मक काळजी', hi: 'भविष्य के लिए बचाव के उपाय', en: 'Prevention Methods' },
  listenDiagnosis: { mr: 'मराठीत ऐका (आवाज)', hi: 'सुनें (आवाज)', en: 'Listen to Diagnosis' },
  addToRecovery: { mr: 'सुधारणा ट्रॅकरमध्ये जोडा', hi: 'सुधार ट्रैकर में जोड़ें', en: 'Track in Recovery Tracker' },
  askExpertAboutThis: { mr: 'कृषी तज्ज्ञांना विचारा', hi: 'कृषि विशेषज्ञ से पूछें', en: 'Ask Agri Expert' },

  // My Crops
  myCropsTitle: { mr: 'माझी पिके व शेताचे व्यवस्थापन', hi: 'मेरी फसलें व खेत प्रबंधन', en: 'My Crops Management' },
  addNewCropBtn: { mr: '+ नवीन पीक जोडा', hi: '+ नई फसल जोड़ें', en: '+ Add New Crop' },
  plotArea: { mr: 'क्षेत्रफळ (एकर)', hi: 'क्षेत्रफल (एकड़)', en: 'Area (Acres)' },
  sowingDate: { mr: 'पेरणी दिनांक', hi: 'बुआई की तारीख', en: 'Sowing Date' },
  soilType: { mr: 'जमिनीचा प्रकार', hi: 'मिट्टी का प्रकार', en: 'Soil Type' },
  irrigationMethod: { mr: 'पाणी देण्याची पद्धत', hi: 'सिंचाई का साधन', en: 'Irrigation' },
  growthStage: { mr: 'पिकाची सध्याची वाढीची अवस्था', hi: 'फसल की वर्तमान अवस्था', en: 'Growth Stage' },
  healthStatus: { mr: 'आरोग्य स्थिती', hi: 'स्वास्थ्य स्थिति', en: 'Health Status' },

  // Mandi
  mandiTitle: { mr: 'कृषी उत्पन्न बाजार समिती (APMC) थेट दर', hi: 'कृषि उपज मंडी (APMC) ताजा भाव', en: 'Live APMC Mandi Rates' },
  compareMandis: { mr: 'बाजार समित्यांची तुलना करा', hi: 'मंडियों की तुलना करें', en: 'Compare Mandis' },
  netReturnCalculator: { mr: 'शेतकरी नफा व वाहतूक खर्च गणक', hi: 'किसान मुनाफा व परिवहन लागत कैलकुलेटर', en: 'Net Return & Transport Calculator' },
  selectCommodity: { mr: 'शेतमाल निवडा', hi: 'फसल चुनें', en: 'Select Commodity' },
  selectDistrict: { mr: 'जिल्हा निवडा', hi: 'जिला चुनें', en: 'Select District' },
  enterQuantity: { mr: 'तुमचा माल (क्विंटलमध्ये):', hi: 'कुल उपज (क्विंटल में):', en: 'Quantity (in Quintals):' },
  transportCost: { mr: 'वाहतूक खर्च (₹ एकूण):', hi: 'परिवहन खर्च (₹ कुल):', en: 'Transport Cost (₹ Total):' },
  otherCost: { mr: 'इतर खर्च / हमाली (₹):', hi: 'अन्य खर्च / उतराई (₹):', en: 'Other Costs / Labor (₹):' },
  grossRevenue: { mr: 'अपेक्षित एकूण उत्पन्न:', hi: 'अनुमानित कुल आय:', en: 'Estimated Gross Revenue:' },
  estimatedNetReturn: { mr: 'शेतकऱ्याचा निव्वळ नफा (हातचा पैसा):', hi: 'किसान का शुद्ध लाभ:', en: 'Estimated Net Return:' },
  bestMandiAdvice: { mr: 'उत्तम बाजार शिफारस:', hi: 'सबसे फायदेमंद मंडी:', en: 'Best Mandi Recommendation:' },

  // Agri Store
  storeTitle: { mr: 'प्रमाणित कृषी केंद्र व खरेदी', hi: 'प्रमाणित कृषि केंद्र व खरीदारी', en: 'Agri Store & Inputs' },
  cart: { mr: 'खरेदी टोपली (कार्ट)', hi: 'कार्ट', en: 'Cart' },
  addToCart: { mr: 'टोपलीत टाका', hi: 'कार्ट में जोड़ें', en: 'Add to Cart' },
  outOfStock: { mr: 'साठा संपला', hi: 'स्टॉक खत्म', en: 'Out of Stock' },
  checkoutBtn: { mr: 'मागणी नोंदवा (ऑर्डर करा)', hi: 'ऑर्डर करें', en: 'Proceed to Checkout' },
  verifiedSeller: { mr: 'शासकीय प्रमाणित विक्रेता', hi: 'सत्यापित विक्रेता', en: 'Verified Seller' },
  codAvailable: { mr: 'घरपोच पैसे द्या (COD) / KCC उपलब्ध', hi: 'कैश ऑन डिलीवरी (COD) उपलब्ध', en: 'Cash on Delivery / KCC' },

  // Common Severities
  sevLow: { mr: 'कमी', hi: 'कम', en: 'Low' },
  sevModerate: { mr: 'मध्यम', hi: 'मध्यम', en: 'Moderate' },
  sevHigh: { mr: 'जास्त', hi: 'अधिक', en: 'High' },
  sevCritical: { mr: 'गंभीर', hi: 'गंभीर', en: 'Critical' },

  // Roles
  roleFarmer: { mr: 'शेतकरी (Farmer)', hi: 'किसान (Farmer)', en: 'Farmer' },
  roleExpert: { mr: 'कृषी शास्त्रज्ञ (Expert)', hi: 'कृषि विशेषज्ञ (Expert)', en: 'Agricultural Expert' },
  roleRetailer: { mr: 'कृषी सेवा केंद्र (Retailer)', hi: 'कृषि विक्रेता (Retailer)', en: 'Agri Retailer' },
  roleAdmin: { mr: 'प्रशासक (Admin)', hi: 'व्यवस्थापक (Admin)', en: 'System Admin' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
  const item = translations[key];
  if (!item) return key;
  return item[lang] || item['en'] || key;
}
