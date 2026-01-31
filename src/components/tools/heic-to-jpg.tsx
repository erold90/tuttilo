"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";

export function HeicToJpg() {
  const t = useTranslations("tools.heic-to-jpg.ui");
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setResultUrl("");
    setError("");
  }

  async function convert() {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const heic2any = (await import("heic2any")).default;
      const blob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.92,
      });
      const resultBlob = Array.isArray(blob) ? blob[0] : blob;
      setResultUrl(URL.createObjectURL(resultBlob));
    } catch {
      setError(t("error"));
    }
    setProcessing(false);
  }

  function download() {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    a.click();
  }

  function reset() {
    setFile(null);
    setResultUrl("");
    setError("");
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
        >
          <input ref={inputRef} type="file" accept=".heic,.heif,image/heic,image/heif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div className="text-4xl mb-3">📱</div>
          <p className="text-sm font-medium">{t("dropzone")}</p>
          <p className="text-xs text-muted-foreground mt-1">HEIC, HEIF</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <span className="text-2xl">📱</span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>
          )}

          <div className="flex flex-wrap gap-3">
            <button onClick={convert} disabled={processing} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
              {processing ? t("processing") : t("convert")}
            </button>
            {resultUrl && (
              <button onClick={download} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700">
                {t("download")}
              </button>
            )}
            <button onClick={reset} className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-muted">
              {t("reset")}
            </button>
          </div>

          {resultUrl && (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">{t("result")}</p>
              <img src={resultUrl} alt="Converted" className="max-h-[400px] rounded-lg border border-border object-contain bg-muted/30" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
