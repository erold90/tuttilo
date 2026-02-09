"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { PDFDocument } from "pdf-lib";
import { loadPdfRobust, configurePdfjsWorker } from "@/lib/pdf-utils";
import { LockOpen } from "@phosphor-icons/react";
import { SafariPdfBanner } from "@/components/safari-pdf-banner";

export function UnlockPdf() {
  const t = useTranslations("tools.unlock-pdf.ui");
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);

  useEffect(() => {
    import("pdfjs-dist").then((lib) => {
      configurePdfjsWorker(lib);
      setPdfjsLib(lib);
    }).catch((err) => {
      console.error("Failed to load pdfjs-dist:", err);
    });
  }, []);

  const loadFile = useCallback((f: File) => {
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return;
    setError("");
    setResultUrl("");
    setFile(f);
  }, []);

  const reconstructWithPdfjs = useCallback(async (
    bytes: ArrayBuffer,
    pw?: string,
  ): Promise<{ url: string; size: number } | null> => {
    if (!pdfjsLib) return null;
    const pdfDoc = await pdfjsLib.getDocument({ data: bytes, password: pw || undefined }).promise;
    const total = pdfDoc.numPages;
    const newDoc = await PDFDocument.create();

    for (let i = 1; i <= total; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await (page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]).promise);

      const jpgBlob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), "image/jpeg", 0.92)
      );
      const jpgBytes = await jpgBlob.arrayBuffer();
      const img = await newDoc.embedJpg(jpgBytes);

      const origViewport = page.getViewport({ scale: 1 });
      const newPage = newDoc.addPage([origViewport.width, origViewport.height]);
      newPage.drawImage(img, { x: 0, y: 0, width: origViewport.width, height: origViewport.height });

      canvas.width = 0; canvas.height = 0;
      setProgress(Math.round((i / total) * 100));
    }

    pdfDoc.destroy();
    const unlockedBytes = await newDoc.save();
    const blob = new Blob([unlockedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    return { url: URL.createObjectURL(blob), size: blob.size };
  }, [pdfjsLib]);

  const unlock = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setProgress(0);
    try {
      const bytes = await file.arrayBuffer();

      // If user provided a password, go directly to pdfjs-dist decryption
      if (password) {
        if (!pdfjsLib) {
          setError(t("unlockError"));
          return;
        }
        try {
          const result = await reconstructWithPdfjs(bytes, password);
          if (result) {
            if (resultUrl) URL.revokeObjectURL(resultUrl);
            setResultUrl(result.url);
            setResultSize(result.size);
          }
        } catch (err) {
          console.error("UnlockPDF password error:", err);
          setError(t("wrongPassword"));
        }
        return;
      }

      // No password: try pdf-lib ignoreEncryption (handles owner-password / permission-only locks)
      try {
        const doc = await loadPdfRobust(bytes, {
          onProgress: (p) => setProgress(p),
        });
        const unlockedBytes = await doc.save();
        const blob = new Blob([unlockedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl(URL.createObjectURL(blob));
        setResultSize(blob.size);
        return;
      } catch {
        // pdf-lib failed
      }

      // Fallback: try pdfjs-dist without password
      try {
        const result = await reconstructWithPdfjs(bytes);
        if (result) {
          if (resultUrl) URL.revokeObjectURL(resultUrl);
          setResultUrl(result.url);
          setResultSize(result.size);
        }
      } catch (err) {
        console.error("UnlockPDF error:", err);
        setError(t("unlockError"));
      }
    } catch (err) {
      console.error("UnlockPDF error:", err);
      setError(t("unlockError"));
    } finally {
      setProcessing(false);
    }
  }, [file, password, pdfjsLib, resultUrl, t, reconstructWithPdfjs]);

  const download = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file ? file.name.replace(/\.pdf$/i, "_unlocked.pdf") : "unlocked.pdf";
    a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPassword("");
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
      <SafariPdfBanner />
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf"; input.onchange = () => input.files?.[0] && loadFile(input.files[0]); input.click(); }}
        >
          <LockOpen size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t("password")}</label>
            <input
              type="text"
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && unlock()}
            />
            <p className="text-xs text-muted-foreground mt-1">{t("passwordHint")}</p>
          </div>

          <button
            onClick={unlock}
            disabled={processing || !pdfjsLib}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {processing ? (progress > 0 ? `${t("processing")} ${progress}%` : t("processing")) : t("unlock")}
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
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
