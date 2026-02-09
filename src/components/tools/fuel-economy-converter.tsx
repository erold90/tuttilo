"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// All stored as km/L internally
const units = [
  { id: "kml", factor: 1 },
  { id: "mpg", factor: 0.425144 },
  { id: "mpgimp", factor: 0.354006 },
  { id: "l100km", factor: -1 }, // inverse relationship
];

function convert(val: number, fromId: string, toId: string): number {
  if (val <= 0) return 0;
  // Convert to km/L first
  let kml: number;
  if (fromId === "l100km") kml = 100 / val;
  else kml = val * (units.find((u) => u.id === fromId)?.factor || 1);

  // Convert from km/L to target
  if (toId === "l100km") return 100 / kml;
  return kml / (units.find((u) => u.id === toId)?.factor || 1);
}

export default function FuelEconomyConverter() {
  const t = useTranslations("tools.fuel-economy-converter.ui");
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("mpg");
  const [toUnit, setToUnit] = useState("l100km");

  const input = parseFloat(value) || 0;
  const result = convert(input, fromUnit, toUnit);
  const swap = () => { setFromUnit(toUnit); setToUnit(fromUnit); };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("from")}</label>
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-xl border bg-background px-4 py-3 text-lg" placeholder="0" />
          <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="w-full rounded-xl border bg-background px-4 py-3">
            {units.map((u) => <option key={u.id} value={u.id}>{t(u.id)}</option>)}
          </select>
        </div>
        <button onClick={swap} className="rounded-xl border bg-muted/50 p-3 hover:bg-muted self-center">⇄</button>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("to")}</label>
          <div className="w-full rounded-xl border bg-primary/10 px-4 py-3 text-lg font-bold text-primary">{input > 0 ? result.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0"}</div>
          <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="w-full rounded-xl border bg-background px-4 py-3">
            {units.map((u) => <option key={u.id} value={u.id}>{t(u.id)}</option>)}
          </select>
        </div>
      </div>
      {input > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {units.map((u) => (
            <div key={u.id} className="rounded-xl border bg-muted/50 p-4 text-center">
              <div className="text-xs text-muted-foreground">{t(u.id)}</div>
              <div className="mt-1 text-2xl font-bold">{convert(input, fromUnit, u.id).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
