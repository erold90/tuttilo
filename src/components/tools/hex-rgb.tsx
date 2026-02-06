"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16), a: m[4] ? parseInt(m[4], 16) / 255 : 1 };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToCmyk(r: number, g: number, b: number) {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
  const c1 = 1 - r / 255, m1 = 1 - g / 255, y1 = 1 - b / 255;
  const k = Math.min(c1, m1, y1);
  return {
    c: Math.round(((c1 - k) / (1 - k)) * 100),
    m: Math.round(((m1 - k) / (1 - k)) * 100),
    y: Math.round(((y1 - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

export function HexRgb() {
  const t = useTranslations("tools.hex-rgb.ui");
  const [hex, setHex] = useState("#6366F1");
  const [r, setR] = useState(99);
  const [g, setG] = useState(102);
  const [b, setB] = useState(241);

  const updateFromHex = useCallback((v: string) => {
    setHex(v);
    const rgb = hexToRgb(v);
    if (rgb) { setR(rgb.r); setG(rgb.g); setB(rgb.b); }
  }, []);

  const updateFromRgb = useCallback((nr: number, ng: number, nb: number) => {
    setR(nr); setG(ng); setB(nb);
    setHex(rgbToHex(nr, ng, nb));
  }, []);

  const hsl = rgbToHsl(r, g, b);
  const cmyk = rgbToCmyk(r, g, b);

  const formats = [
    { label: "HEX", value: hex.toUpperCase() },
    { label: "RGB", value: `rgb(${r}, ${g}, ${b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "CMYK", value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
    { label: "CSS", value: hex.toUpperCase() },
  ];

  const copy = (v: string) => navigator.clipboard.writeText(v);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="h-32 w-32 shrink-0 rounded-xl border border-border shadow-lg" style={{ backgroundColor: hex }} />
        <div className="flex-1 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">HEX</label>
            <input
              type="text"
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "R", value: r, set: (v: number) => updateFromRgb(v, g, b) },
              { label: "G", value: g, set: (v: number) => updateFromRgb(r, v, b) },
              { label: "B", value: b, set: (v: number) => updateFromRgb(r, g, v) },
            ].map((ch) => (
              <div key={ch.label}>
                <label className="mb-1 block text-xs font-medium">{ch.label}</label>
                <input
                  type="range"
                  min={0}
                  max={255}
                  value={ch.value}
                  onChange={(e) => ch.set(Number(e.target.value))}
                  className="w-full"
                />
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={ch.value}
                  onChange={(e) => ch.set(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-center font-mono text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {formats.map((f) => (
          <div key={f.label} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <div>
              <div className="text-xs text-muted-foreground">{f.label}</div>
              <div className="font-mono text-sm">{f.value}</div>
            </div>
            <button onClick={() => copy(f.value)} className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10">{t("copy")}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
