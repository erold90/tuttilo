"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function BorderRadiusGenerator() {
  const t = useTranslations("tools.border-radius-generator.ui");
  const [tl, setTl] = useState(16);
  const [tr, setTr] = useState(16);
  const [br, setBr] = useState(16);
  const [bl, setBl] = useState(16);
  const [linked, setLinked] = useState(true);
  const [unit, setUnit] = useState<"px" | "%" | "rem">("px");
  const [copied, setCopied] = useState(false);

  const setAll = (v: number) => { setTl(v); setTr(v); setBr(v); setBl(v); };

  const handleChange = (corner: string, v: number) => {
    if (linked) { setAll(v); return; }
    switch (corner) {
      case "tl": setTl(v); break;
      case "tr": setTr(v); break;
      case "br": setBr(v); break;
      case "bl": setBl(v); break;
    }
  };

  const allSame = tl === tr && tr === br && br === bl;
  const css = allSame
    ? `border-radius: ${tl}${unit};`
    : `border-radius: ${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit};`;

  const copy = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const max = unit === "%" ? 50 : unit === "rem" ? 10 : 100;

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center rounded-xl border border-border bg-muted/30 p-12">
        <div
          className="h-40 w-56 border-2 border-primary bg-primary/20"
          style={{ borderRadius: `${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit}` }}
        />
      </div>

      {/* Link toggle + unit */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={linked} onChange={(e) => setLinked(e.target.checked)} className="rounded" />
          {t("linkCorners")}
        </label>
        <div className="flex gap-1">
          {(["px", "%", "rem"] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`rounded px-3 py-1 text-xs font-medium ${unit === u ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Corner controls */}
      <div className="grid grid-cols-2 gap-4">
        {([
          ["tl", t("topLeft"), tl],
          ["tr", t("topRight"), tr],
          ["bl", t("bottomLeft"), bl],
          ["br", t("bottomRight"), br],
        ] as [string, string, number][]).map(([key, label, val]) => (
          <div key={key} className="rounded-lg border border-border bg-card p-3">
            <label className="mb-1 block text-xs font-medium">{label}: {val}{unit}</label>
            <input
              type="range"
              min={0}
              max={max}
              value={val}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* CSS Output */}
      <div>
        <label className="mb-2 block text-sm font-medium">{t("cssOutput")}</label>
        <div className="flex items-start gap-2">
          <code className="flex-1 rounded-lg border border-border bg-muted/50 p-3 font-mono text-sm">{css}</code>
          <button onClick={copy} className="shrink-0 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">{copied ? t("copied") : t("copy")}</button>
        </div>
      </div>
    </div>
  );
}
