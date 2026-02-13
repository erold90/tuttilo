"use client";

import { useState, useCallback } from "react";
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

  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [frequency, setFrequency] = useState("12");
  const [years, setYears] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("0");
  const [showTable, setShowTable] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const calc = () => {
    const p = parseFloat(principal);
    const r = parseFloat(annualRate);
    const n = parseFloat(frequency);
    const yrs = parseFloat(years);
    const pmt = parseFloat(monthlyContribution || "0");

    if (isNaN(p) || p < 0) return null;
    if (isNaN(r) || r < 0 || r > 100) return null;
    if (isNaN(yrs) || yrs <= 0 || yrs > 100) return null;
    if (isNaN(pmt) || pmt < 0) return null;

    const yearlyData: YearData[] = [];
    let balance = p;
    const ratePerPeriod = r / 100 / n;
    const monthlyRate = r / 100 / 12;

    for (let year = 1; year <= yrs; year++) {
      const startBalance = balance;
      let yearContributions = 0;
      let yearInterest = 0;

      const periodsInYear = n;
      const monthsPerPeriod = 12 / n;

      for (let period = 0; period < periodsInYear; period++) {
        const interest = balance * ratePerPeriod;
        balance += interest;
        yearInterest += interest;

        const monthsInPeriod = Math.min(monthsPerPeriod, 12 - period * monthsPerPeriod);
        for (let m = 0; m < monthsInPeriod; m++) {
          balance += pmt;
          yearContributions += pmt;
          const contributionInterest = pmt * monthlyRate * (monthsInPeriod - m - 1);
          balance += contributionInterest;
          yearInterest += contributionInterest;
        }
      }

      yearlyData.push({ year, startBalance, contributions: yearContributions, interest: yearInterest, endBalance: balance });
    }

    const totalContributions = pmt * 12 * yrs;
    const finalAmount = balance;
    const totalInterest = finalAmount - p - totalContributions;

    return { finalAmount, totalInterest, totalContributions, totalPrincipal: p, yearlyData };
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
          <label className="text-sm font-medium">{t("principal")}</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-base"
            placeholder="10000"
          />
        </div>

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
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
          </div>
        </div>

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
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{t("years")}</span>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">{t("monthlyContribution")} ({t("optional")})</label>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="w-full max-w-sm rounded-xl border bg-background px-4 py-3 text-base"
            placeholder="100"
          />
        </div>
      </div>

      <button
        onClick={() => { setPrincipal(""); setAnnualRate(""); setFrequency("12"); setYears(""); setMonthlyContribution("0"); setShowTable(false); }}
        className="rounded-xl border bg-muted/50 px-6 py-3 font-medium hover:bg-muted"
      >
        {t("reset")}
      </button>

      {result && (
        <div className="space-y-4">
          <div
            className="cursor-pointer rounded-xl border bg-muted/50 p-6 transition-colors hover:border-primary/30"
            onClick={() => copy(fmt(result.finalAmount), "final")}
          >
            <h3 className="mb-2 text-lg font-semibold">{t("finalAmount")}</h3>
            <div className="text-4xl font-bold text-primary">{fmt(result.finalAmount)}</div>
            <div className="mt-1 h-4 text-xs text-primary">{copied === "final" ? "✓" : ""}</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div
              className="cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(result.totalPrincipal), "princ")}
            >
              <div className="text-sm text-muted-foreground">{t("totalPrincipal")}</div>
              <div className="mt-1 text-2xl font-semibold">{fmt(result.totalPrincipal)}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "princ" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(result.totalContributions), "contrib")}
            >
              <div className="text-sm text-muted-foreground">{t("totalContributions")}</div>
              <div className="mt-1 text-2xl font-semibold">{fmt(result.totalContributions)}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "contrib" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(result.totalInterest), "int")}
            >
              <div className="text-sm text-muted-foreground">{t("totalInterest")}</div>
              <div className="mt-1 text-2xl font-semibold">{fmt(result.totalInterest)}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "int" ? "✓" : ""}</div>
            </div>
          </div>

          {result.yearlyData.length > 0 && (
            <div className="rounded-xl border bg-background">
              <button
                onClick={() => setShowTable(!showTable)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50"
              >
                <span className="font-medium">{t("yearByYearGrowth")}</span>
                <span className="text-muted-foreground">{showTable ? "−" : "+"}</span>
              </button>

              {showTable && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-t bg-muted/50">
                      <tr>
                        <th className="p-3 text-left font-medium">{t("year")}</th>
                        <th className="p-3 text-right font-medium">{t("startBalance")}</th>
                        <th className="p-3 text-right font-medium">{t("contributions")}</th>
                        <th className="p-3 text-right font-medium">{t("interest")}</th>
                        <th className="p-3 text-right font-medium">{t("endBalance")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.yearlyData.map((data) => (
                        <tr key={data.year} className="border-t">
                          <td className="p-3">{data.year}</td>
                          <td className="p-3 text-right">{fmt(data.startBalance)}</td>
                          <td className="p-3 text-right">{fmt(data.contributions)}</td>
                          <td className="p-3 text-right text-primary">{fmt(data.interest)}</td>
                          <td className="p-3 text-right font-semibold">{fmt(data.endBalance)}</td>
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
