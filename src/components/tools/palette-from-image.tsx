"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function getDistance(c1: number[], c2: number[]): number {
  return Math.sqrt(c1.reduce((s, v, i) => s + (v - c2[i]) ** 2, 0));
}

function extractColors(imageData: ImageData, count: number): string[] {
  const pixels: number[][] = [];
  for (let i = 0; i < imageData.data.length; i += 16) {
    const r = imageData.data[i], g = imageData.data[i + 1], b = imageData.data[i + 2], a = imageData.data[i + 3];
    if (a > 128) pixels.push([r, g, b]);
  }
  if (pixels.length === 0) return ["#000000"];

  // Simple k-means-like clustering
  let centroids = pixels.slice(0, count).map((p) => [...p]);
  for (let iter = 0; iter < 10; iter++) {
    const clusters: number[][][] = centroids.map(() => []);
    pixels.forEach((p) => {
      let minD = Infinity, minI = 0;
      centroids.forEach((c, i) => {
        const d = getDistance(p, c);
        if (d < minD) { minD = d; minI = i; }
      });
      clusters[minI].push(p);
    });
    centroids = clusters.map((cl, i) => {
      if (cl.length === 0) return centroids[i];
      return cl[0].map((_, j) => Math.round(cl.reduce((s, p) => s + p[j], 0) / cl.length));
    });
  }

  return centroids.map((c) => rgbToHex(c[0], c[1], c[2]));
}

export default function PaletteFromImage() {
  const t = useTranslations("tools.palette-from-image.ui");
  const [palette, setPalette] = useState<string[]>([]);
  const [colorCount, setColorCount] = useState(5);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxW = 200;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setPalette(extractColors(data, colorCount));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [colorCount]);

  const copy = (hex: string, idx: number) => {
    navigator.clipboard.writeText(hex.toUpperCase());
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(palette.map((c) => c.toUpperCase()).join(", "));
    setCopiedIdx(-1);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Upload area */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/30"
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Uploaded" className="max-h-48 rounded-lg" />
        ) : (
          <>
            <p className="text-sm font-medium">{t("dropImage")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("orClick")}</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
      </div>

      {/* Color count */}
      <div className="rounded-lg border border-border bg-card p-3">
        <label className="mb-1 block text-xs font-medium">{t("colorCount")}: {colorCount}</label>
        <input type="range" min={3} max={10} value={colorCount} onChange={(e) => setColorCount(Number(e.target.value))} className="w-full" />
      </div>

      {/* Palette */}
      {palette.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex h-20">
              {palette.map((c, i) => <div key={i} className="flex-1" style={{ backgroundColor: c }} />)}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {palette.map((c, i) => (
              <button key={i} onClick={() => copy(c, i)} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left hover:bg-muted">
                <div className="h-8 w-8 shrink-0 rounded border border-border" style={{ backgroundColor: c }} />
                <span className="font-mono text-sm">{c.toUpperCase()}</span>
                <span className="ml-auto text-xs text-muted-foreground">{copiedIdx === i ? t("copied") : t("copy")}</span>
              </button>
            ))}
          </div>

          <button onClick={copyAll} className="w-full rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-muted">
            {copiedIdx === -1 ? t("copied") : t("copyAll")}
          </button>
        </>
      )}
    </div>
  );
}
