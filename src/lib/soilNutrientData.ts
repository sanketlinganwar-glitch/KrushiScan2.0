/**
 * KrushiScan AI - Verified Soil Health Card & Fertilizer Calculator Library
 * 
 * Sourced strictly from:
 * 1. Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV), Akola - "Krushi Dainandini" & "Kharif/Rabi Crops Package of Practices"
 * 2. Indian Institute of Soil Science (ICAR-IISS), Bhopal - Soil Test Based Fertilizer Recommendations (STCR)
 * 3. Soil Health Card Scheme Guidelines, Department of Agriculture & Farmers Welfare, Govt. of India
 */

export interface SoilRatingBenchmark {
  lowMax: number;
  mediumMax: number;
  unit: string;
}

export const SOIL_BENCHMARKS: Record<string, SoilRatingBenchmark> = {
  organicCarbon: { lowMax: 0.50, mediumMax: 0.75, unit: '%' },
  nitrogen: { lowMax: 280, mediumMax: 560, unit: 'kg/ha' },
  phosphorus: { lowMax: 14, mediumMax: 28, unit: 'kg/ha' },
  potassium: { lowMax: 150, mediumMax: 300, unit: 'kg/ha' },
  zinc: { lowMax: 0.60, mediumMax: 1.20, unit: 'ppm (mg/kg)' },
  sulfur: { lowMax: 10.0, mediumMax: 20.0, unit: 'ppm (mg/kg)' },
  iron: { lowMax: 4.50, mediumMax: 9.00, unit: 'ppm (mg/kg)' },
};

export type NutrientRating = 'Low' | 'Medium' | 'High';

export function classifyNutrient(param: keyof typeof SOIL_BENCHMARKS, value: number): NutrientRating {
  const bench = SOIL_BENCHMARKS[param];
  if (!bench) return 'Medium';
  if (value < bench.lowMax) return 'Low';
  if (value <= bench.mediumMax) return 'Medium';
  return 'High';
}

export function classifyPh(ph: number): {
  rating: 'Acidic' | 'Neutral' | 'Moderately_Alkaline' | 'Strongly_Alkaline';
  headline: { mr: string; hi: string; en: string };
  advisory: { mr: string; hi: string; en: string };
} {
  if (ph < 6.5) {
    return {
      rating: 'Acidic',
      headline: { mr: 'सामू कमी (अम्लयुक्त जमीन - Acidic)', hi: 'अम्लीय मिट्टी', en: 'Acidic Soil (pH < 6.5)' },
      advisory: {
        mr: 'माती आम्लयुक्त आहे. स्फुरद व सूक्ष्मद्रव्यांची उपलब्धता वाढवण्यासाठी कृषी चुनखडीचा (Agricultural Lime) वापर करावा.',
        hi: 'मिट्टी अम्लीय है। चूने का प्रयोग करें।',
        en: 'Soil is acidic. Apply agricultural limestone to optimize phosphorus and micronutrient availability.',
      },
    };
  }
  if (ph <= 7.5) {
    return {
      rating: 'Neutral',
      headline: { mr: 'सामू उत्तम (तटस्थ जमीन - Ideal Neutral)', hi: 'तटस्थ एवं आदर्श मिट्टी', en: 'Ideal Neutral Soil (pH 6.5 - 7.5)' },
      advisory: {
        mr: 'मातीचा सामू सर्व प्रकारच्या पिकांसाठी व अन्नद्रव्यांच्या उपलब्धतेसाठी अत्यंत आदर्श आहे.',
        hi: 'मिट्टी का पीएच फसलों और पोषक तत्वों के लिए आदर्श है।',
        en: 'Soil pH is optimum for all crops and maximum nutrient uptake efficiency.',
      },
    };
  }
  if (ph <= 8.5) {
    return {
      rating: 'Moderately_Alkaline',
      headline: { mr: 'मध्यम अल्कधर्मी (विदर्भातील नेहमीची काळी कसदार जमीन)', hi: 'मध्यम क्षारीय काली मिट्टी', en: 'Moderately Alkaline (Typical Vidarbha Vertisol)' },
      advisory: {
        mr: 'विदर्भातील भारी काळ्या जमिनीत सामू ७.८ ते ८.४ असतो. अशा जमिनीत स्फुरद स्थिर (Fix) होतो. यासाठी शेणखत/कंपोस्ट वापरावे व स्फुरद विरघळवणारे जिवाणू (PSB) वापरावे.',
        hi: 'विदर्भ की गहरी काली मिट्टी में फास्फोरस फिक्सेशन अधिक होता है। पीएसबी (PSB) और कंपोस्ट का प्रयोग करें।',
        en: 'Typical Vidarbha black vertisol. Phosphorus tends to get fixed. Use Phosphorus Solubilizing Bacteria (PSB) and FYM/compost.',
      },
    };
  }
  return {
    rating: 'Strongly_Alkaline',
    headline: { mr: 'तीव्र अल्कधर्मी / चुनखडीयुक्त जमीन (pH > 8.5)', hi: 'अत्यधिक क्षारीय / चूनायुक्त', en: 'Strongly Alkaline / Calcareous (pH > 8.5)' },
    advisory: {
      mr: 'जमिनीत चुनखडी व क्षारांचे प्रमाण जास्त आहे. सिंगल सुपर फॉस्फेट (SSP), जिप्सम किंवा सेंद्रिय खतांचा भरपूर वापर करावा.',
      hi: 'मिट्टी अत्यधिक क्षारीय है। जिप्सम, सिंगल सुपर फॉस्फेट (SSP) तथा कम्पोस्ट का प्रयोग करें।',
      en: 'High alkalinity and calcium carbonate. Prefer SSP over DAP, use gypsum if sodium is high, and incorporate green manures.',
    },
  };
}

