"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type CalculationMode = "percentOf" | "whatPercent" | "percentChange";

export default function PercentageCalculator() {
  const t = useTranslations("tools.percentage-calculator.ui");
  const [mode, setMode] = useState<CalculationMode>("percentOf");
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const num1 = parseFloat(value1);
  const num2 = parseFloat(value2);
  const hasInputs = !isNaN(num1) && !isNaN(num2);

  let result: number | null = null;
  let error = "";

  if (hasInputs) {
    switch (mode) {
      case "percentOf":
        result = (num1 / 100) * num2;
        break;
      case "whatPercent":
        if (num2 === 0) error = t("divisionByZero");
        else result = (num1 / num2) * 100;
        break;
      case "percentChange":
        if (num1 === 0) error = t("divisionByZero");
        else result = ((num2 - num1) / num1) * 100;
        break;
    }
  }

  const copy = useCallback((val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Mode Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["percentOf", "whatPercent", "percentChange"] as CalculationMode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setValue1(""); setValue2(""); }}
            className={`flex-1 min-w-fit rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              mode === m ? "bg-primary text-primary-foreground" : "border bg-muted/50 hover:bg-muted"
            }`}
          >
            {t(`mode${m.charAt(0).toUpperCase() + m.slice(1)}` as "modePercentOf" | "modeWhatPercent" | "modePercentChange")}
          </button>
        ))}
      </div>

      {/* Input Section */}
      <div className="rounded-xl border bg-muted/50 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {mode === "percentOf" && t("percentage")}
              {mode === "whatPercent" && t("value")}
              {mode === "percentChange" && t("initialValue")}
            </label>
            <input
              type="number"
              step="any"
              value={value1}
              onChange={(e) => setValue1(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border bg-background px-4 py-3 text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {mode === "percentOf" && t("ofValue")}
              {mode === "whatPercent" && t("ofValue")}
              {mode === "percentChange" && t("finalValue")}
            </label>
            <input
              type="number"
              step="any"
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border bg-background px-4 py-3 text-lg"
            />
          </div>
        </div>

        <button
          onClick={() => { setValue1(""); setValue2(""); }}
          className="rounded-xl border bg-background px-6 py-3 font-medium hover:bg-muted"
        >
          {t("reset")}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Result */}
      {result !== null && !error && (
        <div
          className="cursor-pointer rounded-xl border bg-muted/50 p-6 transition-colors hover:border-primary/30"
          onClick={() => copy(result!.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + (mode !== "percentOf" ? "%" : ""), "result")}
        >
          <div className="text-sm text-muted-foreground">{t("result")}</div>
          <p className="mt-1 text-3xl font-bold">
            {result.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
            {mode !== "percentOf" && "%"}
          </p>
          <div className="mt-1 h-4 text-xs text-primary">{copied === "result" ? "✓" : ""}</div>
        </div>
      )}
    </div>
  );
}
