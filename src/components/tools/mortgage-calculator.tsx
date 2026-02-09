"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function MortgageCalculator() {
  const t = useTranslations("tools.mortgage-calculator.ui");

  const [homePrice, setHomePrice] = useState<string>("300000");
  const [downPayment, setDownPayment] = useState<string>("60000");
  const [downPaymentPercent, setDownPaymentPercent] = useState<string>("20");
  const [usePercent, setUsePercent] = useState(true);
  const [interestRate, setInterestRate] = useState<string>("6.5");
  const [loanTerm, setLoanTerm] = useState<string>("30");
  const [propertyTaxRate, setPropertyTaxRate] = useState<string>("1.2");

  const [result, setResult] = useState<{
    monthlyPayment: number;
    monthlyTax: number;
    totalMonthly: number;
    totalCost: number;
    totalInterest: number;
    loanAmount: number;
  } | null>(null);
  const [error, setError] = useState<string>("");

  const calculate = () => {
    try {
      setError("");
      setResult(null);

      const price = parseFloat(homePrice);
      let down = usePercent
        ? (parseFloat(downPaymentPercent) / 100) * price
        : parseFloat(downPayment);

      const rate = parseFloat(interestRate);
      const years = parseInt(loanTerm);
      const taxRate = parseFloat(propertyTaxRate);

      if (isNaN(price) || price <= 0) {
        throw new Error(t("errorHomePrice"));
      }
      if (isNaN(down) || down < 0 || down >= price) {
        throw new Error(t("errorDownPayment"));
      }
      if (isNaN(rate) || rate < 0 || rate > 30) {
        throw new Error(t("errorInterestRate"));
      }
      if (isNaN(taxRate) || taxRate < 0) {
        throw new Error(t("errorTaxRate"));
      }

      const loanAmount = price - down;
      const monthlyRate = rate / 100 / 12;
      const numPayments = years * 12;

      // Calculate monthly P&I payment using amortization formula
      const monthlyPayment =
        monthlyRate === 0
          ? loanAmount / numPayments
          : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
            (Math.pow(1 + monthlyRate, numPayments) - 1);

      const totalCost = monthlyPayment * numPayments;
      const totalInterest = totalCost - loanAmount;

      // Estimate monthly property tax
      const monthlyTax = (price * (taxRate / 100)) / 12;
      const totalMonthly = monthlyPayment + monthlyTax;

      setResult({
        monthlyPayment,
        monthlyTax,
        totalMonthly,
        totalCost,
        totalInterest,
        loanAmount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const reset = () => {
    setHomePrice("300000");
    setDownPayment("60000");
    setDownPaymentPercent("20");
    setInterestRate("6.5");
    setLoanTerm("30");
    setPropertyTaxRate("1.2");
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Home Price */}
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

        {/* Down Payment */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("downPayment")}</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={usePercent ? downPaymentPercent : downPayment}
              onChange={(e) =>
                usePercent
                  ? setDownPaymentPercent(e.target.value)
                  : setDownPayment(e.target.value)
              }
              className="flex-1 rounded-xl border bg-background px-4 py-3 text-base"
              placeholder={usePercent ? "20" : "60000"}
            />
            <button
              onClick={() => setUsePercent(!usePercent)}
              className="rounded-xl border bg-muted/50 px-4 py-3 text-sm font-medium hover:bg-muted"
            >
              {usePercent ? "%" : "$"}
            </button>
          </div>
        </div>

        {/* Interest Rate */}
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
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              %
            </span>
          </div>
        </div>

        {/* Loan Term */}
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

        {/* Property Tax Rate */}
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
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              %
            </span>
          </div>
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
            <h3 className="mb-4 text-lg font-semibold">{t("monthlyPayment")}</h3>
            <div className="text-4xl font-bold text-primary">
              {formatCurrency(result.totalMonthly)}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {formatCurrency(result.monthlyPayment)} {t("principalInterest")} +{" "}
              {formatCurrency(result.monthlyTax)} {t("propertyTax")}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("loanAmount")}</div>
              <div className="mt-1 text-2xl font-semibold">
                {formatCurrency(result.loanAmount)}
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("totalInterest")}</div>
              <div className="mt-1 text-2xl font-semibold">
                {formatCurrency(result.totalInterest)}
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("totalCost")}</div>
              <div className="mt-1 text-2xl font-semibold">
                {formatCurrency(result.totalCost)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
