"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { PDFDocument } from "pdf-lib";
import { configurePdfjsWorker } from "@/lib/pdf-utils";
import { Certificate } from "@phosphor-icons/react";

export function PdfToPdfa() {
  const t = useTranslations("tools.pdf-to-pdfa.ui");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
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
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setError(""); setResultUrl(""); setFile(f);
  }, []);

  const convert = useCallback(async () => {
    if (!file || !pdfjsLib) return;
    setProcessing(true); setError(""); setProgress(0);
    try {
      const bytes = await file.arrayBuffer();

      // Render all pages via pdfjs-dist then rebuild with pdf-lib + PDF/A metadata
      const srcDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const newDoc = await PDFDocument.create();
      const total = srcDoc.numPages;

      for (let i = 1; i <= total; i++) {
        const page = await srcDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await (page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]).promise);

        const jpgBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.95));
        const jpgBytes = await jpgBlob.arrayBuffer();
        const img = await newDoc.embedJpg(jpgBytes);

        const origVp = page.getViewport({ scale: 1 });
        const newPage = newDoc.addPage([origVp.width, origVp.height]);
        newPage.drawImage(img, { x: 0, y: 0, width: origVp.width, height: origVp.height });

        canvas.width = 0; canvas.height = 0;
        setProgress(Math.round((i / total) * 100));
      }
      srcDoc.destroy();

      // Set PDF/A metadata
      const now = new Date();
      const isoDate = now.toISOString();
      newDoc.setTitle(file.name.replace(/\.pdf$/i, ""));
      newDoc.setProducer("Tuttilo PDF/A Converter");
      newDoc.setCreator("Tuttilo");
      newDoc.setCreationDate(now);
      newDoc.setModificationDate(now);

      // Add XMP metadata for PDF/A-1b conformance
      const xmpMetadata = [
        '<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>',
        '<x:xmpmeta xmlns:x="adobe:ns:meta/">',
        '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
        '<rdf:Description rdf:about=""',
        '  xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"',
        '  xmlns:dc="http://purl.org/dc/elements/1.1/"',
        '  xmlns:xmp="http://ns.adobe.com/xap/1.0/"',
        '  xmlns:pdf="http://ns.adobe.com/pdf/1.3/"',
        '  xmlns:pdfaExtension="http://www.aiim.org/pdfa/ns/extension/"',
        '  xmlns:pdfaSchema="http://www.aiim.org/pdfa/ns/schema#"',
        '  xmlns:pdfaProperty="http://www.aiim.org/pdfa/ns/property#">',
        '  <pdfaid:part>1</pdfaid:part>',
        '  <pdfaid:conformance>B</pdfaid:conformance>',
        `  <xmp:CreateDate>${isoDate}</xmp:CreateDate>`,
        `  <xmp:ModifyDate>${isoDate}</xmp:ModifyDate>`,
        '  <xmp:CreatorTool>Tuttilo</xmp:CreatorTool>',
        `  <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${file.name.replace(/\.pdf$/i, "")}</rdf:li></rdf:Alt></dc:title>`,
        '  <pdf:Producer>Tuttilo PDF/A Converter</pdf:Producer>',
        '</rdf:Description>',
        '</rdf:RDF>',
        '</x:xmpmeta>',
        '<?xpacket end="w"?>',
      ].join("\n");

      // Attach XMP as metadata stream
      const xmpBytes = new TextEncoder().encode(xmpMetadata);
      const xmpStream = newDoc.context.stream(xmpBytes, {
        Type: "Metadata",
        Subtype: "XML",
        Length: xmpBytes.length,
      });
      const xmpRef = newDoc.context.register(xmpStream);
      newDoc.catalog.set(newDoc.context.obj("Metadata"), xmpRef);

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("PDF→PDFA error:", err);
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [file, pdfjsLib, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a"); a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, "_pdfa.pdf"); a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setResultUrl(""); setError("");
  }, [resultUrl]);

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
          <Certificate size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-400">
            {t("info")}
          </div>
          <button onClick={convert} disabled={processing || !pdfjsLib}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {processing ? (progress > 0 ? `${t("processing")} ${progress}%` : t("processing")) : t("convert")}
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
          <p className="font-medium">{t("done")}</p>
          <p className="text-xs text-muted-foreground">{t("conformance")}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={download} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
            <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
          </div>
        </div>
      )}
      {error && <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>}
    </div>
  );
}
