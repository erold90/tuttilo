"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Mode = "chars" | "words" | "lines";

function reverseText(text: string, mode: Mode): string {
  switch (mode) {
    case "chars": return [...text].reverse().join("");
    case "words": return text.split(/(\s+)/).reverse().join("");
    case "lines": return text.split("\n").reverse().join("\n");
  }
}

export default function TextReverser() {
  const t = useTranslations("tools.text-reverser");
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("chars");
  const output = useMemo(() => reverseText(input, mode), [input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(["chars", "words", "lines"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === m ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}>{t(`ui.${m}`)}</button>
        ))}
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t("ui.pasteText")} className="w-full h-32 p-3 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      {output && (
        <div className="relative">
          <textarea readOnly value={output} className="w-full h-32 p-3 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 resize-y" />
          <button onClick={() => navigator.clipboard.writeText(output)} className="absolute top-2 right-2 px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.copy")}</button>
        </div>
      )}
    </div>
  );
}
