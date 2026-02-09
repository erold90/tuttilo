"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function evaluateJsonPath(data: unknown, path: string): unknown[] {
  const parts = path.replace(/^\$\.?/, "").split(/\.|\[/).filter(Boolean).map(p => p.replace(/\]$/, ""));
  if (parts.length === 0) return [data];

  function resolve(obj: unknown, tokens: string[]): unknown[] {
    if (tokens.length === 0) return [obj];
    const [head, ...rest] = tokens;

    if (head === "*") {
      if (Array.isArray(obj)) return obj.flatMap(item => resolve(item, rest));
      if (typeof obj === "object" && obj !== null) return Object.values(obj).flatMap(v => resolve(v, rest));
      return [];
    }

    if (/^\d+$/.test(head)) {
      const idx = parseInt(head, 10);
      if (Array.isArray(obj) && idx < obj.length) return resolve(obj[idx], rest);
      return [];
    }

    if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
      const record = obj as Record<string, unknown>;
      if (head in record) return resolve(record[head], rest);
    }
    return [];
  }

  return resolve(data, parts);
}

export default function JsonPathEvaluator() {
  const t = useTranslations("tools.json-path-evaluator");
  const [json, setJson] = useState("");
  const [path, setPath] = useState("$.");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const evaluate = () => {
    setError("");
    try {
      const data = JSON.parse(json);
      const results = evaluateJsonPath(data, path);
      setOutput(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setOutput("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">{t("ui.jsonInput")}</label>
        <textarea value={json} onChange={e => setJson(e.target.value)} placeholder={t("ui.pasteJson")} className="w-full h-40 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">{t("ui.pathLabel")}</label>
        <input value={path} onChange={e => setPath(e.target.value)} className="w-full p-2 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800" placeholder="$.store.book[0].title" />
      </div>
      <button onClick={evaluate} disabled={!json.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors">{t("ui.evaluate")}</button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {output && (
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">{t("ui.result")}</label>
          <textarea readOnly value={output} className="w-full h-32 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 resize-y" />
          <button onClick={() => navigator.clipboard.writeText(output)} className="absolute top-7 right-2 px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.copy")}</button>
        </div>
      )}
    </div>
  );
}
