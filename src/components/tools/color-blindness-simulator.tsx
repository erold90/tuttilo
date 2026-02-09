"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type CVDType = "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}

function simulateCVD(r: number, g: number, b: number, type: CVDType): [number, number, number] {
  const matrices: Record<CVDType, number[][]> = {
    protanopia: [
      [0.567, 0.433, 0],
      [0.558, 0.442, 0],
      [0, 0.242, 0.758],
    ],
    deuteranopia: [
      [0.625, 0.375, 0],
      [0.7, 0.3, 0],
      [0, 0.3, 0.7],
    ],
    tritanopia: [
      [0.95, 0.05, 0],
      [0, 0.433, 0.567],
      [0, 0.475, 0.525],
    ],
    achromatopsia: [
      [0.299, 0.587, 0.114],
      [0.299, 0.587, 0.114],
      [0.299, 0.587, 0.114],
    ],
  };
  const m = matrices[type];
  return [
    m[0][0] * r + m[0][1] * g + m[0][2] * b,
    m[1][0] * r + m[1][1] * g + m[1][2] * b,
    m[2][0] * r + m[2][1] * g + m[2][2] * b,
  ];
}

export default function ColorBlindnessSimulator() {
  const t = useTranslations("tools.color-blindness-simulator.ui");
  const [colors, setColors] = useState(["#EF4444", "#22C55E", "#3B82F6", "#F59E0B", "#8B5CF6"]);

  const types: CVDType[] = ["protanopia", "deuteranopia", "tritanopia", "achromatopsia"];

  const simulated = useMemo(() => {
    const result: Record<string, string[]> = { normal: colors };
    types.forEach((type) => {
      result[type] = colors.map((hex) => {
        const [r, g, b] = hexToRgb(hex);
        const [sr, sg, sb] = simulateCVD(r, g, b, type);
        return rgbToHex(sr, sg, sb);
      });
    });
    return result;
  }, [colors]);

  const updateColor = (idx: number, hex: string) => {
    setColors(colors.map((c, i) => (i === idx ? hex : c)));
  };

  const addColor = () => {
    if (colors.length < 10) setColors([...colors, "#6366F1"]);
  };

  const removeColor = (idx: number) => {
    if (colors.length <= 2) return;
    setColors(colors.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Color inputs */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">{t("yourColors")}</label>
          {colors.length < 10 && (
            <button onClick={addColor} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">+ {t("addColor")}</button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
              <input type="color" value={c} onChange={(e) => updateColor(i, e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-border" />
              <span className="font-mono text-xs">{c.toUpperCase()}</span>
              {colors.length > 2 && (
                <button onClick={() => removeColor(i)} className="text-xs text-muted-foreground hover:text-destructive">✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Simulation grid */}
      <div className="space-y-4">
        {(["normal", ...types] as string[]).map((type) => (
          <div key={type} className="rounded-lg border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{t(type)}</span>
              {type !== "normal" && (
                <span className="text-xs text-muted-foreground">{t(`${type}Desc`)}</span>
              )}
            </div>
            <div className="flex gap-2">
              {simulated[type]?.map((hex, i) => (
                <div key={i} className="flex-1">
                  <div className="h-12 rounded-md" style={{ backgroundColor: hex }} />
                  <div className="mt-1 text-center font-mono text-[10px] text-muted-foreground">{hex.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
