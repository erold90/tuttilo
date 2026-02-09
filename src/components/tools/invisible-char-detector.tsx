"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const INVISIBLE_CHARS: Record<number, string> = {
  0x00: "NULL", 0x08: "BACKSPACE", 0x09: "TAB", 0x0A: "LINE FEED", 0x0B: "VERTICAL TAB",
  0x0C: "FORM FEED", 0x0D: "CARRIAGE RETURN", 0x1B: "ESCAPE",
  0xA0: "NO-BREAK SPACE", 0xAD: "SOFT HYPHEN",
  0x200B: "ZERO WIDTH SPACE", 0x200C: "ZERO WIDTH NON-JOINER", 0x200D: "ZERO WIDTH JOINER",
  0x200E: "LEFT-TO-RIGHT MARK", 0x200F: "RIGHT-TO-LEFT MARK",
  0x2028: "LINE SEPARATOR", 0x2029: "PARAGRAPH SEPARATOR",
  0x202A: "LEFT-TO-RIGHT EMBEDDING", 0x202C: "POP DIRECTIONAL FORMATTING",
  0x2060: "WORD JOINER", 0x2063: "INVISIBLE SEPARATOR",
  0xFEFF: "BYTE ORDER MARK (BOM)", 0xFFFE: "REVERSED BOM",
};

interface Found { index: number; char: string; name: string; hex: string; }

export default function InvisibleCharDetector() {
  const t = useTranslations("tools.invisible-char-detector");
  const [input, setInput] = useState("");

  const found = useMemo((): Found[] => {
    const results: Found[] = [];
    for (let i = 0; i < input.length; i++) {
      const cp = input.codePointAt(i)!;
      const name = INVISIBLE_CHARS[cp];
      if (name) results.push({ index: i, char: input[i], name, hex: "U+" + cp.toString(16).toUpperCase().padStart(4, "0") });
    }
    return results;
  }, [input]);

  const cleaned = useMemo(() => {
    const invisibleCodes = new Set(Object.keys(INVISIBLE_CHARS).map(Number));
    return [...input].filter(ch => {
      const cp = ch.codePointAt(0)!;
      return !invisibleCodes.has(cp) || cp === 0x0A || cp === 0x09; // keep newlines and tabs
    }).join("");
  }, [input]);

  return (
    <div className="space-y-4">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t("ui.pasteText")} className="w-full h-32 p-3 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      {input && found.length === 0 && <p className="text-green-600 dark:text-green-400 font-medium text-sm">{t("ui.noInvisible")}</p>}
      {found.length > 0 && (
        <>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">{found.length} {t("ui.found")}</p>
          </div>
          <div className="border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="bg-zinc-100 dark:bg-zinc-700"><th className="px-3 py-2 text-left">{t("ui.position")}</th><th className="px-3 py-2 text-left">{t("ui.name")}</th><th className="px-3 py-2 text-left">{t("ui.codePoint")}</th></tr></thead>
              <tbody>
                {found.map((f, i) => (
                  <tr key={i} className="border-t border-zinc-200 dark:border-zinc-700">
                    <td className="px-3 py-1.5 font-mono">{f.index}</td>
                    <td className="px-3 py-1.5">{f.name}</td>
                    <td className="px-3 py-1.5 font-mono">{f.hex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">{t("ui.cleaned")}</label>
            <textarea readOnly value={cleaned} className="w-full h-24 p-3 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 resize-y" />
            <button onClick={() => navigator.clipboard.writeText(cleaned)} className="absolute top-7 right-2 px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.copy")}</button>
          </div>
        </>
      )}
    </div>
  );
}
