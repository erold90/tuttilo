"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

type OutputFormat = "jpeg" | "webp" | "png";

interface CompressedImage {
  name: string;
  originalSize: number;
  compressedSize: number;
  url: string;
  thumbUrl: string;
  format: OutputFormat;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function getExtension(format: OutputFormat): string {
  return format === "jpeg" ? "jpg" : format;
}

function getMime(format: OutputFormat): string {
  return `image/${format}`;
}

export function ImageCompressor() {
  const t = useTranslations("tools.image-compressor.ui");
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(0);
  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [results, setResults] = useState<CompressedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const compress = useCallback(
    async (files: FileList) => {
      setProcessing(true);
      setResults([]);
      const fileArr = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      setProgress({ done: 0, total: fileArr.length });
      const items: CompressedImage[] = [];

      for (let i = 0; i < fileArr.length; i++) {
        const file = fileArr[i];
        const img = new Image();
        const url = URL.createObjectURL(file);
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.src = url;
        });

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

        // For formats supporting transparency, draw transparent; otherwise white bg
        if (format === "jpeg") {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);

        const qualityVal = format === "png" ? undefined : quality / 100;
        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), getMime(format), qualityVal)
        );

        // Generate thumbnail
        const thumbCanvas = document.createElement("canvas");
        const thumbSize = 80;
        const aspect = w / h;
        thumbCanvas.width = aspect >= 1 ? thumbSize : Math.round(thumbSize * aspect);
        thumbCanvas.height = aspect >= 1 ? Math.round(thumbSize / aspect) : thumbSize;
        thumbCanvas.getContext("2d")!.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);
        const thumbBlob = await new Promise<Blob>((resolve) =>
          thumbCanvas.toBlob((b) => resolve(b!), "image/jpeg", 0.6)
        );

        items.push({
          name: file.name,
          originalSize: file.size,
          compressedSize: blob.size,
          url: URL.createObjectURL(blob),
          thumbUrl: URL.createObjectURL(thumbBlob),
          format,
        });
        URL.revokeObjectURL(url);
        setProgress({ done: i + 1, total: fileArr.length });
      }

      setResults(items);
      setProcessing(false);
    },
    [quality, maxWidth, format]
  );

  const downloadAll = useCallback(() => {
    for (const r of results) {
      const a = document.createElement("a");
      a.href = r.url;
      const baseName = r.name.replace(/\.[^.]+$/, "");
      a.download = `${baseName}_compressed.${getExtension(r.format)}`;
      a.click();
    }
  }, [results]);

  const totalOriginal = results.reduce((a, r) => a + r.originalSize, 0);
  const totalCompressed = results.reduce((a, r) => a + r.compressedSize, 0);
  const totalSaved = totalOriginal - totalCompressed;
  const totalPercent =
    totalOriginal > 0
      ? Math.round((1 - totalCompressed / totalOriginal) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Settings row */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("format")}
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as OutputFormat)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
            <option value="png">PNG</option>
          </select>
        </div>

        {format !== "png" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("quality")}: {quality}%
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-48"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("maxWidth")}
          </label>
          <select
            value={maxWidth}
            onChange={(e) => setMaxWidth(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value={0}>{t("noLimit")}</option>
            <option value={1920}>1920px</option>
            <option value={1280}>1280px</option>
            <option value={800}>800px</option>
            <option value={640}>640px</option>
          </select>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) compress(e.dataTransfer.files);
        }}
        className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center transition-colors hover:border-primary/50"
      >
        <p className="text-lg font-medium">{t("dropzone")}</p>
        <p className="text-sm text-muted-foreground">{t("formats")}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && compress(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Processing indicator */}
      {processing && (
        <div className="space-y-2">
          <div className="text-center text-sm text-muted-foreground">
            {t("processing")} ({progress.done}/{progress.total})
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Summary card */}
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-center">
            <div className="text-lg font-bold text-green-400">
              {formatSize(totalSaved)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                {t("saved")} ({totalPercent}%)
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatSize(totalOriginal)} → {formatSize(totalCompressed)}
            </div>
          </div>

          {/* File list */}
          <div className="space-y-2">
            {results.map((r, i) => {
              const pct = Math.round(
                (1 - r.compressedSize / r.originalSize) * 100
              );
              const grew = r.compressedSize > r.originalSize;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <img
                    src={r.thumbUrl}
                    alt=""
                    className="h-10 w-10 rounded object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {r.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatSize(r.originalSize)} →{" "}
                      {formatSize(r.compressedSize)}
                      <span
                        className={`ml-2 ${grew ? "text-red-400" : "text-green-400"}`}
                      >
                        {grew ? "+" : "-"}
                        {Math.abs(pct)}%
                      </span>
                    </div>
                  </div>
                  <a
                    href={r.url}
                    download={`${r.name.replace(/\.[^.]+$/, "")}_compressed.${getExtension(r.format)}`}
                    className="shrink-0 rounded px-3 py-1 text-sm text-primary hover:bg-primary/10"
                  >
                    {t("download")}
                  </a>
                </div>
              );
            })}
          </div>

          <button
            onClick={downloadAll}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("downloadAll")}
          </button>
        </>
      )}
    </div>
  );
}
