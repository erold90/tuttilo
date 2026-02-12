"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { loadPdfRobust } from "@/lib/pdf-utils";
import { FileArrowDown } from "@phosphor-icons/react";
import { useFileInput } from "@/hooks/use-file-input";

export function CompressPdf() {
  const t = useTranslations("tools.compress-pdf.ui");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [error, setError] = useState("");

  const loadPdf = useCallback((f: File) => {
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return;
    setError("");
    setResultUrl("");
    setFile(f);
    setOriginalSize(f.size);
  }, []);

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({ accept: ".pdf", onFile: loadPdf });

  const compress = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await loadPdfRobust(bytes, {
        onProgress: (p) => setProgress(p),
      });

      // Strip metadata for compression
      doc.setTitle("");
      doc.setAuthor("");
      doc.setSubject("");
      doc.setKeywords([]);
      doc.setProducer("");
      doc.setCreator("");

      const pdfBytes = await doc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setCompressedSize(blob.size);
    } catch (err) {
      console.error("CompressPDF error:", err);
      setError(t("compressError"));
    } finally {
      setProcessing(false);
    }
  }, [file, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, "-compressed.pdf");
    a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setResultUrl("");
    setOriginalSize(0);
    setCompressedSize(0);
    setError("");
  }, [resultUrl]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const reductionPercent = originalSize > 0 && compressedSize > 0
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {!file ? (
        <>
          <input {...fileInputProps} />
          <div
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadPdf(e.dataTransfer.files[0]); }}
            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={openFileDialog}
          >
            <FileArrowDown size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-medium">{t("dropzone")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
          </div>
        </>
      ) : (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="font-medium truncate">{file.name}</p>
          <p className="text-sm text-muted-foreground">{formatSize(originalSize)}</p>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}

      {file && !resultUrl && (
        <button
          onClick={compress}
          disabled={processing}
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {processing ? (progress > 0 ? `${t("processing")} ${progress}%` : t("processing")) : t("compress")}
        </button>
      )}

      {resultUrl && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 space-y-4">
          <div className="text-center">
            <div className="text-3xl mb-2">✓</div>
            <p className="font-medium">{t("done")}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">{t("original")}</p>
              <p className="font-medium">{formatSize(originalSize)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("compressed")}</p>
              <p className="font-medium">{formatSize(compressedSize)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("reduction")}</p>
              <p className="font-medium text-green-600">
                {reductionPercent > 0 ? `-${reductionPercent}%` : t("noReduction")}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={download} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
            <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
