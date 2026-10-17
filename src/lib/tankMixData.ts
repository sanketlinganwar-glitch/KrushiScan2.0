import { 
  ChemicalItem, 
  VerifiedCompatibilityRule, 
  TankMixEvaluationResult, 
  WalesMixingStep, 
  CompatibilityStatus,
  FormulationCode
} from '../types';

/**
 * KrushiScan AI - Authoritative Agricultural Chemical & Fertilizer Tank-Mix Registry
 * Sources:
 * - Central Insecticides Board & Registration Committee (CIBRC), Ministry of Agriculture, GoI
 * - Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV), Akola (Vidarbha Package of Practices)
 * - ICAR - Central Institute for Cotton Research (CICR), Nagpur
 * - Fertilizer (Inorganic, Organic or Mixed) (Control) Order (FCO), 1985
 */

export const VIDARBHA_CHEMICAL_REGISTRY: ChemicalItem[] = [
  // INSECTICIDES
  {
    id: 'profenofos-50-ec',
    name: 'Profenofos 50% EC',
    tradeNameExample: 'Curacron / Prahar / Carina',
    category: 'insecticide',
    formulation: 'EC',
    formulationFullName: 'Emulsifiable Concentrate (EC)',
    activeIngredient: 'Profenofos (Organophosphate)',
    commonTarget: {
      mr: 'गुलाबी बोंडअळी, बोंडअळ्या व लष्करी अळी',
      hi: 'गुलाबी सुंडी एवं तंबाकू इल्ली',
      en: 'Pink bollworm, bollworm complex & spodoptera',
    },
  },
  {
    id: 'emamectin-5-sg',
    name: 'Emamectin Benzoate 5% SG',
    tradeNameExample: 'Proclaim / Missile / Emamec',
    category: 'insecticide',
    formulation: 'SG',
    formulationFullName: 'Soluble Granule (SG/WDG)',
    activeIngredient: 'Emamectin Benzoate (Avermectin)',
    commonTarget: {
      mr: 'बोंडअळी, शेंगपोखरणारी अळी व पाने खाणारी अळी',
      hi: 'इल्ली व फली छेदक',
      en: 'Bollworms, pod borers & leaf eaters',
    },
  },
  {
    id: 'chlorantraniliprole-sc',
    name: 'Chlorantraniliprole 18.5% SC',
    tradeNameExample: 'Coragen / Vesticor / Shenzi',
    category: 'insecticide',
    formulation: 'SC',
    formulationFullName: 'Suspension Concentrate (SC)',
    activeIngredient: 'Chlorantraniliprole (Anthranilic Diamide)',
    commonTarget: {
      mr: 'पाने गुंडाळणारी अळी, बोंडअळी व खोडकिडा',
      hi: 'तना छेदक व इल्ली',
      en: 'Leaf folders, bollworms & stem borers',
    },
  },
  {
    id: 'flonicamid-50-wg',
    name: 'Flonicamid 50% WG',
    tradeNameExample: 'Ulala / Aphid-end',
    category: 'insecticide',
    formulation: 'WDG',
    formulationFullName: 'Water Dispersible Granules (WDG/WG)',
    activeIngredient: 'Flonicamid (Pyridinecarboxamide)',
    commonTarget: {
      mr: 'पांढरी माशी, तुडतुडे व मावा (रसशोषक किडी)',
      hi: 'सफेद मक्खी एवं माहू (रस चूसक कीट)',
      en: 'Whiteflies, jassids, aphids (sucking pests)',
    },
  },
  {
    id: 'diafenthiuron-50-wp',
    name: 'Diafenthiuron 50% WP',
    tradeNameExample: 'Pegasus / Agnapathi',
    category: 'insecticide',
    formulation: 'WP',
    formulationFullName: 'Wettable Powder (WP)',
    activeIngredient: 'Diafenthiuron (Thiourea derivative)',
    commonTarget: {
      mr: 'पांढरी माशी, लाल कोळी व थ्रिप्स',
      hi: 'सफेद मक्खी व माइट्स',
      en: 'Whitefly, red spider mites & thrips',
    },
  },
  {
    id: 'acetamiprid-20-sp',
    name: 'Acetamiprid 20% SP',
    tradeNameExample: 'Pride / Rekord / Manik',
    category: 'insecticide',
    formulation: 'SP',
    formulationFullName: 'Soluble Powder (SP)',
    activeIngredient: 'Acetamiprid (Neonicotinoid)',
    commonTarget: {
      mr: 'मावा, तुडतुडे व थ्रिप्स',
      hi: 'माहू व थ्रिप्स',
      en: 'Aphids, leafhoppers & thrips',
    },
  },

  // FUNGICIDES & BACTERICIDES
  {
    id: 'copper-oxychloride-wp',
    name: 'Copper Oxychloride 50% WP',
    tradeNameExample: 'Blitox / Blue Copper / Fytolan',
    category: 'fungicide',
    formulation: 'WP',
    formulationFullName: 'Wettable Powder (WP)',
    activeIngredient: 'Copper Oxychloride (Inorganic Copper)',
    commonTarget: {
      mr: 'जिवाणूजन्य करपा (ब्लॅक आर्म), तांबेरा व मूळकूज',
      hi: 'बैक्टीरियल ब्लाइट एवं तूतिया झुलसा',
      en: 'Bacterial blight (blackarm), rust & root rot',
    },
  },
  {
    id: 'streptocycline-sp',
    name: 'Streptocycline 90:10 SP',
    tradeNameExample: 'Streptocycline / Plantomycin / Bactimycin',
    category: 'fungicide',
    formulation: 'SP',
    formulationFullName: 'Soluble Powder (SP)',
    activeIngredient: 'Streptomycin Sulphate 90% + Tetracycline Hydrochloride 10%',
    commonTarget: {
      mr: 'जिवाणू करपा (Bacterial Blight)',
      hi: 'जीवाणु झुलसा रोग',
      en: 'Bacterial blight & vascular bacterial infections',
    },
  },
  {
    id: 'carbendazim-50-wp',
    name: 'Carbendazim 50% WP',
    tradeNameExample: 'Bavistin / Dhanustin',
    category: 'fungicide',
    formulation: 'WP',
    formulationFullName: 'Wettable Powder (WP)',
    activeIngredient: 'Carbendazim (Benzimidazole)',
    commonTarget: {
      mr: 'तुरीचा मर रोग, पानांवरील ठिपके व बुरशी',
      hi: 'उकठा (विल्ट) व पत्ती धब्बा',
      en: 'Fusarium wilt, leaf spots & anthracnose',
    },
  },
  {
    id: 'mancozeb-75-wp',
    name: 'Mancozeb 75% WP',
    tradeNameExample: 'Dithane M-45 / Indofil M-45',
    category: 'fungicide',
    formulation: 'WP',
    formulationFullName: 'Wettable Powder (WP)',
    activeIngredient: 'Mancozeb (Dithiocarbamate)',
    commonTarget: {
      mr: 'अल्टरनेरिया करपा, पानांवरील बुरशीजन्य ठिपके',
      hi: 'अल्टरनेरिया झुलसा व टिक्का',
      en: 'Alternaria blight, leaf spot & damping off',
    },
  },
  {
    id: 'hexaconazole-5-ec',
    name: 'Hexaconazole 5% EC',
    tradeNameExample: 'Contaf / Sitara',
    category: 'fungicide',
    formulation: 'EC',
    formulationFullName: 'Emulsifiable Concentrate (EC)',
    activeIngredient: 'Hexaconazole (Triazole)',
    commonTarget: {
      mr: 'भुरी रोग (Powdery Mildew) व तांबेरा',
      hi: 'चूर्णिल आसिता एवं गेरुआ',
      en: 'Powdery mildew, sheath blight & rust',
    },
  },
  {
    id: 'azoxy-difen-sc',
    name: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
    tradeNameExample: 'Amistar Top / Custodia',
    category: 'fungicide',
    formulation: 'SC',
    formulationFullName: 'Suspension Concentrate (SC)',
    activeIngredient: 'Azoxystrobin + Difenoconazole',
    commonTarget: {
      mr: 'करपा, तांबेरा व शेंग करपा',
      hi: 'झुलसा एवं फली झुलसा',
      en: 'Broad spectrum fungal blights & anthracnose',
    },
  },
  {
    id: 'trichoderma-bio',
    name: 'Trichoderma viride (Bio-fungicide)',
    tradeNameExample: 'Niprot / Sanjeevani / Bio-Dew',
    category: 'biocontrol',
    formulation: 'BIO',
    formulationFullName: 'Live Spore Biological Powder (BIO)',
    activeIngredient: 'Trichoderma viride (Living fungal antagonist)',
    commonTarget: {
      mr: 'जमिनीतील बुरशी, तुरीचा मर रोग व मुळकूज',
      hi: 'मृदा जनित कवक व उकठा रोग',
      en: 'Soil-borne pathogens, Fusarium wilt & root rot',
    },
  },

  // FOLIAR FERTILIZERS & MICRONUTRIENTS
  {
    id: 'npk-19-19-19-wsf',
    name: '19:19:19 (Water Soluble NPK)',
    tradeNameExample: 'Mahadhan 19:19:19 / IFFCO / YaraMila',
    category: 'fertilizer',
    formulation: 'WSF',
    formulationFullName: 'Water Soluble Fertilizer (WSF)',
    activeIngredient: 'Total N 19%, P2O5 19%, K2O 19%',
    commonTarget: {
      mr: 'शाकीय वाढ, फुटवे व समतोल पोषण',
      hi: 'संतुलित वनस्पति वृद्धि व कल्ले',
      en: 'Balanced vegetative growth & canopy vigor',
    },
  },
  {
    id: 'map-12-61-00-wsf',
    name: '12:61:00 (Mono Ammonium Phosphate)',
    tradeNameExample: 'Mahadhan 12:61:00 / Nutri-Phosph',
    category: 'fertilizer',
    formulation: 'WSF',
    formulationFullName: 'Water Soluble Fertilizer (WSF)',
    activeIngredient: 'Ammoniacal Nitrogen 12%, Water Soluble Phosphate 61%',
    commonTarget: {
      mr: 'मुळांचा विकास, कळी व फुलोरा अवस्था',
      hi: 'जड़ों का विकास व फूल बनने की अवस्था',
      en: 'Root proliferation & flower induction',
    },
  },
  {
    id: 'potassium-nitrate-13-00-45',
    name: '13:00:45 (Potassium Nitrate)',
    tradeNameExample: 'Multi-K / Mahadhan 13:00:45',
    category: 'fertilizer',
    formulation: 'WSF',
    formulationFullName: 'Water Soluble Fertilizer (WSF)',
    activeIngredient: 'Nitrate Nitrogen 13%, Water Soluble Potash 45%',
    commonTarget: {
      mr: 'बोंड व शेंगा भरण्याची अवस्था, दाण्यांचे वजन',
      hi: 'टिंडा व दाना भराई, वजन वृद्धि',
      en: 'Boll enlargement, grain filling & drought tolerance',
    },
  },
  {
    id: 'sop-00-00-50',
    name: '00:00:50 (Sulfate of Potash - SOP)',
    tradeNameExample: 'Potasol / Mahadhan SOP',
    category: 'fertilizer',
    formulation: 'WSF',
    formulationFullName: 'Water Soluble Fertilizer (WSF)',
    activeIngredient: 'Potassium 50%, Sulfur 17.5%',
    commonTarget: {
      mr: 'कापसाच्या धाग्याची प्रत, तेल प्रमाण व चमक',
      hi: 'रेशा की गुणवत्ता एवं तेल मात्रा',
      en: 'Fiber tensile strength & oil content',
    },
  },
  {
    id: 'magnesium-sulphate',
    name: 'Magnesium Sulphate (MgSO4)',
    tradeNameExample: 'Agriculture Epsom Salt / Mg-Sul',
    category: 'fertilizer',
    formulation: 'WSF',
    formulationFullName: 'Water Soluble Micronutrient (WSF)',
    activeIngredient: 'Magnesium (Mg) 9.6%, Sulfur (S) 12%',
    commonTarget: {
      mr: 'कपाशीचा लाल्या रोग प्रतिबंध, हरितद्रव्य वाढ',
      hi: 'कपास में लाल पत्ती रोकथाम एवं क्लोरोफिल',
      en: 'Cotton leaf reddening (Lalya) mitigation',
    },
  },
  {
    id: 'calcium-nitrate',
    name: 'Calcium Nitrate',
    tradeNameExample: 'Calci-Nit / YaraLiva Calcinit',
    category: 'fertilizer',
    formulation: 'WSF',
    formulationFullName: 'Water Soluble Fertilizer (WSF)',
    activeIngredient: 'Nitrate Nitrogen 15.5%, Water Soluble Calcium 18.8%',
    commonTarget: {
      mr: 'पेशीभित्तिका मजबुती, फळगळ व बोंडगळ थांबवणे',
      hi: 'कोशिका दीवार मजबूती एवं फल-फूल झड़ने से बचाव',
      en: 'Cell wall rigidity & square retention',
    },
  },
  {
    id: 'boron-20',
    name: 'Boron 20% (Disodium Octaborate)',
    tradeNameExample: 'Borax / Solubor / Mahadhan Boron',
    category: 'fertilizer',
    formulation: 'SP',
    formulationFullName: 'Soluble Powder (SP)',
    activeIngredient: 'Boron (B) 20%',
    commonTarget: {
      mr: 'उत्तम परागीभवन व फुलांची गळ रोखणे',
      hi: 'परागकण एवं फूल झड़ने से रोकथाम',
      en: 'Pollen viability & flower drop prevention',
    },
  },
  {
    id: 'chelated-zinc',
    name: 'Chelated Zinc (Zn-EDTA 12%)',
    tradeNameExample: 'Chelamin / Zinc-EDTA',
    category: 'fertilizer',
    formulation: 'SP',
    formulationFullName: 'Chelated Micronutrient (SP)',
    activeIngredient: 'Zinc as Zn-EDTA 12%',
    commonTarget: {
      mr: 'पाने लहान राहणे (लिटल लीफ) प्रतिबंध',
      hi: 'खैरा रोग एवं पत्ती का छोटा रहना रोकथाम',
      en: 'Auxin synthesis & zinc chlorosis prevention',
    },
  },

  // ADJUVANTS
  {
    id: 'silicon-spreader',
    name: 'Non-ionic Silicon Spreader & Sticker',
    tradeNameExample: 'Apsa-80 / Break-Thru / Wet-Cit',
    category: 'adjuvant',
    formulation: 'ADJ',
    formulationFullName: 'Adjuvant / Surfactant (Liquid)',
    activeIngredient: 'Polyether Polymethylsiloxane / Non-ionic surfactant',
    commonTarget: {
      mr: 'औषध पानांवर पसरवणे व पावसापासून धुवून न जाणे',
      hi: 'दवा का फैलाव एवं बारिश से धुलाई से बचाव',
      en: 'Surface tension reduction & rain-fastness',
    },
  },
];

