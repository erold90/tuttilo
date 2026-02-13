"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export default function RoiCalculator() {
  const t = useTranslations("tools.roi-calculator.ui");

  const [initialInvestment, setInitialInvestment] = useState("");
  const [finalValue, setFinalValue] = useState("");
  const [years, setYears] = useState("");
  const [additionalCosts, setAdditionalCosts] = useState("0");
  const [copied, setCopied] = useState<string | null>(null);

  const calc = () => {
    const invest = parseFloat(initialInvestment);
    const final_ = parseFloat(finalValue);
    const yrs = parseFloat(years);
    const costs = parseFloat(additionalCosts || "0");

    if (isNaN(invest) || invest <= 0) return null;
    if (isNaN(final_) || final_ < 0) return null;
    if (isNaN(yrs) || yrs <= 0 || yrs > 100) return null;

    const totalCost = invest + costs;
    const netProfit = final_ - totalCost;
    const roi = (netProfit / totalCost) * 100;
    const annualizedRoi = (Math.pow(final_ / totalCost, 1 / yrs) - 1) * 100;

    return { roi, annualizedRoi, netProfit, totalCost };
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
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("initialInvestment")}</label>
          <input
            type="number"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-base"
            placeholder="10000"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("finalValue")}</label>
          <input
            type="number"
            value={finalValue}
            onChange={(e) => setFinalValue(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-base"
            placeholder="15000"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("timePeriod")}</label>
          <div className="relative">
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full rounded-xl border bg-background px-4 py-3 pr-20 text-base"
              placeholder="3"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{t("years")}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("additionalCosts")} ({t("optional")})</label>
          <input
            type="number"
            value={additionalCosts}
            onChange={(e) => setAdditionalCosts(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-base"
            placeholder="0"
          />
        </div>
      </div>

      <button
        onClick={() => { setInitialInvestment(""); setFinalValue(""); setYears(""); setAdditionalCosts("0"); }}
        className="rounded-xl border bg-muted/50 px-6 py-3 font-medium hover:bg-muted"
      >
        {t("reset")}
      </button>

      {result && (
        <div className="space-y-4">
          <div
            className="cursor-pointer rounded-xl border bg-muted/50 p-6 transition-colors hover:border-primary/30"
            onClick={() => copy(result.roi.toFixed(2) + "%", "roi")}
          >
            <h3 className="mb-2 text-lg font-semibold">{t("roiResult")}</h3>
            <div className="text-4xl font-bold text-primary">{result.roi.toFixed(2)}%</div>
            <div className="mt-1 h-4 text-xs text-primary">{copied === "roi" ? "✓" : ""}</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div
              className="cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(result.annualizedRoi.toFixed(2) + "%", "aroi")}
            >
              <div className="text-sm text-muted-foreground">{t("annualizedRoi")}</div>
              <div className="mt-1 text-2xl font-semibold">{result.annualizedRoi.toFixed(2)}%</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "aroi" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(result.netProfit), "profit")}
            >
              <div className="text-sm text-muted-foreground">{t("netProfit")}</div>
              <div className="mt-1 text-2xl font-semibold">{fmt(result.netProfit)}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "profit" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(result.totalCost), "cost")}
            >
              <div className="text-sm text-muted-foreground">{t("totalCost")}</div>
              <div className="mt-1 text-2xl font-semibold">{fmt(result.totalCost)}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "cost" ? "✓" : ""}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
