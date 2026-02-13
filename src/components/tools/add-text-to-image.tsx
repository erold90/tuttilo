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
  italic: boolean;
  rotation: number;
  outline: boolean;
  outlineColor: string;
}

const FONTS = [
  "Arial",
  "Impact",
  "Georgia",
  "Courier New",
  "Verdana",
  "Times New Roman",
  "Comic Sans MS",
  "Arial Black",
];

let nextId = 1;

export function AddTextToImage() {
  const t = useTranslations("tools.add-text-to-image.ui");
  const [file, setFile] = useState<File | null>(null);
  const [layers, setLayers] = useState<TextLayer[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    layerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const load = useCallback((f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setLayers([]);
      setActiveId(null);
    };
    img.src = url;
  }, []);

  const addLayer = () => {
    const img = imgRef.current;
    const id = nextId++;
    const cx = img ? Math.round(img.naturalWidth / 2) : 200;
    const cy = img ? Math.round(img.naturalHeight / 2) : 200;
    setLayers((l) => [
      ...l,
      {
        id,
        text: "Text",
        x: cx,
        y: cy,
        size: 48,
        color: "#FFFFFF",
        font: "Arial",
        bold: true,
        italic: false,
        rotation: 0,
        outline: true,
        outlineColor: "#000000",
      },
    ]);
    setActiveId(id);
  };

  const updateLayer = (id: number, patch: Partial<TextLayer>) => {
    setLayers((l) =>
      l.map((ly) => (ly.id === id ? { ...ly, ...patch } : ly))
    );
  };

  const removeLayer = (id: number) => {
    setLayers((l) => l.filter((ly) => ly.id !== id));
    if (activeId === id) setActiveId(null);
  };

  // Get canvas display scale (canvas internal size vs CSS display size)
  const getScale = useCallback((): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 1;
    const rect = canvas.getBoundingClientRect();
    return canvas.width / rect.width;
  }, []);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    for (const layer of layers) {
      ctx.save();
      ctx.translate(layer.x, layer.y);
      if (layer.rotation) {
        ctx.rotate((layer.rotation * Math.PI) / 180);
      }
      const style = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}`;
      ctx.font = `${style}${layer.size}px "${layer.font}", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = layer.color;

      if (layer.outline) {
        ctx.strokeStyle = layer.outlineColor;
        ctx.lineWidth = layer.size / 12;
        ctx.lineJoin = "round";
        ctx.strokeText(layer.text, 0, 0);
      }
      ctx.fillText(layer.text, 0, 0);

      // Selection indicator
      if (layer.id === activeId) {
        const m = ctx.measureText(layer.text);
        const w = m.width + 16;
        const h = layer.size * 1.3;
        ctx.strokeStyle = "#06B6D4";
        ctx.lineWidth = 2 / getScale();
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        ctx.setLineDash([]);
      }
      ctx.restore();
    }
  }, [layers, file, activeId, getScale]);

  // Hit test: find which layer was clicked
  const hitTest = useCallback(
    (px: number, py: number): number | null => {
      // Check in reverse order (top layers first)
      for (let i = layers.length - 1; i >= 0; i--) {
        const ly = layers[i];
        const canvas = canvasRef.current;
        if (!canvas) continue;
        const ctx = canvas.getContext("2d")!;
        const style = `${ly.italic ? "italic " : ""}${ly.bold ? "bold " : ""}`;
        ctx.font = `${style}${ly.size}px "${ly.font}", sans-serif`;
        const m = ctx.measureText(ly.text);
        const w = m.width / 2 + 20;
        const h = ly.size * 0.7 + 20;

        // Transform point into layer's local coords
        const dx = px - ly.x;
        const dy = py - ly.y;
        const rad = (-ly.rotation * Math.PI) / 180;
        const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
        const ly2 = dx * Math.sin(rad) + dy * Math.cos(rad);

        if (Math.abs(lx) <= w && Math.abs(ly2) <= h) {
          return ly.id;
        }
      }
      return null;
    },
    [layers]
  );

  // Pointer events for dragging text on canvas
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scale = getScale();
      const cx = (e.clientX - rect.left) * scale;
      const cy = (e.clientY - rect.top) * scale;

      const hit = hitTest(cx, cy);
      if (hit !== null) {
        setActiveId(hit);
        const ly = layers.find((l) => l.id === hit);
        if (ly) {
          dragRef.current = {
            layerId: hit,
            startX: e.clientX,
            startY: e.clientY,
            origX: ly.x,
            origY: ly.y,
          };
          canvas.setPointerCapture(e.pointerId);
        }
      } else {
        setActiveId(null);
      }
    },
    [layers, hitTest, getScale]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!dragRef.current) return;
      const scale = getScale();
      const dx = (e.clientX - dragRef.current.startX) * scale;
      const dy = (e.clientY - dragRef.current.startY) * scale;
      updateLayer(dragRef.current.layerId, {
        x: Math.round(dragRef.current.origX + dx),
        y: Math.round(dragRef.current.origY + dy),
      });
    },
    [getScale]
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const download = useCallback(() => {
    // Re-draw without selection indicator
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    for (const layer of layers) {
      ctx.save();
      ctx.translate(layer.x, layer.y);
      if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);
      const style = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}`;
      ctx.font = `${style}${layer.size}px "${layer.font}", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = layer.color;
      if (layer.outline) {
        ctx.strokeStyle = layer.outlineColor;
        ctx.lineWidth = layer.size / 12;
        ctx.lineJoin = "round";
        ctx.strokeText(layer.text, 0, 0);
      }
      ctx.fillText(layer.text, 0, 0);
      ctx.restore();
    }

    canvas.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = "image_with_text.png";
      a.click();
    }, "image/png");
  }, [layers]);

  const active = layers.find((l) => l.id === activeId);

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]);
          }}
          className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center hover:border-primary/50"
        >
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && load(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Controls */}
          <div className="space-y-3 md:col-span-1">
            <button
              onClick={addLayer}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("addText")}
            </button>

            {/* Layer list */}
            {layers.map((ly) => (
              <div
                key={ly.id}
                onClick={() => setActiveId(ly.id)}
                className={`rounded-lg border p-2 text-xs cursor-pointer transition-colors ${
                  activeId === ly.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="truncate font-medium">{ly.text}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayer(ly.id);
                    }}
                    className="text-red-400 hover:text-red-500 ml-2 text-base leading-none"
                  >
                    x
                  </button>
                </div>
              </div>
            ))}

            {/* Active layer props */}
            {active && (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <input
                  value={active.text}
                  onChange={(e) =>
                    updateLayer(active.id, { text: e.target.value })
                  }
                  className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
                />

                {/* Font + style */}
                <div className="flex gap-2">
                  <select
                    value={active.font}
                    onChange={(e) =>
                      updateLayer(active.id, { font: e.target.value })
                    }
                    className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs"
                  >
                    {FONTS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      updateLayer(active.id, { bold: !active.bold })
                    }
                    className={`rounded border px-2 py-1 text-xs font-bold ${
                      active.bold
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border"
                    }`}
                  >
                    B
                  </button>
                  <button
                    onClick={() =>
                      updateLayer(active.id, { italic: !active.italic })
                    }
                    className={`rounded border px-2 py-1 text-xs italic ${
                      active.italic
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border"
                    }`}
                  >
                    I
                  </button>
                </div>

                {/* Size */}
                <div>
                  <label className="text-xs text-muted-foreground">
                    {t("fontSize")}: {active.size}px
                  </label>
                  <input
                    type="range"
                    min={8}
                    max={200}
                    value={active.size}
                    onChange={(e) =>
                      updateLayer(active.id, { size: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <label className="text-xs text-muted-foreground">
                    {t("rotation")}: {active.rotation}°
                  </label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={active.rotation}
                    onChange={(e) =>
                      updateLayer(active.id, {
                        rotation: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* Colors */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">
                      {t("fillColor")}
                    </label>
                    <input
                      type="color"
                      value={active.color}
                      onChange={(e) =>
                        updateLayer(active.id, { color: e.target.value })
                      }
                      className="h-8 w-full rounded border border-border cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={active.outline}
                        onChange={(e) =>
                          updateLayer(active.id, {
                            outline: e.target.checked,
                          })
                        }
                        className="h-3 w-3"
                      />
                      <label className="text-xs text-muted-foreground">
                        {t("outline")}
                      </label>
                    </div>
                    <input
                      type="color"
                      value={active.outlineColor}
                      onChange={(e) =>
                        updateLayer(active.id, {
                          outlineColor: e.target.value,
                        })
                      }
                      disabled={!active.outline}
                      className="h-8 w-full rounded border border-border cursor-pointer disabled:opacity-40"
                    />
                  </div>
                </div>

                {/* Hint */}
                <p className="text-[10px] text-muted-foreground/60 text-center">
                  {t("dragHint")}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={download}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {t("download")}
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setLayers([]);
                  setActiveId(null);
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                {t("reset")}
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div ref={containerRef} className="md:col-span-2">
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="max-w-full rounded-lg border border-border cursor-move touch-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
