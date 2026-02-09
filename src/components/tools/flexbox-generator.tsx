"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function FlexboxGenerator() {
  const t = useTranslations("tools.flexbox-generator.ui");
  const [direction, setDirection] = useState("row");
  const [wrap, setWrap] = useState("nowrap");
  const [justify, setJustify] = useState("flex-start");
  const [alignItems, setAlignItems] = useState("stretch");
  const [alignContent, setAlignContent] = useState("stretch");
  const [gap, setGap] = useState(8);
  const [itemCount, setItemCount] = useState(6);
  const [copied, setCopied] = useState(false);

  const css = `display: flex;
flex-direction: ${direction};
flex-wrap: ${wrap};
justify-content: ${justify};
align-items: ${alignItems};${wrap !== "nowrap" ? `\nalign-content: ${alignContent};` : ""}
gap: ${gap}px;`;

  const copy = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const options = {
    direction: ["row", "row-reverse", "column", "column-reverse"],
    wrap: ["nowrap", "wrap", "wrap-reverse"],
    justify: ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"],
    alignItems: ["stretch", "flex-start", "flex-end", "center", "baseline"],
    alignContent: ["stretch", "flex-start", "flex-end", "center", "space-between", "space-around"],
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div
        className="min-h-[200px] rounded-xl border border-border bg-muted/30 p-4"
        style={{
          display: "flex",
          flexDirection: direction as React.CSSProperties["flexDirection"],
          flexWrap: wrap as React.CSSProperties["flexWrap"],
          justifyContent: justify,
          alignItems,
          alignContent: wrap !== "nowrap" ? alignContent : undefined,
          gap: `${gap}px`,
        }}
      >
        {Array.from({ length: itemCount }, (_, i) => (
          <div key={i} className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Items count */}
      <div className="rounded-lg border border-border bg-card p-3">
        <label className="mb-1 block text-xs font-medium">{t("items")}: {itemCount}</label>
        <input type="range" min={1} max={12} value={itemCount} onChange={(e) => setItemCount(Number(e.target.value))} className="w-full" />
      </div>

      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-2">
        {([
          ["direction", t("direction"), direction, setDirection, options.direction],
          ["wrap", t("wrap"), wrap, setWrap, options.wrap],
          ["justify", t("justifyContent"), justify, setJustify, options.justify],
          ["alignItems", t("alignItems"), alignItems, setAlignItems, options.alignItems],
        ] as [string, string, string, (v: string) => void, string[]][]).map(([key, label, val, setter, opts]) => (
          <div key={key}>
            <label className="mb-2 block text-sm font-medium">{label}</label>
            <div className="flex flex-wrap gap-1">
              {opts.map((o) => (
                <button
                  key={o}
                  onClick={() => setter(o)}
                  className={`rounded border px-2 py-1 text-xs font-mono ${val === o ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}
        {wrap !== "nowrap" && (
          <div>
            <label className="mb-2 block text-sm font-medium">{t("alignContent")}</label>
            <div className="flex flex-wrap gap-1">
              {options.alignContent.map((o) => (
                <button
                  key={o}
                  onClick={() => setAlignContent(o)}
                  className={`rounded border px-2 py-1 text-xs font-mono ${alignContent === o ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label className="mb-2 block text-sm font-medium">{t("gap")}: {gap}px</label>
          <input type="range" min={0} max={40} value={gap} onChange={(e) => setGap(Number(e.target.value))} className="w-full" />
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
