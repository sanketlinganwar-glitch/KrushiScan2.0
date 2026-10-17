export type Language = 'mr' | 'hi' | 'en';

export type UserRole = 'farmer' | 'expert' | 'retailer' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  language: Language;
  district: string;
  village?: string;
  farmSizeAcres: number;
  activeCrops: string[];
  avatarUrl?: string;
  isDemoUser?: boolean;
}

export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface TreatmentRecommendation {
  cultural: string[];
  biological: string[];
  chemical: string[];
  caution: string;
}

export interface ScanResult {
  id: string;
  userId: string;
  cropId?: string;
  cropName: string;
  cropVariety?: string;
  imageUrl: string;
  diseaseName: string;
  localDiseaseName: {
    mr: string;
    hi: string;
    en: string;
  };
  severity: SeverityLevel;
  confidence: number; // 0 - 100
  diagnosisExplanation: string;
  symptoms: string[];
  recommendedTreatments: TreatmentRecommendation;
  preventionMethods: string[];
  followUpPlan: string;
  scannedAt: string;
  isDemo?: boolean;
  qualityWarning?: string;
  symptomBoxes?: {
    id: string;
    label: string;
    x: number; // percentage (0-100)
    y: number; // percentage (0-100)
    width?: number; // percentage
    height?: number; // percentage
    description: string;
  }[];
}

export interface Crop {
  id: string;
  userId: string;
  name: string;
  localName: {
    mr: string;
    hi: string;
    en: string;
  };
  variety: string;
  areaAcres: number;
  plotName: string;
  sowingDate: string;
  soilType: 'black_cotton' | 'red_soil' | 'loamy' | 'sandy';
  irrigationType: 'drip' | 'sprinkler' | 'rainfed' | 'flood';
  stage: 'sowing' | 'vegetative' | 'flowering' | 'boll_formation' | 'harvesting';
  healthStatus: 'healthy' | 'attention' | 'critical' | 'recovering';
  latestScanId?: string;
  latestScanDate?: string;
  latestDiseaseName?: string;
  isSample?: boolean;
}

export interface RecoveryLog {
  id: string;
  scanId: string;
  cropId: string;
  cropName: string;
  originalDisease: string;
  initialSeverity: SeverityLevel;
  currentStatus: 'improving' | 'stable' | 'deteriorating' | 'recovered';
  treatmentApplied: string;
  startDate: string;
  lastUpdated: string;
  initialImageUrl: string;
  latestImageUrl?: string;
  observations: string[];
  recoveryScorePercent?: number; // 0 - 100% healing progress
  aiComparisonAnalysis?: {
    healingStatus: 'exceptional' | 'good' | 'moderate' | 'deteriorated';
    lesionReductionPercent: number;
    observations: { mr: string; hi: string; en: string };
    nextStepRecommendation: { mr: string; hi: string; en: string };
  };
  timeline: {
    date: string;
    note: string;
    status: string;
    photoUrl?: string;
  }[];
}

export interface GuidanceArticle {
  id: string;
  category: 'pest' | 'fertilizer' | 'weather' | 'disease' | 'irrigation' | 'soil' | 'schemes';
  title: {
    mr: string;
    hi: string;
    en: string;
  };
  summary: {
    mr: string;
    hi: string;
    en: string;
  };
  content: {
    mr: string;
    hi: string;
    en: string;
  };
  source: string;
  readingTimeMinutes: number;
  publishedDate: string;
  imageUrl: string;
  isBookmarked?: boolean;
  tags: string[];
}

export interface MandiRecord {
  id: string;
  commodity: string;
  commodityLocal: { mr: string; hi: string; en: string };
  variety: string;
  state: string;
  district: string;
  marketName: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalsTonnes: number;
  arrivalDate: string;
  msp?: number;
}

export interface Product {
  id: string;
  name: string;
  nameLocal: { mr: string; hi: string; en: string };
  category: 'seeds' | 'bio' | 'protection' | 'fertilizer' | 'tools';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  description: string;
  targetCrops: string[];
  dosageOrUsage: string;
  isVerifiedSeller: boolean;
  sellerName: string;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    village: string;
    district: string;
    pincode: string;
    phone: string;
  };
  paymentMethod: 'kcc' | 'upi' | 'cod';
  status: 'placed' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
  isDemoOrder?: boolean;
}

