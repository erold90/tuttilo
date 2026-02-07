"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { configurePdfjsWorker } from "@/lib/pdf-utils";

export function RedactPdf() {
  const t = useTranslations("tools.redact-pdf.ui");
  const [file, setFile] = useState<File | null>(null);
  const [searchTerms, setSearchTerms] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [redactCount, setRedactCount] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const redact = useCallback(async () => {
    if (!file || !searchTerms.trim()) return;
    setLoading(true); setError(""); setRedactCount(0);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      configurePdfjsWorker(pdfjsLib);
      const { PDFDocument, rgb } = await import("pdf-lib");

      const terms = searchTerms.split(",").map((t) => t.trim()).filter(Boolean);
      const arrayBuf = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuf);
      const srcPdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;

      let count = 0;
      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const page = pdfDoc.getPage(i);
        const srcPage = await srcPdf.getPage(i + 1);
        const textContent = await srcPage.getTextContent();
        const { height } = page.getSize();

        for (const item of textContent.items) {
          const ti = item as { str: string; transform: number[]; width: number; height: number };
          if (!ti.str) continue;
          for (const term of terms) {
            if (ti.str.toLowerCase().includes(term.toLowerCase())) {
              const [, , , , tx, ty] = ti.transform;
              page.drawRectangle({
                x: tx - 1,
                y: height - ty - ti.height * 0.3,
                width: ti.width + 2,
                height: ti.height * 1.3,
                color: rgb(0, 0, 0),
              });
              count++;
              break;
            }
          }
        }
      }

      setRedactCount(count);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("RedactPdf error:", err);
      setError(t("processError"));
    } finally {
      setLoading(false);
    }
  }, [file, searchTerms, resultUrl, t]);

  const download = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, "_redacted.pdf");
    a.click();
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) { setFile(e.dataTransfer.files[0]); setResultUrl(""); } }} className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center hover:border-primary/50">
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground">{t("formats")}</p>
          <input ref={inputRef} type="file" accept=".pdf" onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setResultUrl(""); } }} className="hidden" />
        </div>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("searchTerms")}</label>
            <input value={searchTerms} onChange={(e) => setSearchTerms(e.target.value)} placeholder={t("searchPlaceholder")} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <p className="text-xs text-muted-foreground mt-1">{t("searchHint")}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={redact} disabled={loading || !searchTerms.trim()} className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {loading ? t("processing") : t("redact")}
            </button>
            <button onClick={() => setFile(null)} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-green-500 font-medium">{t("done")} ({redactCount} {t("redacted")})</p>
          <div className="flex gap-2">
            <button onClick={download} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("download")}</button>
            <button onClick={() => { setFile(null); setResultUrl(""); setRedactCount(0); }} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
