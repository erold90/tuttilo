"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type MarginMode = "costRevenue" | "costMargin" | "revenueMargin";

export default function ProfitMarginCalculator() {
  const t = useTranslations("tools.profit-margin-calculator.ui");

  const [mode, setMode] = useState<MarginMode>("costRevenue");
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const v1 = parseFloat(value1) || 0;
  const v2 = parseFloat(value2) || 0;

  let cost = 0;
  let revenue = 0;
  let profit = 0;
  let margin = 0;
  let markup = 0;
  const hasResult = v1 > 0 && v2 > 0;

  if (hasResult) {
    switch (mode) {
      case "costRevenue":
        cost = v1;
        revenue = v2;
        profit = revenue - cost;
        margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        markup = cost > 0 ? (profit / cost) * 100 : 0;
        break;
      case "costMargin":
        cost = v1;
        margin = v2;
        revenue = margin < 100 ? cost / (1 - margin / 100) : 0;
        profit = revenue - cost;
        markup = cost > 0 ? (profit / cost) * 100 : 0;
        break;
      case "revenueMargin":
        revenue = v1;
        margin = v2;
        profit = revenue * (margin / 100);
        cost = revenue - profit;
        markup = cost > 0 ? (profit / cost) * 100 : 0;
        break;
    }
  }

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const copy = useCallback((val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  }, []);

  const modes: { key: MarginMode; label1: string; label2: string }[] = [
    { key: "costRevenue", label1: t("cost"), label2: t("revenue") },
    { key: "costMargin", label1: t("cost"), label2: t("targetMargin") },
    { key: "revenueMargin", label1: t("revenue"), label2: t("targetMargin") },
  ];

  const current = modes.find((m) => m.key === mode)!;

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setValue1(""); setValue2(""); }}
            className={`flex-1 min-w-fit rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              mode === m.key ? "bg-primary text-primary-foreground" : "border bg-muted/50 hover:bg-muted"
            }`}
          >
            {t(`mode_${m.key}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{current.label1}</label>
          <input
            type="number"
            step="0.01"
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-base"
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{current.label2}</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
              className={`w-full rounded-xl border bg-background px-4 py-3 text-base ${mode !== "costRevenue" ? "pr-10" : ""}`}
              placeholder="0"
            />
            {mode !== "costRevenue" && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => { setValue1(""); setValue2(""); }}
        className="rounded-xl border bg-muted/50 px-6 py-3 font-medium hover:bg-muted"
      >
        {t("reset")}
      </button>

      {/* Results */}
      {hasResult && (
        <div className="space-y-4">
          <div
            className="cursor-pointer rounded-xl border bg-muted/50 p-6 transition-colors hover:border-primary/30"
            onClick={() => copy(margin.toFixed(2) + "%", "margin")}
          >
            <div className="text-sm text-muted-foreground">{t("profitMargin")}</div>
            <div className="mt-1 text-4xl font-bold text-primary">
              {margin.toFixed(2)}%
            </div>
            <div className="mt-1 h-4 text-xs text-primary">{copied === "margin" ? "✓" : ""}</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              className="cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(cost), "cost")}
            >
              <div className="text-sm text-muted-foreground">{t("cost")}</div>
              <div className="mt-1 text-xl font-semibold">{fmt(cost)}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "cost" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(revenue), "rev")}
            >
              <div className="text-sm text-muted-foreground">{t("revenue")}</div>
              <div className="mt-1 text-xl font-semibold">{fmt(revenue)}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "rev" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(fmt(profit), "profit")}
            >
              <div className="text-sm text-muted-foreground">{t("profit")}</div>
              <div className="mt-1 text-xl font-semibold">{fmt(profit)}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "profit" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
              onClick={() => copy(markup.toFixed(2) + "%", "markup")}
            >
              <div className="text-sm text-muted-foreground">{t("markup")}</div>
              <div className="mt-1 text-xl font-semibold">{markup.toFixed(2)}%</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "markup" ? "✓" : ""}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
