"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type TempUnit = "c" | "f" | "k";

function convert(value: number, from: TempUnit, to: TempUnit): number {
  let c: number;
  if (from === "c") c = value;
  else if (from === "f") c = (value - 32) * (5 / 9);
  else c = value - 273.15;

  if (to === "c") return c;
  if (to === "f") return c * (9 / 5) + 32;
  return c + 273.15;
}

const REFERENCES = [
  { c: -273.15, key: "absZero" },
  { c: -40, key: "equal" },
  { c: 0, key: "freeze" },
  { c: 37, key: "body" },
  { c: 100, key: "boil" },
];

export default function TemperatureConverter() {
  const t = useTranslations("tools.temperature-converter.ui");
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState<TempUnit>("c");
  const [toUnit, setToUnit] = useState<TempUnit>("f");
  const [copied, setCopied] = useState<string | null>(null);

  const tempUnits: TempUnit[] = ["c", "f", "k"];
  const input = parseFloat(value);
  const hasInput = !isNaN(input);

  const swap = () => { setFromUnit(toUnit); setToUnit(fromUnit); };

  const kelvinWarning = hasInput && fromUnit === "k" && input < 0;

  const copyValue = useCallback((val: string, id: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  const resultVal = hasInput ? convert(input, fromUnit, toUnit) : 0;
  const resultStr = hasInput ? resultVal.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0";

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
          <div className="flex gap-2">
            {tempUnits.map((u) => (
              <button
                key={u}
                onClick={() => setFromUnit(u)}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  fromUnit === u
                    ? "bg-primary text-primary-foreground"
                    : "border bg-muted/50 hover:bg-muted"
                }`}
              >
                {t(u)}
              </button>
            ))}
          </div>
        </div>

        <button onClick={swap} className="rounded-xl border bg-muted/50 p-3 hover:bg-muted self-center transition-colors" aria-label="Swap units">
          ⇄
        </button>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("to")}</label>
          <button
            onClick={() => copyValue(resultVal.toString(), "main")}
            className="w-full rounded-xl border bg-primary/10 px-4 py-3 text-lg font-bold text-primary text-left hover:bg-primary/15 transition-colors cursor-pointer relative group"
          >
            {resultStr}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity">
              {copied === "main" ? "✓" : "copy"}
            </span>
          </button>
          <div className="flex gap-2">
            {tempUnits.map((u) => (
              <button
                key={u}
                onClick={() => setToUnit(u)}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  toUnit === u
                    ? "bg-primary text-primary-foreground"
                    : "border bg-muted/50 hover:bg-muted"
                }`}
              >
                {t(u)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {kelvinWarning && (
        <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-400">
          {t("kelvinWarning")}
        </div>
      )}

      {hasInput && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {tempUnits.map((u) => {
            const val = convert(input, fromUnit, u);
            const str = val.toLocaleString(undefined, { maximumFractionDigits: 2 });
            return (
              <button
                key={u}
                onClick={() => copyValue(val.toString(), u)}
                className="rounded-xl border bg-muted/50 p-5 text-center hover:bg-muted/70 transition-colors cursor-pointer relative group"
              >
                <div className="text-xs text-muted-foreground">{t(u)}</div>
                <div className="mt-1 text-2xl font-bold">{str}°</div>
                {copied === u && <span className="absolute top-2 right-2 text-xs text-green-500">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Reference temperatures */}
      {hasInput && (
        <div className="rounded-xl border bg-muted/50 p-4">
          <div className="text-sm font-medium mb-3">{t("references")}</div>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {REFERENCES.map((ref) => (
              <div key={ref.key} className="flex justify-between rounded-lg bg-background px-3 py-2 text-sm">
                <span className="text-muted-foreground">{t(ref.key)}</span>
                <span className="font-medium font-mono tabular-nums">
                  {convert(ref.c, "c", fromUnit).toLocaleString(undefined, { maximumFractionDigits: 1 })}°
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
