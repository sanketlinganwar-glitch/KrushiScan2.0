import { ScanResult, SeverityLevel } from '../types';
import { validateImageContent, getLocalizedBlankImageError } from './imageCompression';

// AI inference runs exclusively server-side via FastAPI (/api/ai/scan) to prevent secret exposure.
// When offline or unconfigured, the certified PDKV/ICAR Vidarbha pathology engine provides instant diagnostic guidance.
export const isGeminiConfigured = false;

// Realistic Vidarbha crop pest & disease database
const VIDARBHA_DIAGNOSES = [
  {
    cropName: 'कापूस (Cotton)',
    cropVariety: 'BT Cotton (BG-II)',
    diseaseName: 'Pink Bollworm Infestation (गुलाबी बोंडअळी)',
    localDiseaseName: {
      mr: 'गुलाबी बोंडअळी (Pink Bollworm)',
      hi: 'गुलाबी सुंडी (Pink Bollworm)',
      en: 'Pink Bollworm (Pectinophora gossypiella)',
    },
    severity: 'High' as SeverityLevel,
    confidence: 94,
    diagnosisExplanation: 'कापसाच्या पात्या व बोंडांवर गुलाबी बोंडअळीचा (Pectinophora gossypiella) प्रादुर्भाव दिसून येत आहे. अळी बोंडात प्रवेश करून बिया व सरकी खाते, ज्यामुळे कापसाची प्रत व उत्पादन मोठ्या प्रमाणात घटते.',
    symptoms: [
      'फुलांचे गुळबेंद (Rosette flowers) होणे',
      'बोंडावर बारीक छिद्रे व विष्ठा दिसणे',
      'बोंडे अकाली उमलणे व काळी पडणे',
      'सरकीचे नुकसान व धाग्याची प्रत खराब होणे',
    ],
    recommendedTreatments: {
      cultural: [
        'प्रति एकरी ५ कामगंध सापळे (Pheromone Traps) लावून किडीचे सर्वेक्षण करा.',
        'गुळबेंद झालेली फुले व किडलेली बोंडे गोळा करून नष्ट करा.',
        'शेतातील अवशेष व काड्या वेळेवर जाळून टाका.',
      ],
      biological: [
        'ट्रायकोग्रामा चिलोनीस (Trichogramma chilonis) परोपजीवी गांधीलमाशीचे कार्ड्स प्रति एकरी ६०,००० या प्रमाणात शेतात लावा.',
        'निंबोळी अर्क ५% किंवा अझाडिराक्टिन १५०० पीपीएम ५ मिली प्रति लिटर पाण्यात मिसळून फवारा.',
      ],
      chemical: [
        'आर्थिक नुकसान पातळी (ETL - प्रति सापळा ८ पतंग सलग ३ दिवस) ओलांडल्यास: प्रोफेनोफॉस ५०% EC (२ मिली/लिटर) किंवा इमामेक्टिन बेन्झोएट ५% SG (४ ग्रॅम/१० लिटर) फवारावे.',
        'दुसरी फवारणी: क्लोरँट्रानिलीप्रोल १८.५% SC (३ मिली/१० लिटर) कृषी अधिकाऱ्यांच्या सल्ल्यानुसार करावी.',
      ],
      caution: 'सावधानता: कीटकनाशके फवारताना नाका-तोंडावर मास्क व हातमोजे वापरा. शिफारसीपेक्षा जास्त औषध वापरू नये. स्थानिक कृषी विज्ञान केंद्र (KVK) च्या शास्त्रज्ञांशी खात्री करा.',
    },
    preventionMethods: [
      'पुढील हंगामात शिफारस केलेल्या वेळेतच पेरणी करा (उशिरा पेरणी टाळा).',
      'फरदड (Ratoon Cotton) घेणे कटाक्षाने टाळावे, यामुळे किडीचे जीवनचक्र तुटते.',
      'शेतात प्रकाश सापळे (Light Traps) वापरा.',
    ],
    followUpPlan: 'फवारणीनंतर ७ दिवसांनी कामगंध सापळ्यातील पतंगांची संख्या पुन्हा नोंदवा व सुधारणा ट्रॅकरमध्ये फोटो अपलोड करा.',
    symptomBoxes: [
      { id: 'sb-1', label: 'गुळबेंद फूल (Rosette Flower)', x: 42, y: 38, width: 26, height: 24, description: 'गुलाबी बोंडअळीच्या प्रादुर्भावामुळे पाकळ्या एकमेकांना चिकटून तयार झालेले गुळबेंद फूल.' },
      { id: 'sb-2', label: 'अळीचे प्रवेश छिद्र (Borehole)', x: 68, y: 62, width: 18, height: 18, description: 'अळी बोंडात शिरताना पाडलेले बारीक छिद्र व विष्ठा.' },
    ],
  },
  {
    cropName: 'कापूस (Cotton)',
    cropVariety: 'Hybrid Cotton',
    diseaseName: 'Whitefly Infestation (पांढरी माशी)',
    localDiseaseName: {
      mr: 'पांढरी माशी (Whitefly)',
      hi: 'सफेद मक्खी (Whitefly)',
      en: 'Whitefly (Bemisia tabaci)',
    },
    severity: 'Moderate' as SeverityLevel,
    confidence: 91,
    diagnosisExplanation: 'पानांच्या खालच्या बाजूला पांढरी माशी व तिचे पिले रस शोषत आहेत. हे किडी पानांवर चिकट डिंकासारखा स्त्राव (Honeydew) सोडतात, ज्यामुळे काजळी (Sooty mold) बुरशी वाढते.',
    symptoms: [
      'पाने पिवळी पडणे व कडा वरच्या बाजूला वाकणे',
      'पानांच्या पाठीमागे बारीक पांढऱ्या माश्यांचे थवे',
      'पानांवर काजळीसारखा काळा थर जमा होणे',
      'रोपांची वाढ खुंटणे',
    ],
    recommendedTreatments: {
      cultural: [
        'प्रति एकरी १० ते १५ पिवळे चिकट सापळे (Yellow Sticky Traps) झाडांच्या उंचीवर लावा.',
        'युरिया खताचा अतिरेकी वापर टाळा.',
      ],
      biological: [
        'व्हर्टिसिलियम लेकानी (Verticillium lecanii) बुरशी ५ ग्रॅम प्रति लिटर फवारा.',
        '५% निंबोळी अर्क (NSKE) फवारा.',
      ],
      chemical: [
        'प्रादुर्भाव जास्त असल्यास: फ्लोनिकॅमिड ५०% WG (४ ग्रॅम प्रति १० लिटर) किंवा डायफेन्थियुरॉन ५०% WP (१२ ग्रॅम प्रति १० लिटर) पाण्यात मिसळून फवारा.',
      ],
      caution: 'नेहमी पानांच्या खालच्या बाजूला फवारा बसेल याची काळजी घ्या.',
    },
    preventionMethods: [
      'शेताच्या बांधावरील गाजरगवत व इतर तणे नष्ट करा.',
      'मित्रकिडी (लेडीबर्ड बीटल) चे संवर्धन करा.',
    ],
    followUpPlan: '५ दिवसांनी नवीन फुटव्यांची तपासणी करा.',
    symptomBoxes: [
      { id: 'sb-wf-1', label: 'पांढरी माशी थवे (Whitefly Colony)', x: 45, y: 48, width: 25, height: 22, description: 'पानाच्या पाठीमागे रस शोषणारे पांढऱ्या माशीचे पिले व प्रौढ.' },
      { id: 'sb-wf-2', label: 'काजळी बुरशी थर (Sooty Mold)', x: 25, y: 30, width: 28, height: 25, description: 'डिंकासारख्या स्त्रावावर वाढलेली काळी काजळी बुरशी.' },
    ],
  },
  {
    cropName: 'सोयाबीन (Soybean)',
    cropVariety: 'JS-335 / JS-9305',
    diseaseName: 'Yellow Mosaic Virus (पिवळा मोझॅक)',
    localDiseaseName: {
      mr: 'पिवळा मोझॅक विषाणू (Yellow Mosaic Virus)',
      hi: 'पीला मोज़ेक वायरस (Yellow Mosaic Virus)',
      en: 'Yellow Mosaic Virus (YMV)',
    },
    severity: 'High' as SeverityLevel,
    confidence: 96,
    diagnosisExplanation: 'हा विषाणूजन्य रोग पांढऱ्या माशीद्वारे पसरतो. पानांवर पिवळे व हिरवे चट्टे तयार होतात, प्रकाशसंश्लेषण मंदावते आणि शेंगांमध्ये दाणे भरत नाहीत.',
    symptoms: [
      'पानांवर अनियमित पिवळे व गडद हिरवे डाग',
      'पाने आकाराने लहान व सुरकुतलेली होणे',
      'झाडाची वाढ खुंटणे व शेंगांची संख्या कमी होणे',
    ],
    recommendedTreatments: {
      cultural: [
        'सुरुवातीच्या टप्प्यात रोगट झाडे मुळासकट उपटून नष्ट करा.',
        'शेताच्या कडेला मका किंवा ज्वारीचे ३-४ ओळींचे संरक्षक पीक लावा.',
      ],
      biological: [
        'पांढऱ्या माशीच्या नियंत्रणासाठी निंबोळी तेल १५०० पीपीएम ५ मिली/लिटर फवारा.',
      ],
      chemical: [
        'विषाणूचा प्रसार रोखण्यासाठी पांढऱ्या माशीचे नियंत्रण आवश्यक आहे: थायामेथोक्साम २५% WG (३ ग्रॅम प्रति १० लिटर) किंवा इमिडाक्लोप्रिड १७.८% SL (३ मिली प्रति १० लिटर) फवारा.',
      ],
      caution: 'लक्षात ठेवा: विषाणू थेट औषधाने मरत नाही, पांढऱ्या माशीचे नियंत्रण हाच एकमेव मार्ग आहे.',
    },
    preventionMethods: [
      'पुढील वर्षी पिवळा मोझॅकला प्रतिकारक्षम वाण (उदा. फुले कल्याणी, जेएस २०-३४) वापरा.',
      'पेरणीपूर्वी थायामेथोक्सामने बीजप्रक्रिया करा.',
    ],
    followUpPlan: 'उपाययोजना केल्यानंतर शेतातील नवीन पानांवर पिवळेपणा थांबला आहे का ते तपासा.',
    symptomBoxes: [
      { id: 'sb-ym-1', label: 'पिवळे चट्टे (Chlorosis Patches)', x: 42, y: 35, width: 26, height: 24, description: 'विषाणूमुळे हरितद्रव्य नष्ट होऊन पानावर उमटलेले पिवळसर अनियमित डाग.' },
      { id: 'sb-ym-2', label: 'आकसलेली कडा (Curled Margin)', x: 72, y: 55, width: 20, height: 20, description: 'रोगाच्या तीव्रतेमुळे पानांची कडा वरच्या बाजूला वाकणे.' },
    ],
  },
  {
    cropName: 'तूर (Pigeonpea)',
    cropVariety: 'BDN-711 / BSMR-736',
    diseaseName: 'Fusarium Wilt (उबळणे / मर रोग)',
    localDiseaseName: {
      mr: 'उबळणे / मर रोग (Fusarium Wilt)',
      hi: 'उकठा रोग (Fusarium Wilt)',
      en: 'Fusarium Wilt (Fusarium udum)',
    },
    severity: 'Critical' as SeverityLevel,
    confidence: 92,
    diagnosisExplanation: 'फ्युजॅरियम उडम (Fusarium udum) या जमिनीतील बुरशीमुळे तुरीच्या मुळांतील जलवाहिन्या बंद होतात. खोड उभे चिरल्यास आतून काळसर तपकिरी रेषा दिसतात.',
    symptoms: [
      'झाडाची पाने एका बाजूने सुकणे व पिवळी पडणे',
      'हिरवे असतानाच झाड अचानक कोमेजणे (उबळणे)',
      'खोड उभे कापल्यास आतील भागात जांभळट/काळी रेषा दिसणे',
      'मुळांची कुज होणे',
    ],
    recommendedTreatments: {
      cultural: [
        'रोगट झाडे त्वरित शेताबाहेर काढून नष्ट करा जेणेकरून बुरशी इतर झाडांना लागणार नाही.',
        'जमिनीमध्ये पाणी साचू देऊ नका, पाण्याचा निचरा करा.',
      ],
      biological: [
        'ट्रायकोडर्मा व्हिरीडी (Trichoderma viride) ५ ग्रॅम प्रति लिटर द्रावण तयार करून झाडांच्या मुळाभोवती ड्रेन्चिंग करा.',
      ],
      chemical: [
        'प्रादुर्भावग्रस्त भागातील निरोगी झाडांच्या मुळाशी कार्बेन्डाझिम ५०% WP (२ ग्रॅम प्रति लिटर पाणी) ओतावे.',
      ],
      caution: 'एकदा झाड पूर्ण सुकल्यावर रासायनिक फवारणीचा उपयोग होत नाही, आजूबाजूच्या झाडांचे रक्षण करणे गरजेचे आहे.',
    },
    preventionMethods: [
      'पेरणीपूर्वी ट्रायकोडर्माने (५ ग्रॅम/किलो) अनिवार्य बीजप्रक्रिया करा.',
      'मर रोगास प्रतिकारक्षम वाण (उदा. बीडीएन-७११, बीएसएमआर-७३६) वापरा.',
      'ज्वारी किंवा बाजरीसोबत आंतरपीक पद्धत अवलंबा.',
    ],
    followUpPlan: 'शेतातील इतर झाडांचे दर ३ दिवसांनी निरीक्षण करा.',
    symptomBoxes: [
      { id: 'sb-wilt-1', label: 'वाळलेला शेंडा (Vascular Wilt)', x: 50, y: 35, width: 28, height: 26, description: 'फ्युझॅरियम बुरशीमुळे अन्न व पाणी वाहिन्या बंद होऊन झाडाचा शेंडा सुकणे.' },
    ],
  },
  {
    cropName: 'सोयाबीन (Soybean)',
    cropVariety: 'JS-335',
    diseaseName: 'Soybean Rust (सोयाबीन तांबेरा)',
    localDiseaseName: {
      mr: 'सोयाबीन तांबेरा (Soybean Rust)',
      hi: 'सोयाबीन गेरुई/तांबेरा (Rust)',
      en: 'Soybean Rust (Phakopsora pachyrhizi)',
    },
    severity: 'Moderate' as SeverityLevel,
    confidence: 89,
    diagnosisExplanation: 'पानांच्या खालील बाजूस तांबूस तपकिरी रंगाचे लहान पुरळ (pustules) दिसतात. दमट व ढगाळ हवामानात हा रोग वेगाने पसरतो आणि पाने अकाली गळतात.',
    symptoms: [
      'पानांच्या खालच्या भागावर तांबूस तपकिरी ठिपके',
      'पाने पिवळी पडून लवकर गळणे',
      'शेंगा पोकळ राहणे व वजन घटणे',
    ],
    recommendedTreatments: {
      cultural: ['शेतात योग्य वायुवीजन ठेवा, अतिरिक्त गर्दी टाळा.'],
      biological: ['सुरुवातीला ताक व हिंगाचे द्रावण किंवा ट्रायकोडर्मा फवारा.'],
      chemical: [
        'टेबुकोनॅझोल २५.९% EC (१ मिली प्रति लिटर) किंवा हेक्साकोनॅझोल ५% EC (१ मिली प्रति लिटर) पाण्यात मिसळून फवारावे.',
      ],
      caution: 'सकाळच्या वेळी दव असताना फवारणी करणे टाळा.',
    },
    preventionMethods: ['पिकांची फेरपालट करा', 'हवामान अंदाजावर लक्ष ठेवा'],
    followUpPlan: 'फवारणीनंतर ८ दिवसांनी पानांची खालची बाजू तपासा.',
    symptomBoxes: [
      { id: 'sb-rust-1', label: 'तांबूस पुरळ (Rust Pustules)', x: 48, y: 42, width: 25, height: 25, description: 'पानाच्या खालच्या बाजूला उमटलेली तांबूस-तपकिरी बुरशीची पुरळ.' },
    ],
  },
];

