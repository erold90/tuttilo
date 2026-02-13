"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export default function TipCalculator() {
  const t = useTranslations("tools.tip-calculator.ui");

  const [billAmount, setBillAmount] = useState("");
  const [tipPercent, setTipPercent] = useState("15");
  const [splitCount, setSplitCount] = useState("1");
  const [customTip, setCustomTip] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const presets = [10, 15, 18, 20, 25];

  const bill = parseFloat(billAmount) || 0;
  const tip = customTip ? parseFloat(customTip) || 0 : parseFloat(tipPercent) || 0;
  const split = Math.max(1, parseInt(splitCount) || 1);

  const tipAmount = bill * (tip / 100);
  const total = bill + tipAmount;
  const perPerson = total / split;
  const tipPerPerson = tipAmount / split;

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const copy = useCallback((val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  }, []);

  return (
    <div className="space-y-6">
      {/* Bill Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("billAmount")}</label>
        <input
          type="number"
          step="0.01"
          value={billAmount}
          onChange={(e) => setBillAmount(e.target.value)}
          className="w-full rounded-xl border bg-background px-4 py-3 text-lg"
          placeholder="0.00"
        />
      </div>

      {/* Tip Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("tipPercentage")}</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => { setTipPercent(String(p)); setCustomTip(""); }}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                !customTip && tipPercent === String(p)
                  ? "bg-primary text-primary-foreground"
                  : "border bg-muted/50 hover:bg-muted"
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
        <div className="mt-2">
          <label className="text-xs text-muted-foreground">{t("customTip")}</label>
          <div className="relative mt-1">
            <input
              type="number"
              step="0.1"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              className="w-full max-w-xs rounded-xl border bg-background px-4 py-2 pr-10 text-base"
              placeholder={t("customPlaceholder")}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      {/* Split */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("splitBetween")}</label>
        <input
          type="number"
          min="1"
          max="99"
          value={splitCount}
          onChange={(e) => setSplitCount(e.target.value)}
          className="w-full max-w-xs rounded-xl border bg-background px-4 py-3 text-base"
        />
      </div>

      <button
        onClick={() => { setBillAmount(""); setTipPercent("15"); setSplitCount("1"); setCustomTip(""); }}
        className="rounded-xl border bg-muted/50 px-6 py-3 font-medium hover:bg-muted"
      >
        {t("reset")}
      </button>

      {/* Results */}
      {bill > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className="group cursor-pointer rounded-xl border bg-muted/50 p-6 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(tipAmount), "tip")}
            >
              <div className="text-sm text-muted-foreground">{t("tipAmount")}</div>
              <div className="mt-1 text-3xl font-bold text-primary">{fmt(tipAmount)}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "tip" ? "✓" : ""}</div>
            </div>
            <div
              className="group cursor-pointer rounded-xl border bg-muted/50 p-6 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(total), "total")}
            >
              <div className="text-sm text-muted-foreground">{t("totalAmount")}</div>
              <div className="mt-1 text-3xl font-bold">{fmt(total)}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "total" ? "✓" : ""}</div>
            </div>
          </div>

          {split > 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div
                className="group cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
                onClick={() => copy(fmt(tipPerPerson), "tpp")}
              >
                <div className="text-sm text-muted-foreground">{t("tipPerPerson")}</div>
                <div className="mt-1 text-2xl font-semibold">{fmt(tipPerPerson)}</div>
                <div className="mt-1 h-4 text-xs text-primary">{copied === "tpp" ? "✓" : ""}</div>
              </div>
              <div
                className="group cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
                onClick={() => copy(fmt(perPerson), "pp")}
              >
                <div className="text-sm text-muted-foreground">{t("totalPerPerson")}</div>
                <div className="mt-1 text-2xl font-semibold">{fmt(perPerson)}</div>
                <div className="mt-1 h-4 text-xs text-primary">{copied === "pp" ? "✓" : ""}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
