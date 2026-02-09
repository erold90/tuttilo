"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Preset = "bounce" | "fade-in" | "slide-in" | "rotate" | "pulse" | "shake" | "zoom-in" | "flip";

const presets: Record<Preset, { keyframes: string; defaultDuration: number; defaultTiming: string }> = {
  bounce: {
    keyframes: `@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}`,
    defaultDuration: 0.6,
    defaultTiming: "ease",
  },
  "fade-in": {
    keyframes: `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`,
    defaultDuration: 0.5,
    defaultTiming: "ease-in",
  },
  "slide-in": {
    keyframes: `@keyframes slideIn {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}`,
    defaultDuration: 0.5,
    defaultTiming: "ease-out",
  },
  rotate: {
    keyframes: `@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
    defaultDuration: 1,
    defaultTiming: "linear",
  },
  pulse: {
    keyframes: `@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}`,
    defaultDuration: 1,
    defaultTiming: "ease-in-out",
  },
  shake: {
    keyframes: `@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}`,
    defaultDuration: 0.4,
    defaultTiming: "ease-in-out",
  },
  "zoom-in": {
    keyframes: `@keyframes zoomIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}`,
    defaultDuration: 0.4,
    defaultTiming: "ease-out",
  },
  flip: {
    keyframes: `@keyframes flip {
  from { transform: perspective(400px) rotateY(0); }
  to { transform: perspective(400px) rotateY(360deg); }
}`,
    defaultDuration: 0.8,
    defaultTiming: "ease-in-out",
  },
};

const animNameMap: Record<Preset, string> = {
  bounce: "bounce",
  "fade-in": "fadeIn",
  "slide-in": "slideIn",
  rotate: "rotate",
  pulse: "pulse",
  shake: "shake",
  "zoom-in": "zoomIn",
  flip: "flip",
};

const timingOptions = ["linear", "ease", "ease-in", "ease-out", "ease-in-out"];

export default function AnimationGenerator() {
  const t = useTranslations("tools.animation-generator.ui");
  const [preset, setPreset] = useState<Preset>("bounce");
  const [duration, setDuration] = useState(0.6);
  const [timing, setTiming] = useState("ease");
  const [iterations, setIterations] = useState("infinite");
  const [playing, setPlaying] = useState(true);
  const [copied, setCopied] = useState(false);

  const animName = animNameMap[preset];
  const animCSS = `animation: ${animName} ${duration}s ${timing} ${iterations};`;
  const fullCSS = `${presets[preset].keyframes}\n\n.element {\n  ${animCSS}\n}`;

  const previewStyle = useMemo(() => {
    if (!playing) return {};
    return {
      animation: `${animName} ${duration}s ${timing} ${iterations}`,
    };
  }, [playing, animName, duration, timing, iterations]);

  const handlePresetChange = (p: Preset) => {
    setPreset(p);
    setDuration(presets[p].defaultDuration);
    setTiming(presets[p].defaultTiming);
  };

  const copy = () => {
    navigator.clipboard.writeText(fullCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const replay = () => {
    setPlaying(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setPlaying(true)));
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center rounded-xl border border-border bg-muted/30 p-12">
        <style>{presets[preset].keyframes}</style>
        <div className="h-20 w-20 rounded-xl bg-primary" style={previewStyle} />
      </div>

      {/* Replay */}
      <div className="flex justify-center">
        <button onClick={replay} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
          ▶ {t("replay")}
        </button>
      </div>

      {/* Preset selection */}
      <div>
        <label className="mb-2 block text-sm font-medium">{t("preset")}</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(presets) as Preset[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePresetChange(p)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                preset === p ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"
              }`}
            >
              {t(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <label className="mb-1 block text-xs font-medium">{t("duration")}: {duration}s</label>
          <input type="range" min={0.1} max={3} step={0.1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full" />
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <label className="mb-1 block text-xs font-medium">{t("timing")}</label>
          <select value={timing} onChange={(e) => setTiming(e.target.value)} className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm">
            {timingOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <label className="mb-1 block text-xs font-medium">{t("iterations")}</label>
          <select value={iterations} onChange={(e) => setIterations(e.target.value)} className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm">
            <option value="infinite">{t("infinite")}</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="5">5</option>
          </select>
        </div>
      </div>

      {/* CSS Output */}
      <div>
        <label className="mb-2 block text-sm font-medium">{t("cssOutput")}</label>
        <div className="flex items-start gap-2">
          <pre className="flex-1 rounded-lg border border-border bg-muted/50 p-3 font-mono text-sm whitespace-pre-wrap">{fullCSS}</pre>
          <button onClick={copy} className="shrink-0 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">{copied ? t("copied") : t("copy")}</button>
        </div>
      </div>
    </div>
  );
}
