"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

export default function KeywordDensity() {
  const t = useTranslations("tools.keyword-density");
  const [text, setText] = useState("");
  const [minLength, setMinLength] = useState(3);
  const [showNgrams, setShowNgrams] = useState(1);

  const analysis = useMemo(() => {
    if (!text.trim()) return null;
    const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
    const totalWords = words.length;
    const charCount = text.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;

    // Single words
    const wordFreq = new Map<string, number>();
    for (const w of words) {
      if (w.length >= minLength) wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
    }

    // N-grams
    const ngramFreq = new Map<string, number>();
    if (showNgrams > 1) {
      for (let i = 0; i <= words.length - showNgrams; i++) {
        const ngram = words.slice(i, i + showNgrams).join(" ");
        ngramFreq.set(ngram, (ngramFreq.get(ngram) || 0) + 1);
      }
    }

    const sortedWords = [...wordFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50);
    const sortedNgrams = [...ngramFreq.entries()].sort((a, b) => b[1] - a[1]).filter(([, c]) => c > 1).slice(0, 30);

    return { totalWords, charCount, sentences, sortedWords, sortedNgrams };
  }, [text, minLength, showNgrams]);

  return (
    <div className="space-y-4">
      <textarea value={text} onChange={e => setText(e.target.value)} rows={8} className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder={t("ui.placeholder")} />
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm text-zinc-600 dark:text-zinc-400">{t("ui.minLength")}:
          <input type="number" min={1} max={20} value={minLength} onChange={e => setMinLength(+e.target.value)} className="ml-2 w-16 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="text-sm text-zinc-600 dark:text-zinc-400">{t("ui.ngramSize")}:
          <select value={showNgrams} onChange={e => setShowNgrams(+e.target.value)} className="ml-2 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
            <option value={1}>1 ({t("ui.single")})</option>
            <option value={2}>2 ({t("ui.bigram")})</option>
            <option value={3}>3 ({t("ui.trigram")})</option>
          </select>
        </label>
      </div>
      {analysis && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{analysis.totalWords}</p>
              <p className="text-xs text-zinc-500">{t("ui.words")}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{analysis.charCount}</p>
              <p className="text-xs text-zinc-500">{t("ui.characters")}</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">{analysis.sentences}</p>
              <p className="text-xs text-zinc-500">{t("ui.sentences")}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t("ui.topKeywords")}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="text-left py-2 px-2">{t("ui.keyword")}</th>
                  <th className="text-right py-2 px-2">{t("ui.count")}</th>
                  <th className="text-right py-2 px-2">{t("ui.density")}</th>
                  <th className="py-2 px-2 w-40"></th>
                </tr></thead>
                <tbody>
                  {analysis.sortedWords.map(([word, count]) => (
                    <tr key={word} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-1.5 px-2 font-mono">{word}</td>
                      <td className="py-1.5 px-2 text-right">{count}</td>
                      <td className="py-1.5 px-2 text-right">{((count / analysis.totalWords) * 100).toFixed(2)}%</td>
                      <td className="py-1.5 px-2"><div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((count / analysis.sortedWords[0][1]) * 100, 100)}%` }} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {analysis.sortedNgrams.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t("ui.topPhrases")}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left py-2 px-2">{t("ui.phrase")}</th>
                    <th className="text-right py-2 px-2">{t("ui.count")}</th>
                  </tr></thead>
                  <tbody>
                    {analysis.sortedNgrams.map(([phrase, count]) => (
                      <tr key={phrase} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-1.5 px-2 font-mono">{phrase}</td>
                        <td className="py-1.5 px-2 text-right">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
