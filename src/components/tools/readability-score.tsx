"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

export default function ReadabilityScore() {
  const t = useTranslations("tools.readability-score");
  const [text, setText] = useState("");

  const analysis = useMemo(() => {
    if (!text.trim()) return null;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.replace(/[^a-zA-Z]/g, "").length > 0);
    const totalSentences = Math.max(sentences.length, 1);
    const totalWords = Math.max(words.length, 1);
    const totalSyllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
    const complexWords = words.filter(w => countSyllables(w) >= 3).length;
    const charCount = text.replace(/\s/g, "").length;

    // Flesch Reading Ease
    const flesch = 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);

    // Flesch-Kincaid Grade
    const fkGrade = 0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59;

    // Gunning Fog
    const fog = 0.4 * ((totalWords / totalSentences) + 100 * (complexWords / totalWords));

    // Coleman-Liau
    const L = (charCount / totalWords) * 100;
    const S = (totalSentences / totalWords) * 100;
    const colemanLiau = 0.0588 * L - 0.296 * S - 15.8;

    // ARI
    const ari = 4.71 * (charCount / totalWords) + 0.5 * (totalWords / totalSentences) - 21.43;

    // SMOG
    const smog = 1.043 * Math.sqrt(complexWords * (30 / totalSentences)) + 3.1291;

    const avgWordsPerSentence = totalWords / totalSentences;
    const avgSyllablesPerWord = totalSyllables / totalWords;

    let fleschLabel = "Very Easy";
    if (flesch < 30) fleschLabel = "Very Difficult";
    else if (flesch < 50) fleschLabel = "Difficult";
    else if (flesch < 60) fleschLabel = "Fairly Difficult";
    else if (flesch < 70) fleschLabel = "Standard";
    else if (flesch < 80) fleschLabel = "Fairly Easy";
    else if (flesch < 90) fleschLabel = "Easy";

    return {
      totalWords, totalSentences, totalSyllables, complexWords, charCount,
      flesch: Math.max(0, Math.min(100, flesch)), fleschLabel,
      fkGrade: Math.max(0, fkGrade), fog: Math.max(0, fog),
      colemanLiau: Math.max(0, colemanLiau), ari: Math.max(0, ari), smog: Math.max(0, smog),
      avgWordsPerSentence, avgSyllablesPerWord,
    };
  }, [text]);

  const getColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      <textarea value={text} onChange={e => setText(e.target.value)} rows={8} className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder={t("ui.placeholder")} />
      {analysis && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
              <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">{analysis.totalWords}</p>
              <p className="text-xs text-zinc-500">{t("ui.words")}</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
              <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">{analysis.totalSentences}</p>
              <p className="text-xs text-zinc-500">{t("ui.sentences")}</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
              <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">{analysis.avgWordsPerSentence.toFixed(1)}</p>
              <p className="text-xs text-zinc-500">{t("ui.avgWords")}</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
              <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">{analysis.complexWords}</p>
              <p className="text-xs text-zinc-500">{t("ui.complexWords")}</p>
            </div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className={`text-4xl font-bold ${getColor(analysis.flesch)}`}>{analysis.flesch.toFixed(1)}</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.fleschScore")}</p>
            <p className="text-xs text-zinc-500">{analysis.fleschLabel}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">{analysis.fkGrade.toFixed(1)}</p>
              <p className="text-xs text-zinc-500">Flesch-Kincaid Grade</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">{analysis.fog.toFixed(1)}</p>
              <p className="text-xs text-zinc-500">Gunning Fog</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">{analysis.colemanLiau.toFixed(1)}</p>
              <p className="text-xs text-zinc-500">Coleman-Liau</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">{analysis.ari.toFixed(1)}</p>
              <p className="text-xs text-zinc-500">ARI</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">{analysis.smog.toFixed(1)}</p>
              <p className="text-xs text-zinc-500">SMOG</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">{analysis.avgSyllablesPerWord.toFixed(2)}</p>
              <p className="text-xs text-zinc-500">{t("ui.avgSyllables")}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
