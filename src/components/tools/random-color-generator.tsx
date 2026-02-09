"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

function randomHex(): string {
  const arr = new Uint8Array(3);
  crypto.getRandomValues(arr);
  return `#${Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return `hsl(0, 0%, ${Math.round(l * 100)}%)`;
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = 0;
  if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (mx === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export default function RandomColorGenerator() {
  const t = useTranslations("tools.random-color-generator");
  const [count, setCount] = useState(6);
  const [format, setFormat] = useState<"hex" | "rgb" | "hsl">("hex");
  const [colors, setColors] = useState<string[]>([]);

  const generate = useCallback(() => {
    setColors(Array.from({ length: count }, () => randomHex()));
  }, [count]);

  const formatColor = (hex: string) => {
    if (format === "rgb") return hexToRgb(hex);
    if (format === "hsl") return hexToHsl(hex);
    return hex;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("ui.count")}:
          <input type="number" min={1} max={50} value={count} onChange={e => setCount(Math.max(1, Math.min(50, +e.target.value)))} className="ml-2 w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <select value={format} onChange={e => setFormat(e.target.value as "hex" | "rgb" | "hsl")} className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
          <option value="hsl">HSL</option>
        </select>
        <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.generate")}</button>
      </div>
      {colors.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {colors.map((hex, i) => (
            <button key={i} onClick={() => navigator.clipboard.writeText(formatColor(hex))} className="group flex flex-col items-center gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition">
              <div className="w-full aspect-square rounded-md shadow-sm" style={{ backgroundColor: hex }} />
              <code className="text-xs font-mono text-zinc-600 dark:text-zinc-400 group-hover:text-blue-600">{formatColor(hex)}</code>
            </button>
          ))}
        </div>
      )}
      {colors.length > 0 && (
        <button onClick={() => navigator.clipboard.writeText(colors.map(formatColor).join("\n"))} className="text-sm text-blue-600 hover:underline">{t("ui.copyAll")}</button>
      )}
    </div>
  );
}
