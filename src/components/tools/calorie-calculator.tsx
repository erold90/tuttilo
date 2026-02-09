"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Gender = "male" | "female";
type Activity = "sedentary" | "light" | "moderate" | "active" | "veryActive";

const activityMultipliers: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export default function CalorieCalculator() {
  const t = useTranslations("tools.calorie-calculator.ui");

  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState<Activity>("moderate");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const calc = () => {
    const a = parseFloat(age);
    let w = parseFloat(weight);
    let h = parseFloat(height);
    if (!a || !w || !h) return null;

    if (unit === "imperial") {
      w = w * 0.453592; // lbs to kg
      h = h * 2.54; // in to cm
    }

    // Mifflin-St Jeor
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    const tdee = bmr * activityMultipliers[activity];

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      lose: Math.round(tdee - 500),
      gain: Math.round(tdee + 500),
    };
  };

  const result = calc();
  const activities: Activity[] = ["sedentary", "light", "moderate", "active", "veryActive"];

  return (
    <div className="space-y-6">
      {/* Unit Toggle */}
      <div className="flex gap-2">
        {(["metric", "imperial"] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              unit === u ? "bg-primary text-primary-foreground" : "border bg-muted/50 hover:bg-muted"
            }`}
          >
            {t(u)}
          </button>
        ))}
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("gender")}</label>
        <div className="flex gap-2">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`rounded-xl px-6 py-2 text-sm font-medium transition-colors ${
                gender === g ? "bg-primary text-primary-foreground" : "border bg-muted/50 hover:bg-muted"
              }`}
            >
              {t(g)}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("age")}</label>
          <input
            type="number" min="1" max="120" value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3"
            placeholder={t("agePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("weight")} ({unit === "metric" ? "kg" : "lbs"})
          </label>
          <input
            type="number" min="1" value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("height")} ({unit === "metric" ? "cm" : "in"})
          </label>
          <input
            type="number" min="1" value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-3"
          />
        </div>
      </div>

      {/* Activity */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("activityLevel")}</label>
        <div className="flex flex-wrap gap-2">
          {activities.map((a) => (
            <button
              key={a}
              onClick={() => setActivity(a)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                activity === a ? "bg-primary text-primary-foreground" : "border bg-muted/50 hover:bg-muted"
              }`}
            >
              {t(a)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-muted/50 p-5 text-center">
            <div className="text-xs text-muted-foreground">{t("bmr")}</div>
            <div className="mt-1 text-3xl font-bold">{result.bmr.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{t("calDay")}</div>
          </div>
          <div className="rounded-xl border bg-primary/10 p-5 text-center">
            <div className="text-xs text-muted-foreground">{t("tdee")}</div>
            <div className="mt-1 text-3xl font-bold text-primary">{result.tdee.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{t("calDay")}</div>
          </div>
          <div className="rounded-xl border bg-green-500/10 p-5 text-center">
            <div className="text-xs text-muted-foreground">{t("loseWeight")}</div>
            <div className="mt-1 text-3xl font-bold text-green-600">{result.lose.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{t("calDay")}</div>
          </div>
          <div className="rounded-xl border bg-blue-500/10 p-5 text-center">
            <div className="text-xs text-muted-foreground">{t("gainWeight")}</div>
            <div className="mt-1 text-3xl font-bold text-blue-600">{result.gain.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{t("calDay")}</div>
          </div>
        </div>
      )}
    </div>
  );
}
