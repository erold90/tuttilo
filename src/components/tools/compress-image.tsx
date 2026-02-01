"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { compressImage, formatFileSize, triggerDownload, revokeUrls } from "@/lib/image-utils";

export function CompressImage() {
  const t = useTranslations("tools.compress-image.ui");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [quality, setQuality] = useState(80);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setOriginalSize(f.size);
    setPreview(URL.createObjectURL(f));
    setResultUrl("");
    setCompressedSize(0);
    setError("");
    setProgress(0);
  }

  const compress = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setProgress(0);
    try {
      const blob = await compressImage(file, {
        quality: quality / 100,
        onProgress: setProgress,
      });

      setCompressedSize(blob.size);
      revokeUrls(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch {
      setError(t("error"));
    }
    setProcessing(false);
  }, [file, quality, resultUrl, t]);

  function download() {
    if (!resultUrl || !file) return;
    const ext = file.name.replace(/.*\./, "");
    triggerDownload(resultUrl, file.name.replace(`.${ext}`, `-compressed.${ext}`));
  }

  function reset() {
    revokeUrls(preview, resultUrl);
    setFile(null);
    setPreview("");
    setResultUrl("");
    setCompressedSize(0);
    setOriginalSize(0);
    setError("");
    setProgress(0);
  }

  const savings = originalSize > 0 && compressedSize > 0
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0;

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
          <div className="text-4xl mb-3">🖼️</div>
          <p className="text-sm font-medium">{t("dropzone")}</p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP</p>
        </div>
      ) : (
        <>
          {/* Quality slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t("quality")}</label>
              <span className="text-sm font-mono text-primary">{quality}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>
          )}

          {/* Progress bar */}
          {processing && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t("processing")}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button onClick={compress} disabled={processing} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
              {processing ? t("processing") : t("compress")}
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

          {/* Size info */}
          {compressedSize > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <p className="text-lg font-bold">{formatFileSize(originalSize)}</p>
                <p className="text-xs text-muted-foreground">{t("originalSize")}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <p className="text-lg font-bold text-primary">{formatFileSize(compressedSize)}</p>
                <p className="text-xs text-muted-foreground">{t("compressedSize")}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <p className={`text-lg font-bold ${savings > 0 ? "text-green-500" : "text-red-500"}`}>{savings}%</p>
                <p className="text-xs text-muted-foreground">{t("savings")}</p>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">{t("original")}</p>
              <img src={preview} alt="Original" className="max-h-[300px] w-full rounded-lg border border-border object-contain bg-muted/30" />
            </div>
            {resultUrl && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">{t("compressed")}</p>
                <img src={resultUrl} alt="Compressed" className="max-h-[300px] w-full rounded-lg border border-border object-contain bg-muted/30" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
