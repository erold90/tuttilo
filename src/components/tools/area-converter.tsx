"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const units = [
  { id: "sqmm", factor: 0.000001 },
  { id: "sqcm", factor: 0.0001 },
  { id: "sqm", factor: 1 },
  { id: "ha", factor: 10000 },
  { id: "sqkm", factor: 1000000 },
  { id: "sqin", factor: 0.00064516 },
  { id: "sqft", factor: 0.092903 },
  { id: "sqyd", factor: 0.836127 },
  { id: "ac", factor: 4046.86 },
  { id: "sqmi", factor: 2589988 },
];

export default function AreaConverter() {
  const t = useTranslations("tools.area-converter.ui");

  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("sqm");
  const [toUnit, setToUnit] = useState("sqft");

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
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-lg" placeholder="0" />
          <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3">
            {units.map((u) => <option key={u.id} value={u.id}>{t(u.id)}</option>)}
          </select>
        </div>
        <button onClick={swap} className="rounded-xl border bg-muted/50 p-3 hover:bg-muted self-center">⇄</button>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("to")}</label>
          <div className="w-full rounded-xl border bg-primary/10 px-4 py-3 text-lg font-bold text-primary">
            {input ? result.toLocaleString(undefined, { maximumFractionDigits: 8 }) : "0"}
          </div>
          <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3">
            {units.map((u) => <option key={u.id} value={u.id}>{t(u.id)}</option>)}
          </select>
        </div>
      </div>
      {input > 0 && (
        <div className="rounded-xl border bg-muted/50 p-4">
          <div className="text-sm font-medium mb-3">{t("allConversions")}</div>
          <div className="grid gap-2 sm:grid-cols-3">
            {units.filter((u) => u.id !== fromUnit).map((u) => (
              <div key={u.id} className="flex justify-between rounded-lg bg-background px-3 py-2 text-sm">
                <span className="text-muted-foreground">{t(u.id)}</span>
                <span className="font-medium">{(input * (from.factor / u.factor)).toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
