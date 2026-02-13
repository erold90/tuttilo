"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type UnitSystem = "metric" | "imperial";

export default function BMICalculator() {
  const t = useTranslations("tools.bmi-calculator.ui");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const calc = () => {
    let weightKg = parseFloat(weight);
    let heightM = parseFloat(height);

    if (isNaN(weightKg) || isNaN(heightM) || weightKg <= 0 || heightM <= 0) return null;

    if (unitSystem === "imperial") {
      weightKg = weightKg * 0.453592;
      heightM = heightM * 0.0254;
    } else {
      heightM = heightM / 100;
    }

    const bmi = weightKg / (heightM * heightM);

    let category: string;
    let position: number;

    if (bmi < 18.5) {
      category = "underweight";
      position = (bmi / 18.5) * 25;
    } else if (bmi < 25) {
      category = "normal";
      position = 25 + ((bmi - 18.5) / (25 - 18.5)) * 25;
    } else if (bmi < 30) {
      category = "overweight";
      position = 50 + ((bmi - 25) / (30 - 25)) * 25;
    } else {
      category = "obese";
      position = Math.min(75 + ((bmi - 30) / 10) * 25, 100);
    }

    return { bmi, category, position };
  };

  const result = calc();

  const copy = useCallback((val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Unit Toggle */}
      <div className="flex gap-2">
        {(["metric", "imperial"] as UnitSystem[]).map((u) => (
          <button
            key={u}
            onClick={() => { setUnitSystem(u); setWeight(""); setHeight(""); }}
            className={`flex-1 rounded-xl px-4 py-3 font-medium transition-colors ${
              unitSystem === u ? "bg-primary text-primary-foreground" : "border bg-muted/50 hover:bg-muted"
            }`}
          >
            {t(u)}
          </button>
        ))}
      </div>

      {/* Input Section */}
      <div className="rounded-xl border bg-muted/50 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("weight")} ({unitSystem === "metric" ? "kg" : "lbs"})
            </label>
            <input
              type="number"
              step="any"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border bg-background px-4 py-3 text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("height")} ({unitSystem === "metric" ? "cm" : "in"})
            </label>
            <input
              type="number"
              step="any"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border bg-background px-4 py-3 text-lg"
            />
          </div>
        </div>

        <button
          onClick={() => { setWeight(""); setHeight(""); }}
          className="rounded-xl border bg-background px-6 py-3 font-medium hover:bg-muted"
        >
          {t("reset")}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-xl border bg-muted/50 p-6 space-y-6">
          <div
            className="cursor-pointer transition-colors hover:border-primary/30"
            onClick={() => copy(result.bmi.toFixed(1), "bmi")}
          >
            <div className="text-sm text-muted-foreground">{t("yourBMI")}</div>
            <p className="text-4xl font-bold">{result.bmi.toFixed(1)}</p>
            <p className="text-xl font-semibold text-primary">{t(result.category)}</p>
            <div className="mt-1 h-4 text-xs text-primary">{copied === "bmi" ? "✓" : ""}</div>
          </div>

          {/* BMI Scale */}
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">{t("bmiScale")}</div>
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
  );
}
