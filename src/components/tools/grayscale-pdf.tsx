"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { configurePdfjsWorker } from "@/lib/pdf-utils";
import { SafariPdfBanner } from "@/components/safari-pdf-banner";

export function GrayscalePdf() {
  const t = useTranslations("tools.grayscale-pdf.ui");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const process = useCallback(async (f: File) => {
    setFile(f); setResultUrl(""); setError(""); setLoading(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      configurePdfjsWorker(pdfjsLib);
      const { PDFDocument } = await import("pdf-lib");

      const arrayBuf = await f.arrayBuffer();
      const srcPdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
      const outPdf = await PDFDocument.create();

      for (let i = 1; i <= srcPdf.numPages; i++) {
        const page = await srcPdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;

        // Convert to grayscale
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let j = 0; j < data.length; j += 4) {
          const gray = data[j] * 0.299 + data[j + 1] * 0.587 + data[j + 2] * 0.114;
          data[j] = data[j + 1] = data[j + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);

        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9));
        const imgBytes = new Uint8Array(await blob.arrayBuffer());
        const img = await outPdf.embedJpg(imgBytes);
        const pdfPage = outPdf.addPage([viewport.width / 2, viewport.height / 2]);
        pdfPage.drawImage(img, { x: 0, y: 0, width: viewport.width / 2, height: viewport.height / 2 });
      }

      const pdfBytes = await outPdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("GrayscalePdf error:", err);
      setError(t("processError"));
    } finally {
      setLoading(false);
    }
  }, [resultUrl, t]);

  const download = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, "_grayscale.pdf");
    a.click();
  };

  return (
    <div className="space-y-6">
      <SafariPdfBanner />
      {!file ? (
        <div onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) process(e.dataTransfer.files[0]); }} className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center hover:border-primary/50">
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground">{t("formats")}</p>
          <input ref={inputRef} type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && process(e.target.files[0])} className="hidden" />
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-sm text-muted-foreground">{t("processing")}</p>
        </div>
      ) : resultUrl ? (
        <div className="space-y-4">
          <p className="text-sm text-green-500 font-medium">{t("done")}</p>
          <div className="flex gap-2">
            <button onClick={download} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("download")}</button>
            <button onClick={() => { setFile(null); setResultUrl(""); }} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
          </div>
        </div>
      ) : (
        <div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={() => { setFile(null); }} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
        </div>
      )}
    </div>
  );
}
