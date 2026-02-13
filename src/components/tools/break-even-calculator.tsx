"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export default function BreakEvenCalculator() {
  const t = useTranslations("tools.break-even-calculator.ui");

  const [fixedCosts, setFixedCosts] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [variableCostPerUnit, setVariableCostPerUnit] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const calc = () => {
    const fc = parseFloat(fixedCosts);
    const price = parseFloat(pricePerUnit);
    const vc = parseFloat(variableCostPerUnit);

    if (!fc || !price || isNaN(vc) || price <= vc) return null;

    const contributionMargin = price - vc;
    const breakEvenUnits = Math.ceil(fc / contributionMargin);
    const breakEvenRevenue = breakEvenUnits * price;
    const marginRatio = (contributionMargin / price) * 100;

    return { breakEvenUnits, breakEvenRevenue, contributionMargin, marginRatio };
  };

  const result = calc();

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const copy = useCallback((val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("fixedCosts")}</label>
          <input
            type="number"
            min="0"
            step="100"
            value={fixedCosts}
            onChange={(e) => setFixedCosts(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3"
            placeholder="10000"
          />
          <p className="text-xs text-muted-foreground">{t("fixedCostsHint")}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("pricePerUnit")}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3"
            placeholder="50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("variableCost")}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={variableCostPerUnit}
            onChange={(e) => setVariableCostPerUnit(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3"
            placeholder="20"
          />
          <p className="text-xs text-muted-foreground">{t("variableCostHint")}</p>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className="cursor-pointer rounded-xl border bg-primary/10 p-6 text-center transition-colors hover:border-primary/30"
              onClick={() => copy(result.breakEvenUnits.toLocaleString(), "units")}
            >
              <div className="text-sm text-muted-foreground">{t("breakEvenUnits")}</div>
              <div className="mt-1 text-4xl font-bold text-primary">
                {result.breakEvenUnits.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">{t("units")}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "units" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-primary/10 p-6 text-center transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(result.breakEvenRevenue), "rev")}
            >
              <div className="text-sm text-muted-foreground">{t("breakEvenRevenue")}</div>
              <div className="mt-1 text-4xl font-bold text-primary">
                {fmt(result.breakEvenRevenue)}
              </div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "rev" ? "✓" : ""}</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className="cursor-pointer rounded-xl border bg-muted/50 p-5 text-center transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(result.contributionMargin), "cm")}
            >
              <div className="text-xs text-muted-foreground">{t("contributionMargin")}</div>
              <div className="mt-1 text-2xl font-bold">{fmt(result.contributionMargin)}</div>
              <div className="text-xs text-muted-foreground">{t("perUnit")}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "cm" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-muted/50 p-5 text-center transition-colors hover:border-primary/30"
              onClick={() => copy(result.marginRatio.toFixed(1) + "%", "mr")}
            >
              <div className="text-xs text-muted-foreground">{t("marginRatio")}</div>
              <div className="mt-1 text-2xl font-bold">{result.marginRatio.toFixed(1)}%</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "mr" ? "✓" : ""}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
