"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Sao_Paulo", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Rome",
  "Europe/Madrid", "Europe/Moscow", "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai",
  "Asia/Tokyo", "Asia/Seoul", "Australia/Sydney", "Pacific/Auckland", "Pacific/Honolulu",
  "Africa/Cairo", "Africa/Lagos", "America/Mexico_City", "America/Toronto", "Asia/Singapore",
  "Asia/Hong_Kong", "Asia/Bangkok", "Asia/Jakarta",
];

export default function TimezoneConverter() {
  const t = useTranslations("tools.timezone-converter");
  const [fromTz, setFromTz] = useState("UTC");
  const [toTz, setToTz] = useState("America/New_York");
  const [dateStr, setDateStr] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });

  const result = useMemo(() => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      const fromFmt = new Intl.DateTimeFormat("en-US", { timeZone: fromTz, dateStyle: "full", timeStyle: "long" });
      const toFmt = new Intl.DateTimeFormat("en-US", { timeZone: toTz, dateStyle: "full", timeStyle: "long" });
      const fromOffset = new Intl.DateTimeFormat("en-US", { timeZone: fromTz, timeZoneName: "shortOffset" }).formatToParts(date).find(p => p.type === "timeZoneName")?.value || "";
      const toOffset = new Intl.DateTimeFormat("en-US", { timeZone: toTz, timeZoneName: "shortOffset" }).formatToParts(date).find(p => p.type === "timeZoneName")?.value || "";
      return { from: fromFmt.format(date), to: toFmt.format(date), fromOffset, toOffset };
    } catch { return null; }
  }, [dateStr, fromTz, toTz]);

  return (
    <div className="space-y-4">
      <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.dateTime")}
        <input type="datetime-local" value={dateStr} onChange={e => setDateStr(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.from")}
          <select value={fromTz} onChange={e => setFromTz(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>)}
          </select>
        </label>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.to")}
          <select value={toTz} onChange={e => setToTz(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>)}
          </select>
        </label>
      </div>
      <button onClick={() => { const tmp = fromTz; setFromTz(toTz); setToTz(tmp); }} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-lg text-sm hover:bg-zinc-300 dark:hover:bg-zinc-500">{t("ui.swap")}</button>
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">{fromTz} ({result.fromOffset})</p>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{result.from}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">{toTz} ({result.toOffset})</p>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{result.to}</p>
          </div>
        </div>
      )}
    </div>
  );
}
