"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

function generate(length: number, opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }): string {
  let chars = "";
  if (opts.upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.lower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (opts.numbers) chars += "0123456789";
  if (opts.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!chars) return "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => chars[v % chars.length]).join("");
}

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 4) return { score, label: "Medium", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
}

export function PasswordGenerator() {
  const t = useTranslations("tools.password-generator.ui");
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState(() => generate(16, { upper: true, lower: true, numbers: true, symbols: true }));
  const [count, setCount] = useState(1);

  const regen = useCallback(() => {
    setPassword(generate(length, { upper, lower, numbers, symbols }));
  }, [length, upper, lower, numbers, symbols]);

  const bulk = useCallback(() => {
    return Array.from({ length: count }, () => generate(length, { upper, lower, numbers, symbols }));
  }, [count, length, upper, lower, numbers, symbols]);

  const copy = useCallback(() => navigator.clipboard.writeText(password), [password]);
  const strength = getStrength(password);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <input value={password} readOnly className="flex-1 rounded-lg border border-border bg-background px-4 py-3 font-mono text-lg tracking-wider focus:outline-none" />
          <button onClick={copy} className="shrink-0 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("copy")}</button>
          <button onClick={regen} className="shrink-0 rounded-lg border border-border px-4 py-3 text-sm font-medium hover:bg-muted">{t("generate")}</button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className={`h-full transition-all ${strength.color}`} style={{ width: `${(strength.score / 6) * 100}%` }} />
          </div>
          <span className="text-xs font-medium">{strength.label}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("length")}: {length}</label>
          <input type="range" min={4} max={128} value={length} onChange={(e) => { setLength(Number(e.target.value)); }} onMouseUp={regen} onTouchEnd={regen} className="w-full" />
        </div>
        <div className="space-y-2">
          {[
            { label: t("uppercase"), checked: upper, set: setUpper },
            { label: t("lowercase"), checked: lower, set: setLower },
            { label: t("numbers"), checked: numbers, set: setNumbers },
            { label: t("symbols"), checked: symbols, set: setSymbols },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={opt.checked} onChange={(e) => { opt.set(e.target.checked); }} className="rounded" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
