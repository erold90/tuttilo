// ============================================================================
// Tuttilo - Image Utilities
// Shared functions for all image tools: loading, conversion, cleanup, download
// jSquash WASM codecs for high-quality compression (MozJPEG, OxiPNG, WebP)
// Canvas API as fallback
// ============================================================================

/**
 * Load a File into an HTMLImageElement.
 * Returns the loaded image + an object URL that MUST be revoked by the caller.
 */
export function loadImage(file: File): Promise<{ img: HTMLImageElement; url: string }> {
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
 * Replaces toDataURL which loads the entire image as a base64 string in memory.
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
 * Should be called after you're done with any temporary canvas.
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
async function fileToImageData(file: File): Promise<{ imageData: ImageData; width: number; height: number }> {
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
      buffer = await encodeWithJsquashPng(imageData);
      mime = "image/png";
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

    if (file.type === "image/jpeg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);

    onProgress?.(60);
    const mime = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
    const blob = await canvasToBlob(canvas, mime, quality);

    cleanupCanvas(canvas);
    URL.revokeObjectURL(url);

    onProgress?.(100);
    return blob;
  }
}

// ============================================================================
// Format conversion — jSquash primary, Canvas fallback
// ============================================================================

/**
 * Convert an image file to a different format.
 * Uses jSquash WASM for encoding (higher quality), Canvas API as fallback.
 * Handles white background for JPEG output (no transparency).
 */
export async function convertImageFormat(
  file: File,
  targetMime: string,
  opts?: { quality?: number }
): Promise<{ blob: Blob; url: string }> {
  const quality = opts?.quality ?? 0.92;

  try {
    // Try jSquash path
    const { img, url: srcUrl } = await loadImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;

    // White background for JPEG
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
    // Fallback: Canvas API
    const { img, url: srcUrl } = await loadImage(file);
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