/**
 * Authoritative Compatibility Database
 * Includes explicit sources, technical rationale, and statutory verification status.
 */
export const VERIFIED_COMPATIBILITY_RULES: VerifiedCompatibilityRule[] = [
  // 1. Copper Oxychloride + Streptocycline (VERIFIED COMPATIBLE)
  {
    id: 'rule-coc-strepto',
    chemicalAId: 'copper-oxychloride-wp',
    chemicalBId: 'streptocycline-sp',
    status: 'verified_compatible',
    primaryRisk: 'none',
    headline: {
      mr: 'सुसंगत व विद्यापीठ शिफारशीत जोड (Compatible)',
      hi: 'अनुकूल एवं अनुशंसित संयोजन (Compatible)',
      en: 'Verified Compatible & University Recommended',
    },
    explanation: {
      mr: 'कपाशीवरील जिवाणूजन्य करपा (Black Arm / Xanthomonas) नियंत्रणासाठी डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV अकोला) आणि CICR नागपूर द्वारे शिफारशीत अधिकृत मिश्रण आहे. हे मिश्रण जिवाणूंचा प्रसार त्वरित थांबवते.',
      hi: 'कपास में बैक्टीरियल ब्लाइट (जीवाणु झुलसा) के नियंत्रण हेतु डॉ. PDKV अकोला एवं CICR नागपुर द्वारा अनुशंसित प्रमाणित मिश्रण है।',
      en: 'Formally recommended by Dr. PDKV Akola & ICAR-CICR for cotton bacterial blight (Xanthomonas citri pv. malvacearum). Highly stable in aqueous suspension.',
    },
    sourceAuthority: 'Dr. PDKV Akola & ICAR-CICR Nagpur Package of Practices (Cotton Pathology)',
    documentTitle: 'Package of Practices for Kharif Crops: Cotton Disease Management (खरीप पिके शिफारशी पुस्तिका - कपाशीवरील जिवाणू करपा नियंत्रण)',
    issuingAuthority: 'Directorate of Research, Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV), Akola & ICAR-CICR Nagpur',
    publicationDate: '2023-2024 Edition',
    sectionOrPage: 'Section 4.3: Cotton Pathology - Xanthomonas axonopodis pv. malvacearum',
    evidenceType: 'university_recommendation',
    applicableConditions: {
      mr: 'प्रमाण: कॉपर ऑक्सिक्लोराईड २५ ग्रॅम + स्ट्रेप्टोसायक्लीन १ ग्रॅम प्रति १० लिटर पाणी. प्रथम पावडर थोड्या पाण्यात घोळून मग पंपात टाकावी.',
      hi: 'मात्रा: कॉपर ऑक्सीक्लोराइड 25 ग्राम + स्ट्रेप्टोसाइक्लिन 1 ग्राम प्रति 10 लीटर पानी।',
      en: 'Dosage: Copper Oxychloride 25g + Streptocycline 1g per 10 Liters of water. Pre-dissolve separately before mixing.',
    },
    verificationStatus: 'verified_university_label',
  },

  // 2. Magnesium Sulphate + 19:19:19 (VERIFIED COMPATIBLE)
  {
    id: 'rule-mgso4-191919',
    chemicalAId: 'magnesium-sulphate',
    chemicalBId: 'npk-19-19-19-wsf',
    status: 'verified_compatible',
    primaryRisk: 'none',
    headline: {
      mr: 'सुसंगत - कपाशीच्या लाल्यावरील अधिकृत उपाय (Compatible)',
      hi: 'अनुकूल - कपास में लाल पत्ती का प्रमाणित उपचार (Compatible)',
      en: 'Verified Compatible - Standard Lalya Remediation',
    },
    explanation: {
      mr: 'विदर्भातील भारी काळ्या जमिनीत बोंडे भरताना होणाऱ्या मॅग्नेशियम कमतरतेमुळे (लाल्या) पाने लाल पडतात. ०.५% मॅग्नेशियम सल्फेट आणि ०.५% १९:१९:१९ चे फवारणी मिश्रण विद्यापीठाने प्रमाणित केलेले आहे.',
      hi: 'विदर्भ की काली मिट्टी में मैग्नीशियम की कमी से होने वाले लाल पत्ती रोग के लिए 0.5% मैग्नीशियम सल्फेट + 0.5% 19:19:19 का छिड़काव अनुशंसित है।',
      en: 'Scientifically validated foliar treatment for physiological leaf reddening (Lalya) in Bt cotton during flowering and boll opening phases.',
    },
    sourceAuthority: 'Dr. PDKV Akola Agronomy Research Bulletin (Cotton Nutritional Starvation)',
    documentTitle: 'Cotton Production Technology & Physiological Disorders in Vidarbha (विदर्भातील कपाशीवरील लाल्या विकृती व अन्नद्रव्य व्यवस्थापन)',
    issuingAuthority: 'Department of Agronomy & Soil Science, Dr. PDKV Akola',
    publicationDate: 'Research Bulletin No. 18 (Updated 2023)',
    sectionOrPage: 'Chapter: Magnesium & NPK Foliar Nutrition in Bt Cotton',
    evidenceType: 'university_recommendation',
    applicableConditions: {
      mr: 'प्रमाण: ५० ग्रॅम MgSO4 + ५० ग्रॅम १९:१९:१९ प्रति १० लिटर पाणी (०.५% सांद्रता). सकाळी किंवा उशिरा दुपारी फवारणी करावी.',
      hi: 'मात्रा: 50 ग्राम MgSO4 + 50 ग्राम 19:19:19 प्रति 10 लीटर पानी।',
      en: 'Dosage: 50g MgSO4 + 50g 19:19:19 per 10 Liters water (0.5% solution). Spray during early morning or late afternoon.',
    },
    verificationStatus: 'verified_university_label',
  },

  // 3. Copper Oxychloride + Organophosphate Insecticide (INCOMPATIBLE - Hydrolysis)
  {
    id: 'rule-coc-organophosphate',
    chemicalAId: 'copper-oxychloride-wp',
    chemicalBId: 'profenofos-50-ec',
    status: 'incompatible',
    primaryRisk: 'chemical_neutralization',
    headline: {
      mr: 'धोकादायक! एकत्र मिसळू नका (Incompatible - Chemical Deactivation)',
      hi: 'असंगत! एक साथ न मिलाएं (Incompatible)',
      en: 'Incompatible - Chemical Breakdown Hazard',
    },
    explanation: {
      mr: 'कॉपर ऑक्सिक्लोराईडचे द्रावण अल्कलाईन (Alkaline pH > 8.0) असते. अल्कलाईन माध्यमात प्रोफेनोफॉस सारख्या ऑर्गनोफॉस्फेट कीटकनाशकाचे रासायनिक विघटन (Alkaline Hydrolysis) होते, ज्यामुळे औषधाची कीड मारण्याची क्षमता पूर्णपणे नष्ट होते आणि पानांवर करपा (Phytotoxicity) येऊ शकतो.',
      hi: 'कॉपर ऑक्सीक्लोराइड का घोल क्षारीय होता है जिससे ऑर्गेनोफॉस्फेट कीटनाशक निष्प्रभावी हो जाता है और फसल पर झुलसा आ सकता है।',
      en: 'Copper creates an alkaline tank environment causing rapid alkaline hydrolysis of organophosphate esters, deactivating insecticidal efficacy and risking crop phytotoxicity.',
    },
    sourceAuthority: 'ICAR-IARI Division of Agricultural Chemicals / Pesticide Science Incompatibility Manual',
    documentTitle: 'Pesticide Compatibility and Formulation Chemistry: Risks of Alkaline Hydrolysis',
    issuingAuthority: 'ICAR-Indian Agricultural Research Institute (IARI) & CIBRC Technical Guidelines',
    publicationDate: 'Technical Monograph 2021',
    sectionOrPage: 'Inorganics & Organophosphates Interaction: Rapid Ester Hydrolysis above pH 8.0',
    evidenceType: 'incompatibility_science',
    applicableConditions: {
      mr: 'रासायनिक विघटन (Alkaline Hydrolysis) आणि करपा धोक्यामुळे एकत्र फवारू नका. स्वतंत्र फवारणीसाठी संबंधित उत्पादनाच्या बाटलीवरील लेबल निर्देश आणि कृषी विद्यापीठाच्या (PDKV) कीड व्यवस्थापन वेळापत्रकाचे (ETL) पालन करा.',
      hi: 'रासायनिक विघटन व फसल झुलसा के खतरे के कारण साथ न मिलाएं। अलग-अलग छिड़काव हेतु उत्पाद के लेबल निर्देश एवं विश्वविद्यालय की संस्तुति का पालन करें।',
      en: 'Do not tank mix due to rapid alkaline hydrolysis and foliar phytotoxicity risk. For individual sequential applications, adhere to the respective product label re-application intervals and university pest threshold (ETL) guidelines.',
    },
    verificationStatus: 'statutory_incompatibility',
  },

  // 4. Copper Oxychloride + Biocontrol (CAUTION - Strain-Dependent Sensitivity & Application Context)
  {
    id: 'rule-coc-trichoderma',
    chemicalAId: 'copper-oxychloride-wp',
    chemicalBId: 'trichoderma-bio',
    status: 'caution_jar_test',
    primaryRisk: 'biocide_inactivation',
    headline: {
      mr: 'सावधान: स्ट्रेन व प्रमाणानुसार संवेदनशीलता (Strain-Dependent Sensitivity)',
      hi: 'सावधानी: स्ट्रेन व मात्रा पर निर्भर संवेदनशीलता (Caution: Strain-Dependent)',
      en: 'Caution - Strain-Dependent Sensitivity & Application Context',
    },
    explanation: {
      mr: 'आयसीएआर (ICAR-NBAIR / NCIPM) संशोधनानुसार कॉपर ऑक्सिक्लोराईड आणि ट्रायकोडर्माची सुसंगतता ही बुरशीच्या विशिष्ट स्ट्रेन (उदा. कॉपर-सहनशील स्ट्रेन्स) आणि कॉपरच्या प्रमाणावर अवलंबून असते. शिफारशीत फवारणी मात्रेत (०.२५% - ०.३%) सामान्य स्ट्रेन्सच्या बीजाणूंची उगवण व वाढ मंदावू शकते. व्यावसायिक पाकिटावर कॉपर सहनशीलतेचा प्रमाणित उल्लेख नसल्यास फवारणी टाकीत थेट एकत्र मिसळणे टाळा.',
      hi: 'आईसीएआर (ICAR-NBAIR / NCIPM) शोध के अनुसार कॉपर और ट्राइकोडर्मा की अनुकूलता ट्राइकोडर्मा के विशिष्ट स्ट्रेन और कॉपर की सांद्रता पर निर्भर करती है। सामान्य स्ट्रेन में कवक बीजाणुओं की वृद्धि रुक सकती है। उत्पाद लेबल पर कॉपर सहिष्णुता का प्रमाण न होने पर स्प्रे टैंक में एक साथ मिलाने से बचें।',
      en: 'ICAR research (ICAR-NBAIR / NCIPM) establishes that Trichoderma sensitivity to Copper Oxychloride varies substantially across fungal isolates, formulation concentrations, and application modes. While certain adapted strains exhibit partial copper tolerance in Integrated Disease Management (IDM), standard commercial strains suffer conidial and mycelial suppression at full field foliar rates (0.25% – 0.3%). Without product-specific label certification of copper tolerance, avoid simultaneous tank mixing.',
    },
    sourceAuthority: 'ICAR-National Bureau of Agricultural Insect Resources (NBAIR) & ICAR-NCIPM Research Bulletins',
    documentTitle: 'Biological Control: Evaluation of Fungicide Tolerance in Trichoderma Isolates',
    issuingAuthority: 'ICAR-National Bureau of Agricultural Insect Resources (NBAIR) & ICAR-NCIPM',
    publicationDate: 'ICAR Technical Bulletin Series',
    sectionOrPage: 'Comparative In-Vitro & Field Fungicide Tolerance of Trichoderma Isolates',
    evidenceType: 'conditional_field_practice',
    applicableConditions: {
      mr: 'व्यावसायिक पाकिटावर कॉपर सहनशीलतेचा स्पष्ट उल्लेख नसल्यास फवारणीत एकत्र मिसळणे टाळा. एकात्मिक व्यवस्थापनात ट्रायकोडर्माचा वापर प्रामुख्याने बियाणे प्रक्रिया किंवा शेणखतातून जमिनीत करावा, तर कॉपरचा वापर पानांवर संरक्षणात्मक फवारणीसाठी करावा. पुनर्वापराचा कालावधी उत्पादनाच्या लेबल निर्देशानुसार ठेवावा.',
      hi: 'लेबल पर कॉपर सहिष्णुता प्रमाणित न होने पर साथ मिलाने से बचें। ट्राइकोडर्मा का उपयोग बीज या मृदा उपचार में करें और कॉपर का छिड़काव पत्तियों पर करें। अंतराल हेतु उत्पाद लेबल का पालन करें।',
      en: 'Avoid simultaneous foliar tank mixing unless using a certified copper-tolerant biocontrol isolate. In IDM, apply Trichoderma preferentially via seed coating or organic soil application, utilizing copper as a targeted foliar protectant. Follow product-specific label intervals.',
    },
    verificationStatus: 'unverified_field_practice',
  },

  // 5. Carbendazim + Trichoderma (INCOMPATIBLE - Biocide)
  {
    id: 'rule-carbendazim-trichoderma',
    chemicalAId: 'carbendazim-50-wp',
    chemicalBId: 'trichoderma-bio',
    status: 'incompatible',
    primaryRisk: 'biocide_inactivation',
    headline: {
      mr: 'असंगत! रासायनिक बुरशीनाशकामुळे ट्रायकोडर्मा मरतो',
      hi: 'असंगत! रासायनिक फफूंदनाशी से ट्राइकोडर्मा नष्ट होता है',
      en: 'Incompatible - Synthetic Fungicide Destroys Bio-agent',
    },
    explanation: {
      mr: 'कार्बेन्डाझिम हे अंतर्प्रवाही बुरशीनाशक असून ते जमिनीत व पानांवर ट्रायकोडर्माच्या पेशींची वाढ रोखते व त्याला नष्ट करते.',
      hi: 'कार्बेन्डाजिम अंतःप्रवाही फफूंदनाशी होने के कारण ट्राइकोडर्मा को मार देता है।',
      en: 'Carbendazim is a systemic benzimidazole that completely inhibits the growth of Trichoderma mycelium.',
    },
    sourceAuthority: 'ICAR-Indian Institute of Pulses Research (IIPR) Wilt Management Protocol',
    documentTitle: 'Integrated Wilt Management in Pigeonpea (तूर पीक संरक्षण मार्गदर्शिका)',
    issuingAuthority: 'ICAR-Indian Institute of Pulses Research (IIPR), Kanpur & Dr. PDKV Akola',
    publicationDate: 'Standard Operating Protocol 2022',
    sectionOrPage: 'Section 6: Biofungicides and Chemical Incompatibilities',
    evidenceType: 'incompatibility_science',
    applicableConditions: {
      mr: 'कार्बेन्डाझिमच्या तीव्र बुरशीनाशक प्रभावामुळे ट्रायकोडर्मा नष्ट होतो. एकत्र वापरू नका. स्वतंत्र वापरासाठी उत्पादन लेबल व विद्यापीठ शिफारशीचे पालन करा.',
      hi: 'कार्बेन्डाजिम से ट्राइकोडर्मा नष्ट हो जाता है। साथ न मिलाएं। अलग-अलग उपयोग हेतु लेबल निर्देश देखें।',
      en: 'Carbendazim is fungitoxic to Trichoderma mycelium. Do not combine in soil drench or tank spray; refer to product label instructions for appropriate application timing.',
    },
    verificationStatus: 'statutory_incompatibility',
  },

  // 6. Calcium Nitrate + Magnesium Sulphate (INCOMPATIBLE - Insoluble Gypsum Precipitation)
  {
    id: 'rule-calcium-sulfate',
    chemicalAId: 'calcium-nitrate',
    chemicalBId: 'magnesium-sulphate',
    status: 'incompatible',
    primaryRisk: 'precipitation_curdling',
    headline: {
      mr: 'सक्त मनाई! रासायनिक अभिक्रियेतून अद्रव्य जिप्सम साका तयार होतो',
      hi: 'सख्त मना! रासायनिक अभिक्रिया से अघुलनशील जिप्सम तलछट बन जाता है',
      en: 'Incompatible - Insoluble Gypsum Precipitation',
    },
    explanation: {
      mr: 'कॅल्शियम नायट्रेटमधील कॅल्शियम आयन्स (Ca²⁺) आणि मॅग्नेशियम सल्फेटमधील सल्फेट आयन्स (SO₄²⁻) यांच्या संयोगाने रासायनिक विद्राव्यता नियमांनुसार अद्रव्य कॅल्शियम सल्फेट (जिप्सम - CaSO₄·2H₂O) चे घट्ट खडे तयार होतात. यामुळे पंपाचे नोझल चोक होतात आणि दोन्ही अन्नद्रव्ये पिकाला उपलब्ध होत नाहीत. फर्टीगेशन व फवारणीमध्ये कॅल्शियम आणि सल्फेट खते नेहमी स्वतंत्र टाक्यांमध्ये (Tank A व Tank B) किंवा स्वतंत्र फवारणीत वापरली जातात.',
      hi: 'कैल्शियम आयन और सल्फेट आयन आपस में मिलकर अघुलनशील जिप्सम (Calcium Sulfate) बनाते हैं। इससे नोजल जाम हो जाते हैं और पोषक तत्व अनुपलब्ध हो जाते हैं। इन्हें हमेशा अलग-अलग छिड़कें।',
      en: 'Aqueous solubility chemistry dictates that calcium ions (Ca²⁺) and sulfate ions (SO₄²⁻) precipitate as insoluble gypsum (CaSO₄·2H₂O) sludge, clogging spray nozzles and rendering both nutrients bio-unavailable. Agronomic fertigation guidelines mandate isolating calcium in Stock Tank A and sulfates in Stock Tank B.',
    },
    sourceAuthority: 'ICAR-Indian Institute of Soil Science (IISS), Bhopal & University Fertigation Handbooks',
    documentTitle: 'Handbook of Water-Soluble Fertilizers & Fertigation Protocols: Principles of Aqueous Ionic Compatibility',
    issuingAuthority: 'ICAR-Indian Institute of Soil Science (IISS) & State Agricultural Universities',
    publicationDate: 'ICAR-IISS Technical Manual & SAU Fertigation Protocols',
    sectionOrPage: 'Principles of Fertilizer Solubility: Calcium-Sulfate (Gypsum) Precipitation Dynamics',
    evidenceType: 'incompatibility_science',
    applicableConditions: {
      mr: 'कधीही एकाच टाकीत किंवा पंपात एकत्र मिसळू नका. कॅल्शियम आणि सल्फेट खतांची फवारणी स्वतंत्रपणे करावी.',
      hi: 'कभी भी एक ही पंप में साथ न मिलाएं। दोनों खादों का छिड़काव अलग-अलग करें।',
      en: 'Never combine in the same spray tank. Apply calcium and sulfate fertilizers in separate applications or isolated stock tanks.',
    },
    verificationStatus: 'statutory_incompatibility',
  },

  // 7. Calcium Nitrate + 19:19:19 (INCOMPATIBLE - Calcium Phosphate Precipitation)
  {
    id: 'rule-calcium-191919',
    chemicalAId: 'calcium-nitrate',
    chemicalBId: 'npk-19-19-19-wsf',
    status: 'incompatible',
    primaryRisk: 'precipitation_curdling',
    headline: {
      mr: 'असंगत! फॉस्फेट व कॅल्शियमचे अद्रव्य खडे (Calcium Phosphate) तयार होतात',
      hi: 'असंगत! कैल्शियम फास्फेट का अघुलनशील अवक्षेप बन जाएगा',
      en: 'Incompatible - Insoluble Calcium Phosphate Precipitation',
    },
    explanation: {
      mr: '१९:१९:१९ मधील विद्राव्य फॉस्फेट (HPO₄²⁻ / H₂PO₄⁻) कॅल्शियम आयन्सशी (Ca²⁺) संयोग पावून ट्राय-कॅल्शियम किंवा डाय-कॅल्शियम फॉस्फेटचा जाड पांढरा साका बनवतो. रासायनिक विद्राव्यता नियमांनुसार कॅल्शियम व फॉस्फेट एकत्र विरघळत नाहीत आणि पंपात गाळ साचतो.',
      hi: '19:19:19 का फास्फोरस कैल्शियम के साथ मिलकर अघुलनशील कैल्शियम फास्फेट बनाता है, जिससे पंप में गाढ़ा तलछट बैठ जाता है।',
      en: 'Orthophosphates in 19:19:19 react spontaneously with ionic calcium to precipitate insoluble dicalcium/tricalcium phosphate sludge due to low solubility products (Ksp). Agronomic protocols strictly prohibit mixing calcium sources with water-soluble phosphate fertilizers.',
    },
    sourceAuthority: 'ICAR-Indian Institute of Soil Science (IISS), Bhopal & Agricultural University Fertigation Protocols',
    documentTitle: 'Water Soluble Fertilizers & Foliar Nutrition: Ionic Incompatibilities in Tank Solutions',
    issuingAuthority: 'ICAR-Indian Institute of Soil Science (IISS), Bhopal',
    publicationDate: 'ICAR-IISS Agronomy Bulletins',
    sectionOrPage: 'Chemical Compatibility of Divalent Cations with Orthophosphates',
    evidenceType: 'incompatibility_science',
    applicableConditions: {
      mr: 'कॅल्शियम नायट्रेटसोबत फॉस्फरसयुक्त खते कधीही एकत्र मिसळू नका. स्वतंत्र फवारणी करावी.',
      hi: 'कैल्शियम के साथ फास्फोरस युक्त खाद कभी न मिलाएं। अलग-अलग छिड़काव करें।',
      en: 'Never blend ionic calcium with water-soluble phosphate fertilizers. Apply as separate sprays.',
    },
    verificationStatus: 'statutory_incompatibility',
  },

  // 8. Calcium Nitrate + 12:61:00 (INCOMPATIBLE - Severe Phosphate Inactivation)
  {
    id: 'rule-calcium-map',
    chemicalAId: 'calcium-nitrate',
    chemicalBId: 'map-12-61-00-wsf',
    status: 'incompatible',
    primaryRisk: 'precipitation_curdling',
    headline: {
      mr: 'असंगत! तीव्र साका तयार होईल (Precipitation)',
      hi: 'असंगत! भारी अवक्षेप बन जाएगा',
      en: 'Incompatible - Severe Phosphate Inactivation',
    },
    explanation: {
      mr: '१२:६१:०० मध्ये ६१% फॉस्फरस असतो. तो कॅल्शियमसोबत संपर्कात येताच पांढरा खडू तयार होतो.',
      hi: '12:61:00 में 61% फास्फोरस होता है जो कैल्शियम के साथ मिलकर तुरंत चॉक जैसा अवक्षेप बनाता है।',
      en: 'Extremely high phosphate concentration (61%) precipitates completely when combined with ionic calcium.',
    },
    sourceAuthority: 'ICAR-Indian Institute of Soil Science (IISS), Bhopal & Fertigation Chemistry Handbooks',
    documentTitle: 'High-Phosphate Fertilizer Chemistry: Monoammonium Phosphate (MAP) Interaction with Divalent Cations',
    issuingAuthority: 'ICAR-Indian Institute of Soil Science (IISS), Bhopal',
    publicationDate: 'ICAR Technical Manual on Plant Nutrition',
    sectionOrPage: 'Section: Precipitation Thresholds of MAP (12:61:00) with Calcium Nitrate',
    evidenceType: 'incompatibility_science',
    applicableConditions: {
      mr: 'दोन्ही खते स्वतंत्र फवारा.',
      hi: 'दोनों खादों का अलग-अलग छिड़काव करें।',
      en: 'Apply separately.',
    },
    verificationStatus: 'statutory_incompatibility',
  },

  // 9. Emamectin Benzoate + 19:19:19 (CAUTION - Field Practice Jar Test Required)
  {
    id: 'rule-emamectin-191919',
    chemicalAId: 'emamectin-5-sg',
    chemicalBId: 'npk-19-19-19-wsf',
    status: 'caution_jar_test',
    primaryRisk: 'none',
    headline: {
      mr: 'सावधान: प्रचलित शेतकरी पद्धत - आधी जार चाचणी आवश्यक (Caution)',
      hi: 'सावधानी: प्रचलित प्रथा - पहले जार टेस्ट जरूरी (Caution)',
      en: 'Caution - Field Practice Requires Jar Test Prior to Tank Mix',
    },
    explanation: {
      mr: 'विदर्भातील शेतकरी बोंडअळी नियंत्रण आणि पिकाला अन्न देण्यासाठी हे मिश्रण वापरतात. तथापि, हे अधिकृत CIBRC नोंदणीकृत मिश्रण नसून केवळ शेतातील पद्धत आहे. खताच्या उच्च लवणतेमुळे (EC) पाण्याचा सामू बदलल्यास कीटकनाशकाची परिणामकारकता मंदावू शकते. विहिरीचे पाणी खारे असल्यास आधी १ लिटर बाटलीत जार टेस्ट करा.',
      hi: 'फील्ड में यह मिश्रण प्रचलित है परंतु यह कोई पंजीकृत प्रीमिक्स नहीं है। पानी के खारेपन के अनुसार जार टेस्ट अवश्य करें।',
      en: 'Commonly field-mixed in Vidarbha for simultaneous pest and nutritional management. Note: This is an unverified field practice, NOT a registered CIBRC premix. High EC salts can alter spray water pH. A 1-liter physical jar test is required before full tank preparation.',
    },
    sourceAuthority: 'State Agriculture Extension Field Reports & Dr. PDKV Agronomy Field Studies',
    documentTitle: 'Field Evaluation of Foliar Nutrition and Insecticide Tank-Mixes in Rainfed Cotton',
    issuingAuthority: 'Dr. PDKV Akola Agricultural Extension Bulletins',
    publicationDate: 'Field Extension Notes 2022',
    sectionOrPage: 'Farmer Practice Field Reports: Monitoring Solution EC and pH',
    evidenceType: 'conditional_field_practice',
    applicableConditions: {
      mr: 'प्रथम १९:१९:१९ पाण्यात पूर्ण विरघळवा, त्यानंतर इमामेक्टिनचे द्रावण मिसळा. फवारणी त्वरित करावी, द्रावण तासनतास पंपात ठेवू नका.',
      hi: 'पहले खाद को पूरी तरह घोलें, उसके बाद कीटनाशक मिलाएं। घोल को तुरंत छिड़काव करें।',
      en: 'Dissolve 19:19:19 completely in water before introducing pre-mixed Emamectin. Spray immediately without prolonged storage.',
    },
    verificationStatus: 'unverified_field_practice',
  },

  // 10. Flonicamid 50% WG + 00:00:50 (CAUTION - Formulation Jar Test)
  {
    id: 'rule-flonicamid-sop',
    chemicalAId: 'flonicamid-50-wg',
    chemicalBId: 'sop-00-00-50',
    status: 'caution_jar_test',
    primaryRisk: 'none',
    headline: {
      mr: 'सावधान: जार चाचणीनंतरच फवारा (Caution)',
      hi: 'सावधानी: जार परीक्षण के बाद ही उपयोग करें',
      en: 'Caution - Perform Jar Test Prior to Application',
    },
    explanation: {
      mr: 'पांढरी माशी नियंत्रणासाठी फ्लोनिकॅमिड आणि बोंडांच्या धाग्याची प्रत सुधारण्यासाठी ००:००:५० एकत्र वापरले जाते. डब्ल्यूडीजी (दाणेदार) औषध आणि खताचे विद्राव्य गुणधर्म यामुळे द्रावणात गाठी होणार नाहीत याची खात्री करणे आवश्यक आहे.',
      hi: 'सफेद मक्खी नियंत्रण और पोटाश पोषण का संयोजन। डब्ल्यूडीजी दानों को पहले अलग बाल्टी में घोलें।',
      en: 'Flonicamid WG requires thorough dispersion before high-potassium sulfate addition. Confirm complete dissolution without granular sedimentation via a jar test.',
    },
    sourceAuthority: 'Dr. PDKV Extension Advisory on Sucking Pest Management',
    documentTitle: 'Management of Sucking Pests and Boll Nutrition in Bt Cotton',
    issuingAuthority: 'Dr. PDKV Akola & State Agriculture Department Extension Advisory',
    publicationDate: 'Advisory Bulletin 2023',
    sectionOrPage: 'Foliar Potassium Applications and Sucking Pest Insecticides',
    evidenceType: 'conditional_field_practice',
    applicableConditions: {
      mr: 'फ्लोनिकॅमिड दाणे प्रथम कोमट किंवा स्वच्छ पाण्यात स्वतंत्रपणे घोळा, त्यानंतरच ००:००:५० द्रावणात मिसळा.',
      hi: 'फ्लोनिकैमिड को पहले अलग से घोलें।',
      en: 'Pre-slurry Flonicamid granules in a bucket of clean water before blending into the spray mixture.',
    },
    verificationStatus: 'unverified_field_practice',
  },

  // 11. Azoxystrobin + Difenoconazole SC + Silicon Spreader (VERIFIED COMPATIBLE)
  {
    id: 'rule-azoxy-spreader',
    chemicalAId: 'azoxy-difen-sc',
    chemicalBId: 'silicon-spreader',
    status: 'verified_compatible',
    primaryRisk: 'none',
    headline: {
      mr: 'सुसंगत - उत्कृष्ट परिणाम (Compatible with Spreader)',
      hi: 'अनुकूल - उत्कृष्ट फैलाव (Compatible)',
      en: 'Verified Compatible - Enhanced Foliar Spread',
    },
    explanation: {
      mr: 'अँमिस्टार टॉप सारख्या एससी (SC) बुरशीनाशकासोबत नॉन-आयनिक सिलिकॉन स्प्रेडर मिसळल्यास औषधाचे थेंब पानांवर समप्रमाणात पसरतात आणि पावसाने औषध धुतले जाण्याचा धोका कमी होतो.',
      hi: 'एससी फफूंदनाशी के साथ सिलिकॉन स्टीकर मिलाने से दवा पत्तियों पर बेहतर चिपकती है और बारिश से सुरक्षित रहती है।',
      en: 'Formulation labels officially endorse non-ionic organosilicone surfactants to optimize droplet spread and rain-fastness without destabilizing the suspension.',
    },
    sourceAuthority: 'Approved Product Label & CIBRC Registration Information (Reg. No. CIR-65,710/2010)',
    documentTitle: 'CIBRC Approved Product Label Leaflet for Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
    issuingAuthority: 'Central Insecticides Board & Registration Committee (CIBRC), Ministry of Agriculture, GoI',
    publicationDate: 'Registration CIR-65,710/2010',
    sectionOrPage: 'Directions for Use: Surfactant / Adjuvant Compatibility on Waxy Foliage',
    evidenceType: 'statutory_label_leaflet',
    applicableConditions: {
      mr: 'प्रमाण: सिलिकॉन स्प्रेडर ५ मिली प्रति १५ लिटर पंप. सर्व औषधे मिसळून शेवटी स्प्रेडर टाकावा.',
      hi: 'मात्रा: 5 मिली प्रति 15 लीटर पंप। स्टीकर को सबसे अंत में मिलाएं।',
      en: 'Dosage: 5ml per 15-liter knapsack sprayer. Always add the non-ionic adjuvant last in the tank sequence.',
    },
    verificationStatus: 'verified_university_label',
  },
];