export function classifyEc(ec: number): {
  rating: 'Normal' | 'Critical' | 'Saline';
  headline: { mr: string; hi: string; en: string };
} {
  if (ec < 1.0) {
    return {
      rating: 'Normal',
      headline: { mr: 'विद्युत वाहकता सामान्य (क्षारमुक्त जमीन - सुरक्षित)', hi: 'लवण सामान्य (सुरक्षित)', en: 'Normal Salinity (Safe, EC < 1.0 dS/m)' },
    };
  }
  if (ec <= 2.0) {
    return {
      rating: 'Critical',
      headline: { mr: 'मध्यम क्षारता (बियाणे उगवणीवर परिणाम होऊ शकतो)', hi: 'मध्यम लवणता', en: 'Moderate Salinity (May affect seed germination)' },
    };
  }
  return {
    rating: 'Saline',
    headline: { mr: 'जास्त क्षारयुक्त जमीन (Saline - निचरा आवश्यक)', hi: 'लवणीय मिट्टी', en: 'Saline Soil (EC > 2.0 dS/m - Drainage Required)' },
  };
}

export interface CropRdfProfile {
  id: 'cotton_rainfed' | 'cotton_irrigated' | 'soybean' | 'tur' | 'chana';
  name: { mr: string; hi: string; en: string };
  rdfPerAcre: { n: number; p: number; k: number }; // kg/acre of elemental N, P2O5, K2O
  sourceAuthority: string;
  sourceDoc: string;
  splitSchedule: {
    stage: { mr: string; hi: string; en: string };
    daysAfterSowing: string;
    proportion: { n: number; p: number; k: number }; // Percentage 0 - 100%
  }[];
}

