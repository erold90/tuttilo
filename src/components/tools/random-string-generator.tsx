"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

const CHARSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  hex: "0123456789abcdef",
};

export default function RandomStringGenerator() {
  const t = useTranslations("tools.random-string-generator");
  const [length, setLength] = useState(32);
  const [count, setCount] = useState(5);
  const [options, setOptions] = useState({ lowercase: true, uppercase: true, digits: true, symbols: false });
  const [results, setResults] = useState<string[]>([]);

  const generate = useCallback(() => {
    let charset = "";
    if (options.lowercase) charset += CHARSETS.lowercase;
    if (options.uppercase) charset += CHARSETS.uppercase;
    if (options.digits) charset += CHARSETS.digits;
    if (options.symbols) charset += CHARSETS.symbols;
    if (!charset) charset = CHARSETS.lowercase + CHARSETS.digits;

    const arr = new Uint32Array(length * count);
    crypto.getRandomValues(arr);
    const strings: string[] = [];
    for (let i = 0; i < count; i++) {
      let s = "";
      for (let j = 0; j < length; j++) s += charset[arr[i * length + j] % charset.length];
      strings.push(s);
    }
    setResults(strings);
  }, [length, count, options]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.length")}:
          <input type="number" min={1} max={256} value={length} onChange={e => setLength(Math.max(1, +e.target.value))} className="ml-2 w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.count")}:
          <input type="number" min={1} max={100} value={count} onChange={e => setCount(Math.max(1, +e.target.value))} className="ml-2 w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {(Object.keys(options) as (keyof typeof options)[]).map(key => (
          <label key={key} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input type="checkbox" checked={options[key]} onChange={e => setOptions(prev => ({ ...prev, [key]: e.target.checked }))} className="accent-blue-600" />
            {t(`ui.${key}`)}
          </label>
        ))}
      </div>
      <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.generate")}</button>
      {results.length > 0 && (
        <div className="space-y-1">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <code className="flex-1 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-700 rounded text-sm font-mono break-all">{r}</code>
              <button onClick={() => navigator.clipboard.writeText(r)} className="px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-600 rounded hover:bg-zinc-300 dark:hover:bg-zinc-500 shrink-0">{t("ui.copy")}</button>
            </div>
          ))}
          <button onClick={() => navigator.clipboard.writeText(results.join("\n"))} className="text-sm text-blue-600 hover:underline">{t("ui.copyAll")}</button>
        </div>
      )}
    </div>
  );
}