export interface ExpertInquiry {
  id: string;
  userId: string;
  cropName: string;
  issueCategory: string;
  description: string;
  imageUrl?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  submittedAt: string;
  expertResponse?: {
    expertName: string;
    expertTitle: string;
    institution: string;
    responseDate: string;
    recommendation: string;
  };
}

export interface AppNotification {
  id: string;
  type: 'weather' | 'disease' | 'price' | 'reminder' | 'expert' | 'scheme';
  title: { mr: string; hi: string; en: string };
  message: { mr: string; hi: string; en: string };
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  severity?: 'info' | 'warning' | 'alert';
}

export interface SprayRadarHour {
  timeStr: string; // e.g. "10:00"
  temp: number;
  rainProb: number; // 0-100%
  windSpeed: number; // km/h
  status: 'safe' | 'caution' | 'danger'; // safe (green), caution (yellow), danger (red)
  reason: {
    mr: string;
    hi: string;
    en: string;
  };
}

export interface SprayWindowAdvisory {
  currentStatus: 'safe' | 'caution' | 'danger';
  headline: { mr: string; hi: string; en: string };
  recommendation: { mr: string; hi: string; en: string };
  washOffRiskPercentage: number;
  bestSpraySlot: string; // e.g., "सकाळी ६:३० ते ९:३०"
  hourlyRadar: SprayRadarHour[];
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  location: string;
  advisory: {
    mr: string;
    hi: string;
    en: string;
  };
  isLive: boolean;
  sprayWindow?: SprayWindowAdvisory;
}
export type ChemicalCategory = 'insecticide' | 'fungicide' | 'fertilizer' | 'biocontrol' | 'adjuvant';

export type FormulationCode = 'WP' | 'WDG' | 'SG' | 'SC' | 'EC' | 'SL' | 'SP' | 'WSF' | 'BIO' | 'ADJ';

export interface ChemicalItem {
  id: string;
  name: string;
  tradeNameExample: string;
  category: ChemicalCategory;
  formulation: FormulationCode;
  formulationFullName: string;
  activeIngredient: string;
  commonTarget: {
    mr: string;
    hi: string;
    en: string;
  };
}

export type CompatibilityStatus = 'verified_compatible' | 'incompatible' | 'caution_jar_test' | 'unverified';

export interface VerifiedCompatibilityRule {
  id: string;
  chemicalAId: string;
  chemicalBId: string;
  status: CompatibilityStatus;
  primaryRisk?: 'phytotoxicity' | 'chemical_neutralization' | 'precipitation_curdling' | 'biocide_inactivation' | 'none';
  headline: {
    mr: string;
    hi: string;
    en: string;
  };
  explanation: {
    mr: string;
    hi: string;
    en: string;
  };
  sourceAuthority: string;
  documentTitle: string;
  issuingAuthority: string;
  publicationDate?: string;
  sectionOrPage?: string;
  evidenceType: 'university_recommendation' | 'statutory_label_leaflet' | 'incompatibility_science' | 'conditional_field_practice' | 'insufficient_evidence';
  applicableConditions: {
    mr: string;
    hi: string;
    en: string;
  };
  verificationStatus: 'verified_university_label' | 'statutory_incompatibility' | 'unverified_field_practice';
}

export interface WalesMixingStep {
  stepNumber: number;
  walesCategory: 'W' | 'A' | 'L' | 'E' | 'S' | 'Water';
  title: {
    mr: string;
    hi: string;
    en: string;
  };
  instruction: {
    mr: string;
    hi: string;
    en: string;
  };
  chemicalNames: string[];
}

export interface TankMixEvaluationResult {
  selectedChemicals: ChemicalItem[];
  overallStatus: CompatibilityStatus;
  statusHeadline: {
    mr: string;
    hi: string;
    en: string;
  };
  detailedExplanation: {
    mr: string;
    hi: string;
    en: string;
  };
  highestRisk?: string;
  isMultiProductCaution: boolean;
  mixingOrder: WalesMixingStep[];
  rulesTriggered: VerifiedCompatibilityRule[];
  jarTestMandatory: boolean;
  labelPrecedenceNotice: {
    mr: string;
    hi: string;
    en: string;
  };
  waterQualityNotice: {
    mr: string;
    hi: string;
    en: string;
  };
  safetyCautions: {
    mr: string[];
    hi: string[];
    en: string[];
  };
  disclaimer: {
    mr: string;
    hi: string;
    en: string;
  };
}