export const CROP_RDF_PROFILES: Record<string, CropRdfProfile> = {
  cotton_rainfed: {
    id: 'cotton_rainfed',
    name: { mr: 'कापूस - कोरडवाहू (Cotton Rainfed)', hi: 'कपास - वर्षा आधारित', en: 'Cotton (Rainfed)' },
    rdfPerAcre: { n: 40, p: 20, k: 20 },
    sourceAuthority: 'Dr. PDKV Akola',
    sourceDoc: 'PDKV Package of Practices for Kharif Cotton (100:50:50 kg/ha)',
    splitSchedule: [
      {
        stage: { mr: 'पेरणीवेळी (Basal Dose)', hi: 'बुआई के समय', en: 'Basal Dose at Sowing' },
        daysAfterSowing: 'Day 0',
        proportion: { n: 20, p: 100, k: 100 },
      },
      {
        stage: { mr: 'पहिली खांदणी / पहिली मात्रा', hi: 'पहली खुराक (30 दिन)', en: '1st Top Dressing' },
        daysAfterSowing: 'Day 30-35',
        proportion: { n: 40, p: 0, k: 0 },
      },
      {
        stage: { mr: 'फुलोरा अवस्था / दुसरी मात्रा', hi: 'फूल अवस्था (60 दिन)', en: '2nd Top Dressing' },
        daysAfterSowing: 'Day 60-65',
        proportion: { n: 40, p: 0, k: 0 },
      },
    ],
  },
  cotton_irrigated: {
    id: 'cotton_irrigated',
    name: { mr: 'कापूस - बागायती / ठिबक (Cotton Irrigated)', hi: 'कपास - सिंचित / ड्रिप', en: 'Cotton (Irrigated)' },
    rdfPerAcre: { n: 48, p: 24, k: 24 },
    sourceAuthority: 'Dr. PDKV Akola',
    sourceDoc: 'PDKV Package of Practices for Irrigated Cotton (120:60:60 kg/ha)',
    splitSchedule: [
      {
        stage: { mr: 'पेरणीवेळी (Basal)', hi: 'बुआई के समय', en: 'Basal Dose' },
        daysAfterSowing: 'Day 0',
        proportion: { n: 20, p: 100, k: 100 },
      },
      {
        stage: { mr: 'शाकीय वाढ (१ली मात्रा)', hi: 'वानस्पतिक वृद्धि', en: '1st Top Dressing' },
        daysAfterSowing: 'Day 30',
        proportion: { n: 40, p: 0, k: 0 },
      },
      {
        stage: { mr: 'फुलोरा व बोंड (२री मात्रा)', hi: 'फूल व गूलर', en: '2nd Top Dressing' },
        daysAfterSowing: 'Day 60',
        proportion: { n: 40, p: 0, k: 0 },
      },
    ],
  },
  soybean: {
    id: 'soybean',
    name: { mr: 'सोयाबीन (Soybean)', hi: 'सोयाबीन (Soybean)', en: 'Soybean' },
    rdfPerAcre: { n: 12, p: 30, k: 12 },
    sourceAuthority: 'ICAR-IISR & Dr. PDKV Akola',
    sourceDoc: 'PDKV Kharif Pulses & Oilseeds Advisory (30:75:30 kg/ha)',
    splitSchedule: [
      {
        stage: { mr: 'पेरणीवेळी संपूर्ण खत (१००% Basal)', hi: 'बुआई के समय पूरी मात्रा', en: '100% Basal at Sowing' },
        daysAfterSowing: 'Day 0',
        proportion: { n: 100, p: 100, k: 100 },
      },
    ],
  },
  tur: {
    id: 'tur',
    name: { mr: 'तूर (Pigeon Pea)', hi: 'अरहर / तूर (Pigeon Pea)', en: 'Pigeon Pea (Tur)' },
    rdfPerAcre: { n: 10, p: 20, k: 0 },
    sourceAuthority: 'Dr. PDKV Akola',
    sourceDoc: 'PDKV Red Gram Production Guide (25:50:0 kg/ha)',
    splitSchedule: [
      {
        stage: { mr: 'पेरणीवेळी संपूर्ण खत (१००% Basal)', hi: 'बुआई के समय पूरी मात्रा', en: '100% Basal at Sowing' },
        daysAfterSowing: 'Day 0',
        proportion: { n: 100, p: 100, k: 0 },
      },
    ],
  },
  chana: {
    id: 'chana',
    name: { mr: 'हरभरा (Gram / Chickpea)', hi: 'चना (Chickpea)', en: 'Chickpea / Gram' },
    rdfPerAcre: { n: 10, p: 20, k: 12 },
    sourceAuthority: 'Dr. PDKV Akola',
    sourceDoc: 'PDKV Rabi Pulses Production Guide (25:50:30 kg/ha)',
    splitSchedule: [
      {
        stage: { mr: 'पेरणीवेळी संपूर्ण खत (१००% Basal)', hi: 'बुआई के समय पूरी मात्रा', en: '100% Basal at Sowing' },
        daysAfterSowing: 'Day 0',
        proportion: { n: 100, p: 100, k: 100 },
      },
    ],
  },
};

