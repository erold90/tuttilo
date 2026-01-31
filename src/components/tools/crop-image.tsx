"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

export function CropImage() {
  const t = useTranslations("tools.crop-image.ui");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [aspectRatio, setAspectRatio] = useState<number>(NaN);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<Cropper>(null);

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultUrl("");
  }

  const crop = useCallback(() => {
    const cropper = (cropperRef.current as any)?.cropper;
    if (!cropper) return;
    const mime = file?.type === "image/png" ? "image/png" : "image/jpeg";
    const url = cropper.getCroppedCanvas().toDataURL(mime, 0.92);
    setResultUrl(url);
  }, [file]);

  function download() {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const ext = file.name.replace(/.*\./, "");
    a.download = file.name.replace(`.${ext}`, `-cropped.${ext}`);
    a.click();
  }

  function reset() {
    setFile(null);
    setPreview("");
    setResultUrl("");
  }

  const aspects: { label: string; value: number }[] = [
    { label: t("freeform"), value: NaN },
    { label: "1:1", value: 1 },
    { label: "16:9", value: 16 / 9 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:2", value: 3 / 2 },
  ];

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
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div className="text-4xl mb-3">✂️</div>
          <p className="text-sm font-medium">{t("dropzone")}</p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP</p>
        </div>
      ) : (
        <>
          {/* Aspect ratio buttons */}
          <div className="flex flex-wrap gap-2">
            {aspects.map((a) => (
              <button
                key={a.label}
                onClick={() => {
                  setAspectRatio(a.value);
                  const cropper = (cropperRef.current as any)?.cropper;
                  if (cropper) cropper.setAspectRatio(a.value);
                }}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  (isNaN(aspectRatio) && isNaN(a.value)) || aspectRatio === a.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Cropper */}
          <div className="overflow-hidden rounded-lg border border-border">
            <Cropper
              ref={cropperRef as any}
              src={preview}
              style={{ height: 400, width: "100%" }}
              aspectRatio={aspectRatio}
              guides={true}
              viewMode={1}
              responsive={true}
              autoCropArea={0.8}
              background={false}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button onClick={crop} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              {t("crop")}
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

          {/* Result preview */}
          {resultUrl && (
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">{t("result")}</p>
              <img src={resultUrl} alt="Cropped" className="max-h-[300px] rounded-lg border border-border object-contain bg-muted/30" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
