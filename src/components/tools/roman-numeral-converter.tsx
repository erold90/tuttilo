"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const romanMap: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(num: number): string {
  if (num <= 0 || num > 3999) return "";
  let result = "";
  for (const [val, sym] of romanMap) {
    while (num >= val) {
      result += sym;
      num -= val;
    }
  }
  return result;
}

function fromRoman(str: string): number {
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let result = 0;
  const s = str.toUpperCase();
  for (let i = 0; i < s.length; i++) {
    const curr = map[s[i]];
    const next = map[s[i + 1]];
    if (!curr) return 0;
    if (next && curr < next) {
      result -= curr;
    } else {
      result += curr;
    }
  }
  return result;
}

type Mode = "toRoman" | "fromRoman";

export default function RomanNumeralConverter() {
  const t = useTranslations("tools.roman-numeral-converter.ui");
  const [mode, setMode] = useState<Mode>("toRoman");
  const [value, setValue] = useState("");

  const result = mode === "toRoman"
    ? toRoman(parseInt(value) || 0)
    : fromRoman(value);

  const isValid = mode === "toRoman"
    ? (parseInt(value) || 0) > 0 && (parseInt(value) || 0) <= 3999
    : typeof result === "number" && result > 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["toRoman", "fromRoman"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setValue(""); }}
            className={`flex-1 rounded-xl px-4 py-3 font-medium transition-colors ${
              mode === m ? "bg-primary text-primary-foreground" : "border bg-muted/50 hover:bg-muted"
            }`}
          >
            {t(m)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {mode === "toRoman" ? t("enterNumber") : t("enterRoman")}
        </label>
        <input
          type={mode === "toRoman" ? "number" : "text"}
          min={mode === "toRoman" ? "1" : undefined}
          max={mode === "toRoman" ? "3999" : undefined}
          value={value}
          onChange={(e) => setValue(mode === "fromRoman" ? e.target.value.toUpperCase() : e.target.value)}
          className="w-full rounded-xl border bg-background px-4 py-3 text-lg font-mono"
          placeholder={mode === "toRoman" ? "2024" : "MMXXIV"}
        />
      </div>

      {value && isValid && (
        <div className="rounded-xl border bg-primary/10 p-8 text-center">
          <div className="text-sm text-muted-foreground">{t("result")}</div>
          <div className="mt-2 text-5xl font-bold text-primary font-mono">
            {mode === "toRoman" ? result : result}
          </div>
          {mode === "toRoman" && (
            <div className="mt-2 text-sm text-muted-foreground">{value} = {result}</div>
          )}
          {mode === "fromRoman" && (
            <div className="mt-2 text-sm text-muted-foreground">{value} = {result}</div>
          )}
        </div>
      )}

      {value && !isValid && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {mode === "toRoman" ? t("rangeError") : t("invalidRoman")}
        </div>
      )}
    </div>
  );
}
