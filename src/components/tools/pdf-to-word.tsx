"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";

export function PdfToWord() {
  const t = useTranslations("tools.pdf-to-word.ui");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);

  useEffect(() => {
    import("pdfjs-dist").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.mjs`;
      setPdfjsLib(lib);
    });
  }, []);

  const loadFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") return;
    setError("");
    setResultUrl("");
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

      const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        HeadingLevel,
        PageBreak,
      } = await import("docx");

      const sections: { properties: object; children: InstanceType<typeof Paragraph>[] }[] = [];

      for (let i = 1; i <= total; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        const paragraphs: InstanceType<typeof Paragraph>[] = [];

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
                paragraphs.push(
                  new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    children: [new TextRun({ text: currentText.trim() })],
                  })
                );
              } else if (fontSize > 16) {
                paragraphs.push(
                  new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    children: [new TextRun({ text: currentText.trim() })],
                  })
                );
              } else {
                paragraphs.push(
                  new Paragraph({
                    children: [new TextRun({ text: currentText.trim(), size: Math.round(fontSize * 2) })],
                  })
                );
              }
            }
            currentText = "";
          }
          currentText += item.str;
          lastY = y;
        }

        if (currentText.trim()) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: currentText.trim() })],
            })
          );
        }

        if (paragraphs.length === 0) {
          paragraphs.push(new Paragraph({ children: [new TextRun({ text: " " })] }));
        }

        if (i < total) {
          paragraphs.push(
            new Paragraph({
              children: [new PageBreak()],
            })
          );
        }

        sections.push({
          properties: {},
          children: paragraphs,
        });

        setProgress(Math.round((i / total) * 100));
      }

      const docx = new Document({
        sections: sections.length > 0
          ? [{ properties: {}, children: sections.flatMap((s) => s.children) }]
          : [{ properties: {}, children: [new Paragraph({ children: [new TextRun({ text: " " })] })] }],
      });

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

  const download = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file ? file.name.replace(/\.pdf$/i, ".docx") : "document.docx";
    a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setResultUrl("");
    setResultSize(0);
    setProgress(0);
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
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf"; input.onchange = () => input.files?.[0] && loadFile(input.files[0]); input.click(); }}
        >
          <div className="text-4xl mb-3">📄</div>
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
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
