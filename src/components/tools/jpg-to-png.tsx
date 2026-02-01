"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { convertImageFormat, formatFileSize, triggerDownload, revokeUrls } from "@/lib/image-utils";
import { useBatchImage } from "@/hooks/use-batch-image";
import { BatchImageList } from "@/components/tools/batch-image-list";

export function JpgToPng() {
  const t = useTranslations("tools.jpg-to-png.ui");

  // Single file state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Batch state
  const processFile = useCallback(
    (f: File) => convertImageFormat(f, "image/png"),
    []
  );
  const batch = useBatchImage({ processFile });
  const [isBatch, setIsBatch] = useState(false);

  function handleFiles(fileList: FileList) {
    if (fileList.length > 1) {
      setIsBatch(true);
      batch.addFiles(Array.from(fileList));
    } else if (fileList.length === 1) {
      setIsBatch(false);
      const f = fileList[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResultUrl("");
      setError("");
      setOriginalSize(f.size);
      setResultSize(0);
    }
  }

  async function convert() {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const { blob, url } = await convertImageFormat(file, "image/png");
      revokeUrls(resultUrl);
      setResultUrl(url);
      setResultSize(blob.size);
    } catch {
      setError(t("error"));
    }
    setProcessing(false);
  }

  function download() {
    if (!resultUrl || !file) return;
    triggerDownload(resultUrl, file.name.replace(/\.(jpg|jpeg)$/i, ".png"));
  }

  function reset() {
    revokeUrls(preview, resultUrl);
    setFile(null);
    setPreview("");
    setResultUrl("");
    setError("");
    setOriginalSize(0);
    setResultSize(0);
    batch.reset();
    setIsBatch(false);
  }

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
          <input ref={inputRef} type="file" accept="image/jpeg" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }} />
          <div className="text-4xl mb-3">🔄</div>
          <p className="text-sm font-medium">{t("dropzone")}</p>
          <p className="text-xs text-muted-foreground mt-1">JPG → PNG</p>
        </div>
      </div>
    );
  }

  if (isBatch) {
    return (
      <div className="space-y-6">
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>
      )}

      <div className="flex flex-wrap gap-3">
        <button onClick={convert} disabled={processing} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
          {processing ? t("processing") : t("convert")}
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

      {resultSize > 0 && (
        <div className="flex gap-3">
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
            <p className="text-sm font-bold">{formatFileSize(originalSize)}</p>
            <p className="text-xs text-muted-foreground">JPG</p>
          </div>
          <div className="text-muted-foreground self-center">→</div>
          <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
            <p className="text-sm font-bold text-primary">{formatFileSize(resultSize)}</p>
            <p className="text-xs text-muted-foreground">PNG</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">JPG</p>
          <img src={preview} alt="Original" className="max-h-[300px] w-full rounded-lg border border-border object-contain bg-muted/30" />
        </div>
        {resultUrl && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">PNG</p>
            <img src={resultUrl} alt="Converted" className="max-h-[300px] w-full rounded-lg border border-border object-contain bg-muted/30" />
          </div>
        )}
      </div>
    </div>
  );
}
