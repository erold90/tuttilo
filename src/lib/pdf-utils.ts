"use client";

import { PDFDocument } from "pdf-lib";

let pdfjsReady: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
  if (pdfjsReady) return pdfjsReady;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.mjs`;
  pdfjsReady = lib;
  return lib;
}

/**
 * Load a PDF robustly: tries pdf-lib first, falls back to pdfjs-dist
 * reconstruction for PDFs that pdf-lib can't parse (XRef streams, ObjStm, etc.).
 * The fallback renders pages as JPEG images in a new PDF — text selectability is lost.
 */
export async function loadPdfRobust(
  bytes: ArrayBuffer | Uint8Array
): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes, {
      ignoreEncryption: true,
      capNumbers: true,
    });
  } catch {
    return reconstructPdf(bytes);
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
  bytes: ArrayBuffer | Uint8Array
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
  }

  srcDoc.destroy();
  return newDoc;
}
