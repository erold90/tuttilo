"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const DEFAULT_ZONES = [
  { tz: "America/New_York", label: "New York" },
  { tz: "Europe/London", label: "London" },
  { tz: "Europe/Paris", label: "Paris" },
  { tz: "Asia/Tokyo", label: "Tokyo" },
  { tz: "Asia/Shanghai", label: "Shanghai" },
  { tz: "Australia/Sydney", label: "Sydney" },
];

const ALL_ZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Sao_Paulo", "America/Mexico_City", "America/Toronto", "America/Buenos_Aires",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Rome", "Europe/Madrid",
  "Europe/Moscow", "Europe/Istanbul", "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai",
  "Asia/Tokyo", "Asia/Seoul", "Asia/Singapore", "Asia/Hong_Kong", "Asia/Bangkok",
  "Australia/Sydney", "Australia/Melbourne", "Pacific/Auckland", "Pacific/Honolulu",
  "Africa/Cairo", "Africa/Lagos", "Africa/Johannesburg",
];

export default function WorldClock() {
  const t = useTranslations("tools.world-clock");
  const [zones, setZones] = useState(DEFAULT_ZONES);
  const [now, setNow] = useState(new Date());
  const [newTz, setNewTz] = useState("");

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const addZone = () => {
    if (!newTz || zones.some(z => z.tz === newTz)) return;
    setZones([...zones, { tz: newTz, label: newTz.split("/").pop()!.replace(/_/g, " ") }]);
    setNewTz("");
  };

  const removeZone = (tz: string) => setZones(zones.filter(z => z.tz !== tz));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {zones.map(z => {
          const timeFmt = new Intl.DateTimeFormat("en-US", { timeZone: z.tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
          const dateFmt = new Intl.DateTimeFormat("en-US", { timeZone: z.tz, weekday: "short", month: "short", day: "numeric" });
          const offsetFmt = new Intl.DateTimeFormat("en-US", { timeZone: z.tz, timeZoneName: "shortOffset" });
          const offset = offsetFmt.formatToParts(now).find(p => p.type === "timeZoneName")?.value || "";
          const hour = new Date(now.toLocaleString("en-US", { timeZone: z.tz })).getHours();
          const isDaytime = hour >= 6 && hour < 20;
          return (
            <div key={z.tz} className={`p-4 rounded-lg border ${isDaytime ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800" : "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">{z.label}</p>
                  <p className="text-xs text-zinc-500">{offset}</p>
                </div>
                <button onClick={() => removeZone(z.tz)} className="text-xs text-zinc-400 hover:text-red-500">&times;</button>
              </div>
              <p className="text-3xl font-mono font-bold text-zinc-800 dark:text-zinc-100 mt-2 tabular-nums">{timeFmt.format(now)}</p>
              <p className="text-sm text-zinc-500">{dateFmt.format(now)}</p>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <select value={newTz} onChange={e => setNewTz(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
          <option value="">{t("ui.selectTimezone")}</option>
          {ALL_ZONES.filter(tz => !zones.some(z => z.tz === tz)).map(tz => (
            <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
          ))}
        </select>
        <button onClick={addZone} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{t("ui.add")}</button>
      </div>
    </div>
  );
}
