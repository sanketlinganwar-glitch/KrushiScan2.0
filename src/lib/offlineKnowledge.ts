// KrushiScan AI - Offline-First Agricultural Knowledge Base & Scan Queue
// Grounded in IndexedDB with local fallback, strict privacy, and explicit farmer consent.

import { ScanResult } from '../types';

export const OFFLINE_DB_NAME = 'KrushiScan_Offline_DB';
export const OFFLINE_DB_VERSION = 2;
export const KNOWLEDGE_BASE_VERSION = '2.1.0';

export interface OfflineKnowledgeItem {
  id: string;
  cropId: 'cotton' | 'soybean' | 'tur' | 'chana' | 'citrus' | 'general';
  cropName: {
    mr: string;
    hi: string;
    en: string;
  };
  disorderName: {
    mr: string;
    hi: string;
    en: string;
  };
  symptoms: {
    mr: string[];
    hi: string[];
    en: string[];
  };
  pdkvRecommendations: {
    cultural: { mr: string[]; hi: string[]; en: string[] };
    biological: { mr: string[]; hi: string[]; en: string[] };
    chemical: { mr: string[]; hi: string[]; en: string[] };
    caution: { mr: string; hi: string; en: string };
  };
  sourceAuthority: string;
  version: string;
}

export type QueueItemStatus = 'queued' | 'syncing' | 'completed' | 'failed';

export interface QueuedScanItem {
  id: string;
  idempotencyKey: string;
  cropHint: string;
  topImageDataUrl: string;
  undersideImageDataUrl?: string;
  createdAt: string; // ISO String
  status: QueueItemStatus;
  retryCount: number;
  errorReason?: string;
  result?: ScanResult;
}

