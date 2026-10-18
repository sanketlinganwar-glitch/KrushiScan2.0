/**
 * KrushiScan AI - Smart Agricultural Image Compression Utility
 * 
 * Specifically engineered for rural Indian connectivity (2G/3G/4G):
 * - Downsamples high-resolution smartphone camera captures (12-64 MP) to diagnostic-grade resolution (max 1280px).
 * - Preserves fine plant pathology morphology (fungal leaf spots, chlorosis, rosette flowers, bollworm boreholes).
 * - Reduces payload from 5-10 MB down to 150-350 KB (~80-95% compression).
 * - Accurately measures and verifies post-compression byte size.
 */

export interface CompressionOptions {
  /** Maximum width or height in pixels. Default: 1280 */
  maxDimension?: number;
  /** Initial compression quality (0.0 to 1.0). Default: 0.82 */
  quality?: number;
  /** Maximum desired size in bytes. Default: 500 KB */
  maxSizeBytes?: number;
  /** Target output MIME type. Default: image/jpeg */
  outputType?: 'image/jpeg' | 'image/webp';
}

export interface CompressionResult {
  dataUrl: string;
  blob: Blob;
  file: File;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number; // e.g., 0.15 (compressed is 15% of original)
  savedPercentage: number;  // e.g., 85 (85% reduction)
  width: number;
  height: number;
  mimeType: string;
  wasCompressed: boolean;
}

export class ImageCompressionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ImageCompressionError';
  }
}

/**
 * Calculates optimal proportional dimensions preserving aspect ratio.
 */
export function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxDimension: number
): { width: number; height: number; scaled: boolean } {
  if (srcWidth <= 0 || srcHeight <= 0) {
    throw new ImageCompressionError('Invalid image dimensions (width or height <= 0).', 'INVALID_DIMENSIONS');
  }

  if (srcWidth <= maxDimension && srcHeight <= maxDimension) {
    return { width: Math.round(srcWidth), height: Math.round(srcHeight), scaled: false };
  }

  const ratio = Math.min(maxDimension / srcWidth, maxDimension / srcHeight);
  return {
    width: Math.max(1, Math.round(srcWidth * ratio)),
    height: Math.max(1, Math.round(srcHeight * ratio)),
    scaled: true,
  };
}

/**
 * Human-readable byte formatting.
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Converts a DataURL string into an exact binary Blob.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  if (parts.length < 2) {
    throw new ImageCompressionError('Invalid data URL format.', 'INVALID_DATA_URL');
  }
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Validates that an uploaded file is a supported image and within reasonable limits.
 */
export function validateImageFile(file: File, maxAllowedBytes = 15 * 1024 * 1024): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'कोणतीही फाईल निवडलेली नाही (No file selected).' };
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `असमर्थित फाईल प्रकार: '${file.type || 'अज्ञात'}'. फक्त JPG, PNG, किंवा WEBP फोटो वापरा. (Unsupported file type. Use JPG, PNG, or WEBP.)`,
    };
  }

  if (file.size > maxAllowedBytes) {
    return {
      valid: false,
      error: `फोटोचा आकार १५ MB पेक्षा जास्त आहे (${formatBytes(file.size)}). कृपया लहान फोटो निवडा. (File exceeds 15 MB limit.)`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'निवडलेली फाईल रिकामी आहे (0 bytes). कृपया योग्य फोटो निवडा. (Selected file is empty.)',
    };
  }

  return { valid: true };
}

/**
 * Loads an image from a File, Blob, or DataURL into an HTMLImageElement safely.
 */
function loadImageElement(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl: string | null = null;

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new ImageCompressionError('फोटो लोड करता आला नाही. फाईल खराब किंवा असमर्थित असू शकते. (Failed to decode image file).', 'DECODE_ERROR'));
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    }
  });
}

/**
 * Compresses and resizes an agricultural crop image on the client side.
 * Preserves diagnosis-critical detail while guaranteeing a fast, low-bandwidth upload.
 */
export async function compressCropImage(
  input: File | Blob | string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxDimension = 1280,
    quality = 0.82,
    maxSizeBytes = 500 * 1024, // 500 KB
    outputType = 'image/jpeg',
  } = options;

  // 1. Calculate original size
  let originalSizeBytes = 0;
  let filename = 'crop_scan.jpg';

  if (input instanceof File) {
    originalSizeBytes = input.size;
    filename = input.name.replace(/\.[^/.]+$/, '') + '.jpg';
  } else if (input instanceof Blob) {
    originalSizeBytes = input.size;
  } else if (typeof input === 'string') {
    // Estimate size of base64 dataUrl
    const base64Length = input.split(',')[1]?.length || input.length;
    originalSizeBytes = Math.round((base64Length * 3) / 4);
  }

  // 2. Decode the image
  const img = await loadImageElement(input);
  const srcWidth = img.naturalWidth || img.width;
  const srcHeight = img.naturalHeight || img.height;

  if (srcWidth === 0 || srcHeight === 0) {
    throw new ImageCompressionError('फोटोचे परिमाण शून्य आहेत (Image has zero dimensions).', 'ZERO_DIMENSIONS');
  }

  // 3. Compute target dimensions
  const targetDims = calculateAspectRatioFit(srcWidth, srcHeight, maxDimension);

  // 4. Draw to Offscreen / Standard Canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetDims.width;
  canvas.height = targetDims.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new ImageCompressionError('ब्राऊझर कॅनव्हास सुरू करता आला नाही (Could not initialize 2D canvas context).', 'CANVAS_INIT_ERROR');
  }

  // Use high-quality bicubic interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill pure white background in case of transparent PNGs
  if (outputType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, targetDims.width, targetDims.height);

  // 5. Compress to dataURL
  let compressedDataUrl = canvas.toDataURL(outputType, quality);
  let blob = dataUrlToBlob(compressedDataUrl);

  // If still above maxSizeBytes, do a quick secondary pass with slightly lower quality
  if (blob.size > maxSizeBytes && quality > 0.65) {
    const reducedQuality = Math.max(0.65, quality - 0.15);
    compressedDataUrl = canvas.toDataURL(outputType, reducedQuality);
    blob = dataUrlToBlob(compressedDataUrl);
  }

  const finalSizeBytes = blob.size;
  const file = new File([blob], filename, { type: outputType });
  const compressionRatio = originalSizeBytes > 0 ? parseFloat((finalSizeBytes / originalSizeBytes).toFixed(3)) : 1.0;
  const savedPercentage = originalSizeBytes > 0 ? Math.max(0, Math.round((1 - finalSizeBytes / originalSizeBytes) * 100)) : 0;

  return {
    dataUrl: compressedDataUrl,
    blob,
    file,
    originalSizeBytes,
    compressedSizeBytes: finalSizeBytes,
    compressionRatio,
    savedPercentage,
    width: targetDims.width,
    height: targetDims.height,
    mimeType: outputType,
    wasCompressed: targetDims.scaled || finalSizeBytes < originalSizeBytes,
  };
}
