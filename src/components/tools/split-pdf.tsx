"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PDFDocument } from "pdf-lib";
import { loadPdfRobust, getPdfPageCount } from "@/lib/pdf-utils";

export function SplitPdf() {
  const t = useTranslations("tools.split-pdf.ui");
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [rangeInput, setRangeInput] = useState("");
  const [splitMode, setSplitMode] = useState<"all" | "range">("all");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ url: string; name: string; size: number }[]>([]);
  const [error, setError] = useState("");

  const loadPdf = useCallback(async (f: File) => {
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return;
    setError("");
    setResults([]);
    try {
      const bytes = await f.arrayBuffer();
      const pages = await getPdfPageCount(bytes);
      setFile(f);
      setTotalPages(pages);
      setRangeInput(`1-${pages}`);
    } catch {
      setError(t("invalidPdf"));
    }
  }, [t]);

  const parseRanges = (input: string, max: number): number[][] => {
    const ranges: number[][] = [];
    for (const part of input.split(",")) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map(Number);
        if (start >= 1 && end <= max && start <= end) {
          ranges.push(Array.from({ length: end - start + 1 }, (_, i) => start + i - 1));
        }
      } else {
        const num = Number(trimmed);
        if (num >= 1 && num <= max) ranges.push([num - 1]);
      }
    }
    return ranges;
  };

  const split = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const src = await loadPdfRobust(bytes, {
        onProgress: (p) => setProgress(p),
      });
      const newResults: { url: string; name: string; size: number }[] = [];
      const baseName = file.name.replace(/\.pdf$/i, "");

      if (splitMode === "all") {
        for (let i = 0; i < src.getPageCount(); i++) {
          const newDoc = await PDFDocument.create();
          const [page] = await newDoc.copyPages(src, [i]);
          newDoc.addPage(page);
          const pdfBytes = await newDoc.save();
          const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
          newResults.push({
            url: URL.createObjectURL(blob),
            name: `${baseName}_page_${i + 1}.pdf`,
            size: blob.size,
          });
        }
      } else {
        const ranges = parseRanges(rangeInput, totalPages);
        if (ranges.length === 0) {
          setError(t("invalidRange"));
          setProcessing(false);
          return;
        }
        for (let r = 0; r < ranges.length; r++) {
          const newDoc = await PDFDocument.create();
          const pages = await newDoc.copyPages(src, ranges[r]);
          pages.forEach((page) => newDoc.addPage(page));
          const pdfBytes = await newDoc.save();
          const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
          const label = ranges[r].length === 1
            ? `page_${ranges[r][0] + 1}`
            : `pages_${ranges[r][0] + 1}-${ranges[r][ranges[r].length - 1] + 1}`;
          newResults.push({
            url: URL.createObjectURL(blob),
            name: `${baseName}_${label}.pdf`,
            size: blob.size,
          });
        }
      }
      setResults(newResults);
    } catch {
      setError(t("splitError"));
    } finally {
      setProcessing(false);
    }
  }, [file, splitMode, rangeInput, totalPages, t]);

  const downloadFile = useCallback((url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  }, []);

  const reset = useCallback(() => {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setFile(null);
    setTotalPages(0);
    setRangeInput("");
    setResults([]);
    setError("");
  }, [results]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadPdf(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf"; input.onchange = () => input.files?.[0] && loadPdf(input.files[0]); input.click(); }}
        >
          <div className="text-4xl mb-3">📄</div>
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="font-medium truncate">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {totalPages} {t("pages")} \u00B7 {formatSize(file.size)}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}

      {file && results.length === 0 && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => setSplitMode("all")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${splitMode === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
            >
              {t("splitAll")}
            </button>
            <button
              onClick={() => setSplitMode("range")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${splitMode === "range" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
            >
              {t("splitRange")}
            </button>
          </div>

          {splitMode === "range" && (
            <div>
              <label className="block text-sm font-medium mb-1">{t("rangeLabel")}</label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder={t("rangePlaceholder")}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">{t("rangeHint")}</p>
            </div>
          )}

          <button
            onClick={split}
            disabled={processing}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {processing ? (progress > 0 ? `${t("processing")} ${progress}%` : t("processing")) : t("split")}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{t("results")} ({results.length})</h3>
            <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground">{t("reset")}</button>
          </div>
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
              <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(r.size)}</p>
              </div>
              <button
                onClick={() => downloadFile(r.url, r.name)}
                className="py-1.5 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                {t("download")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
