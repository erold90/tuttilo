"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export default function MortgageCalculator() {
  const t = useTranslations("tools.mortgage-calculator.ui");

  const [homePrice, setHomePrice] = useState("");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [downPaymentAmount, setDownPaymentAmount] = useState("");
  const [usePercent, setUsePercent] = useState(true);
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("30");
  const [propertyTaxRate, setPropertyTaxRate] = useState("1.2");
  const [copied, setCopied] = useState<string | null>(null);

  const calc = () => {
    const price = parseFloat(homePrice);
    if (isNaN(price) || price <= 0) return null;

    const down = usePercent
      ? (parseFloat(downPaymentPercent) / 100) * price
      : parseFloat(downPaymentAmount);
    const rate = parseFloat(interestRate);
    const years = parseInt(loanTerm);
    const taxRate = parseFloat(propertyTaxRate) || 0;

    if (isNaN(down) || down < 0 || down >= price) return null;
    if (isNaN(rate) || rate < 0 || rate > 30) return null;

    const loanAmount = price - down;
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;

    const monthlyPayment =
      monthlyRate === 0
        ? loanAmount / numPayments
        : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
          (Math.pow(1 + monthlyRate, numPayments) - 1);

    const totalCost = monthlyPayment * numPayments;
    const totalInterest = totalCost - loanAmount;
    const monthlyTax = (price * (taxRate / 100)) / 12;
    const totalMonthly = monthlyPayment + monthlyTax;

    return { monthlyPayment, monthlyTax, totalMonthly, totalCost, totalInterest, loanAmount };
  };

  const result = calc();

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const copy = useCallback((val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("homePrice")}</label>
          <input
            type="number"
            value={homePrice}
            onChange={(e) => setHomePrice(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-base"
            placeholder="300000"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("downPayment")}</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={usePercent ? downPaymentPercent : downPaymentAmount}
              onChange={(e) =>
                usePercent
                  ? setDownPaymentPercent(e.target.value)
                  : setDownPaymentAmount(e.target.value)
              }
              className="flex-1 rounded-xl border bg-background px-4 py-3 text-base"
              placeholder={usePercent ? "20" : "60000"}
            />
            <button
              onClick={() => setUsePercent(!usePercent)}
              className="rounded-xl border bg-muted/50 px-4 py-3 text-sm font-medium hover:bg-muted"
            >
              {usePercent ? "%" : "#"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("interestRate")}</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full rounded-xl border bg-background px-4 py-3 pr-10 text-base"
              placeholder="6.5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("loanTerm")}</label>
          <select
            value={loanTerm}
            onChange={(e) => setLoanTerm(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-base"
          >
            <option value="15">15 {t("years")}</option>
            <option value="20">20 {t("years")}</option>
            <option value="25">25 {t("years")}</option>
            <option value="30">30 {t("years")}</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">{t("propertyTaxRate")}</label>
          <div className="relative max-w-sm">
            <input
              type="number"
              step="0.1"
              value={propertyTaxRate}
              onChange={(e) => setPropertyTaxRate(e.target.value)}
              className="w-full rounded-xl border bg-background px-4 py-3 pr-10 text-base"
              placeholder="1.2"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => { setHomePrice(""); setDownPaymentPercent("20"); setDownPaymentAmount(""); setInterestRate(""); setLoanTerm("30"); setPropertyTaxRate("1.2"); }}
        className="rounded-xl border bg-muted/50 px-6 py-3 font-medium hover:bg-muted"
      >
        {t("reset")}
      </button>

      {result && (
        <div className="space-y-4">
          <div
            className="cursor-pointer rounded-xl border bg-muted/50 p-6 transition-colors hover:border-primary/30"
            onClick={() => copy(fmt(result.totalMonthly), "mp")}
          >
            <h3 className="mb-2 text-lg font-semibold">{t("monthlyPayment")}</h3>
            <div className="text-4xl font-bold text-primary">{fmt(result.totalMonthly)}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {fmt(result.monthlyPayment)} {t("principalInterest")} + {fmt(result.monthlyTax)} {t("propertyTax")}
            </div>
            <div className="mt-1 h-4 text-xs text-primary">{copied === "mp" ? "✓" : ""}</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              className="cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(result.loanAmount), "loan")}
            >
              <div className="text-sm text-muted-foreground">{t("loanAmount")}</div>
              <div className="mt-1 text-2xl font-semibold">{fmt(result.loanAmount)}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "loan" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(result.totalInterest), "int")}
            >
              <div className="text-sm text-muted-foreground">{t("totalInterest")}</div>
              <div className="mt-1 text-2xl font-semibold">{fmt(result.totalInterest)}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "int" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(result.totalCost), "tc")}
            >
              <div className="text-sm text-muted-foreground">{t("totalCost")}</div>
              <div className="mt-1 text-2xl font-semibold">{fmt(result.totalCost)}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "tc" ? "✓" : ""}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
