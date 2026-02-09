"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

const PRESETS: Array<{ id: string; pattern: string; flags: string }> = [
  { id: "email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g" },
  { id: "url", pattern: "https?://[\\w.-]+(?:\\.[a-zA-Z]{2,})(?:/[\\w./-]*)*(?:\\?[\\w=&]*)?", flags: "g" },
  { id: "phone", pattern: "\\+?\\d{1,4}[\\s.-]?\\(?\\d{1,3}\\)?[\\s.-]?\\d{3,4}[\\s.-]?\\d{4}", flags: "g" },
  { id: "ipv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g" },
  { id: "date", pattern: "\\d{4}[-/]\\d{2}[-/]\\d{2}", flags: "g" },
  { id: "hexColor", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b", flags: "gi" },
  { id: "creditCard", pattern: "\\b(?:\\d{4}[\\s-]?){3}\\d{4}\\b", flags: "g" },
  { id: "zipCode", pattern: "\\b\\d{5}(?:-\\d{4})?\\b", flags: "g" },
];

export default function RegexGenerator() {
  const t = useTranslations("tools.regex-generator");
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testStr, setTestStr] = useState("");
  const [error, setError] = useState("");

  const regex = useMemo(() => {
    if (!pattern) return null;
    try {
      setError("");
      return new RegExp(pattern, flags);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid regex");
      return null;
    }
  }, [pattern, flags]);

  const matches = useMemo(() => {
    if (!regex || !testStr) return [];
    try {
      const result: Array<{ match: string; index: number; groups: string[] }> = [];
      let m;
      const r = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
      while ((m = r.exec(testStr)) !== null) {
        result.push({ match: m[0], index: m.index, groups: m.slice(1) });
        if (result.length > 100) break;
      }
      return result;
    } catch { return []; }
  }, [regex, testStr]);

  const highlighted = useMemo(() => {
    if (!regex || !testStr || matches.length === 0) return testStr;
    let html = "";
    let lastIdx = 0;
    for (const m of matches) {
      html += testStr.slice(lastIdx, m.index);
      html += `<mark class="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">${testStr.slice(m.index, m.index + m.match.length)}</mark>`;
      lastIdx = m.index + m.match.length;
    }
    html += testStr.slice(lastIdx);
    return html;
  }, [regex, testStr, matches]);

  const handlePreset = useCallback((preset: typeof PRESETS[0]) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
  }, []);

  const toggleFlag = useCallback((flag: string) => {
    setFlags(prev => prev.includes(flag) ? prev.replace(flag, "") : prev + flag);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("ui.presets")}</label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(p => (
            <button key={p.id} onClick={() => handlePreset(p)} className="px-2.5 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-blue-100 dark:hover:bg-blue-900">{t(`ui.preset_${p.id}`)}</button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-1">
          {t("ui.pattern")}
          <div className="mt-1 flex items-center border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden bg-white dark:bg-zinc-800">
            <span className="px-2 text-zinc-400 font-mono text-sm">/</span>
            <input type="text" value={pattern} onChange={e => setPattern(e.target.value)} className="flex-1 px-1 py-2 bg-transparent text-sm font-mono outline-none" />
            <span className="px-2 text-zinc-400 font-mono text-sm">/{flags}</span>
          </div>
        </label>
      </div>
      <div className="flex gap-2">
        {["g", "i", "m", "s"].map(f => (
          <button key={f} onClick={() => toggleFlag(f)} className={`w-8 h-8 rounded text-sm font-mono font-bold ${flags.includes(f) ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>{f}</button>
        ))}
        <span className="text-xs text-zinc-400 self-center ml-1">g=global i=case m=multi s=dotall</span>
      </div>
      {error && <p className="text-sm text-red-500 font-mono">{error}</p>}
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t("ui.testString")}
        <textarea value={testStr} onChange={e => setTestStr(e.target.value)} rows={4} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" />
      </label>
      {testStr && regex && (
        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-mono whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlighted }} />
      )}
      {matches.length > 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("ui.matchCount")}: {matches.length}</p>
      )}
    </div>
  );
}