export interface SoilTestInputs {
  ph: number;
  ec: number;
  organicCarbon: number; // %
  nitrogen: number; // kg/ha
  phosphorus: number; // kg/ha
  potassium: number; // kg/ha
  zinc?: number; // ppm
  sulfur?: number; // ppm
  iron?: number; // ppm
}

export interface FertilizerCalculationResult {
  crop: CropRdfProfile;
  acres: number;
  soilRatings: {
    nRating: NutrientRating;
    pRating: NutrientRating;
    kRating: NutrientRating;
    ocRating: NutrientRating;
    znDeficient: boolean;
    sDeficient: boolean;
    feDeficient: boolean;
  };
  adjustedNutrientRequirementKg: {
    n: number;
    p: number;
    k: number;
  };
  recommendedBagsOptionDap: {
    dapBags50kg: number;
    ureaBags45kg: number;
    mopBags50kg: number;
    zincSulfateKg?: number;
    explanation: { mr: string; hi: string; en: string };
  };
  recommendedBagsOptionSsp: {
    sspBags50kg: number;
    ureaBags45kg: number;
    mopBags50kg: number;
    explanation: { mr: string; hi: string; en: string };
  };
  applicationTimeline: {
    stageTitle: { mr: string; hi: string; en: string };
    daysTiming: string;
    dapOptionInstruction: { mr: string; hi: string; en: string };
    sspOptionInstruction: { mr: string; hi: string; en: string };
  }[];
}

