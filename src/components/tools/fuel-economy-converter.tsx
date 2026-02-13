"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

const units = [
  { id: "kml", symbol: "km/L" },
  { id: "mpg", symbol: "mpg (US)" },
  { id: "mpgimp", symbol: "mpg (UK)" },
  { id: "l100km", symbol: "L/100km" },
];

// Factors to convert TO km/L
const TO_KML: Record<string, (v: number) => number> = {
  kml: (v) => v,
  mpg: (v) => v * 0.425144,
  mpgimp: (v) => v * 0.354006,
  l100km: (v) => (v > 0 ? 100 / v : 0),
};

// Factors to convert FROM km/L
const FROM_KML: Record<string, (kml: number) => number> = {
  kml: (kml) => kml,
  mpg: (kml) => kml / 0.425144,
  mpgimp: (kml) => kml / 0.354006,
  l100km: (kml) => (kml > 0 ? 100 / kml : 0),
};

function convert(val: number, fromId: string, toId: string): number {
  if (val <= 0) return 0;
  const kml = TO_KML[fromId](val);
  return FROM_KML[toId](kml);
}

function smartFormat(value: number): string {
  if (value === 0) return "0";
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function FuelEconomyConverter() {
  const t = useTranslations("tools.fuel-economy-converter.ui");
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("mpg");
  const [toUnit, setToUnit] = useState("l100km");
  const [copied, setCopied] = useState<string | null>(null);

  const input = parseFloat(value) || 0;
  const result = convert(input, fromUnit, toUnit);
  const swap = () => { setFromUnit(toUnit); setToUnit(fromUnit); };

  const copyValue = useCallback((val: string, id: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  const toSymbol = units.find((u) => u.id === toUnit)?.symbol || "";

  const allConversions = useMemo(() => {
    if (input <= 0) return [];
    return units.map((u) => ({
      id: u.id,
      value: convert(input, fromUnit, u.id),
      symbol: u.symbol,
    }));
  }, [input, fromUnit]);

  return (
    <div className="space-y-6">
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
              <option key={u.id} value={u.id}>{t(u.id)} ({u.symbol})</option>
            ))}
          </select>
        </div>
        <button onClick={swap} className="rounded-xl border bg-muted/50 p-3 hover:bg-muted self-center transition-colors" aria-label="Swap units">
          ⇄
        </button>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("to")}</label>
          <button
            onClick={() => copyValue(result.toString(), "main")}
            className="w-full rounded-xl border bg-primary/10 px-4 py-3 text-lg font-bold text-primary text-left hover:bg-primary/15 transition-colors cursor-pointer relative group"
          >
            {input > 0 ? smartFormat(result) : "0"}
            <span className="text-sm font-normal ml-1 text-primary/60">{toSymbol}</span>
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
              <option key={u.id} value={u.id}>{t(u.id)} ({u.symbol})</option>
            ))}
          </select>
        </div>
      </div>

      {input > 0 && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {allConversions.map((c) => (
            <button
              key={c.id}
              onClick={() => copyValue(c.value.toString(), c.id)}
              className="rounded-xl border bg-muted/50 p-4 text-center hover:bg-muted/70 transition-colors cursor-pointer relative group"
            >
              <div className="text-xs text-muted-foreground">{t(c.id)}</div>
              <div className="mt-1 text-2xl font-bold">{smartFormat(c.value)}</div>
              <div className="text-xs text-muted-foreground/60">{c.symbol}</div>
              {copied === c.id && <span className="absolute top-2 right-2 text-xs text-green-500">✓</span>}
            </button>
          ))}
        </div>
      )}

      {/* Formula note */}
      <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground/60 text-center">
        L/100km = 235.215 / mpg (US) &nbsp;|&nbsp; 1 mpg (US) = 0.833 mpg (UK)
      </div>
    </div>
  );
}
