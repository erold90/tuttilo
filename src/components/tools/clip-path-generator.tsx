"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Shape = "circle" | "ellipse" | "inset" | "polygon-triangle" | "polygon-pentagon" | "polygon-hexagon" | "polygon-star" | "polygon-arrow";

function getClipPath(shape: Shape, params: Record<string, number>): string {
  switch (shape) {
    case "circle":
      return `circle(${params.radius ?? 50}% at ${params.cx ?? 50}% ${params.cy ?? 50}%)`;
    case "ellipse":
      return `ellipse(${params.rx ?? 50}% ${params.ry ?? 40}% at ${params.cx ?? 50}% ${params.cy ?? 50}%)`;
    case "inset":
      return `inset(${params.top ?? 10}% ${params.right ?? 10}% ${params.bottom ?? 10}% ${params.left ?? 10}% round ${params.round ?? 0}px)`;
    case "polygon-triangle":
      return "polygon(50% 0%, 0% 100%, 100% 100%)";
    case "polygon-pentagon":
      return "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)";
    case "polygon-hexagon":
      return "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
    case "polygon-star":
      return "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
    case "polygon-arrow":
      return "polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)";
    default:
      return "circle(50%)";
  }
}

export default function ClipPathGenerator() {
  const t = useTranslations("tools.clip-path-generator.ui");
  const [shape, setShape] = useState<Shape>("circle");
  const [params, setParams] = useState<Record<string, number>>({
    radius: 50, cx: 50, cy: 50, rx: 50, ry: 40,
    top: 10, right: 10, bottom: 10, left: 10, round: 0,
  });
  const [copied, setCopied] = useState(false);

  const clipPath = useMemo(() => getClipPath(shape, params), [shape, params]);
  const css = `clip-path: ${clipPath};`;

  const updateParam = (key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const copy = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shapes: Shape[] = ["circle", "ellipse", "inset", "polygon-triangle", "polygon-pentagon", "polygon-hexagon", "polygon-star", "polygon-arrow"];

  const renderControls = () => {
    if (shape === "circle") {
      return (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <label className="mb-1 block text-xs font-medium">{t("radius")}: {params.radius}%</label>
            <input type="range" min={0} max={100} value={params.radius} onChange={(e) => updateParam("radius", Number(e.target.value))} className="w-full" />
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <label className="mb-1 block text-xs font-medium">X: {params.cx}%</label>
            <input type="range" min={0} max={100} value={params.cx} onChange={(e) => updateParam("cx", Number(e.target.value))} className="w-full" />
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <label className="mb-1 block text-xs font-medium">Y: {params.cy}%</label>
            <input type="range" min={0} max={100} value={params.cy} onChange={(e) => updateParam("cy", Number(e.target.value))} className="w-full" />
          </div>
        </div>
      );
    }
    if (shape === "ellipse") {
      return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([["rx", "RX", params.rx], ["ry", "RY", params.ry], ["cx", "X", params.cx], ["cy", "Y", params.cy]] as [string, string, number][]).map(([key, label, val]) => (
            <div key={key} className="rounded-lg border border-border bg-card p-3">
              <label className="mb-1 block text-xs font-medium">{label}: {val}%</label>
              <input type="range" min={0} max={100} value={val} onChange={(e) => updateParam(key, Number(e.target.value))} className="w-full" />
            </div>
          ))}
        </div>
      );
    }
    if (shape === "inset") {
      return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {([["top", t("top"), params.top, 50], ["right", t("right"), params.right, 50], ["bottom", t("bottom"), params.bottom, 50], ["left", t("left"), params.left, 50], ["round", t("borderRadius"), params.round, 50]] as [string, string, number, number][]).map(([key, label, val, max]) => (
            <div key={key} className="rounded-lg border border-border bg-card p-3">
              <label className="mb-1 block text-xs font-medium">{label}: {val}{key === "round" ? "px" : "%"}</label>
              <input type="range" min={0} max={max} value={val} onChange={(e) => updateParam(key, Number(e.target.value))} className="w-full" />
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-sm text-muted-foreground">{t("polygonNote")}</p>;
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center rounded-xl border border-border bg-muted/30 p-8">
        <div className="relative h-48 w-48">
          <div className="absolute inset-0 rounded bg-muted/50" />
          <div className="absolute inset-0 bg-primary" style={{ clipPath }} />
        </div>
      </div>

      {/* Shape selection */}
      <div>
        <label className="mb-2 block text-sm font-medium">{t("shape")}</label>
        <div className="flex flex-wrap gap-2">
          {shapes.map((s) => (
            <button
              key={s}
              onClick={() => setShape(s)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                shape === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"
              }`}
            >
              {t(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      {renderControls()}

      {/* CSS Output */}
      <div>
        <label className="mb-2 block text-sm font-medium">{t("cssOutput")}</label>
        <div className="flex items-start gap-2">
          <code className="flex-1 rounded-lg border border-border bg-muted/50 p-3 font-mono text-sm break-all">{css}</code>
          <button onClick={copy} className="shrink-0 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">{copied ? t("copied") : t("copy")}</button>
        </div>
      </div>
    </div>
  );
}
