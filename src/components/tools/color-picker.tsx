"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
  );
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function ColorPicker() {
  const t = useTranslations("tools.color-picker.ui");
  const [hex, setHex] = useState("#6366F1");
  const [copiedField, setCopiedField] = useState("");

  const rgb = hexToRgb(hex) || { r: 99, g: 102, b: 241 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const handleHexChange = useCallback((value: string) => {
    let v = value.startsWith("#") ? value : "#" + value;
    setHex(v);
  }, []);

  const handleColorInput = useCallback((value: string) => {
    setHex(value);
  }, []);

  function copy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  }

  const formats = [
    { label: "HEX", value: hex.toUpperCase(), field: "hex" },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, field: "rgb" },
    {
      label: "HSL",
      value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      field: "hsl",
    },
    {
      label: "CSS",
      value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
      field: "css",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Color preview + picker */}
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div
          className="h-40 w-40 shrink-0 rounded-2xl border-4 border-border shadow-lg"
          style={{ backgroundColor: hex }}
        />
        <div className="flex-1 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("pickColor")}
            </label>
            <input
              type="color"
              value={hex.length === 7 ? hex : "#6366F1"}
              onChange={(e) => handleColorInput(e.target.value)}
              className="h-12 w-full cursor-pointer rounded-lg border border-border"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">HEX</label>
            <input
              type="text"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              maxLength={7}
              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Color formats */}
      <div className="grid gap-3 sm:grid-cols-2">
        {formats.map((fmt) => (
          <div
            key={fmt.field}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
          >
            <div>
              <p className="text-xs text-muted-foreground">{fmt.label}</p>
              <p className="font-mono text-sm font-medium">{fmt.value}</p>
            </div>
            <button
              onClick={() => copy(fmt.value, fmt.field)}
              className="rounded-md border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
            >
              {copiedField === fmt.field ? t("copied") : t("copy")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
