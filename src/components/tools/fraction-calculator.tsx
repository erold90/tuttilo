"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Op = "add" | "subtract" | "multiply" | "divide";

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function simplify(num: number, den: number): [number, number] {
  if (den === 0) return [0, 0];
  const sign = den < 0 ? -1 : 1;
  num *= sign;
  den *= sign;
  const g = gcd(num, den);
  return [num / g, den / g];
}

export default function FractionCalculator() {
  const t = useTranslations("tools.fraction-calculator.ui");

  const [n1, setN1] = useState("");
  const [d1, setD1] = useState("");
  const [n2, setN2] = useState("");
  const [d2, setD2] = useState("");
  const [op, setOp] = useState<Op>("add");

  const ops: { key: Op; symbol: string }[] = [
    { key: "add", symbol: "+" },
    { key: "subtract", symbol: "−" },
    { key: "multiply", symbol: "×" },
    { key: "divide", symbol: "÷" },
  ];

  const calc = () => {
    const a = parseInt(n1), b = parseInt(d1) || 1;
    const c = parseInt(n2), d = parseInt(d2) || 1;
    if (isNaN(a) || isNaN(c)) return null;
    if (b === 0 || d === 0) return null;
    if (op === "divide" && c === 0) return null;

    let rn: number, rd: number;
    switch (op) {
      case "add":
        rn = a * d + c * b;
        rd = b * d;
        break;
      case "subtract":
        rn = a * d - c * b;
        rd = b * d;
        break;
      case "multiply":
        rn = a * c;
        rd = b * d;
        break;
      case "divide":
        rn = a * d;
        rd = b * c;
        break;
    }

    const [sn, sd] = simplify(rn, rd);
    const whole = sd !== 0 ? Math.trunc(sn / sd) : 0;
    const remainder = sd !== 0 ? Math.abs(sn % sd) : 0;
    const decimal = sd !== 0 ? sn / sd : 0;

    return { num: sn, den: sd, whole, remainder, decimal };
  };

  const result = calc();

  return (
    <div className="space-y-6">
      {/* Operation selector */}
      <div className="flex gap-2">
        {ops.map((o) => (
          <button
            key={o.key}
            onClick={() => setOp(o.key)}
            className={`rounded-xl px-5 py-2 text-lg font-bold transition-colors ${
              op === o.key ? "bg-primary text-primary-foreground" : "border bg-muted/50 hover:bg-muted"
            }`}
          >
            {o.symbol}
          </button>
        ))}
      </div>

      {/* Fractions input */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            value={n1}
            onChange={(e) => setN1(e.target.value)}
            className="w-20 rounded-xl border bg-background px-3 py-2 text-center text-lg"
            placeholder={t("numerator")}
          />
          <div className="h-px w-16 bg-foreground" />
          <input
            type="number"
            value={d1}
            onChange={(e) => setD1(e.target.value)}
            className="w-20 rounded-xl border bg-background px-3 py-2 text-center text-lg"
            placeholder={t("denominator")}
          />
        </div>

        <span className="text-2xl font-bold text-primary">
          {ops.find((o) => o.key === op)?.symbol}
        </span>

        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            value={n2}
            onChange={(e) => setN2(e.target.value)}
            className="w-20 rounded-xl border bg-background px-3 py-2 text-center text-lg"
            placeholder={t("numerator")}
          />
          <div className="h-px w-16 bg-foreground" />
          <input
            type="number"
            value={d2}
            onChange={(e) => setD2(e.target.value)}
            className="w-20 rounded-xl border bg-background px-3 py-2 text-center text-lg"
            placeholder={t("denominator")}
          />
        </div>

        {result && (
          <>
            <span className="text-2xl font-bold">=</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold text-primary">{result.num}</span>
              <div className="h-px w-16 bg-primary" />
              <span className="text-xl font-bold text-primary">{result.den}</span>
            </div>
          </>
        )}
      </div>

      {/* Results */}
      {result && result.den !== 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-muted/50 p-5 text-center">
            <div className="text-xs text-muted-foreground">{t("simplified")}</div>
            <div className="mt-1 text-2xl font-bold">{result.num}/{result.den}</div>
          </div>
          <div className="rounded-xl border bg-muted/50 p-5 text-center">
            <div className="text-xs text-muted-foreground">{t("mixed")}</div>
            <div className="mt-1 text-2xl font-bold">
              {result.whole !== 0 && <>{result.whole} </>}
              {result.remainder !== 0 && <>{result.remainder}/{result.den}</>}
              {result.whole === 0 && result.remainder === 0 && "0"}
            </div>
          </div>
          <div className="rounded-xl border bg-muted/50 p-5 text-center">
            <div className="text-xs text-muted-foreground">{t("decimal")}</div>
            <div className="mt-1 text-2xl font-bold">{result.decimal.toFixed(6)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
