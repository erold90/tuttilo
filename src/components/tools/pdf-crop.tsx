"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { configurePdfjsWorker } from "@/lib/pdf-utils";
import { Crop } from "@phosphor-icons/react";
import { SafariPdfBanner } from "@/components/safari-pdf-banner";
import { useFileInput } from "@/hooks/use-file-input";

export function PdfCrop() {
  const t = useTranslations("tools.pdf-crop.ui");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [pageSize, setPageSize] = useState({ w: 595, h: 842 }); // A4 default in pts
  const [margins, setMargins] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [unit, setUnit] = useState<"mm" | "pt">("mm");
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);

  useEffect(() => {
    import("pdfjs-dist").then((lib) => {
      configurePdfjsWorker(lib);
      setPdfjsLib(lib);
    });
  }, []);

  const mmToPt = (mm: number) => mm * 2.835;
  const getMarginPt = (val: number) => unit === "mm" ? mmToPt(val) : val;

  const loadFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf") || !pdfjsLib) return;
    setError(""); setResultUrl("");
    try {
      const bytes = await f.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const page = await doc.getPage(1);
      const vp = page.getViewport({ scale: 1 });
      setPageSize({ w: vp.width, h: vp.height });

      // Render preview
      const scale = 1.5;
      const pvp = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = pvp.width; canvas.height = pvp.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      await (page.render({ canvasContext: ctx, viewport: pvp, canvas } as Parameters<typeof page.render>[0]).promise);
      setPreview(canvas.toDataURL("image/jpeg", 0.8));
      canvas.width = 0; canvas.height = 0;
      doc.destroy();
      setFile(f);
    } catch (err) {
      console.error("Load error:", err);
      setError(t("error"));
    }
  }, [pdfjsLib, t]);

  const crop = useCallback(async () => {
    if (!file) return;
    setProcessing(true); setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

      const topPt = getMarginPt(margins.top);
      const rightPt = getMarginPt(margins.right);
      const bottomPt = getMarginPt(margins.bottom);
      const leftPt = getMarginPt(margins.left);

      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();
        const x = leftPt;
        const y = bottomPt;
        const w = width - leftPt - rightPt;
        const h = height - topPt - bottomPt;
        if (w > 0 && h > 0) {
          page.setCropBox(x, y, w, h);
        }
      }

      const resultBytes = await doc.save();
      const blob = new Blob([resultBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Crop error:", err);
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [file, margins, unit, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a"); a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, "-cropped.pdf"); a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setResultUrl(""); setError(""); setPreview("");
    setMargins({ top: 0, right: 0, bottom: 0, left: 0 });
  }, [resultUrl]);

  const MarginInput = ({ label, side }: { label: string; side: keyof typeof margins }) => (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input type="number" min={0} step={unit === "mm" ? 1 : 10}
        value={margins[side]}
        onChange={(e) => setMargins(prev => ({ ...prev, [side]: Math.max(0, Number(e.target.value)) }))}
        className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
    </div>
  );

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({ accept: ".pdf", onFile: loadFile });

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
            <Crop size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-medium">{t("dropzone")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
          </div>
        </>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(pageSize.w / 2.835)} x {Math.round(pageSize.h / 2.835)} mm
            </p>
          </div>

          {preview && (
            <div className="relative border border-border rounded-lg overflow-hidden bg-white mx-auto" style={{ maxWidth: 400 }}>
              <img src={preview} alt="Preview" className="w-full" />
              {/* Visual margin overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{
                borderTop: `${Math.min(margins.top * (unit === "mm" ? 1.5 : 0.5), 100)}px solid rgba(239,68,68,0.2)`,
                borderRight: `${Math.min(margins.right * (unit === "mm" ? 1.5 : 0.5), 100)}px solid rgba(239,68,68,0.2)`,
                borderBottom: `${Math.min(margins.bottom * (unit === "mm" ? 1.5 : 0.5), 100)}px solid rgba(239,68,68,0.2)`,
                borderLeft: `${Math.min(margins.left * (unit === "mm" ? 1.5 : 0.5), 100)}px solid rgba(239,68,68,0.2)`,
              }} />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">{t("margins")}</label>
              <div className="flex gap-1">
                {(["mm", "pt"] as const).map((u) => (
                  <button key={u} onClick={() => setUnit(u)}
                    className={`px-2 py-0.5 rounded text-xs font-medium ${unit === u ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <MarginInput label={t("top")} side="top" />
              <MarginInput label={t("right")} side="right" />
              <MarginInput label={t("bottom")} side="bottom" />
              <MarginInput label={t("left")} side="left" />
            </div>
          </div>

          <button onClick={crop} disabled={processing}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {processing ? t("processing") : t("crop")}
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
          <p className="font-medium">{t("done")}</p>
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
