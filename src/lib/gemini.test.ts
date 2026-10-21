import { analyzeCropImage } from './gemini';
import { getLocalizedBlankImageError } from './imageCompression';

const assert = {
  strictEqual(actual: any, expected: any, message?: string) {
    if (actual !== expected) {
      throw new Error(`Assertion Failed: ${actual} !== ${expected}. ${message || ''}`);
    }
  },
  ok(val: any, message?: string) {
    if (!val) {
      throw new Error(`Assertion Failed: Expected truthy value. ${message || ''}`);
    }
  },
  deepStrictEqual(actual: any, expected: any, message?: string) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) {
      throw new Error(`Assertion Failed: ${a} !== ${e}. ${message || ''}`);
    }
  },
  async rejects(fn: () => Promise<any>, errorMatch?: string | RegExp) {
    let threw = false;
    let actualError: any = null;
    try {
      await fn();
    } catch (err: any) {
      threw = true;
      actualError = err;
      if (errorMatch) {
        const msg = err?.message || String(err);
        if (typeof errorMatch === 'string') {
          if (!msg.includes(errorMatch)) {
            throw new Error(`Expected error message to include '${errorMatch}', got: '${msg}'`);
          }
        } else if (!errorMatch.test(msg)) {
          throw new Error(`Expected error message to match regex ${errorMatch}, got: '${msg}'`);
        }
      }
    }
    if (!threw) {
      throw new Error('Expected promise to reject, but it resolved successfully.');
    }
    return actualError;
  },
};

// Test image fixtures
const TRANSPARENT_1X1_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// 100x100 Valid green leaf on white background (high pixel variance)
const VALID_LEAF_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKK8F8QeINah8SapFFq9/HGl5KqIly4CgOcADPArGtWVJJtGFeuqKTavc96or50/4SXXv+g3qX/gU/wDjR/wkuvf9BvUv/Ap/8a5/r0exy/2jH+U+i6K+dP8AhJde/wCg3qX/AIFP/jR/wkuvf9BvUv8AwKf/ABo+vR7B/aMf5T6Lor50/wCEl17/AKDepf8AgU/+Ner/AAxvru/8N3Et5dT3MgvGUPNIXIGxOMntyfzrWliVUlypGtHGRqz5UjtKKKK6TsCiiigAooooAK+dPEv/ACNWr/8AX7N/6Ga+i6+dPEv/ACNWr/8AX7N/6Ga4cd8KPOzH4YmXRRRXnHkhRRRQAV7H8Jv+RVuv+v1//QErxyvY/hN/yKt1/wBfr/8AoCV1YP8AinZgf4x3lFFFeqe2FFFFABRRRQAV86eJf+Rq1f8A6/Zv/QzX0XXzp4l/5GrV/wDr9m/9DNcOO+FHnZj8MTLooorzjyQooooAK9j+E3/Iq3X/AF+v/wCgJXjlex/Cb/kVbr/r9f8A9ASurB/xTswP8Y7yiiivVPbCiiigAooooAK+dPEv/I1av/1+zf8AoZr6Lri774Y6Lf6hc3kt1fiS4laVwkiAAsSTj5OnNc2JpSqJKJx4yjOrFKJ4pRXsf/CptB/5+9S/7+J/8RR/wqbQf+fvUv8Av4n/AMRXH9TqnB9RrHjlFex/8Km0H/n71L/v4n/xFH/CptB/5+9S/wC/if8AxFH1OqH1GseOV7H8Jv8AkVbr/r9f/wBASj/hU2g/8/epf9/E/wDiK6bw94etPDWnyWdnJPJG8plJmYE5IA7AcfKK2w+HnCfNI6cLhalOpzSNaiiiu89IKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/9k=';

