"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface TextLayer {
  id: number;
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  font: string;
  bold: boolean;
}

let nextId = 1;

export function AddTextToImage() {
  const t = useTranslations("tools.add-text-to-image.ui");
  const [file, setFile] = useState<File | null>(null);
  const [layers, setLayers] = useState<TextLayer[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback((f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => { imgRef.current = img; setLayers([]); };
    img.src = url;
  }, []);

  const addLayer = () => {
    const id = nextId++;
    setLayers((l) => [...l, { id, text: "Text", x: 100, y: 100, size: 32, color: "#FFFFFF", font: "Arial", bold: true }]);
    setActiveId(id);
  };

  const updateLayer = (id: number, patch: Partial<TextLayer>) => {
    setLayers((l) => l.map((ly) => (ly.id === id ? { ...ly, ...patch } : ly)));
  };

  const removeLayer = (id: number) => {
    setLayers((l) => l.filter((ly) => ly.id !== id));
    if (activeId === id) setActiveId(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    for (const layer of layers) {
      ctx.font = `${layer.bold ? "bold " : ""}${layer.size}px ${layer.font}`;
      ctx.fillStyle = layer.color;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = layer.size / 16;
      ctx.strokeText(layer.text, layer.x, layer.y);
      ctx.fillText(layer.text, layer.x, layer.y);
    }
  }, [layers, file]);

  const download = useCallback(() => {
    canvasRef.current?.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = "image_with_text.png";
      a.click();
    }, "image/png");
  }, []);

  const active = layers.find((l) => l.id === activeId);
  const FONTS = ["Arial", "Impact", "Georgia", "Courier New", "Verdana", "Times New Roman"];

  return (
    <div className="space-y-6">
      {!file ? (
        <div onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); }} className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center hover:border-primary/50">
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <input ref={inputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} className="hidden" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-3 md:col-span-1">
            <button onClick={addLayer} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("addText")}</button>
            {layers.map((ly) => (
              <div key={ly.id} onClick={() => setActiveId(ly.id)} className={`rounded-lg border p-2 text-xs cursor-pointer ${activeId === ly.id ? "border-primary bg-primary/5" : "border-border"}`}>
                <div className="flex justify-between">
                  <span className="truncate font-medium">{ly.text}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeLayer(ly.id); }} className="text-red-400">×</button>
                </div>
              </div>
            ))}
            {active && (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <input value={active.text} onChange={(e) => updateLayer(active.id, { text: e.target.value })} className="w-full rounded border border-border bg-background px-2 py-1 text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs">X</label><input type="number" value={active.x} onChange={(e) => updateLayer(active.id, { x: Number(e.target.value) })} className="w-full rounded border border-border bg-background px-2 py-1 text-xs" /></div>
                  <div><label className="text-xs">Y</label><input type="number" value={active.y} onChange={(e) => updateLayer(active.id, { y: Number(e.target.value) })} className="w-full rounded border border-border bg-background px-2 py-1 text-xs" /></div>
                </div>
                <div><label className="text-xs">{t("fontSize")}: {active.size}px</label><input type="range" min={8} max={200} value={active.size} onChange={(e) => updateLayer(active.id, { size: Number(e.target.value) })} className="w-full" /></div>
                <div className="flex gap-2">
                  <input type="color" value={active.color} onChange={(e) => updateLayer(active.id, { color: e.target.value })} className="h-8 w-12 rounded border border-border" />
                  <select value={active.font} onChange={(e) => updateLayer(active.id, { font: e.target.value })} className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs">
                    {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={download} className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("download")}</button>
              <button onClick={() => setFile(null)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">{t("reset")}</button>
            </div>
          </div>
          <div className="md:col-span-2">
            <canvas ref={canvasRef} className="max-w-full rounded-lg border border-border" />
          </div>
        </div>
      )}
    </div>
  );
}
