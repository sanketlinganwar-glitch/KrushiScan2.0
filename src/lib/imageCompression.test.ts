import {
  calculateAspectRatioFit,
  formatBytes,
  validateImageFile,
  dataUrlToBlob,
  ImageCompressionError,
} from './imageCompression';

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
  throws(fn: () => void, check?: (err: any) => boolean) {
    let threw = false;
    try {
      fn();
    } catch (err) {
      threw = true;
      if (check && !check(err)) {
        throw new Error('Threw unexpected error: ' + err);
      }
    }
    if (!threw) {
      throw new Error('Expected function to throw, but it did not.');
    }
  },
};

console.log('🧪 Starting KrushiScan AI Image Compression Verification Suite...');

// Test 1: Aspect Ratio Fit - Landscape
{
  const res = calculateAspectRatioFit(4032, 3024, 1280);
  assert.strictEqual(res.width, 1280, 'Landscape width should be 1280');
  assert.strictEqual(res.height, 960, 'Landscape height should be 960');
  assert.strictEqual(res.scaled, true, 'Should be flagged as scaled');
  console.log('✅ Test 1 Passed: 4032x3024 12MP photo correctly scaled to 1280x960.');
}

// Test 2: Aspect Ratio Fit - Portrait
{
  const res = calculateAspectRatioFit(3000, 4000, 1280);
  assert.strictEqual(res.width, 960, 'Portrait width should be 960');
  assert.strictEqual(res.height, 1280, 'Portrait height should be 1280');
  assert.strictEqual(res.scaled, true, 'Should be flagged as scaled');
  console.log('✅ Test 2 Passed: 3000x4000 portrait photo correctly scaled to 960x1280.');
}

// Test 3: Aspect Ratio Fit - Already smaller than max dimension
{
  const res = calculateAspectRatioFit(800, 600, 1280);
  assert.strictEqual(res.width, 800, 'Width should remain 800');
  assert.strictEqual(res.height, 600, 'Height should remain 600');
  assert.strictEqual(res.scaled, false, 'Should not be flagged as scaled');
  console.log('✅ Test 3 Passed: 800x600 image remains unscaled.');
}

// Test 4: Aspect Ratio Fit - Square Image
{
  const res = calculateAspectRatioFit(2048, 2048, 1280);
  assert.strictEqual(res.width, 1280);
  assert.strictEqual(res.height, 1280);
  assert.strictEqual(res.scaled, true);
  console.log('✅ Test 4 Passed: 2048x2048 square photo scaled to 1280x1280.');
}

// Test 5: Invalid Dimensions
{
  assert.throws(
    () => calculateAspectRatioFit(0, 500, 1280),
    (err: any) => err instanceof ImageCompressionError && err.code === 'INVALID_DIMENSIONS'
  );
  console.log('✅ Test 5 Passed: Zero or negative dimensions cleanly throw ImageCompressionError.');
}

// Test 6: Human-Readable Byte Formatting
{
  assert.strictEqual(formatBytes(0), '0 B');
  assert.strictEqual(formatBytes(1024), '1 KB');
  assert.strictEqual(formatBytes(512 * 1024), '512 KB');
  assert.strictEqual(formatBytes(3.5 * 1024 * 1024), '3.5 MB');
  console.log('✅ Test 6 Passed: formatBytes correctly formats B, KB, and MB.');
}

// Test 7: Image File Validation - Supported Formats
{
  const mockJpg = { name: 'cotton_leaf.jpg', type: 'image/jpeg', size: 2 * 1024 * 1024 } as any;
  const mockPng = { name: 'soybean_rust.png', type: 'image/png', size: 1.5 * 1024 * 1024 } as any;
  const mockWebp = { name: 'bollworm.webp', type: 'image/webp', size: 800 * 1024 } as any;

  assert.strictEqual(validateImageFile(mockJpg).valid, true);
  assert.strictEqual(validateImageFile(mockPng).valid, true);
  assert.strictEqual(validateImageFile(mockWebp).valid, true);
  console.log('✅ Test 7 Passed: Valid JPEG, PNG, and WEBP formats pass validation.');
}

// Test 8: Image File Validation - Unsupported / Corrupted
{
  const mockPdf = { name: 'report.pdf', type: 'application/pdf', size: 500 * 1024 } as any;
  const mockEmpty = { name: 'empty.jpg', type: 'image/jpeg', size: 0 } as any;
  const mockTooLarge = { name: 'huge.jpg', type: 'image/jpeg', size: 20 * 1024 * 1024 } as any;

  const pdfRes = validateImageFile(mockPdf);
  assert.strictEqual(pdfRes.valid, false);
  assert.ok(pdfRes.error?.includes('असमर्थित फाईल प्रकार'));

  const emptyRes = validateImageFile(mockEmpty);
  assert.strictEqual(emptyRes.valid, false);
  assert.ok(emptyRes.error?.includes('रिकामी आहे'));

  const largeRes = validateImageFile(mockTooLarge);
  assert.strictEqual(largeRes.valid, false);
  assert.ok(largeRes.error?.includes('१५ MB'));

  console.log('✅ Test 8 Passed: PDFs, 0-byte files, and oversized files correctly rejected.');
}

// Test 9: DataURL to Blob conversion
{
  // 1x1 transparent GIF base64
  const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const blob = dataUrlToBlob(dataUrl);
  assert.strictEqual(blob.type, 'image/png');
  assert.strictEqual(blob.size, 68);
  console.log('✅ Test 9 Passed: dataUrlToBlob correctly creates typed binary Blob with exact byte count.');
}

console.log('🎉 ALL 9 IMAGE COMPRESSION UNIT TESTS PASSED ACCURATELY!\n');
