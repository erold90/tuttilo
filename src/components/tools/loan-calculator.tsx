"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type TermUnit = "months" | "years";

export default function LoanCalculator() {
  const t = useTranslations("tools.loan-calculator.ui");
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [termUnit, setTermUnit] = useState<TermUnit>("years");
  const [copied, setCopied] = useState<string | null>(null);

  const calc = () => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    let termMonths = parseFloat(loanTerm);

    if (isNaN(principal) || isNaN(annualRate) || isNaN(termMonths)) return null;
    if (principal <= 0 || annualRate < 0 || termMonths <= 0) return null;

    if (termUnit === "years") termMonths = termMonths * 12;

    const monthlyRate = annualRate / 100 / 12;

    let monthlyPayment: number;
    let totalPayment: number;
    let totalInterest: number;

    if (annualRate === 0) {
      monthlyPayment = principal / termMonths;
      totalPayment = principal;
      totalInterest = 0;
    } else {
      const x = Math.pow(1 + monthlyRate, termMonths);
      monthlyPayment = (principal * monthlyRate * x) / (x - 1);
      totalPayment = monthlyPayment * termMonths;
      totalInterest = totalPayment - principal;
    }

    return { monthlyPayment, totalPayment, totalInterest, principal };
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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="rounded-xl border bg-muted/50 p-6 space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("loanAmount")}</label>
            <input
              type="number"
              step="any"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="10000"
              className="w-full rounded-xl border bg-background px-4 py-3 text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("interestRate")}</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="5.0"
                className="w-full rounded-xl border bg-background px-4 py-3 pr-10 text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("loanTerm")}</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                placeholder="5"
                className="flex-1 rounded-xl border bg-background px-4 py-3 text-lg"
              />
              <div className="flex rounded-xl border overflow-hidden">
                <button
                  onClick={() => setTermUnit("months")}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    termUnit === "months" ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {t("months")}
                </button>
                <button
                  onClick={() => setTermUnit("years")}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    termUnit === "years" ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {t("years")}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => { setLoanAmount(""); setInterestRate(""); setLoanTerm(""); }}
          className="rounded-xl border bg-background px-6 py-3 font-medium hover:bg-muted"
        >
          {t("reset")}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-xl border bg-muted/50 p-6 space-y-6">
          {/* Monthly Payment - Highlighted */}
          <div
            className="cursor-pointer rounded-lg border bg-background p-6 transition-colors hover:border-primary/30"
            onClick={() => copy(fmt(result.monthlyPayment), "mp")}
          >
            <div className="text-sm text-muted-foreground">{t("monthlyPayment")}</div>
            <p className="mt-1 text-4xl font-bold">{fmt(result.monthlyPayment)}</p>
            <div className="mt-1 h-4 text-xs text-primary">{copied === "mp" ? "✓" : ""}</div>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="cursor-pointer rounded-lg border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(result.principal), "princ")}
            >
              <div className="text-xs text-muted-foreground">{t("totalPrincipal")}</div>
              <p className="mt-1 text-xl font-semibold">{fmt(result.principal)}</p>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "princ" ? "✓" : ""}</div>
            </div>

            <div
              className="cursor-pointer rounded-lg border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(result.totalInterest), "int")}
            >
              <div className="text-xs text-muted-foreground">{t("totalInterest")}</div>
              <p className="mt-1 text-xl font-semibold">{fmt(result.totalInterest)}</p>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "int" ? "✓" : ""}</div>
            </div>

            <div
              className="cursor-pointer rounded-lg border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(result.totalPayment), "total")}
            >
              <div className="text-xs text-muted-foreground">{t("totalPayment")}</div>
              <p className="mt-1 text-xl font-semibold">{fmt(result.totalPayment)}</p>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "total" ? "✓" : ""}</div>
            </div>
          </div>

          {/* Interest Breakdown Visual */}
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">{t("paymentBreakdown")}</div>
            <div className="h-8 rounded-full overflow-hidden flex">
              <div
                className="bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground"
                style={{ width: `${(result.principal / result.totalPayment) * 100}%` }}
              >
                {((result.principal / result.totalPayment) * 100).toFixed(0)}%
              </div>
              <div
                className="bg-muted-foreground/40 flex items-center justify-center text-xs font-medium"
                style={{ width: `${(result.totalInterest / result.totalPayment) * 100}%` }}
              >
                {((result.totalInterest / result.totalPayment) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>{t("principal")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                <span>{t("interest")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
