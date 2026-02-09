"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

export default function EpochConverter() {
  const t = useTranslations("tools.epoch-converter");
  const [mode, setMode] = useState<"toDate" | "toEpoch">("toDate");
  const [epochInput, setEpochInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().slice(0, 19));
  const [currentEpoch, setCurrentEpoch] = useState(Math.floor(Date.now() / 1000));

  // Auto-update current epoch
  useState(() => {
    const iv = setInterval(() => setCurrentEpoch(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(iv);
  });

  const toDateResult = useMemo(() => {
    const num = Number(epochInput);
    if (isNaN(num)) return null;
    // Detect seconds vs milliseconds
    const ms = num > 1e12 ? num : num * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    return {
      utc: d.toUTCString(),
      local: d.toString(),
      iso: d.toISOString(),
      relative: formatRelative(ms),
    };
  }, [epochInput]);

  const toEpochResult = useMemo(() => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    return {
      seconds: Math.floor(d.getTime() / 1000),
      milliseconds: d.getTime(),
    };
  }, [dateInput]);

  function formatRelative(ms: number): string {
    const diff = Date.now() - ms;
    const abs = Math.abs(diff);
    const suffix = diff > 0 ? "ago" : "from now";
    if (abs < 60000) return `${Math.floor(abs / 1000)}s ${suffix}`;
    if (abs < 3600000) return `${Math.floor(abs / 60000)}m ${suffix}`;
    if (abs < 86400000) return `${Math.floor(abs / 3600000)}h ${suffix}`;
    return `${Math.floor(abs / 86400000)}d ${suffix}`;
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-center">
        <p className="text-xs text-zinc-500">{t("ui.currentEpoch")}</p>
        <p className="text-2xl font-mono font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">{currentEpoch}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setMode("toDate")} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "toDate" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200"}`}>{t("ui.epochToDate")}</button>
        <button onClick={() => setMode("toEpoch")} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "toEpoch" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200"}`}>{t("ui.dateToEpoch")}</button>
      </div>
      {mode === "toDate" ? (
        <>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.epochValue")}
            <input value={epochInput} onChange={e => setEpochInput(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" placeholder="1700000000" />
          </label>
          <button onClick={() => setEpochInput(String(Math.floor(Date.now() / 1000)))} className="text-sm text-blue-600 hover:underline">{t("ui.useNow")}</button>
          {toDateResult && (
            <div className="space-y-2">
              {[
                [t("ui.utc"), toDateResult.utc],
                [t("ui.local"), toDateResult.local],
                ["ISO 8601", toDateResult.iso],
                [t("ui.relative"), toDateResult.relative],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <span className="text-sm text-zinc-500">{label}</span>
                  <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300">{val}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.dateValue")}
            <input type="datetime-local" value={dateInput} onChange={e => setDateInput(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          </label>
          {toEpochResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-sm text-zinc-500">{t("ui.seconds")}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300">{toEpochResult.seconds}</span>
                  <button onClick={() => navigator.clipboard.writeText(String(toEpochResult.seconds))} className="text-xs text-blue-600 hover:underline">{t("ui.copy")}</button>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-sm text-zinc-500">{t("ui.milliseconds")}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300">{toEpochResult.milliseconds}</span>
                  <button onClick={() => navigator.clipboard.writeText(String(toEpochResult.milliseconds))} className="text-xs text-blue-600 hover:underline">{t("ui.copy")}</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
