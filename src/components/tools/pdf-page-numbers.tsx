"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { loadPdfRobust } from "@/lib/pdf-utils";
import { ListNumbers } from "@phosphor-icons/react";
import { useFileInput } from "@/hooks/use-file-input";

type Position = "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-left" | "top-right";
type Format = "num" | "numOf" | "pageNum" | "pageNumOf";

export function PdfPageNumbers() {
  const t = useTranslations("tools.pdf-page-numbers.ui");
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [format, setFormat] = useState<Format>("num");
  const [fontSize, setFontSize] = useState(10);
  const [startFrom, setStartFrom] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  const loadFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setError(""); setResultUrl(""); setFile(f);
  }, []);

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({ accept: ".pdf", onFile: loadFile });

  const apply = useCallback(async () => {
    if (!file) return;
    setProcessing(true); setError("");
    try {
      const bytes = await file.arrayBuffer();
      const doc = await loadPdfRobust(bytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const total = pages.length;

      for (let i = 0; i < total; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const num = i + startFrom;

        let text = "";
        switch (format) {
          case "num": text = `${num}`; break;
          case "numOf": text = `${num} / ${total + startFrom - 1}`; break;
          case "pageNum": text = `${t("pageLabel")} ${num}`; break;
          case "pageNumOf": text = `${t("pageLabel")} ${num} ${t("ofLabel")} ${total + startFrom - 1}`; break;
        }

        const tw = font.widthOfTextAtSize(text, fontSize);
        const margin = 30;
        let x = 0, y = 0;

        switch (position) {
          case "bottom-center": x = (width - tw) / 2; y = margin; break;
          case "bottom-left": x = margin; y = margin; break;
          case "bottom-right": x = width - tw - margin; y = margin; break;
          case "top-center": x = (width - tw) / 2; y = height - margin; break;
          case "top-left": x = margin; y = height - margin; break;
          case "top-right": x = width - tw - margin; y = height - margin; break;
        }

        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("PDF PageNumbers error:", err);
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [file, position, format, fontSize, startFrom, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a"); a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, "_numbered.pdf"); a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setResultUrl(""); setError("");
  }, [resultUrl]);

  const positions: { value: Position; label: string }[] = [
    { value: "bottom-center", label: t("posBottomCenter") },
    { value: "bottom-left", label: t("posBottomLeft") },
    { value: "bottom-right", label: t("posBottomRight") },
    { value: "top-center", label: t("posTopCenter") },
    { value: "top-left", label: t("posTopLeft") },
    { value: "top-right", label: t("posTopRight") },
  ];

  const formats: { value: Format; label: string }[] = [
    { value: "num", label: "1, 2, 3..." },
    { value: "numOf", label: "1 / N" },
    { value: "pageNum", label: `${t("pageLabel")} 1` },
    { value: "pageNumOf", label: `${t("pageLabel")} 1 ${t("ofLabel")} N` },
  ];

  return (
    <div className="space-y-6">
      {!file ? (
        <>
          <input {...fileInputProps} />
          <div
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={openFileDialog}
          >
            <ListNumbers size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-medium">{t("dropzone")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
          </div>
        </>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("position")}</label>
              <select value={position} onChange={(e) => setPosition(e.target.value as Position)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {positions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("format")}</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as Format)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {formats.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("fontSize")}</label>
              <input type="number" value={fontSize} min={6} max={24} onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("startFrom")}</label>
              <input type="number" value={startFrom} min={0} onChange={(e) => setStartFrom(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
          </div>

          <button onClick={apply} disabled={processing}
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
