/**
 * KrushiScan AI - Verified Agricultural Pest Scouting & Economic Threshold Level (ETL) Library
 * 
 * Sourced strictly from:
 * 1. Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV), Akola - Krushi Dainandini & Crop Protection Guides
 * 2. ICAR - Central Institute for Cotton Research (CICR), Nagpur
 * 3. ICAR - Indian Institute of Soybean Research (IISR), Indore
 * 4. ICAR - Central Citrus Research Institute (CCRI), Nagpur
 * 5. Directorate of Plant Protection, Quarantine & Storage (DPPQS) & CIBRC
 */

export interface PestEtlRule {
  id: string;
  cropId: 'cotton' | 'soybean' | 'tur' | 'chana' | 'citrus';
  cropName: { mr: string; hi: string; en: string };
  pestName: { mr: string; hi: string; en: string; scientific: string };
  samplingMethod: { mr: string; hi: string; en: string };
  samplingUnit: 'per_leaf' | 'per_plant' | 'per_meter_row' | 'per_trap_daily' | 'percent_damaged_bolls' | 'percent_damaged_pods' | 'percent_infested_shoots';
  unitLabel: { mr: string; hi: string; en: string };
  minRecommendedSamples: number; // e.g. 20 plants or 5 pheromone traps
  etlThreshold: number; // Exact numerical cutoff
  thresholdDisplay: { mr: string; hi: string; en: string };
  targetCropStage: { mr: string; hi: string; en: string };
  sourceAuthority: string;
  sourceDoc: string;
  revisionDate: string;
  managementAdvisory: {
    belowEtl: {
      headline: { mr: string; hi: string; en: string };
      action: { mr: string; hi: string; en: string };
    };
    approachingEtl: {
      headline: { mr: string; hi: string; en: string };
      action: { mr: string; hi: string; en: string };
    };
    aboveEtl: {
      headline: { mr: string; hi: string; en: string };
      action: { mr: string; hi: string; en: string };
    };
  };
}

