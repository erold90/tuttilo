"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { configurePdfjsWorker } from "@/lib/pdf-utils";
import { PresentationChart } from "@phosphor-icons/react";

type PptxGenJSConstructor = new () => {
  defineLayout(opts: { name: string; width: number; height: number }): void;
  layout: string;
  addSlide(): { addImage(opts: { data: string; x: number; y: number; w: number; h: number }): void };
  write(opts: { outputType: string }): Promise<Blob>;
};

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

type Direction = "pdf-to-pptx" | "pptx-to-pdf" | null;

export function PdfPptx() {
  const t = useTranslations("tools.pdf-pptx.ui");
  const [file, setFile] = useState<File | null>(null);
  const [direction, setDirection] = useState<Direction>(null);
  const [scale, setScale] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [slideCount, setSlideCount] = useState(0);
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);
  const pptxReady = useRef(false);
  const htmlRef = useRef("");

  useEffect(() => {
    import("pdfjs-dist").then((lib) => {
      configurePdfjsWorker(lib);
      setPdfjsLib(lib);
    }).catch((err) => {
      console.error("Failed to load pdfjs-dist:", err);
    });
    loadPptxGenJS().then(() => { pptxReady.current = true; });
  }, []);

  const loadFile = useCallback(async (f: File) => {
    setError(""); setResultUrl(""); setSlideCount(0); htmlRef.current = "";

    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    const isPptx = f.type.includes("presentationml") || /\.pptx?$/i.test(f.name);

    if (!isPdf && !isPptx) return;

    if (isPptx) {
      try {
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(await f.arrayBuffer());

        let count = 0;
        zip.folder("ppt/slides")?.forEach((path) => {
          if (/^slide\d+\.xml$/.test(path)) count++;
        });
        setSlideCount(count);

        const slides: { num: number; texts: string[] }[] = [];
        for (let i = 1; i <= count; i++) {
          const slideFile = zip.file(`ppt/slides/slide${i}.xml`);
          if (!slideFile) continue;
          const xml = await slideFile.async("text");
          const texts: string[] = [];
          const regex = /<a:t>([^<]*)<\/a:t>/g;
          let match;
          while ((match = regex.exec(xml)) !== null) {
            if (match[1].trim()) texts.push(match[1]);
          }
          slides.push({ num: i, texts });
        }

        let html = `<!DOCTYPE html><html><head><style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:Arial,sans-serif;color:#222}
          .slide{width:100%;aspect-ratio:16/9;border:1px solid #ddd;padding:40px;display:flex;flex-direction:column;justify-content:center;page-break-after:always;background:#fff;margin-bottom:20px}
          .slide:last-child{page-break-after:avoid}
          .slide-num{font-size:10px;color:#999;text-align:right;margin-bottom:8px}
          .slide-content{font-size:18px;line-height:1.6}
          .slide-content p{margin-bottom:8px}
          @page{size:landscape;margin:0.5cm}
        </style></head><body>`;

        for (const slide of slides) {
          html += `<div class="slide">`;
          html += `<div class="slide-num">${slide.num} / ${count}</div>`;
          html += `<div class="slide-content">`;
          for (const text of slide.texts) {
            html += `<p>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
          }
          if (slide.texts.length === 0) {
            html += `<p style="color:#999;font-style:italic">(Slide ${slide.num})</p>`;
          }
          html += `</div></div>`;
        }
        html += "</body></html>";
        htmlRef.current = html;
      } catch (err) {
        console.error("PPTX parse error:", err);
        setError(t("parseError"));
        return;
      }
    }

    setFile(f);
    setDirection(isPdf ? "pdf-to-pptx" : "pptx-to-pdf");
  }, [t]);

  const convertPdfToPptx = useCallback(async () => {
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
        const origVp = page.getViewport({ scale: 1 });
        const wIn = origVp.width / 72;
        const hIn = origVp.height / 72;

        pptx.defineLayout({ name: `page${i}`, width: wIn, height: hIn });
        if (i === 1) pptx.layout = `page${i}`;

        const slide = pptx.addSlide();
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

  const convertPptxToPdf = useCallback(async () => {
    if (!file || !htmlRef.current) return;
    setProcessing(true); setError(""); setProgress(0);
    try {
      const { jsPDF } = await import("jspdf");
      const container = document.createElement("div");
      container.style.cssText = "position:absolute;left:-9999px;top:0;width:960px;background:white;color:#222;font-family:Arial,sans-serif;padding:0";
      container.innerHTML = htmlRef.current.replace(/<!DOCTYPE[\s\S]*?<body>/, "").replace(/<\/body>[\s\S]*$/, "");
      document.body.appendChild(container);

      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth() - 40;

      await new Promise<void>((resolve) => {
        pdf.html(container, {
          callback: () => resolve(),
          x: 20,
          y: 20,
          width: pageW,
          windowWidth: 960,
        });
      });

      document.body.removeChild(container);
      setProgress(100);

      const blob = pdf.output("blob");
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("PPTX→PDF error:", err);
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [file, resultUrl, t]);

  const convert = useCallback(() => {
    if (direction === "pdf-to-pptx") convertPdfToPptx();
    else if (direction === "pptx-to-pdf") convertPptxToPdf();
  }, [direction, convertPdfToPptx, convertPptxToPdf]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = direction === "pdf-to-pptx"
      ? file.name.replace(/\.pdf$/i, ".pptx")
      : file.name.replace(/\.pptx?$/i, ".pdf");
    a.click();
  }, [resultUrl, file, direction]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setDirection(null); setResultUrl(""); setError("");
    setProgress(0); setSlideCount(0); htmlRef.current = "";
  }, [resultUrl]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf,.pptx,.ppt"; input.onchange = () => input.files?.[0] && loadFile(input.files[0]); input.click(); }}
        >
          <PresentationChart size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate flex-1">{file.name}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${direction === "pdf-to-pptx" ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"}`}>
                {direction === "pdf-to-pptx" ? "PDF → PPTX" : "PPTX → PDF"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
            {direction === "pptx-to-pdf" && slideCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{t("slides")}: {slideCount}</p>
            )}
          </div>

          {direction === "pdf-to-pptx" && (
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
          )}

          {direction === "pptx-to-pdf" && htmlRef.current && (
            <div className="border border-border rounded-lg overflow-hidden bg-white">
              <iframe srcDoc={htmlRef.current} className="w-full h-64 pointer-events-none" title="Preview" />
            </div>
          )}

          <button
            onClick={convert}
            disabled={processing || (direction === "pdf-to-pptx" && !pdfjsLib)}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {processing ? (progress > 0 ? `${t("processing")} ${progress}%` : t("processing")) : t("convert")}
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
          <p className="font-medium">{t("done")}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={download} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
              {t(direction === "pdf-to-pptx" ? "downloadPptx" : "downloadPdf")}
            </button>
            <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
          </div>
        </div>
      )}
      {error && <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>}
    </div>
  );
}
