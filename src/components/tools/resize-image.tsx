"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { loadImage, canvasToBlob, cleanupCanvas, formatFileSize, triggerDownload, revokeUrls } from "@/lib/image-utils";

export function ResizeImage() {
  const t = useTranslations("tools.resize-image.ui");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [quality, setQuality] = useState(92);
  const [originalSize, setOriginalSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ratioRef = useRef(1);

  function handleFile(f: File) {
    setFile(f);
    setResultUrl("");
    setError("");
    setOriginalSize(f.size);
    setResultSize(0);
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = new Image();
    img.onload = () => {
      setOrigW(img.width);
      setOrigH(img.height);
      setWidth(img.width);
      setHeight(img.height);
      ratioRef.current = img.width / img.height;
    };
    img.src = url;
  }

  function updateWidth(w: number) {
    setWidth(w);
    if (lock) setHeight(Math.round(w / ratioRef.current));
  }

  function updateHeight(h: number) {
    setHeight(h);
    if (lock) setWidth(Math.round(h * ratioRef.current));
  }

  const resize = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const { img, url: srcUrl } = await loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (file.type === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, width, height);
      const mime = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
      const blob = await canvasToBlob(canvas, mime, quality / 100);

      revokeUrls(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);

      cleanupCanvas(canvas);
      URL.revokeObjectURL(srcUrl);
    } catch {
      setError(t("error"));
    }
    setProcessing(false);
  }, [file, width, height, quality, resultUrl, t]);

  function download() {
    if (!resultUrl || !file) return;
    const ext = file.name.replace(/.*\./, "");
    triggerDownload(resultUrl, file.name.replace(`.${ext}`, `-${width}x${height}.${ext}`));
  }

  function reset() {
    revokeUrls(preview, resultUrl);
    setFile(null);
    setPreview("");
    setResultUrl("");
    setWidth(0);
    setHeight(0);
    setError("");
    setOriginalSize(0);
    setResultSize(0);
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
        >
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div className="text-4xl mb-3">📐</div>
          <p className="text-sm font-medium">{t("dropzone")}</p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP</p>
        </div>
      ) : (
        <>
          {/* Original dimensions */}
          <p className="text-sm text-muted-foreground">
            {t("originalDimensions")}: {origW} × {origH}px
          </p>

          {/* Size inputs */}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">{t("width")}</label>
              <input type="number" value={width} onChange={(e) => updateWidth(Number(e.target.value))} min={1} max={10000}
                className="w-28 rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <button onClick={() => setLock(!lock)} className={`mb-0.5 rounded-md border p-2 text-sm transition-colors ${lock ? "border-primary bg-primary/10 text-primary" : "border-border"}`} title={t("lockAspectRatio")}>
              {lock ? "🔗" : "🔓"}
            </button>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("height")}</label>
              <input type="number" value={height} onChange={(e) => updateHeight(Number(e.target.value))} min={1} max={10000}
                className="w-28 rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <span className="mb-1 text-xs text-muted-foreground">px</span>
          </div>

          {/* Quality slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t("quality")}</label>
              <span className="text-sm font-mono text-primary">{quality}%</span>
            </div>
            <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {[25, 50, 75, 150, 200].map((pct) => (
              <button key={pct} onClick={() => { updateWidth(Math.round(origW * pct / 100)); }}
                className="rounded-md border border-border px-3 py-1 text-xs transition-colors hover:bg-muted">
                {pct}%
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button onClick={resize} disabled={processing} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
              {processing ? t("processing") : t("resize")}
            </button>
            {resultUrl && (
              <button onClick={download} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700">
                {t("download")}
              </button>
            )}
            <button onClick={reset} className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-muted">
              {t("reset")}
            </button>
          </div>

          {/* File size info */}
          {resultSize > 0 && (
            <div className="flex gap-3">
              <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
                <p className="text-sm font-bold">{formatFileSize(originalSize)}</p>
                <p className="text-xs text-muted-foreground">{t("originalSize")}</p>
              </div>
              <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
                <p className="text-sm font-bold text-primary">{formatFileSize(resultSize)}</p>
                <p className="text-xs text-muted-foreground">{t("resultSize")}</p>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">{t("original")} ({origW}×{origH})</p>
              <img src={preview} alt="Original" className="max-h-[300px] w-full rounded-lg border border-border object-contain bg-muted/30" />
            </div>
            {resultUrl && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">{t("resized")} ({width}×{height})</p>
                <img src={resultUrl} alt="Resized" className="max-h-[300px] w-full rounded-lg border border-border object-contain bg-muted/30" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
