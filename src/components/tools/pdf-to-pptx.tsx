"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { configurePdfjsWorker } from "@/lib/pdf-utils";
import { PresentationChart } from "@phosphor-icons/react";
import { SafariPdfBanner } from "@/components/safari-pdf-banner";

// PptxGenJS loaded at runtime via script tag
type PptxGenJSConstructor = new () => {
  defineLayout(opts: { name: string; width: number; height: number }): void;
  layout: string;
  addSlide(): { addImage(opts: { data: string; x: number; y: number; w: number; h: number }): void };
  write(opts: { outputType: string }): Promise<Blob>;
};

/** Load PptxGenJS from its browser bundle via script tag (bypasses webpack node: scheme issue) */
function loadPptxGenJS(): Promise<PptxGenJSConstructor> {
  const w = window as unknown as Record<string, PptxGenJSConstructor>;
  if (w.PptxGenJS) return Promise.resolve(w.PptxGenJS);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "/pptxgen.min.js";
    s.onload = () => resolve(w.PptxGenJS);
    s.onerror = () => reject(new Error("Failed to load PptxGenJS"));
    document.head.appendChild(s);
  });
}

export function PdfToPptx() {
  const t = useTranslations("tools.pdf-to-pptx.ui");
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);
  const pptxReady = useRef(false);

  useEffect(() => {
    import("pdfjs-dist").then((lib) => {
      configurePdfjsWorker(lib);
      setPdfjsLib(lib);
    }).catch((err) => {
      console.error("Failed to load pdfjs-dist:", err);
    });
    loadPptxGenJS().then(() => { pptxReady.current = true; });
  }, []);

  const loadFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setError(""); setResultUrl(""); setFile(f);
  }, []);

  const convert = useCallback(async () => {
    if (!file || !pdfjsLib) return;
    setProcessing(true); setError(""); setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const PptxGenJS = await loadPptxGenJS();
      const pptx = new PptxGenJS();

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await (page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]).promise);

        const imgData = canvas.toDataURL("image/jpeg", 0.92);

        // Slide dimensions from page (convert pts to inches: 1pt = 1/72in)
        const origVp = page.getViewport({ scale: 1 });
        const wIn = origVp.width / 72;
        const hIn = origVp.height / 72;

        pptx.defineLayout({ name: `page${i}`, width: wIn, height: hIn });
        if (i === 1) pptx.layout = `page${i}`;

        const slide = pptx.addSlide();
        if (i > 1) {
          // For subsequent pages with different sizes, we add the image centered
        }
        slide.addImage({ data: imgData, x: 0, y: 0, w: wIn, h: hIn });

        canvas.width = 0; canvas.height = 0;
        setProgress(Math.round((i / doc.numPages) * 100));
      }

      doc.destroy();
      const blob = await pptx.write({ outputType: "blob" }) as Blob;
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("PDF→PPTX error:", err);
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [file, scale, pdfjsLib, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a"); a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, ".pptx"); a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setResultUrl(""); setError("");
  }, [resultUrl]);

  return (
    <div className="space-y-6">
      <SafariPdfBanner />
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf"; input.onchange = () => input.files?.[0] && loadFile(input.files[0]); input.click(); }}
        >
          <PresentationChart size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("quality")}</label>
            <div className="flex gap-2">
              {[{ v: 1, l: t("qualityNormal") }, { v: 2, l: t("qualityHigh") }, { v: 3, l: t("qualityMax") }].map(({ v, l }) => (
                <button key={v} onClick={() => setScale(v)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${scale === v ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <button onClick={convert} disabled={processing || !pdfjsLib}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {processing ? `${t("processing")} ${progress}%` : t("convert")}
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
          <p className="font-medium">{t("done")}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={download} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
            <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
          </div>
        </div>
      )}
      {error && <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>}
    </div>
  );
}
