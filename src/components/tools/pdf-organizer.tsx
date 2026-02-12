"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { PDFDocument, degrees } from "pdf-lib";
import { loadPdfRobust, getPdfPageCount, configurePdfjsWorker } from "@/lib/pdf-utils";
import { SquaresFour, DotsSixVertical, X, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SafariPdfBanner } from "@/components/safari-pdf-banner";
import { useFileInput } from "@/hooks/use-file-input";

type Tab = "merge" | "split" | "rotate";

interface PdfFile {
  file: File;
  name: string;
  pages: number;
  thumbnail: string;
}

export function PdfOrganizer() {
  const t = useTranslations("tools.pdf-organizer.ui");
  const [tab, setTab] = useState<Tab>("merge");
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);

  useEffect(() => {
    import("pdfjs-dist").then((lib) => {
      configurePdfjsWorker(lib);
      setPdfjsLib(lib);
    });
  }, []);

  const genThumbnails = useCallback(async (
    bytes: Uint8Array,
    opts?: { maxPages?: number; onThumbnail?: (idx: number, url: string) => void }
  ): Promise<string[]> => {
    if (!pdfjsLib) return [];
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(bytes) }).promise;
    const total = opts?.maxPages ? Math.min(opts.maxPages, doc.numPages) : doc.numPages;
    const thumbnails: string[] = [];
    for (let i = 1; i <= total; i++) {
      const page = await doc.getPage(i);
      const vp = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement("canvas");
      canvas.width = vp.width;
      canvas.height = vp.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await (page.render({ canvasContext: ctx, viewport: vp, canvas } as Parameters<typeof page.render>[0]).promise);
      const url = canvas.toDataURL("image/jpeg", 0.65);
      thumbnails.push(url);
      opts?.onThumbnail?.(i - 1, url);
      canvas.width = 0;
      canvas.height = 0;
    }
    doc.destroy();
    return thumbnails;
  }, [pdfjsLib]);

  // --- Merge ---
  const [mergeFiles, setMergeFiles] = useState<PdfFile[]>([]);
  const [mergeResult, setMergeResult] = useState("");
  const [mergeResultSize, setMergeResultSize] = useState(0);
  const [loadingMerge, setLoadingMerge] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // --- Split ---
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitTotalPages, setSplitTotalPages] = useState(0);
  const [splitThumbs, setSplitThumbs] = useState<string[]>([]);
  const [splitLoadingThumbs, setSplitLoadingThumbs] = useState(false);
  const [splitMode, setSplitMode] = useState<"select" | "all">("select");
  const [splitSelected, setSplitSelected] = useState<Set<number>>(new Set());
  const [splitResults, setSplitResults] = useState<{ url: string; name: string; size: number }[]>([]);

  // --- Rotate ---
  const [rotateFile, setRotateFile] = useState<File | null>(null);
  const [rotateTotalPages, setRotateTotalPages] = useState(0);
  const [rotateThumbs, setRotateThumbs] = useState<string[]>([]);
  const [rotateLoadingThumbs, setRotateLoadingThumbs] = useState(false);
  const [rotation, setRotation] = useState(90);
  const [rotateSelected, setRotateSelected] = useState<Set<number>>(new Set());
  const [rotateResult, setRotateResult] = useState("");
  const [rotateResultSize, setRotateResultSize] = useState(0);

  // --- Shared ---
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const resetTab = useCallback(() => {
    setError(""); setProgress("");
    if (mergeResult) URL.revokeObjectURL(mergeResult);
    splitResults.forEach((r) => URL.revokeObjectURL(r.url));
    if (rotateResult) URL.revokeObjectURL(rotateResult);
    setMergeFiles([]); setMergeResult(""); setMergeResultSize(0); setLoadingMerge(false);
    setSplitFile(null); setSplitTotalPages(0); setSplitThumbs([]); setSplitSelected(new Set()); setSplitResults([]); setSplitLoadingThumbs(false);
    setRotateFile(null); setRotateTotalPages(0); setRotateThumbs([]); setRotateSelected(new Set()); setRotateResult(""); setRotateResultSize(0); setRotateLoadingThumbs(false);
    setDragIdx(null); setDragOverIdx(null);
  }, [mergeResult, splitResults, rotateResult]);

  const switchTab = useCallback((newTab: Tab) => { resetTab(); setTab(newTab); }, [resetTab]);

  // ==================== MERGE ====================
  const addMergeFiles = useCallback(async (newFiles: FileList | File[]) => {
    setError(""); setLoadingMerge(true);
    const pdfFiles: PdfFile[] = [];
    for (const file of Array.from(newFiles)) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) continue;
      try {
        const bytes = await file.arrayBuffer();
        const pages = await getPdfPageCount(new Uint8Array(bytes));
        let thumbnail = "";
        try {
          const thumbs = await genThumbnails(new Uint8Array(bytes), { maxPages: 1 });
          thumbnail = thumbs[0] || "";
        } catch (e) {
          console.warn("Thumbnail generation failed:", e);
        }
        pdfFiles.push({ file, name: file.name, pages, thumbnail });
      } catch {
        setError(t("invalidPdf"));
      }
    }
    if (pdfFiles.length > 0) {
      setMergeFiles((prev) => [...prev, ...pdfFiles]);
      setMergeResult("");
    }
    setLoadingMerge(false);
  }, [t, genThumbnails]);

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
    setProcessing(true); setError("");
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
      setProcessing(false); setProgress("");
    }
  }, [mergeFiles, mergeResult, t]);

  // Drag handlers
  const onDragStart = useCallback((e: React.DragEvent, i: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDragIdx(i);
  }, []);
  const onDragOver = useCallback((e: React.DragEvent, i: number) => {
    e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverIdx(i);
  }, []);
  const onDragEnd = useCallback(() => { setDragIdx(null); setDragOverIdx(null); }, []);
  const onDrop = useCallback((e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== dropIdx) {
      setMergeFiles((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(dropIdx, 0, moved);
        return next;
      });
      setMergeResult("");
    }
    setDragIdx(null); setDragOverIdx(null);
  }, [dragIdx]);

  // ==================== SPLIT ====================
  const loadSplitFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return;
    setError(""); setSplitResults([]); setSplitSelected(new Set()); setSplitThumbs([]);
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const pages = await getPdfPageCount(bytes);
      setSplitFile(f); setSplitTotalPages(pages);
      setSplitLoadingThumbs(true);
      try {
        const allThumbs: string[] = [];
        await genThumbnails(bytes, {
          onThumbnail: (idx, url) => {
            allThumbs[idx] = url;
            if ((idx + 1) % 4 === 0 || idx === pages - 1) setSplitThumbs([...allThumbs]);
          },
        });
      } catch (e) {
        console.warn("Thumbnail generation failed:", e);
      }
      setSplitLoadingThumbs(false);
    } catch {
      setError(t("invalidPdf"));
    }
  }, [t, genThumbnails]);

  const toggleSplitPage = useCallback((idx: number) => {
    setSplitSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
    setSplitResults([]);
  }, []);

  const selectAllSplit = useCallback(() => {
    setSplitSelected(new Set(Array.from({ length: splitTotalPages }, (_, i) => i)));
  }, [splitTotalPages]);

  const deselectAllSplit = useCallback(() => setSplitSelected(new Set()), []);

  const doSplitExtract = useCallback(async () => {
    if (!splitFile || splitSelected.size === 0) return;
    setProcessing(true); setError("");
    try {
      const bytes = await splitFile.arrayBuffer();
      const src = await loadPdfRobust(bytes);
      const newDoc = await PDFDocument.create();
      const sorted = Array.from(splitSelected).sort((a, b) => a - b);
      const copiedPages = await newDoc.copyPages(src, sorted);
      copiedPages.forEach((p) => newDoc.addPage(p));
      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const baseName = splitFile.name.replace(/\.pdf$/i, "");
      setSplitResults([{ url: URL.createObjectURL(blob), name: `${baseName}_extracted.pdf`, size: blob.size }]);
    } catch {
      setError(t("splitError"));
    } finally {
      setProcessing(false);
    }
  }, [splitFile, splitSelected, t]);

  const doSplitAll = useCallback(async () => {
    if (!splitFile) return;
    setProcessing(true); setError("");
    try {
      const bytes = await splitFile.arrayBuffer();
      const src = await loadPdfRobust(bytes);
      const newResults: { url: string; name: string; size: number }[] = [];
      const baseName = splitFile.name.replace(/\.pdf$/i, "");
      for (let i = 0; i < src.getPageCount(); i++) {
        const newDoc = await PDFDocument.create();
        const [page] = await newDoc.copyPages(src, [i]);
        newDoc.addPage(page);
        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
        newResults.push({ url: URL.createObjectURL(blob), name: `${baseName}_page_${i + 1}.pdf`, size: blob.size });
      }
      setSplitResults(newResults);
    } catch {
      setError(t("splitError"));
    } finally {
      setProcessing(false);
    }
  }, [splitFile, t]);

  // ==================== ROTATE ====================
  const loadRotateFile = useCallback(async (f: File) => {
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return;
    setError(""); setRotateResult(""); setRotateSelected(new Set()); setRotateThumbs([]);
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const pages = await getPdfPageCount(bytes);
      setRotateFile(f); setRotateTotalPages(pages);
      setRotateLoadingThumbs(true);
      try {
        const allThumbs: string[] = [];
        await genThumbnails(bytes, {
          onThumbnail: (idx, url) => {
            allThumbs[idx] = url;
            if ((idx + 1) % 4 === 0 || idx === pages - 1) setRotateThumbs([...allThumbs]);
          },
        });
      } catch (e) {
        console.warn("Thumbnail generation failed:", e);
      }
      setRotateLoadingThumbs(false);
      setRotateSelected(new Set(Array.from({ length: pages }, (_, i) => i)));
    } catch {
      setError(t("invalidPdf"));
    }
  }, [t, genThumbnails]);

  const toggleRotatePage = useCallback((idx: number) => {
    setRotateSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
    setRotateResult("");
  }, []);

  const selectAllRotate = useCallback(() => {
    setRotateSelected(new Set(Array.from({ length: rotateTotalPages }, (_, i) => i)));
  }, [rotateTotalPages]);
  const deselectAllRotate = useCallback(() => setRotateSelected(new Set()), []);

  const doRotate = useCallback(async () => {
    if (!rotateFile || rotateSelected.size === 0) return;
    setProcessing(true); setError("");
    try {
      const bytes = await rotateFile.arrayBuffer();
      const doc = await loadPdfRobust(bytes);
      for (const idx of rotateSelected) {
        const page = doc.getPage(idx);
        page.setRotation(degrees(page.getRotation().angle + rotation));
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
  }, [rotateFile, rotateSelected, rotation, rotateResult, t]);

  // ==================== DOWNLOAD ====================
  const downloadUrl = useCallback((url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
  }, []);

  // ==================== SHARED COMPONENTS ====================
  const DropZone = ({ onFile, multi, hint }: { onFile: (files: FileList) => void; multi?: boolean; hint?: string }) => {
    const handleFile = useCallback((file: File) => {
      const dt = new DataTransfer();
      dt.items.add(file);
      onFile(dt.files);
    }, [onFile]);
    const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({ accept: ".pdf", onFile: handleFile, multiple: !!multi });
    return (
      <>
        <input {...fileInputProps} />
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); onFile(e.dataTransfer.files); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={openFileDialog}
        >
          <SquaresFour size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{hint || t("dropzoneHint")}</p>
        </div>
      </>
    );
  };

  const PageGrid = ({ thumbnails, totalPages, selectedPages, onToggle, rotationDeg, loading }: {
    thumbnails: string[]; totalPages: number; selectedPages?: Set<number>;
    onToggle?: (i: number) => void; rotationDeg?: number; loading?: boolean;
  }) => (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {Array.from({ length: totalPages }, (_, i) => {
          const thumb = thumbnails[i];
          const selected = selectedPages?.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle?.(i)}
              className={cn(
                "relative rounded-lg border-2 overflow-hidden transition-all",
                onToggle ? "cursor-pointer hover:shadow-md" : "cursor-default",
                selected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/50",
              )}
            >
              <div className="aspect-[3/4] bg-white flex items-center justify-center overflow-hidden">
                {thumb ? (
                  <img
                    src={thumb} alt={`${i + 1}`}
                    className="w-full h-full object-contain transition-transform duration-300"
                    style={rotationDeg && selected ? { transform: `rotate(${rotationDeg}deg) scale(0.7)` } : undefined}
                  />
                ) : (
                  <div className="w-full h-full animate-pulse bg-muted" />
                )}
              </div>
              <div className={cn(
                "text-xs font-medium text-center py-1 transition-colors",
                selected ? "bg-primary text-primary-foreground" : "bg-muted/70 text-muted-foreground"
              )}>
                {i + 1}
              </div>
              {selected && (
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <Check size={12} weight="bold" className="text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {loading && (
        <p className="text-xs text-muted-foreground text-center mt-2 animate-pulse">{t("loadingThumbnails")}</p>
      )}
    </div>
  );

  // ==================== RENDER ====================
  return (
    <div className="space-y-6">
      <SafariPdfBanner />
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

      {error && <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>}

      {/* ===== MERGE ===== */}
      {tab === "merge" && (
        <>
          <DropZone onFile={(files) => addMergeFiles(files)} multi hint={t("dropzoneHintMulti")} />

          {loadingMerge && (
            <p className="text-sm text-muted-foreground text-center animate-pulse">{t("loadingThumbnails")}</p>
          )}

          {mergeFiles.length > 0 && !mergeResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{t("files")} ({mergeFiles.length})</h3>
                <p className="text-xs text-muted-foreground hidden sm:block">{t("dragToReorder")}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mergeFiles.map((f, i) => (
                  <div
                    key={`${f.name}-${i}`}
                    draggable
                    onDragStart={(e) => onDragStart(e, i)}
                    onDragOver={(e) => onDragOver(e, i)}
                    onDragEnd={onDragEnd}
                    onDrop={(e) => onDrop(e, i)}
                    className={cn(
                      "relative rounded-xl border-2 overflow-hidden transition-all",
                      dragIdx === i && "opacity-40 scale-95",
                      dragOverIdx === i && dragIdx !== i ? "border-primary shadow-lg scale-[1.02]" : "border-border",
                    )}
                  >
                    <div className="aspect-[3/4] bg-white relative">
                      {f.thumbnail ? (
                        <img src={f.thumbnail} alt={f.name} className="w-full h-full object-contain" draggable={false} />
                      ) : (
                        <div className="w-full h-full animate-pulse bg-muted" />
                      )}
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {i + 1}
                      </div>
                    </div>
                    <div className="p-2 flex items-center gap-1.5">
                      <DotsSixVertical size={14} className="text-muted-foreground shrink-0 cursor-grab hidden sm:block" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{f.name}</p>
                        <p className="text-[10px] text-muted-foreground">{f.pages} {t("pages")} · {formatSize(f.file.size)}</p>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); moveMergeFile(i, -1); }} disabled={i === 0}
                          className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 sm:hidden" title={t("moveUp")}>
                          <span className="text-xs">&#x2191;</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); moveMergeFile(i, 1); }} disabled={i === mergeFiles.length - 1}
                          className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30 sm:hidden" title={t("moveDown")}>
                          <span className="text-xs">&#x2193;</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); removeMergeFile(i); }}
                          className="p-1 shrink-0 text-muted-foreground hover:text-destructive transition-colors" title={t("remove")}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mergeFiles.length >= 2 && !mergeResult && (
            <button onClick={doMerge} disabled={processing}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {processing ? (progress ? `${t("processing")} ${progress}` : t("processing")) : t("mergeBtn")}
            </button>
          )}

          {mergeResult && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
              <div className="text-3xl">&#x2713;</div>
              <p className="font-medium">{t("done")}</p>
              <p className="text-sm text-muted-foreground">{mergeFiles.reduce((s, f) => s + f.pages, 0)} {t("pages")} · {formatSize(mergeResultSize)}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => downloadUrl(mergeResult, "merged.pdf")}
                  className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
                <button onClick={resetTab}
                  className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== SPLIT ===== */}
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

              {/* Mode selector */}
              <div className="flex gap-2">
                <button onClick={() => { setSplitMode("select"); setSplitSelected(new Set()); }}
                  className={cn("flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors",
                    splitMode === "select" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80")}>
                  {t("selectPages")}
                </button>
                <button onClick={() => setSplitMode("all")}
                  className={cn("flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors",
                    splitMode === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80")}>
                  {t("splitAll")}
                </button>
              </div>

              {/* Page grid */}
              {(splitThumbs.length > 0 || splitLoadingThumbs) && (
                <>
                  <PageGrid
                    thumbnails={splitThumbs}
                    totalPages={splitTotalPages}
                    selectedPages={splitMode === "select" ? splitSelected : undefined}
                    onToggle={splitMode === "select" ? toggleSplitPage : undefined}
                    loading={splitLoadingThumbs}
                  />

                  {splitMode === "select" && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {splitSelected.size} {t("selected")}
                      </p>
                      <div className="flex gap-3">
                        <button onClick={selectAllSplit} className="text-xs text-primary hover:underline">{t("selectAll")}</button>
                        <button onClick={deselectAllSplit} className="text-xs text-muted-foreground hover:underline">{t("deselectAll")}</button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Action button */}
              {splitMode === "select" ? (
                <button onClick={doSplitExtract} disabled={processing || splitSelected.size === 0}
                  className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {processing ? t("processing") : splitSelected.size === 0 ? t("noSelection") : t("extractSelected")}
                </button>
              ) : (
                <button onClick={doSplitAll} disabled={processing}
                  className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {processing ? t("processing") : t("splitBtn")}
                </button>
              )}
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
                  <button onClick={() => downloadUrl(r.url, r.name)}
                    className="py-1.5 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">{t("download")}</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== ROTATE ===== */}
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

              {/* Rotation angle */}
              <div>
                <label className="block text-sm font-medium mb-2">{t("rotationAngle")}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[90, 180, 270].map((deg) => (
                    <button key={deg} onClick={() => setRotation(deg)}
                      className={cn("py-2 px-4 rounded-lg font-medium transition-colors",
                        rotation === deg ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80")}>
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>

              {/* Page grid */}
              {(rotateThumbs.length > 0 || rotateLoadingThumbs) && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">{t("selectPages")}</p>
                    <PageGrid
                      thumbnails={rotateThumbs}
                      totalPages={rotateTotalPages}
                      selectedPages={rotateSelected}
                      onToggle={toggleRotatePage}
                      rotationDeg={rotation}
                      loading={rotateLoadingThumbs}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {rotateSelected.size} {t("selected")}
                    </p>
                    <div className="flex gap-3">
                      <button onClick={selectAllRotate} className="text-xs text-primary hover:underline">{t("selectAll")}</button>
                      <button onClick={deselectAllRotate} className="text-xs text-muted-foreground hover:underline">{t("deselectAll")}</button>
                    </div>
                  </div>
                </>
              )}

              <button onClick={doRotate} disabled={processing || rotateSelected.size === 0}
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {processing ? t("processing") : rotateSelected.size === 0 ? t("noSelection") : t("rotateBtn")}
              </button>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
              <div className="text-3xl">&#x2713;</div>
              <p className="font-medium">{t("done")}</p>
              <p className="text-sm text-muted-foreground">{formatSize(rotateResultSize)}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => downloadUrl(rotateResult, rotateFile!.name.replace(/\.pdf$/i, "-rotated.pdf"))}
                  className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
                <button onClick={resetTab}
                  className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
