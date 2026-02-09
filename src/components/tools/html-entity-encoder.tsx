"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const ENTITIES: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  "©": "&copy;", "®": "&reg;", "™": "&trade;", "€": "&euro;", "£": "&pound;",
  "¥": "&yen;", "¢": "&cent;", "§": "&sect;", "°": "&deg;", "±": "&plusmn;",
  "×": "&times;", "÷": "&divide;", "¶": "&para;", "†": "&dagger;", "‡": "&Dagger;",
  "•": "&bull;", "…": "&hellip;", "–": "&ndash;", "—": "&mdash;",
  "\u00A0": "&nbsp;", "¡": "&iexcl;", "¿": "&iquest;",
};
const REVERSE: Record<string, string> = Object.fromEntries(Object.entries(ENTITIES).map(([k, v]) => [v, k]));

function encode(text: string): string {
  return text.replace(/[&<>"'©®™€£¥¢§°±×÷¶†‡•…–—\u00A0¡¿]/g, ch => ENTITIES[ch] || ch);
}

function decode(text: string): string {
  return text.replace(/&[a-zA-Z]+;|&#\d+;|&#x[0-9a-fA-F]+;/g, entity => {
    if (REVERSE[entity]) return REVERSE[entity];
    if (entity.startsWith("&#x")) return String.fromCodePoint(parseInt(entity.slice(3, -1), 16));
    if (entity.startsWith("&#")) return String.fromCodePoint(parseInt(entity.slice(2, -1), 10));
    return entity;
  });
}

type Direction = "encode" | "decode";

export default function HtmlEntityEncoder() {
  const t = useTranslations("tools.html-entity-encoder");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<Direction>("encode");

  const convert = () => setOutput(direction === "encode" ? encode(input) : decode(input));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => { setDirection("encode"); setOutput(""); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${direction === "encode" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}>{t("ui.encode")}</button>
        <button onClick={() => { setDirection("decode"); setOutput(""); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${direction === "decode" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}>{t("ui.decode")}</button>
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t(`ui.${direction === "encode" ? "pasteText" : "pasteEntities"}`)} className="w-full h-40 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      <button onClick={convert} disabled={!input.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors">{t("ui.convert")}</button>
      {output && (
        <div className="relative">
          <textarea readOnly value={output} className="w-full h-40 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 resize-y" />
          <button onClick={() => navigator.clipboard.writeText(output)} className="absolute top-2 right-2 px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.copy")}</button>
        </div>
      )}
    </div>
  );
}
