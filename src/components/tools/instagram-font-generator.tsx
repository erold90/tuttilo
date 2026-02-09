"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const FONT_MAPS: Record<string, Record<string, string>> = {
  bold: Object.fromEntries([..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"].map((c, i) => {
    if (i < 26) return [c, String.fromCodePoint(0x1D400 + i)];
    if (i < 52) return [c, String.fromCodePoint(0x1D41A + i - 26)];
    return [c, String.fromCodePoint(0x1D7CE + i - 52)];
  })),
  italic: Object.fromEntries([..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"].map((c, i) => {
    if (i < 26) return [c, String.fromCodePoint(0x1D434 + i)];
    return [c, String.fromCodePoint(0x1D44E + i - 26)];
  })),
  boldItalic: Object.fromEntries([..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"].map((c, i) => {
    if (i < 26) return [c, String.fromCodePoint(0x1D468 + i)];
    return [c, String.fromCodePoint(0x1D482 + i - 26)];
  })),
  script: Object.fromEntries([..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"].map((c, i) => {
    if (i < 26) return [c, String.fromCodePoint(0x1D49C + i)];
    return [c, String.fromCodePoint(0x1D4B6 + i - 26)];
  })),
  monospace: Object.fromEntries([..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"].map((c, i) => {
    if (i < 26) return [c, String.fromCodePoint(0x1D670 + i)];
    if (i < 52) return [c, String.fromCodePoint(0x1D68A + i - 26)];
    return [c, String.fromCodePoint(0x1D7F6 + i - 52)];
  })),
  doubleStruck: Object.fromEntries([..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"].map((c, i) => {
    if (i < 26) return [c, String.fromCodePoint(0x1D538 + i)];
    if (i < 52) return [c, String.fromCodePoint(0x1D552 + i - 26)];
    return [c, String.fromCodePoint(0x1D7D8 + i - 52)];
  })),
  circled: Object.fromEntries([..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("")].map((c, i) => {
    if (i < 26) return [c, String.fromCodePoint(0x24B6 + i)];
    return [c, String.fromCodePoint(0x24D0 + i - 26)];
  })),
  squared: Object.fromEntries("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c, i) => [c, String.fromCodePoint(0x1F130 + i)])),
};

function transform(text: string, fontName: string): string {
  const map = FONT_MAPS[fontName];
  if (!map) return text;
  return [...text].map(c => map[c] || c).join("");
}

const DECORATORS = [
  { name: "sparkles", fn: (s: string) => `✨ ${s} ✨` },
  { name: "stars", fn: (s: string) => `★ ${s} ★` },
  { name: "arrows", fn: (s: string) => `» ${s} «` },
  { name: "brackets", fn: (s: string) => `【${s}】` },
  { name: "flowers", fn: (s: string) => `❀ ${s} ❀` },
  { name: "hearts", fn: (s: string) => `♡ ${s} ♡` },
];

export default function InstagramFontGenerator() {
  const t = useTranslations("tools.instagram-font-generator");
  const [text, setText] = useState("");

  const variants = useMemo(() => {
    if (!text) return [];
    const fontNames = Object.keys(FONT_MAPS);
    const results: { name: string; text: string }[] = [];
    for (const fn of fontNames) {
      results.push({ name: fn, text: transform(text, fn) });
    }
    for (const d of DECORATORS) {
      results.push({ name: d.name, text: d.fn(text) });
    }
    return results;
  }, [text]);

  return (
    <div className="space-y-4">
      <textarea value={text} onChange={e => setText(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder={t("ui.placeholder")} />
      {variants.length > 0 && (
        <div className="space-y-2">
          {variants.map(v => (
            <div key={v.name} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <span className="text-xs text-zinc-500 w-24 shrink-0">{v.name}</span>
              <p className="flex-1 text-sm break-all">{v.text}</p>
              <button onClick={() => navigator.clipboard.writeText(v.text)} className="px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-600 rounded hover:bg-zinc-300 dark:hover:bg-zinc-500 shrink-0">{t("ui.copy")}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
