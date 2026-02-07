"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { configurePdfjsWorker } from "@/lib/pdf-utils";

export function PdfToText() {
  const t = useTranslations("tools.pdf-to-text.ui");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const extract = useCallback(async (f: File) => {
    setFile(f); setText(""); setError(""); setLoading(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      configurePdfjsWorker(pdfjsLib);
      const arrayBuf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }
      setText(fullText.trim());
    } catch (err) {
      console.error("PdfToText error:", err);
      setError(t("extractError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const copy = () => navigator.clipboard.writeText(text);
  const download = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (file?.name || "document").replace(/\.pdf$/i, "") + ".txt";
    a.click();
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) extract(e.dataTransfer.files[0]); }} className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center hover:border-primary/50">
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground">{t("formats")}</p>
          <input ref={inputRef} type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && extract(e.target.files[0])} className="hidden" />
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-sm text-muted-foreground">{t("extracting")}</p>
            </div>
          ) : text ? (
            <>
              <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-72 rounded-lg border border-border bg-background p-3 text-sm font-mono focus:border-primary focus:outline-none resize-none" />
              <div className="flex gap-2">
                <button onClick={copy} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("copy")}</button>
                <button onClick={download} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("download")}</button>
                <button onClick={() => { setFile(null); setText(""); }} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
              </div>
            </>
          ) : null}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}
