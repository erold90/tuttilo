"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type TermUnit = "months" | "years"

interface LoanResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  principal: number
}

export default function LoanCalculator() {
  const t = useTranslations("tools.loan-calculator.ui")
  const [loanAmount, setLoanAmount] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [loanTerm, setLoanTerm] = useState("")
  const [termUnit, setTermUnit] = useState<TermUnit>("years")
  const [result, setResult] = useState<LoanResult | null>(null)
  const [error, setError] = useState("")

  const calculate = () => {
    try {
      setError("")
      const principal = parseFloat(loanAmount)
      const annualRate = parseFloat(interestRate)
      let termMonths = parseFloat(loanTerm)

      if (isNaN(principal) || isNaN(annualRate) || isNaN(termMonths)) {
        setError(t("invalidInput"))
        setResult(null)
        return
      }

      if (principal <= 0 || annualRate < 0 || termMonths <= 0) {
        setError(t("invalidInput"))
        setResult(null)
        return
      }

      // Convert years to months if needed
      if (termUnit === "years") {
        termMonths = termMonths * 12
      }

      // Monthly interest rate
      const monthlyRate = annualRate / 100 / 12

      let monthlyPayment: number
      let totalPayment: number
      let totalInterest: number

      if (annualRate === 0) {
        // No interest case
        monthlyPayment = principal / termMonths
        totalPayment = principal
        totalInterest = 0
      } else {
        // Standard loan formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
        const x = Math.pow(1 + monthlyRate, termMonths)
        monthlyPayment = (principal * monthlyRate * x) / (x - 1)
        totalPayment = monthlyPayment * termMonths
        totalInterest = totalPayment - principal
      }

      setResult({
        monthlyPayment,
        totalPayment,
        totalInterest,
        principal,
      })
    } catch (err) {
      setError(t("calculationError"))
      setResult(null)
    }
  }

  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value)
    setResult(null)
    setError("")
  }

  const reset = () => {
    setLoanAmount("")
    setInterestRate("")
    setLoanTerm("")
    setResult(null)
    setError("")
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="rounded-xl border bg-muted/50 p-6 space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loanAmount">{t("loanAmount")}</Label>
            <Input
              id="loanAmount"
              type="number"
              step="any"
              value={loanAmount}
              onChange={handleInputChange(setLoanAmount)}
              placeholder="10000"
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">{t("interestRate")}</Label>
            <Input
              id="interestRate"
              type="number"
              step="any"
              value={interestRate}
              onChange={handleInputChange(setInterestRate)}
              placeholder="5.0"
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanTerm">{t("loanTerm")}</Label>
            <div className="flex gap-2">
              <Input
                id="loanTerm"
                type="number"
                step="any"
                value={loanTerm}
                onChange={handleInputChange(setLoanTerm)}
                placeholder="5"
                className="text-lg flex-1"
              />
              <div className="flex rounded-lg border">
                <Button
                  variant={termUnit === "months" ? "default" : "ghost"}
                  onClick={() => setTermUnit("months")}
                  className="rounded-r-none"
                >
                  {t("months")}
                </Button>
                <Button
                  variant={termUnit === "years" ? "default" : "ghost"}
                  onClick={() => setTermUnit("years")}
                  className="rounded-l-none"
                >
                  {t("years")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={calculate} className="flex-1">
            {t("calculate")}
          </Button>
          <Button onClick={reset} variant="outline">
            {t("reset")}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && !error && (
        <div className="rounded-xl border bg-muted/50 p-6 space-y-6">
          {/* Monthly Payment - Highlighted */}
          <div className="rounded-lg border bg-background p-6 space-y-2">
            <Label className="text-muted-foreground">{t("monthlyPayment")}</Label>
            <p className="text-4xl font-bold">
              ${formatCurrency(result.monthlyPayment)}
            </p>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-background p-4 space-y-1">
              <Label className="text-xs text-muted-foreground">{t("totalPrincipal")}</Label>
              <p className="text-xl font-semibold">
                ${formatCurrency(result.principal)}
              </p>
            </div>

            <div className="rounded-lg border bg-background p-4 space-y-1">
              <Label className="text-xs text-muted-foreground">{t("totalInterest")}</Label>
              <p className="text-xl font-semibold text-orange-500">
                ${formatCurrency(result.totalInterest)}
              </p>
            </div>

            <div className="rounded-lg border bg-background p-4 space-y-1">
              <Label className="text-xs text-muted-foreground">{t("totalPayment")}</Label>
              <p className="text-xl font-semibold">
                ${formatCurrency(result.totalPayment)}
              </p>
            </div>
          </div>

          {/* Interest Breakdown Visual */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">{t("paymentBreakdown")}</Label>
            <div className="h-8 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500 flex items-center justify-center text-xs font-medium text-white"
                style={{ width: `${(result.principal / result.totalPayment) * 100}%` }}
              >
                {((result.principal / result.totalPayment) * 100).toFixed(0)}%
              </div>
              <div
                className="bg-orange-500 flex items-center justify-center text-xs font-medium text-white"
                style={{ width: `${(result.totalInterest / result.totalPayment) * 100}%` }}
              >
                {((result.totalInterest / result.totalPayment) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>{t("principal")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>{t("interest")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