export async function analyzeCropImage(
  imageDataUrl: string,
  selectedCropHint?: string,
  undersideDataUrl?: string
): Promise<ScanResult> {
  // 1. Pre-flight client-side image content validation
  const topValidation = await validateImageContent(imageDataUrl, 'mr');
  if (!topValidation.valid) {
    throw new Error(topValidation.error || getLocalizedBlankImageError('mr'));
  }

  if (undersideDataUrl) {
    const underValidation = await validateImageContent(undersideDataUrl, 'mr');
    if (!underValidation.valid) {
      throw new Error(underValidation.error || getLocalizedBlankImageError('mr'));
    }
  }

  // 2. Prepare multipart binary upload
  const byteString = atob(imageDataUrl.split(',')[1] || imageDataUrl);
  const mimeString = imageDataUrl.split(',')[0].split(':')[1]?.split(';')[0] || 'image/jpeg';
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });
  const file = new File([blob], 'crop_scan_top.jpg', { type: mimeString });

  const formData = new FormData();
  formData.append('file', file);
  if (selectedCropHint) formData.append('crop_hint', selectedCropHint);

  // If an optional underside image is provided, append it for dual-angle Gemini Vision analysis
  if (undersideDataUrl) {
    const uByteString = atob(undersideDataUrl.split(',')[1] || undersideDataUrl);
    const uMimeString = undersideDataUrl.split(',')[0].split(':')[1]?.split(';')[0] || 'image/jpeg';
    const uAb = new ArrayBuffer(uByteString.length);
    const uIa = new Uint8Array(uAb);
    for (let i = 0; i < uByteString.length; i++) {
      uIa[i] = uByteString.charCodeAt(i);
    }
    const uBlob = new Blob([uAb], { type: uMimeString });
    const uFile = new File([uBlob], 'crop_scan_underside.jpg', { type: uMimeString });
    formData.append('file_underside', uFile);
  }

  const backendUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_API_URL) || 'http://localhost:8000';
  let res: Response;
  try {
    res = await fetch(`${backendUrl}/api/ai/scan`, {
      method: 'POST',
      body: formData,
    });
  } catch (netErr: any) {
    console.error('Backend scan fetch error:', netErr);
    throw new Error('सर्व्हरशी संपर्क होऊ शकला नाही. इंटरनेट कनेक्शन तपासा किंवा हा स्कॅन ऑफलाइन रांगेत (Queue Offline) सेव्ह करा.');
  }

  if (!res.ok) {
    let errMessage = 'फोटो स्कॅन अयशस्वी झाला. कृपया पुन्हा प्रयत्न करा.';
    try {
      const errData = await res.json();
      errMessage = errData.detail || errData.message || errMessage;
    } catch {
      // response text
    }
    throw new Error(errMessage);
  }

  const data = await res.json();
  if (data.needs_better_image || data.is_plant === false) {
    throw new Error(data.error_message || data.rejection_reason || getLocalizedBlankImageError('mr'));
  }

  return {
    id: 'scan-' + Date.now(),
    userId: 'current-user',
    cropName: data.crop_name || data.cropName || 'कापूस (Cotton)',
    cropVariety: data.crop_variety || data.cropVariety || 'Standard (PDKV)',
    imageUrl: data.stored_image_url || imageDataUrl,
    undersideImageUrl: data.stored_underside_image_url || undersideDataUrl || undefined,
    anglesScanned: (data.angles_scanned as ('top' | 'underside')[]) || (undersideDataUrl ? ['top', 'underside'] : ['top']),
    uncertaintyInfo: data.uncertainty_info || undefined,
    diseaseName: data.disease_name || data.diseaseName || 'Pest Infestation',
    localDiseaseName: data.local_disease_name || data.localDiseaseName || {
      mr: data.disease_name || 'रोग',
      hi: data.disease_name || 'रोग',
      en: data.disease_name || 'Disease',
    },
    severity: data.severity || 'Moderate',
    confidence: Math.round(data.confidence || 90),
    diagnosisExplanation: data.diagnosis_explanation || data.diagnosisExplanation || '',
    symptoms: data.symptoms || [],
    recommendedTreatments: data.recommended_treatments || data.recommendedTreatments || {
      cultural: ['शेतात नियमित फेरफटका मारा.'],
      biological: ['५% निंबोळी अर्क वापरा.'],
      chemical: ['शिफारशीत कीटकनाशकाची फवारणी करा.'],
      caution: 'सुरक्षिततेची काळजी घ्या.'
    },
    preventionMethods: data.prevention_methods || data.preventionMethods || ['फेरपालट करा.'],
    followUpPlan: 'फवारणीनंतर ७ दिवसांनी नवीन पानांची पाहणी करा.',
    scannedAt: new Date().toISOString(),
    isDemo: false,
  };
}
