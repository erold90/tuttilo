"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

export function WordToPdf() {
  const t = useTranslations("tools.word-to-pdf.ui");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [error, setError] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadFile = useCallback((f: File) => {
    const valid = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!valid.includes(f.type) && !f.name.match(/\.docx?$/i)) return;
    setError("");
    setHtmlContent("");
    setFile(f);
  }, []);

  const convert = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const mammoth = await import("mammoth");
      const bytes = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: bytes });

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${file.name.replace(/\.docx?$/i, "")}</title>
<style>
  @page { size: A4; margin: 20mm; }
  @media print { body { margin: 0; } }
  body { font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; line-height: 1.6; color: #000; max-width: 170mm; margin: 20mm auto; padding: 0; }
  h1 { font-size: 24pt; margin: 0 0 12pt; }
  h2 { font-size: 18pt; margin: 18pt 0 8pt; }
  h3 { font-size: 14pt; margin: 14pt 0 6pt; }
  p { margin: 0 0 8pt; orphans: 3; widows: 3; }
  table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
  td, th { border: 1px solid #999; padding: 4pt 8pt; text-align: left; }
  img { max-width: 100%; height: auto; }
  ul, ol { margin: 0 0 8pt; padding-left: 20pt; }
  li { margin-bottom: 4pt; }
  strong, b { font-weight: bold; }
  em, i { font-style: italic; }
</style>
</head>
<body>${result.value}</body>
</html>`;

      setHtmlContent(fullHtml);
    } catch {
      setError(t("convertError"));
    } finally {
      setProcessing(false);
    }
  }, [file, t]);

  const downloadPdf = useCallback(() => {
    if (!htmlContent) return;
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.print();
    }
  }, [htmlContent]);

  const reset = useCallback(() => {
    setFile(null);
    setHtmlContent("");
    setError("");
  }, []);

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
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".docx,.doc"; input.onchange = () => input.files?.[0] && loadFile(input.files[0]); input.click(); }}
        >
          <div className="text-4xl mb-3">📝</div>
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !htmlContent ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
          </div>

          <button
            onClick={convert}
            disabled={processing}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {processing ? t("processing") : t("convert")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center space-y-3">
            <div className="text-3xl">✓</div>
            <p className="font-medium">{t("done")}</p>
            <p className="text-xs text-muted-foreground">{t("printHint")}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={downloadPdf} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
              <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <p className="text-xs text-muted-foreground px-3 py-2 bg-muted/50">{t("preview")}</p>
            <iframe
              ref={iframeRef}
              srcDoc={htmlContent}
              className="w-full bg-white"
              style={{ height: "500px" }}
              title="Preview"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}
    </div>
  );
}
