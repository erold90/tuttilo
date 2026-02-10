"use client";

import { PDFDocument } from "pdf-lib";

let pdfjsReady: typeof import("pdfjs-dist") | null = null;

/** Detect Safari (no ES module worker support in pdfjs v5) */
function isSafariBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

/** Configure pdfjs worker — uses local worker file, disables on Safari */
export function configurePdfjsWorker(lib: typeof import("pdfjs-dist")) {
  if (isSafariBrowser()) {
    lib.GlobalWorkerOptions.workerSrc = "";
  } else {
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
}

async function getPdfjs() {
  if (pdfjsReady) return pdfjsReady;
  const lib = await import("pdfjs-dist");
  configurePdfjsWorker(lib);
  pdfjsReady = lib;
  return lib;
}

/**
 * Load a PDF robustly: tries pdf-lib first, falls back to pdfjs-dist
 * reconstruction for PDFs that pdf-lib can't parse (XRef streams, ObjStm, etc.).
 * The fallback renders pages as JPEG images in a new PDF — text selectability is lost.
 */
export async function loadPdfRobust(
  bytes: ArrayBuffer | Uint8Array,
  opts?: { onProgress?: (percent: number) => void }
): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes, {
      ignoreEncryption: true,
      capNumbers: true,
    });
  } catch {
    return reconstructPdf(bytes, opts?.onProgress);
  }
}

/**
 * Get PDF page count. Uses pdf-lib first, falls back to pdfjs-dist.
 * Lightweight — no reconstruction.
 */
export async function getPdfPageCount(
  bytes: ArrayBuffer | Uint8Array
): Promise<number> {
  try {
    const doc = await PDFDocument.load(bytes, {
      ignoreEncryption: true,
      capNumbers: true,
    });
    return doc.getPageCount();
  } catch {
    const pdfjsLib = await getPdfjs();
    const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
    const count = doc.numPages;
    doc.destroy();
    return count;
  }
}

async function reconstructPdf(
  bytes: ArrayBuffer | Uint8Array,
  onProgress?: (percent: number) => void
): Promise<PDFDocument> {
  const pdfjsLib = await getPdfjs();
  const srcDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
  const newDoc = await PDFDocument.create();

  for (let i = 1; i <= srcDoc.numPages; i++) {
    const page = await srcDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await (
      page.render({
        canvasContext: ctx,
        viewport,
        canvas,
      } as Parameters<typeof page.render>[0]).promise
    );

    const jpgBlob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b!), "image/jpeg", 0.92)
    );
    const jpgBytes = await jpgBlob.arrayBuffer();
    const img = await newDoc.embedJpg(jpgBytes);

    const origViewport = page.getViewport({ scale: 1 });
    const newPage = newDoc.addPage([origViewport.width, origViewport.height]);
    newPage.drawImage(img, {
      x: 0,
      y: 0,
      width: origViewport.width,
      height: origViewport.height,
    });

    // Free canvas memory
    canvas.width = 0;
    canvas.height = 0;

    onProgress?.(Math.round((i / srcDoc.numPages) * 100));
  }

  srcDoc.destroy();
  return newDoc;
}

/**
 * Render PDF page thumbnails as JPEG data URLs.
 * Calls onThumbnail progressively for each rendered page.
 */
export async function renderPdfThumbnails(
  bytes: ArrayBuffer | Uint8Array,
  opts?: {
    scale?: number;
    maxPages?: number;
    onThumbnail?: (index: number, dataUrl: string) => void;
  }
): Promise<string[]> {
  const pdfjsLib = await getPdfjs();
  // Always use Uint8Array to prevent ArrayBuffer detachment by pdfjs worker
  const safeBytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const doc = await pdfjsLib.getDocument({ data: safeBytes }).promise;
  const scale = opts?.scale ?? 0.3;
  const total = opts?.maxPages ? Math.min(opts.maxPages, doc.numPages) : doc.numPages;
  const thumbnails: string[] = [];

  for (let i = 1; i <= total; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await (page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]).promise);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.65);
    thumbnails.push(dataUrl);
    opts?.onThumbnail?.(i - 1, dataUrl);
    canvas.width = 0;
    canvas.height = 0;
  }

  doc.destroy();
  return thumbnails;
}
