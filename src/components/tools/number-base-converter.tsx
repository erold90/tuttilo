"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

const bases = [
  { id: "bin", base: 2, prefix: "0b" },
  { id: "oct", base: 8, prefix: "0o" },
  { id: "dec", base: 10, prefix: "" },
  { id: "hex", base: 16, prefix: "0x" },
];

function tryParseBigInt(value: string, base: number): bigint | null {
  try {
    if (!value.trim()) return null;
    const clean = value.trim().toUpperCase();
    // Validate characters
    const chars = "0123456789ABCDEF".slice(0, base);
    if (!new RegExp(`^[${chars}]+$`, "i").test(clean)) return null;
    // Parse
    if (base === 16) return BigInt("0x" + clean);
    if (base === 8) return BigInt("0o" + clean);
    if (base === 2) return BigInt("0b" + clean);
    return BigInt(clean);
  } catch {
    return null;
  }
}

const ZERO = BigInt(0);

function bigIntToBase(val: bigint, base: number): string {
  if (val === ZERO) return "0";
  const neg = val < ZERO;
  let abs = neg ? -val : val;
  const chars = "0123456789ABCDEF";
  const b = BigInt(base);
  let result = "";
  while (abs > ZERO) {
    result = chars[Number(abs % b)] + result;
    abs = abs / b;
  }
  return neg ? "-" + result : result;
}

export default function NumberBaseConverter() {
  const t = useTranslations("tools.number-base-converter.ui");
  const [value, setValue] = useState("");
  const [fromBase, setFromBase] = useState("dec");
  const [copied, setCopied] = useState<string | null>(null);

  const from = bases.find((b) => b.id === fromBase)!;
  const parsed = tryParseBigInt(value, from.base);
  const isValid = parsed !== null;

  const results = isValid
    ? bases.map((b) => ({
        id: b.id,
        value: bigIntToBase(parsed, b.base),
        prefix: b.prefix,
      }))
    : null;

  const copyValue = useCallback((val: string, id: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

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
          <div className="grid grid-cols-4 gap-2">
            {bases.map((b) => (
              <button
                key={b.id}
                onClick={() => { setFromBase(b.id); setValue(""); }}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  fromBase === b.id
                    ? "bg-primary text-primary-foreground"
                    : "border bg-muted/50 hover:bg-muted"
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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => copyValue(r.value, r.id)}
              className={`rounded-xl border p-5 text-left hover:opacity-90 transition-colors cursor-pointer relative group ${
                r.id === fromBase ? "bg-primary/10 border-primary" : "bg-muted/50"
              }`}
            >
              <div className="text-xs text-muted-foreground">{t(r.id)}</div>
              <div className={`mt-1 text-2xl font-bold font-mono break-all ${r.id === fromBase ? "text-primary" : ""}`}>
                {r.prefix && <span className="text-muted-foreground/40 text-lg">{r.prefix}</span>}
                {r.value}
              </div>
              <span className="absolute top-3 right-3 text-xs text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">
                {copied === r.id ? "✓" : "copy"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
