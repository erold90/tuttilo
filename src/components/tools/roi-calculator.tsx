"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function RoiCalculator() {
  const t = useTranslations("tools.roi-calculator.ui");

  const [initialInvestment, setInitialInvestment] = useState("10000");
  const [finalValue, setFinalValue] = useState("15000");
  const [years, setYears] = useState("3");
  const [additionalCosts, setAdditionalCosts] = useState("0");

  const [result, setResult] = useState<{
    roi: number;
    annualizedRoi: number;
    netProfit: number;
    totalCost: number;
  } | null>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    try {
      setError("");
      setResult(null);

      const invest = parseFloat(initialInvestment);
      const final_ = parseFloat(finalValue);
      const yrs = parseFloat(years);
      const costs = parseFloat(additionalCosts || "0");

      if (isNaN(invest) || invest <= 0) {
        throw new Error(t("errorInvestment"));
      }
      if (isNaN(final_) || final_ < 0) {
        throw new Error(t("errorFinalValue"));
      }
      if (isNaN(yrs) || yrs <= 0 || yrs > 100) {
        throw new Error(t("errorYears"));
      }

      const totalCost = invest + costs;
      const netProfit = final_ - totalCost;
      const roi = (netProfit / totalCost) * 100;
      const annualizedRoi = (Math.pow(final_ / totalCost, 1 / yrs) - 1) * 100;

      setResult({ roi, annualizedRoi, netProfit, totalCost });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    }
  };

  const reset = () => {
    setInitialInvestment("10000");
    setFinalValue("15000");
    setYears("3");
    setAdditionalCosts("0");
    setResult(null);
    setError("");
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

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
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {t("years")}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("additionalCosts")} ({t("optional")})
          </label>
          <input
            type="number"
            value={additionalCosts}
            onChange={(e) => setAdditionalCosts(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-base"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={calculate}
          className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("calculate")}
        </button>
        <button
          onClick={reset}
          className="rounded-xl border bg-muted/50 px-6 py-3 font-medium hover:bg-muted"
        >
          {t("reset")}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/50 p-6">
            <h3 className="mb-4 text-lg font-semibold">{t("roiResult")}</h3>
            <div className={`text-4xl font-bold ${result.roi >= 0 ? "text-green-600" : "text-red-500"}`}>
              {result.roi.toFixed(2)}%
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("annualizedRoi")}</div>
              <div className={`mt-1 text-2xl font-semibold ${result.annualizedRoi >= 0 ? "text-green-600" : "text-red-500"}`}>
                {result.annualizedRoi.toFixed(2)}%
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("netProfit")}</div>
              <div className={`mt-1 text-2xl font-semibold ${result.netProfit >= 0 ? "text-green-600" : "text-red-500"}`}>
                {fmt(result.netProfit)}
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("totalCost")}</div>
              <div className="mt-1 text-2xl font-semibold">
                {fmt(result.totalCost)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
