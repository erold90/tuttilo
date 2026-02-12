"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { configurePdfjsWorker } from "@/lib/pdf-utils";
import { FileText, Eye, PencilSimple } from "@phosphor-icons/react";
import { SafariPdfBanner } from "@/components/safari-pdf-banner";
import { cn } from "@/lib/utils";
import { useFileInput } from "@/hooks/use-file-input";

type Direction = "pdf-to-word" | "word-to-pdf" | null;
type ConvMode = "visual" | "editable";

export function PdfWord() {
  const t = useTranslations("tools.pdf-word.ui");
  const [file, setFile] = useState<File | null>(null);
  const [direction, setDirection] = useState<Direction>(null);
  const [mode, setMode] = useState<ConvMode>("visual");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [loadingThumbs, setLoadingThumbs] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    import("pdfjs-dist").then((lib) => {
      configurePdfjsWorker(lib);
      setPdfjsLib(lib);
    });
  }, []);

  const loadFile = useCallback(async (f: File) => {
    setError(""); setResultUrl(""); setHtmlContent("");
    setThumbs([]); setPageCount(0);

    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    const isWord = f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      || f.type === "application/msword"
      || /\.docx?$/i.test(f.name);

    if (!isPdf && !isWord) return;
    setFile(f);
    setDirection(isPdf ? "pdf-to-word" : "word-to-pdf");

    if (isPdf && pdfjsLib) {
      setLoadingThumbs(true);
      try {
        const bytes = new Uint8Array(await f.arrayBuffer());
        const doc = await pdfjsLib.getDocument({ data: new Uint8Array(bytes) }).promise;
        setPageCount(doc.numPages);
        const arr: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const vp = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width; canvas.height = vp.height;
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await (page.render({ canvasContext: ctx, viewport: vp, canvas } as Parameters<typeof page.render>[0]).promise);
          arr.push(canvas.toDataURL("image/jpeg", 0.6));
          if (i % 4 === 0 || i === doc.numPages) setThumbs([...arr]);
          canvas.width = 0; canvas.height = 0;
        }
        doc.destroy();
      } catch {
        // thumbnails are optional
      } finally {
        setLoadingThumbs(false);
      }
    }
  }, [pdfjsLib]);

  // ===== PDF → Word: VISUAL (image-based, pixel-perfect) =====
  const convertVisual = useCallback(async () => {
    if (!file || !pdfjsLib) return;
    setProcessing(true); setProgress(0); setError("");
    try {
      const { Document, Packer, Paragraph, ImageRun } = await import("docx");
      const rawBytes = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjsLib.getDocument({ data: rawBytes }).promise;

      // Each PDF page becomes its own section with matching dimensions
      const sectionsList: { properties: { page: { size: { width: number; height: number }; margin: { top: number; right: number; bottom: number; left: number } } }; children: InstanceType<typeof Paragraph>[] }[] = [];
      // Use scale 2 for pages > 20 to reduce memory pressure
      const RENDER_SCALE = doc.numPages > 20 ? 2 : 3;

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const origVp = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: RENDER_SCALE });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context not available");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await (page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]).promise);

        const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/jpeg", 0.92));
        if (!blob) throw new Error(`Failed to render page ${i} as JPEG`);
        const imgBytes = new Uint8Array(await blob.arrayBuffer());

        // Page size in twips (1 pt = 20 twips)
        const wTwips = Math.round(origVp.width * 20);
        const hTwips = Math.round(origVp.height * 20);
        // Image size in pixels at 96 DPI (docx ImageRun units)
        const wPx = Math.round(origVp.width / 72 * 96);
        const hPx = Math.round(origVp.height / 72 * 96);

        sectionsList.push({
          properties: {
            page: {
              size: { width: wTwips, height: hTwips },
              margin: { top: 0, right: 0, bottom: 0, left: 0 },
            },
          },
          children: [
            new Paragraph({
              spacing: { before: 0, after: 0 },
              children: [
                new ImageRun({ type: "jpg", data: imgBytes, transformation: { width: wPx, height: hPx } }),
              ],
            }),
          ],
        });

        canvas.width = 0; canvas.height = 0;
        setProgress(Math.round((i / doc.numPages) * 100));
      }

      doc.destroy();
      const docx = new Document({ sections: sectionsList });
      const outBlob = await Packer.toBlob(docx);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(outBlob));
      setResultSize(outBlob.size);
    } catch (err) {
      console.error("Visual PDF→Word error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`${t("convertError")} (${msg})`);
    } finally {
      setProcessing(false);
    }
  }, [file, pdfjsLib, resultUrl, t]);

  // ===== PDF → Word: EDITABLE (enhanced text extraction) =====
  const convertEditable = useCallback(async () => {
    if (!file || !pdfjsLib) return;
    setProcessing(true); setProgress(0); setError("");
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } = await import("docx");
      const rawBytes = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjsLib.getDocument({ data: rawBytes }).promise;
      type Para = InstanceType<typeof Paragraph>;
      const allChildren: Para[] = [];

      for (let pn = 1; pn <= doc.numPages; pn++) {
        const page = await doc.getPage(pn);
        const vp = page.getViewport({ scale: 1 });
        const pageWidth = vp.width;
        const tc = await page.getTextContent();

        interface RI { str: string; x: number; y: number; w: number; fs: number; bold: boolean; italic: boolean; }
        const items: RI[] = [];

        for (const item of tc.items) {
          if (!("str" in item)) continue;
          const ti = item as { str: string; transform?: number[]; width?: number; height?: number; fontName?: string };
          if (!ti.transform || ti.transform.length < 6 || !ti.str) continue;
          const fs = Math.round(Math.abs(ti.transform[0]) || ti.height || 12);
          const fn = ti.fontName || "";
          let ff = "";
          if ((tc as { styles?: Record<string, { fontFamily?: string }> }).styles?.[fn]) {
            ff = (tc as { styles?: Record<string, { fontFamily?: string }> }).styles![fn].fontFamily || "";
          }
          const full = (fn + " " + ff).toLowerCase();

          items.push({
            str: ti.str, x: ti.transform[4],
            y: Math.round(ti.transform[5] * 10) / 10,
            w: ti.width || fs * ti.str.length * 0.5,
            fs, bold: /bold|black|heavy/i.test(full),
            italic: /italic|oblique/i.test(full),
          });
        }

        // Group by Y (lines)
        const lines: RI[][] = [];
        const byY = [...items].sort((a, b) => b.y - a.y);
        for (const it of byY) {
          const line = lines.find(l => Math.abs(l[0].y - it.y) < Math.max(it.fs * 0.4, 2));
          if (line) line.push(it);
          else lines.push([it]);
        }
        lines.sort((a, b) => b[0].y - a[0].y);
        for (const l of lines) l.sort((a, b) => a.x - b.x);

        for (let li = 0; li < lines.length; li++) {
          const line = lines[li];
          const text = line.map(it => it.str).join("").trim();
          if (!text) continue;

          // Alignment detection
          const startX = line[0].x;
          const endX = line[line.length - 1].x + line[line.length - 1].w;
          const center = (startX + endX) / 2;
          const mid = pageWidth / 2;
          let alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT;
          if (Math.abs(center - mid) < pageWidth * 0.05 && startX > pageWidth * 0.15) alignment = AlignmentType.CENTER;
          else if (startX > pageWidth * 0.55) alignment = AlignmentType.RIGHT;

          // Heading detection
          const maxFs = Math.max(...line.map(it => it.fs));
          let heading: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
          if (maxFs >= 22) heading = HeadingLevel.HEADING_1;
          else if (maxFs >= 17) heading = HeadingLevel.HEADING_2;
          else if (maxFs >= 14) heading = HeadingLevel.HEADING_3;

          // TextRuns with per-item formatting
          type TR = InstanceType<typeof TextRun>;
          const runs: TR[] = [];
          for (let ti = 0; ti < line.length; ti++) {
            const it = line[ti];
            if (!it.str) continue;
            if (ti > 0) {
              const prev = line[ti - 1];
              const gap = it.x - (prev.x + prev.w);
              if (gap > it.fs * 0.3) runs.push(new TextRun({ text: " " }));
            }
            runs.push(new TextRun({
              text: it.str, bold: it.bold, italics: it.italic,
              size: Math.round(it.fs * 2),
            }));
          }

          // Spacing from gap to prev line
          let spaceBefore = 0;
          if (li > 0 && lines[li - 1].length > 0) {
            const gap = lines[li - 1][0].y - line[0].y;
            const lh = line[0].fs * 1.2;
            if (gap > lh * 2.5) spaceBefore = 240;
            else if (gap > lh * 1.8) spaceBefore = 120;
          }

          allChildren.push(new Paragraph({
            heading, alignment,
            spacing: spaceBefore ? { before: spaceBefore } : undefined,
            children: runs,
          }));
        }

        if (pn < doc.numPages) {
          allChildren.push(new Paragraph({ children: [new PageBreak()] }));
        }
        setProgress(Math.round((pn / doc.numPages) * 100));
      }

      doc.destroy();
      if (allChildren.length === 0) allChildren.push(new Paragraph({ children: [new TextRun({ text: " " })] }));

      const docx = new Document({ sections: [{ properties: {}, children: allChildren }] });
      const outBlob = await Packer.toBlob(docx);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(outBlob));
      setResultSize(outBlob.size);
    } catch (err) {
      console.error("Editable PDF→Word error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`${t("convertError")} (${msg})`);
    } finally {
      setProcessing(false);
    }
  }, [file, pdfjsLib, resultUrl, t]);

  // ===== Word → PDF =====
  const convertWordToPdf = useCallback(async () => {
    if (!file) return;
    setProcessing(true); setError("");
    try {
      const mammoth = await import("mammoth");
      const bytes = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: bytes });
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${file.name.replace(/\.docx?$/i, "")}</title><style>
@page { size: A4; margin: 20mm; }
@media print { body { margin: 0; } }
body { font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; line-height: 1.6; color: #000; max-width: 170mm; margin: 20mm auto; padding: 0; }
h1 { font-size: 24pt; margin: 0 0 12pt; } h2 { font-size: 18pt; margin: 18pt 0 8pt; } h3 { font-size: 14pt; margin: 14pt 0 6pt; }
p { margin: 0 0 8pt; orphans: 3; widows: 3; }
table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
td, th { border: 1px solid #999; padding: 4pt 8pt; text-align: left; }
img { max-width: 100%; height: auto; }
ul, ol { margin: 0 0 8pt; padding-left: 20pt; } li { margin-bottom: 4pt; }
strong, b { font-weight: bold; } em, i { font-style: italic; }
</style></head><body>${result.value}</body></html>`;
      setHtmlContent(fullHtml);
    } catch (err) {
      console.error("Word→PDF error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`${t("convertError")} (${msg})`);
    } finally {
      setProcessing(false);
    }
  }, [file, t]);

  const convert = useCallback(() => {
    if (direction === "pdf-to-word") {
      if (mode === "visual") convertVisual();
      else convertEditable();
    } else if (direction === "word-to-pdf") convertWordToPdf();
  }, [direction, mode, convertVisual, convertEditable, convertWordToPdf]);

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
    setFile(null); setDirection(null); setResultUrl(""); setResultSize(0);
    setHtmlContent(""); setProgress(0); setError(""); setThumbs([]); setPageCount(0);
  }, [resultUrl]);

  const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
  const isDone = (direction === "pdf-to-word" && resultUrl) || (direction === "word-to-pdf" && htmlContent);

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({ accept: ".pdf,.docx,.doc", onFile: (file) => loadFile(file) });

  return (
    <div className="space-y-6">
      <SafariPdfBanner />

      {!file ? (
        <>
          <input {...fileInputProps} />
          <div
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
            onClick={openFileDialog}
            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          >
            <FileText size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-medium">{t("dropzone")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
          </div>
        </>
      ) : !isDone ? (
        <div className="space-y-4">
          {/* File info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate flex-1">{file.name}</p>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                direction === "pdf-to-word" ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"
              )}>
                {direction === "pdf-to-word" ? "PDF → Word" : "Word → PDF"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {fmtSize(file.size)}{pageCount > 0 ? ` · ${pageCount} ${t("pages")}` : ""}
            </p>
          </div>

          {/* Thumbnails */}
          {direction === "pdf-to-word" && (thumbs.length > 0 || loadingThumbs) && (
            <div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {thumbs.map((url, i) => (
                  <div key={i} className="border border-border rounded overflow-hidden bg-white shadow-sm">
                    <img src={url} alt={`${i + 1}`} className="w-full" />
                    <p className="text-[10px] text-center text-muted-foreground py-0.5">{i + 1}</p>
                  </div>
                ))}
                {loadingThumbs && (
                  <div className="border border-border rounded bg-muted/30 animate-pulse aspect-[3/4]" />
                )}
              </div>
            </div>
          )}

          {/* Mode selector (PDF → Word only) */}
          {direction === "pdf-to-word" && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("conversionMode")}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode("visual")}
                  className={cn("p-3 rounded-lg border text-left transition-colors",
                    mode === "visual" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Eye size={18} weight="duotone" className={mode === "visual" ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-sm font-medium">{t("modeVisual")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("modeVisualDesc")}</p>
                </button>
                <button
                  onClick={() => setMode("editable")}
                  className={cn("p-3 rounded-lg border text-left transition-colors",
                    mode === "editable" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <PencilSimple size={18} weight="duotone" className={mode === "editable" ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-sm font-medium">{t("modeEditable")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("modeEditableDesc")}</p>
                </button>
              </div>
            </div>
          )}

          {/* Convert button */}
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
            <p className="text-2xl font-bold text-green-500">&#10003;</p>
            <p className="font-medium">{t("done")}</p>
            {direction === "pdf-to-word" && resultSize > 0 && (
              <p className="text-sm text-muted-foreground">{fmtSize(resultSize)}</p>
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

      {error && <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>}
    </div>
  );
}
