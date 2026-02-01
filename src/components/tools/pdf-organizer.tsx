"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PDFDocument, degrees } from "pdf-lib";
import { loadPdfRobust, getPdfPageCount } from "@/lib/pdf-utils";

type Tab = "merge" | "split" | "rotate";

interface PdfFile {
  file: File;
  name: string;
  pages: number;
}

export function PdfOrganizer() {
  const t = useTranslations("tools.pdf-organizer.ui");
  const [tab, setTab] = useState<Tab>("merge");

  // --- Merge state ---
  const [mergeFiles, setMergeFiles] = useState<PdfFile[]>([]);
  const [mergeResult, setMergeResult] = useState("");
  const [mergeResultSize, setMergeResultSize] = useState(0);

  // --- Split state ---
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitTotalPages, setSplitTotalPages] = useState(0);
  const [splitMode, setSplitMode] = useState<"all" | "range">("all");
  const [splitRange, setSplitRange] = useState("");
  const [splitResults, setSplitResults] = useState<{ url: string; name: string; size: number }[]>([]);

  // --- Rotate state ---
  const [rotateFile, setRotateFile] = useState<File | null>(null);
  const [rotateTotalPages, setRotateTotalPages] = useState(0);
  const [rotation, setRotation] = useState(90);
  const [rotateApplyTo, setRotateApplyTo] = useState<"all" | "custom">("all");
  const [rotateCustomPages, setRotateCustomPages] = useState("");
  const [rotateResult, setRotateResult] = useState("");
  const [rotateResultSize, setRotateResultSize] = useState(0);

  // --- Shared state ---
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const resetTab = useCallback(() => {
    setError("");
    setProgress("");
    if (mergeResult) URL.revokeObjectURL(mergeResult);
    splitResults.forEach((r) => URL.revokeObjectURL(r.url));
    if (rotateResult) URL.revokeObjectURL(rotateResult);
    setMergeFiles([]);
    setMergeResult("");
    setMergeResultSize(0);
    setSplitFile(null);
    setSplitTotalPages(0);
    setSplitRange("");
    setSplitResults([]);
    setRotateFile(null);
    setRotateTotalPages(0);
    setRotateResult("");
    setRotateResultSize(0);
  }, [mergeResult, splitResults, rotateResult]);

  const switchTab = useCallback((newTab: Tab) => {
    resetTab();
    setTab(newTab);
  }, [resetTab]);

  // ==================== MERGE ====================
  const addMergeFiles = useCallback(async (newFiles: FileList | File[]) => {
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
      setMergeFiles((prev) => [...prev, ...pdfFiles]);
      setMergeResult("");
    }
  }, [t]);

  const removeMergeFile = useCallback((index: number) => {
    setMergeFiles((prev) => prev.filter((_, i) => i !== index));
    setMergeResult("");
  }, []);

  const moveMergeFile = useCallback((index: number, direction: -1 | 1) => {
    setMergeFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setMergeResult("");
  }, []);

  const doMerge = useCallback(async () => {
    if (mergeFiles.length < 2) return;
    setProcessing(true);
    setError("");
    try {
      const merged = await PDFDocument.create();
      for (let i = 0; i < mergeFiles.length; i++) {
        setProgress(`${i + 1}/${mergeFiles.length}`);
        const bytes = await mergeFiles[i].file.arrayBuffer();
        const doc = await loadPdfRobust(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }
      const pdfBytes = await merged.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (mergeResult) URL.revokeObjectURL(mergeResult);
      setMergeResult(URL.createObjectURL(blob));
      setMergeResultSize(blob.size);
    } catch {
      setError(t("mergeError"));
    } finally {
      setProcessing(false);
      setProgress("");
    }
  }, [mergeFiles, mergeResult, t]);

  // ==================== SPLIT ====================
  const loadSplitFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return;
    setError("");
    setSplitResults([]);
    try {
      const bytes = await f.arrayBuffer();
      const pages = await getPdfPageCount(bytes);
      setSplitFile(f);
      setSplitTotalPages(pages);
      setSplitRange(`1-${pages}`);
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

  const doSplit = useCallback(async () => {
    if (!splitFile) return;
    setProcessing(true);
    setError("");
    try {
      const bytes = await splitFile.arrayBuffer();
      const src = await loadPdfRobust(bytes);
      const newResults: { url: string; name: string; size: number }[] = [];
      const baseName = splitFile.name.replace(/\.pdf$/i, "");

      if (splitMode === "all") {
        for (let i = 0; i < src.getPageCount(); i++) {
          const newDoc = await PDFDocument.create();
          const [page] = await newDoc.copyPages(src, [i]);
          newDoc.addPage(page);
          const pdfBytes = await newDoc.save();
          const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
          newResults.push({ url: URL.createObjectURL(blob), name: `${baseName}_page_${i + 1}.pdf`, size: blob.size });
        }
      } else {
        const ranges = parseRanges(splitRange, splitTotalPages);
        if (ranges.length === 0) {
          setError(t("invalidRange"));
          setProcessing(false);
          return;
        }
        for (const range of ranges) {
          const newDoc = await PDFDocument.create();
          const pages = await newDoc.copyPages(src, range);
          pages.forEach((page) => newDoc.addPage(page));
          const pdfBytes = await newDoc.save();
          const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
          const label = range.length === 1 ? `page_${range[0] + 1}` : `pages_${range[0] + 1}-${range[range.length - 1] + 1}`;
          newResults.push({ url: URL.createObjectURL(blob), name: `${baseName}_${label}.pdf`, size: blob.size });
        }
      }
      setSplitResults(newResults);
    } catch {
      setError(t("splitError"));
    } finally {
      setProcessing(false);
    }
  }, [splitFile, splitMode, splitRange, splitTotalPages, t]);

  // ==================== ROTATE ====================
  const loadRotateFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return;
    setError("");
    setRotateResult("");
    try {
      const bytes = await f.arrayBuffer();
      const pages = await getPdfPageCount(bytes);
      setRotateFile(f);
      setRotateTotalPages(pages);
      setRotateCustomPages(`1-${pages}`);
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

  const doRotate = useCallback(async () => {
    if (!rotateFile) return;
    setProcessing(true);
    setError("");
    try {
      const bytes = await rotateFile.arrayBuffer();
      const doc = await loadPdfRobust(bytes);
      const pagesToRotate = rotateApplyTo === "all" ? doc.getPageIndices() : parsePages(rotateCustomPages, rotateTotalPages);

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
      if (rotateResult) URL.revokeObjectURL(rotateResult);
      setRotateResult(URL.createObjectURL(blob));
      setRotateResultSize(blob.size);
    } catch {
      setError(t("rotateError"));
    } finally {
      setProcessing(false);
    }
  }, [rotateFile, rotation, rotateApplyTo, rotateCustomPages, rotateTotalPages, rotateResult, t]);

  // ==================== DOWNLOADS ====================
  const downloadUrl = useCallback((url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  }, []);

  // ==================== DROP ZONE ====================
  const DropZone = ({ onFile, multi, hint }: { onFile: (files: FileList) => void; multi?: boolean; hint?: string }) => (
    <div
      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
      onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
      onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); onFile(e.dataTransfer.files); }}
      className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
      onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf"; input.multiple = !!multi; input.onchange = () => input.files && onFile(input.files); input.click(); }}
    >
      <div className="text-4xl mb-3">📄</div>
      <p className="text-lg font-medium">{t("dropzone")}</p>
      <p className="text-sm text-muted-foreground mt-1">{hint || t("dropzoneHint")}</p>
    </div>
  );

  // ==================== RENDER ====================
  return (
    <div className="space-y-6">
      {/* Tab selector */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
        {(["merge", "split", "rotate"] as const).map((t_) => (
          <button
            key={t_}
            onClick={() => switchTab(t_)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${tab === t_ ? "bg-background shadow-sm" : "hover:bg-muted"}`}
          >
            {t(t_)}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}

      {/* ===== MERGE TAB ===== */}
      {tab === "merge" && (
        <>
          <DropZone onFile={(files) => addMergeFiles(files)} multi hint={t("dropzoneHintMulti")} />

          {mergeFiles.length > 0 && !mergeResult && (
            <div className="space-y-2">
              <h3 className="font-medium">{t("files")} ({mergeFiles.length})</h3>
              {mergeFiles.map((f, i) => (
                <div key={`${f.name}-${i}`} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                  <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.pages} {t("pages")} · {formatSize(f.file.size)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => moveMergeFile(i, -1)} disabled={i === 0} className="p-1.5 rounded hover:bg-muted disabled:opacity-30" title={t("moveUp")}>↑</button>
                    <button onClick={() => moveMergeFile(i, 1)} disabled={i === mergeFiles.length - 1} className="p-1.5 rounded hover:bg-muted disabled:opacity-30" title={t("moveDown")}>↓</button>
                    <button onClick={() => removeMergeFile(i)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive" title={t("remove")}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {mergeFiles.length >= 2 && !mergeResult && (
            <button onClick={doMerge} disabled={processing} className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {processing ? (progress ? `${t("processing")} ${progress}` : t("processing")) : t("mergeBtn")}
            </button>
          )}

          {mergeResult && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
              <div className="text-3xl">✓</div>
              <p className="font-medium">{t("done")}</p>
              <p className="text-sm text-muted-foreground">{mergeFiles.reduce((s, f) => s + f.pages, 0)} {t("pages")} · {formatSize(mergeResultSize)}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => downloadUrl(mergeResult, "merged.pdf")} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
                <button onClick={resetTab} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== SPLIT TAB ===== */}
      {tab === "split" && (
        <>
          {!splitFile ? (
            <DropZone onFile={(files) => files[0] && loadSplitFile(files[0])} />
          ) : splitResults.length === 0 ? (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-medium truncate">{splitFile.name}</p>
                <p className="text-sm text-muted-foreground">{splitTotalPages} {t("pages")} · {formatSize(splitFile.size)}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSplitMode("all")} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${splitMode === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                  {t("splitAll")}
                </button>
                <button onClick={() => setSplitMode("range")} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${splitMode === "range" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                  {t("splitRange")}
                </button>
              </div>

              {splitMode === "range" && (
                <div>
                  <label className="block text-sm font-medium mb-1">{t("rangeLabel")}</label>
                  <input type="text" value={splitRange} onChange={(e) => setSplitRange(e.target.value)} placeholder={t("rangePlaceholder")} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" />
                  <p className="text-xs text-muted-foreground mt-1">{t("rangeHint")}</p>
                </div>
              )}

              <button onClick={doSplit} disabled={processing} className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {processing ? t("processing") : t("splitBtn")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{t("results")} ({splitResults.length})</h3>
                <button onClick={resetTab} className="text-sm text-muted-foreground hover:text-foreground">{t("reset")}</button>
              </div>
              {splitResults.map((r, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                  <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(r.size)}</p>
                  </div>
                  <button onClick={() => downloadUrl(r.url, r.name)} className="py-1.5 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">{t("download")}</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== ROTATE TAB ===== */}
      {tab === "rotate" && (
        <>
          {!rotateFile ? (
            <DropZone onFile={(files) => files[0] && loadRotateFile(files[0])} />
          ) : !rotateResult ? (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-medium truncate">{rotateFile.name}</p>
                <p className="text-sm text-muted-foreground">{rotateTotalPages} {t("pages")} · {formatSize(rotateFile.size)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("rotationAngle")}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[90, 180, 270].map((deg) => (
                    <button key={deg} onClick={() => setRotation(deg)} className={`py-2 px-4 rounded-lg font-medium transition-colors ${rotation === deg ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("applyTo")}</label>
                <div className="flex gap-3">
                  <button onClick={() => setRotateApplyTo("all")} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${rotateApplyTo === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                    {t("allPages")}
                  </button>
                  <button onClick={() => setRotateApplyTo("custom")} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${rotateApplyTo === "custom" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                    {t("customPages")}
                  </button>
                </div>
              </div>

              {rotateApplyTo === "custom" && (
                <div>
                  <input type="text" value={rotateCustomPages} onChange={(e) => setRotateCustomPages(e.target.value)} placeholder={t("pagesPlaceholder")} className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm" />
                  <p className="text-xs text-muted-foreground mt-1">{t("pagesHint")}</p>
                </div>
              )}

              <button onClick={doRotate} disabled={processing} className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {processing ? t("processing") : t("rotateBtn")}
              </button>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
              <div className="text-3xl">✓</div>
              <p className="font-medium">{t("done")}</p>
              <p className="text-sm text-muted-foreground">{formatSize(rotateResultSize)}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => downloadUrl(rotateResult, rotateFile!.name.replace(/\.pdf$/i, "-rotated.pdf"))} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
                <button onClick={resetTab} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
