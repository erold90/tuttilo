"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type System = "us_m" | "us_w" | "uk" | "eu" | "cm";

// US Men's size to cm (foot length)
const usMenToCm: Record<number, number> = {
  6: 24.1, 6.5: 24.4, 7: 24.8, 7.5: 25.1, 8: 25.4, 8.5: 25.7,
  9: 26, 9.5: 26.4, 10: 26.7, 10.5: 27, 11: 27.3, 11.5: 27.6,
  12: 27.9, 12.5: 28.3, 13: 28.6, 14: 29.2, 15: 29.8,
};

function convertFromCm(cm: number): { us_m: number; us_w: number; uk: number; eu: number; cm: number } {
  // Approximate formulas
  const us_m = (cm - 22.5) / 0.846;
  const us_w = us_m + 1.5;
  const uk = us_m - 0.5;
  const eu = cm * 1.5 + 2;
  return { us_m: Math.round(us_m * 2) / 2, us_w: Math.round(us_w * 2) / 2, uk: Math.round(uk * 2) / 2, eu: Math.round(eu * 2) / 2, cm: Math.round(cm * 10) / 10 };
}

function toCm(val: number, system: System): number {
  if (system === "cm") return val;
  if (system === "us_m") return val * 0.846 + 22.5;
  if (system === "us_w") return (val - 1.5) * 0.846 + 22.5;
  if (system === "uk") return (val + 0.5) * 0.846 + 22.5;
  if (system === "eu") return (val - 2) / 1.5;
  return val;
}

const systems: System[] = ["us_m", "us_w", "uk", "eu", "cm"];

export default function ShoeSizeConverter() {
  const t = useTranslations("tools.shoe-size-converter.ui");
  const [value, setValue] = useState("");
  const [fromSystem, setFromSystem] = useState<System>("us_m");

  const input = parseFloat(value) || 0;
  const cm = toCm(input, fromSystem);
  const results = input > 0 ? convertFromCm(cm) : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("shoeSize")}</label>
          <input type="number" step="0.5" value={value} onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-lg" placeholder="10" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("system")}</label>
          <select value={fromSystem} onChange={(e) => setFromSystem(e.target.value as System)}
            className="w-full rounded-xl border bg-background px-4 py-3">
            {systems.map((s) => <option key={s} value={s}>{t(s)}</option>)}
          </select>
        </div>
      </div>

      {results && (
        <div className="grid gap-4 sm:grid-cols-5">
          {systems.map((s) => (
            <div key={s} className={`rounded-xl border p-5 text-center ${s === fromSystem ? "bg-primary/10 border-primary" : "bg-muted/50"}`}>
              <div className="text-xs text-muted-foreground">{t(s)}</div>
              <div className={`mt-1 text-3xl font-bold ${s === fromSystem ? "text-primary" : ""}`}>
                {results[s]}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
