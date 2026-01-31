"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";

export function WebpToPng() {
  const t = useTranslations("tools.webp-to-png.ui");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultUrl("");
  }

  function convert() {
    if (!file) return;
    setProcessing(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) setResultUrl(URL.createObjectURL(blob));
        setProcessing(false);
      }, "image/png");
    };
    img.src = preview;
  }

  function download() {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.webp$/i, ".png");
    a.click();
  }

  function reset() { setFile(null); setPreview(""); setResultUrl(""); }

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
          <input ref={inputRef} type="file" accept="image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div className="text-4xl mb-3">🔄</div>
          <p className="text-sm font-medium">{t("dropzone")}</p>
          <p className="text-xs text-muted-foreground mt-1">WebP → PNG</p>
        </div>
      ) : (
        <>
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
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">WebP</p>
              <img src={preview} alt="Original" className="max-h-[300px] w-full rounded-lg border border-border object-contain bg-muted/30" />
            </div>
            {resultUrl && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">PNG</p>
                <img src={resultUrl} alt="Converted" className="max-h-[300px] w-full rounded-lg border border-border object-contain bg-muted/30" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
