"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

export function MemeMaker() {
  const t = useTranslations("tools.meme-maker.ui");
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#FFFFFF");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback((f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    const img = new Image();
    img.onload = () => { imgRef.current = img; };
    img.src = url;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    const scale = img.naturalWidth / 800;
    const fs = fontSize * scale;
    ctx.font = `bold ${fs}px Impact, sans-serif`;
    ctx.fillStyle = color;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = fs / 12;
    ctx.textAlign = "center";
    ctx.lineJoin = "round";

    if (topText) {
      const y = fs + 20 * scale;
      ctx.strokeText(topText.toUpperCase(), canvas.width / 2, y);
      ctx.fillText(topText.toUpperCase(), canvas.width / 2, y);
    }
    if (bottomText) {
      const y = canvas.height - 20 * scale;
      ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, y);
      ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, y);
    }
  }, [topText, bottomText, fontSize, color, imgUrl]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = "meme.png";
      a.click();
    }, "image/png");
  }, []);

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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3 md:col-span-1">
              <div>
                <label className="mb-1 block text-sm font-medium">{t("topText")}</label>
                <input type="text" value={topText} onChange={(e) => setTopText(e.target.value)} placeholder={t("topPlaceholder")} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t("bottomText")}</label>
                <input type="text" value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder={t("bottomPlaceholder")} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t("fontSize")}: {fontSize}px</label>
                <input type="range" min={16} max={96} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t("color")}</label>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full rounded border border-border" />
              </div>
              <div className="flex gap-2">
                <button onClick={download} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("download")}</button>
                <button onClick={() => { setFile(null); setTopText(""); setBottomText(""); }} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
              </div>
            </div>
            <div className="md:col-span-2">
              <canvas ref={canvasRef} className="max-w-full rounded-lg border border-border" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