/**
 * Universal W.A.L.E.S. Sequence Engine
 * Follows formal agrochemical engineering guidelines:
 * W = Wettable powders / Granules (WP, WDG, SG)
 * A = Agitate thoroughly
 * L = Liquid flowables & Suspensions (SC)
 * E = Emulsifiable Concentrates (EC)
 * S = Soluble fertilizers (WSF, SP) & Surfactants/Stickers (ADJ)
 */
export function generateWalesSequence(chemicals: ChemicalItem[]): WalesMixingStep[] {
  const steps: WalesMixingStep[] = [
    {
      stepNumber: 1,
      walesCategory: 'Water',
      title: {
        mr: 'पाणी भरणे (५०% क्षमता)',
        hi: 'पानी भरना (50% क्षमता)',
        en: 'Fill Clean Water (50% Volume)',
      },
      instruction: {
        mr: 'फवारणी पंपात किंवा ड्रममध्ये प्रथम अर्धे (५०%) स्वच्छ, गाळ नसलेले पाणी भरा. कधीही रिकाम्या पंपात थेट औषधे ओतू नका.',
        hi: 'स्प्रे पंप या ड्रम में पहले 50% साफ पानी भरें। कभी भी खाली पंप में सीधी दवा न डालें।',
        en: 'Fill spray tank to half (50%) volume with clean, debris-free water. Never introduce concentrated chemicals into an empty tank.',
      },
      chemicalNames: ['स्वच्छ पाणी (Clean Water)'],
    },
  ];

  // Group chemicals by WALES categories
  const wGroup = chemicals.filter((c) => ['WP', 'WDG', 'SG'].includes(c.formulation));
  const lGroup = chemicals.filter((c) => ['SC'].includes(c.formulation));
  const eGroup = chemicals.filter((c) => ['EC'].includes(c.formulation));
  const sGroup = chemicals.filter((c) => ['WSF', 'SP', 'SL', 'BIO', 'ADJ'].includes(c.formulation));

  let currentStep = 2;

  // W Step
  if (wGroup.length > 0) {
    steps.push({
      stepNumber: currentStep++,
      walesCategory: 'W',
      title: {
        mr: '[W] पावडर व दाणेदार औषधे (WP / WDG / SG)',
        hi: '[W] घुलनशील पाउडर एवं दानेदार (WP / WDG / SG)',
        en: '[W] Wettable Powders & Granules (WP / WDG / SG)',
      },
      instruction: {
        mr: 'या औषधांची स्वतंत्र बादलीत थोड्या पाण्यासोबत पातळ पेस्ट तयार करा (Pre-slurry), मगच पंपात ओतून ढवळा.',
        hi: 'इन्हें पहले एक बाल्टी में थोड़े पानी के साथ घोलकर पेस्ट बनाएं, फिर पंप में डालें।',
        en: 'Pre-mix into a smooth slurry with a small volume of water in a bucket before pouring into the main tank.',
      },
      chemicalNames: wGroup.map((c) => `${c.name} (${c.formulation})`),
    });
  }

  // A Step (Always Agitate)
  steps.push({
    stepNumber: currentStep++,
    walesCategory: 'A',
    title: {
      mr: '[A] पाणी चांगले ढवळणे (Agitation)',
      hi: '[A] घोल को अच्छी तरह हिलाएं (Agitation)',
      en: '[A] Thorough Agitation',
    },
    instruction: {
      mr: 'काठीने किंवा पंप सुरू करून पाणी २ मिनिटे चांगले ढवळा जेणेकरून पावडर पूर्णपणे विरघळेल व तळाशी साचणार नाही.',
      hi: 'घोल को 2 मिनट तक अच्छी तरह हिलाएं ताकि दवा तली में न बैठे।',
      en: 'Agitate thoroughly for 2 minutes to ensure complete dispersion prior to liquid introduction.',
    },
    chemicalNames: ['ढवळणे (Continuous Agitation)'],
  });

  // L Step
  if (lGroup.length > 0) {
    steps.push({
      stepNumber: currentStep++,
      walesCategory: 'L',
      title: {
        mr: '[L] प्रवाही सस्पेन्शन औषधे (SC / Flowables)',
        hi: '[L] सस्पेंशन तरल दवाएं (SC / Flowables)',
        en: '[L] Liquid Flowables & Suspensions (SC)',
      },
      instruction: {
        mr: 'बाटली चांगली हलवून औषध हळूहळू ढवळत असलेल्या पंपात मिसळा.',
        hi: 'बोतल को अच्छी तरह हिलाकर बहते घोल में मिलाएं।',
        en: 'Shake container well and pour gradually while agitation continues.',
      },
      chemicalNames: lGroup.map((c) => `${c.name} (${c.formulation})`),
    });
  }

  // E Step
  if (eGroup.length > 0) {
    steps.push({
      stepNumber: currentStep++,
      walesCategory: 'E',
      title: {
        mr: '[E] तेलयुक्त इमल्शन औषधे (EC Formulations)',
        hi: '[E] तेल युक्त इमल्शन दवाएं (EC)',
        en: '[E] Emulsifiable Concentrates (EC)',
      },
      instruction: {
        mr: 'ईसी (EC) औषध शेवटी हळूहळू मिसळा. पाण्याचा रंग दुधासारखा पांढरा झाला पाहिजे. तेल वेगळे तरंगू नये.',
        hi: 'EC दवा धीरे-धीरे मिलाएं। घोल दूध जैसा सफेद होना चाहिए, तेल ऊपर नहीं तैरना चाहिए।',
        en: 'Introduce EC formulations slowly. A uniform milky white emulsion should form without oily surface separation.',
      },
      chemicalNames: eGroup.map((c) => `${c.name} (${c.formulation})`),
    });
  }

  // S Step (WSF, SP, Adjuvants)
  if (sGroup.length > 0) {
    steps.push({
      stepNumber: currentStep++,
      walesCategory: 'S',
      title: {
        mr: '[S] विद्राव्य खते व स्टिकर/स्प्रेडर (WSF / SP / Adjuvant)',
        hi: '[S] घुलनशील खाद एवं स्टीकर (WSF / SP / Adjuvant)',
        en: '[S] Soluble Fertilizers & Adjuvants (WSF / SP / Adjuvant)',
      },
      instruction: {
        mr: 'विद्राव्य खते (१९:१९:१९ इ.) व स्टिकर नेहमी सर्वात शेवटी मिसळावेत. त्यानंतर पंपात पूर्ण पाणी भरून ताबडतोब फवारणी करावी.',
        hi: 'घुलनशील खाद (19:19:19 आदि) और स्टीकर हमेशा सबसे अंत में मिलाएं। फिर पूरा पानी भरकर तुरंत छिड़काव करें।',
        en: 'Dissolve water-soluble fertilizers and add non-ionic spreaders/stickers last. Top off tank with water and spray promptly.',
      },
      chemicalNames: sGroup.map((c) => `${c.name} (${c.formulation})`),
    });
  }

  return steps;
}

