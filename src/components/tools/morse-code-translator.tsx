"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

const CHAR_TO_MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.",
  H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.",
  O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-",
  V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.",
  "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-",
  "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-",
  "+": ".-.-.", "-": "-....-", "_": "..--.-", "\"": ".-..-.",
  "$": "...-..-", "@": ".--.-.",
};

const MORSE_TO_CHAR: Record<string, string> = {};
for (const [char, morse] of Object.entries(CHAR_TO_MORSE)) {
  MORSE_TO_CHAR[morse] = char;
}

function textToMorse(text: string): string {
  return text.toUpperCase().split("").map(c => {
    if (c === " ") return "/";
    return CHAR_TO_MORSE[c] || "";
  }).filter(Boolean).join(" ");
}

function morseToText(morse: string): string {
  return morse.split(" ").map(code => {
    if (code === "/" || code === "") return " ";
    return MORSE_TO_CHAR[code] || "?";
  }).join("").replace(/  +/g, " ");
}

export default function MorseCodeTranslator() {
  const t = useTranslations("tools.morse-code-translator");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleConvert = useCallback(() => {
    setOutput(mode === "encode" ? textToMorse(input) : morseToText(input));
  }, [mode, input]);

  const playMorse = useCallback(() => {
    const morse = mode === "encode" ? textToMorse(input) : input;
    if (!morse) return;
    const ctx = new AudioContext();
    let time = ctx.currentTime;
    const DOT = 0.08;
    const DASH = DOT * 3;
    const GAP = DOT;
    const LETTER_GAP = DOT * 3;
    const WORD_GAP = DOT * 7;
    const freq = 600;

    for (const symbol of morse) {
      if (symbol === ".") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain).connect(ctx.destination);
        osc.frequency.value = freq;
        osc.start(time);
        osc.stop(time + DOT);
        time += DOT + GAP;
      } else if (symbol === "-") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain).connect(ctx.destination);
        osc.frequency.value = freq;
        osc.start(time);
        osc.stop(time + DASH);
        time += DASH + GAP;
      } else if (symbol === " ") {
        time += LETTER_GAP;
      } else if (symbol === "/") {
        time += WORD_GAP;
      }
    }
  }, [mode, input]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => { setMode("encode"); setOutput(""); }} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "encode" ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}`}>{t("ui.textToMorse")}</button>
        <button onClick={() => { setMode("decode"); setOutput(""); }} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "decode" ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}`}>{t("ui.morseToText")}</button>
      </div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {mode === "encode" ? t("ui.enterText") : t("ui.enterMorse")}
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={4} placeholder={mode === "encode" ? "Hello World" : ".... . .-.. .-.. --- / .-- --- .-. .-.. -.."} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" />
      </label>
      <div className="flex gap-2">
        <button onClick={handleConvert} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.convert")}</button>
        <button onClick={playMorse} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.play")}</button>
      </div>
      {output && (
        <div className="relative">
          <pre className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-mono whitespace-pre-wrap">{output}</pre>
          <button onClick={() => navigator.clipboard.writeText(output)} className="absolute top-2 right-2 text-xs text-blue-500 hover:text-blue-600">{t("ui.copy")}</button>
        </div>
      )}
      <details className="text-sm text-zinc-500">
        <summary className="cursor-pointer">{t("ui.reference")}</summary>
        <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 gap-1 text-xs font-mono">
          {Object.entries(CHAR_TO_MORSE).slice(0, 36).map(([c, m]) => (
            <span key={c} className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">{c}: {m}</span>
          ))}
        </div>
      </details>
    </div>
  );
}
