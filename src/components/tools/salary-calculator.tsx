"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type SalaryMode = "annual" | "hourly";

export default function SalaryCalculator() {
  const t = useTranslations("tools.salary-calculator.ui");

  const [mode, setMode] = useState<SalaryMode>("annual");
  const [salary, setSalary] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("52");
  const [taxRate, setTaxRate] = useState("25");

  const salaryNum = parseFloat(salary) || 0;
  const hours = parseFloat(hoursPerWeek) || 40;
  const weeks = parseFloat(weeksPerYear) || 52;
  const tax = parseFloat(taxRate) || 0;

  const annualGross = mode === "annual" ? salaryNum : salaryNum * hours * weeks;
  const hourlyRate = mode === "hourly" ? salaryNum : weeks > 0 && hours > 0 ? salaryNum / (hours * weeks) : 0;
  const monthlyGross = annualGross / 12;
  const weeklyGross = annualGross / weeks;
  const dailyGross = weeks > 0 ? annualGross / (weeks * 5) : 0;

  const taxAmount = annualGross * (tax / 100);
  const annualNet = annualGross - taxAmount;
  const monthlyNet = annualNet / 12;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  const reset = () => {
    setSalary("");
    setHoursPerWeek("40");
    setWeeksPerYear("52");
    setTaxRate("25");
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("annual"); setSalary(""); }}
          className={`flex-1 rounded-xl px-4 py-3 font-medium transition-colors ${
            mode === "annual" ? "bg-primary text-primary-foreground" : "border bg-muted/50 hover:bg-muted"
          }`}
        >
          {t("annualSalary")}
        </button>
        <button
          onClick={() => { setMode("hourly"); setSalary(""); }}
          className={`flex-1 rounded-xl px-4 py-3 font-medium transition-colors ${
            mode === "hourly" ? "bg-primary text-primary-foreground" : "border bg-muted/50 hover:bg-muted"
          }`}
        >
          {t("hourlyRate")}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {mode === "annual" ? t("annualSalary") : t("hourlyRate")}
          </label>
          <input
            type="number"
            step="0.01"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-base"
            placeholder={mode === "annual" ? "50000" : "25"}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("hoursPerWeek")}</label>
          <input
            type="number"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-base"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("weeksPerYear")}</label>
          <input
            type="number"
            value={weeksPerYear}
            onChange={(e) => setWeeksPerYear(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-base"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("taxRate")} (%)</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-full rounded-xl border bg-background px-4 py-3 pr-10 text-base"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      <button
        onClick={reset}
        className="rounded-xl border bg-muted/50 px-6 py-3 font-medium hover:bg-muted"
      >
        {t("reset")}
      </button>

      {salaryNum > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t("grossBreakdown")}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-muted/50 p-4">
              <div className="text-sm text-muted-foreground">{t("annual")}</div>
              <div className="mt-1 text-2xl font-bold text-primary">{fmt(annualGross)}</div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("monthly")}</div>
              <div className="mt-1 text-xl font-semibold">{fmt(monthlyGross)}</div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("weekly")}</div>
              <div className="mt-1 text-xl font-semibold">{fmt(weeklyGross)}</div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("daily")}</div>
              <div className="mt-1 text-xl font-semibold">{fmt(dailyGross)}</div>
            </div>
          </div>

          <h3 className="text-lg font-semibold">{t("afterTax")}</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-muted/50 p-4">
              <div className="text-sm text-muted-foreground">{t("hourlyEquivalent")}</div>
              <div className="mt-1 text-2xl font-bold">{fmt(hourlyRate)}</div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("annualNet")}</div>
              <div className="mt-1 text-2xl font-semibold text-green-600">{fmt(annualNet)}</div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("monthlyNet")}</div>
              <div className="mt-1 text-2xl font-semibold text-green-600">{fmt(monthlyNet)}</div>
            </div>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <div className="text-sm text-muted-foreground">{t("totalTax")}</div>
            <div className="mt-1 text-xl font-semibold text-red-500">{fmt(taxAmount)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
