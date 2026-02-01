"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

type Direction = "pdf-to-word" | "word-to-pdf" | null;

export function PdfWord() {
  const t = useTranslations("tools.pdf-word.ui");
  const [file, setFile] = useState<File | null>(null);
  const [direction, setDirection] = useState<Direction>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [htmlContent, setHtmlContent] = useState("");
  const [error, setError] = useState("");
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    import("pdfjs-dist").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
      setPdfjsLib(lib);
    });
  }, []);

  const loadFile = useCallback((f: File) => {
    setError("");
    setResultUrl("");
    setHtmlContent("");

    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    const isWord = f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      || f.type === "application/msword"
      || /\.docx?$/i.test(f.name);

    if (!isPdf && !isWord) return;

    setFile(f);
    setDirection(isPdf ? "pdf-to-word" : "word-to-pdf");
  }, []);

  const convertPdfToWord = useCallback(async () => {
    if (!file || !pdfjsLib) return;
    setProcessing(true);
    setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const total = doc.numPages;

      const { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak } = await import("docx");

      const allChildren: InstanceType<typeof Paragraph>[] = [];

      for (let i = 1; i <= total; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();

        let currentText = "";
        let lastY: number | null = null;

        for (const item of textContent.items) {
          if (!("str" in item)) continue;
          const transform = (item as { transform?: number[] }).transform;
          if (!transform || transform.length < 6) continue;
          const y = Math.round(transform[5]);

          if (lastY !== null && Math.abs(y - lastY) > 5) {
            if (currentText.trim()) {
              const fontSize = (item as { height?: number }).height ?? 12;
              if (fontSize > 20) {
                allChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: currentText.trim() })] }));
              } else if (fontSize > 16) {
                allChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: currentText.trim() })] }));
              } else {
                allChildren.push(new Paragraph({ children: [new TextRun({ text: currentText.trim(), size: Math.round(fontSize * 2) })] }));
              }
            }
            currentText = "";
          }
          currentText += item.str;
          lastY = y;
        }

        if (currentText.trim()) {
          allChildren.push(new Paragraph({ children: [new TextRun({ text: currentText.trim() })] }));
        }

        if (i < total) {
          allChildren.push(new Paragraph({ children: [new PageBreak()] }));
        }
        setProgress(Math.round((i / total) * 100));
      }

      doc.destroy();

      if (allChildren.length === 0) {
        allChildren.push(new Paragraph({ children: [new TextRun({ text: " " })] }));
      }

      const docx = new Document({ sections: [{ properties: {}, children: allChildren }] });
      const blob = await Packer.toBlob(docx);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch {
      setError(t("convertError"));
    } finally {
      setProcessing(false);
    }
  }, [file, pdfjsLib, resultUrl, t]);

  const convertWordToPdf = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
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

  const convert = useCallback(() => {
    if (direction === "pdf-to-word") convertPdfToWord();
    else if (direction === "word-to-pdf") convertWordToPdf();
  }, [direction, convertPdfToWord, convertWordToPdf]);

  const download = useCallback(() => {
    if (direction === "pdf-to-word" && resultUrl) {
      const a = document.createElement("a");
      a.href = resultUrl;
      a.download = file ? file.name.replace(/\.pdf$/i, ".docx") : "document.docx";
      a.click();
    } else if (direction === "word-to-pdf" && htmlContent) {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) iframe.contentWindow.print();
    }
  }, [direction, resultUrl, htmlContent, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setDirection(null);
    setResultUrl("");
    setResultSize(0);
    setHtmlContent("");
    setProgress(0);
    setError("");
  }, [resultUrl]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isDone = (direction === "pdf-to-word" && resultUrl) || (direction === "word-to-pdf" && htmlContent);

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf,.docx,.doc"; input.onchange = () => input.files?.[0] && loadFile(input.files[0]); input.click(); }}
        >
          <div className="text-4xl mb-3">📄</div>
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !isDone ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate flex-1">{file.name}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${direction === "pdf-to-word" ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"}`}>
                {direction === "pdf-to-word" ? "PDF → Word" : "Word → PDF"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
          </div>

          <button
            onClick={convert}
            disabled={processing || (direction === "pdf-to-word" && !pdfjsLib)}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {processing ? (progress > 0 ? `${t("processing")} ${progress}%` : t("processing")) : t("convert")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
            <div className="text-3xl">✓</div>
            <p className="font-medium">{t("done")}</p>
            {direction === "pdf-to-word" && (
              <p className="text-sm text-muted-foreground">{formatSize(resultSize)}</p>
            )}
            {direction === "word-to-pdf" && (
              <p className="text-xs text-muted-foreground">{t("printHint")}</p>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={download} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
              <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
            </div>
          </div>

          {direction === "word-to-pdf" && htmlContent && (
            <div className="border rounded-xl overflow-hidden">
              <p className="text-xs text-muted-foreground px-3 py-2 bg-muted/50">{t("preview")}</p>
              <iframe
                ref={iframeRef}
                srcDoc={htmlContent}
                sandbox="allow-same-origin allow-modals"
                className="w-full bg-white"
                style={{ height: "500px" }}
                title="Preview"
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}
    </div>
  );
}
