"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

export function PptToPdf() {
  const t = useTranslations("tools.ppt-to-pdf.ui");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [slideCount, setSlideCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const htmlRef = useRef("");

  const loadFile = useCallback(async (f: File) => {
    const ext = f.name.toLowerCase();
    if (!ext.endsWith(".pptx")) return;
    setError(""); setResultUrl(""); setSlideCount(0);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(await f.arrayBuffer());

      // Count slides
      let count = 0;
      zip.folder("ppt/slides")?.forEach((path) => {
        if (/^slide\d+\.xml$/.test(path)) count++;
      });
      setSlideCount(count);

      // Extract text content from each slide
      const slides: { num: number; texts: string[] }[] = [];
      for (let i = 1; i <= count; i++) {
        const slideFile = zip.file(`ppt/slides/slide${i}.xml`);
        if (!slideFile) continue;
        const xml = await slideFile.async("text");
        // Extract text from <a:t> tags
        const texts: string[] = [];
        const regex = /<a:t>([^<]*)<\/a:t>/g;
        let match;
        while ((match = regex.exec(xml)) !== null) {
          if (match[1].trim()) texts.push(match[1]);
        }
        slides.push({ num: i, texts });
      }

      // Generate HTML for print
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
      setFile(f);
    } catch (err) {
      console.error("PPTX parse error:", err);
      setError(t("parseError"));
    }
  }, [t]);

  const convert = useCallback(async () => {
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
      console.error("PPT→PDF error:", err);
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [file, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a"); a.href = resultUrl;
    a.download = file.name.replace(/\.pptx?$/i, ".pdf"); a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setResultUrl(""); setError(""); setSlideCount(0); htmlRef.current = "";
  }, [resultUrl]);

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pptx"; input.onchange = () => input.files?.[0] && loadFile(input.files[0]); input.click(); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        >
          <div className="text-4xl mb-3">📽️</div>
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            {slideCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{t("slides")}: {slideCount}</p>
            )}
          </div>
          {htmlRef.current && (
            <div className="border border-border rounded-lg overflow-hidden bg-white">
              <iframe srcDoc={htmlRef.current} className="w-full h-64 pointer-events-none" title="Preview" />
            </div>
          )}
          <button onClick={convert} disabled={processing}
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
