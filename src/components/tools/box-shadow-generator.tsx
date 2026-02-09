"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface Shadow {
  id: number;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

let nextId = 2;

function shadowToCSS(s: Shadow): string {
  const r = parseInt(s.color.slice(1, 3), 16);
  const g = parseInt(s.color.slice(3, 5), 16);
  const b = parseInt(s.color.slice(5, 7), 16);
  const rgba = `rgba(${r}, ${g}, ${b}, ${s.opacity})`;
  return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${rgba}`;
}

export default function BoxShadowGenerator() {
  const t = useTranslations("tools.box-shadow-generator.ui");
  const [shadows, setShadows] = useState<Shadow[]>([
    { id: 1, x: 4, y: 4, blur: 12, spread: 0, color: "#000000", opacity: 0.15, inset: false },
  ]);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [boxColor, setBoxColor] = useState("#ffffff");
  const [copied, setCopied] = useState(false);

  const css = shadows.map(shadowToCSS).join(", ");

  const update = useCallback((id: number, field: keyof Shadow, value: number | string | boolean) => {
    setShadows((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }, []);

  const addShadow = () => {
    setShadows([...shadows, { id: nextId++, x: 0, y: 4, blur: 8, spread: 0, color: "#000000", opacity: 0.1, inset: false }]);
  };

  const removeShadow = (id: number) => {
    if (shadows.length <= 1) return;
    setShadows(shadows.filter((s) => s.id !== id));
  };

  const copy = () => {
    navigator.clipboard.writeText(`box-shadow: ${css};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center rounded-xl border border-border p-12" style={{ backgroundColor: bgColor }}>
        <div className="h-32 w-48 rounded-xl" style={{ backgroundColor: boxColor, boxShadow: css }} />
      </div>

      {/* Colors */}
      <div className="flex gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium">{t("bgColor")}</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-border" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">{t("boxColor")}</label>
          <input type="color" value={boxColor} onChange={(e) => setBoxColor(e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-border" />
        </div>
      </div>

      {/* Shadow layers */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">{t("shadows")}</label>
          <button onClick={addShadow} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">+ {t("addShadow")}</button>
        </div>
        {shadows.map((s, idx) => (
          <div key={s.id} className="mb-3 rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">{t("layer")} {idx + 1}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs">
                  <input type="checkbox" checked={s.inset} onChange={(e) => update(s.id, "inset", e.target.checked)} className="rounded" />
                  {t("inset")}
                </label>
                {shadows.length > 1 && (
                  <button onClick={() => removeShadow(s.id)} className="text-xs text-muted-foreground hover:text-destructive">✕</button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {([
                ["x", "X", s.x, -50, 50],
                ["y", "Y", s.y, -50, 50],
                ["blur", t("blur"), s.blur, 0, 100],
                ["spread", t("spread"), s.spread, -50, 50],
              ] as [string, string, number, number, number][]).map(([field, label, val, min, max]) => (
                <div key={field}>
                  <label className="mb-1 block text-xs text-muted-foreground">{label}: {val}px</label>
                  <input type="range" min={min} max={max} value={val} onChange={(e) => update(s.id, field as keyof Shadow, Number(e.target.value))} className="w-full" />
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{t("color")}</label>
                <input type="color" value={s.color} onChange={(e) => update(s.id, "color", e.target.value)} className="h-8 w-12 cursor-pointer rounded border border-border" />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">{t("opacity")}: {Math.round(s.opacity * 100)}%</label>
                <input type="range" min={0} max={100} value={Math.round(s.opacity * 100)} onChange={(e) => update(s.id, "opacity", Number(e.target.value) / 100)} className="w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CSS Output */}
      <div>
        <label className="mb-2 block text-sm font-medium">{t("cssOutput")}</label>
        <div className="flex items-start gap-2">
          <code className="flex-1 rounded-lg border border-border bg-muted/50 p-3 font-mono text-sm break-all">box-shadow: {css};</code>
          <button onClick={copy} className="shrink-0 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">{copied ? t("copied") : t("copy")}</button>
        </div>
      </div>
    </div>
  );
}
