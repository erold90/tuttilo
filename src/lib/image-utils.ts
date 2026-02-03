// ============================================================================
// Tuttilo - Image Utilities
// Shared functions for all image tools: loading, conversion, cleanup, download
// jSquash WASM codecs for high-quality compression (MozJPEG, OxiPNG, WebP, AVIF)
// Canvas API as fallback
// ============================================================================

// ============================================================================
// Format detection via magic bytes
// ============================================================================

export interface DetectedFormat {
  mime: string;
  label: string;
  ext: string;
}

/**
 * Detect image format by reading file magic bytes.
 * More reliable than file.type which depends on the OS/extension.
 */
export async function detectImageFormat(file: File): Promise<DetectedFormat | null> {
  const buffer = await file.slice(0, 16).arrayBuffer();
  const b = new Uint8Array(buffer);

  // JPEG: FF D8 FF
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) {
    return { mime: "image/jpeg", label: "JPEG", ext: "jpg" };
  }
  // PNG: 89 50 4E 47
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) {
    return { mime: "image/png", label: "PNG", ext: "png" };
  }
  // GIF: 47 49 46 38
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) {
    return { mime: "image/gif", label: "GIF", ext: "gif" };
  }
  // BMP: 42 4D
  if (b[0] === 0x42 && b[1] === 0x4D) {
    return { mime: "image/bmp", label: "BMP", ext: "bmp" };
  }
  // WebP: RIFF....WEBP
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    return { mime: "image/webp", label: "WebP", ext: "webp" };
  }
  // TIFF: little-endian or big-endian
  if ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2A && b[3] === 0x00) ||
      (b[0] === 0x4D && b[1] === 0x4D && b[2] === 0x00 && b[3] === 0x2A)) {
    return { mime: "image/tiff", label: "TIFF", ext: "tiff" };
  }
  // HEIC/AVIF: ftyp box at offset 4
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) {
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11]);
    if (brand === "avif" || brand === "avis") {
      return { mime: "image/avif", label: "AVIF", ext: "avif" };
    }
    if (brand === "heic" || brand === "heix" || brand === "hevc" || brand === "mif1") {
      return { mime: "image/heic", label: "HEIC", ext: "heic" };
    }
  }
  // ICO: 00 00 01 00
  if (b[0] === 0x00 && b[1] === 0x00 && b[2] === 0x01 && b[3] === 0x00) {
    return { mime: "image/x-icon", label: "ICO", ext: "ico" };
  }
  // SVG: text-based
  const text = await file.slice(0, 500).text();
  if (text.includes("<svg") || (text.includes("<?xml") && text.includes("<svg"))) {
    return { mime: "image/svg+xml", label: "SVG", ext: "svg" };
  }
  // Fallback: trust file.type
  if (file.type && file.type.startsWith("image/")) {
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    return { mime: file.type, label: ext.toUpperCase(), ext };
  }
  return null;
}

// ============================================================================
// Core helpers
// ============================================================================

/**
 * Load a File into an HTMLImageElement.
 * Returns the loaded image + an object URL that MUST be revoked by the caller.
 */
export function loadImage(file: File | Blob): Promise<{ img: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/**
 * Convert a canvas to a Blob using toBlob (async, memory-efficient).
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string = "image/jpeg",
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob returned null"));
      },
      mime,
      quality
    );
  });
}

/**
 * Free canvas GPU memory by zeroing dimensions.
 */
export function cleanupCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Format bytes to human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Trigger a browser download for a blob URL or data URL.
 */
export function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

/**
 * Revoke multiple object URLs safely (skips empty/null values).
 */
export function revokeUrls(...urls: (string | null | undefined)[]) {
  for (const url of urls) {
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
  }
}

// ============================================================================
// Canvas helpers
// ============================================================================

/**
 * Draw a file onto a canvas and return raw ImageData.
 */
async function fileToImageData(file: File | Blob): Promise<{ imageData: ImageData; width: number; height: number }> {
  const { img, url } = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  cleanupCanvas(canvas);
  URL.revokeObjectURL(url);
  return { imageData, width: img.width, height: img.height };
}

// ============================================================================
// jSquash WASM codecs — lazy loaded
// ============================================================================

async function encodeWithJsquashJpeg(imageData: ImageData, quality: number): Promise<ArrayBuffer> {
  const { encode } = await import("@jsquash/jpeg");
  return encode(imageData, { quality: Math.round(quality * 100) });
}

async function encodeWithJsquashPng(imageData: ImageData): Promise<ArrayBuffer> {
  const { encode } = await import("@jsquash/png");
  return encode(imageData);
}

async function encodeWithJsquashWebp(imageData: ImageData, quality: number): Promise<ArrayBuffer> {
  const { encode } = await import("@jsquash/webp");
  return encode(imageData, { quality: Math.round(quality * 100) });
}

// AVIF encoding not available — @jsquash/avif WASM incompatible with edge runtime
// AVIF input decoding is supported natively by modern browsers

// ============================================================================
// BMP encoding — manual encoding for BMP output format
// ============================================================================

/**
 * Encode ImageData as a BMP file (24-bit, uncompressed).
 * BMP is a simple format: 14-byte file header + 40-byte info header + raw BGR pixels.
 */
export function encodeBmp(imageData: ImageData): Blob {
  const { width, height, data } = imageData;
  const rowSize = Math.ceil((width * 3) / 4) * 4; // rows padded to 4-byte boundary
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // File header (14 bytes)
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4D); // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true); // reserved
  view.setUint32(10, 54, true); // pixel data offset

  // Info header — BITMAPINFOHEADER (40 bytes)
  view.setUint32(14, 40, true); // header size
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true); // color planes
  view.setUint16(28, 24, true); // bits per pixel
  view.setUint32(30, 0, true); // compression (BI_RGB = none)
  view.setUint32(34, pixelDataSize, true);
  view.setUint32(38, 2835, true); // horizontal resolution (72 DPI)
  view.setUint32(42, 2835, true); // vertical resolution (72 DPI)
  view.setUint32(46, 0, true); // colors in palette
  view.setUint32(50, 0, true); // important colors

  // Pixel data (BGR, bottom-to-top row order)
  const bytes = new Uint8Array(buffer);
  for (let y = 0; y < height; y++) {
    const srcRow = (height - 1 - y) * width * 4; // BMP is bottom-up
    const dstRow = 54 + y * rowSize;
    for (let x = 0; x < width; x++) {
      const si = srcRow + x * 4;
      const di = dstRow + x * 3;
      bytes[di] = data[si + 2];     // B
      bytes[di + 1] = data[si + 1]; // G
      bytes[di + 2] = data[si];     // R
    }
  }

  return new Blob([buffer], { type: "image/bmp" });
}

