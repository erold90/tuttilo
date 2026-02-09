"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Format = "binary" | "hex" | "octal" | "decimal";

function textToFormat(text: string, format: Format): string {
  const bytes = new TextEncoder().encode(text);
  return Array.from(bytes).map(b => {
    switch (format) {
      case "binary": return b.toString(2).padStart(8, "0");
      case "hex": return b.toString(16).padStart(2, "0");
      case "octal": return b.toString(8).padStart(3, "0");
      case "decimal": return b.toString(10);
    }
  }).join(" ");
}

function formatToText(encoded: string, format: Format): string {
  const parts = encoded.trim().split(/\s+/);
  const bytes = parts.map(p => {
    switch (format) {
      case "binary": return parseInt(p, 2);
      case "hex": return parseInt(p, 16);
      case "octal": return parseInt(p, 8);
      case "decimal": return parseInt(p, 10);
    }
  }).filter(n => !isNaN(n));
  return new TextDecoder().decode(new Uint8Array(bytes));
}

type Direction = "encode" | "decode";

export default function TextToBinary() {
  const t = useTranslations("tools.text-to-binary");
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<Format>("binary");
  const [direction, setDirection] = useState<Direction>("encode");

  const output = useMemo(() => {
    if (!input.trim()) return "";
    try { return direction === "encode" ? textToFormat(input, format) : formatToText(input, format); }
    catch { return "Error"; }
  }, [input, format, direction]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => { setDirection("encode"); setInput(""); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${direction === "encode" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}>{t("ui.encode")}</button>
        <button onClick={() => { setDirection("decode"); setInput(""); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${direction === "decode" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}>{t("ui.decode")}</button>
        <select value={format} onChange={e => setFormat(e.target.value as Format)} className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
          <option value="binary">Binary</option>
          <option value="hex">Hexadecimal</option>
          <option value="octal">Octal</option>
          <option value="decimal">Decimal</option>
        </select>
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={direction === "encode" ? t("ui.pasteText") : t("ui.pasteEncoded")} className="w-full h-32 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      {output && (
        <div className="relative">
          <textarea readOnly value={output} className="w-full h-32 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 resize-y" />
          <button onClick={() => navigator.clipboard.writeText(output)} className="absolute top-2 right-2 px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.copy")}</button>
        </div>
      )}
    </div>
  );
}
