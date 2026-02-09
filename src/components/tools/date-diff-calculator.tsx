"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function DateDiffCalculator() {
  const t = useTranslations("tools.date-diff-calculator.ui");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const calcDiff = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffMs = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    let years = Math.abs(end.getFullYear() - start.getFullYear());
    const earlier = start <= end ? start : end;
    const later = start <= end ? end : start;
    let months = later.getMonth() - earlier.getMonth();
    let days = later.getDate() - earlier.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(later.getFullYear(), later.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days, totalDays, totalWeeks, remainingDays, totalHours, totalMinutes };
  };

  const result = calcDiff();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("startDate")}</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("endDate")}</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3"
          />
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-primary/10 p-6 text-center">
            <div className="text-sm text-muted-foreground">{t("difference")}</div>
            <div className="mt-2 text-3xl font-bold text-primary">
              {result.years > 0 && <>{result.years} {t("years")} </>}
              {result.months > 0 && <>{result.months} {t("months")} </>}
              {result.days} {t("days")}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-muted/50 p-4 text-center">
              <div className="text-xs text-muted-foreground">{t("totalDays")}</div>
              <div className="mt-1 text-2xl font-bold">{result.totalDays.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border bg-muted/50 p-4 text-center">
              <div className="text-xs text-muted-foreground">{t("totalWeeks")}</div>
              <div className="mt-1 text-2xl font-bold">
                {result.totalWeeks} {t("and")} {result.remainingDays}d
              </div>
            </div>
            <div className="rounded-xl border bg-muted/50 p-4 text-center">
              <div className="text-xs text-muted-foreground">{t("totalHours")}</div>
              <div className="mt-1 text-2xl font-bold">{result.totalHours.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border bg-muted/50 p-4 text-center">
              <div className="text-xs text-muted-foreground">{t("totalMinutes")}</div>
              <div className="mt-1 text-2xl font-bold">{result.totalMinutes.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
