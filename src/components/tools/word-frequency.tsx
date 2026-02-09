"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

interface WordFreq { word: string; count: number; percent: number; }

function analyzeFrequency(text: string, minLength = 1): WordFreq[] {
  const words = text.toLowerCase().match(/\b[a-zA-ZÀ-ÿ]+\b/g) || [];
  const counts = new Map<string, number>();
  for (const w of words) { if (w.length >= minLength) counts.set(w, (counts.get(w) || 0) + 1); }
  const total = words.length;
  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count, percent: Math.round(count / total * 10000) / 100 }))
    .sort((a, b) => b.count - a.count);
}

export default function WordFrequency() {
  const t = useTranslations("tools.word-frequency");
  const [input, setInput] = useState("");
  const [minLength, setMinLength] = useState(1);
  const [showCount, setShowCount] = useState(50);
  const results = useMemo(() => analyzeFrequency(input, minLength), [input, minLength]);

  return (
    <div className="space-y-4">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t("ui.pasteText")} className="w-full h-40 p-3 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm text-zinc-700 dark:text-zinc-300">{t("ui.minLength")}:
          <input type="number" min={1} max={20} value={minLength} onChange={e => setMinLength(+e.target.value)} className="ml-2 w-16 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <span className="text-sm text-zinc-500">{results.length} {t("ui.uniqueWords")}</span>
      </div>
      {results.length > 0 && (
        <div className="border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead><tr className="bg-zinc-100 dark:bg-zinc-700"><th className="px-3 py-2 text-left">{t("ui.word")}</th><th className="px-3 py-2 text-right">{t("ui.count")}</th><th className="px-3 py-2 text-right">%</th><th className="px-3 py-2">{t("ui.bar")}</th></tr></thead>
            <tbody>
              {results.slice(0, showCount).map(r => (
                <tr key={r.word} className="border-t border-zinc-200 dark:border-zinc-700">
                  <td className="px-3 py-1.5 font-mono">{r.word}</td>
                  <td className="px-3 py-1.5 text-right">{r.count}</td>
                  <td className="px-3 py-1.5 text-right">{r.percent}%</td>
                  <td className="px-3 py-1.5"><div className="h-3 bg-blue-500 rounded" style={{ width: `${Math.min(100, r.percent * 5)}%` }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {results.length > showCount && <button onClick={() => setShowCount(s => s + 50)} className="w-full py-2 text-sm text-blue-600 hover:bg-zinc-50 dark:hover:bg-zinc-800">{t("ui.showMore")}</button>}
        </div>
      )}
    </div>
  );
}
