"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";

export function PdfToJpg() {
  const t = useTranslations("tools.pdf-to-jpg.ui");
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.85);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ url: string; name: string; size: number }[]>([]);
  const [error, setError] = useState("");
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);

  useEffect(() => {
    import("pdfjs-dist").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.mjs`;
      setPdfjsLib(lib);
    });
  }, []);

  const loadPdf = useCallback((f: File) => {
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return;
    setError("");
    setResults([]);
    setFile(f);
  }, []);

  const convert = useCallback(async () => {
    if (!file || !pdfjsLib) return;
    setProcessing(true);
    setError("");
    setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const total = doc.numPages;
      const baseName = file.name.replace(/\.pdf$/i, "");
      const newResults: { url: string; name: string; size: number }[] = [];

      for (let i = 1; i <= total; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await (page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]).promise);

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/jpeg", quality);
        });

        newResults.push({
          url: URL.createObjectURL(blob),
          name: `${baseName}_page_${i}.jpg`,
          size: blob.size,
        });
        setProgress(Math.round((i / total) * 100));
      }
      setResults(newResults);
    } catch {
      setError(t("convertError"));
    } finally {
      setProcessing(false);
    }
  }, [file, quality, pdfjsLib, t]);

  const downloadFile = useCallback((url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  }, []);

  const downloadAll = useCallback(() => {
    results.forEach((r) => downloadFile(r.url, r.name));
  }, [results, downloadFile]);

  const reset = useCallback(() => {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setFile(null);
    setResults([]);
    setProgress(0);
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
      ) : results.length === 0 ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("quality")}: {Math.round(quality * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <button
            onClick={convert}
            disabled={processing || !pdfjsLib}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {processing ? `${t("processing")} ${progress}%` : t("convert")}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{t("results")} ({results.length})</h3>
            <div className="flex gap-2">
              <button onClick={downloadAll} className="text-sm text-primary hover:underline">{t("downloadAll")}</button>
              <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground">{t("reset")}</button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {results.map((r, i) => (
              <div key={i} className="bg-muted/50 rounded-lg overflow-hidden group cursor-pointer" onClick={() => downloadFile(r.url, r.name)}>
                <img src={r.url} alt={r.name} className="w-full aspect-[3/4] object-cover" />
                <div className="p-2">
                  <p className="text-xs truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(r.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}
    </div>
  );
}
