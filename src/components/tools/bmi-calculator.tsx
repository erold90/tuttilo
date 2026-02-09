"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type UnitSystem = "metric" | "imperial"

interface BMIResult {
  bmi: number
  category: string
  categoryColor: string
  position: number
}

export default function BMICalculator() {
  const t = useTranslations("tools.bmi-calculator.ui")
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [result, setResult] = useState<BMIResult | null>(null)
  const [error, setError] = useState("")

  const calculate = () => {
    try {
      setError("")
      let weightKg = parseFloat(weight)
      let heightM = parseFloat(height)

      if (isNaN(weightKg) || isNaN(heightM) || weightKg <= 0 || heightM <= 0) {
        setError(t("invalidInput"))
        setResult(null)
        return
      }

      // Convert to metric if imperial
      if (unitSystem === "imperial") {
        weightKg = weightKg * 0.453592 // lbs to kg
        heightM = heightM * 0.0254 // inches to meters
      } else {
        heightM = heightM / 100 // cm to meters
      }

      const bmi = weightKg / (heightM * heightM)

      let category: string
      let categoryColor: string
      let position: number

      if (bmi < 18.5) {
        category = t("underweight")
        categoryColor = "text-blue-500"
        position = (bmi / 18.5) * 25
      } else if (bmi < 25) {
        category = t("normal")
        categoryColor = "text-green-500"
        position = 25 + ((bmi - 18.5) / (25 - 18.5)) * 25
      } else if (bmi < 30) {
        category = t("overweight")
        categoryColor = "text-yellow-500"
        position = 50 + ((bmi - 25) / (30 - 25)) * 25
      } else {
        category = t("obese")
        categoryColor = "text-red-500"
        position = Math.min(75 + ((bmi - 30) / 10) * 25, 100)
      }

      setResult({ bmi, category, categoryColor, position })
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

  const toggleUnit = () => {
    setUnitSystem(unitSystem === "metric" ? "imperial" : "metric")
    setWeight("")
    setHeight("")
    setResult(null)
    setError("")
  }

  const reset = () => {
    setWeight("")
    setHeight("")
    setResult(null)
    setError("")
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Unit Toggle */}
      <div className="flex gap-2">
        <Button
          variant={unitSystem === "metric" ? "default" : "outline"}
          onClick={() => setUnitSystem("metric")}
          className="flex-1"
        >
          {t("metric")}
        </Button>
        <Button
          variant={unitSystem === "imperial" ? "default" : "outline"}
          onClick={() => setUnitSystem("imperial")}
          className="flex-1"
        >
          {t("imperial")}
        </Button>
      </div>

      {/* Input Section */}
      <div className="rounded-xl border bg-muted/50 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">
              {t("weight")} ({unitSystem === "metric" ? "kg" : "lbs"})
            </Label>
            <Input
              id="weight"
              type="number"
              step="any"
              value={weight}
              onChange={handleInputChange(setWeight)}
              placeholder="0"
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">
              {t("height")} ({unitSystem === "metric" ? "cm" : "in"})
            </Label>
            <Input
              id="height"
              type="number"
              step="any"
              value={height}
              onChange={handleInputChange(setHeight)}
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
      {result && !error && (
        <div className="rounded-xl border bg-muted/50 p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground">{t("yourBMI")}</Label>
            <p className="text-4xl font-bold">
              {result.bmi.toFixed(1)}
            </p>
            <p className={`text-xl font-semibold ${result.categoryColor}`}>
              {result.category}
            </p>
          </div>

          {/* BMI Scale */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">{t("bmiScale")}</Label>
            <div className="relative h-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500">
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                style={{ left: `${result.position}%` }}
              />
            </div>
            <div className="grid grid-cols-4 text-xs text-muted-foreground">
              <div className="text-left">
                <div>&lt;18.5</div>
                <div className="font-medium">{t("underweight")}</div>
              </div>
              <div className="text-center">
                <div>18.5-24.9</div>
                <div className="font-medium">{t("normal")}</div>
              </div>
              <div className="text-center">
                <div>25-29.9</div>
                <div className="font-medium">{t("overweight")}</div>
              </div>
              <div className="text-right">
                <div>≥30</div>
                <div className="font-medium">{t("obese")}</div>
              </div>
            </div>
          </div>

          {/* Category Explanation */}
          <div className="rounded-lg border bg-background p-4 text-sm space-y-2">
            <p className="font-medium">{t("aboutCategory")}</p>
            <p className="text-muted-foreground">{t(`${result.category}Description`)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
