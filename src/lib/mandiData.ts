import { MandiRecord } from '../types';

export const COMMODITIES = [
  { id: 'cotton', name: 'कापूस (Cotton)', nameLocal: { mr: 'कापूस', hi: 'कपास', en: 'Cotton' }, msp: 7521 },
  { id: 'soybean', name: 'सोयाबीन (Soybean)', nameLocal: { mr: 'सोयाबीन', hi: 'सोयाबीन', en: 'Soybean' }, msp: 4892 },
  { id: 'tur', name: 'तूर (Pigeonpea)', nameLocal: { mr: 'तूर', hi: 'तुअर/अरहर', en: 'Pigeonpea (Tur)' }, msp: 7550 },
  { id: 'chana', name: 'हरभरा / चना (Gram)', nameLocal: { mr: 'हरभरा', hi: 'चना', en: 'Gram (Chana)' }, msp: 5440 },
  { id: 'wheat', name: 'गहू (Wheat)', nameLocal: { mr: 'गहू', hi: 'गेहूं', en: 'Wheat' }, msp: 2275 },
];

export const VIDARBHA_DISTRICTS = [
  'सर्व जिल्हे (All)',
  'यवतमाळ (Yavatmal)',
  'अमरावती (Amravati)',
  'अकोला (Akola)',
  'वर्धा (Wardha)',
  'नागपूर (Nagpur)',
  'बुलढाणा (Buldhana)',
  'चंद्रपूर (Chandrapur)',
  'वाशीम (Washim)',
];

export const MOCK_MANDI_RECORDS: MandiRecord[] = [
  // Cotton Records
  {
    id: 'm-1',
    commodity: 'कापूस (Cotton)',
    commodityLocal: { mr: 'कापूस', hi: 'कपास', en: 'Cotton' },
    variety: 'मध्यम धागा (Medium Staple)',
    state: 'महाराष्ट्र (Maharashtra)',
    district: 'यवतमाळ (Yavatmal)',
    marketName: 'यवतमाळ मुख्य APMC (Yavatmal)',
    minPrice: 7100,
    maxPrice: 7750,
    modalPrice: 7520,
    arrivalsTonnes: 145,
    arrivalDate: 'आज (Today)',
    msp: 7521,
  },
  {
    id: 'm-2',
    commodity: 'कापूस (Cotton)',
    commodityLocal: { mr: 'कापूस', hi: 'कपास', en: 'Cotton' },
    variety: 'लांब धागा (Long Staple)',
    state: 'महाराष्ट्र (Maharashtra)',
    district: 'वर्धा (Wardha)',
    marketName: 'हिंगणघाट कृषी उत्पन्न बाजार (Hinganghat APMC)',
    minPrice: 7350,
    maxPrice: 7920,
    modalPrice: 7780,
    arrivalsTonnes: 320,
    arrivalDate: 'आज (Today)',
    msp: 7521,
  },
  {
    id: 'm-3',
    commodity: 'कापूस (Cotton)',
    commodityLocal: { mr: 'कापूस', hi: 'कपास', en: 'Cotton' },
    variety: 'मध्यम धागा',
    state: 'महाराष्ट्र (Maharashtra)',
    district: 'यवतमाळ (Yavatmal)',
    marketName: 'वणी बाजार समिती (Wani APMC)',
    minPrice: 7050,
    maxPrice: 7680,
    modalPrice: 7460,
    arrivalsTonnes: 110,
    arrivalDate: 'आज (Today)',
    msp: 7521,
  },
  {
    id: 'm-4',
    commodity: 'कापूस (Cotton)',
    commodityLocal: { mr: 'कापूस', hi: 'कपास', en: 'Cotton' },
    variety: 'लांब धागा',
    state: 'महाराष्ट्र (Maharashtra)',
    district: 'अकोला (Akola)',
    marketName: 'अकोला मुख्य APMC (Akola)',
    minPrice: 7200,
    maxPrice: 7820,
    modalPrice: 7610,
    arrivalsTonnes: 195,
    arrivalDate: 'आज (Today)',
    msp: 7521,
  },

  // Soybean Records
  {
    id: 'm-5',
    commodity: 'सोयाबीन (Soybean)',
    commodityLocal: { mr: 'सोयाबीन', hi: 'सोयाबीन', en: 'Soybean' },
    variety: 'पिवळा (Yellow)',
    state: 'महाराष्ट्र (Maharashtra)',
    district: 'अमरावती (Amravati)',
    marketName: 'अमरावती मुख्य APMC (Amravati)',
    minPrice: 4250,
    maxPrice: 4720,
    modalPrice: 4580,
    arrivalsTonnes: 540,
    arrivalDate: 'आज (Today)',
    msp: 4892,
  },
  {
    id: 'm-6',
    commodity: 'सोयाबीन (Soybean)',
    commodityLocal: { mr: 'सोयाबीन', hi: 'सोयाबीन', en: 'Soybean' },
    variety: 'पिवळा',
    state: 'महाराष्ट्र (Maharashtra)',
    district: 'यवतमाळ (Yavatmal)',
    marketName: 'दारव्हा उपबाजार (Darwha APMC)',
    minPrice: 4180,
    maxPrice: 4620,
    modalPrice: 4490,
    arrivalsTonnes: 85,
    arrivalDate: 'आज (Today)',
    msp: 4892,
  },
  {
    id: 'm-7',
    commodity: 'सोयाबीन (Soybean)',
    commodityLocal: { mr: 'सोयाबीन', hi: 'सोयाबीन', en: 'Soybean' },
    variety: 'पिवळा',
    state: 'महाराष्ट्र (Maharashtra)',
    district: 'नागपूर (Nagpur)',
    marketName: 'कळमना APMC (Kalamna, Nagpur)',
    minPrice: 4350,
    maxPrice: 4790,
    modalPrice: 4650,
    arrivalsTonnes: 410,
    arrivalDate: 'आज (Today)',
    msp: 4892,
  },

  // Tur Records
  {
    id: 'm-8',
    commodity: 'तूर (Pigeonpea)',
    commodityLocal: { mr: 'तूर', hi: 'तुअर/अरहर', en: 'Pigeonpea (Tur)' },
    variety: 'लाल तूर (Red Tur)',
    state: 'महाराष्ट्र (Maharashtra)',
    district: 'अकोला (Akola)',
    marketName: 'अकोला दाल मिल हब APMC',
    minPrice: 9400,
    maxPrice: 10450,
    modalPrice: 10100,
    arrivalsTonnes: 210,
    arrivalDate: 'आज (Today)',
    msp: 7550,
  },
  {
    id: 'm-9',
    commodity: 'तूर (Pigeonpea)',
    commodityLocal: { mr: 'तूर', hi: 'तुअर/अरहर', en: 'Pigeonpea (Tur)' },
    variety: 'पांढरी तूर',
    state: 'महाराष्ट्र (Maharashtra)',
    district: 'यवतमाळ (Yavatmal)',
    marketName: 'यवतमाळ मुख्य APMC',
    minPrice: 9200,
    maxPrice: 10150,
    modalPrice: 9850,
    arrivalsTonnes: 95,
    arrivalDate: 'आज (Today)',
    msp: 7550,
  },
  {
    id: 'm-10',
    commodity: 'तूर (Pigeonpea)',
    commodityLocal: { mr: 'तूर', hi: 'तुअर/अरहर', en: 'Pigeonpea (Tur)' },
    variety: 'लाल तूर',
    state: 'महाराष्ट्र (Maharashtra)',
    district: 'बुलढाणा (Buldhana)',
    marketName: 'मलकापूर APMC (Malkapur)',
    minPrice: 9350,
    maxPrice: 10280,
    modalPrice: 9980,
    arrivalsTonnes: 130,
    arrivalDate: 'आज (Today)',
    msp: 7550,
  },
];

