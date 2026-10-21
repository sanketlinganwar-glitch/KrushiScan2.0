import {
  calculateAspectRatioFit,
  formatBytes,
  validateImageFile,
  validateImageContent,
  getLocalizedBlankImageError,
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

// Test 10: validateImageContent rejects empty source
async function testImageContentValidation() {
  const emptyRes = await validateImageContent('', 'mr');
  assert.strictEqual(emptyRes.valid, false);
  assert.strictEqual(emptyRes.reasonCode, 'EMPTY_FILE');
  console.log('✅ Test 10 Passed: validateImageContent rejects empty input as EMPTY_FILE.');

  // Test 11: validateImageContent rejects 1x1 transparent GIF
  const transparentGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const transRes = await validateImageContent(transparentGif, 'mr');
  assert.strictEqual(transRes.valid, false);
  assert.strictEqual(transRes.reasonCode, 'TRANSPARENT_BLANK');
  console.log('✅ Test 11 Passed: validateImageContent detects 1x1 transparent GIF as TRANSPARENT_BLANK.');

  // Test 12: validateImageContent on valid synthetic leaf dataURL
  const validLeaf = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==';
  const leafRes = await validateImageContent(validLeaf, 'en');
  assert.strictEqual(leafRes.valid, true);
  console.log('✅ Test 12 Passed: validateImageContent accepts valid crop leaf image.');

  // Test 13: Standard localized error messages
  const enMsg = getLocalizedBlankImageError('en');
  assert.strictEqual(
    enMsg,
    'Photo could not be analyzed because the image appears blank or unreadable. Please take a clear photo of the affected leaf in good lighting and try again.'
  );
  console.log('✅ Test 13 Passed: getLocalizedBlankImageError matches required domain standard.');
}

testImageContentValidation().then(() => {
  console.log('🎉 ALL 13 IMAGE COMPRESSION & VALIDATION UNIT TESTS PASSED ACCURATELY!\n');
}).catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
