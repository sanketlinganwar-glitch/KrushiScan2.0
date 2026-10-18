import { ScanResult } from '../types';

export interface InstitutionPhone {
  label: string;
  number: string;
  formatted: string;
  isTollFree?: boolean;
  isVerified: boolean;
}

export interface KvkInstitution {
  id: string;
  name: {
    mr: string;
    en: string;
  };
  district: string;
  districtMr: string;
  hostOrganization: {
    mr: string;
    en: string;
  };
  category: 'KVK' | 'ICAR_INSTITUTE' | 'UNIVERSITY_ATIC';
  address: {
    mr: string;
    en: string;
  };
  phoneNumbers: InstitutionPhone[];
  email?: string;
  websiteUrl: string;
  whatsappNumber?: string;
  hasVerifiedWhatsapp: boolean;
  sourceUrl: string;
  verificationDate: string; // YYYY-MM-DD
  notesMr?: string;
}

/**
 * Verified directory of public agricultural institutions and KVKs serving Vidarbha, Maharashtra.
 * All phone numbers, addresses, and host organizations are verified from official PDKV, ICAR, or university portals.
 * WhatsApp contacts are strictly marked unavailable unless officially verified.
 */
export const VIDARBHA_KVK_DIRECTORY: KvkInstitution[] = [
  {
    id: 'kvk-akola-pdkv',
    name: {
      mr: 'कृषी तंत्रज्ञान माहिती केंद्र (ATIC) / डॉ. पंजाबराव देशमुख कृषी विद्यापीठ, अकोला',
      en: 'Agriculture Technology Information Centre (ATIC) / Dr. PDKV, Akola',
    },
    district: 'Akola',
    districtMr: 'अकोला',
    hostOrganization: {
      mr: 'डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV)',
      en: 'Dr. Panjabrao Deshmukh Krishi Vidyapeeth',
    },
    category: 'UNIVERSITY_ATIC',
    address: {
      mr: 'विस्तार शिक्षण संचालनालय, डॉ. पंदेकृवि, पोस्ट कृषी नगर, अकोला - ४४४१०४',
      en: 'Directorate of Extension Education, Dr. PDKV, P.O. Krishi Nagar, Akola - 444104',
    },
    phoneNumbers: [
      {
        label: 'शेतकरी टोल-फ्री हेल्पलाइन (Toll-Free ATIC Helpline)',
        number: '18002330724',
        formatted: '1800-233-0724',
        isTollFree: true,
        isVerified: true,
      },
      {
        label: 'विस्तार शिक्षण संचालनालय (Directorate Office)',
        number: '07242258174',
        formatted: '0724-2258174',
        isTollFree: false,
        isVerified: true,
      },
    ],
    email: 'director_extn@pdkv.ac.in',
    websiteUrl: 'https://www.pdkv.ac.in',
    hasVerifiedWhatsapp: false,
    whatsappNumber: undefined,
    sourceUrl: 'https://www.pdkv.ac.in/directorates/extension-education/',
    verificationDate: '2026-10-18',
    notesMr: 'अकोला व संपूर्ण विदर्भातील शेतकऱ्यांसाठी विद्यापीठाची अधिकृत मोफत हेल्पलाइन.',
  },
  {
    id: 'kvk-yavatmal',
    name: {
      mr: 'कृषी विज्ञान केंद्र, यवतमाळ',
      en: 'Krishi Vigyan Kendra, Yavatmal',
    },
    district: 'Yavatmal',
    districtMr: 'यवतमाळ',
    hostOrganization: {
      mr: 'डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV), अकोला',
      en: 'Dr. Panjabrao Deshmukh Krishi Vidyapeeth, Akola',
    },
    category: 'KVK',
    address: {
      mr: 'कृषी संशोधन केंद्र (ARS), वाघापूर रोड, यवतमाळ - ४४५००१',
      en: 'Agricultural Research Station (ARS), Waghapur Road, Yavatmal - 445001',
    },
    phoneNumbers: [
      {
        label: 'केव्हीके कार्यालय दूरध्वनी (Office Landline)',
        number: '07232241745',
        formatted: '07232-241745',
        isTollFree: false,
        isVerified: true,
      },
    ],
    websiteUrl: 'https://www.pdkv.ac.in',
    hasVerifiedWhatsapp: false,
    whatsappNumber: undefined,
    sourceUrl: 'https://www.pdkv.ac.in/institutions/krishi-vigyan-kendras/',
    verificationDate: '2026-10-18',
    notesMr: 'कापूस व सोयाबीन पिकांवरील कीड-रोग व्यवस्थापनासाठी यवतमाळ जिल्ह्यातील मुख्य केंद्र.',
  },
  {
    id: 'kvk-sakoli-bhandara',
    name: {
      mr: 'कृषी विज्ञान केंद्र, साकोली (भंडारा)',
      en: 'Krishi Vigyan Kendra, Sakoli (Bhandara)',
    },
    district: 'Bhandara',
    districtMr: 'भंडारा',
    hostOrganization: {
      mr: 'डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV), अकोला',
      en: 'Dr. Panjabrao Deshmukh Krishi Vidyapeeth, Akola',
    },
    category: 'KVK',
    address: {
      mr: 'लाखांदूर रोड, तालुका साकोली, जि. भंडारा - ४४१८०२',
      en: 'Lakhandur Road, Tahasil Sakoli, Dist. Bhandara - 441802',
    },
    phoneNumbers: [
      {
        label: 'केव्हीके साकोली कार्यालय (Office Phone)',
        number: '07186295018',
        formatted: '07186-295018',
        isTollFree: false,
        isVerified: true,
      },
      {
        label: 'कृषी संशोधन केंद्र साकोली (ARS Phone)',
        number: '07186236343',
        formatted: '07186-236343',
        isTollFree: false,
        isVerified: true,
      },
    ],
    email: 'kvkbhandara@gmail.com',
    websiteUrl: 'https://www.pdkv.ac.in',
    hasVerifiedWhatsapp: false,
    whatsappNumber: undefined,
    sourceUrl: 'https://www.pdkv.ac.in/institutions/krishi-vigyan-kendras/',
    verificationDate: '2026-10-18',
    notesMr: 'धान, तूर व भाजीपाला पिकांवरील तज्ज्ञ सल्ला व रोग निवारण.',
  },
  {
    id: 'kvk-amravati-durgapur',
    name: {
      mr: 'कृषी विज्ञान केंद्र, दुर्गापूर / बडनेरा (अमरावती)',
      en: 'Krishi Vigyan Kendra, Durgapur / Badnera (Amravati)',
    },
    district: 'Amravati',
    districtMr: 'अमरावती',
    hostOrganization: {
      mr: 'श्रम साधना ट्रस्ट / भारतीय कृषी अनुसंधान परिषद (ICAR)',
      en: 'Shram Sadhana Trust / ICAR',
    },
    category: 'KVK',
    address: {
      mr: 'दुर्गापूर, बडनेरा रेल्वे स्टेशन जवळ, अमरावती - ४४४६०७',
      en: 'Durgapur, Near Badnera Railway Station, Amravati - 444607',
    },
    phoneNumbers: [
      {
        label: 'केव्हीके अमरावती कार्यालय (Office Landline)',
        number: '07212580174',
        formatted: '0721-2580174',
        isTollFree: false,
        isVerified: true,
      },
      {
        label: 'पर्यायी दूरध्वनी (Alternate Phone)',
        number: '07212580606',
        formatted: '0721-2580606',
        isTollFree: false,
        isVerified: true,
      },
    ],
    email: 'pckvkda2015@gmail.com',
    websiteUrl: 'https://kvk8.in',
    hasVerifiedWhatsapp: false,
    whatsappNumber: undefined,
    sourceUrl: 'https://icar.org.in/state-wise-kvk-contact-details',
    verificationDate: '2026-10-18',
    notesMr: 'अमरावती जिल्ह्यातील संत्रा, कापूस व सोयाबीन पिकांवरील मार्गदर्शक केंद्र.',
  },
  {
    id: 'kvk-wardha-selsura',
    name: {
      mr: 'कृषी विज्ञान केंद्र, सेलूरा (वर्धा)',
      en: 'Krishi Vigyan Kendra, Selsura (Wardha)',
    },
    district: 'Wardha',
    districtMr: 'वर्धा',
    hostOrganization: {
      mr: 'डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV), अकोला',
      en: 'Dr. Panjabrao Deshmukh Krishi Vidyapeeth, Akola',
    },
    category: 'KVK',
    address: {
      mr: 'कृषी विज्ञान केंद्र, सेलूरा, पोस्ट सेलूरा, ता. देवळी, जि. वर्धा - ४४२००१',
      en: 'Krishi Vigyan Kendra, Selsura, Post Selsura, Tq. Deoli, Dist. Wardha - 442001',
    },
    phoneNumbers: [
      {
        label: 'केव्हीके सेलूरा कार्यालय (Office Phone)',
        number: '07152287085',
        formatted: '07152-287085',
        isTollFree: false,
        isVerified: true,
      },
    ],
    websiteUrl: 'https://www.pdkv.ac.in',
    hasVerifiedWhatsapp: false,
    whatsappNumber: undefined,
    sourceUrl: 'https://www.pdkv.ac.in/institutions/krishi-vigyan-kendras/',
    verificationDate: '2026-10-18',
    notesMr: 'महाराष्ट्रातील पहिले कृषी विज्ञान केंद्र (स्थापना १९७९). कापूस, सोयाबीन व कडधान्य सल्ला.',
  },
  {
    id: 'icar-cicr-nagpur',
    name: {
      mr: 'केंद्रीय कापूस संशोधन संस्था (ICAR-CICR), नागपूर',
      en: 'ICAR-Central Institute for Cotton Research (CICR), Nagpur',
    },
    district: 'Nagpur',
    districtMr: 'नागपूर',
    hostOrganization: {
      mr: 'भारतीय कृषी अनुसंधान परिषद (ICAR), नवी दिल्ली',
      en: 'Indian Council of Agricultural Research (ICAR), New Delhi',
    },
    category: 'ICAR_INSTITUTE',
    address: {
      mr: 'पांजरी फार्म, वर्धा रोड, पोस्ट बॉक्स क्र. २, शंकर नगर पोस्ट, नागपूर - ४४११०८',
      en: 'Panjari Farm, Wardha Road, P.B. No. 2, Shankar Nagar P.O., Nagpur - 441108',
    },
    phoneNumbers: [
      {
        label: 'संस्था मुख्य दूरध्वनी (CICR Nagpur Phone 1)',
        number: '07103275536',
        formatted: '07103-275536',
        isTollFree: false,
        isVerified: true,
      },
      {
        label: 'संस्था दूरध्वनी २ (CICR Nagpur Phone 2)',
        number: '07103275529',
        formatted: '07103-275529',
        isTollFree: false,
        isVerified: true,
      },
    ],
    email: 'director.cicr@icar.gov.in',
    websiteUrl: 'https://cicr.icar.gov.in',
    hasVerifiedWhatsapp: false,
    whatsappNumber: undefined,
    sourceUrl: 'https://cicr.icar.gov.in/contact.html',
    verificationDate: '2026-10-18',
    notesMr: 'भारतातील कापूस पिकाचे राष्ट्रीय संशोधन संस्थान. बोंडअळी, गुलाबी अळी व बीटी कापूस तज्ज्ञ.',
  },
];

