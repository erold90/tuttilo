"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const FIELD_NAMES = ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"] as const;
const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function describeField(val: string, name: string): string {
  if (val === "*") return `every ${name}`;
  if (val.includes("/")) { const [, step] = val.split("/"); return `every ${step} ${name}(s)`; }
  if (val.includes(",")) return `${name} ${val}`;
  if (val.includes("-")) { const [a, b] = val.split("-"); return `${name} ${a} through ${b}`; }
  if (name === "month" && MONTHS[+val]) return MONTHS[+val];
  if (name === "dayOfWeek" && DAYS[+val]) return `on ${DAYS[+val]}`;
  return `at ${name} ${val}`;
}

function parseCron(expr: string): { valid: boolean; description: string; nextRuns: string[] } {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return { valid: false, description: "Expected 5 fields: minute hour day month weekday", nextRuns: [] };

  const descs = parts.map((p, i) => describeField(p, FIELD_NAMES[i]));
  const description = descs.join(", ");

  // Calculate next 5 runs
  const nextRuns: string[] = [];
  const now = new Date();
  const check = new Date(now);
  check.setSeconds(0, 0);
  for (let attempt = 0; attempt < 525600 && nextRuns.length < 5; attempt++) {
    check.setMinutes(check.getMinutes() + 1);
    const m = check.getMinutes(), h = check.getHours(), d = check.getDate(), mo = check.getMonth() + 1, w = check.getDay();
    if (matchField(parts[0], m) && matchField(parts[1], h) && matchField(parts[2], d) && matchField(parts[3], mo) && matchField(parts[4], w)) {
      nextRuns.push(check.toISOString().replace("T", " ").slice(0, 16));
    }
  }
  return { valid: true, description, nextRuns };
}

function matchField(pattern: string, value: number): boolean {
  if (pattern === "*") return true;
  return pattern.split(",").some(part => {
    if (part.includes("/")) { const [range, step] = part.split("/"); const s = +step; const base = range === "*" ? 0 : +range; return (value - base) % s === 0 && value >= base; }
    if (part.includes("-")) { const [a, b] = part.split("-"); return value >= +a && value <= +b; }
    return +part === value;
  });
}

export default function CronParser() {
  const t = useTranslations("tools.cron-parser");
  const [expr, setExpr] = useState("*/5 * * * *");
  const result = useMemo(() => parseCron(expr), [expr]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">{t("ui.expression")}</label>
        <input value={expr} onChange={e => setExpr(e.target.value)} className="w-full p-3 font-mono text-lg rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800" placeholder="* * * * *" />
      </div>
      <div className="grid grid-cols-5 gap-2 text-xs text-center text-zinc-500 dark:text-zinc-400">
        {FIELD_NAMES.map(n => <span key={n}>{t(`ui.${n}`)}</span>)}
      </div>
      {!result.valid && <p className="text-red-500 text-sm">{result.description}</p>}
      {result.valid && (
        <>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{result.description}</p>
          </div>
          {result.nextRuns.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">{t("ui.nextRuns")}</h3>
              <ul className="space-y-1">
                {result.nextRuns.map((r, i) => <li key={i} className="text-sm font-mono text-zinc-600 dark:text-zinc-400">{r}</li>)}
              </ul>
            </div>
          )}
        </>
      )}
      <div className="grid grid-cols-2 gap-2">
        {["0 9 * * 1-5", "*/15 * * * *", "0 0 1 * *", "30 2 * * 0"].map(ex => (
          <button key={ex} onClick={() => setExpr(ex)} className="px-2 py-1.5 text-xs font-mono bg-zinc-100 dark:bg-zinc-700 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600">{ex}</button>
        ))}
      </div>
    </div>
  );
}
