"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type TempUnit = "c" | "f" | "k";

function convert(value: number, from: TempUnit, to: TempUnit): number {
  // Convert to Celsius first
  let c: number;
  if (from === "c") c = value;
  else if (from === "f") c = (value - 32) * (5 / 9);
  else c = value - 273.15;

  // Convert from Celsius to target
  if (to === "c") return c;
  if (to === "f") return c * (9 / 5) + 32;
  return c + 273.15;
}

export default function TemperatureConverter() {
  const t = useTranslations("tools.temperature-converter.ui");

  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState<TempUnit>("c");
  const [toUnit, setToUnit] = useState<TempUnit>("f");

  const tempUnits: TempUnit[] = ["c", "f", "k"];
  const input = parseFloat(value);
  const hasInput = !isNaN(input);

  const swap = () => { setFromUnit(toUnit); setToUnit(fromUnit); };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("from")}</label>
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-lg" placeholder="0" />
          <div className="flex gap-2">
            {tempUnits.map((u) => (
              <button key={u} onClick={() => setFromUnit(u)}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  fromUnit === u ? "bg-primary text-primary-foreground" : "border bg-muted/50 hover:bg-muted"
                }`}>{t(u)}</button>
            ))}
          </div>
        </div>
        <button onClick={swap} className="rounded-xl border bg-muted/50 p-3 hover:bg-muted self-center">⇄</button>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("to")}</label>
          <div className="w-full rounded-xl border bg-primary/10 px-4 py-3 text-lg font-bold text-primary">
            {hasInput ? convert(input, fromUnit, toUnit).toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0"}
          </div>
          <div className="flex gap-2">
            {tempUnits.map((u) => (
              <button key={u} onClick={() => setToUnit(u)}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  toUnit === u ? "bg-primary text-primary-foreground" : "border bg-muted/50 hover:bg-muted"
                }`}>{t(u)}</button>
            ))}
          </div>
        </div>
      </div>

      {hasInput && (
        <div className="grid gap-4 sm:grid-cols-3">
          {tempUnits.map((u) => (
            <div key={u} className="rounded-xl border bg-muted/50 p-5 text-center">
              <div className="text-xs text-muted-foreground">{t(u)}</div>
              <div className="mt-1 text-2xl font-bold">
                {convert(input, fromUnit, u).toLocaleString(undefined, { maximumFractionDigits: 2 })}°
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
