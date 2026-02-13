"use client";

import { useState, useCallback, useMemo } from "react";

interface Unit {
  id: string;
  factor: number;
  symbol?: string;
}

interface FactorConverterProps {
  units: Unit[];
  defaultFrom: string;
  defaultTo: string;
  t: (key: string) => string;
  maxFractionDigits?: number;
}

function smartFormat(value: number, maxDigits = 8): string {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e12) return value.toExponential(4);
  if (abs >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (abs >= 1) return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
  if (abs >= 0.001) return value.toLocaleString(undefined, { maximumFractionDigits: maxDigits });
  return value.toExponential(4);
}

export function FactorConverter({ units, defaultFrom, defaultTo, t, maxFractionDigits = 8 }: FactorConverterProps) {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState(defaultFrom);
  const [toUnit, setToUnit] = useState(defaultTo);
  const [copied, setCopied] = useState<string | null>(null);

  const from = units.find((u) => u.id === fromUnit)!;
  const to = units.find((u) => u.id === toUnit)!;
  const input = parseFloat(value) || 0;
  const result = input * (from.factor / to.factor);

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const copyValue = useCallback((val: string, id: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  const allConversions = useMemo(() => {
    if (!input) return [];
    return units
      .filter((u) => u.id !== fromUnit)
      .map((u) => ({
        id: u.id,
        value: input * (from.factor / u.factor),
        symbol: u.symbol,
      }));
  }, [input, fromUnit, from.factor, units]);

  const resultStr = input ? smartFormat(result, maxFractionDigits) : "0";

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
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {t(u.id)} {u.symbol ? `(${u.symbol})` : ""}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={swap}
          className="rounded-xl border bg-muted/50 p-3 hover:bg-muted self-center transition-colors"
          aria-label="Swap units"
        >
          ⇄
        </button>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("to")}</label>
          <button
            onClick={() => copyValue(result.toString(), "main")}
            className="w-full rounded-xl border bg-primary/10 px-4 py-3 text-lg font-bold text-primary text-left hover:bg-primary/15 transition-colors cursor-pointer relative group"
          >
            {resultStr}
            {to.symbol && <span className="text-sm font-normal ml-1 text-primary/60">{to.symbol}</span>}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity">
              {copied === "main" ? "✓" : "copy"}
            </span>
          </button>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {t(u.id)} {u.symbol ? `(${u.symbol})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* All conversions grid */}
      {input !== 0 && allConversions.length > 0 && (
        <div className="rounded-xl border bg-muted/50 p-4">
          <div className="text-sm font-medium mb-3">{t("allConversions")}</div>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {allConversions.map((c) => {
              const formatted = smartFormat(c.value, 6);
              return (
                <button
                  key={c.id}
                  onClick={() => copyValue(c.value.toString(), c.id)}
                  className="flex justify-between items-center rounded-lg bg-background px-3 py-2 text-sm hover:bg-background/80 transition-colors cursor-pointer text-left"
                >
                  <span className="text-muted-foreground">{t(c.id)}</span>
                  <span className="font-medium font-mono tabular-nums">
                    {formatted}
                    {c.symbol && <span className="text-muted-foreground/60 ml-1 font-sans text-xs">{c.symbol}</span>}
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