async function runTests() {
  console.log('🧪 Starting KrushiScan AI Scanner & Anti-Fabrication Verification Suite...');

  // Test 1: Empty string image is rejected immediately
  {
    await assert.rejects(
      () => analyzeCropImage('', 'कापूस'),
      'रिकामा'
    );
    console.log('✅ Test 1 Passed: Empty image string strictly rejected without AI submission.');
  }

  // Test 2: 1x1 transparent GIF is rejected immediately as unreadable/blank
  {
    await assert.rejects(
      () => analyzeCropImage(TRANSPARENT_1X1_GIF, 'कापूस'),
      'रिकामा'
    );
    console.log('✅ Test 2 Passed: 1x1 transparent image strictly rejected (no fake Cotton diagnosis).');
  }

  // Test 3: Dual-angle scan rejects if underside image is blank
  {
    await assert.rejects(
      () => analyzeCropImage(VALID_LEAF_DATA_URL, 'कापूस', TRANSPARENT_1X1_GIF),
      'रिकामा'
    );
    console.log('✅ Test 3 Passed: Dual-angle scan rejects request when underside image is blank.');
  }

  // Test 4: Trilingual standard error messages check
  {
    const mrMsg = getLocalizedBlankImageError('mr');
    const hiMsg = getLocalizedBlankImageError('hi');
    const enMsg = getLocalizedBlankImageError('en');

    assert.ok(mrMsg.includes('रिकामा') && mrMsg.includes('अस्पष्ट'), 'Marathi error must explain blank image');
    assert.ok(hiMsg.includes('खाली') && hiMsg.includes('अस्पष्ट'), 'Hindi error must explain blank image');
    assert.ok(
      enMsg === 'Photo could not be analyzed because the image appears blank or unreadable. Please take a clear photo of the affected leaf in good lighting and try again.',
      'English error must adhere strictly to required domain specification'
    );
    console.log('✅ Test 4 Passed: Standard trilingual error messages verified across Marathi, Hindi, and English.');
  }

  // Test 5: Backend offline network failure throws honest network error (NEVER fake diagnosis)
  {
    const originalFetch = globalThis.fetch;
    // Mock network failure (offline in field)
    globalThis.fetch = async () => {
      throw new TypeError('fetch failed (network offline)');
    };

    try {
      await assert.rejects(
        () => analyzeCropImage(VALID_LEAF_DATA_URL, 'कापूस'),
        'सर्व्हरशी संपर्क होऊ शकला नाही'
      );
      console.log('✅ Test 5 Passed: Network failure throws clean offline notice, never falling back to fake Pink Bollworm diagnosis.');
    } finally {
      globalThis.fetch = originalFetch;
    }
  }

  // Test 6: Backend HTTP 400 rejection (non-plant or blank payload) surfaces clean error
  {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      ok: false,
      status: 400,
      json: async () => ({
        detail: 'कोणतेही पीक किंवा पान आढळले नाही. कृपया पिकाच्या पानाचा स्पष्ट फोटो काढून पुन्हा प्रयत्न करा.'
      }),
    } as any);

    try {
      await assert.rejects(
        () => analyzeCropImage(VALID_LEAF_DATA_URL, 'कापूस'),
        'कोणतेही पीक किंवा पान आढळले नाही'
      );
      console.log('✅ Test 6 Passed: Backend HTTP 400 non-plant rejection cleanly surfaces error without fake diagnosis.');
    } finally {
      globalThis.fetch = originalFetch;
    }
  }

  // Test 7: Genuine backend diagnosis response accurately parsed and returned
  {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url: any, init: any) => {
      // Verify formData contains file
      const body = init?.body as FormData;
      assert.ok(body && body.has('file'), 'Fetch body must contain multipart file');
      return {
        ok: true,
        status: 200,
        json: async () => ({
          crop_name: 'कापूस (Cotton)',
          crop_variety: 'BG-II Hybrid',
          disease_name: 'Bacterial Blight / करपा',
          local_disease_name: {
            mr: 'काळा कोपरा / करपा (Bacterial Blight)',
            hi: 'जीवाणु झुलसा (Bacterial Blight)',
            en: 'Bacterial Blight (Xanthomonas citri pv. malvacearum)'
          },
          severity: 'Moderate',
          confidence: 88,
          diagnosis_explanation: 'पानांवर कोनीय काळपट ठिपके (angular water-soaked lesions) दिसत आहेत.',
          symptoms: ['पानांच्या शिरांवर कोनीय ठिपके', 'पाने अकाली पिवळी पडून गळणे'],
          recommended_treatments: {
            cultural: ['रोगट पाने वेचून नष्ट करा.'],
            biological: ['स्यूडोमोनास फ्ल्यूरोसेन्स १० ग्रॅम/लिटर फवारा.'],
            chemical: ['कॉपर ऑक्सिक्लोराईड (२५ ग्रॅम) + स्ट्रेप्टोमायसीन सल्फेट (१ ग्रॅम) प्रति १० लिटर पाण्यात फवारा.'],
            caution: 'दुपारच्या प्रखर उन्हात फवारणी टाळा.'
          },
          prevention_methods: ['प्रमाणित बियाण्यांचा वापर करा.'],
          is_live_ai: true,
          angles_scanned: ['top']
        })
      } as any;
    };

    try {
      const result = await analyzeCropImage(VALID_LEAF_DATA_URL, 'कापूस');
      assert.strictEqual(result.cropName, 'कापूस (Cotton)');
      assert.strictEqual(result.diseaseName, 'Bacterial Blight / करपा');
      assert.strictEqual(result.severity, 'Moderate');
      assert.strictEqual(result.confidence, 88);
      assert.strictEqual(result.recommendedTreatments.chemical[0].includes('कॉपर ऑक्सिक्लोराईड'), true);
      console.log('✅ Test 7 Passed: Valid crop diagnosis accurately formats server AI response with authentic PDKV IPM treatments.');
    } finally {
      globalThis.fetch = originalFetch;
    }
  }

  // Test 8: Dual-angle scan preserves both images and tags anglesScanned
  {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url: any, init: any) => {
      const body = init?.body as FormData;
      assert.ok(body.has('file'), 'Main file present');
      assert.ok(body.has('file_underside'), 'Underside file present');
      return {
        ok: true,
        status: 200,
        json: async () => ({
          crop_name: 'कापूस (Cotton)',
          disease_name: 'पांढरी माशी (Whitefly)',
          severity: 'High',
          confidence: 91,
          angles_scanned: ['top', 'underside'],
          uncertainty_info: 'दुहेरी कोन तपासणी पूर्ण झाली.',
          symptoms: ['पानाच्या खालच्या बाजूला पांढरी माशी व चिकटा'],
          recommended_treatments: {
            cultural: ['पिवळे चिकट सापळे लावा.'],
            biological: ['व्हर्टिसिलियम लेकॅनी ५ ग्रॅम/लिटर.'],
            chemical: ['डायफेन्थियुरॉन ५०% WP १२ ग्रॅम प्रति १० लिटर.'],
            caution: 'सुरक्षितता किट वापरा.'
          }
        })
      } as any;
    };

    try {
      const result = await analyzeCropImage(VALID_LEAF_DATA_URL, 'कापूस', VALID_LEAF_DATA_URL);
      assert.deepStrictEqual(result.anglesScanned, ['top', 'underside']);
      assert.ok(result.undersideImageUrl !== undefined);
      console.log('✅ Test 8 Passed: Dual-angle scan correctly transmits underside image and processes multi-angle response.');
    } finally {
      globalThis.fetch = originalFetch;
    }
  }

  console.log('🎉 ALL 8 SCANNER & ANTI-FABRICATION UNIT TESTS PASSED ACCURATELY!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
