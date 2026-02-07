"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { configurePdfjsWorker } from "@/lib/pdf-utils";

interface ExtractedImage {
  url: string;
  page: number;
  width: number;
  height: number;
}

export function ExtractPdfImages() {
  const t = useTranslations("tools.extract-pdf-images.ui");
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const extract = useCallback(async (f: File) => {
    setFile(f); setImages([]); setError(""); setLoading(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      configurePdfjsWorker(pdfjsLib);
      const arrayBuf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
      const extracted: ExtractedImage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;

        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
        extracted.push({
          url: URL.createObjectURL(blob),
          page: i,
          width: Math.round(viewport.width / 2),
          height: Math.round(viewport.height / 2),
        });
      }

      setImages(extracted);
    } catch (err) {
      console.error("ExtractPdfImages error:", err);
      setError(t("extractError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const downloadOne = (img: ExtractedImage) => {
    const a = document.createElement("a");
    a.href = img.url;
    a.download = `page_${img.page}.png`;
    a.click();
  };

  const downloadAll = async () => {
    for (const img of images) {
      downloadOne(img);
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) extract(e.dataTransfer.files[0]); }} className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center hover:border-primary/50">
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground">{t("formats")}</p>
          <input ref={inputRef} type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && extract(e.target.files[0])} className="hidden" />
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-sm text-muted-foreground">{t("extracting")}</p>
        </div>
      ) : images.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{images.length} {t("pagesExtracted")}</p>
            <div className="flex gap-2">
              <button onClick={downloadAll} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("downloadAll")}</button>
              <button onClick={() => { images.forEach((img) => URL.revokeObjectURL(img.url)); setFile(null); setImages([]); }} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">{t("reset")}</button>
            </div>
          </div>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {images.map((img) => (
              <div key={img.page} className="rounded-lg border border-border overflow-hidden group cursor-pointer" onClick={() => downloadOne(img)}>
                <img src={img.url} alt={`Page ${img.page}`} className="w-full" />
                <div className="p-2 text-xs text-center text-muted-foreground group-hover:text-primary">
                  {t("page")} {img.page} ({img.width}x{img.height})
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={() => setFile(null)} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
        </div>
      )}
    </div>
  );
}
