"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export default function AgeCalculator() {
  const t = useTranslations("tools.age-calculator.ui");

  const [birthDate, setBirthDate] = useState("");
  const [targetDate, setTargetDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [copied, setCopied] = useState<string | null>(null);

  const calcAge = () => {
    if (!birthDate || !targetDate) return null;
    const birth = new Date(birthDate);
    const target = new Date(targetDate);
    if (birth >= target) return null;

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor(
      (target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;

    return { years, months, days, totalDays, totalWeeks, totalMonths, totalHours };
  };

  const result = calcAge();

  const copy = useCallback((val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("birthDate")}</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("targetDate")}</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3"
          />
        </div>
      </div>

      <button
        onClick={() => { setBirthDate(""); setTargetDate(new Date().toISOString().split("T")[0]); }}
        className="rounded-xl border bg-muted/50 px-6 py-3 font-medium hover:bg-muted"
      >
        {t("reset")}
      </button>

      {result && (
        <div className="space-y-4">
          <div
            className="cursor-pointer rounded-xl border bg-primary/10 p-6 text-center transition-colors hover:border-primary/30"
            onClick={() => copy(`${result.years}y ${result.months}m ${result.days}d`, "age")}
          >
            <div className="text-sm text-muted-foreground">{t("yourAge")}</div>
            <div className="mt-2 text-4xl font-bold text-primary">
              {result.years} {t("years")}, {result.months} {t("months")}, {result.days} {t("days")}
            </div>
            <div className="mt-1 h-4 text-xs text-primary">{copied === "age" ? "✓" : ""}</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div
              className="cursor-pointer rounded-xl border bg-muted/50 p-4 text-center transition-colors hover:border-primary/30"
              onClick={() => copy(result.totalMonths.toLocaleString(), "tm")}
            >
              <div className="text-xs text-muted-foreground">{t("totalMonths")}</div>
              <div className="mt-1 text-2xl font-bold">{result.totalMonths.toLocaleString()}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "tm" ? "✓" : ""}</div>
            </div>
            <div
              className="cursor-pointer rounded-xl border bg-muted/50 p-4 text-center transition-colors hover:border-primary/30"
              onClick={() => copy(result.totalWeeks.toLocaleString(), "tw")}
            >
              <div className="text-xs text-muted-foreground">{t("totalWeeks")}</div>
              <div className="mt-1 text-2xl font-bold">{result.totalWeeks.toLocaleString()}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "tw" ? "✓" : ""}</div>
            </div>
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
              onClick={() => copy(result.totalHours.toLocaleString(), "th")}
            >
              <div className="text-xs text-muted-foreground">{t("totalHours")}</div>
              <div className="mt-1 text-2xl font-bold">{result.totalHours.toLocaleString()}</div>
              <div className="mt-1 h-4 text-xs text-primary">{copied === "th" ? "✓" : ""}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
