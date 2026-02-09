"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function rgbToHwb(r: number, g: number, b: number): [number, number, number] {
  const [h] = rgbToHsl(r, g, b);
  const w = Math.min(r, g, b) / 255 * 100;
  const bl = (1 - Math.max(r, g, b) / 255) * 100;
  return [h, Math.round(w), Math.round(bl)];
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  if (r === 0 && g === 0 && b === 0) return [0, 0, 0, 100];
  const c1 = 1 - r / 255, m1 = 1 - g / 255, y1 = 1 - b / 255;
  const k = Math.min(c1, m1, y1);
  return [Math.round((c1 - k) / (1 - k) * 100), Math.round((m1 - k) / (1 - k) * 100), Math.round((y1 - k) / (1 - k) * 100), Math.round(k * 100)];
}

export default function ColorConverter() {
  const t = useTranslations("tools.color-converter");
  const [hex, setHex] = useState("#3B82F6");

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgb ? rgbToHsl(...rgb) : null, [rgb]);
  const hwb = useMemo(() => rgb ? rgbToHwb(...rgb) : null, [rgb]);
  const cmyk = useMemo(() => rgb ? rgbToCmyk(...rgb) : null, [rgb]);

  const formats = useMemo(() => {
    if (!rgb || !hsl || !hwb || !cmyk) return [];
    return [
      { label: "HEX", value: hex.toUpperCase() },
      { label: "RGB", value: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` },
      { label: "HSL", value: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` },
      { label: "HWB", value: `hwb(${hwb[0]} ${hwb[1]}% ${hwb[2]}%)` },
      { label: "CMYK", value: `cmyk(${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%)` },
      { label: "CSS Named", value: "" },
    ];
  }, [hex, rgb, hsl, hwb, cmyk]);

  const handleColorInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setHex(e.target.value), []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input type="color" value={hex} onChange={handleColorInput} className="w-16 h-16 rounded-lg border border-zinc-300 dark:border-zinc-600 cursor-pointer" />
        <input value={hex} onChange={e => { const v = e.target.value; if (/^#?[0-9a-fA-F]{0,6}$/.test(v.replace("#", ""))) setHex(v.startsWith("#") ? v : `#${v}`); }} className="px-3 py-2 font-mono text-lg rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 w-40" />
        <div className="w-24 h-16 rounded-lg border border-zinc-300 dark:border-zinc-600" style={{ backgroundColor: hex }} />
      </div>
      {formats.length > 0 && (
        <div className="space-y-2">
          {formats.filter(f => f.value).map(f => (
            <div key={f.label} className="flex items-center gap-3">
              <span className="w-16 text-sm font-medium text-zinc-500 dark:text-zinc-400">{f.label}</span>
              <code className="flex-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-sm font-mono">{f.value}</code>
              <button onClick={() => navigator.clipboard.writeText(f.value)} className="px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-600 rounded hover:bg-zinc-300 dark:hover:bg-zinc-500">{t("ui.copy")}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
