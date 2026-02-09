"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function getCharInfo(ch: string): { char: string; codePoint: string; hex: string; name: string; utf8: string } {
  const cp = ch.codePointAt(0) || 0;
  const hex = "U+" + cp.toString(16).toUpperCase().padStart(4, "0");
  const bytes = new TextEncoder().encode(ch);
  const utf8 = Array.from(bytes).map(b => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
  return { char: ch, codePoint: String(cp), hex, name: "", utf8 };
}

export default function UnicodeLookup() {
  const t = useTranslations("tools.unicode-lookup");
  const [input, setInput] = useState("");
  const chars = useMemo(() => {
    if (!input) return [];
    return [...input].map(ch => getCharInfo(ch));
  }, [input]);

  return (
    <div className="space-y-4">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t("ui.pasteText")} className="w-full h-20 p-3 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      {chars.length > 0 && (
        <div className="border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="bg-zinc-100 dark:bg-zinc-700"><th className="px-3 py-2">{t("ui.char")}</th><th className="px-3 py-2">{t("ui.unicode")}</th><th className="px-3 py-2">{t("ui.decimal")}</th><th className="px-3 py-2">UTF-8</th><th className="px-3 py-2">HTML</th></tr></thead>
            <tbody>
              {chars.map((c, i) => (
                <tr key={i} className="border-t border-zinc-200 dark:border-zinc-700 text-center">
                  <td className="px-3 py-2 text-2xl">{c.char}</td>
                  <td className="px-3 py-2 font-mono">{c.hex}</td>
                  <td className="px-3 py-2 font-mono">{c.codePoint}</td>
                  <td className="px-3 py-2 font-mono text-xs">{c.utf8}</td>
                  <td className="px-3 py-2 font-mono text-xs">&amp;#{c.codePoint};</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        <label className="text-sm text-zinc-700 dark:text-zinc-300">{t("ui.fromCodePoint")}:</label>
        <input placeholder="U+0041 or 65" onChange={e => {
          const v = e.target.value.trim();
          if (v.startsWith("U+") || v.startsWith("u+")) { const cp = parseInt(v.slice(2), 16); if (!isNaN(cp)) setInput(String.fromCodePoint(cp)); }
          else if (/^\d+$/.test(v)) { const cp = parseInt(v); if (!isNaN(cp)) setInput(String.fromCodePoint(cp)); }
        }} className="px-3 py-1.5 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 w-40" />
      </div>
    </div>
  );
}