export const VERIFIED_ETL_RULES: PestEtlRule[] = [
  // ---------------------------------------------------------------------------
  // 1. COTTON - Pink Bollworm (Pectinophora gossypiella)
  // ---------------------------------------------------------------------------
  {
    id: 'cotton-pink-bollworm-trap',
    cropId: 'cotton',
    cropName: { mr: 'कापूस (Cotton)', hi: 'कपास (Cotton)', en: 'Cotton' },
    pestName: {
      mr: 'गुलाबी बोंडअळी (कामगंध सापळा निरीक्षण)',
      hi: 'गुलाबी सुंडी (फेरोमोन ट्रैप)',
      en: 'Pink Bollworm (Pheromone Trap)',
      scientific: 'Pectinophora gossypiella',
    },
    samplingMethod: {
      mr: 'शेतात एकरी किमान ५ कामगंध सापळे लावावेत. सलग ३ दिवस दररोज पतंगांची संख्या मोजावी.',
      hi: 'खेत में प्रति एकड़ कम से कम 5 फेरोमोन ट्रैप लगाएं। लगातार 3 दिन पतंगों की गिनती करें।',
      en: 'Install minimum 5 pheromone traps per acre. Count trapped male moths daily for 3 consecutive days.',
    },
    samplingUnit: 'per_trap_daily',
    unitLabel: { mr: 'पतंग प्रति सापळा दररोज', hi: 'पतंगे प्रति ट्रैप दैनिक', en: 'Moths / trap / day' },
    minRecommendedSamples: 3, // 3 days
    etlThreshold: 8.0,
    thresholdDisplay: {
      mr: 'सलग ३ दिवस दररोज ८ किंवा अधिक नर पतंग प्रति सापळा',
      hi: 'लगातार 3 दिन 8 या अधिक नर पतंगे प्रति ट्रैप/दिन',
      en: '8 or more male moths per trap per day for 3 consecutive days',
    },
    targetCropStage: {
      mr: 'फुलोरा व बोंड धारणा (४५ ते १२० दिवस)',
      hi: 'फूल व गूलर बनना (45 से 120 दिन)',
      en: 'Flowering & Boll Formation (45 to 120 DAS)',
    },
    sourceAuthority: 'ICAR - Central Institute for Cotton Research (CICR), Nagpur',
    sourceDoc: 'CICR Cotton Pest Management Protocol & Dr. PDKV Krushi Dainandini',
    revisionDate: '2025-2026',
    managementAdvisory: {
      belowEtl: {
        headline: {
          mr: 'ईटीएलच्या खाली (सुरक्षित) - फवारणी करू नये',
          hi: 'ईटीएल से नीचे (सुरक्षित) - कीटनाशक छिड़काव न करें',
          en: 'Below ETL (Safe) - Chemical spray not warranted',
        },
        action: {
          mr: 'सध्या रासायनिक कीटकनाशक फवारण्याची अजिबात गरज नाही. नैसर्गिक परोपजीवी मित्रकीटक सुरक्षित राहू द्या. सापळ्यांचे आमिष (Lure) दर २१ दिवसांनी बदला.',
          hi: 'वर्तमान में रासायनिक छिड़काव की कोई आवश्यकता नहीं है। मित्र कीटों को सुरक्षित रहने दें। ट्रैप ल्योर 21 दिनों में बदलें।',
          en: 'No chemical spray required. Conserve predatory insects. Replace pheromone lures every 21 days.',
        },
      },
      approachingEtl: {
        headline: {
          mr: 'ईटीएलच्या जवळ (दक्षता पातळी) - जैविक उपाय करा',
          hi: 'ईटीएल के करीब (सतर्कता स्तर) - जैविक उपाय करें',
          en: 'Approaching ETL (Warning Level) - Initiate Bio-control',
        },
        action: {
          mr: 'गुळबेंद झालेली फुले तोडून अळीसह नष्ट करा. ५% निंबोळी अर्क (NSKE) किंवा अझाडिरॅक्टिन १५०० पीपीएम (५ मिली/लिटर) ची प्रतिबंधात्मक फवारणी करा.',
          hi: 'रोसेट फूल तोड़कर नष्ट करें। 5% नीम अर्क (NSKE) या एज़ाडिरैक्टीन 1500 ppm का छिड़काव करें।',
          en: 'Collect and destroy rosette flowers. Apply 5% Neem Seed Kernel Extract (NSKE) or Azadirachtin 1500 ppm @ 5ml/L.',
        },
      },
      aboveEtl: {
        headline: {
          mr: 'ईटीएल ओलांडली (आर्थिक नुकसान पातळी ओलांडली) - तातडीने व्यवस्थापन आवश्यक',
          hi: 'ईटीएल पार (आर्थिक नुकसान स्तर) - तत्काल नियंत्रण आवश्यक',
          en: 'Above ETL (Action Required) - Economic Threshold Exceeded',
        },
        action: {
          mr: 'बोंडअळीने आर्थिक नुकसान पातळी ओलांडली आहे. डॉ. पंदेकृवि शिफारशीनुसार प्रोफेनोफॉस ५०% EC (२ मिली/लिटर) किंवा इमामेक्टिन बेन्झोएट ५% SG (४ ग्रॅम/१० लिटर) ची फवारणी करावी. फरदड कापूस घेऊ नये.',
          hi: 'आर्थिक नुकसान सीमा पार हो चुकी है। PDKV सिफारिश अनुसार प्रोफेनोफॉस 50% EC (2 मिली/ली) अथवा इमामेक्टिन बेंजोएट 5% SG (4 ग्राम/10 ली) का छिड़काव करें।',
          en: 'Economic damage threshold breached. As per Dr. PDKV recommendation, spray Profenofos 50% EC @ 2ml/L or Emamectin Benzoate 5% SG @ 4g/10L water. Strictly avoid ratoon cotton.',
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 2. COTTON - Jassids / Leafhoppers (Amrasca biguttula biguttula)
  // ---------------------------------------------------------------------------
  {
    id: 'cotton-jassids',
    cropId: 'cotton',
    cropName: { mr: 'कापूस (Cotton)', hi: 'कपास (Cotton)', en: 'Cotton' },
    pestName: {
      mr: 'तुडतुडे (Jassids / Leafhopper)',
      hi: 'हरा फुदका (Jassids)',
      en: 'Leafhopper / Jassids',
      scientific: 'Amrasca biguttula biguttula',
    },
    samplingMethod: {
      mr: 'शेतातील २० झाडे निवडून प्रत्येक झाडाची वरची, मधली आणि खालची अशा ३ पानांचे (एकूण ६० पाने) निरीक्षण करा.',
      hi: 'खेत में 20 पौधों के ऊपर, बीच और नीचे के 3 पत्तों (कुल 60 पत्ते) का निरीक्षण करें।',
      en: 'Inspect 20 random plants across the field. Count nymphs on 3 leaves per plant (top, middle, bottom = 60 leaves).',
    },
    samplingUnit: 'per_leaf',
    unitLabel: { mr: 'पिले प्रति पान (Nymphs/Leaf)', hi: 'शिशु प्रति पत्ता', en: 'Nymphs / leaf' },
    minRecommendedSamples: 20, // 20 plants
    etlThreshold: 2.0,
    thresholdDisplay: {
      mr: '२ ते ३ पिले प्रति पान (किंवा २५% झाडांची पाने कडेने पिवळी पडून वाकणे)',
      hi: '2 से 3 शिशु प्रति पत्ता (या 25% पौधों की पत्तियां किनारों से मुड़ना)',
      en: '2 to 3 nymphs per leaf (or Grade-II injury with leaf rim curling)',
    },
    targetCropStage: {
      mr: 'शाकीय वाढ ते बोंड अवस्था (३० ते ९० दिवस)',
      hi: 'वानस्पतिक वृद्धि से गूलर अवस्था (30 से 90 दिन)',
      en: 'Vegetative to Boll Formation (30 to 90 DAS)',
    },
    sourceAuthority: 'Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV), Akola',
    sourceDoc: 'PDKV Package of Practices for Kharif Cotton',
    revisionDate: '2025-2026',
    managementAdvisory: {
      belowEtl: {
        headline: {
          mr: 'ईटीएलच्या खाली (सुरक्षित) - फवारणी करू नका',
          hi: 'ईटीएल से नीचे - छिड़काव न करें',
          en: 'Below ETL - No Spray Required',
        },
        action: {
          mr: 'तुडतुड्यांची संख्या नियंत्रणात आहे. लेडीबर्ड बीटल (ढालकिडा) व क्रायसोपा यांसारखे मित्रकीटक शेतात कार्यरत आहेत. विनाकारण रासायनिक विष फवारून मित्रकीटकांचा नाश करू नका.',
          hi: 'कीट संख्या सुरक्षित है। लेडीबर्ड बीटल व क्राइसोपा जैसे प्राकृतिक शिकारी सक्रिय हैं। कीटनाशक न डालें।',
          en: 'Nymph population is within safe ecological threshold. Conserve predatory ladybird beetles and chrysoperla.',
        },
      },
      approachingEtl: {
        headline: {
          mr: 'ईटीएलच्या जवळ (दक्षता पातळी) - जैविक/निंबोळी उपाय',
          hi: 'ईटीएल के करीब - जैविक उपाय',
          en: 'Approaching ETL - Preventive Bio-spray',
        },
        action: {
          mr: 'पिवळे चिकट सापळे एकरी १० लावावेत. ५% निंबोळी अर्क (NSKE) फवारावे.',
          hi: 'प्रति एकड़ 10 पीले चिपचिपे जाल लगाएं। 5% नीम अर्क का छिड़काव करें।',
          en: 'Install 10 yellow sticky traps per acre. Apply 5% Neem Seed Kernel Extract (NSKE).',
        },
      },
      aboveEtl: {
        headline: {
          mr: 'ईटीएल ओलांडली - रासायनिक शिफारस लागू',
          hi: 'ईटीएल पार - रासायनिक नियंत्रण अनुशंसित',
          en: 'Above ETL - Chemical Intervention Warranted',
        },
        action: {
          mr: 'तुडतुड्यांनी ईटीएल मर्यादा ओलांडली आहे. डॉ. पंदेकृवि शिफारशीनुसार फ्लोनिकामिड ५०% WG (४ ग्रॅम प्रति १० लिटर) किंवा डायनोटेफ्युरान २०% SG (३ ग्रॅम प्रति १० लिटर) ची फवारणी करावी.',
          hi: 'तुडतुडे आर्थिक स्तर पार कर चुके हैं। फ्लोनिकामिड 50% WG (4 ग्राम/10 ली) या डाइनोटेफ्यूरॉन 20% SG (3 ग्राम/10 ली) का छिड़काव करें।',
          en: 'Threshold crossed. Spray Flonicamid 50% WG @ 4g/10L water or Dinotefuran 20% SG @ 3g/10L water as per PDKV.',
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 3. COTTON - Thrips (Thrips tabaci)
  // ---------------------------------------------------------------------------
  {
    id: 'cotton-thrips',
    cropId: 'cotton',
    cropName: { mr: 'कापूस (Cotton)', hi: 'कपास (Cotton)', en: 'Cotton' },
    pestName: {
      mr: 'फुलकिडे (Thrips)',
      hi: 'थ्रिप्स (Thrips)',
      en: 'Thrips',
      scientific: 'Thrips tabaci',
    },
    samplingMethod: {
      mr: '२० झाडांच्या वरच्या कोवळ्या पानांवर फुलकिड्यांची मोजणी करा.',
      hi: '20 पौधों की ऊपरी कोमल पत्तियों पर थ्रिप्स की गिनती करें।',
      en: 'Count thrips on top tender leaves across 20 randomly selected plants.',
    },
    samplingUnit: 'per_leaf',
    unitLabel: { mr: 'फुलकिडे प्रति पान', hi: 'थ्रिप्स प्रति पत्ता', en: 'Thrips / leaf' },
    minRecommendedSamples: 20,
    etlThreshold: 10.0,
    thresholdDisplay: {
      mr: '१० फुलकिडे प्रति पान',
      hi: '10 थ्रिप्स प्रति पत्ता',
      en: '10 thrips per leaf',
    },
    targetCropStage: {
      mr: 'सुरुवातीची वाढ ते फुलोरा (२० ते ६० दिवस)',
      hi: 'शुरुआती वानस्पतिक से फूल अवस्था (20 से 60 दिन)',
      en: 'Early Vegetative to Flowering (20 to 60 DAS)',
    },
    sourceAuthority: 'Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV), Akola',
    sourceDoc: 'PDKV Cotton Pathology & Entomology Directory',
    revisionDate: '2025-2026',
    managementAdvisory: {
      belowEtl: {
        headline: { mr: 'सुरक्षित (ईटीएल खाली)', hi: 'सुरक्षित (ईटीएल नीचे)', en: 'Safe (Below ETL)' },
        action: {
          mr: 'फुलकिडे मर्यादेत आहेत. फवारणी टाळा. शेतातील तण नष्ट करा.',
          hi: 'थ्रिप्स नियंत्रण में हैं। छिड़काव न करें। खरपतवार हटाएं।',
          en: 'Population within safe bounds. Avoid spraying. Keep field free of weeds.',
        },
      },
      approachingEtl: {
        headline: { mr: 'दक्षता स्तर - निळे चिकट सापळे लावा', hi: 'सतर्कता स्तर - नीले स्टिकी ट्रैप', en: 'Warning - Blue Sticky Traps' },
        action: {
          mr: 'निळे चिकट सापळे एकरी १० लावावेत (फुलकिडे निळ्या रंगाकडे जास्त आकर्षित होतात). निंबोळी तेल १५०० पीपीएम फवारा.',
          hi: 'प्रति एकड़ 10 नीले चिपचिपे ट्रैप लगाएं। 1500 ppm नीम तेल का छिड़काव करें।',
          en: 'Install 10 blue sticky traps per acre (thrips are attracted to blue). Spray neem oil 1500 ppm.',
        },
      },
      aboveEtl: {
        headline: { mr: 'ईटीएल ओलांडली - फवारणी आवश्यक', hi: 'ईटीएल पार - छिड़काव आवश्यक', en: 'Above ETL - Spray Required' },
        action: {
          mr: 'फियाप्रोनिल ५% SC (३० मिली प्रति १० लिटर) किंवा थायामेथोक्साम २५% WG (३ ग्रॅम/१० लिटर) फवारावे.',
          hi: 'फिप्रोनिल 5% SC (30 मिली/10 ली) या थायामेथोक्साम 25% WG (3 ग्राम/10 ली) का छिड़काव करें।',
          en: 'Spray Fipronil 5% SC @ 30ml/10L water or Thiamethoxam 25% WG @ 3g/10L water as per PDKV guidelines.',
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 4. SOYBEAN - Spodoptera / Tobacco Leaf Eating Caterpillar (Spodoptera litura)
  // ---------------------------------------------------------------------------
  {
    id: 'soybean-spodoptera',
    cropId: 'soybean',
    cropName: { mr: 'सोयाबीन (Soybean)', hi: 'सोयाबीन (Soybean)', en: 'Soybean' },
    pestName: {
      mr: 'तंबाखूची पाने खाणारी अळी (Spodoptera)',
      hi: 'तम्बाकू की इल्ली (Spodoptera)',
      en: 'Tobacco Caterpillar (Spodoptera)',
      scientific: 'Spodoptera litura',
    },
    samplingMethod: {
      mr: 'शेतात ५ वेगवेगळ्या ठिकाणी प्रत्येकी १ मीटर ओळीतील झाडांवरील (Meter Row Length) अळ्या मोजाव्यात.',
      hi: 'खेत में 5 अलग-अलग स्थानों पर प्रति 1 मीटर कतार (Meter Row Length) में इल्लियों की गिनती करें।',
      en: 'Scout 5 random 1-meter row lengths (MRL) across the field and count larvae.',
    },
    samplingUnit: 'per_meter_row',
    unitLabel: { mr: 'अळ्या प्रति मीटर ओळ (Larvae/m)', hi: 'इल्लियां प्रति मीटर कतार', en: 'Larvae / meter row' },
    minRecommendedSamples: 5, // 5 meter row lengths
    etlThreshold: 3.0,
    thresholdDisplay: {
      mr: '३ ते ४ अळ्या प्रति मीटर ओळ',
      hi: '3 से 4 इल्लियां प्रति मीटर कतार',
      en: '3 to 4 larvae per meter row length (MRL)',
    },
    targetCropStage: {
      mr: 'शाकीय वाढ ते शेंगा भरणे (२५ ते ७० दिवस)',
      hi: 'वानस्पतिक से फली विकास (25 से 70 दिन)',
      en: 'Vegetative to Pod Filling (25 to 70 DAS)',
    },
    sourceAuthority: 'ICAR - Indian Institute of Soybean Research (IISR), Indore & Dr. PDKV',
    sourceDoc: 'ICAR-IISR Integrated Pest Management in Soybean',
    revisionDate: '2025',
    managementAdvisory: {
      belowEtl: {
        headline: { mr: 'सुरक्षित (ईटीएल खाली)', hi: 'सुरक्षित स्तर', en: 'Safe (Below ETL)' },
        action: {
          mr: 'अळ्यांची संख्या अत्यल्प आहे. पक्षी थांबे (Bird perches) एकरी १० ते १५ लावा जेणेकरून पक्षी अळ्या खाऊन नष्ट करतील.',
          hi: 'इल्लियां नगण्य हैं। प्रति एकड़ 10-15 पक्षी बैठने के टी-स्टैंड लगाएं।',
          en: 'Pest density below economic threshold. Install 10-15 bird perches (T-stands) per acre.',
        },
      },
      approachingEtl: {
        headline: { mr: 'दक्षता पातळी - अंडीपुंज नष्ट करा', hi: 'सतर्कता स्तर', en: 'Warning - Egg Mass Destruction' },
        action: {
          mr: 'पानांच्या मागचे जाळीदार अंडीपुंज व नुकत्याच जन्मलेल्या अळ्यांची पाने तोडून नष्ट करा. SlNPV २५० LE (१.५ मिली/लिटर) फवारा.',
          hi: 'अंडों के समूह वाली पत्तियां तोड़कर नष्ट करें। SlNPV 250 LE (1.5 मिली/ली) छिड़कें।',
          en: 'Collect and destroy leaf clusters with early gregarious larvae. Spray SlNPV 250 LE @ 1.5ml/L.',
        },
      },
      aboveEtl: {
        headline: { mr: 'ईटीएल ओलांडली - तातडीने फवारणी करा', hi: 'ईटीएल पार - छिड़काव करें', en: 'Above ETL - Urgent Chemical Spray' },
        action: {
          mr: 'क्लोराँट्रानिलीप्रोल १८.५% SC (३ मिली प्रति १० लिटर) किंवा इमामेक्टिन बेन्झोएट ५% SG (४ ग्रॅम/१० लिटर) फवारावे.',
          hi: 'क्लोरएंट्रानिलिप्रोल 18.5% SC (3 मिली/10 ली) अथवा इमामेक्टिन बेंजोएट 5% SG (4 ग्राम/10 ली) का छिड़काव करें।',
          en: 'Spray Chlorantraniliprole 18.5% SC @ 3ml/10L water or Emamectin Benzoate 5% SG @ 4g/10L water as per ICAR-IISR.',
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 5. SOYBEAN - Semilooper (Chrysodeixis acuta)
  // ---------------------------------------------------------------------------
  {
    id: 'soybean-semilooper',
    cropId: 'soybean',
    cropName: { mr: 'सोयाबीन (Soybean)', hi: 'सोयाबीन (Soybean)', en: 'Soybean' },
    pestName: {
      mr: 'उंट अळी (Semilooper)',
      hi: 'अर्धकुंडलक इल्ली (Semilooper)',
      en: 'Semilooper',
      scientific: 'Chrysodeixis acuta',
    },
    samplingMethod: {
      mr: '५ वेगवेगळ्या ठिकाणी प्रत्येकी १ मीटर ओळीतील झाडे हलवून खाली पडणाऱ्या अळ्या मोजा.',
      hi: '5 स्थानों पर 1 मीटर कतार के पौधों को हिलाकर गिरी हुई इल्लियों की गिनती करें।',
      en: 'Shake plants over a white sheet along 5 random 1-meter rows and count dislodged larvae.',
    },
    samplingUnit: 'per_meter_row',
    unitLabel: { mr: 'अळ्या प्रति मीटर ओळ', hi: 'इल्लियां प्रति मीटर कतार', en: 'Larvae / meter row' },
    minRecommendedSamples: 5,
    etlThreshold: 3.0,
    thresholdDisplay: {
      mr: '३ ते ४ अळ्या प्रति मीटर ओळ',
      hi: '3 से 4 इल्लियां प्रति मीटर कतार',
      en: '3 to 4 larvae per meter row length',
    },
    targetCropStage: {
      mr: 'शाकीय वाढ ते फुलोरा (२० ते ५० दिवस)',
      hi: 'वानस्पतिक से फूल अवस्था (20 से 50 दिन)',
      en: 'Vegetative to Flowering (20 to 50 DAS)',
    },
    sourceAuthority: 'ICAR - Indian Institute of Soybean Research (IISR), Indore',
    sourceDoc: 'ICAR-IISR Pest Management SOP for Soybean',
    revisionDate: '2025',
    managementAdvisory: {
      belowEtl: {
        headline: { mr: 'सुरक्षित (ईटीएल खाली)', hi: 'सुरक्षित स्तर', en: 'Safe (Below ETL)' },
        action: {
          mr: 'संख्या आर्थिक नुकसान पातळीखाली आहे. पक्षी थांबे लावावेत.',
          hi: 'संख्या सुरक्षित है। पक्षी टी-स्टैंड लगाएं।',
          en: 'Density below ETL. Conserve natural enemies; install bird perches.',
        },
      },
      approachingEtl: {
        headline: { mr: 'दक्षता पातळी - जैविक कीटकनाशक', hi: 'सतर्कता स्तर', en: 'Warning - Bio-insecticide' },
        action: {
          mr: 'बॅसिलस थुरिन्जिअनसिस (Bt) १ ग्रॅम प्रति लिटर किंवा ५% निंबोळी अर्क (NSKE) फवारा.',
          hi: 'बैसिलस थुरिनजिएन्सिस (Bt) 1 ग्राम/लीटर या 5% नीम अर्क छिड़कें।',
          en: 'Apply Bacillus thuringiensis (Bt) @ 1g/L or 5% NSKE.',
        },
      },
      aboveEtl: {
        headline: { mr: 'ईटीएल ओलांडली - रासायनिक उपाय', hi: 'ईटीएल पार', en: 'Above ETL - Chemical Control' },
        action: {
          mr: 'इंडॉक्साकार्ब १५.८% EC (६.५ मिली प्रति १० लिटर) किंवा फ्लुबेन्डियामाईड ३९.३५% SC (३ मिली/१० लिटर) फवारावे.',
          hi: 'इंडोक्साकार्ब 15.8% EC (6.5 मिली/10 ली) या फ्लूबेन्डियामाइड 39.35% SC (3 मिली/10 ली) का छिड़काव करें।',
          en: 'Spray Indoxacarb 15.8% EC @ 6.5ml/10L water or Flubendiamide 39.35% SC @ 3ml/10L water.',
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 6. PIGEON PEA / TUR - Pod Borer (Helicoverpa armigera)
  // ---------------------------------------------------------------------------
  {
    id: 'tur-helicoverpa',
    cropId: 'tur',
    cropName: { mr: 'तूर (Pigeon Pea)', hi: 'अरहर / तूर (Pigeon Pea)', en: 'Pigeon Pea (Tur)' },
    pestName: {
      mr: 'शेंग पोखरणारी अळी (Helicoverpa / घाटे अळी)',
      hi: 'फली छेदक इल्ली (Helicoverpa)',
      en: 'Gram Pod Borer',
      scientific: 'Helicoverpa armigera',
    },
    samplingMethod: {
      mr: '२० झाडांची झाडावर व जमिनीवर पडलेली फुले व शेंगा तपासा.',
      hi: '20 पौधों के फूल और फलियों का निरीक्षण करें।',
      en: 'Inspect flowers and developing pods across 20 randomly selected plants.',
    },
    samplingUnit: 'per_plant',
    unitLabel: { mr: 'अळी प्रति झाड', hi: 'इल्ली प्रति पौधा', en: 'Larvae / plant' },
    minRecommendedSamples: 20,
    etlThreshold: 1.0,
    thresholdDisplay: {
      mr: '१ अळी प्रति झाड (किंवा ५% नुकसानग्रस्त शेंगा)',
      hi: '1 इल्ली प्रति पौधा (या 5% क्षतिग्रस्त फलियां)',
      en: '1 larva per plant (or 5% pod damage)',
    },
    targetCropStage: {
      mr: 'कळी अवस्था, फुलोरा व शेंगा भरणे (८० ते १३० दिवस)',
      hi: 'कली, फूल एवं फली अवस्था (80 से 130 दिन)',
      en: 'Budding, Flowering & Podding (80 to 130 DAS)',
    },
    sourceAuthority: 'Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV), Akola & ICRISAT',
    sourceDoc: 'PDKV Pulses Crop Protection Advisory',
    revisionDate: '2025-2026',
    managementAdvisory: {
      belowEtl: {
        headline: { mr: 'सुरक्षित (ईटीएल खाली)', hi: 'सुरक्षित स्तर', en: 'Safe (Below ETL)' },
        action: {
          mr: 'प्रति एकरी ५ कामगंध सापळे लावा. पक्षी थांबे (T-stands) एकरी १५ लावावेत.',
          hi: 'प्रति एकड़ 5 फेरोमोन ट्रैप व 15 पक्षी टी-स्टैंड लगाएं।',
          en: 'Install 5 pheromone traps and 15 bird perches per acre. Monitor twice a week.',
        },
      },
      approachingEtl: {
        headline: { mr: 'दक्षता पातळी - जैविक फवारणी', hi: 'सतर्कता स्तर', en: 'Warning - Biological Spray' },
        action: {
          mr: '५% निंबोळी अर्क (NSKE) किंवा HaNPV १०० LE (१ मिली/लिटर) फवारावे.',
          hi: '5% नीम अर्क या HaNPV 100 LE (1 मिली/ली) का छिड़काव करें।',
          en: 'Spray 5% NSKE or HaNPV 100 LE @ 1ml/L at early instar stage.',
        },
      },
      aboveEtl: {
        headline: { mr: 'ईटीएल ओलांडली - रासायनिक फवारणी', hi: 'ईटीएल पार', en: 'Above ETL - Targeted Spray' },
        action: {
          mr: 'क्लोराँट्रानिलीप्रोल १८.५% SC (३ मिली प्रति १० लिटर) किंवा इमामेक्टिन बेन्झोएट ५% SG (४ ग्रॅम/१० लिटर) फवारावे.',
          hi: 'क्लोरएंट्रानिलिप्रोल 18.5% SC (3 मिली/10 ली) या इमामेक्टिन 5% SG (4 ग्राम/10 ली) का छिड़काव करें।',
          en: 'Spray Chlorantraniliprole 18.5% SC @ 3ml/10L water or Emamectin Benzoate 5% SG @ 4g/10L water as per PDKV.',
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 7. CHICKPEA / CHANA - Pod Borer (Helicoverpa armigera)
  // ---------------------------------------------------------------------------
  {
    id: 'chana-helicoverpa',
    cropId: 'chana',
    cropName: { mr: 'हरभरा (Gram / Chana)', hi: 'चना (Chickpea)', en: 'Chickpea / Gram' },
    pestName: {
      mr: 'घाटे अळी (Helicoverpa)',
      hi: 'घाटे की इल्ली (Helicoverpa)',
      en: 'Gram Pod Borer',
      scientific: 'Helicoverpa armigera',
    },
    samplingMethod: {
      mr: '५ ठिकाणी प्रत्येकी १ मीटर ओळीतील झाडांवरील अळ्या मोजा.',
      hi: '5 स्थानों पर प्रति 1 मीटर कतार में इल्लियों की गिनती करें।',
      en: 'Count larvae in 5 random 1-meter row lengths (or 20 plants).',
    },
    samplingUnit: 'per_meter_row',
    unitLabel: { mr: 'अळी प्रति मीटर ओळ', hi: 'इल्ली प्रति मीटर कतार', en: 'Larvae / meter row' },
    minRecommendedSamples: 5,
    etlThreshold: 1.0,
    thresholdDisplay: {
      mr: '१ अळी प्रति मीटर ओळ (किंवा १ अळी प्रति २ झाडे)',
      hi: '1 इल्ली प्रति मीटर कतार (या 1 इल्ली प्रति 2 पौधे)',
      en: '1 larva per meter row length (or 1 larva per 2 plants)',
    },
    targetCropStage: {
      mr: 'घाटे लागण्याची अवस्था (४० ते ७५ दिवस)',
      hi: 'घाटा (फली) बनने की अवस्था (40 से 75 दिन)',
      en: 'Pod Development Stage (40 to 75 DAS)',
    },
    sourceAuthority: 'Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV), Akola & ICAR-IIPR',
    sourceDoc: 'PDKV Rabi Crop Protection Handbook',
    revisionDate: '2025',
    managementAdvisory: {
      belowEtl: {
        headline: { mr: 'सुरक्षित (ईटीएल खाली)', hi: 'सुरक्षित स्तर', en: 'Safe (Below ETL)' },
        action: {
          mr: 'संख्या नियंत्रणात आहे. हरभऱ्याच्या शेतात आंतरपीक म्हणून धने किंवा मोहरी लावावी व पक्षी थांबे लावावेत.',
          hi: 'कीट संख्या सुरक्षित है। पक्षी बैठने के स्टैंड लगाएं।',
          en: 'Population within safe threshold. Install 15 bird perches per acre.',
        },
      },
      approachingEtl: {
        headline: { mr: 'दक्षता स्तर - जैविक फवारणी', hi: 'सतर्कता स्तर', en: 'Warning - Bio-agent' },
        action: {
          mr: '५% निंबोळी अर्क (NSKE) फवारावे किंवा कामगंध सापळे एकरी ५ लावावेत.',
          hi: '5% नीम अर्क का छिड़काव करें अथवा 5 फेरोमोन ट्रैप लगाएं।',
          en: 'Spray 5% NSKE or install 5 pheromone traps per acre.',
        },
      },
      aboveEtl: {
        headline: { mr: 'ईटीएल ओलांडली - फवारणी आवश्यक', hi: 'ईटीएल पार', en: 'Above ETL - Spray Required' },
        action: {
          mr: 'इमामेक्टिन बेन्झोएट ५% SG (४ ग्रॅम प्रति १० लिटर) किंवा क्लोराँट्रानिलीप्रोल १८.५% SC (२.५ मिली/१० लिटर) फवारावे.',
          hi: 'इमामेक्टिन बेंजोएट 5% SG (4 ग्राम/10 ली) या क्लोरएंट्रानिलिप्रोल 18.5% SC (2.5 मिली/10 ली) का छिड़काव करें।',
          en: 'Spray Emamectin Benzoate 5% SG @ 4g/10L water or Chlorantraniliprole 18.5% SC @ 2.5ml/10L water as per PDKV.',
        },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 8. CITRUS - Nagpur Mandarin Citrus Psylla (Diaphorina citri)
  // ---------------------------------------------------------------------------
  {
    id: 'citrus-psylla',
    cropId: 'citrus',
    cropName: { mr: 'संत्रा / मोसंबी (Citrus)', hi: 'संतरा / नींबू (Citrus)', en: 'Nagpur Mandarin / Citrus' },
    pestName: {
      mr: 'संत्रा सायला (Citrus Psylla - ग्रीनिंग रोगाचा प्रसारक)',
      hi: 'सिट्रस सायला (Citrus Psylla)',
      en: 'Citrus Psylla (Greening Vector)',
      scientific: 'Diaphorina citri',
    },
    samplingMethod: {
      mr: 'बागेतील ५ झाडे निवडून प्रत्येक झाडाच्या नवीन पालवीच्या (Flush) १० डहाळ्यांचे निरीक्षण करा.',
      hi: 'बगीचे में 5 पेड़ों के 10 नए प्ररोहों (Flush) का निरीक्षण करें।',
      en: 'Inspect 10 fresh tender flushes on 5 representative trees across the orchard.',
    },
    samplingUnit: 'per_plant',
    unitLabel: { mr: 'पिले प्रति डहाळी/शेंडा', hi: 'शिशु प्रति प्ररोह', en: 'Nymphs / shoot' },
    minRecommendedSamples: 5,
    etlThreshold: 5.0,
    thresholdDisplay: {
      mr: '५ पिले प्रति कोवळी डहाळी (Flush)',
      hi: '5 शिशु प्रति कोमल प्ररोह',
      en: '5 nymphs per fresh shoot/flush',
    },
    targetCropStage: {
      mr: 'आंबिया किंवा मृग बहराची नवीन पालवी फुटण्याची वेळ',
      hi: 'अंबिया या मृग बहार की नई पत्तियों के समय',
      en: 'New Flush Emergence during Ambia or Mrig Bahar',
    },
    sourceAuthority: 'ICAR - Central Citrus Research Institute (CCRI), Nagpur',
    sourceDoc: 'ICAR-CCRI Citrus Integrated Pest Management Package',
    revisionDate: '2025',
    managementAdvisory: {
      belowEtl: {
        headline: { mr: 'सुरक्षित (ईटीएल खाली)', hi: 'सुरक्षित स्तर', en: 'Safe (Below ETL)' },
        action: {
          mr: 'सायला मर्यादित आहे. परोपजीवी मित्रकीटक (Tamarixia radiata) सुरक्षित राहू द्या. पिवळे चिकट सापळे लावा.',
          hi: 'सायला नियंत्रित है। प्राकृतिक मित्र कीट सुरक्षित रहने दें।',
          en: 'Population within safe ecological threshold. Conserve Tamarixia radiata parasitoids.',
        },
      },
      approachingEtl: {
        headline: { mr: 'दक्षता स्तर - निंबोळी तेल', hi: 'सतर्कता स्तर', en: 'Warning - Neem Spray' },
        action: {
          mr: 'निंबोळी तेल १०००० पीपीएम (२ मिली/लिटर) फवारावे.',
          hi: 'नीम तेल 10000 ppm (2 मिली/लीटर) का छिड़काव करें।',
          en: 'Spray horticultural mineral oil or neem oil 10,000 ppm @ 2ml/L.',
        },
      },
      aboveEtl: {
        headline: { mr: 'ईटीएल ओलांडली - तत्काळ सायला नियंत्रण करा', hi: 'ईटीएल पार - छिड़काव करें', en: 'Above ETL - Urgent Vector Control' },
        action: {
          mr: 'सायला हा विनाशकारी सिट्रस ग्रीनिंग रोगाचा प्रसार करतो. थियामेथोक्साम २५% WG (३ ग्रॅम प्रति १० लिटर) किंवा इमिडाक्लोप्रिड १७.८% SL (५ मिली प्रति १० लिटर) फवारावे.',
          hi: 'सायला ग्रीनिंग रोग फैलाता है। थायामेथोक्साम 25% WG (3 ग्राम/10 ली) या इमिडाक्लोप्रिड 17.8% SL (5 मिली/10 ली) का छिड़काव करें।',
          en: 'Psylla is a vector for fatal Citrus Greening (HLB). Spray Thiamethoxam 25% WG @ 3g/10L water or Imidacloprid 17.8% SL @ 5ml/10L water.',
        },
      },
    },
  },
];

export type EtlEvaluationStatus = 'BELOW_ETL' | 'APPROACHING_ETL' | 'ABOVE_ETL' | 'DATA_INSUFFICIENT';

export interface EtlEvaluationResult {
  rule: PestEtlRule;
  samplesCount: number;
  totalPestObserved: number;
  calculatedAverage: number;
  status: EtlEvaluationStatus;
  percentageOfEtl: number;
  statusHeadline: { mr: string; hi: string; en: string };
  actionAdvisory: { mr: string; hi: string; en: string };
  isSufficientSample: boolean;
  explanation: { mr: string; hi: string; en: string };
}

export function evaluatePestScouting(
  ruleId: string,
  samplesCount: number,
  totalPestObserved: number
): EtlEvaluationResult {
  const rule = VERIFIED_ETL_RULES.find((r) => r.id === ruleId);
  if (!rule) {
    throw new Error(`ETL Rule '${ruleId}' not found in verified registry.`);
  }

  if (samplesCount <= 0) {
    throw new Error('Sample count must be greater than zero.');
  }

  const calculatedAverage = Number((totalPestObserved / samplesCount).toFixed(2));
  const isSufficientSample = samplesCount >= rule.minRecommendedSamples;
  const percentageOfEtl = Number(((calculatedAverage / rule.etlThreshold) * 100).toFixed(1));

  let status: EtlEvaluationStatus = 'BELOW_ETL';
  if (calculatedAverage >= rule.etlThreshold) {
    status = 'ABOVE_ETL';
  } else if (percentageOfEtl >= 75.0) {
    status = 'APPROACHING_ETL';
  }

  let statusHeadline = rule.managementAdvisory.belowEtl.headline;
  let actionAdvisory = rule.managementAdvisory.belowEtl.action;

  if (status === 'ABOVE_ETL') {
    statusHeadline = rule.managementAdvisory.aboveEtl.headline;
    actionAdvisory = rule.managementAdvisory.aboveEtl.action;
  } else if (status === 'APPROACHING_ETL') {
    statusHeadline = rule.managementAdvisory.approachingEtl.headline;
    actionAdvisory = rule.managementAdvisory.approachingEtl.action;
  }

  const explanation = {
    mr: `नोंदवलेली सरासरी: ${calculatedAverage} ${rule.unitLabel.mr}. अधिकृत ईटीएल मर्यादा: ${rule.etlThreshold} ${rule.unitLabel.mr} (${percentageOfEtl}% ईटीएल प्रमाण). नमुने संख्या: ${samplesCount} (किमान शिफारस: ${rule.minRecommendedSamples}).`,
    hi: `दर्ज औसत: ${calculatedAverage} ${rule.unitLabel.hi}। आधिकारिक ईटीएल सीमा: ${rule.etlThreshold} ${rule.unitLabel.hi} (${percentageOfEtl}% अनुपात)। नमूने: ${samplesCount}।`,
    en: `Observed Average: ${calculatedAverage} ${rule.unitLabel.en}. Official ETL threshold: ${rule.etlThreshold} ${rule.unitLabel.en} (${percentageOfEtl}% of ETL). Samples inspected: ${samplesCount} (minimum recommended: ${rule.minRecommendedSamples}).`,
  };

  return {
    rule,
    samplesCount,
    totalPestObserved,
    calculatedAverage,
    status,
    percentageOfEtl,
    statusHeadline,
    actionAdvisory,
    isSufficientSample,
    explanation,
  };
}

export function getRulesByCrop(cropId: string): PestEtlRule[] {
  return VERIFIED_ETL_RULES.filter((r) => r.cropId === cropId);
}
