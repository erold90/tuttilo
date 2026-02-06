"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

const RATIOS = [
  { label: "Free", value: 0 },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
  { label: "Circle", value: -1 },
];

export function ImageCropper() {
  const t = useTranslations("tools.image-cropper.ui");
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [ratio, setRatio] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cx: 0, cy: 0 });
  const [result, setResult] = useState("");
  const [scale, setScale] = useState(1);

  const load = useCallback((f: File) => {
    setFile(f); setResult("");
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const maxW = Math.min(img.naturalWidth, 800);
      const s = maxW / img.naturalWidth;
      setScale(s);
      const cw = Math.round(img.naturalWidth * s * 0.6);
      const ch = Math.round(img.naturalHeight * s * 0.6);
      setCrop({ x: Math.round((img.naturalWidth * s - cw) / 2), y: Math.round((img.naturalHeight * s - ch) / 2), w: cw, h: ch });
    };
    img.src = url;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    // Dim overlay
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, w, h);
    // Clear crop area
    if (ratio === -1) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(crop.x + crop.w / 2, crop.y + crop.h / 2, Math.min(crop.w, crop.h) / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 0, 0, w, h);
      ctx.restore();
      ctx.strokeStyle = "#6366F1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(crop.x + crop.w / 2, crop.y + crop.h / 2, Math.min(crop.w, crop.h) / 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.clearRect(crop.x, crop.y, crop.w, crop.h);
      ctx.drawImage(img, crop.x / scale, crop.y / scale, crop.w / scale, crop.h / scale, crop.x, crop.y, crop.w, crop.h);
      ctx.strokeStyle = "#6366F1";
      ctx.lineWidth = 2;
      ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);
    }
  }, [crop, scale, ratio]);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (canvasRef.current!.width / rect.width);
    const sy = (e.clientY - rect.top) * (canvasRef.current!.height / rect.height);
    setDragging(true);
    setDragStart({ x: sx, y: sy, cx: crop.x, cy: crop.y });
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvasRef.current!.width / rect.width);
    const my = (e.clientY - rect.top) * (canvasRef.current!.height / rect.height);
    setCrop((c) => ({ ...c, x: dragStart.cx + (mx - dragStart.x), y: dragStart.cy + (my - dragStart.y) }));
  };

  const doCrop = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const out = document.createElement("canvas");
    const rw = crop.w / scale, rh = crop.h / scale;
    out.width = rw; out.height = rh;
    const ctx = out.getContext("2d")!;
    if (ratio === -1) {
      ctx.beginPath();
      ctx.arc(rw / 2, rh / 2, Math.min(rw, rh) / 2, 0, Math.PI * 2);
      ctx.clip();
    }
    ctx.drawImage(img, crop.x / scale, crop.y / scale, rw, rh, 0, 0, rw, rh);
    out.toBlob((b) => { if (b) setResult(URL.createObjectURL(b)); }, "image/png");
  }, [crop, scale, ratio]);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      {!file ? (
        <div onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); }} className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center hover:border-primary/50">
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground">{t("formats")}</p>
          <input ref={inputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} className="hidden" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {RATIOS.map((r) => (
              <button key={r.label} onClick={() => { setRatio(r.value); if (r.value > 0) setCrop((c) => ({ ...c, h: Math.round(c.w / r.value) })); if (r.value === -1) setCrop((c) => ({ ...c, h: c.w })); }} className={`rounded-lg border px-3 py-1 text-xs ${ratio === r.value ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{r.label}</button>
            ))}
          </div>

          <canvas ref={canvasRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} className="max-w-full cursor-move rounded-lg border border-border" />

          <div className="flex gap-3">
            <button onClick={doCrop} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("crop")}</button>
            <button onClick={() => { setFile(null); setResult(""); }} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
          </div>

          {result && (
            <div className="space-y-3">
              <img src={result} alt="Cropped" className="max-h-64 rounded-lg border border-border" />
              <a href={result} download="cropped.png" className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("download")}</a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
