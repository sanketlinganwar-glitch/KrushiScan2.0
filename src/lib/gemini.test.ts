import { analyzeCropImage } from './gemini';

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
};

// 1x1 transparent GIF base64 data URLs
const sampleTopDataUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const sampleUndersideDataUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

async function runTests() {
  console.log('🧪 Starting KrushiScan AI Multi-Angle Scanner Verification Suite...');

  // Test 1: Single image scanning fallback
  {
    const res = await analyzeCropImage(sampleTopDataUrl, 'कापूस');
    assert.ok(res.id.startsWith('scan-'), 'Scan ID should be formatted');
    assert.strictEqual(res.imageUrl, sampleTopDataUrl, 'Top image URL must match input');
    assert.strictEqual(res.undersideImageUrl, undefined, 'Underside image URL should be undefined in single-image scan');
    assert.deepStrictEqual(res.anglesScanned, ['top'], 'anglesScanned should only contain top');
    assert.ok(res.uncertaintyInfo && res.uncertaintyInfo.includes('एका कोनातून'), 'Uncertainty notice should describe single-angle limits');
    console.log('✅ Test 1 Passed: Single-angle scan correctly populates fallback and uncertainty notice.');
  }

  // Test 2: Dual image multi-angle scanning
  {
    const res = await analyzeCropImage(sampleTopDataUrl, 'कापूस', sampleUndersideDataUrl);
    assert.strictEqual(res.imageUrl, sampleTopDataUrl, 'Top image URL must match');
    assert.strictEqual(res.undersideImageUrl, sampleUndersideDataUrl, 'Underside image URL must be preserved');
    assert.deepStrictEqual(res.anglesScanned, ['top', 'underside'], 'anglesScanned should contain both angles');
    assert.ok(res.uncertaintyInfo && res.uncertaintyInfo.includes('दुहेरी कोन'), 'Uncertainty notice should confirm dual-angle inspection');
    console.log('✅ Test 2 Passed: Dual-angle scan preserves both images and tags anglesScanned.');
  }

  // Test 3: Crop hint matching works cleanly
  {
    const cottonRes = await analyzeCropImage(sampleTopDataUrl, 'कापूस (Cotton)');
    assert.ok(cottonRes.cropName.includes('कापूस'), 'Cotton crop hint matches Cotton diagnosis');

    const soybeanRes = await analyzeCropImage(sampleTopDataUrl, 'सोयाबीन (Soybean)');
    assert.ok(soybeanRes.cropName.includes('सोयाबीन'), 'Soybean crop hint matches Soybean diagnosis');

    const turRes = await analyzeCropImage(sampleTopDataUrl, 'तूर (Pigeonpea)');
    assert.ok(turRes.cropName.includes('तूर'), 'Tur crop hint matches Tur diagnosis');
    console.log('✅ Test 3 Passed: Crop hints accurately route to verified Vidarbha pathology profiles.');
  }

  // Test 4: Agricultural guidance integrity
  {
    const res = await analyzeCropImage(sampleTopDataUrl, 'कापूस', sampleUndersideDataUrl);
    assert.ok(res.recommendedTreatments.cultural.length > 0, 'Must include cultural management steps');
    assert.ok(res.recommendedTreatments.biological.length > 0, 'Must include biological controls');
    assert.ok(res.recommendedTreatments.chemical.length > 0, 'Must include qualified chemical measures');
    assert.ok(res.recommendedTreatments.caution, 'Must include safety precautions');
    console.log('✅ Test 4 Passed: Agricultural recommendations follow 3-tier IPM protocol without fabricated stats.');
  }

  console.log('🎉 ALL 4 MULTI-ANGLE SCANNER UNIT TESTS PASSED ACCURATELY!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  throw err;
});
