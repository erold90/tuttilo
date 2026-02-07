"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

export function YoutubeMoneyCalculator() {
  const t = useTranslations("tools.youtube-money-calculator.ui");
  const [dailyViews, setDailyViews] = useState(1000);
  const [cpmMin, setCpmMin] = useState(1);
  const [cpmMax, setCpmMax] = useState(5);

  const earnings = useMemo(() => {
    const avgCpm = (cpmMin + cpmMax) / 2;
    const daily = (dailyViews / 1000) * avgCpm;
    return {
      dailyMin: (dailyViews / 1000) * cpmMin,
      dailyMax: (dailyViews / 1000) * cpmMax,
      daily,
      monthly: daily * 30,
      yearly: daily * 365,
      monthlyMin: (dailyViews / 1000) * cpmMin * 30,
      monthlyMax: (dailyViews / 1000) * cpmMax * 30,
      yearlyMin: (dailyViews / 1000) * cpmMin * 365,
      yearlyMax: (dailyViews / 1000) * cpmMax * 365,
    };
  }, [dailyViews, cpmMin, cpmMax]);

  const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-1">{t("dailyViews")}</label>
          <input type="number" min={0} value={dailyViews} onChange={(e) => setDailyViews(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("cpmMin")} ($)</label>
          <input type="number" min={0} step={0.1} value={cpmMin} onChange={(e) => setCpmMin(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("cpmMax")} ($)</label>
          <input type="number" min={0} step={0.1} value={cpmMax} onChange={(e) => setCpmMax(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: t("daily"), min: earnings.dailyMin, max: earnings.dailyMax },
          { label: t("monthly"), min: earnings.monthlyMin, max: earnings.monthlyMax },
          { label: t("yearly"), min: earnings.yearlyMin, max: earnings.yearlyMax },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className="text-2xl font-bold text-primary">{fmt(item.min)} — {fmt(item.max)}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">{t("disclaimer")}</p>
    </div>
  );
}
