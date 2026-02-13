"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface Rates {
  [key: string]: number;
}

const CURRENCIES = [
  { id: "USD", symbol: "$" },
  { id: "EUR", symbol: "\u20AC" },
  { id: "GBP", symbol: "\u00A3" },
  { id: "JPY", symbol: "\u00A5" },
  { id: "CHF", symbol: "CHF" },
  { id: "CAD", symbol: "C$" },
  { id: "AUD", symbol: "A$" },
  { id: "CNY", symbol: "\u00A5" },
  { id: "INR", symbol: "\u20B9" },
  { id: "BRL", symbol: "R$" },
  { id: "KRW", symbol: "\u20A9" },
  { id: "MXN", symbol: "MX$" },
  { id: "SEK", symbol: "kr" },
  { id: "NOK", symbol: "kr" },
  { id: "DKK", symbol: "kr" },
  { id: "PLN", symbol: "z\u0142" },
  { id: "CZK", symbol: "K\u010D" },
  { id: "HUF", symbol: "Ft" },
  { id: "TRY", symbol: "\u20BA" },
  { id: "ZAR", symbol: "R" },
  { id: "SGD", symbol: "S$" },
  { id: "HKD", symbol: "HK$" },
  { id: "NZD", symbol: "NZ$" },
  { id: "THB", symbol: "\u0E3F" },
  { id: "ILS", symbol: "\u20AA" },
  { id: "AED", symbol: "AED" },
  { id: "SAR", symbol: "SAR" },
  { id: "TWD", symbol: "NT$" },
  { id: "ARS", symbol: "AR$" },
  { id: "CLP", symbol: "CL$" },
];

// Fallback rates (EUR-based) - used only if API fails
const FALLBACK_RATES: Rates = {
  USD: 1.08, EUR: 1, GBP: 0.86, JPY: 162.5, CHF: 0.95, CAD: 1.47,
  AUD: 1.66, CNY: 7.82, INR: 90.1, BRL: 5.35, KRW: 1420, MXN: 18.5,
  SEK: 11.2, NOK: 11.4, DKK: 7.46, PLN: 4.32, CZK: 25.2, HUF: 390,
  TRY: 33.5, ZAR: 19.8, SGD: 1.45, HKD: 8.45, NZD: 1.78, THB: 38.2,
  ILS: 3.95, AED: 3.97, SAR: 4.05, TWD: 34.2, ARS: 920, CLP: 980,
};

const API_URL = "https://api.frankfurter.app/latest?from=EUR";

export default function CurrencyConverter() {
  const t = useTranslations("tools.currency-converter.ui");
  const [value, setValue] = useState("");
  const [fromCurr, setFromCurr] = useState("USD");
  const [toCurr, setToCurr] = useState("EUR");
  const [rates, setRates] = useState<Rates>(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const fetched = useRef(false);

  // Fetch live rates on mount
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    setLoading(true);
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => {
        if (data.rates) {
          const r: Rates = { EUR: 1, ...data.rates };
          setRates(r);
          setLastUpdate(data.date || new Date().toISOString().slice(0, 10));
        }
      })
      .catch(() => {
        // Use fallback rates
        setLastUpdate("offline");
      })
      .finally(() => setLoading(false));
  }, []);

  const input = parseFloat(value) || 0;

  const convertAmount = useCallback(
    (amount: number, from: string, to: string): number => {
      if (amount === 0) return 0;
      const fromRate = rates[from] || 1;
      const toRate = rates[to] || 1;
      // Convert: amount in FROM → EUR → TO
      return (amount / fromRate) * toRate;
    },
    [rates]
  );

  const result = convertAmount(input, fromCurr, toCurr);

  const swap = () => {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
  };

  const copyValue = useCallback((val: string, id: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  const formatCurrency = (amount: number, curr: string): string => {
    if (amount === 0) return "0";
    const c = CURRENCIES.find((cc) => cc.id === curr);
    // No-fraction currencies
    const noFrac = ["JPY", "KRW", "HUF", "CLP", "ARS"].includes(curr);
    const formatted = amount.toLocaleString(undefined, {
      minimumFractionDigits: noFrac ? 0 : 2,
      maximumFractionDigits: noFrac ? 0 : 2,
    });
    return c ? `${c.symbol} ${formatted}` : formatted;
  };

  // Popular conversions for the selected from currency
  const popularTo = CURRENCIES.filter((c) => c.id !== fromCurr).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Main converter */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("from")}</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-lg"
            placeholder="0"
          />
          <select
            value={fromCurr}
            onChange={(e) => setFromCurr(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3"
          >
            {CURRENCIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={swap}
          className="rounded-xl border bg-muted/50 p-3 hover:bg-muted self-center transition-colors"
          aria-label="Swap currencies"
        >
          ⇄
        </button>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("to")}</label>
          <button
            onClick={() => copyValue(result.toFixed(2), "main")}
            className="w-full rounded-xl border bg-primary/10 px-4 py-3 text-lg font-bold text-primary text-left hover:bg-primary/15 transition-colors cursor-pointer relative group"
          >
            {input ? formatCurrency(result, toCurr) : "0"}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity">
              {copied === "main" ? "✓" : "copy"}
            </span>
          </button>
          <select
            value={toCurr}
            onChange={(e) => setToCurr(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3"
          >
            {CURRENCIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Exchange rate info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground/60">
        <span>
          1 {fromCurr} = {convertAmount(1, fromCurr, toCurr).toLocaleString(undefined, { maximumFractionDigits: 4 })} {toCurr}
        </span>
        <span>
          {loading ? t("loading") : lastUpdate === "offline" ? t("offline") : `${t("updated")} ${lastUpdate}`}
        </span>
      </div>

      {/* Popular conversions */}
      {input > 0 && (
        <div className="rounded-xl border bg-muted/50 p-4">
          <div className="text-sm font-medium mb-3">{t("allConversions")}</div>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {popularTo.map((c) => {
              const val = convertAmount(input, fromCurr, c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => copyValue(val.toFixed(2), c.id)}
                  className="flex justify-between items-center rounded-lg bg-background px-3 py-2 text-sm hover:bg-background/80 transition-colors cursor-pointer"
                >
                  <span className="text-muted-foreground font-medium">{c.id}</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(val, c.id)}
                    {copied === c.id && <span className="ml-1 text-green-500 text-xs">✓</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
