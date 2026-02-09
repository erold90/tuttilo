"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

export default function DateCalculator() {
  const t = useTranslations("tools.date-calculator");
  const [mode, setMode] = useState<"diff" | "add">("diff");
  const today = new Date().toISOString().split("T")[0];
  const [date1, setDate1] = useState(today);
  const [date2, setDate2] = useState(today);
  const [addDays, setAddDays] = useState(0);
  const [addMonths, setAddMonths] = useState(0);
  const [addYears, setAddYears] = useState(0);

  const diffResult = useMemo(() => {
    if (mode !== "diff") return null;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const totalDays = Math.floor(diffMs / 86400000);
    const weeks = Math.floor(totalDays / 7);
    const months = Math.abs((d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth());
    const years = Math.abs(d2.getFullYear() - d1.getFullYear());
    const hours = totalDays * 24;
    const minutes = hours * 60;
    return { totalDays, weeks, months, years, hours, minutes };
  }, [mode, date1, date2]);

  const addResult = useMemo(() => {
    if (mode !== "add") return null;
    const d = new Date(date1);
    if (isNaN(d.getTime())) return null;
    d.setFullYear(d.getFullYear() + addYears);
    d.setMonth(d.getMonth() + addMonths);
    d.setDate(d.getDate() + addDays);
    return d.toISOString().split("T")[0];
  }, [mode, date1, addDays, addMonths, addYears]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode("diff")} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "diff" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200"}`}>{t("ui.difference")}</button>
        <button onClick={() => setMode("add")} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "add" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200"}`}>{t("ui.addSubtract")}</button>
      </div>
      {mode === "diff" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.startDate")}
              <input type="date" value={date1} onChange={e => setDate1(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
            </label>
            <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.endDate")}
              <input type="date" value={date2} onChange={e => setDate2(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
            </label>
          </div>
          {diffResult && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{diffResult.totalDays}</p>
                <p className="text-xs text-zinc-500">{t("ui.days")}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{diffResult.weeks}</p>
                <p className="text-xs text-zinc-500">{t("ui.weeks")}</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{diffResult.months}</p>
                <p className="text-xs text-zinc-500">{t("ui.months")}</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">{diffResult.years}</p>
                <p className="text-xs text-zinc-500">{t("ui.years")}</p>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
                <p className="text-2xl font-bold text-zinc-600">{diffResult.hours.toLocaleString()}</p>
                <p className="text-xs text-zinc-500">{t("ui.hours")}</p>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
                <p className="text-2xl font-bold text-zinc-600">{diffResult.minutes.toLocaleString()}</p>
                <p className="text-xs text-zinc-500">{t("ui.minutesUnit")}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.startDate")}
            <input type="date" value={date1} onChange={e => setDate1(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          </label>
          <div className="grid grid-cols-3 gap-4">
            <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.years")}
              <input type="number" value={addYears} onChange={e => setAddYears(+e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
            </label>
            <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.months")}
              <input type="number" value={addMonths} onChange={e => setAddMonths(+e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
            </label>
            <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.days")}
              <input type="number" value={addDays} onChange={e => setAddDays(+e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
            </label>
          </div>
          {addResult && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <p className="text-xs text-zinc-500 mb-1">{t("ui.resultDate")}</p>
              <p className="text-2xl font-bold text-green-600">{addResult}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
