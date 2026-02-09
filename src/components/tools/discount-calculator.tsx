"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function DiscountCalculator() {
  const t = useTranslations("tools.discount-calculator.ui");

  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [secondDiscount, setSecondDiscount] = useState("");
  const [taxRate, setTaxRate] = useState("");

  const original = parseFloat(originalPrice) || 0;
  const discount1 = parseFloat(discountPercent) || 0;
  const discount2 = parseFloat(secondDiscount) || 0;
  const tax = parseFloat(taxRate) || 0;

  const afterFirst = original * (1 - discount1 / 100);
  const afterSecond = discount2 > 0 ? afterFirst * (1 - discount2 / 100) : afterFirst;
  const totalSaved = original - afterSecond;
  const effectiveDiscount = original > 0 ? (totalSaved / original) * 100 : 0;
  const taxAmount = afterSecond * (tax / 100);
  const finalPrice = afterSecond + taxAmount;

  const presets = [10, 15, 20, 25, 30, 40, 50, 60, 70, 75];

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  const reset = () => {
    setOriginalPrice("");
    setDiscountPercent("");
    setSecondDiscount("");
    setTaxRate("");
  };

  return (
    <div className="space-y-6">
      {/* Original Price */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("originalPrice")}</label>
        <input
          type="number"
          step="0.01"
          value={originalPrice}
          onChange={(e) => setOriginalPrice(e.target.value)}
          className="w-full rounded-xl border bg-background px-4 py-3 text-lg"
          placeholder="0.00"
        />
      </div>

      {/* Discount Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("discountPercent")}</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setDiscountPercent(String(p))}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                discountPercent === String(p)
                  ? "bg-primary text-primary-foreground"
                  : "border bg-muted/50 hover:bg-muted"
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
        <input
          type="number"
          step="0.1"
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
          className="mt-2 w-full max-w-xs rounded-xl border bg-background px-4 py-2 text-base"
          placeholder={t("customDiscount")}
        />
      </div>

      {/* Second Discount (stacked) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t("secondDiscount")} ({t("optional")})
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.1"
            value={secondDiscount}
            onChange={(e) => setSecondDiscount(e.target.value)}
            className="w-full max-w-xs rounded-xl border bg-background px-4 py-2 pr-10 text-base"
            placeholder={t("stackedDiscountPlaceholder")}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
        </div>
      </div>

      {/* Tax Rate */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t("salesTax")} ({t("optional")})
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.1"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            className="w-full max-w-xs rounded-xl border bg-background px-4 py-2 pr-10 text-base"
            placeholder="0"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
        </div>
      </div>

      <button
        onClick={reset}
        className="rounded-xl border bg-muted/50 px-6 py-3 font-medium hover:bg-muted"
      >
        {t("reset")}
      </button>

      {/* Results */}
      {original > 0 && discount1 > 0 && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/50 p-6">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl text-muted-foreground line-through">{fmt(original)}</span>
              <span className="text-4xl font-bold text-green-600">{fmt(tax > 0 ? finalPrice : afterSecond)}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("youSave")}</div>
              <div className="mt-1 text-2xl font-semibold text-red-500">{fmt(totalSaved)}</div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <div className="text-sm text-muted-foreground">{t("effectiveDiscount")}</div>
              <div className="mt-1 text-2xl font-semibold">{effectiveDiscount.toFixed(1)}%</div>
            </div>
            {tax > 0 && (
              <div className="rounded-xl border bg-background p-4">
                <div className="text-sm text-muted-foreground">{t("taxAmount")}</div>
                <div className="mt-1 text-2xl font-semibold">{fmt(taxAmount)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
