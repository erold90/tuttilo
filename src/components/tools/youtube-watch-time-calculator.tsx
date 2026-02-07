"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const SPEEDS = [1, 1.25, 1.5, 1.75, 2];

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function YoutubeWatchTimeCalculator() {
  const t = useTranslations("tools.youtube-watch-time-calculator.ui");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(10);
  const [seconds, setSeconds] = useState(0);
  const [videoCount, setVideoCount] = useState(1);

  const totalSeconds = useMemo(() => (hours * 3600 + minutes * 60 + seconds) * videoCount, [hours, minutes, seconds, videoCount]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("hours")}</label>
          <input type="number" min={0} value={hours} onChange={(e) => setHours(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("minutes")}</label>
          <input type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("seconds")}</label>
          <input type="number" min={0} max={59} value={seconds} onChange={(e) => setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("videoCount")}</label>
          <input type="number" min={1} value={videoCount} onChange={(e) => setVideoCount(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      {totalSeconds > 0 && (
        <div className="grid gap-3 md:grid-cols-5">
          {SPEEDS.map((speed) => (
            <div key={speed} className="rounded-xl border border-border p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{speed}x</p>
              <p className="text-lg font-bold text-primary">{formatDuration(totalSeconds / speed)}</p>
            </div>
          ))}
        </div>
      )}

      {videoCount > 1 && totalSeconds > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {t("totalAt1x")}: {formatDuration(totalSeconds)}
        </p>
      )}
    </div>
  );
}