/**
 * Evaluates Tank-Mix Compatibility with strict safety constraints.
 * Enforces:
 * 1. Specific registered compatibility lookup.
 * 2. Hard incompatibility flag for known chemical hazards.
 * 3. Mandatory caution for multi-product mixtures (3+ items).
 * 4. Safety fallback: "Compatibility Not Verified" for all unlisted pairs.
 */
export function evaluateTankMix(selectedChemicalIds: string[]): TankMixEvaluationResult {
  // Filter unique valid chemicals
  const uniqueIds = Array.from(new Set(selectedChemicalIds));
  const selectedChemicals = uniqueIds
    .map((id) => VIDARBHA_CHEMICAL_REGISTRY.find((c) => c.id === id))
    .filter((c): c is ChemicalItem => c !== undefined);

  // Default Disclaimers with explicit 5-Dimension Compatibility framework
  const disclaimer = {
    mr: 'कायदेशीर व तांत्रिक सूचना: हा टँक-मिक्स कॅल्क्युलेटर केवळ कृषी निर्णय-मदत साधन आहे. कृषी रसायन सुसंगततेचे ५ वेगळे पैलू आहेत: (१) भौतिक सुसंगतता (Physical - जार चाचणीत विरघळणे/गाठी न होणे), (२) रासायनिक स्थिरता (Chemical - घटकांचे विघटन किंवा अल्कलाईन हायड्रोलिसिस न होणे), (३) पीक सुरक्षितता (Crop Safety - पानांवर करपा न येणे), (४) जैविक परिणामकारकता (Biological Efficacy - कीड-रोग नियंत्रण टिकणे), आणि (५) वैधानिक नोंदणी (Regulatory Approval - CIBRC लेबल नोंदणी). जार चाचणी केवळ भौतिक सुसंगतता तपासते. कोणत्याही फवारणीपूर्वी उत्पादनाच्या मूळ लेबल सूचनांचे पालन करा आणि स्थानिक कृषी विज्ञान केंद्र (KVK) च्या शास्त्रज्ञांशी खात्री करा.',
    hi: 'वैधानिक एवं तकनीकी सूचना: यह कैलकुलेटर केवल कृषि मार्गदर्शन हेतु है। कृषि रसायन अनुकूलता के 5 भिन्न आयाम हैं: (1) भौतिक अनुकूलता (घुलनशीलता/थक्का न बनना), (2) रासायनिक स्थिरता (घटकों का विघटन न होना), (3) फसल सुरक्षा (पत्तियों पर झुलसा न आना), (4) जैविक प्रभावशीलता (कीट-रोग नियंत्रण), एवं (5) वैधानिक अनुमोदन (CIBRC लेबल पंजीकरण)। जार टेस्ट केवल भौतिक अनुकूलता प्रमाणित करता है। छिड़काव से पहले उत्पाद के आधिकारिक लेबल निर्देश पढ़ें और KVK से परामर्श करें।',
    en: 'Statutory & Agronomic Disclaimer: This calculator serves as an informational decision-support aid. Agricultural compatibility encompasses 5 distinct dimensions: (1) Physical Compatibility (homogeneity in jar test), (2) Chemical Stability (absence of active ingredient degradation), (3) Crop Safety (prevention of foliar phytotoxicity), (4) Biological Efficacy (retained pest/disease control), and (5) Regulatory Approval (CIBRC label registration). Physical jar testing confirms only physical compatibility. Strictly adhere to registered product label instructions and consult a local Krishi Vigyan Kendra (KVK) specialist before field mixing.',
  };

  const labelPrecedenceNotice = {
    mr: 'लेबल प्राधान्य नियम: W.A.L.E.S. हा केवळ सर्वसाधारण तांत्रिक क्रम आहे. जर विशिष्ट उत्पादनाच्या बाटलीवरील लेबलवर वेगळा क्रम दिला असल्यास, नेहमी बाटलीवरील अधिकृत लेबल सूचनांनाच सर्वोच्च प्राधान्य द्या.',
    hi: 'लेबल वरीयता नियम: W.A.L.E.S. केवल एक सामान्य तकनीकी क्रम है। यदि उत्पाद के लेबल पर अलग क्रम दिया गया है, तो उत्पाद के लेबल के निर्देशों को ही सर्वोच्च प्राथमिकता दें।',
    en: 'Label Precedence Rule: W.A.L.E.S. is general formulation-dependent guidance. Whenever a specific manufacturer product label specifies an alternative order, the product label ALWAYS takes absolute precedence.',
  };

  const waterQualityNotice = {
    mr: 'विदर्भ पाणी गुणवत्ता सल्ला: विदर्भातील (विशेषतः पूर्णा नदीच्या खाऱ्या पट्ट्यातील - अकोला, अमरावती, बुलढाणा) बोअरवेलचे पाणी अनेकदा अल्कलाईन (pH > 8.0) आणि क्षारयुक्त असते. जास्त अल्कलाईन पाण्यामुळे ऑर्गनोफॉस्फेट व इतर काही कीटकनाशकांचे वेगाने रासायनिक विघटन (Alkaline Hydrolysis) होते. मात्र, पाण्याचा योग्य सामू (pH) हा प्रत्येक उत्पादनाच्या रासायनिक घटकानुसार ठरतो (उदा. कॉपरची औषधे अल्कलाईन असतात व त्यांना आम्लयुक्त करू नये). पाण्याचा सामू बदलण्यापूर्वी नेहमी संबंधित उत्पादनाच्या लेबल सूचना वाचा.',
    hi: 'विदर्भ जल गुणवत्ता परामर्श: विदर्भ (विशेषतः पूर्णा नदी घाटी) के बोरवेल जल में क्षारीयता (pH > 8.0) व खारापन अधिक हो सकता है। अधिक क्षारीय पानी से ऑर्गनोफॉस्फेट जैसे कीटनाशक तेजी से निष्प्रभावी हो सकते हैं। ध्यान दें कि सही pH प्रत्येक दवा के प्रकार पर निर्भर करता है (जैसे कॉपर युक्त दवाओं को अम्लीय नहीं करना चाहिए)। कोई भी बफर मिलाने से पहले उत्पाद लेबल निर्देश अवश्य पढ़ें।',
    en: 'Vidarbha Water Quality Advisory: Borewell water in parts of Vidarbha (notably the Purna valley saline tract) frequently registers high alkalinity (pH > 8.0) and hardness, accelerating alkaline hydrolysis of organophosphate and carbamate insecticides. However, optimal water pH is product-specific: while sensitive insecticides require slightly acidic to neutral water, copper formulations are naturally alkaline and must never be acidified. Always consult the specific product label before altering spray water pH.',
  };

  const defaultSafetyCautions = {
    mr: [
      'फवारणी करताना नाका-तोंडावर मास्क, डोळ्यांवर चष्मा आणि हातमोजे वापरा.',
      'कडक उन्हात (दुपारी १२ ते ३) फवारणी टाळा; सकाळी किंवा संध्याकाळी फवारणी करा.',
      'द्रावण तयार केल्यावर शक्य तितक्या लवकर (शक्यतो २ तासांच्या आत) फवारणी पूर्ण करा; द्रावण रात्रभर पंपात साठवून ठेवू नका.',
      'पाण्याचा सामू (pH) उत्पादनाच्या लेबल शिफारशीनुसार तपासा; अल्कलाईन पाण्यामुळे संवेदनशील कीटकनाशके निकामी होऊ शकतात.',
    ],
    hi: [
      'छिड़काव करते समय मास्क, चश्मा और दस्ताने अवश्य पहनें।',
      'दोपहर की तेज धूप में छिड़काव से बचें; सुबह या शाम के समय छिड़काव करें।',
      'घोल तैयार होने के 2 घंटे के भीतर छिड़काव समाप्त करें; रात भर घोल को पंप में न छोड़ें।',
      'पानी का pH उत्पाद के लेबल निर्देशों के अनुसार रखें; अधिक क्षारीय पानी से कीटनाशक प्रभावित हो सकते हैं।',
    ],
    en: [
      'Wear approved personal protective equipment (mask, goggles, chemical-resistant gloves).',
      'Avoid high-temperature midday spraying (12:00 PM – 3:00 PM); spray in the morning or late evening.',
      'Apply prepared tank mix promptly after preparation; do not store mixed spray solutions overnight.',
      'Verify spray water pH according to product-label instructions; highly alkaline water degrades sensitive insecticides.',
    ],
  };

  if (selectedChemicals.length < 2) {
    return {
      selectedChemicals,
      overallStatus: 'unverified',
      statusHeadline: {
        mr: 'किमान २ औषधे किंवा खते निवडा',
        hi: 'कम से कम 2 उत्पाद चुनें',
        en: 'Select at least 2 products to evaluate',
      },
      detailedExplanation: {
        mr: 'टँक-मिक्स सुसंगतता तपासण्यासाठी वरील यादीतून किमान २ औषधे निवडा.',
        hi: 'टैंक-मिक्स अनुकूलता जांचने के लिए कम से कम 2 उत्पाद चुनें।',
        en: 'Choose at least 2 agricultural chemicals or fertilizers to evaluate compatibility.',
      },
      isMultiProductCaution: false,
      mixingOrder: generateWalesSequence(selectedChemicals),
      rulesTriggered: [],
      jarTestMandatory: false,
      labelPrecedenceNotice,
      waterQualityNotice,
      safetyCautions: defaultSafetyCautions,
      disclaimer,
    };
  }

  // Cross-evaluate all pairs
  const triggeredRules: VerifiedCompatibilityRule[] = [];
  let hasIncompatible = false;
  let hasCaution = false;
  let hasVerifiedCompatible = false;
  let primaryRisk: string | undefined = undefined;

  for (let i = 0; i < selectedChemicals.length; i++) {
    for (let j = i + 1; j < selectedChemicals.length; j++) {
      const chemA = selectedChemicals[i].id;
      const chemB = selectedChemicals[j].id;

      const rule = VERIFIED_COMPATIBILITY_RULES.find(
        (r) =>
          (r.chemicalAId === chemA && r.chemicalBId === chemB) ||
          (r.chemicalAId === chemB && r.chemicalBId === chemA)
      );

      if (rule) {
        triggeredRules.push(rule);
        if (rule.status === 'incompatible') {
          hasIncompatible = true;
          if (rule.primaryRisk) primaryRisk = rule.primaryRisk;
        } else if (rule.status === 'caution_jar_test') {
          hasCaution = true;
        } else if (rule.status === 'verified_compatible') {
          hasVerifiedCompatible = true;
        }
      }
    }
  }

  const isMultiProduct = selectedChemicals.length >= 3;
  let overallStatus: CompatibilityStatus = 'unverified';

  // Strict Evaluation Decision Tree
  if (hasIncompatible) {
    overallStatus = 'incompatible';
  } else if (isMultiProduct) {
    // 3 or more products mixed together can NEVER be automatically green
    overallStatus = 'caution_jar_test';
  } else if (triggeredRules.length === 1 && hasVerifiedCompatible) {
    overallStatus = 'verified_compatible';
  } else if (hasCaution) {
    overallStatus = 'caution_jar_test';
  } else {
    // Unknown or unlisted pair: strictly unverified safety fallback
    overallStatus = 'unverified';
  }

  // Build Headlines and Explanations
  const statusHeadline = {
    verified_compatible: {
      mr: 'सुसंगत व प्रमाणित मिश्रण (Verified Compatible)',
      hi: 'प्रमाणित व सुरक्षित मिश्रण (Verified Compatible)',
      en: 'Verified Compatible & University Approved',
    },
    incompatible: {
      mr: 'धोकादायक! एकत्र मिसळू नका (Hazardous / Incompatible)',
      hi: 'असंगत! एक साथ न मिलाएं (Incompatible)',
      en: 'Incompatible - Hazardous Tank Mixture',
    },
    caution_jar_test: {
      mr: isMultiProduct
        ? 'सावधान: ३ किंवा अधिक उत्पादने - जार चाचणी सक्तीची (Multi-Mix Caution)'
        : 'काळजीपूर्वक वापरा - आधी जार चाचणी करा (Caution / Jar Test)',
      hi: isMultiProduct
        ? 'सावधानी: 3 या अधिक उत्पाद - जार टेस्ट अनिवार्य (Multi-Mix Caution)'
        : 'सावधानीपूर्वक प्रयोग - पहले जार टेस्ट करें (Caution)',
      en: isMultiProduct
        ? 'Multi-Product Mixture Caution - Jar Test Mandatory'
        : 'Caution - Physical Jar Test Required',
    },
    unverified: {
      mr: 'सुसंगतता असत्यापित (Compatibility Not Verified)',
      hi: 'अनुकूलता असत्यापित (Compatibility Not Verified)',
      en: 'Compatibility Not Verified',
    },
  }[overallStatus];

  let detailedExplanation = {
    mr: '',
    hi: '',
    en: '',
  };

  if (overallStatus === 'incompatible') {
    const firstIncompatRule = triggeredRules.find((r) => r.status === 'incompatible');
    detailedExplanation = firstIncompatRule?.explanation || {
      mr: 'या औषधांमध्ये रासायनिक किंवा भौतिक विसंगती असून एकत्र मिसळल्यास औषध निकामी होते किंवा पिकावर करपा येऊ शकतो.',
      hi: 'इस मिश्रण में रासायनिक असंगतता है, जिससे दवा निष्प्रभावी हो सकती है।',
      en: 'A known chemical or physical incompatibility exists between these products, risking neutralization or phytotoxicity.',
    };
  } else if (isMultiProduct) {
    detailedExplanation = {
      mr: `तुम्ही ३ किंवा त्यापेक्षा जास्त उत्पादने निवडली आहेत (${selectedChemicals.map((c) => c.name).join(' + ')}). कृषी विद्यापीठे ३ पेक्षा जास्त रासायनिक उत्पादने एकत्र मिसळण्याची शिफारस करत नाहीत, कारण पाण्याचा सामू व रसायनांचे एकमेकांवरील परिणाम अनपेक्षित असू शकतात. फवारणीपूर्वी १ लिटर काचेच्या भांड्यात १५ मिनिटांची जार टेस्ट करणे आणि २ झाडांवर चाचणी घेणे बंधनकारक आहे.`,
      hi: `आपने 3 या अधिक उत्पाद चुने हैं। 3 से अधिक रसायनों को एक साथ मिलाने की सिफारिश विश्वविद्यालय नहीं करते। 1 लीटर पानी में 15 मिनट की जार जांच अनिवार्य रूप से करें।`,
      en: `You have selected 3 or more products (${selectedChemicals.map((c) => c.name).join(' + ')}). Multi-product chemical cocktails have complex interactions not validated by standard university trials. A 1-liter physical jar test and small micro-plot trial on 2 plants are strictly mandatory before broadacre spraying.`,
    };
  } else if (overallStatus === 'verified_compatible') {
    detailedExplanation = triggeredRules[0]?.explanation || {
      mr: 'हे मिश्रण अधिकृत कृषी विद्यापीठ शिफारशीनुसार सुसंगत व सुरक्षित आहे.',
      hi: 'यह मिश्रण कृषि विश्वविद्यालय की सिफारिश अनुसार प्रमाणित एवं सुरक्षित है।',
      en: 'This mixture is supported by agricultural university and research publications.',
    };
  } else {
    // Unverified pair
    detailedExplanation = {
      mr: `या विशिष्ट जोडीसाठी (${selectedChemicals[0].name} + ${selectedChemicals[1].name}) अधिकृत कृषी विद्यापीठ किंवा CIBRC द्वारे प्रमाणित टँक-मिक्स शिफारस उपलब्ध नाही. औषध कंपन्या स्वतंत्र उत्पादनांची हमी देतात, अनधिकृत मिश्रणाची नाही. फवारणीपूर्वी उत्पादनाच्या बाटलीवरील लेबल वाचा आणि आधी १ लिटर पाण्यात जार टेस्ट करा.`,
      hi: `इस संयोजन (${selectedChemicals[0].name} + ${selectedChemicals[1].name}) के लिए विश्वविद्यालय का प्रमाणित रिकॉर्ड उपलब्ध नहीं है। लेबल पढ़ें और जार टेस्ट करें।`,
      en: `No peer-reviewed university or CIBRC label-clearance record is cataloged for this specific combination (${selectedChemicals[0].name} + ${selectedChemicals[1].name}). Product manufacturers guarantee single-active performance, not ad-hoc field mixes. Inspect both product labels and execute a 1-liter jar test prior to field application.`,
    };
  }

  return {
    selectedChemicals,
    overallStatus,
    statusHeadline,
    detailedExplanation,
    highestRisk: primaryRisk,
    isMultiProductCaution: isMultiProduct,
    mixingOrder: generateWalesSequence(selectedChemicals),
    rulesTriggered: triggeredRules,
    jarTestMandatory: overallStatus !== 'verified_compatible',
    labelPrecedenceNotice,
    waterQualityNotice,
    safetyCautions: defaultSafetyCautions,
    disclaimer,
  };
}
