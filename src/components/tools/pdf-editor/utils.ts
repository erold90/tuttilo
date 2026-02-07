import { configurePdfjsWorker } from "@/lib/pdf-utils";

let pdfjsReady: typeof import("pdfjs-dist") | null = null;

export async function getPdfjs() {
  if (pdfjsReady) return pdfjsReady;
  const lib = await import("pdfjs-dist");
  configurePdfjsWorker(lib);
  pdfjsReady = lib;
  return lib;
}

export function hexToRgb(hex: string) {
  const v = parseInt(hex.replace("#", ""), 16);
  return { r: ((v >> 16) & 255) / 255, g: ((v >> 8) & 255) / 255, b: (v & 255) / 255 };
}

export function canvasToPdf(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  scale: number,
  pageH: number
) {
  const rect = canvas.getBoundingClientRect();
  const ratioX = canvas.width / rect.width;
  const ratioY = canvas.height / rect.height;
  const cx = (clientX - rect.left) * ratioX;
  const cy = (clientY - rect.top) * ratioY;
  return {
    cx,
    cy,
    pdfX: cx / scale,
    pdfY: pageH - cy / scale,
  };
}

let _idCounter = 0;
export function uid() {
  return `ann_${Date.now()}_${++_idCounter}`;
}
