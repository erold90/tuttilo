"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { configurePdfjsWorker } from "@/lib/pdf-utils";
import { FileText, CheckCircle } from "@phosphor-icons/react";
import { SafariPdfBanner } from "@/components/safari-pdf-banner";

export function PdfCompare() {
  const t = useTranslations("tools.pdf-compare.ui");
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [pages, setPages] = useState<{ a: string; b: string; diff: number }[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);

  useEffect(() => {
    import("pdfjs-dist").then((lib) => {
      configurePdfjsWorker(lib);
      setPdfjsLib(lib);
    });
  }, []);

  const loadFile = useCallback((f: File, which: "a" | "b") => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setError(""); setPages([]);
    if (which === "a") setFileA(f); else setFileB(f);
  }, []);

  const compare = useCallback(async () => {
    if (!fileA || !fileB || !pdfjsLib) return;
    setProcessing(true); setError(""); setPages([]);
    try {
      const [bytesA, bytesB] = await Promise.all([fileA.arrayBuffer(), fileB.arrayBuffer()]);
      const [docA, docB] = await Promise.all([
        pdfjsLib.getDocument({ data: bytesA }).promise,
        pdfjsLib.getDocument({ data: bytesB }).promise,
      ]);
      const maxPages = Math.max(docA.numPages, docB.numPages);
      const result: { a: string; b: string; diff: number }[] = [];
      const scale = 1.5;

      for (let i = 1; i <= maxPages; i++) {
        const renderPage = async (doc: Awaited<ReturnType<typeof pdfjsLib.getDocument>["promise"]>, pageNum: number) => {
          if (pageNum > doc.numPages) return { dataUrl: "", imageData: null as ImageData | null };
          const page = await doc.getPage(pageNum);
          const vp = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width; canvas.height = vp.height;
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          await (page.render({ canvasContext: ctx, viewport: vp, canvas } as Parameters<typeof page.render>[0]).promise);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          canvas.width = 0; canvas.height = 0;
          return { dataUrl, imageData };
        };

        const [rA, rB] = await Promise.all([renderPage(docA, i), renderPage(docB, i)]);

        // Calculate pixel difference
        let diffPixels = 0;
        let totalPixels = 1;
        if (rA.imageData && rB.imageData) {
          const lenA = rA.imageData.data.length;
          const lenB = rB.imageData.data.length;
          const len = Math.min(lenA, lenB);
          totalPixels = len / 4;
          for (let p = 0; p < len; p += 4) {
            const dr = Math.abs(rA.imageData.data[p] - rB.imageData.data[p]);
            const dg = Math.abs(rA.imageData.data[p + 1] - rB.imageData.data[p + 1]);
            const db = Math.abs(rA.imageData.data[p + 2] - rB.imageData.data[p + 2]);
            if (dr + dg + db > 30) diffPixels++;
          }
        } else {
          diffPixels = totalPixels;
        }

        result.push({
          a: rA.dataUrl,
          b: rB.dataUrl,
          diff: Math.round((diffPixels / totalPixels) * 100),
        });
      }

      docA.destroy(); docB.destroy();
      setPages(result);
      setCurrentPage(0);
    } catch (err) {
      console.error("Compare error:", err);
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [fileA, fileB, pdfjsLib, t]);

  const reset = useCallback(() => {
    setFileA(null); setFileB(null); setPages([]); setError("");
  }, []);

  const dropHandler = (which: "a" | "b") => ({
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); },
    onDragLeave: (e: React.DragEvent) => { e.currentTarget.classList.remove("border-primary"); },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0], which); },
    onClick: () => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf"; input.onchange = () => input.files?.[0] && loadFile(input.files[0], which); input.click(); },
  });

  return (
    <div className="space-y-6">
      <SafariPdfBanner />
      {pages.length === 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div {...dropHandler("a")}
              className={`border-2 border-dashed rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer ${fileA ? "border-green-500/50 bg-green-500/5" : "border-muted-foreground/25"}`}>
              {fileA ? <CheckCircle size={36} weight="duotone" className="mx-auto mb-2 text-green-500" /> : <FileText size={36} weight="duotone" className="mx-auto mb-2 text-muted-foreground" />}
              <p className="text-sm font-medium">{fileA ? fileA.name : t("dropzoneA")}</p>
            </div>
            <div {...dropHandler("b")}
              className={`border-2 border-dashed rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer ${fileB ? "border-green-500/50 bg-green-500/5" : "border-muted-foreground/25"}`}>
              {fileB ? <CheckCircle size={36} weight="duotone" className="mx-auto mb-2 text-green-500" /> : <FileText size={36} weight="duotone" className="mx-auto mb-2 text-muted-foreground" />}
              <p className="text-sm font-medium">{fileB ? fileB.name : t("dropzoneB")}</p>
            </div>
          </div>
          <button onClick={compare} disabled={!fileA || !fileB || processing || !pdfjsLib}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {processing ? t("processing") : t("compare")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}
                className="px-3 py-1 rounded border border-border text-sm disabled:opacity-30">←</button>
              <span className="text-sm font-medium">{currentPage + 1} / {pages.length}</span>
              <button onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))} disabled={currentPage === pages.length - 1}
                className="px-3 py-1 rounded border border-border text-sm disabled:opacity-30">→</button>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${pages[currentPage].diff === 0 ? "text-green-500" : pages[currentPage].diff < 5 ? "text-yellow-500" : "text-red-500"}`}>
                {pages[currentPage].diff === 0 ? t("identical") : `${pages[currentPage].diff}% ${t("different")}`}
              </span>
              <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">{t("reset")}</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-border rounded-lg overflow-hidden">
              <p className="text-xs font-medium text-center py-1 bg-muted">{fileA?.name}</p>
              {pages[currentPage].a ? (
                <img src={pages[currentPage].a} alt={`Page ${currentPage + 1} A`} className="w-full" />
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">{t("noPage")}</div>
              )}
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <p className="text-xs font-medium text-center py-1 bg-muted">{fileB?.name}</p>
              {pages[currentPage].b ? (
                <img src={pages[currentPage].b} alt={`Page ${currentPage + 1} B`} className="w-full" />
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">{t("noPage")}</div>
              )}
            </div>
          </div>
        </div>
      )}
      {error && <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>}
    </div>
  );
}
