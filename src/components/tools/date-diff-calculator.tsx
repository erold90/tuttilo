"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export default function DateDiffCalculator() {
  const t = useTranslations("tools.date-diff-calculator.ui");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

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

  const copy = useCallback((val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  }, []);

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
          <div
            className="cursor-pointer rounded-xl border bg-primary/10 p-6 text-center transition-colors hover:border-primary/30"
            onClick={() => copy(`${result.years}y ${result.months}m ${result.days}d`, "diff")}
          >
            <div className="text-sm text-muted-foreground">{t("difference")}</div>
            <div className="mt-2 text-3xl font-bold text-primary">
              {result.years > 0 && <>{result.years} {t("years")} </>}
              {result.months > 0 && <>{result.months} {t("months")} </>}
              {result.days} {t("days")}
            </div>
            <div className="mt-1 h-4 text-xs text-primary">{copied === "diff" ? "✓" : ""}</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div
              className="cursor-pointer rounded-xl border bg-muted/50 p-4 text-center transition-colors hover:border-primary/30"
              onClick={() => copy(result.totalDays.toLocaleString(), "td")}
            >
              <div className="text-xs text-muted-foreground">{t("totalDays")}</div>
              <div className="mt-1 text-2xl font-bold">{result.totalDays.toLocaleString()}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "td" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-muted/50 p-4 text-center transition-colors hover:border-primary/30"
              onClick={() => copy(`${result.totalWeeks}w ${result.remainingDays}d`, "tw")}
            >
              <div className="text-xs text-muted-foreground">{t("totalWeeks")}</div>
              <div className="mt-1 text-2xl font-bold">
                {result.totalWeeks} {t("and")} {result.remainingDays}d
              </div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "tw" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-muted/50 p-4 text-center transition-colors hover:border-primary/30"
              onClick={() => copy(result.totalHours.toLocaleString(), "th")}
            >
              <div className="text-xs text-muted-foreground">{t("totalHours")}</div>
              <div className="mt-1 text-2xl font-bold">{result.totalHours.toLocaleString()}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "th" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-muted/50 p-4 text-center transition-colors hover:border-primary/30"
              onClick={() => copy(result.totalMinutes.toLocaleString(), "tmin")}
            >
              <div className="text-xs text-muted-foreground">{t("totalMinutes")}</div>
              <div className="mt-1 text-2xl font-bold">{result.totalMinutes.toLocaleString()}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "tmin" ? "✓" : ""}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
