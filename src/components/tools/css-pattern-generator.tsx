"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type PatternType = "stripes" | "dots" | "grid" | "checkerboard" | "zigzag" | "diagonal";

function generatePattern(type: PatternType, color1: string, color2: string, size: number): string {
  switch (type) {
    case "stripes":
      return `repeating-linear-gradient(0deg, ${color1}, ${color1} ${size}px, ${color2} ${size}px, ${color2} ${size * 2}px)`;
    case "dots":
      return `radial-gradient(circle, ${color1} ${Math.max(1, size / 5)}px, transparent ${Math.max(1, size / 5)}px), ${color2}`;
    case "grid":
      return `linear-gradient(${color1} 1px, transparent 1px), linear-gradient(90deg, ${color1} 1px, transparent 1px), ${color2}`;
    case "checkerboard":
      return `conic-gradient(${color1} 90deg, ${color2} 90deg 180deg, ${color1} 180deg 270deg, ${color2} 270deg)`;
    case "zigzag":
      return `linear-gradient(135deg, ${color1} 25%, transparent 25%) -${size}px 0, linear-gradient(225deg, ${color1} 25%, transparent 25%) -${size}px 0, linear-gradient(315deg, ${color1} 25%, transparent 25%), linear-gradient(45deg, ${color1} 25%, transparent 25%)`;
    case "diagonal":
      return `repeating-linear-gradient(45deg, ${color1}, ${color1} ${size}px, ${color2} ${size}px, ${color2} ${size * 2}px)`;
    default:
      return color1;
  }
}

function generateCSS(type: PatternType, color1: string, color2: string, size: number): string {
  const bg = generatePattern(type, color1, color2, size);
  let css = `background: ${bg};`;
  if (type === "dots") {
    css += `\nbackground-size: ${size}px ${size}px;`;
  } else if (type === "grid") {
    css += `\nbackground-size: ${size}px ${size}px;`;
  } else if (type === "checkerboard") {
    css += `\nbackground-size: ${size}px ${size}px;`;
  } else if (type === "zigzag") {
    css += `\nbackground-size: ${size * 2}px ${size * 2}px;`;
  }
  return css;
}

export default function CSSPatternGenerator() {
  const t = useTranslations("tools.css-pattern-generator.ui");
  const [pattern, setPattern] = useState<PatternType>("stripes");
  const [color1, setColor1] = useState("#6366F1");
  const [color2, setColor2] = useState("#EEF2FF");
  const [size, setSize] = useState(20);
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => generateCSS(pattern, color1, color2, size), [pattern, color1, color2, size]);
  const bgStyle = useMemo(() => {
    const style: React.CSSProperties = { background: generatePattern(pattern, color1, color2, size) };
    if (["dots", "grid", "checkerboard"].includes(pattern)) {
      style.backgroundSize = `${size}px ${size}px`;
    } else if (pattern === "zigzag") {
      style.backgroundSize = `${size * 2}px ${size * 2}px`;
    }
    return style;
  }, [pattern, color1, color2, size]);

  const copy = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const patterns: PatternType[] = ["stripes", "dots", "grid", "checkerboard", "zigzag", "diagonal"];

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="h-48 w-full rounded-xl border border-border" style={bgStyle} />

      {/* Pattern type */}
      <div>
        <label className="mb-2 block text-sm font-medium">{t("pattern")}</label>
        <div className="flex flex-wrap gap-2">
          {patterns.map((p) => (
            <button
              key={p}
              onClick={() => setPattern(p)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                pattern === p ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"
              }`}
            >
              {t(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Colors + size */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium">{t("color1")}</label>
          <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-border" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">{t("color2")}</label>
          <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-border" />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="mb-1 block text-xs font-medium">{t("size")}: {size}px</label>
          <input type="range" min={5} max={60} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
        </div>
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
