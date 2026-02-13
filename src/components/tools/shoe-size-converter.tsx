"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type System = "us_m" | "us_w" | "uk" | "eu" | "cm";

function convertFromCm(cm: number): Record<System, number> {
  const us_m = (cm - 22.5) / 0.846;
  const us_w = us_m + 1.5;
  const uk = us_m - 0.5;
  const eu = cm * 1.5 + 2;
  return {
    us_m: Math.round(us_m * 2) / 2,
    us_w: Math.round(us_w * 2) / 2,
    uk: Math.round(uk * 2) / 2,
    eu: Math.round(eu * 2) / 2,
    cm: Math.round(cm * 10) / 10,
  };
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
  const [copied, setCopied] = useState<string | null>(null);

  const input = parseFloat(value) || 0;
  const cm = toCm(input, fromSystem);
  const results = input > 0 ? convertFromCm(cm) : null;

  const copyValue = useCallback((val: string, id: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("shoeSize")}</label>
          <input
            type="number"
            step="0.5"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3 text-lg"
            placeholder="10"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("system")}</label>
          <select
            value={fromSystem}
            onChange={(e) => setFromSystem(e.target.value as System)}
            className="w-full rounded-xl border bg-background px-4 py-3"
          >
            {systems.map((s) => (
              <option key={s} value={s}>{t(s)}</option>
            ))}
          </select>
        </div>
      </div>

      {results && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {systems.map((s) => (
            <button
              key={s}
              onClick={() => copyValue(String(results[s]), s)}
              className={`rounded-xl border p-5 text-center transition-colors cursor-pointer relative group ${
                s === fromSystem ? "bg-primary/10 border-primary" : "bg-muted/50 hover:bg-muted/70"
              }`}
            >
              <div className="text-xs text-muted-foreground">{t(s)}</div>
              <div className={`mt-1 text-3xl font-bold ${s === fromSystem ? "text-primary" : ""}`}>
                {results[s]}
              </div>
              {copied === s && <span className="absolute top-2 right-2 text-xs text-green-500">✓</span>}
            </button>
          ))}
        </div>
      )}

      {/* Measurement guide */}
      <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground/60 text-center">
        {t("measureTip")}
      </div>
    </div>
  );
}
