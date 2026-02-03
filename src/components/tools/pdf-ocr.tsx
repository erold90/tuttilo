"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";

const OCR_LANGS = [
  { code: "eng", label: "English" },
  { code: "ita", label: "Italiano" },
  { code: "spa", label: "Español" },
  { code: "fra", label: "Français" },
  { code: "deu", label: "Deutsch" },
  { code: "por", label: "Português" },
  { code: "jpn", label: "日本語" },
  { code: "kor", label: "한국어" },
];

export function PdfOcr() {
  const t = useTranslations("tools.pdf-ocr.ui");
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState("eng");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [resultText, setResultText] = useState("");
  const [error, setError] = useState("");
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);

  useEffect(() => {
    import("pdfjs-dist").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
      setPdfjsLib(lib);
    });
  }, []);

  const loadFile = useCallback((f: File) => {
    const isPdf = f.name.toLowerCase().endsWith(".pdf");
    const isImage = f.type.startsWith("image/");
    if (!isPdf && !isImage) return;
    setError(""); setResultText(""); setFile(f);
  }, []);

  const recognize = useCallback(async () => {
    if (!file) return;
    setProcessing(true); setError(""); setProgress(0); setResultText("");
    try {
      const Tesseract = await import("tesseract.js");
      const worker = await Tesseract.createWorker(lang, undefined, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setStatusMsg(t("recognizing"));
          }
        },
      });

      let allText = "";

      if (file.type.startsWith("image/")) {
        // Direct image OCR
        setStatusMsg(t("recognizing"));
        const { data } = await worker.recognize(file);
        allText = data.text;
      } else if (pdfjsLib) {
        // PDF: render each page then OCR
        const bytes = await file.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: bytes }).promise;

        for (let i = 1; i <= doc.numPages; i++) {
          setStatusMsg(`${t("renderingPage")} ${i}/${doc.numPages}`);
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await (page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]).promise);

          setStatusMsg(`OCR ${t("page")} ${i}/${doc.numPages}`);
          const { data } = await worker.recognize(canvas);
          allText += (allText ? `\n\n--- ${t("page")} ${i} ---\n\n` : "") + data.text;

          canvas.width = 0; canvas.height = 0;
          setProgress(Math.round((i / doc.numPages) * 100));
        }
        doc.destroy();
      }

      await worker.terminate();

      if (!allText.trim()) {
        setError(t("noText"));
      } else {
        setResultText(allText);
      }
    } catch {
      setError(t("error"));
    } finally {
      setProcessing(false);
      setStatusMsg("");
    }
  }, [file, lang, pdfjsLib, t]);

  const downloadTxt = useCallback(() => {
    if (!resultText || !file) return;
    const blob = new Blob([resultText], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = file.name.replace(/\.(pdf|png|jpg|jpeg|webp|bmp|tiff?)$/i, "_ocr.txt"); a.click();
    URL.revokeObjectURL(a.href);
  }, [resultText, file]);

  const copyText = useCallback(() => {
    if (resultText) navigator.clipboard.writeText(resultText);
  }, [resultText]);

  const reset = useCallback(() => {
    setFile(null); setResultText(""); setError("");
  }, []);

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf,image/*"; input.onchange = () => input.files?.[0] && loadFile(input.files[0]); input.click(); }}
        >
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !resultText && !error ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t("language")}</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              {OCR_LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>

          <button onClick={recognize} disabled={processing || (!pdfjsLib && file.name.endsWith(".pdf"))}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {processing ? (
              <span>{statusMsg || t("processing")} {progress > 0 ? `${progress}%` : ""}</span>
            ) : t("recognize")}
          </button>
        </div>
      ) : resultText ? (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{t("done")}</p>
              <span className="text-xs text-muted-foreground">{resultText.length} chars</span>
            </div>
            <pre className="bg-background rounded-lg p-4 text-sm max-h-80 overflow-auto whitespace-pre-wrap break-words border border-border">
              {resultText}
            </pre>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={downloadTxt} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("downloadTxt")}</button>
            <button onClick={copyText} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("copy")}</button>
            <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
          </div>
        </div>
      ) : null}
      {error && (
        <div className="space-y-3">
          <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
          <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
        </div>
      )}
    </div>
  );
}