// ============================================================================
// Compression — jSquash primary, Canvas fallback
// ============================================================================

export interface CompressOptions {
  quality: number; // 0-1
  onProgress?: (percent: number) => void;
}

/**
 * Compress an image using jSquash WASM codecs (MozJPEG, OxiPNG, WebP).
 * Falls back to Canvas API if WASM fails to load.
 */
export async function compressImage(
  file: File,
  opts: CompressOptions
): Promise<Blob> {
  const { quality, onProgress } = opts;

  onProgress?.(10);

  try {
    // Try jSquash WASM encoding
    const { imageData } = await fileToImageData(file);
    onProgress?.(40);

    let buffer: ArrayBuffer;
    let mime: string;

    if (file.type === "image/png") {
      // PNG is lossless — always convert to JPEG for real compression
      // (OxiPNG re-encoding barely reduces file size)
      buffer = await encodeWithJsquashJpeg(imageData, quality);
      mime = "image/jpeg";
    } else if (file.type === "image/webp") {
      buffer = await encodeWithJsquashWebp(imageData, quality);
      mime = "image/webp";
    } else {
      // JPEG default
      buffer = await encodeWithJsquashJpeg(imageData, quality);
      mime = "image/jpeg";
    }

    onProgress?.(90);
    const blob = new Blob([buffer], { type: mime });
    onProgress?.(100);
    return blob;
  } catch {
    // Fallback: Canvas API
    onProgress?.(30);
    const { img, url } = await loadImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;

    // PNG → always JPEG for real compression; WebP stays WebP
    const outputMime = file.type === "image/webp" ? "image/webp" : "image/jpeg";

    if (outputMime === "image/jpeg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);

    onProgress?.(60);
    const blob = await canvasToBlob(canvas, outputMime, quality);

    cleanupCanvas(canvas);
    URL.revokeObjectURL(url);

    onProgress?.(100);
    return blob;
  }
}

// ============================================================================
// Format conversion — jSquash primary, Canvas fallback
// Supports output: JPEG, PNG, WebP, AVIF
// Supports input: anything the browser can decode + HEIC via heic2any
// ============================================================================

/**
 * Convert an image file to a different format.
 * Uses jSquash WASM for encoding (higher quality), Canvas API as fallback.
 * Handles HEIC input via heic2any pre-decoding.
 * Handles white background for JPEG output (no transparency).
 */
export async function convertImageFormat(
  file: File | Blob,
  targetMime: string,
  opts?: { quality?: number; isHeic?: boolean }
): Promise<{ blob: Blob; url: string }> {
  const quality = opts?.quality ?? 0.92;

  // Pre-decode HEIC if needed
  let sourceFile: File | Blob = file;
  if (opts?.isHeic) {
    const heic2any = (await import("heic2any")).default;
    const result = await heic2any({ blob: file, toType: "image/png", quality: 1 });
    sourceFile = Array.isArray(result) ? result[0] : result;
  }

  // BMP output — custom encoder (Canvas doesn't support BMP)
  if (targetMime === "image/bmp") {
    const { img, url: srcUrl } = await loadImage(sourceFile);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    cleanupCanvas(canvas);
    URL.revokeObjectURL(srcUrl);
    const blob = encodeBmp(imageData);
    return { blob, url: URL.createObjectURL(blob) };
  }

  try {
    // jSquash path
    const { img, url: srcUrl } = await loadImage(sourceFile);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;

    // White background for JPEG (no transparency)
    if (targetMime === "image/jpeg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    cleanupCanvas(canvas);
    URL.revokeObjectURL(srcUrl);

    let buffer: ArrayBuffer;
    if (targetMime === "image/jpeg") {
      buffer = await encodeWithJsquashJpeg(imageData, quality);
    } else if (targetMime === "image/webp") {
      buffer = await encodeWithJsquashWebp(imageData, quality);
    } else {
      buffer = await encodeWithJsquashPng(imageData);
    }

    const blob = new Blob([buffer], { type: targetMime });
    return { blob, url: URL.createObjectURL(blob) };
  } catch {
    // Fallback: Canvas API (no AVIF fallback — canvas doesn't support it)
    if (targetMime === "image/avif") {
      throw new Error("AVIF encoding failed. Your browser may not support this format.");
    }

    const { img, url: srcUrl } = await loadImage(sourceFile);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;

    if (targetMime === "image/jpeg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);

    const blob = await canvasToBlob(canvas, targetMime, quality);
    const resultUrl = URL.createObjectURL(blob);

    cleanupCanvas(canvas);
    URL.revokeObjectURL(srcUrl);

    return { blob, url: resultUrl };
  }
}
