"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

const PRESETS = [
  { name: "Sunset", colors: ["#FF512F", "#DD2476"] },
  { name: "Ocean", colors: ["#2193b0", "#6dd5ed"] },
  { name: "Forest", colors: ["#134E5E", "#71B280"] },
  { name: "Purple", colors: ["#7F00FF", "#E100FF"] },
  { name: "Fire", colors: ["#f12711", "#f5af19"] },
  { name: "Night", colors: ["#0f0c29", "#302b63", "#24243e"] },
  { name: "Aurora", colors: ["#00c6ff", "#0072ff", "#7209b7"] },
  { name: "Candy", colors: ["#fc5c7d", "#6a82fb"] },
];

type Direction = "to right" | "to bottom" | "to bottom right" | "to bottom left" | "radial";

export default function GradientWallpaperGenerator() {
  const t = useTranslations("tools.gradient-wallpaper-generator");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [colors, setColors] = useState(["#4F46E5", "#7C3AED", "#EC4899"]);
  const [direction, setDirection] = useState<Direction>("to bottom right");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [noise, setNoise] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    if (direction === "radial") {
      const r = Math.max(width, height) * 0.7;
      const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, r);
      colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
      ctx.fillStyle = grad;
    } else {
      const angles: Record<string, [number, number, number, number]> = {
        "to right": [0, height / 2, width, height / 2],
        "to bottom": [width / 2, 0, width / 2, height],
        "to bottom right": [0, 0, width, height],
        "to bottom left": [width, 0, 0, height],
      };
      const [x1, y1, x2, y2] = angles[direction];
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, width, height);

    if (noise) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const d = imageData.data;
      const arr = new Uint8Array(width * height);
      crypto.getRandomValues(arr);
      for (let i = 0; i < arr.length; i++) {
        const n = (arr[i] - 128) * 0.08;
        const p = i * 4;
        d[p] = Math.min(255, Math.max(0, d[p] + n));
        d[p + 1] = Math.min(255, Math.max(0, d[p + 1] + n));
        d[p + 2] = Math.min(255, Math.max(0, d[p + 2] + n));
      }
      ctx.putImageData(imageData, 0, 0);
    }
  }, [colors, direction, width, height, noise]);

  useEffect(() => { draw(); }, [draw]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a"); a.href = url; a.download = `wallpaper-${width}x${height}.png`; a.click();
  }, [width, height]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => setColors([...p.colors])} className="px-3 py-1.5 text-xs rounded-full border border-zinc-300 dark:border-zinc-600 hover:border-zinc-500" style={{ background: `linear-gradient(to right, ${p.colors.join(",")})`, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{p.name}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {colors.map((c, i) => (
          <div key={i} className="flex items-center gap-1">
            <input type="color" value={c} onChange={e => { const n = [...colors]; n[i] = e.target.value; setColors(n); }} className="w-10 h-10 rounded border border-zinc-300 dark:border-zinc-600 cursor-pointer" />
            {colors.length > 2 && <button onClick={() => setColors(colors.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:text-red-700">&times;</button>}
          </div>
        ))}
        {colors.length < 5 && <button onClick={() => setColors([...colors, "#888888"])} className="px-3 py-2 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">+ {t("ui.addColor")}</button>}
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <select value={direction} onChange={e => setDirection(e.target.value as Direction)} className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
          <option value="to right">{t("ui.horizontal")}</option>
          <option value="to bottom">{t("ui.vertical")}</option>
          <option value="to bottom right">{t("ui.diagonal")}</option>
          <option value="to bottom left">{t("ui.diagonalAlt")}</option>
          <option value="radial">{t("ui.radial")}</option>
        </select>
        <select value={`${width}x${height}`} onChange={e => { const [w, h] = e.target.value.split("x").map(Number); setWidth(w); setHeight(h); }} className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
          <option value="1920x1080">1920×1080 (FHD)</option>
          <option value="2560x1440">2560×1440 (QHD)</option>
          <option value="3840x2160">3840×2160 (4K)</option>
          <option value="1080x1920">1080×1920 (Mobile)</option>
          <option value="1080x1080">1080×1080 (Square)</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" checked={noise} onChange={e => setNoise(e.target.checked)} className="accent-blue-600" />
          {t("ui.noise")}
        </label>
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
        <canvas ref={canvasRef} className="w-full" style={{ maxHeight: 400 }} />
      </div>
      <button onClick={download} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.download")}</button>
    </div>
  );
}
