"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function luhn(num: string): boolean {
  const digits = num.replace(/\D/g, "").split("").reverse().map(Number);
  if (digits.length < 13) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

function detectCardType(num: string): string {
  const n = num.replace(/\D/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "American Express";
  if (/^6(?:011|5)/.test(n)) return "Discover";
  if (/^3(?:0[0-5]|[68])/.test(n)) return "Diners Club";
  if (/^35/.test(n)) return "JCB";
  if (/^62/.test(n)) return "UnionPay";
  return "Unknown";
}

function formatNumber(num: string): string {
  const n = num.replace(/\D/g, "");
  if (/^3[47]/.test(n)) return n.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
  return n.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export default function CreditCardValidator() {
  const t = useTranslations("tools.credit-card-validator.ui");
  const [num, setNum] = useState("");

  const clean = num.replace(/\D/g, "");
  const result = useMemo(() => {
    if (clean.length < 13) return null;
    return {
      valid: luhn(clean),
      type: detectCardType(clean),
      formatted: formatNumber(clean),
      length: clean.length,
    };
  }, [clean]);

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">{t("enterCard")}</label>
        <input
          type="text"
          value={num}
          onChange={e => setNum(e.target.value.replace(/[^\d\s-]/g, ""))}
          placeholder={t("placeholder")}
          maxLength={23}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-lg tracking-wider focus:border-primary focus:outline-none"
        />
      </div>

      {result && (
        <div className="space-y-4">
          <div className={`rounded-xl border-2 p-4 text-center ${result.valid ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}`}>
            <div className="text-2xl font-bold">{result.valid ? "✓" : "✗"}</div>
            <div className="text-sm font-medium">{result.valid ? t("valid") : t("invalid")}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground">{t("cardType")}</div>
              <div className="text-sm font-bold">{result.type}</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground">{t("digits")}</div>
              <div className="text-sm font-bold">{result.length}</div>
            </div>
            <div className="col-span-2 rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground">{t("formatted")}</div>
              <div className="font-mono text-sm font-bold tracking-wider">{result.formatted}</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
        </div>
      )}
    </div>
  );
}
