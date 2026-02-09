"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function GlassmorphismGenerator() {
  const t = useTranslations("tools.glassmorphism-generator.ui");
  const [blur, setBlur] = useState(12);
  const [opacity, setOpacity] = useState(25);
  const [saturation, setSaturation] = useState(180);
  const [borderOpacity, setBorderOpacity] = useState(20);
  const [color, setColor] = useState("#ffffff");
  const [bgColor1, setBgColor1] = useState("#6366F1");
  const [bgColor2, setBgColor2] = useState("#EC4899");
  const [copied, setCopied] = useState(false);

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  const css = `background: rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)});
backdrop-filter: blur(${blur}px) saturate(${saturation}%);
-webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);
border: 1px solid rgba(${r}, ${g}, ${b}, ${(borderOpacity / 100).toFixed(2)});
border-radius: 16px;`;

  const copy = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div
        className="flex items-center justify-center rounded-xl border border-border p-8"
        style={{ background: `linear-gradient(135deg, ${bgColor1}, ${bgColor2})`, minHeight: "240px" }}
      >
        <div
          className="flex h-40 w-64 items-center justify-center rounded-2xl p-6 text-center"
          style={{
            background: `rgba(${r}, ${g}, ${b}, ${opacity / 100})`,
            backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
            WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
            border: `1px solid rgba(${r}, ${g}, ${b}, ${borderOpacity / 100})`,
          }}
        >
          <p className="text-sm font-medium text-white drop-shadow-sm">{t("previewText")}</p>
        </div>
      </div>

      {/* Background colors */}
      <div className="flex gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium">{t("bgColor1")}</label>
          <input type="color" value={bgColor1} onChange={(e) => setBgColor1(e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-border" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">{t("bgColor2")}</label>
          <input type="color" value={bgColor2} onChange={(e) => setBgColor2(e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-border" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">{t("glassColor")}</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-border" />
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-2">
        {([
          ["blur", t("blur"), blur, setBlur, 0, 40, "px"],
          ["opacity", t("opacity"), opacity, setOpacity, 0, 100, "%"],
          ["saturation", t("saturation"), saturation, setSaturation, 100, 300, "%"],
          ["border", t("borderOpacity"), borderOpacity, setBorderOpacity, 0, 100, "%"],
        ] as [string, string, number, (v: number) => void, number, number, string][]).map(([key, label, val, setter, min, max, suffix]) => (
          <div key={key} className="rounded-lg border border-border bg-card p-3">
            <label className="mb-1 block text-xs font-medium">{label}: {val}{suffix}</label>
            <input type="range" min={min} max={max} value={val} onChange={(e) => setter(Number(e.target.value))} className="w-full" />
          </div>
        ))}
      </div>

      {/* CSS Output */}
      <div>
        <label className="mb-2 block text-sm font-medium">{t("cssOutput")}</label>
        <div className="flex items-start gap-2">
          <pre className="flex-1 rounded-lg border border-border bg-muted/50 p-3 font-mono text-sm whitespace-pre-wrap">{css}</pre>
          <button onClick={copy} className="shrink-0 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">{copied ? t("copied") : t("copy")}</button>
        </div>
      </div>
    </div>
  );
}
