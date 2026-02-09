"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface YearData {
  year: number;
  startBalance: number;
  contributions: number;
  interest: number;
  endBalance: number;
}

export default function CompoundInterestCalculator() {
  const t = useTranslations("tools.compound-interest-calculator.ui");

  const [principal, setPrincipal] = useState<string>("10000");
  const [annualRate, setAnnualRate] = useState<string>("5");
  const [frequency, setFrequency] = useState<string>("12");
  const [years, setYears] = useState<string>("10");
  const [monthlyContribution, setMonthlyContribution] = useState<string>("100");

  const [result, setResult] = useState<{
    finalAmount: number;
    totalInterest: number;
    totalContributions: number;
    totalPrincipal: number;
    yearlyData: YearData[];
  } | null>(null);
  const [error, setError] = useState<string>("");
  const [showTable, setShowTable] = useState(false);

  const calculate = () => {
    try {
      setError("");
      setResult(null);

      const p = parseFloat(principal);
      const r = parseFloat(annualRate);
      const n = parseFloat(frequency);
      const yrs = parseFloat(years);
      const pmt = parseFloat(monthlyContribution || "0");

      if (isNaN(p) || p < 0) {
        throw new Error(t("errorPrincipal"));
      }
      if (isNaN(r) || r < 0 || r > 100) {
        throw new Error(t("errorRate"));
      }
      if (isNaN(yrs) || yrs <= 0 || yrs > 100) {
        throw new Error(t("errorYears"));
      }
      if (isNaN(pmt) || pmt < 0) {
        throw new Error(t("errorContribution"));
      }

      const yearlyData: YearData[] = [];
      let balance = p;
      const ratePerPeriod = r / 100 / n;
      const monthlyRate = r / 100 / 12;

      for (let year = 1; year <= yrs; year++) {
        const startBalance = balance;
        let yearContributions = 0;
        let yearInterest = 0;

        // Calculate for each compounding period in the year
        const periodsInYear = n;
        const monthsPerPeriod = 12 / n;

        for (let period = 0; period < periodsInYear; period++) {
          // Add interest
          const interest = balance * ratePerPeriod;
          balance += interest;
          yearInterest += interest;

          // Add contributions (monthly)
          const monthsInPeriod = Math.min(monthsPerPeriod, 12 - period * monthsPerPeriod);
          for (let m = 0; m < monthsInPeriod; m++) {
            balance += pmt;
            yearContributions += pmt;
            // Add interest on contributions
            const contributionInterest = pmt * monthlyRate * (monthsInPeriod - m - 1);
            balance += contributionInterest;
            yearInterest += contributionInterest;
          }
        }

        yearlyData.push({
          year,
          startBalance,
          contributions: yearContributions,
          interest: yearInterest,
          endBalance: balance,
        });
      }

      const totalContributions = pmt * 12 * yrs;
      const finalAmount = balance;
      const totalInterest = finalAmount - p - totalContributions;

      setResult({
        finalAmount,
        totalInterest,
        totalContributions,
        totalPrincipal: p,
        yearlyData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const reset = () => {
    setPrincipal("10000");
    setAnnualRate("5");
    setFrequency("12");
    setYears("10");
    setMonthlyContribution("100");
    setResult(null);
    setError("");
    setShowTable(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Principal */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("principal")}</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-base"
            placeholder="10000"
          />
        </div>

        {/* Annual Interest Rate */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("annualRate")}</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
              className="w-full rounded-xl border bg-background px-4 py-3 pr-10 text-base"
              placeholder="5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              %
            </span>
          </div>
        </div>

        {/* Compounding Frequency */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("compoundingFrequency")}</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-base"
          >
            <option value="365">{t("daily")}</option>
            <option value="12">{t("monthly")}</option>
            <option value="4">{t("quarterly")}</option>
            <option value="1">{t("yearly")}</option>
          </select>
        </div>

        {/* Time Period */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("timePeriod")}</label>
          <div className="relative">
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full rounded-xl border bg-background px-4 py-3 pr-20 text-base"
              placeholder="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {t("years")}
            </span>
          </div>
        </div>

        {/* Monthly Contribution */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">
            {t("monthlyContribution")} ({t("optional")})
          </label>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="w-full max-w-sm rounded-xl border bg-background px-4 py-3 text-base"
            placeholder="100"
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
            <h3 className="mb-4 text-lg font-semibold">{t("finalAmount")}</h3>
            <div className="text-4xl font-bold text-primary">
              {formatCurrency(result.finalAmount)}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("totalPrincipal")}</div>
              <div className="mt-1 text-2xl font-semibold">
                {formatCurrency(result.totalPrincipal)}
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">
                {t("totalContributions")}
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {formatCurrency(result.totalContributions)}
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("totalInterest")}</div>
              <div className="mt-1 text-2xl font-semibold">
                {formatCurrency(result.totalInterest)}
              </div>
            </div>
          </div>

          {result.yearlyData.length > 0 && (
            <div className="rounded-xl border bg-background">
              <button
                onClick={() => setShowTable(!showTable)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50"
              >
                <span className="font-medium">{t("yearByYearGrowth")}</span>
                <span className="text-muted-foreground">
                  {showTable ? "−" : "+"}
                </span>
              </button>

              {showTable && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-t bg-muted/50">
                      <tr>
                        <th className="p-3 text-left font-medium">{t("year")}</th>
                        <th className="p-3 text-right font-medium">{t("startBalance")}</th>
                        <th className="p-3 text-right font-medium">
                          {t("contributions")}
                        </th>
                        <th className="p-3 text-right font-medium">{t("interest")}</th>
                        <th className="p-3 text-right font-medium">{t("endBalance")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.yearlyData.map((data) => (
                        <tr key={data.year} className="border-t">
                          <td className="p-3">{data.year}</td>
                          <td className="p-3 text-right">
                            {formatCurrency(data.startBalance)}
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(data.contributions)}
                          </td>
                          <td className="p-3 text-right text-green-600">
                            {formatCurrency(data.interest)}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {formatCurrency(data.endBalance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
