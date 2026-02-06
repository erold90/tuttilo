"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

type Mode = "css" | "html" | "js";

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}:;,>~+])\s*/g, "$1")
    .replace(/;\}/g, "}")
    .replace(/\s+/g, " ")
    .trim();
}

function minifyHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}

function minifyJs(js: string): string {
  return js
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}()=+\-*/<>!&|;:,?])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function CssMinifier() {
  const t = useTranslations("tools.css-minifier.ui");
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("css");

  const output = useMemo(() => {
    if (!input) return "";
    try {
      if (mode === "css") return minifyCss(input);
      if (mode === "html") return minifyHtml(input);
      return minifyJs(input);
    } catch {
      return input;
    }
  }, [input, mode]);

  const saved = input.length > 0 ? Math.round((1 - output.length / input.length) * 100) : 0;
  const copy = useCallback(() => navigator.clipboard.writeText(output), [output]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["css", "html", "js"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-lg px-4 py-2 text-sm font-medium uppercase transition-colors ${
              mode === m ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("input")} ({input.length} chars)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            className="h-64 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("output")} ({output.length} chars, -{saved}%)</label>
          <textarea value={output} readOnly className="h-64 w-full rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs" />
        </div>
      </div>

      <button onClick={copy} disabled={!output} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{t("copy")}</button>
    </div>
  );
}
