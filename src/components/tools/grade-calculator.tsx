"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface GradeEntry {
  id: number;
  name: string;
  grade: string;
  weight: string;
}

let nextId = 1;

export default function GradeCalculator() {
  const t = useTranslations("tools.grade-calculator.ui");

  const [entries, setEntries] = useState<GradeEntry[]>([
    { id: nextId++, name: "", grade: "", weight: "1" },
    { id: nextId++, name: "", grade: "", weight: "1" },
    { id: nextId++, name: "", grade: "", weight: "1" },
  ]);

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { id: nextId++, name: "", grade: "", weight: "1" },
    ]);
  };

  const removeEntry = (id: number) => {
    if (entries.length <= 1) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEntry = (id: number, field: keyof GradeEntry, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const validEntries = entries.filter(
    (e) => e.grade !== "" && !isNaN(parseFloat(e.grade))
  );

  const calc = () => {
    if (validEntries.length === 0) return null;

    let weightedSum = 0;
    let totalWeight = 0;

    for (const e of validEntries) {
      const g = parseFloat(e.grade);
      const w = parseFloat(e.weight) || 1;
      weightedSum += g * w;
      totalWeight += w;
    }

    const average = weightedSum / totalWeight;
    const highest = Math.max(...validEntries.map((e) => parseFloat(e.grade)));
    const lowest = Math.min(...validEntries.map((e) => parseFloat(e.grade)));

    let letterGrade = "F";
    if (average >= 93) letterGrade = "A";
    else if (average >= 90) letterGrade = "A-";
    else if (average >= 87) letterGrade = "B+";
    else if (average >= 83) letterGrade = "B";
    else if (average >= 80) letterGrade = "B-";
    else if (average >= 77) letterGrade = "C+";
    else if (average >= 73) letterGrade = "C";
    else if (average >= 70) letterGrade = "C-";
    else if (average >= 67) letterGrade = "D+";
    else if (average >= 60) letterGrade = "D";

    return { average, highest, lowest, letterGrade, count: validEntries.length };
  };

  const result = calc();

  return (
    <div className="space-y-6">
      {/* Entries */}
      <div className="space-y-3">
        {entries.map((entry, i) => (
          <div key={entry.id} className="flex items-center gap-2">
            <span className="w-8 text-sm text-muted-foreground">{i + 1}.</span>
            <input
              type="text"
              value={entry.name}
              onChange={(e) => updateEntry(entry.id, "name", e.target.value)}
              className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm"
              placeholder={t("subjectName")}
            />
            <input
              type="number"
              min="0"
              max="100"
              value={entry.grade}
              onChange={(e) => updateEntry(entry.id, "grade", e.target.value)}
              className="w-24 rounded-xl border bg-background px-3 py-2 text-sm text-center"
              placeholder={t("grade")}
            />
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={entry.weight}
              onChange={(e) => updateEntry(entry.id, "weight", e.target.value)}
              className="w-20 rounded-xl border bg-background px-3 py-2 text-sm text-center"
              placeholder={t("weight")}
            />
            <button
              onClick={() => removeEntry(entry.id)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addEntry}
        className="rounded-xl border border-dashed bg-muted/30 px-6 py-3 font-medium hover:bg-muted/50"
      >
        + {t("addEntry")}
      </button>

      {/* Results */}
      {result && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-primary/10 p-5 text-center">
            <div className="text-xs text-muted-foreground">{t("weightedAverage")}</div>
            <div className="mt-1 text-3xl font-bold text-primary">{result.average.toFixed(2)}</div>
          </div>
          <div className="rounded-xl border bg-muted/50 p-5 text-center">
            <div className="text-xs text-muted-foreground">{t("letterGrade")}</div>
            <div className="mt-1 text-3xl font-bold">{result.letterGrade}</div>
          </div>
          <div className="rounded-xl border bg-green-500/10 p-5 text-center">
            <div className="text-xs text-muted-foreground">{t("highest")}</div>
            <div className="mt-1 text-3xl font-bold text-green-600">{result.highest.toFixed(1)}</div>
          </div>
          <div className="rounded-xl border bg-red-500/10 p-5 text-center">
            <div className="text-xs text-muted-foreground">{t("lowest")}</div>
            <div className="mt-1 text-3xl font-bold text-red-600">{result.lowest.toFixed(1)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
