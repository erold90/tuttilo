"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const units = [
  { id: "ms", factor: 1 },
  { id: "kmh", factor: 0.277778 },
  { id: "mph", factor: 0.44704 },
  { id: "kn", factor: 0.514444 },
  { id: "fts", factor: 0.3048 },
  { id: "mach", factor: 343 },
];

export default function SpeedConverter() {
  const t = useTranslations("tools.speed-converter.ui");
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("kmh");
  const [toUnit, setToUnit] = useState("mph");

  const from = units.find((u) => u.id === fromUnit)!;
  const to = units.find((u) => u.id === toUnit)!;
  const input = parseFloat(value) || 0;
  const result = input * (from.factor / to.factor);
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
          <div className="w-full rounded-xl border bg-primary/10 px-4 py-3 text-lg font-bold text-primary">{input ? result.toLocaleString(undefined, { maximumFractionDigits: 6 }) : "0"}</div>
          <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="w-full rounded-xl border bg-background px-4 py-3">
            {units.map((u) => <option key={u.id} value={u.id}>{t(u.id)}</option>)}
          </select>
        </div>
      </div>
      {input > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {units.filter((u) => u.id !== fromUnit).map((u) => (
            <div key={u.id} className="rounded-xl border bg-muted/50 p-4 text-center">
              <div className="text-xs text-muted-foreground">{t(u.id)}</div>
              <div className="mt-1 text-2xl font-bold">{(input * (from.factor / u.factor)).toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
