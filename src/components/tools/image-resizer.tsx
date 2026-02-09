"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { LinkSimple, LinkBreak } from "@phosphor-icons/react";

const PRESETS = [
  { label: "Instagram Post", w: 1080, h: 1080 },
  { label: "Instagram Story", w: 1080, h: 1920 },
  { label: "Facebook Cover", w: 820, h: 312 },
  { label: "Twitter Header", w: 1500, h: 500 },
  { label: "YouTube Thumbnail", w: 1280, h: 720 },
  { label: "LinkedIn Banner", w: 1584, h: 396 },
  { label: "HD (1280x720)", w: 1280, h: 720 },
  { label: "Full HD (1920x1080)", w: 1920, h: 1080 },
  { label: "4K (3840x2160)", w: 3840, h: 2160 },
];

export function ImageResizer() {
  const t = useTranslations("tools.image-resizer.ui");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [lock, setLock] = useState(true);
  const [result, setResult] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = new Image();
    img.onload = () => { setWidth(img.naturalWidth); setHeight(img.naturalHeight); setOrigW(img.naturalWidth); setOrigH(img.naturalHeight); };
    img.src = url;
    setResult("");
  }, []);

  const updateWidth = (w: number) => {
    setWidth(w);
    if (lock && origW) setHeight(Math.round(w * (origH / origW)));
  };

  const updateHeight = (h: number) => {
    setHeight(h);
    if (lock && origH) setWidth(Math.round(h * (origW / origH)));
  };

  const applyPreset = (w: number, h: number) => {
    setWidth(w); setHeight(h); setLock(false);
  };

  const resize = useCallback(async () => {
    if (!file || !width || !height) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    await new Promise<void>((r) => { img.onload = () => r(); img.src = url; });
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/png"));
    setResult(URL.createObjectURL(blob));
    URL.revokeObjectURL(url);
  }, [file, width, height]);

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]); }}
          className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center transition-colors hover:border-primary/50"
        >
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground">{t("formats")}</p>
          <input ref={inputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0])} className="hidden" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{t("original")}: {origW}x{origH}</span>
            <button onClick={() => { setFile(null); setPreview(""); setResult(""); }} className="text-sm text-red-400 hover:underline">{t("remove")}</button>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium">{t("width")}</label>
              <input type="number" value={width} onChange={(e) => updateWidth(Number(e.target.value))} className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <button onClick={() => setLock(!lock)} className={`mb-1 rounded px-2 py-2 text-xs ${lock ? "text-primary" : "text-muted-foreground"}`}>
              {lock ? <LinkSimple size={16} weight="bold" /> : <LinkBreak size={16} weight="bold" />}
            </button>
            <div>
              <label className="mb-1 block text-xs font-medium">{t("height")}</label>
              <input type="number" value={height} onChange={(e) => updateHeight(Number(e.target.value))} className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <button onClick={resize} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("resize")}</button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t("presets")}</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => applyPreset(p.w, p.h)} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-primary/30 hover:bg-primary/5">
                  {p.label} ({p.w}x{p.h})
                </button>
              ))}
            </div>
          </div>

          {result && (
            <div className="space-y-3">
              <img src={result} alt="Resized" className="max-h-64 rounded-lg border border-border" />
              <a href={result} download={file.name.replace(/\.[^.]+$/, "") + `_${width}x${height}.png`} className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("download")}</a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
