"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface ColorStop {
  id: number;
  color: string;
  position: number;
}

let nextId = 3;

export default function GradientGenerator() {
  const t = useTranslations("tools.gradient-generator.ui");
  const [type, setType] = useState<"linear" | "radial" | "conic">("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { id: 1, color: "#6366F1", position: 0 },
    { id: 2, color: "#EC4899", position: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const buildCSS = useCallback(() => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopStr = sortedStops.map((s) => `${s.color} ${s.position}%`).join(", ");
    if (type === "linear") return `linear-gradient(${angle}deg, ${stopStr})`;
    if (type === "radial") return `radial-gradient(circle, ${stopStr})`;
    return `conic-gradient(from ${angle}deg, ${stopStr})`;
  }, [type, angle, stops]);

  const css = buildCSS();

  const addStop = () => {
    const newPos = Math.round((stops[stops.length - 1]?.position ?? 0) / 2 + 50);
    setStops([...stops, { id: nextId++, color: "#10B981", position: Math.min(newPos, 100) }]);
  };

  const removeStop = (id: number) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((s) => s.id !== id));
  };

  const updateStop = (id: number, field: "color" | "position", value: string | number) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const copy = () => {
    navigator.clipboard.writeText(`background: ${css};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="h-48 w-full rounded-xl border border-border shadow-inner" style={{ background: css }} />

      {/* Gradient type */}
      <div>
        <label className="mb-2 block text-sm font-medium">{t("type")}</label>
        <div className="flex gap-2">
          {(["linear", "radial", "conic"] as const).map((gt) => (
            <button
              key={gt}
              onClick={() => setType(gt)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                type === gt
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              {t(gt)}
            </button>
          ))}
        </div>
      </div>

      {/* Angle (for linear and conic) */}
      {(type === "linear" || type === "conic") && (
        <div>
          <label className="mb-2 block text-sm font-medium">
            {t("angle")}: {angle}°
          </label>
          <input
            type="range"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* Color stops */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">{t("colorStops")}</label>
          <button
            onClick={addStop}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            + {t("addStop")}
          </button>
        </div>
        <div className="space-y-3">
          {stops.map((stop) => (
            <div key={stop.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-border"
              />
              <input
                type="text"
                value={stop.color}
                onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                className="w-24 rounded border border-border bg-background px-2 py-1.5 font-mono text-xs"
              />
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stop.position}
                  onChange={(e) => updateStop(stop.id, "position", Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-10 text-right font-mono text-xs text-muted-foreground">{stop.position}%</span>
              </div>
              {stops.length > 2 && (
                <button
                  onClick={() => removeStop(stop.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CSS Output */}
      <div>
        <label className="mb-2 block text-sm font-medium">{t("cssOutput")}</label>
        <div className="flex items-start gap-2">
          <code className="flex-1 rounded-lg border border-border bg-muted/50 p-3 font-mono text-sm break-all">
            background: {css};
          </code>
          <button
            onClick={copy}
            className="shrink-0 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
      </div>
    </div>
  );
}
