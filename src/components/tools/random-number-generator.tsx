"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export default function RandomNumberGenerator() {
  const t = useTranslations("tools.random-number-generator");
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(10);
  const [unique, setUnique] = useState(false);
  const [sorted, setSorted] = useState(false);
  const [results, setResults] = useState<number[]>([]);

  const generate = useCallback(() => {
    if (unique && (max - min + 1) < count) return;
    const nums: number[] = [];
    const used = new Set<number>();
    const arr = new Uint32Array(count * 10);
    crypto.getRandomValues(arr);
    let idx = 0;
    for (let i = 0; i < count; i++) {
      let n: number;
      do {
        n = min + (arr[idx++ % arr.length] % (max - min + 1));
      } while (unique && used.has(n));
      used.add(n);
      nums.push(n);
    }
    if (sorted) nums.sort((a, b) => a - b);
    setResults(nums);
  }, [min, max, count, unique, sorted]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("ui.min")}
          <input type="number" value={min} onChange={e => setMin(+e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("ui.max")}
          <input type="number" value={max} onChange={e => setMax(+e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("ui.count")}
          <input type="number" min={1} max={1000} value={count} onChange={e => setCount(Math.max(1, +e.target.value))} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" checked={unique} onChange={e => setUnique(e.target.checked)} className="accent-blue-600" />
          {t("ui.unique")}
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" checked={sorted} onChange={e => setSorted(e.target.checked)} className="accent-blue-600" />
          {t("ui.sorted")}
        </label>
      </div>
      <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.generate")}</button>
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {results.map((n, i) => (
              <span key={i} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-700 rounded text-sm font-mono">{n}</span>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigator.clipboard.writeText(results.join(", "))} className="text-sm text-blue-600 hover:underline">{t("ui.copyComma")}</button>
            <button onClick={() => navigator.clipboard.writeText(results.join("\n"))} className="text-sm text-blue-600 hover:underline">{t("ui.copyNewline")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
