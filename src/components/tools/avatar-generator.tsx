"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export default function AvatarGenerator() {
  const t = useTranslations("tools.avatar-generator");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("user@example.com");
  const [size, setSize] = useState(256);
  const [gridSize, setGridSize] = useState(5);
  const [style, setStyle] = useState<"pixel" | "geometric">("pixel");

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const hash = hashStr(text);
    const rng = seededRandom(hash);
    const hue = Math.floor(rng() * 360);
    const sat = 50 + Math.floor(rng() * 30);
    const bg = `hsl(${hue}, ${sat}%, 85%)`;
    const fg = `hsl(${hue}, ${sat}%, 45%)`;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    if (style === "pixel") {
      const cellSize = size / gridSize;
      const half = Math.ceil(gridSize / 2);
      const grid: boolean[][] = [];
      for (let y = 0; y < gridSize; y++) {
        grid[y] = [];
        for (let x = 0; x < half; x++) {
          grid[y][x] = rng() > 0.5;
        }
      }
      ctx.fillStyle = fg;
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const mx = x < half ? x : gridSize - 1 - x;
          if (grid[y][mx]) {
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
    } else {
      const shapes = 4 + Math.floor(rng() * 4);
      for (let i = 0; i < shapes; i++) {
        ctx.fillStyle = `hsl(${(hue + Math.floor(rng() * 60) - 30 + 360) % 360}, ${sat}%, ${35 + Math.floor(rng() * 30)}%)`;
        ctx.globalAlpha = 0.5 + rng() * 0.5;
        const cx = rng() * size, cy = rng() * size;
        const r = size * 0.1 + rng() * size * 0.3;
        ctx.beginPath();
        if (rng() > 0.5) ctx.arc(cx, cy, r, 0, Math.PI * 2);
        else ctx.rect(cx - r / 2, cy - r / 2, r, r);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }, [text, size, gridSize, style]);

  useEffect(() => { draw(); }, [draw]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a"); a.href = url; a.download = `avatar-${text.replace(/[^a-zA-Z0-9]/g, "_")}.png`; a.click();
  }, [text]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t("ui.seed")}
        <input type="text" value={text} onChange={e => setText(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
      </label>
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.size")}:
          <input type="number" min={64} max={512} step={64} value={size} onChange={e => setSize(Math.max(64, +e.target.value))} className="ml-2 w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <select value={style} onChange={e => setStyle(e.target.value as "pixel" | "geometric")} className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
          <option value="pixel">{t("ui.pixel")}</option>
          <option value="geometric">{t("ui.geometric")}</option>
        </select>
        {style === "pixel" && (
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.grid")}:
            <input type="number" min={3} max={9} value={gridSize} onChange={e => setGridSize(Math.max(3, Math.min(9, +e.target.value)))} className="ml-2 w-16 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          </label>
        )}
      </div>
      <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 inline-block">
        <canvas ref={canvasRef} className="rounded" style={{ width: Math.min(size, 256), height: Math.min(size, 256) }} />
      </div>
      <div>
        <button onClick={download} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.download")}</button>
      </div>
    </div>
  );
}
