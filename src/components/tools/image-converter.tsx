"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  detectImageFormat,
  convertImageFormat,
  formatFileSize,
  triggerDownload,
  revokeUrls,
  type DetectedFormat,
} from "@/lib/image-utils";
import { useBatchImage } from "@/hooks/use-batch-image";
import { BatchImageList } from "@/components/tools/batch-image-list";
import { Image } from "@phosphor-icons/react";

type OutputFormatId = "jpeg" | "png" | "webp" | "avif" | "bmp";

interface OutputFormat {
  id: OutputFormatId;
  mime: string;
  ext: string;
  label: string;
  lossy: boolean;
  color: string;
}

const OUTPUT_FORMATS: OutputFormat[] = [
  { id: "jpeg", mime: "image/jpeg", ext: "jpg", label: "JPG", lossy: true, color: "#F97316" },
  { id: "png", mime: "image/png", ext: "png", label: "PNG", lossy: false, color: "#22C55E" },
  { id: "webp", mime: "image/webp", ext: "webp", label: "WebP", lossy: true, color: "#3B82F6" },
  { id: "bmp", mime: "image/bmp", ext: "bmp", label: "BMP", lossy: false, color: "#A855F7" },
];

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml,image/heic,image/heif,image/avif,image/tiff,image/x-icon,.heic,.heif,.avif";

function isHeicFormat(detected: DetectedFormat | null, file: File): boolean {
  if (detected?.mime === "image/heic") return true;
  if (file.type === "image/heic" || file.type === "image/heif") return true;
  const ext = file.name.toLowerCase();
  return ext.endsWith(".heic") || ext.endsWith(".heif");
}

