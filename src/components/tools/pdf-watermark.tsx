"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { StandardFonts, rgb, degrees } from "pdf-lib";
import { loadPdfRobust } from "@/lib/pdf-utils";

export function PdfWatermark() {
  const t = useTranslations("tools.pdf-watermark.ui");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.15);
  const [rotation, setRotation] = useState(-45);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  const loadFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setError(""); setResultUrl(""); setFile(f);
  }, []);

  const apply = useCallback(async () => {
    if (!file || !text.trim()) return;
    setProcessing(true); setError("");
    try {
      const bytes = await file.arrayBuffer();
      const doc = await loadPdfRobust(bytes);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const pages = doc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const tw = font.widthOfTextAtSize(text, fontSize);
        const x = (width - tw) / 2;
        const y = height / 2;

        page.drawText(text, {
          x, y,
          size: fontSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity,
          rotate: degrees(rotation),
        });
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch {
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [file, text, fontSize, opacity, rotation, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a"); a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, "_watermarked.pdf"); a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setResultUrl(""); setError("");
  }, [resultUrl]);

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf"; input.onchange = () => input.files?.[0] && loadFile(input.files[0]); input.click(); }}
        >
          <div className="text-4xl mb-3">💧</div>
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t("text")}</label>
            <input type="text" value={text} onChange={(e) => setText(e.target.value)}
              placeholder={t("textPlaceholder")} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("fontSize")}</label>
              <input type="range" min={12} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full" />
              <p className="text-xs text-muted-foreground text-center">{fontSize}px</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("opacity")}</label>
              <input type="range" min={5} max={80} value={opacity * 100} onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                className="w-full" />
              <p className="text-xs text-muted-foreground text-center">{Math.round(opacity * 100)}%</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("rotation")}</label>
              <input type="range" min={-90} max={90} value={rotation} onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full" />
              <p className="text-xs text-muted-foreground text-center">{rotation}°</p>
            </div>
          </div>

          <button onClick={apply} disabled={processing || !text.trim()}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {processing ? t("processing") : t("apply")}
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
