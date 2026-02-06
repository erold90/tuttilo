"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

interface CompressedImage {
  name: string;
  originalSize: number;
  compressedSize: number;
  url: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export function ImageCompressor() {
  const t = useTranslations("tools.image-compressor.ui");
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(0);
  const [results, setResults] = useState<CompressedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const compress = useCallback(async (files: FileList) => {
    setProcessing(true);
    const items: CompressedImage[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = url; });

      const canvas = document.createElement("canvas");
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (maxWidth > 0 && w > maxWidth) {
        h = Math.round(h * (maxWidth / w));
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/jpeg", quality / 100)
      );

      items.push({
        name: file.name,
        originalSize: file.size,
        compressedSize: blob.size,
        url: URL.createObjectURL(blob),
      });
      URL.revokeObjectURL(url);
    }

    setResults(items);
    setProcessing(false);
  }, [quality, maxWidth]);

  const downloadAll = useCallback(() => {
    for (const r of results) {
      const a = document.createElement("a");
      a.href = r.url;
      a.download = r.name.replace(/\.[^.]+$/, "") + "_compressed.jpg";
      a.click();
    }
  }, [results]);

  const totalSaved = results.reduce((acc, r) => acc + (r.originalSize - r.compressedSize), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("quality")}: {quality}%</label>
          <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-48" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("maxWidth")}</label>
          <select value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value={0}>{t("noResize")}</option>
            <option value={1920}>1920px</option>
            <option value={1280}>1280px</option>
            <option value={800}>800px</option>
            <option value={640}>640px</option>
          </select>
        </div>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) compress(e.dataTransfer.files); }}
        className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center transition-colors hover:border-primary/50"
      >
        <p className="text-lg font-medium">{t("dropzone")}</p>
        <p className="text-sm text-muted-foreground">{t("formats")}</p>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => e.target.files && compress(e.target.files)} className="hidden" />
      </div>

      {processing && <div className="text-center text-sm text-muted-foreground">{t("processing")}</div>}

      {results.length > 0 && (
        <>
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-center">
            <span className="text-lg font-bold text-green-400">{formatSize(totalSaved)}</span>
            <span className="ml-2 text-sm text-muted-foreground">{t("saved")}</span>
          </div>

          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatSize(r.originalSize)} → {formatSize(r.compressedSize)}
                    <span className="ml-2 text-green-400">-{Math.round((1 - r.compressedSize / r.originalSize) * 100)}%</span>
                  </div>
                </div>
                <a href={r.url} download={r.name.replace(/\.[^.]+$/, "") + "_compressed.jpg"} className="shrink-0 rounded px-3 py-1 text-sm text-primary hover:bg-primary/10">{t("download")}</a>
              </div>
            ))}
          </div>

          <button onClick={downloadAll} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("downloadAll")}</button>
        </>
      )}
    </div>
  );
}
