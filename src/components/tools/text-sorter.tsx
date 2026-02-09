"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type SortMode = "alpha" | "alpha-desc" | "length" | "length-desc" | "numeric" | "random";

export default function TextSorter() {
  const t = useTranslations("tools.text-sorter");
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<SortMode>("alpha");
  const [key, setKey] = useState(0);

  const output = useMemo(() => {
    void key; // for random re-sort
    const lines = input.split("\n").filter(l => l.trim());
    switch (mode) {
      case "alpha": return lines.sort((a, b) => a.localeCompare(b)).join("\n");
      case "alpha-desc": return lines.sort((a, b) => b.localeCompare(a)).join("\n");
      case "length": return lines.sort((a, b) => a.length - b.length).join("\n");
      case "length-desc": return lines.sort((a, b) => b.length - a.length).join("\n");
      case "numeric": return lines.sort((a, b) => parseFloat(a) - parseFloat(b)).join("\n");
      case "random": return lines.sort(() => Math.random() - 0.5).join("\n");
    }
  }, [input, mode, key]);

  return (
    <div className="space-y-4">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t("ui.pasteLines")} className="w-full h-40 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      <div className="flex items-center gap-2 flex-wrap">
        {(["alpha", "alpha-desc", "length", "length-desc", "numeric", "random"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); if (m === "random") setKey(k => k + 1); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === m ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}>{t(`ui.${m}`)}</button>
        ))}
      </div>
      {output && input && (
        <div className="relative">
          <textarea readOnly value={output} className="w-full h-40 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 resize-y" />
          <button onClick={() => navigator.clipboard.writeText(output)} className="absolute top-2 right-2 px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.copy")}</button>
        </div>
      )}
    </div>
  );
}
