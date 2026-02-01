"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { degrees } from "pdf-lib";
import { loadPdfRobust, getPdfPageCount } from "@/lib/pdf-utils";

export function RotatePdf() {
  const t = useTranslations("tools.rotate-pdf.ui");
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [rotation, setRotation] = useState(90);
  const [applyTo, setApplyTo] = useState<"all" | "custom">("all");
  const [customPages, setCustomPages] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");

  const loadPdf = useCallback(async (f: File) => {
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return;
    setError("");
    setResultUrl("");
    try {
      const bytes = await f.arrayBuffer();
      const pages = await getPdfPageCount(bytes);
      setFile(f);
      setTotalPages(pages);
      setCustomPages(`1-${pages}`);
    } catch {
      setError(t("invalidPdf"));
    }
  }, [t]);

  const parsePages = (input: string, max: number): number[] => {
    const pages = new Set<number>();
    for (const part of input.split(",")) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map(Number);
        if (start >= 1 && end <= max && start <= end) {
          for (let i = start; i <= end; i++) pages.add(i - 1);
        }
      } else {
        const num = Number(trimmed);
        if (num >= 1 && num <= max) pages.add(num - 1);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const rotate = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const bytes = await file.arrayBuffer();
      const doc = await loadPdfRobust(bytes);

      const pagesToRotate = applyTo === "all"
        ? doc.getPageIndices()
        : parsePages(customPages, totalPages);

      if (pagesToRotate.length === 0) {
        setError(t("invalidRange"));
        setProcessing(false);
        return;
      }

      for (const pageIndex of pagesToRotate) {
        const page = doc.getPage(pageIndex);
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch {
      setError(t("rotateError"));
    } finally {
      setProcessing(false);
    }
  }, [file, rotation, applyTo, customPages, totalPages, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, "-rotated.pdf");
    a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setTotalPages(0);
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
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {totalPages} {t("pages")} \u00B7 {formatSize(file.size)}
            </p>
          </div>

          {/* Rotation angle */}
          <div>
            <label className="block text-sm font-medium mb-2">{t("rotationAngle")}</label>
            <div className="grid grid-cols-3 gap-2">
              {[90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  onClick={() => setRotation(deg)}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${rotation === deg ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                >
                  {deg}\u00B0
                </button>
              ))}
            </div>
          </div>

          {/* Apply to */}
          <div>
            <label className="block text-sm font-medium mb-2">{t("applyTo")}</label>
            <div className="flex gap-3">
              <button
                onClick={() => setApplyTo("all")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${applyTo === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
              >
                {t("allPages")}
              </button>
              <button
                onClick={() => setApplyTo("custom")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${applyTo === "custom" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
              >
                {t("customPages")}
              </button>
            </div>
          </div>

          {applyTo === "custom" && (
            <div>
              <input
                type="text"
                value={customPages}
                onChange={(e) => setCustomPages(e.target.value)}
                placeholder={t("pagesPlaceholder")}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">{t("pagesHint")}</p>
            </div>
          )}

          <button
            onClick={rotate}
            disabled={processing}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {processing ? t("processing") : t("rotate")}
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">\u2713</div>
          <p className="font-medium">{t("done")}</p>
          <p className="text-sm text-muted-foreground">{formatSize(resultSize)}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={download} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
            <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}
    </div>
  );
}
