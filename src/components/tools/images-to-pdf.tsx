"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { PDFDocument } from "pdf-lib";
import { Images, CaretLeft, CaretRight, Eye } from "@phosphor-icons/react";

interface ImageFile {
  file: File;
  name: string;
  url: string;
  naturalW?: number;
  naturalH?: number;
}

type PageSize = "fit" | "a4" | "letter";

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

const PREVIEW_MAX_H = 400;

export function ImagesToPdf() {
  const t = useTranslations("tools.images-to-pdf.ui");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("fit");
  const [margin, setMargin] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");

  const [previewPage, setPreviewPage] = useState(0);

  const addImages = useCallback(async (newFiles: FileList | File[]) => {
    setError("");
    const accepted = Array.from(newFiles).filter((f) =>
      f.type === "image/jpeg" || f.type === "image/png" || f.type === "image/webp"
    );
    if (accepted.length === 0) return;
    const newImages: ImageFile[] = [];
    for (const f of accepted) {
      const url = URL.createObjectURL(f);
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 800, h: 600 });
        img.src = url;
      });
      newImages.push({ file: f, name: f.name, url, naturalW: dims.w, naturalH: dims.h });
    }
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
        <Images size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-lg font-medium">{t("dropzone")}</p>
        <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}

      {images.length > 0 && !resultUrl && (
        <div className="space-y-4">
          {/* Options row */}
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

          {/* Live PDF Preview */}
          {(() => {
            const idx = Math.min(previewPage, images.length - 1);
            const img = images[idx];
            if (!img) return null;
            const imgW = img.naturalW || 800;
            const imgH = img.naturalH || 600;
            const m = margin;

            let pageW: number, pageH: number, drawW: number, drawH: number, drawX: number, drawY: number;
            if (pageSize === "fit") {
              pageW = imgW + m * 2;
              pageH = imgH + m * 2;
              drawW = imgW; drawH = imgH; drawX = m; drawY = m;
            } else {
              const dim = PAGE_SIZES[pageSize];
              pageW = dim.width; pageH = dim.height;
              const availW = pageW - m * 2;
              const availH = pageH - m * 2;
              const ratio = Math.min(availW / imgW, availH / imgH);
              drawW = imgW * ratio; drawH = imgH * ratio;
              drawX = (pageW - drawW) / 2; drawY = (pageH - drawH) / 2;
            }

            const scale = Math.min(PREVIEW_MAX_H / pageH, 360 / pageW, 1);
            const pw = Math.round(pageW * scale);
            const ph = Math.round(pageH * scale);
            const dx = Math.round(drawX * scale);
            const dy = Math.round(drawY * scale);
            const dw = Math.round(drawW * scale);
            const dh = Math.round(drawH * scale);

            return (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye weight="bold" className="h-4 w-4" />
                  <span>{t("preview")}</span>
                </div>
                <div className="flex justify-center rounded-lg bg-muted/30 p-4">
                  <div className="relative" style={{ width: pw, height: ph }}>
                    {/* Page background */}
                    <div className="absolute inset-0 rounded-sm bg-white shadow-lg" />
                    {/* Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.name}
                      className="absolute object-contain"
                      style={{ left: dx, top: dy, width: dw, height: dh }}
                    />
                    {/* Margin indicators */}
                    {m > 0 && (
                      <>
                        <div className="absolute border-b border-dashed border-blue-300/50" style={{ top: Math.round(m * scale), left: 0, right: 0 }} />
                        <div className="absolute border-t border-dashed border-blue-300/50" style={{ bottom: Math.round(m * scale), left: 0, right: 0 }} />
                        <div className="absolute border-r border-dashed border-blue-300/50" style={{ left: Math.round(m * scale), top: 0, bottom: 0 }} />
                        <div className="absolute border-l border-dashed border-blue-300/50" style={{ right: Math.round(m * scale), top: 0, bottom: 0 }} />
                      </>
                    )}
                  </div>
                </div>
                {/* Page navigation */}
                {images.length > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewPage((p) => Math.max(0, p - 1))}
                      disabled={idx <= 0}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 transition-colors"
                    >
                      <CaretLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm tabular-nums min-w-[60px] text-center font-medium">
                      {idx + 1} / {images.length}
                    </span>
                    <button
                      onClick={() => setPreviewPage((p) => Math.min(images.length - 1, p + 1))}
                      disabled={idx >= images.length - 1}
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 transition-colors"
                    >
                      <CaretRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Image thumbnails strip */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t("images")} ({images.length})</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <div
                  key={`${img.name}-${i}`}
                  onClick={() => setPreviewPage(i)}
                  className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors group ${
                    i === Math.min(previewPage, images.length - 1) ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <div className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[10px] px-1 rounded">{i + 1}</div>
                  <div className="absolute top-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); moveImage(i, -1); }} disabled={i === 0} className="bg-black/60 text-white text-[10px] p-0.5 rounded disabled:opacity-30">&#8593;</button>
                    <button onClick={(e) => { e.stopPropagation(); moveImage(i, 1); }} disabled={i === images.length - 1} className="bg-black/60 text-white text-[10px] p-0.5 rounded disabled:opacity-30">&#8595;</button>
                    <button onClick={(e) => { e.stopPropagation(); removeImage(i); }} className="bg-red-600/80 text-white text-[10px] p-0.5 rounded">&#10005;</button>
                  </div>
                </div>
              ))}
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
