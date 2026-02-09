"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

// Zero-width characters for encoding
const ZW = { ZERO: "\u200B", ONE: "\u200C", SEP: "\u200D", START: "\uFEFF" };

function textToBinary(text: string): string {
  return Array.from(new TextEncoder().encode(text))
    .map(b => b.toString(2).padStart(8, "0"))
    .join("");
}

function binaryToText(binary: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.slice(i, i + 8);
    if (byte.length === 8) bytes.push(parseInt(byte, 2));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

function encode(coverText: string, secretText: string): string {
  const binary = textToBinary(secretText);
  const encoded = binary.split("").map(b => b === "0" ? ZW.ZERO : ZW.ONE).join("");
  // Insert at the middle of cover text
  const mid = Math.floor(coverText.length / 2);
  return coverText.slice(0, mid) + ZW.START + encoded + ZW.SEP + coverText.slice(mid);
}

function decode(text: string): string {
  const startIdx = text.indexOf(ZW.START);
  if (startIdx === -1) return "";
  const sepIdx = text.indexOf(ZW.SEP, startIdx + 1);
  if (sepIdx === -1) return "";
  const encoded = text.slice(startIdx + 1, sepIdx);
  const binary = encoded.split("").map(c => c === ZW.ZERO ? "0" : c === ZW.ONE ? "1" : "").join("");
  if (!binary) return "";
  return binaryToText(binary);
}

export default function TextSteganography() {
  const t = useTranslations("tools.text-steganography");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [coverText, setCoverText] = useState("");
  const [secretText, setSecretText] = useState("");
  const [result, setResult] = useState("");

  const handleEncode = useCallback(() => {
    if (!coverText.trim() || !secretText.trim()) return;
    setResult(encode(coverText, secretText));
  }, [coverText, secretText]);

  const handleDecode = useCallback(() => {
    if (!coverText.trim()) return;
    const decoded = decode(coverText);
    setResult(decoded || t("ui.noHidden"));
  }, [coverText, t]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => { setMode("encode"); setResult(""); }} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "encode" ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}`}>{t("ui.encode")}</button>
        <button onClick={() => { setMode("decode"); setResult(""); }} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "decode" ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}`}>{t("ui.decode")}</button>
      </div>

      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {mode === "encode" ? t("ui.coverText") : t("ui.encodedText")}
        <textarea value={coverText} onChange={e => setCoverText(e.target.value)} rows={4} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
      </label>

      {mode === "encode" && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("ui.secretMessage")}
          <textarea value={secretText} onChange={e => setSecretText(e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
      )}

      <button onClick={mode === "encode" ? handleEncode : handleDecode} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
        {mode === "encode" ? t("ui.hideMessage") : t("ui.revealMessage")}
      </button>

      {result && (
        <div className="relative">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("ui.result")}</label>
          <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm break-all">{result}</div>
          <button onClick={() => navigator.clipboard.writeText(result)} className="absolute top-0 right-0 text-xs text-blue-500 hover:text-blue-600">{t("ui.copy")}</button>
        </div>
      )}
    </div>
  );
}