export function calculateSoilFertilizers(
  cropId: string,
  acres: number,
  soil: SoilTestInputs
): FertilizerCalculationResult {
  const crop = CROP_RDF_PROFILES[cropId];
  if (!crop) {
    throw new Error(`Unsupported crop profile '${cropId}' for soil calculation.`);
  }

  if (acres <= 0) {
    throw new Error('Farm area in acres must be greater than zero.');
  }

  // 1. Classify soil nutrients
  const nRating = classifyNutrient('nitrogen', soil.nitrogen);
  const pRating = classifyNutrient('phosphorus', soil.phosphorus);
  const kRating = classifyNutrient('potassium', soil.potassium);
  const ocRating = classifyNutrient('organicCarbon', soil.organicCarbon);

  const znDeficient = soil.zinc !== undefined ? soil.zinc < SOIL_BENCHMARKS.zinc.lowMax : false;
  const sDeficient = soil.sulfur !== undefined ? soil.sulfur < SOIL_BENCHMARKS.sulfur.lowMax : false;
  const feDeficient = soil.iron !== undefined ? soil.iron < SOIL_BENCHMARKS.iron.lowMax : false;

  // 2. Adjust RDF based on STCR (Soil Test Crop Response) criteria:
  // Low: +25% RDF, Medium: 100% RDF, High: -25% RDF
  const getMultiplier = (rating: NutrientRating) => {
    if (rating === 'Low') return 1.25;
    if (rating === 'High') return 0.75;
    return 1.0;
  };

  const adjNPerAcre = crop.rdfPerAcre.n * getMultiplier(nRating);
  const adjPPerAcre = crop.rdfPerAcre.p * getMultiplier(pRating);
  const adjKPerAcre = crop.rdfPerAcre.k * (crop.rdfPerAcre.k > 0 ? getMultiplier(kRating) : 0);

  // Total required nutrient kg across farmer's plot
  const totalN = Number((adjNPerAcre * acres).toFixed(1));
  const totalP = Number((adjPPerAcre * acres).toFixed(1));
  const totalK = Number((adjKPerAcre * acres).toFixed(1));

  // ---------------------------------------------------------------------------
  // Option A: DAP (18:46:0) + Urea (46:0:0) + MOP (0:0:60)
  // 1 bag DAP (50kg) supplies: 23 kg P2O5 and 9 kg N
  // 1 bag Urea (45kg) supplies: 20.7 kg N
  // 1 bag MOP (50kg) supplies: 30 kg K2O
  // ---------------------------------------------------------------------------
  const rawDapBags = totalP / 23.0;
  const dapBags = Math.max(0, Math.round(rawDapBags * 2) / 2); // Round to nearest 0.5 bag

  const nSuppliedByDap = dapBags * 9.0;
  const remainingNForUrea = Math.max(0, totalN - nSuppliedByDap);
  const rawUreaBagsDap = remainingNForUrea / 20.7;
  const ureaBagsDap = Math.max(0, Math.round(rawUreaBagsDap * 2) / 2);

  const rawMopBags = totalK / 30.0;
  const mopBags = Math.max(0, Math.round(rawMopBags * 2) / 2);

  const zincSulfateKg = znDeficient ? Math.round(10 * acres) : undefined;

  // ---------------------------------------------------------------------------
  // Option B: SSP (0:16:0 + 11% S) + Urea (46:0:0) + MOP (0:0:60)
  // Especially recommended for alkaline black soils and sulfur-deficient plots!
  // 1 bag SSP (50kg) supplies: 8 kg P2O5 and 5.5 kg Sulfur
  // ---------------------------------------------------------------------------
  const rawSspBags = totalP / 8.0;
  const sspBags = Math.max(0, Math.round(rawSspBags * 2) / 2);

  const rawUreaBagsSsp = totalN / 20.7;
  const ureaBagsSsp = Math.max(0, Math.round(rawUreaBagsSsp * 2) / 2);

  // Application timeline breakdown
  const applicationTimeline = crop.splitSchedule.map((step) => {
    const basalProp = step.proportion;
    return {
      stageTitle: step.stage,
      daysTiming: step.daysAfterSowing,
      dapOptionInstruction: {
        mr: `${step.stage.mr}: DAP ${Math.round((dapBags * basalProp.p) / 100 * 10) / 10} गोण्या, युरिया ${Math.round((ureaBagsDap * basalProp.n) / 100 * 10) / 10} गोण्या, पोटॅश (MOP) ${Math.round((mopBags * basalProp.k) / 100 * 10) / 10} गोण्या.${zincSulfateKg && basalProp.p > 0 ? ` + झिंक सल्फेट ${zincSulfateKg} किलो.` : ''}`,
        hi: `${step.stage.hi}: डीएपी ${Math.round((dapBags * basalProp.p) / 100 * 10) / 10} बोरी, यूरिया ${Math.round((ureaBagsDap * basalProp.n) / 100 * 10) / 10} बोरी, पोटाश ${Math.round((mopBags * basalProp.k) / 100 * 10) / 10} बोरी।`,
        en: `${step.stage.en}: DAP ${Math.round((dapBags * basalProp.p) / 100 * 10) / 10} bags, Urea ${Math.round((ureaBagsDap * basalProp.n) / 100 * 10) / 10} bags, MOP ${Math.round((mopBags * basalProp.k) / 100 * 10) / 10} bags.`,
      },
      sspOptionInstruction: {
        mr: `${step.stage.mr}: SSP ${Math.round((sspBags * basalProp.p) / 100 * 10) / 10} गोण्या, युरिया ${Math.round((ureaBagsSsp * basalProp.n) / 100 * 10) / 10} गोण्या, पोटॅश ${Math.round((mopBags * basalProp.k) / 100 * 10) / 10} गोण्या. (SSP मुळे गंधक आपोआप मिळतो).`,
        hi: `${step.stage.hi}: एसएसपी ${Math.round((sspBags * basalProp.p) / 100 * 10) / 10} बोरी, यूरिया ${Math.round((ureaBagsSsp * basalProp.n) / 100 * 10) / 10} बोरी, पोटाश ${Math.round((mopBags * basalProp.k) / 100 * 10) / 10} बोरी।`,
        en: `${step.stage.en}: SSP ${Math.round((sspBags * basalProp.p) / 100 * 10) / 10} bags, Urea ${Math.round((ureaBagsSsp * basalProp.n) / 100 * 10) / 10} bags, MOP ${Math.round((mopBags * basalProp.k) / 100 * 10) / 10} bags.`,
      },
    };
  });

  return {
    crop,
    acres,
    soilRatings: {
      nRating,
      pRating,
      kRating,
      ocRating,
      znDeficient,
      sDeficient,
      feDeficient,
    },
    adjustedNutrientRequirementKg: {
      n: totalN,
      p: totalP,
      k: totalK,
    },
    recommendedBagsOptionDap: {
      dapBags50kg: dapBags,
      ureaBags45kg: ureaBagsDap,
      mopBags50kg: mopBags,
      zincSulfateKg,
      explanation: {
        mr: `पर्याय अ (DAP + युरिया + MOP): ${acres} एकरासाठी DAP (५० किलो) ${dapBags} गोण्या, युरिया (४५ किलो) ${ureaBagsDap} गोण्या आणि पोटॅश (५० किलो) ${mopBags} गोण्या लागतील.`,
        hi: `विकल्प क (DAP + यूरिया + MOP): ${acres} एकड़ हेतु DAP ${dapBags} बोरी, यूरिया ${ureaBagsDap} बोरी तथा पोटाश ${mopBags} बोरी।`,
        en: `Option A (DAP + Urea + MOP): For ${acres} acre(s), requires ${dapBags} bags of DAP (50kg), ${ureaBagsDap} bags of Urea (45kg), and ${mopBags} bags of MOP (50kg).`,
      },
    },
    recommendedBagsOptionSsp: {
      sspBags50kg: sspBags,
      ureaBags45kg: ureaBagsSsp,
      mopBags50kg: mopBags,
      explanation: {
        mr: `पर्याय ब (SSP + युरिया + MOP - चुनखडीयुक्त जमिनीत उत्तम): ${acres} एकरासाठी सिंगल सुपर फॉस्फेट (SSP) ${sspBags} गोण्या, युरिया ${ureaBagsSsp} गोण्या आणि MOP ${mopBags} गोण्या लागतील. (SSP मधून ११% सल्फर व १९% कॅल्शियम मोफत मिळते).`,
        hi: `विकल्प ख (SSP + यूरिया + MOP): ${acres} एकड़ हेतु SSP ${sspBags} बोरी, यूरिया ${ureaBagsSsp} बोरी तथा पोटाश ${mopBags} बोरी।`,
        en: `Option B (SSP + Urea + MOP - Superior for alkaline vertisols): For ${acres} acre(s), requires ${sspBags} bags of SSP (50kg), ${ureaBagsSsp} bags of Urea (45kg), and ${mopBags} bags of MOP (50kg). Supplies 11% Sulfur naturally.`,
      },
    },
    applicationTimeline,
  };
}
