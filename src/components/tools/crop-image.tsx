"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { canvasToBlob, cleanupCanvas, formatFileSize, triggerDownload, revokeUrls } from "@/lib/image-utils";

export function CropImage() {
  const t = useTranslations("tools.crop-image.ui");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [aspectRatio, setAspectRatio] = useState<number>(NaN);
  const [quality, setQuality] = useState(92);
  const [originalSize, setOriginalSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<Cropper>(null);

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultUrl("");
    setError("");
    setOriginalSize(f.size);
    setResultSize(0);
  }

  const crop = useCallback(async () => {
    const cropper = (cropperRef.current as any)?.cropper;
    if (!cropper || !file) return;
    setProcessing(true);
    setError("");
    try {
      const canvas = cropper.getCroppedCanvas() as HTMLCanvasElement;
      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await canvasToBlob(canvas, mime, quality / 100);

      revokeUrls(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
      // Note: don't cleanup cropper's canvas — it still owns it
    } catch {
      setError(t("error"));
    }
    setProcessing(false);
  }, [file, quality, resultUrl, t]);

  function download() {
    if (!resultUrl || !file) return;
    const ext = file.name.replace(/.*\./, "");
    triggerDownload(resultUrl, file.name.replace(`.${ext}`, `-cropped.${ext}`));
  }

  function reset() {
    revokeUrls(preview, resultUrl);
    setFile(null);
    setPreview("");
    setResultUrl("");
    setError("");
    setOriginalSize(0);
    setResultSize(0);
  }

  const isJpeg = file?.type !== "image/png";

  const aspects: { label: string; value: number }[] = [
    { label: t("freeform"), value: NaN },
    { label: "1:1", value: 1 },
    { label: "16:9", value: 16 / 9 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:2", value: 3 / 2 },
  ];

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
          <div className="text-4xl mb-3">✂️</div>
          <p className="text-sm font-medium">{t("dropzone")}</p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP</p>
        </div>
      ) : (
        <>
          {/* Aspect ratio buttons */}
          <div className="flex flex-wrap gap-2">
            {aspects.map((a) => (
              <button
                key={a.label}
                onClick={() => {
                  setAspectRatio(a.value);
                  const cropper = (cropperRef.current as any)?.cropper;
                  if (cropper) cropper.setAspectRatio(a.value);
                }}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  (isNaN(aspectRatio) && isNaN(a.value)) || aspectRatio === a.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Quality slider (only for JPEG output) */}
          {isJpeg && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{t("quality")}</label>
                <span className="text-sm font-mono text-primary">{quality}%</span>
              </div>
              <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
            </div>
          )}

          {/* Cropper */}
          <div className="overflow-hidden rounded-lg border border-border">
            <Cropper
              ref={cropperRef as any}
              src={preview}
              style={{ height: 400, width: "100%" }}
              aspectRatio={aspectRatio}
              guides={true}
              viewMode={1}
              responsive={true}
              autoCropArea={0.8}
              background={false}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button onClick={crop} disabled={processing} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
              {processing ? t("processing") : t("crop")}
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

          {/* Result preview */}
          {resultUrl && (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">{t("result")}</p>
              <img src={resultUrl} alt="Cropped" className="max-h-[300px] rounded-lg border border-border object-contain bg-muted/30" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
