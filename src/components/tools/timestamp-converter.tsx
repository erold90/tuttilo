"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

export function TimestampConverter() {
  const t = useTranslations("tools.timestamp.ui");
  const [ts, setTs] = useState("");
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [dateInput, setDateInput] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const timestamp = ts ? Number(ts) : now;
  const isMs = ts.length > 12;
  const actualTs = isMs ? Math.floor(timestamp / 1000) : timestamp;
  const date = new Date(actualTs * 1000);
  const isValid = !isNaN(date.getTime());

  const handleDateToTs = useCallback((val: string) => {
    setDateInput(val);
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      setTs(String(Math.floor(d.getTime() / 1000)));
    }
  }, []);

  const copy = (v: string) => navigator.clipboard.writeText(v);

  const formats = isValid
    ? [
        { label: "Unix (seconds)", value: String(actualTs) },
        { label: "Unix (milliseconds)", value: String(actualTs * 1000) },
        { label: "ISO 8601", value: date.toISOString() },
        { label: "UTC", value: date.toUTCString() },
        { label: "Local", value: date.toLocaleString() },
        { label: "Date", value: date.toLocaleDateString() },
        { label: "Time", value: date.toLocaleTimeString() },
        { label: "Relative", value: getRelative(actualTs, now) },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Live clock */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
        <div className="text-xs text-muted-foreground">{t("currentTime")}</div>
        <div className="font-mono text-2xl font-bold text-primary">{now}</div>
        <div className="text-xs text-muted-foreground">{new Date(now * 1000).toISOString()}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("timestamp")}</label>
          <input
            type="text"
            value={ts}
            onChange={(e) => { setTs(e.target.value); setDateInput(""); }}
            placeholder={String(now)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("dateTime")}</label>
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(e) => handleDateToTs(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {formats.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {formats.map((f) => (
            <div key={f.label} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">{f.label}</div>
                <div className="truncate font-mono text-sm">{f.value}</div>
              </div>
              <button onClick={() => copy(f.value)} className="ml-2 shrink-0 rounded px-2 py-1 text-xs text-primary hover:bg-primary/10">{t("copy")}</button>
            </div>
          ))}
        </div>
      )}

      {ts && !isValid && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center text-sm text-red-400">
          {t("invalid")}
        </div>
      )}
    </div>
  );
}

function getRelative(ts: number, now: number): string {
  const diff = now - ts;
  const abs = Math.abs(diff);
  const suffix = diff > 0 ? "ago" : "from now";
  if (abs < 60) return `${abs}s ${suffix}`;
  if (abs < 3600) return `${Math.floor(abs / 60)}m ${suffix}`;
  if (abs < 86400) return `${Math.floor(abs / 3600)}h ${suffix}`;
  if (abs < 2592000) return `${Math.floor(abs / 86400)}d ${suffix}`;
  if (abs < 31536000) return `${Math.floor(abs / 2592000)}mo ${suffix}`;
  return `${Math.floor(abs / 31536000)}y ${suffix}`;
}
