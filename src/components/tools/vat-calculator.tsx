"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type VatMode = "addVat" | "removeVat" | "vatAmount";

const commonRates = [5, 7, 10, 13, 19, 20, 21, 22, 23, 25];

export default function VatCalculator() {
  const t = useTranslations("tools.vat-calculator.ui");

  const [mode, setMode] = useState<VatMode>("addVat");
  const [amount, setAmount] = useState("");
  const [vatRate, setVatRate] = useState("20");
  const [customRate, setCustomRate] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const amountNum = parseFloat(amount) || 0;
  const rate = customRate ? parseFloat(customRate) || 0 : parseFloat(vatRate) || 0;

  let netAmount = 0;
  let vatAmount = 0;
  let grossAmount = 0;

  if (amountNum > 0) {
    switch (mode) {
      case "addVat":
        netAmount = amountNum;
        vatAmount = amountNum * (rate / 100);
        grossAmount = amountNum + vatAmount;
        break;
      case "removeVat":
        grossAmount = amountNum;
        netAmount = amountNum / (1 + rate / 100);
        vatAmount = grossAmount - netAmount;
        break;
      case "vatAmount":
        netAmount = amountNum;
        vatAmount = amountNum * (rate / 100);
        grossAmount = amountNum + vatAmount;
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

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["addVat", "removeVat", "vatAmount"] as VatMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 min-w-fit rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              mode === m ? "bg-primary text-primary-foreground" : "border bg-muted/50 hover:bg-muted"
            }`}
          >
            {t(m)}
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("amount")}</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border bg-background px-4 py-3 text-lg"
          placeholder="0.00"
        />
      </div>

      {/* VAT Rate Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("vatRate")}</label>
        <div className="flex flex-wrap gap-2">
          {commonRates.map((r) => (
            <button
              key={r}
              onClick={() => { setVatRate(String(r)); setCustomRate(""); }}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                !customRate && vatRate === String(r)
                  ? "bg-primary text-primary-foreground"
                  : "border bg-muted/50 hover:bg-muted"
              }`}
            >
              {r}%
            </button>
          ))}
        </div>
        <div className="mt-2">
          <label className="text-xs text-muted-foreground">{t("customRate")}</label>
          <div className="relative mt-1">
            <input
              type="number"
              step="0.1"
              value={customRate}
              onChange={(e) => setCustomRate(e.target.value)}
              className="w-full max-w-xs rounded-xl border bg-background px-4 py-2 pr-10 text-base"
              placeholder={t("customPlaceholder")}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => { setAmount(""); setVatRate("20"); setCustomRate(""); }}
        className="rounded-xl border bg-muted/50 px-6 py-3 font-medium hover:bg-muted"
      >
        {t("reset")}
      </button>

      {/* Results */}
      {amountNum > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div
            className="cursor-pointer rounded-xl border bg-background p-5 transition-colors hover:border-primary/30"
            onClick={() => copy(fmt(netAmount), "net")}
          >
            <div className="text-sm text-muted-foreground">{t("netAmount")}</div>
            <div className="mt-1 text-2xl font-bold">{fmt(netAmount)}</div>
            <div className="mt-1 h-4 text-xs text-primary">{copied === "net" ? "✓" : ""}</div>
          </div>
          <div
            className="cursor-pointer rounded-xl border bg-muted/50 p-5 transition-colors hover:border-primary/30"
            onClick={() => copy(fmt(vatAmount), "vat")}
          >
            <div className="text-sm text-muted-foreground">
              {t("vatAmountLabel")} ({rate}%)
            </div>
            <div className="mt-1 text-2xl font-bold text-primary">{fmt(vatAmount)}</div>
            <div className="mt-1 h-4 text-xs text-primary">{copied === "vat" ? "✓" : ""}</div>
          </div>
          <div
            className="cursor-pointer rounded-xl border bg-background p-5 transition-colors hover:border-primary/30"
            onClick={() => copy(fmt(grossAmount), "gross")}
          >
            <div className="text-sm text-muted-foreground">{t("grossAmount")}</div>
            <div className="mt-1 text-2xl font-bold">{fmt(grossAmount)}</div>
            <div className="mt-1 h-4 text-xs text-primary">{copied === "gross" ? "✓" : ""}</div>
          </div>
        </div>
      )}
    </div>
  );
}