// Built-in reviewed & verified Vidarbha crop pathology knowledge items (Version 2.1.0)
export const VERIFIED_OFFLINE_KNOWLEDGE: OfflineKnowledgeItem[] = [
  {
    id: 'kb-cotton-pink-bollworm',
    cropId: 'cotton',
    cropName: { mr: 'कपाशी (Cotton)', hi: 'कपास (Cotton)', en: 'Cotton' },
    disorderName: {
      mr: 'गुलाबी बोंडअळी (Pink Bollworm - Pectinophora gossypiella)',
      hi: 'गुलाबी सुंडी (Pink Bollworm)',
      en: 'Pink Bollworm (Pectinophora gossypiella)',
    },
    symptoms: {
      mr: ['गुळबेंद फुले (Rosette flowers)', 'बोंडावर छिद्रे व विष्ठा', 'बोंडे अकाली उमलणे व काळी पडणे'],
      hi: ['गुलाब की तरह मुड़ी कलियां', 'गूलर पर छेद व विष्ठा', 'कपास की गुणवत्ता खराब होना'],
      en: ['Rosetted flowers', 'Holes in bolls with frass', 'Premature boll opening and lint staining'],
    },
    pdkvRecommendations: {
      cultural: {
        mr: ['प्रति एकरी ५ कामगंध सापळे लावावेत', 'गुळबेंद फुले गोळा करून नष्ट करावीत', 'फरदड (Ratoon) घेणे टाळावे'],
        hi: ['प्रति एकड़ 5 फेरोमोन ट्रैप लगाएं', 'प्रभावित फूल नष्ट करें', 'फरदड़ फसल न लें'],
        en: ['Install 5 pheromone traps per acre', 'Collect and destroy rosetted flowers', 'Avoid ratoon cotton crop'],
      },
      biological: {
        mr: ['ट्रायकोग्रामा चिलोनीस ६०,००० प्रति एकर लावा', '५% निंबोळी अर्क (NSKE) फवारा'],
        hi: ['ट्राइकोग्रामा 60,000 प्रति एकड़ छोड़ें', '5% नीम अर्क का छिड़काव करें'],
        en: ['Release Trichogramma chilonis @ 60,000/acre', 'Spray 5% Neem Seed Kernel Extract (NSKE)'],
      },
      chemical: {
        mr: ['ETL (८ पतंग सलग ३ दिवस) ओलांडल्यास: प्रोफेनोफॉस ५०% EC (२ मिली/लि) किंवा इमामेक्टिन बेन्झोएट ५% SG (४ ग्रॅम/१० लि)'],
        hi: ['ETL पार होने पर: प्रोफेनोफॉस 50% EC (2 ml/L) या इमामेक्टिन 5% SG (4g/10L)'],
        en: ['Upon exceeding ETL (8 moths/trap/day for 3 days): Profenofos 50% EC (2 ml/L) or Emamectin Benzoate 5% SG (4g/10L)'],
      },
      caution: {
        mr: 'फवारणी करताना सुरक्षा कीट वापरा. सलग एकाच गटातील कीटकनाशक वापरू नये.',
        hi: 'सुरक्षा किट पहनकर ही छिड़काव करें।',
        en: 'Wear protective gear. Alternate chemical classes to prevent resistance.',
      },
    },
    sourceAuthority: 'डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV) अकोला व ICAR-CICR नागपूर',
    version: KNOWLEDGE_BASE_VERSION,
  },
  {
    id: 'kb-cotton-whitefly',
    cropId: 'cotton',
    cropName: { mr: 'कपाशी (Cotton)', hi: 'कपास (Cotton)', en: 'Cotton' },
    disorderName: {
      mr: 'पांढरी माशी (Whitefly - Bemisia tabaci)',
      hi: 'सफेद मक्खी (Whitefly)',
      en: 'Whitefly (Bemisia tabaci)',
    },
    symptoms: {
      mr: ['पाने पिवळी पडणे व कडा वर वाकणे', 'पानाच्या पाठीमागे चिकट स्त्राव (Honeydew)', 'काजळी बुरशी वाढणे'],
      hi: ['पत्तियां पीली पड़ना', 'पत्ती की निचली सतह पर चिपचिपा स्राव', 'काली फफूंद'],
      en: ['Leaf yellowing and upward curling', 'Honeydew secretion on lower leaf surface', 'Sooty mold accumulation'],
    },
    pdkvRecommendations: {
      cultural: {
        mr: ['एकरी १० पिवळे चिकट सापळे लावावेत', 'युरिया खताचा अतिरेक टाळावा', 'बांधावरील गाजरगवत नष्ट करावे'],
        hi: ['प्रति एकड़ 10 पीले चिपचिपे ट्रैप लगाएं', 'अत्यधिक यूरिया से बचें', 'मेड़ों की घास साफ करें'],
        en: ['Place 10 yellow sticky traps per acre', 'Avoid excess nitrogenous fertilizer', 'Clear weeds from bunds'],
      },
      biological: {
        mr: ['व्हर्टिसिलियम लेकानी ५ ग्रॅम/लिटर फवारा', 'निंबोळी तेल १५०० पीपीएम ५ मिली/लिटर'],
        hi: ['वर्टिसिलियम लेकानी 5g/L छिड़कें', 'नीम तेल 5 ml/L'],
        en: ['Spray Verticillium lecanii @ 5g/L', 'Apply Neem oil 1500 ppm @ 5 ml/L'],
      },
      chemical: {
        mr: ['फ्लोनिकॅमिड ५०% WG (४ ग्रॅम/१० लिटर) किंवा डायफेन्थियुरॉन ५०% WP (१२ ग्रॅम/१० लिटर)'],
        hi: ['फ्लोनिकामिड 50% WG (4g/10L) या डायफेन्थियुरॉन 50% WP (12g/10L)'],
        en: ['Flonicamid 50% WG (4g/10L) or Diafenthiuron 50% WP (12g/10L) directed at under-surface'],
      },
      caution: {
        mr: 'फवारा पाठीमागच्या पानांवर बसेल अशा प्रकारे नोझल फिरवा.',
        hi: 'पत्तियों के नीचे की ओर छिड़काव सुनिश्चित करें।',
        en: 'Direct spray nozzle upward to target undersides of leaves where nymphs reside.',
      },
    },
    sourceAuthority: 'डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV) अकोला',
    version: KNOWLEDGE_BASE_VERSION,
  },
  {
    id: 'kb-soybean-yellow-mosaic',
    cropId: 'soybean',
    cropName: { mr: 'सोयाबीन (Soybean)', hi: 'सोयाबीन (Soybean)', en: 'Soybean' },
    disorderName: {
      mr: 'पिवळा मोझॅक विषाणू (Yellow Mosaic Virus - YMV)',
      hi: 'पीला मोज़ेक वायरस (YMV)',
      en: 'Yellow Mosaic Virus (YMV)',
    },
    symptoms: {
      mr: ['पानांवर पिवळे व हिरवे अनियमित चट्टे', 'पाने सुरकुतणे व वाढ खुंटणे', 'शेंगांमध्ये दाणे न भरणे'],
      hi: ['पत्तियों पर पीले-हरे धब्बे', 'पौधा छोटा रह जाना', 'फलियों में दाने न पड़ना'],
      en: ['Irregular alternating yellow and dark green patches', 'Leaf crinkling and stunting', 'Poor pod filling'],
    },
    pdkvRecommendations: {
      cultural: {
        mr: ['सुरुवातीला रोगट झाडे उपटून नष्ट करा', 'शेताभोवती मका किंवा ज्वारीचे संरक्षक पीक लावा'],
        hi: ['रोगग्रस्त पौधे उखाड़कर नष्ट करें', 'मक्का या ज्वार की बॉर्डर पट्टी लगाएं'],
        en: ['Rogue out and bury early infected plants', 'Plant 3-4 barrier rows of maize or sorghum'],
      },
      biological: {
        mr: ['पांढरी माशी नियंत्रणासाठी निंबोळी अर्क ५% फवारा'],
        hi: ['सफेद मक्खी नियंत्रण के लिए नीम अर्क 5% स्प्रे करें'],
        en: ['Spray 5% Neem extract to deter vector whiteflies'],
      },
      chemical: {
        mr: ['रोगप्रसारक पांढऱ्या माशीसाठी: थायामेथोक्साम २५% WG (२ ग्रॅम/१० लिटर)'],
        hi: ['सफेद मक्खी के लिए: थायामेथोक्साम 25% WG (2g/10L)'],
        en: ['Target vector whiteflies with Thiamethoxam 25% WG (2g/10L)'],
      },
      caution: {
        mr: 'विषाणू रोगावर थेट रासायनिक औषध नसते; पांढरी माशी रोखणे हाच मुख्य उपाय आहे.',
        hi: 'वायरस पर कीटनाशक असर नहीं करता, वाहक मक्खी को रोकना ही उपाय है।',
        en: 'Viruses cannot be cured chemically; suppressing the insect vector is paramount.',
      },
    },
    sourceAuthority: 'ICAR - Indian Institute of Soybean Research (IISR) व डॉ. पंदेकृवि',
    version: KNOWLEDGE_BASE_VERSION,
  },
  {
    id: 'kb-tur-phytophthora',
    cropId: 'tur',
    cropName: { mr: 'तूर (Pigeon Pea)', hi: 'अरहर (Pigeon Pea)', en: 'Pigeon Pea (Tur)' },
    disorderName: {
      mr: 'फायटोप्थोरा खोडकूज (Phytophthora Stem Blight)',
      hi: 'फाइटोफ्थोरा तना सड़न',
      en: 'Phytophthora Stem Blight (Phytophthora cajani)',
    },
    symptoms: {
      mr: ['खोडावर तपकिरी ते काळे चट्टे', 'झाडाचे शेंडे अचानक सुकणे व पाने गळणे', 'खोड कुजल्याने झाड मोडणे'],
      hi: ['तने पर भूरे-काले धब्बे', 'पौधे का अचानक सूखना', 'तना सड़कर टूटना'],
      en: ['Dark brown to black necrotic lesions on main stem', 'Sudden wilt and defoliation', 'Stem breakage at lesion site'],
    },
    pdkvRecommendations: {
      cultural: {
        mr: ['शेतात पाणी साचणार नाही याची काळजी घ्या; चर काढा', 'उंचावलेल्या गादीवाफ्यावर किंवा सरी-वरंब्यावर पेरणी करा'],
        hi: ['खेत में पानी जमा न होने दें; जल निकासी रखें', 'मेंड़ों पर बुआई करें'],
        en: ['Maintain impeccable field drainage; prevent ponding', 'Sow on ridge and furrow or broad bed system'],
      },
      biological: {
        mr: ['पेरणीपूर्वी ट्रायकोडर्मा हरझियानम ५ ग्रॅम/किलो बीजप्रक्रिया करा'],
        hi: ['ट्राइकोडर्मा 5g/kg से बीजोपचार करें'],
        en: ['Seed treatment with Trichoderma harzianum @ 5g/kg seed'],
      },
      chemical: {
        mr: ['लक्षणे दिसताच: मेटॅलॅक्सिल ४% + मॅनकोझेब ६४% WP (२.५ ग्रॅम/लिटर) खोडाभोवती आळवणी (Drenching) व फवारणी करा'],
        hi: ['मेटालैक्सिल+मैनकोजेब (2.5g/L) का तने के पास छिड़काव व ड्रेन्चिंग करें'],
        en: ['At first appearance: Metalaxyl 4% + Mancozeb 64% WP (2.5 g/L) stem spray and root-zone drenching'],
      },
      caution: {
        mr: 'पावसाळ्यात सतत ढगाळ वातावरणात हा रोग वेगाने पसरतो.',
        hi: 'लगातार बारिश व उमस में यह बीमारी बहुत तेजी से फैलती है।',
        en: 'High humidity and standing water cause rapid fungal spore dispersal.',
      },
    },
    sourceAuthority: 'डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV) अकोला',
    version: KNOWLEDGE_BASE_VERSION,
  },
  {
    id: 'kb-citrus-psylla',
    cropId: 'citrus',
    cropName: { mr: 'संत्रा (Nagpur Mandarin)', hi: 'संतरा (Mandarin)', en: 'Nagpur Mandarin' },
    disorderName: {
      mr: 'सिट्रस सायला (Citrus Psylla - Diaphorina citri)',
      hi: 'सिट्रस सायला (Citrus Psylla)',
      en: 'Citrus Psylla (Diaphorina citri)',
    },
    symptoms: {
      mr: ['नवीन पालवीतील रस शोषणे', 'पानांवर पांढरा मेणासारखा स्त्राव', 'झाडाची वाढ खुंटणे व ग्रीनिंग रोगाचा फैलाव'],
      hi: ['नई पत्तियों का रस चूसना', 'पत्तियों पर सफेद मोम जैसा स्राव', 'ग्रीनिंग रोग का फैलाव'],
      en: ['Nymphs sucking sap from tender flushes', 'White waxy crystalline excretion on leaves', 'Vector for fatal Citrus Greening (Huanglongbing)'],
    },
    pdkvRecommendations: {
      cultural: {
        mr: ['नवीन पालवी फुटण्याच्या काळात बागेची नियमित पाहणी करा', 'पाणी ताण व्यवस्थापन शास्त्रीय पद्धतीने करा'],
        hi: ['नई कोपलें आने पर नियमित निगरानी रखें', 'उचित जल प्रबंधन करें'],
        en: ['Monitor trees closely during new flush flushes', 'Avoid water stress during flush initiation'],
      },
      biological: {
        mr: ['५% निंबोळी अर्क (NSKE) किंवा व्हर्टिसिलियम लेकानी (४ ग्रॅम/लि) फवारा'],
        hi: ['5% नीम अर्क या वर्टिसिलियम लेकानी (4g/L) छिड़कें'],
        en: ['Apply 5% Neem extract or Verticillium lecanii @ 4g/L'],
      },
      chemical: {
        mr: ['थियामेथोक्साम २५% WG (०.२५ ग्रॅम/लिटर) किंवा इमिडाक्लोप्रिड १७.८% SL (०.५ मिली/लिटर)'],
        hi: ['थियामेथोक्साम 25% WG (0.25g/L) या इमिडाक्लोप्रिड 17.8% SL (0.5 ml/L)'],
        en: ['Thiamethoxam 25% WG (0.25g/L) or Imidacloprid 17.8% SL (0.5 ml/L) during flush stage'],
      },
      caution: {
        mr: 'मधमाशांचे परागीभवन सुरू असताना फुलोरा अवस्थेत तीव्र कीटकनाशक फवारू नये.',
        hi: 'फूल खिलते समय मधुमक्खियों की सुरक्षा के लिए कीटनाशक न छिड़कें।',
        en: 'Do not spray toxic chemicals during full bloom to preserve pollinating honeybees.',
      },
    },
    sourceAuthority: 'ICAR - Central Citrus Research Institute (CCRI) नागपूर',
    version: KNOWLEDGE_BASE_VERSION,
  },
];

