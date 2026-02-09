"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(...hexToRgb(hex1));
  const l2 = luminance(...hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

interface WCAGResult {
  ratio: number;
  aa: boolean;
  aaLarge: boolean;
  aaa: boolean;
  aaaLarge: boolean;
}

function checkWCAG(fg: string, bg: string): WCAGResult {
  const ratio = contrastRatio(fg, bg);
  return {
    ratio: Math.round(ratio * 100) / 100,
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

function Badge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        pass
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {pass ? "✓" : "✕"} {label}
    </span>
  );
}

export default function ContrastChecker() {
  const t = useTranslations("tools.contrast-checker.ui");
  const [fg, setFg] = useState("#FFFFFF");
  const [bg, setBg] = useState("#6366F1");

  const result = useMemo(() => checkWCAG(fg, bg), [fg, bg]);

  const swap = () => {
    setFg(bg);
    setBg(fg);
  };

  return (
    <div className="space-y-6">
      {/* Color inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">{t("foreground")}</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="h-11 w-14 cursor-pointer rounded-lg border border-border"
            />
            <input
              type="text"
              value={fg.toUpperCase()}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setFg(v);
              }}
              maxLength={7}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">{t("background")}</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="h-11 w-14 cursor-pointer rounded-lg border border-border"
            />
            <input
              type="text"
              value={bg.toUpperCase()}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setBg(v);
              }}
              maxLength={7}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Swap button */}
      <div className="flex justify-center">
        <button
          onClick={swap}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          ⇄ {t("swap")}
        </button>
      </div>

      {/* Preview */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="p-8 text-center" style={{ backgroundColor: bg, color: fg }}>
          <p className="text-2xl font-bold">{t("previewTitle")}</p>
          <p className="mt-2 text-base">{t("previewBody")}</p>
          <p className="mt-1 text-sm">{t("previewSmall")}</p>
        </div>
      </div>

      {/* Ratio */}
      <div className="text-center">
        <div className="text-5xl font-bold tabular-nums">{result.ratio}:1</div>
        <p className="mt-1 text-sm text-muted-foreground">{t("contrastRatio")}</p>
      </div>

      {/* WCAG badges */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4">
          <Badge pass={result.aa} label="AA" />
          <span className="text-xs text-muted-foreground">{t("normalText")}</span>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4">
          <Badge pass={result.aaLarge} label="AA" />
          <span className="text-xs text-muted-foreground">{t("largeText")}</span>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4">
          <Badge pass={result.aaa} label="AAA" />
          <span className="text-xs text-muted-foreground">{t("normalText")}</span>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4">
          <Badge pass={result.aaaLarge} label="AAA" />
          <span className="text-xs text-muted-foreground">{t("largeText")}</span>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{t("wcagInfo")}</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>{t("wcagAA")}</li>
          <li>{t("wcagAAA")}</li>
          <li>{t("wcagLarge")}</li>
        </ul>
      </div>
    </div>
  );
}
