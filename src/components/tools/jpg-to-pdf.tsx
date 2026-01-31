"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PDFDocument } from "pdf-lib";

interface ImageFile {
  file: File;
  name: string;
  url: string;
}

export function JpgToPdf() {
  const t = useTranslations("tools.jpg-to-pdf.ui");
  const [images, setImages] = useState<ImageFile[]>([]);
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

  const convert = useCallback(async () => {
    if (images.length === 0) return;
    setProcessing(true);
    setError("");
    try {
      const doc = await PDFDocument.create();

      for (const img of images) {
        const bytes = await img.file.arrayBuffer();
        let embedded;
        if (img.file.type === "image/png") {
          embedded = await doc.embedPng(bytes);
        } else {
          // For JPEG and WebP (convert WebP to JPEG via canvas)
          if (img.file.type === "image/webp") {
            const bitmap = await createImageBitmap(img.file);
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(bitmap, 0, 0);
            const jpgBlob = await new Promise<Blob>((res) =>
              canvas.toBlob((b) => res(b!), "image/jpeg", 0.92)
            );
            const jpgBytes = await jpgBlob.arrayBuffer();
            embedded = await doc.embedJpg(jpgBytes);
          } else {
            embedded = await doc.embedJpg(bytes);
          }
        }

        const page = doc.addPage([embedded.width, embedded.height]);
        page.drawImage(embedded, {
          x: 0,
          y: 0,
          width: embedded.width,
          height: embedded.height,
        });
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
  }, [images, resultUrl, t]);

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
      {/* Drop zone */}
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

      {/* Image list */}
      {images.length > 0 && !resultUrl && (
        <div className="space-y-3">
          <h3 className="font-medium">{t("images")} ({images.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div key={`${img.name}-${i}`} className="bg-muted/50 rounded-lg overflow-hidden relative group">
                <img src={img.url} alt={img.name} className="w-full aspect-[3/4] object-cover" />
                <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">{i + 1}</div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveImage(i, -1)} disabled={i === 0} className="bg-black/60 text-white text-xs p-1 rounded disabled:opacity-30">\u2191</button>
                  <button onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="bg-black/60 text-white text-xs p-1 rounded disabled:opacity-30">\u2193</button>
                  <button onClick={() => removeImage(i)} className="bg-red-600/80 text-white text-xs p-1 rounded">\u2715</button>
                </div>
                <div className="p-2">
                  <p className="text-xs truncate">{img.name}</p>
                </div>
              </div>
            ))}
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

      {/* Result */}
      {resultUrl && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">\u2713</div>
          <p className="font-medium">{t("done")}</p>
          <p className="text-sm text-muted-foreground">
            {images.length} {t("images")} \u00B7 {formatSize(resultSize)}
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