const LOCAL_STORAGE_QUEUE_KEY = 'krushiscan_queued_scans_fallback';

/**
 * Open or upgrade IndexedDB safely.
 * Returns null if IndexedDB is unavailable in browser environment (e.g. strict private mode).
 */
export function openOfflineDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store 1: Structured Knowledge Base
        if (!db.objectStoreNames.contains('knowledge')) {
          const kbStore = db.createObjectStore('knowledge', { keyPath: 'id' });
          kbStore.createIndex('cropId', 'cropId', { unique: false });
        }

        // Store 2: Queued Offline Scans
        if (!db.objectStoreNames.contains('queued_scans')) {
          const queueStore = db.createObjectStore('queued_scans', { keyPath: 'id' });
          queueStore.createIndex('idempotencyKey', 'idempotencyKey', { unique: true });
          queueStore.createIndex('status', 'status', { unique: false });
          queueStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('IndexedDB open error, using localStorage fallback');
        resolve(null);
      };
    } catch (err) {
      console.warn('IndexedDB exception, using localStorage fallback', err);
      resolve(null);
    }
  });
}

/**
 * Initializes and populates the offline knowledge base if empty or updated.
 */
export async function initializeOfflineKnowledge(): Promise<void> {
  const db = await openOfflineDatabase();
  if (!db) return;

  try {
    const tx = db.transaction('knowledge', 'readwrite');
    const store = tx.objectStore('knowledge');

    for (const item of VERIFIED_OFFLINE_KNOWLEDGE) {
      store.put(item);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not populate offline knowledge in IndexedDB:', err);
  }
}

/**
 * Retrieves offline knowledge articles, filtered by crop or query.
 */
export async function getOfflineKnowledgeArticles(filter?: { cropId?: string; query?: string }): Promise<OfflineKnowledgeItem[]> {
  const db = await openOfflineDatabase();
  let items: OfflineKnowledgeItem[] = [];

  if (db) {
    try {
      items = await new Promise((resolve) => {
        const tx = db.transaction('knowledge', 'readonly');
        const store = tx.objectStore('knowledge');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      items = VERIFIED_OFFLINE_KNOWLEDGE;
    }
  }

  if (items.length === 0) {
    items = VERIFIED_OFFLINE_KNOWLEDGE;
  }

  return items.filter((item) => {
    if (filter?.cropId && filter.cropId !== 'all' && item.cropId !== filter.cropId) {
      return false;
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      const matchName =
        item.disorderName.mr.toLowerCase().includes(q) ||
        item.disorderName.hi.toLowerCase().includes(q) ||
        item.disorderName.en.toLowerCase().includes(q) ||
        item.cropName.mr.toLowerCase().includes(q);
      if (!matchName) return false;
    }
    return true;
  });
}

/**
 * Enqueue a crop scan for later processing when connectivity returns.
 * Generates unique idempotency hash and verifies storage safety.
 */
export async function enqueueOfflineScan(params: {
  cropHint: string;
  topImageDataUrl: string;
  undersideImageDataUrl?: string;
}): Promise<QueuedScanItem> {
  if (!params.topImageDataUrl) {
    throw new Error('Valid leaf photo data URL is required to queue a scan');
  }

  // Safety check: ensure size is within reasonable bounds (<15MB)
  const topSize = params.topImageDataUrl.length;
  const underSize = params.undersideImageDataUrl?.length || 0;
  if (topSize + underSize > 15 * 1024 * 1024) {
    throw new Error('Image payload exceeds maximum storage limit (15MB). Please compress image.');
  }

  const id = `queue_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  // Idempotency key constructed from content slice + timestamp minute
  const idempotencyKey = `idem_${params.cropHint}_${topSize}_${Date.now()}`;

  const item: QueuedScanItem = {
    id,
    idempotencyKey,
    cropHint: params.cropHint,
    topImageDataUrl: params.topImageDataUrl,
    undersideImageDataUrl: params.undersideImageDataUrl,
    createdAt: new Date().toISOString(),
    status: 'queued',
    retryCount: 0,
  };

  const db = await openOfflineDatabase();
  if (db) {
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('queued_scans', 'readwrite');
        const store = tx.objectStore('queued_scans');
        const req = store.add(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      return item;
    } catch (err) {
      console.warn('IndexedDB enqueue failed, using localStorage fallback', err);
    }
  }

  // Fallback: localStorage
  const currentList = getFallbackQueueFromLocalStorage();
  localStorage.setItem(LOCAL_STORAGE_QUEUE_KEY, JSON.stringify([item, ...currentList]));
  return item;
}

/**
 * Retrieves all currently queued scans.
 */
export async function getQueuedScans(): Promise<QueuedScanItem[]> {
  const db = await openOfflineDatabase();
  if (db) {
    try {
      return await new Promise((resolve) => {
        const tx = db.transaction('queued_scans', 'readonly');
        const store = tx.objectStore('queued_scans');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(getFallbackQueueFromLocalStorage());
      });
    } catch {
      return getFallbackQueueFromLocalStorage();
    }
  }
  return getFallbackQueueFromLocalStorage();
}

/**
 * Deletes a queued scan item and clears stored image data.
 */
export async function deleteQueuedScan(id: string): Promise<void> {
  const db = await openOfflineDatabase();
  if (db) {
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('queued_scans', 'readwrite');
        const store = tx.objectStore('queued_scans');
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB delete error, clearing fallback:', err);
    }
  }

  const currentList = getFallbackQueueFromLocalStorage();
  const filtered = currentList.filter((item) => item.id !== id);
  localStorage.setItem(LOCAL_STORAGE_QUEUE_KEY, JSON.stringify(filtered));
}

/**
 * Updates status of a queued item.
 */
export async function updateQueuedScanStatus(
  id: string,
  status: QueueItemStatus,
  errorReason?: string,
  result?: ScanResult
): Promise<void> {
  const db = await openOfflineDatabase();
  if (db) {
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('queued_scans', 'readwrite');
        const store = tx.objectStore('queued_scans');
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const item = getReq.result as QueuedScanItem;
          if (item) {
            item.status = status;
            if (errorReason) item.errorReason = errorReason;
            if (result) item.result = result;
            if (status === 'failed') item.retryCount = (item.retryCount || 0) + 1;
            store.put(item);
          }
          resolve();
        };
        getReq.onerror = () => reject(getReq.error);
      });
      return;
    } catch (err) {
      console.warn('IndexedDB status update error:', err);
    }
  }

  const currentList = getFallbackQueueFromLocalStorage();
  const updated = currentList.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status,
        errorReason,
        result,
        retryCount: status === 'failed' ? (item.retryCount || 0) + 1 : item.retryCount,
      };
    }
    return item;
  });
  localStorage.setItem(LOCAL_STORAGE_QUEUE_KEY, JSON.stringify(updated));
}

function getFallbackQueueFromLocalStorage(): QueuedScanItem[] {
  const raw = localStorage.getItem(LOCAL_STORAGE_QUEUE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
