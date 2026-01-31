"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PDFDocument } from "pdf-lib";

interface ImageFile {
  file: File;
  name: string;
  url: string;
}

type PageSize = "fit" | "a4" | "letter";

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

export function ImagesToPdf() {
  const t = useTranslations("tools.images-to-pdf.ui");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("fit");
  const [margin, setMargin] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");

  const addImages = useCallback(async (newFiles: FileList | File[]) => {
    setError("");
    const accepted = Array.from(newFiles).filter((f) =>
      f.type === "image/jpeg" || f.type === "image/png" || f.type === "image/webp"
    );
    if (accepted.length === 0) return;
    const newImages: ImageFile[] = accepted.map((f) => ({
      file: f,
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setImages((prev) => [...prev, ...newImages]);
    setResultUrl("");
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
    setResultUrl("");
  }, []);

  const moveImage = useCallback((index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setResultUrl("");
  }, []);

  const embedImage = async (doc: PDFDocument, file: File) => {
    const bytes = await file.arrayBuffer();
    if (file.type === "image/png") {
      return doc.embedPng(bytes);
    }
    if (file.type === "image/webp") {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      const jpgBlob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), "image/jpeg", 0.92)
      );
      return doc.embedJpg(await jpgBlob.arrayBuffer());
    }
    return doc.embedJpg(bytes);
  };

  const convert = useCallback(async () => {
    if (images.length === 0) return;
    setProcessing(true);
    setError("");
    try {
      const doc = await PDFDocument.create();
      const m = margin;

      for (const img of images) {
        const embedded = await embedImage(doc, img.file);
        const imgW = embedded.width;
        const imgH = embedded.height;

        let pageW: number;
        let pageH: number;
        let drawW: number;
        let drawH: number;
        let drawX: number;
        let drawY: number;

        if (pageSize === "fit") {
          pageW = imgW + m * 2;
          pageH = imgH + m * 2;
          drawW = imgW;
          drawH = imgH;
          drawX = m;
          drawY = m;
        } else {
          const dim = PAGE_SIZES[pageSize];
          pageW = dim.width;
          pageH = dim.height;
          const availW = pageW - m * 2;
          const availH = pageH - m * 2;
          const ratio = Math.min(availW / imgW, availH / imgH);
          drawW = imgW * ratio;
          drawH = imgH * ratio;
          drawX = (pageW - drawW) / 2;
          drawY = (pageH - drawH) / 2;
        }

        const page = doc.addPage([pageW, pageH]);
        page.drawImage(embedded, { x: drawX, y: drawY, width: drawW, height: drawH });
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch {
      setError(t("convertError"));
    } finally {
      setProcessing(false);
    }
  }, [images, pageSize, margin, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "images.pdf";
    a.click();
  }, [resultUrl]);

  const reset = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setImages([]);
    setResultUrl("");
    setResultSize(0);
    setError("");
  }, [images, resultUrl]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
        onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); addImages(e.dataTransfer.files); }}
        className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/jpeg,image/png,image/webp"; input.multiple = true; input.onchange = () => input.files && addImages(input.files); input.click(); }}
      >
        <div className="text-4xl mb-3">🖼️</div>
        <p className="text-lg font-medium">{t("dropzone")}</p>
        <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}

      {images.length > 0 && !resultUrl && (
        <div className="space-y-4">
          <h3 className="font-medium">{t("images")} ({images.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div key={`${img.name}-${i}`} className="bg-muted/50 rounded-lg overflow-hidden relative group">
                <img src={img.url} alt={img.name} className="w-full aspect-[3/4] object-cover" />
                <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">{i + 1}</div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveImage(i, -1)} disabled={i === 0} className="bg-black/60 text-white text-xs p-1 rounded disabled:opacity-30">↑</button>
                  <button onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="bg-black/60 text-white text-xs p-1 rounded disabled:opacity-30">↓</button>
                  <button onClick={() => removeImage(i)} className="bg-red-600/80 text-white text-xs p-1 rounded">✕</button>
                </div>
                <div className="p-2">
                  <p className="text-xs truncate">{img.name}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t("pageSize")}</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as PageSize)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="fit">{t("pageSizeFit")}</option>
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t("margin")}</label>
              <select
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="0">{t("marginNone")}</option>
                <option value="20">{t("marginSmall")}</option>
                <option value="40">{t("marginMedium")}</option>
                <option value="60">{t("marginLarge")}</option>
              </select>
            </div>
          </div>

          <button
            onClick={convert}
            disabled={processing}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {processing ? t("processing") : t("convert")}
          </button>
        </div>
      )}

      {resultUrl && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
          <p className="font-medium">{t("done")}</p>
          <p className="text-sm text-muted-foreground">
            {images.length} {t("images")} · {formatSize(resultSize)}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={download} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
            <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
