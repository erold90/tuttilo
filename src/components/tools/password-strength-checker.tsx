"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function calcEntropy(pw: string): number {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  return pool > 0 ? Math.floor(pw.length * Math.log2(pool)) : 0;
}

const commonPasswords = new Set([
  "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567",
  "letmein", "trustno1", "dragon", "baseball", "iloveyou", "master", "sunshine",
  "ashley", "bailey", "shadow", "123123", "654321", "superman", "qazwsx",
  "michael", "football", "password1", "password123", "welcome", "admin",
]);

function analyze(pw: string) {
  const length = pw.length;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
  const entropy = calcEntropy(pw);
  const isCommon = commonPasswords.has(pw.toLowerCase());
  const hasRepeats = /(.)\1{2,}/.test(pw);
  const hasSequential = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(pw);
  const charTypes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  let score = 0;
  if (length >= 8) score++;
  if (length >= 12) score++;
  if (length >= 16) score++;
  if (charTypes >= 3) score++;
  if (charTypes >= 4) score++;
  if (entropy >= 50) score++;
  if (entropy >= 80) score++;
  if (isCommon) score = 0;
  if (hasRepeats) score = Math.max(0, score - 1);
  if (hasSequential) score = Math.max(0, score - 1);

  const level = score <= 1 ? 0 : score <= 3 ? 1 : score <= 5 ? 2 : 3;
  return { length, hasLower, hasUpper, hasDigit, hasSymbol, entropy, isCommon, hasRepeats, hasSequential, charTypes, level };
}

export default function PasswordStrengthChecker() {
  const t = useTranslations("tools.password-strength-checker.ui");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);

  const result = useMemo(() => pw ? analyze(pw) : null, [pw]);

  const levels = ["weak", "fair", "strong", "veryStrong"] as const;
  const colors = ["#EF4444", "#F59E0B", "#22C55E", "#059669"];

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">{t("enterPassword")}</label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-20 font-mono text-sm focus:border-primary focus:outline-none"
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-xs font-medium hover:bg-muted"
          >
            {show ? t("hide") : t("show")}
          </button>
        </div>
      </div>

      {result && (
        <>
          {/* Strength bar */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{t("strength")}</span>
              <span className="text-sm font-bold" style={{ color: colors[result.level] }}>
                {t(levels[result.level])}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((result.level + 1) / 4) * 100}%`,
                  backgroundColor: colors[result.level],
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border p-3 text-center">
              <div className="text-2xl font-bold">{result.length}</div>
              <div className="text-xs text-muted-foreground">{t("length")}</div>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <div className="text-2xl font-bold">{result.entropy}</div>
              <div className="text-xs text-muted-foreground">{t("entropy")}</div>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <div className="text-2xl font-bold">{result.charTypes}/4</div>
              <div className="text-xs text-muted-foreground">{t("charTypes")}</div>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <div className="text-2xl font-bold">{result.isCommon ? "!" : "OK"}</div>
              <div className="text-xs text-muted-foreground">{t("common")}</div>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            {[
              { ok: result.length >= 12, label: t("min12") },
              { ok: result.hasLower, label: t("hasLower") },
              { ok: result.hasUpper, label: t("hasUpper") },
              { ok: result.hasDigit, label: t("hasDigit") },
              { ok: result.hasSymbol, label: t("hasSymbol") },
              { ok: !result.isCommon, label: t("notCommon") },
              { ok: !result.hasRepeats, label: t("noRepeats") },
              { ok: !result.hasSequential, label: t("noSequential") },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={item.ok ? "text-green-500" : "text-red-400"}>{item.ok ? "✓" : "✗"}</span>
                <span className={item.ok ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
