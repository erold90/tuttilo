"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Harmony = "complementary" | "analogous" | "triadic" | "split" | "tetradic" | "monochromatic";

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
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
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette(hex: string, harmony: Harmony): string[] {
  const [h, s, l] = hexToHsl(hex);
  switch (harmony) {
    case "complementary":
      return [hex, hslToHex(h + 180, s, l)];
    case "analogous":
      return [hslToHex(h - 30, s, l), hex, hslToHex(h + 30, s, l)];
    case "triadic":
      return [hex, hslToHex(h + 120, s, l), hslToHex(h + 240, s, l)];
    case "split":
      return [hex, hslToHex(h + 150, s, l), hslToHex(h + 210, s, l)];
    case "tetradic":
      return [hex, hslToHex(h + 90, s, l), hslToHex(h + 180, s, l), hslToHex(h + 270, s, l)];
    case "monochromatic":
      return [
        hslToHex(h, s, Math.max(l - 30, 10)),
        hslToHex(h, s, Math.max(l - 15, 10)),
        hex,
        hslToHex(h, s, Math.min(l + 15, 90)),
        hslToHex(h, s, Math.min(l + 30, 90)),
      ];
    default:
      return [hex];
  }
}

export default function PaletteGenerator() {
  const t = useTranslations("tools.palette-generator.ui");
  const [baseColor, setBaseColor] = useState("#6366F1");
  const [harmony, setHarmony] = useState<Harmony>("analogous");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const palette = useMemo(() => generatePalette(baseColor, harmony), [baseColor, harmony]);

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

  const harmonies: Harmony[] = ["complementary", "analogous", "triadic", "split", "tetradic", "monochromatic"];

  return (
    <div className="space-y-6">
      {/* Base color */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <label className="mb-2 block text-sm font-medium">{t("baseColor")}</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="h-11 w-16 cursor-pointer rounded-lg border border-border"
            />
            <input
              type="text"
              value={baseColor.toUpperCase()}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setBaseColor(v);
              }}
              maxLength={7}
              className="w-28 rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium">{t("harmony")}</label>
          <div className="flex flex-wrap gap-2">
            {harmonies.map((h) => (
              <button
                key={h}
                onClick={() => setHarmony(h)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  harmony === h
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                {t(h)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Palette preview */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="flex h-32">
          {palette.map((color, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>

      {/* Color cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {palette.map((color, i) => {
          const [h, s, l] = hexToHsl(color);
          return (
            <button
              key={i}
              onClick={() => copy(color, i)}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
            >
              <div className="h-10 w-10 shrink-0 rounded-md border border-border" style={{ backgroundColor: color }} />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-medium">{color.toUpperCase()}</div>
                <div className="text-xs text-muted-foreground">
                  HSL({h}, {s}%, {l}%)
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {copiedIdx === i ? t("copied") : t("copy")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Copy all */}
      <button
        onClick={copyAll}
        className="w-full rounded-lg border border-border py-2.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        {copiedIdx === -1 ? t("copied") : t("copyAll")}
      </button>
    </div>
  );
}
