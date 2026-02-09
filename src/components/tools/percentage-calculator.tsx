"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy } from "@phosphor-icons/react"

type CalculationMode = "percentOf" | "whatPercent" | "percentChange"

export default function PercentageCalculator() {
  const t = useTranslations("tools.percentage-calculator.ui")
  const [mode, setMode] = useState<CalculationMode>("percentOf")
  const [value1, setValue1] = useState("")
  const [value2, setValue2] = useState("")
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const calculate = () => {
    try {
      setError("")
      const num1 = parseFloat(value1)
      const num2 = parseFloat(value2)

      if (isNaN(num1) || isNaN(num2)) {
        setError(t("invalidInput"))
        setResult(null)
        return
      }

      let calculatedResult: number

      switch (mode) {
        case "percentOf":
          // What is X% of Y?
          calculatedResult = (num1 / 100) * num2
          break
        case "whatPercent":
          // X is what % of Y?
          if (num2 === 0) {
            setError(t("divisionByZero"))
            setResult(null)
            return
          }
          calculatedResult = (num1 / num2) * 100
          break
        case "percentChange":
          // % change from X to Y
          if (num1 === 0) {
            setError(t("divisionByZero"))
            setResult(null)
            return
          }
          calculatedResult = ((num2 - num1) / num1) * 100
          break
        default:
          return
      }

      setResult(calculatedResult)
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

  const handleCopy = async () => {
    if (result !== null) {
      await navigator.clipboard.writeText(result.toFixed(2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const reset = () => {
    setValue1("")
    setValue2("")
    setResult(null)
    setError("")
    setCopied(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Mode Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={mode === "percentOf" ? "default" : "outline"}
          onClick={() => setMode("percentOf")}
          className="flex-1 min-w-fit"
        >
          {t("modePercentOf")}
        </Button>
        <Button
          variant={mode === "whatPercent" ? "default" : "outline"}
          onClick={() => setMode("whatPercent")}
          className="flex-1 min-w-fit"
        >
          {t("modeWhatPercent")}
        </Button>
        <Button
          variant={mode === "percentChange" ? "default" : "outline"}
          onClick={() => setMode("percentChange")}
          className="flex-1 min-w-fit"
        >
          {t("modePercentChange")}
        </Button>
      </div>

      {/* Input Section */}
      <div className="rounded-xl border bg-muted/50 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="value1">
              {mode === "percentOf" && t("percentage")}
              {mode === "whatPercent" && t("value")}
              {mode === "percentChange" && t("initialValue")}
            </Label>
            <Input
              id="value1"
              type="number"
              step="any"
              value={value1}
              onChange={handleInputChange(setValue1)}
              placeholder="0"
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value2">
              {mode === "percentOf" && t("ofValue")}
              {mode === "whatPercent" && t("ofValue")}
              {mode === "percentChange" && t("finalValue")}
            </Label>
            <Input
              id="value2"
              type="number"
              step="any"
              value={value2}
              onChange={handleInputChange(setValue2)}
              placeholder="0"
              className="text-lg"
            />
          </div>
        </div>

        <div className="flex gap-2">
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
      {result !== null && !error && (
        <div className="rounded-xl border bg-muted/50 p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">{t("result")}</Label>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">
                {result.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                {mode !== "percentOf" && "%"}
              </p>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
                className="shrink-0"
              >
                <Copy weight="duotone" className="w-4 h-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-muted-foreground">{t("copied")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
