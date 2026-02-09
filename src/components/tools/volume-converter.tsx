"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const units = [
  { id: "ml", factor: 0.000001 },
  { id: "l", factor: 0.001 },
  { id: "m3", factor: 1 },
  { id: "tsp", factor: 0.00000492892 },
  { id: "tbsp", factor: 0.0000147868 },
  { id: "floz", factor: 0.0000295735 },
  { id: "cup", factor: 0.000236588 },
  { id: "pt", factor: 0.000473176 },
  { id: "qt", factor: 0.000946353 },
  { id: "gal", factor: 0.00378541 },
];

export default function VolumeConverter() {
  const t = useTranslations("tools.volume-converter.ui");
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("l");
  const [toUnit, setToUnit] = useState("gal");

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
          <div className="w-full rounded-xl border bg-primary/10 px-4 py-3 text-lg font-bold text-primary">{input ? result.toLocaleString(undefined, { maximumFractionDigits: 8 }) : "0"}</div>
          <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="w-full rounded-xl border bg-background px-4 py-3">
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