export function ImageConverter() {
  const t = useTranslations("tools.image-converter.ui");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [detectedFormat, setDetectedFormat] = useState<DetectedFormat | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormatId>("jpeg");
  const [quality, setQuality] = useState(92);
  const [resultUrl, setResultUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Batch
  const processFile = useCallback(
    (f: File) => {
      const fmt = OUTPUT_FORMATS.find((o) => o.id === outputFormat)!;
      const heic = f.name.toLowerCase().endsWith(".heic") || f.name.toLowerCase().endsWith(".heif") || f.type === "image/heic" || f.type === "image/heif";
      return convertImageFormat(f, fmt.mime, { quality: quality / 100, isHeic: heic });
    },
    [quality, outputFormat]
  );
  const batch = useBatchImage({ processFile });
  const [isBatch, setIsBatch] = useState(false);

  async function handleFiles(fileList: FileList) {
    if (fileList.length > 1) {
      setIsBatch(true);
      batch.addFiles(Array.from(fileList));
      // Auto-detect format from first file for display
      const detected = await detectImageFormat(fileList[0]);
      setDetectedFormat(detected);
    } else if (fileList.length === 1) {
      setIsBatch(false);
      const f = fileList[0];
      const detected = await detectImageFormat(f);
      setDetectedFormat(detected);
      setFile(f);
      setOriginalSize(f.size);
      setResultUrl("");
      setResultSize(0);
      setError("");

      // Create preview — for HEIC, decode first
      if (isHeicFormat(detected, f)) {
        try {
          const heic2any = (await import("heic2any")).default;
          const result = await heic2any({ blob: f, toType: "image/png", quality: 0.8 });
          const blob = Array.isArray(result) ? result[0] : result;
          setPreview(URL.createObjectURL(blob));
        } catch (err) {
          console.error("ImageConverter error:", err);
          setPreview("");
        }
      } else {
        setPreview(URL.createObjectURL(f));
      }

      // Auto-select a smart default output format (different from input)
      if (detected) {
        const inputExt = detected.ext.toLowerCase();
        if (inputExt === "jpg" || inputExt === "jpeg") setOutputFormat("webp");
        else if (inputExt === "png") setOutputFormat("jpeg");
        else if (inputExt === "webp") setOutputFormat("jpeg");
        else setOutputFormat("jpeg"); // GIF, BMP, SVG, HEIC, AVIF, TIFF, ICO → JPEG as default
      }
    }
  }

  async function convert() {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const fmt = OUTPUT_FORMATS.find((o) => o.id === outputFormat)!;
      const heic = isHeicFormat(detectedFormat, file);
      const { blob, url } = await convertImageFormat(file, fmt.mime, {
        quality: quality / 100,
        isHeic: heic,
      });
      revokeUrls(resultUrl);
      setResultUrl(url);
      setResultSize(blob.size);
    } catch (err) {
      console.error("ImageConverter error:", err);
      setError(t("error"));
    }
    setProcessing(false);
  }

  function download() {
    if (!resultUrl || !file) return;
    const fmt = OUTPUT_FORMATS.find((o) => o.id === outputFormat)!;
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    triggerDownload(resultUrl, `${baseName}.${fmt.ext}`);
  }

  function reset() {
    revokeUrls(preview, resultUrl);
    setFile(null);
    setPreview("");
    setResultUrl("");
    setError("");
    setOriginalSize(0);
    setResultSize(0);
    setDetectedFormat(null);
    batch.reset();
    setIsBatch(false);
  }

  const selectedFmt = OUTPUT_FORMATS.find((o) => o.id === outputFormat)!;
  const showQuality = selectedFmt.lossy;

  // ==================== No file state ====================
  if (!file && !isBatch) {
    return (
      <div className="space-y-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }}
          />
          <Image size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">{t("dropzone")}</p>
          <p className="text-xs text-muted-foreground mt-2">
            JPG, PNG, WebP, GIF, BMP, SVG, HEIC, AVIF, TIFF, ICO
          </p>
        </div>
      </div>
    );
  }

  // ==================== Batch mode ====================
  if (isBatch) {
    return (
      <div className="space-y-6">
        {/* Detected format badge */}
        {detectedFormat && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("detected")}:</span>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
              {detectedFormat.label}
            </span>
          </div>
        )}

        {/* Output format selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">{t("outputFormat")}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {OUTPUT_FORMATS.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setOutputFormat(fmt.id)}
                className={`relative rounded-lg border-2 p-3 text-center transition-all cursor-pointer ${
                  outputFormat === fmt.id
                    ? "border-current shadow-md"
                    : "border-border hover:border-muted-foreground/40"
                }`}
                style={outputFormat === fmt.id ? { color: fmt.color, borderColor: fmt.color } : undefined}
              >
                <p className="font-bold text-sm" style={{ color: fmt.color }}>{fmt.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {fmt.lossy ? t("lossy") : t("lossless")}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Quality slider */}
        {showQuality && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t("quality")}</label>
              <span className="text-sm font-mono text-primary">{quality}%</span>
            </div>
            <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
          </div>
        )}

        <BatchImageList
          files={batch.files}
          processing={batch.processing}
          totalProgress={batch.totalProgress}
          allDone={batch.allDone}
          doneCount={batch.doneCount}
          onRemove={batch.removeFile}
          onProcessAll={batch.processAll}
          onReset={reset}
        />
      </div>
    );
  }

  // ==================== Single file mode ====================
  return (
    <div className="space-y-6">
      {/* Detected format badge */}
      {detectedFormat && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">{t("detected")}:</span>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
            {detectedFormat.label}
          </span>
          {file && (
            <>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{formatFileSize(originalSize)}</span>
            </>
          )}
        </div>
      )}

      {/* Output format selector */}
      <div>
        <label className="text-sm font-medium mb-2 block">{t("outputFormat")}</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {OUTPUT_FORMATS.map((fmt) => {
            const isSelected = outputFormat === fmt.id;
            const isSameAsInput = detectedFormat && (
              (fmt.id === "jpeg" && (detectedFormat.ext === "jpg" || detectedFormat.ext === "jpeg")) ||
              (fmt.id === "png" && detectedFormat.ext === "png") ||
              (fmt.id === "webp" && detectedFormat.ext === "webp")
            );
            return (
              <button
                key={fmt.id}
                onClick={() => setOutputFormat(fmt.id)}
                className={`relative rounded-lg border-2 p-3 text-center transition-all cursor-pointer ${
                  isSelected
                    ? "shadow-md"
                    : "border-border hover:border-muted-foreground/40"
                }`}
                style={isSelected ? { borderColor: fmt.color } : undefined}
              >
                <p className="font-bold text-sm" style={{ color: fmt.color }}>{fmt.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {fmt.lossy ? t("lossy") : t("lossless")}
                </p>
                {isSameAsInput && (
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-muted rounded px-1 text-muted-foreground">
                    {t("same")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality slider */}
      {showQuality && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("quality")}</label>
            <span className="text-sm font-mono text-primary">{quality}%</span>
          </div>
          <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={convert}
          disabled={processing}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {processing ? t("processing") : `${t("convert")} → ${selectedFmt.label}`}
        </button>
        {resultUrl && (
          <button
            onClick={download}
            className="rounded-md bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            {t("download")} .{selectedFmt.ext}
          </button>
        )}
        <button
          onClick={reset}
          className="rounded-md border border-border px-4 py-2.5 text-sm transition-colors hover:bg-muted"
        >
          {t("reset")}
        </button>
      </div>

      {/* Size comparison */}
      {resultSize > 0 && (
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
            <p className="text-sm font-bold">{formatFileSize(originalSize)}</p>
            <p className="text-xs text-muted-foreground">{detectedFormat?.label ?? "Original"}</p>
          </div>
          <div className="text-muted-foreground text-lg">→</div>
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
            <p className="text-sm font-bold" style={{ color: selectedFmt.color }}>{formatFileSize(resultSize)}</p>
            <p className="text-xs text-muted-foreground">{selectedFmt.label}</p>
          </div>
          {resultSize < originalSize && (
            <span className="text-xs text-green-500 font-medium">
              -{Math.round((1 - resultSize / originalSize) * 100)}%
            </span>
          )}
        </div>
      )}

      {/* Preview */}
      <div className="grid gap-4 md:grid-cols-2">
        {preview && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">{detectedFormat?.label ?? "Original"}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Original" className="max-h-[300px] w-full rounded-lg border border-border object-contain bg-muted/30" />
          </div>
        )}
        {resultUrl && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">{selectedFmt.label}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt="Converted" className="max-h-[300px] w-full rounded-lg border border-border object-contain bg-muted/30" />
          </div>
        )}
      </div>
    </div>
  );
}
