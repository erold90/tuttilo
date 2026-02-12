"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Rows } from "@phosphor-icons/react";
import { useFileInput } from "@/hooks/use-file-input";

export function PdfFlatten() {
  const t = useTranslations("tools.pdf-flatten.ui");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<{ fields: number; annotations: number } | null>(null);

  const loadFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setError(""); setResultUrl(""); setStats(null); setFile(f);
  }, []);

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({ accept: ".pdf", onFile: loadFile });

  const flatten = useCallback(async () => {
    if (!file) return;
    setProcessing(true); setError("");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

      let fieldCount = 0;
      try {
        const form = doc.getForm();
        const fields = form.getFields();
        fieldCount = fields.length;
        if (fieldCount > 0) form.flatten();
      } catch {
        // No form fields — that's fine
      }

      setStats({ fields: fieldCount, annotations: 0 });

      const resultBytes = await doc.save();
      const blob = new Blob([resultBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Flatten error:", err);
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  }, [file, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a"); a.href = resultUrl;
    a.download = file.name.replace(/\.pdf$/i, "-flattened.pdf"); a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setResultUrl(""); setError(""); setStats(null);
  }, [resultUrl]);

  return (
    <div className="space-y-6">
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
            <Rows size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-medium">{t("dropzone")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
          </div>
        </>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("flattenDesc")}</p>
          </div>
          <button onClick={flatten} disabled={processing}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {processing ? t("processing") : t("flatten")}
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
          <p className="font-medium">{t("done")}</p>
          {stats && (
            <p className="text-sm text-muted-foreground">
              {t("statsFields", { count: String(stats.fields) })}
            </p>
          )}
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
