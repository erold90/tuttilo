"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import imageCompression from "browser-image-compression";

export function CompressImage() {
  const t = useTranslations("tools.compress-image.ui");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [quality, setQuality] = useState(80);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setOriginalSize(f.size);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setResultUrl("");
    setCompressedSize(0);
  }

  const compress = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: (file.size / 1024 / 1024) * (quality / 100),
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        initialQuality: quality / 100,
      });
      setCompressedSize(compressed.size);
      const url = URL.createObjectURL(compressed);
      setResult(compressed);
      setResultUrl(url);
    } catch {
      // fallback: use canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCompressedSize(blob.size);
              setResult(blob);
              setResultUrl(URL.createObjectURL(blob));
            }
            setProcessing(false);
          },
          "image/jpeg",
          quality / 100
        );
      };
      img.src = URL.createObjectURL(file);
      return;
    }
    setProcessing(false);
  }, [file, quality]);

  function download() {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const ext = file.name.replace(/.*\./, "");
    a.download = file.name.replace(`.${ext}`, `-compressed.${ext}`);
    a.click();
  }

  function reset() {
    setFile(null);
    setPreview("");
    setResult(null);
    setResultUrl("");
    setCompressedSize(0);
    setOriginalSize(0);
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
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
                <p className="text-lg font-bold">{formatSize(originalSize)}</p>
                <p className="text-xs text-muted-foreground">{t("originalSize")}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <p className="text-lg font-bold text-primary">{formatSize(compressedSize)}</p>
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
