"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

export default function DuplicateRemover() {
  const t = useTranslations("tools.duplicate-remover");
  const [input, setInput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimLines, setTrimLines] = useState(true);

  const { output, removed } = useMemo(() => {
    const lines = input.split("\n");
    const seen = new Set<string>();
    const result: string[] = [];
    let removedCount = 0;
    for (const line of lines) {
      const key = caseSensitive ? (trimLines ? line.trim() : line) : (trimLines ? line.trim() : line).toLowerCase();
      if (key === "" || !seen.has(key)) { seen.add(key); result.push(trimLines ? line.trim() : line); }
      else removedCount++;
    }
    return { output: result.join("\n"), removed: removedCount };
  }, [input, caseSensitive, trimLines]);

  return (
    <div className="space-y-4">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t("ui.pasteLines")} className="w-full h-40 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} className="accent-blue-600" /> {t("ui.caseSensitive")}
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" checked={trimLines} onChange={e => setTrimLines(e.target.checked)} className="accent-blue-600" /> {t("ui.trimLines")}
        </label>
        {removed > 0 && <span className="text-sm text-green-600 dark:text-green-400 font-medium">{removed} {t("ui.removed")}</span>}
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
