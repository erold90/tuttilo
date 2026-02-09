"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function getWeekNumber(date: Date): [number, number] {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return [d.getUTCFullYear(), weekNo];
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export default function WeekNumber() {
  const t = useTranslations("tools.week-number");
  const today = new Date().toISOString().split("T")[0];
  const [dateStr, setDateStr] = useState(today);

  const info = useMemo(() => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const [year, week] = getWeekNumber(d);
    const dayOfYear = getDayOfYear(d);
    const dayOfWeek = d.toLocaleDateString("en-US", { weekday: "long" });
    const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    const daysInYear = isLeap(d.getFullYear()) ? 366 : 365;
    const daysLeft = daysInYear - dayOfYear;
    const quarter = Math.ceil((d.getMonth() + 1) / 3);
    return { year, week, dayOfYear, dayOfWeek, daysInYear, daysLeft, quarter };
  }, [dateStr]);

  return (
    <div className="space-y-4">
      <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.selectDate")}
        <input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
      </label>
      <button onClick={() => setDateStr(new Date().toISOString().split("T")[0])} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{t("ui.today")}</button>
      {info && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-3xl font-bold text-blue-600">{info.week}</p>
            <p className="text-xs text-zinc-500">{t("ui.weekNumber")}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <p className="text-3xl font-bold text-green-600">{info.dayOfYear}</p>
            <p className="text-xs text-zinc-500">{t("ui.dayOfYear")}</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
            <p className="text-3xl font-bold text-purple-600">{info.daysLeft}</p>
            <p className="text-xs text-zinc-500">{t("ui.daysLeft")}</p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
            <p className="text-3xl font-bold text-orange-600">Q{info.quarter}</p>
            <p className="text-xs text-zinc-500">{t("ui.quarter")}</p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center col-span-2">
            <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">{info.dayOfWeek}</p>
            <p className="text-xs text-zinc-500">{t("ui.dayOfWeek")}</p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center col-span-2">
            <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">{info.daysInYear} {t("ui.days")}</p>
            <p className="text-xs text-zinc-500">{t("ui.daysInYear")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
