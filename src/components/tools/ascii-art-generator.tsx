"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

// Simple block-letter font (5 rows per character)
const FONT: Record<string, string[]> = {
  A: ["  █  ", " █ █ ", "█████", "█   █", "█   █"],
  B: ["████ ", "█   █", "████ ", "█   █", "████ "],
  C: [" ████", "█    ", "█    ", "█    ", " ████"],
  D: ["████ ", "█   █", "█   █", "█   █", "████ "],
  E: ["█████", "█    ", "████ ", "█    ", "█████"],
  F: ["█████", "█    ", "████ ", "█    ", "█    "],
  G: [" ████", "█    ", "█  ██", "█   █", " ████"],
  H: ["█   █", "█   █", "█████", "█   █", "█   █"],
  I: ["█████", "  █  ", "  █  ", "  █  ", "█████"],
  J: ["█████", "   █ ", "   █ ", "█  █ ", " ██  "],
  K: ["█   █", "█  █ ", "███  ", "█  █ ", "█   █"],
  L: ["█    ", "█    ", "█    ", "█    ", "█████"],
  M: ["█   █", "██ ██", "█ █ █", "█   █", "█   █"],
  N: ["█   █", "██  █", "█ █ █", "█  ██", "█   █"],
  O: [" ███ ", "█   █", "█   █", "█   █", " ███ "],
  P: ["████ ", "█   █", "████ ", "█    ", "█    "],
  Q: [" ███ ", "█   █", "█ █ █", "█  █ ", " ██ █"],
  R: ["████ ", "█   █", "████ ", "█  █ ", "█   █"],
  S: [" ████", "█    ", " ███ ", "    █", "████ "],
  T: ["█████", "  █  ", "  █  ", "  █  ", "  █  "],
  U: ["█   █", "█   █", "█   █", "█   █", " ███ "],
  V: ["█   █", "█   █", " █ █ ", " █ █ ", "  █  "],
  W: ["█   █", "█   █", "█ █ █", "██ ██", "█   █"],
  X: ["█   █", " █ █ ", "  █  ", " █ █ ", "█   █"],
  Y: ["█   █", " █ █ ", "  █  ", "  █  ", "  █  "],
  Z: ["█████", "   █ ", "  █  ", " █   ", "█████"],
  "0": [" ███ ", "█  ██", "█ █ █", "██  █", " ███ "],
  "1": ["  █  ", " ██  ", "  █  ", "  █  ", " ███ "],
  "2": [" ███ ", "█   █", "  ██ ", " █   ", "█████"],
  "3": ["████ ", "    █", " ███ ", "    █", "████ "],
  "4": ["█   █", "█   █", "█████", "    █", "    █"],
  "5": ["█████", "█    ", "████ ", "    █", "████ "],
  "6": [" ███ ", "█    ", "████ ", "█   █", " ███ "],
  "7": ["█████", "   █ ", "  █  ", " █   ", "█    "],
  "8": [" ███ ", "█   █", " ███ ", "█   █", " ███ "],
  "9": [" ███ ", "█   █", " ████", "    █", " ███ "],
  " ": ["     ", "     ", "     ", "     ", "     "],
  "!": ["  █  ", "  █  ", "  █  ", "     ", "  █  "],
  "?": [" ███ ", "█   █", "  █  ", "     ", "  █  "],
  ".": ["     ", "     ", "     ", "     ", "  █  "],
};

function generateAscii(text: string, char: string): string {
  const upper = text.toUpperCase();
  const rows = ["", "", "", "", ""];
  for (const c of upper) {
    const glyph = FONT[c] || FONT[" "];
    for (let r = 0; r < 5; r++) {
      rows[r] += glyph[r].replace(/█/g, char) + " ";
    }
  }
  return rows.join("\n");
}

export default function AsciiArtGenerator() {
  const t = useTranslations("tools.ascii-art-generator");
  const [text, setText] = useState("HELLO");
  const [char, setChar] = useState("█");
  const [result, setResult] = useState(() => generateAscii("HELLO", "█"));

  const handleGenerate = useCallback(() => {
    setResult(generateAscii(text, char || "█"));
  }, [text, char]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-2">
          {t("ui.text")}
          <input type="text" value={text} onChange={e => setText(e.target.value)} maxLength={20} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("ui.character")}
          <select value={char} onChange={e => setChar(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
            <option value="█">█ Block</option>
            <option value="#"># Hash</option>
            <option value="*">* Star</option>
            <option value="@">@ At</option>
            <option value="$">$ Dollar</option>
            <option value="0">0 Zero</option>
          </select>
        </label>
      </div>
      <button onClick={handleGenerate} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.generate")}</button>
      {result && (
        <div className="relative">
          <pre className="px-4 py-3 bg-zinc-900 text-green-400 rounded-lg text-xs sm:text-sm font-mono overflow-x-auto leading-tight">{result}</pre>
          <button onClick={() => navigator.clipboard.writeText(result)} className="absolute top-2 right-2 text-xs text-green-300 hover:text-green-100">{t("ui.copy")}</button>
        </div>
      )}
    </div>
  );
}
