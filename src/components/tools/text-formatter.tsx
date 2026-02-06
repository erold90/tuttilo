"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

const TRANSFORMS = [
  "removeExtraSpaces",
  "removeEmptyLines",
  "removeDuplicateLines",
  "sortLines",
  "reverseLines",
  "trimLines",
  "numberLines",
  "addPrefix",
  "addSuffix",
] as const;

type Transform = (typeof TRANSFORMS)[number];

export function TextFormatter() {
  const t = useTranslations("tools.text-formatter.ui");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");

  const apply = useCallback((transform: Transform) => {
    const text = input || "";
    let result: string;
    switch (transform) {
      case "removeExtraSpaces":
        result = text.replace(/ {2,}/g, " ").replace(/^ +| +$/gm, "");
        break;
      case "removeEmptyLines":
        result = text.split("\n").filter((l) => l.trim()).join("\n");
        break;
      case "removeDuplicateLines":
        result = [...new Set(text.split("\n"))].join("\n");
        break;
      case "sortLines":
        result = text.split("\n").sort((a, b) => a.localeCompare(b)).join("\n");
        break;
      case "reverseLines":
        result = text.split("\n").reverse().join("\n");
        break;
      case "trimLines":
        result = text.split("\n").map((l) => l.trim()).join("\n");
        break;
      case "numberLines":
        result = text.split("\n").map((l, i) => `${i + 1}. ${l}`).join("\n");
        break;
      case "addPrefix":
        result = text.split("\n").map((l) => prefix + l).join("\n");
        break;
      case "addSuffix":
        result = text.split("\n").map((l) => l + suffix).join("\n");
        break;
      default:
        result = text;
    }
    setOutput(result);
  }, [input, prefix, suffix]);

  const copy = () => navigator.clipboard.writeText(output);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">{t("input")}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("inputPlaceholder")} className="w-full h-48 rounded-lg border border-border bg-background p-3 text-sm font-mono focus:border-primary focus:outline-none resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("output")}</label>
          <textarea value={output} readOnly className="w-full h-48 rounded-lg border border-border bg-muted/30 p-3 text-sm font-mono resize-none" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {TRANSFORMS.filter((tr) => tr !== "addPrefix" && tr !== "addSuffix").map((tr) => (
          <button key={tr} onClick={() => apply(tr)} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted hover:border-primary/30">{t(tr)}</button>
        ))}
      </div>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1">{t("prefix")}</label>
          <div className="flex gap-1">
            <input value={prefix} onChange={(e) => setPrefix(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs" />
            <button onClick={() => apply("addPrefix")} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">{t("apply")}</button>
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1">{t("suffix")}</label>
          <div className="flex gap-1">
            <input value={suffix} onChange={(e) => setSuffix(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs" />
            <button onClick={() => apply("addSuffix")} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">{t("apply")}</button>
          </div>
        </div>
      </div>
      {output && <button onClick={copy} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("copy")}</button>}
    </div>
  );
}
