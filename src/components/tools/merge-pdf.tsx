"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PDFDocument } from "pdf-lib";
import { loadPdfRobust, getPdfPageCount } from "@/lib/pdf-utils";

interface PdfFile {
  file: File;
  name: string;
  pages: number;
}

export function MergePdf() {
  const t = useTranslations("tools.merge-pdf.ui");
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    setError("");
    const pdfFiles: PdfFile[] = [];
    for (const file of Array.from(newFiles)) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) continue;
      try {
        const bytes = await file.arrayBuffer();
        const pages = await getPdfPageCount(bytes);
        pdfFiles.push({ file, name: file.name, pages });
      } catch {
        setError(t("invalidPdf"));
      }
    }
    if (pdfFiles.length > 0) {
      setFiles((prev) => [...prev, ...pdfFiles]);
      setResultUrl("");
    }
  }, [t]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResultUrl("");
  }, []);

  const moveFile = useCallback((index: number, direction: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setResultUrl("");
  }, []);

  const merge = useCallback(async () => {
    if (files.length < 2) return;
    setProcessing(true);
    setError("");
    setProgress("");
    try {
      const merged = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        setProgress(`${i + 1}/${files.length}`);
        const bytes = await files[i].file.arrayBuffer();
        const doc = await loadPdfRobust(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }
      const pdfBytes = await merged.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch {
      setError(t("mergeError"));
    } finally {
      setProcessing(false);
    }
  }, [files, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "merged.pdf";
    a.click();
  }, [resultUrl]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]);
    setResultUrl("");
    setResultSize(0);
    setError("");
  }, [resultUrl]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
        onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); addFiles(e.dataTransfer.files); }}
        className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf"; input.multiple = true; input.onchange = () => input.files && addFiles(input.files); input.click(); }}
      >
        <div className="text-4xl mb-3">📄</div>
        <p className="text-lg font-medium">{t("dropzone")}</p>
        <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">{t("files")} ({files.length})</h3>
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
              <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground">
                  {f.pages} {t("pages")} · {formatSize(f.file.size)}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => moveFile(i, -1)} disabled={i === 0} className="p-1.5 rounded hover:bg-muted disabled:opacity-30" title={t("moveUp")}>↑</button>
                <button onClick={() => moveFile(i, 1)} disabled={i === files.length - 1} className="p-1.5 rounded hover:bg-muted disabled:opacity-30" title={t("moveDown")}>↓</button>
                <button onClick={() => removeFile(i)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive" title={t("remove")}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {files.length >= 2 && !resultUrl && (
        <button
          onClick={merge}
          disabled={processing}
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {processing ? (progress ? `${t("processing")} ${progress}` : t("processing")) : t("merge")}
        </button>
      )}

      {/* Result */}
      {resultUrl && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
          <p className="font-medium">{t("done")}</p>
          <p className="text-sm text-muted-foreground">
            {files.reduce((sum, f) => sum + f.pages, 0)} {t("pages")} · {formatSize(resultSize)}
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
