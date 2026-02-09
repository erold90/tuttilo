"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const bases = [
  { id: "bin", base: 2, label: "Binary" },
  { id: "oct", base: 8, label: "Octal" },
  { id: "dec", base: 10, label: "Decimal" },
  { id: "hex", base: 16, label: "Hexadecimal" },
];

export default function NumberBaseConverter() {
  const t = useTranslations("tools.number-base-converter.ui");
  const [value, setValue] = useState("");
  const [fromBase, setFromBase] = useState("dec");

  const from = bases.find((b) => b.id === fromBase)!;

  const parsed = parseInt(value, from.base);
  const isValid = !isNaN(parsed) && value.length > 0;

  const results = isValid
    ? bases.map((b) => ({
        id: b.id,
        value: parsed.toString(b.base).toUpperCase(),
      }))
    : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("inputValue")}</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            className="w-full rounded-xl border bg-background px-4 py-3 text-lg font-mono"
            placeholder={fromBase === "hex" ? "1A2F" : fromBase === "bin" ? "10110" : "42"}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("inputBase")}</label>
          <div className="flex gap-2">
            {bases.map((b) => (
              <button
                key={b.id}
                onClick={() => { setFromBase(b.id); setValue(""); }}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  fromBase === b.id ? "bg-primary text-primary-foreground" : "border bg-muted/50 hover:bg-muted"
                }`}
              >
                {t(b.id)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!isValid && value.length > 0 && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {t("invalidInput")}
        </div>
      )}

      {results && (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((r) => (
            <div key={r.id} className={`rounded-xl border p-5 ${r.id === fromBase ? "bg-primary/10 border-primary" : "bg-muted/50"}`}>
              <div className="text-xs text-muted-foreground">{t(r.id)}</div>
              <div className={`mt-1 text-2xl font-bold font-mono break-all ${r.id === fromBase ? "text-primary" : ""}`}>
                {r.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