export const VIDARBHA_DISTRICTS = [
  { id: 'all', nameMr: 'सर्व जिल्हे (All Vidarbha)', nameEn: 'All Districts' },
  { id: 'Akola', nameMr: 'अकोला (Akola)', nameEn: 'Akola' },
  { id: 'Yavatmal', nameMr: 'यवतमाळ (Yavatmal)', nameEn: 'Yavatmal' },
  { id: 'Bhandara', nameMr: 'भंडारा / साकोली (Bhandara)', nameEn: 'Bhandara' },
  { id: 'Amravati', nameMr: 'अमरावती (Amravati)', nameEn: 'Amravati' },
  { id: 'Wardha', nameMr: 'वर्धा (Wardha)', nameEn: 'Wardha' },
  { id: 'Nagpur', nameMr: 'नागपूर (Nagpur)', nameEn: 'Nagpur' },
];

/**
 * Filter verified institutions by district and search term.
 */
export function getVerifiedInstitutions(district?: string, searchQuery?: string): KvkInstitution[] {
  let list = VIDARBHA_KVK_DIRECTORY;

  if (district && district !== 'all') {
    list = list.filter((inst) => inst.district.toLowerCase() === district.toLowerCase());
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (inst) =>
        inst.name.mr.toLowerCase().includes(q) ||
        inst.name.en.toLowerCase().includes(q) ||
        inst.district.toLowerCase().includes(q) ||
        inst.districtMr.toLowerCase().includes(q) ||
        inst.address.mr.toLowerCase().includes(q) ||
        inst.address.en.toLowerCase().includes(q) ||
        inst.hostOrganization.mr.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Build a safe, privacy-conscious consultation message for sharing with an agronomist or KVK officer.
 * Safely excludes: user location, personal identifiers, raw images, or secret tokens.
 * Includes: crop name, preliminary AI observation, diagnosis date, diagnostic uncertainty disclaimer, and farmer note.
 */
export function buildSafeWhatsAppDiagnosticMessage(
  scan?: Partial<ScanResult> | null,
  farmerQuestion?: string
): string {
  const parts: string[] = [];

  parts.push('🌾 *कृषी सल्ला विचारणा (KrushiScan AI Farmer Consultation)*');
  parts.push('----------------------------------------');

  if (scan) {
    if (scan.cropName) {
      parts.push(`🌱 *पीक (Crop):* ${scan.cropName}`);
    }
    const disease = scan.localDiseaseName?.mr || scan.diseaseName;
    if (disease) {
      parts.push(`🔍 *संभाव्य लक्षण/रोग (AI Observation):* ${disease}`);
    }
    if (scan.severity) {
      parts.push(`⚠️ *तीव्रता श्रेणी (Severity Category):* ${scan.severity}`);
    }
    if (scan.scannedAt) {
      try {
        const d = new Date(scan.scannedAt);
        parts.push(`📅 *तपासणी तारीख (Date):* ${d.toLocaleDateString('mr-IN')}`);
      } catch {
        // omit if malformed
      }
    }
    if (scan.uncertaintyInfo) {
      parts.push(`ℹ️ *तपासणी मर्यादा (Diagnostic Scope):* ${scan.uncertaintyInfo}`);
    }
  }

  if (farmerQuestion && farmerQuestion.trim()) {
    parts.push(`\n💬 *शेतकऱ्याचा प्रश्न (Farmer Question):*`);
    parts.push(farmerQuestion.trim());
  }

  parts.push('\n----------------------------------------');
  parts.push(
    '⚖️ *शास्त्रीय सूचना:* हे AI ॲपद्वारे केलेले प्राथमिक संगणकीय निरीक्षण आहे. रासायनिक फवारणीपूर्वी स्थानिक कृषी विज्ञान केंद्र (KVK) शास्त्रज्ञ किंवा कृषी सहाय्यकांचा प्रत्यक्ष सल्ला घ्यावा.'
  );

  return parts.join('\n');
}

/**
 * Generates an external WhatsApp link.
 * If recipientNumber is provided and is a valid 10-12 digit international number, sends directly to wa.me.
 * Otherwise, falls back to the universal WhatsApp Web/App share intent allowing the farmer to send to any contact.
 */
export function getWhatsAppShareUrl(messageText: string, recipientNumber?: string): string {
  const encodedText = encodeURIComponent(messageText);
  if (recipientNumber && /^\+?[0-9]{10,13}$/.test(recipientNumber.replace(/[\s-]/g, ''))) {
    const cleanNumber = recipientNumber.replace(/[\s+-]/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}