// 7-day price history trend for Cotton in Vidarbha
export const HISTORICAL_PRICE_TRENDS = [
  { day: 'सोम (Mon)', yavatmal: 7380, hinganghat: 7620, akola: 7510 },
  { day: 'मंगळ (Tue)', yavatmal: 7420, hinganghat: 7680, akola: 7550 },
  { day: 'बुध (Wed)', yavatmal: 7450, hinganghat: 7700, akola: 7570 },
  { day: 'गुरु (Thu)', yavatmal: 7490, hinganghat: 7720, akola: 7590 },
  { day: 'शुक्र (Fri)', yavatmal: 7510, hinganghat: 7750, akola: 7600 },
  { day: 'शनि (Sat)', yavatmal: 7520, hinganghat: 7780, akola: 7610 },
];

export interface NetReturnCalculationInput {
  quantityQuintals: number;
  modalPricePerQuintal: number;
  distanceKm: number;
  ratePerKmOrFlat: number; // ₹ per km or lump sum
  isFlatRate?: boolean;
  laborAndUnloadingPerQuintal: number; // e.g. ₹35 per bag/quintal
  apmcCessOrWeighment: number; // e.g. ₹150 flat
}

export interface NetReturnCalculationResult {
  grossRevenue: number;
  transportCost: number;
  laborAndOtherCosts: number;
  totalCosts: number;
  netReturn: number;
  effectivePricePerQuintal: number;
}

export function calculateNetReturn(input: NetReturnCalculationInput): NetReturnCalculationResult {
  const {
    quantityQuintals,
    modalPricePerQuintal,
    distanceKm,
    ratePerKmOrFlat,
    isFlatRate = false,
    laborAndUnloadingPerQuintal,
    apmcCessOrWeighment,
  } = input;

  const grossRevenue = quantityQuintals * modalPricePerQuintal;
  const transportCost = isFlatRate ? ratePerKmOrFlat : distanceKm * ratePerKmOrFlat;
  const laborAndOtherCosts = (quantityQuintals * laborAndUnloadingPerQuintal) + apmcCessOrWeighment;
  const totalCosts = transportCost + laborAndOtherCosts;
  const netReturn = grossRevenue - totalCosts;
  const effectivePricePerQuintal = quantityQuintals > 0 ? Math.round(netReturn / quantityQuintals) : 0;

  return {
    grossRevenue,
    transportCost,
    laborAndOtherCosts,
    totalCosts,
    netReturn,
    effectivePricePerQuintal,
  };
}
