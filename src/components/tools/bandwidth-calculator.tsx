"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const FILE_UNITS = [
  { label: "B", bytes: 1 },
  { label: "KB", bytes: 1024 },
  { label: "MB", bytes: 1024 ** 2 },
  { label: "GB", bytes: 1024 ** 3 },
  { label: "TB", bytes: 1024 ** 4 },
];

const SPEED_UNITS = [
  { label: "bps", bitsPerSec: 1 },
  { label: "Kbps", bitsPerSec: 1000 },
  { label: "Mbps", bitsPerSec: 1_000_000 },
  { label: "Gbps", bitsPerSec: 1_000_000_000 },
  { label: "MB/s", bitsPerSec: 8_000_000 },
  { label: "GB/s", bitsPerSec: 8_000_000_000 },
];

function formatTime(seconds: number): string {
  if (seconds < 0.001) return "< 1 ms";
  if (seconds < 1) return `${(seconds * 1000).toFixed(1)} ms`;
  if (seconds < 60) return `${seconds.toFixed(2)} sec`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ${Math.floor(seconds % 60)} sec`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ${Math.floor((seconds % 3600) / 60)} min`;
  return `${(seconds / 86400).toFixed(1)} days`;
}

export default function BandwidthCalculator() {
  const t = useTranslations("tools.bandwidth-calculator");
  const [fileSize, setFileSize] = useState(1);
  const [fileUnit, setFileUnit] = useState(2); // MB
  const [speed, setSpeed] = useState(100);
  const [speedUnit, setSpeedUnit] = useState(2); // Mbps

  const result = useMemo(() => {
    const bytes = fileSize * FILE_UNITS[fileUnit].bytes;
    const bits = bytes * 8;
    const bps = speed * SPEED_UNITS[speedUnit].bitsPerSec;
    if (bps === 0) return null;
    const seconds = bits / bps;
    return { time: formatTime(seconds), bytes, bits, bps, seconds };
  }, [fileSize, fileUnit, speed, speedUnit]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("ui.fileSize")}</label>
          <div className="flex gap-2">
            <input type="number" min={0} step="any" value={fileSize} onChange={e => setFileSize(+e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
            <select value={fileUnit} onChange={e => setFileUnit(+e.target.value)} className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
              {FILE_UNITS.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("ui.speed")}</label>
          <div className="flex gap-2">
            <input type="number" min={0} step="any" value={speed} onChange={e => setSpeed(+e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
            <select value={speedUnit} onChange={e => setSpeedUnit(+e.target.value)} className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
              {SPEED_UNITS.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
            </select>
          </div>
        </div>
      </div>
      {result && (
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 text-center">
          <p className="text-sm text-zinc-500 mb-1">{t("ui.transferTime")}</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{result.time}</p>
          <p className="text-xs text-zinc-500 mt-2">{(result.bytes / 1024 / 1024).toFixed(2)} MB @ {(result.bps / 1_000_000).toFixed(2)} Mbps = {result.seconds.toFixed(3)}s</p>
        </div>
      )}
      <div className="text-xs text-zinc-500">
        <p>{t("ui.commonSpeeds")}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {[{ label: "3G", mbps: 5 }, { label: "4G", mbps: 50 }, { label: "5G", mbps: 500 }, { label: "WiFi", mbps: 100 }, { label: "Fiber", mbps: 1000 }].map(s => (
            <button key={s.label} onClick={() => { setSpeed(s.mbps); setSpeedUnit(2); }} className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs hover:bg-zinc-300 dark:hover:bg-zinc-600">{s.label} ({s.mbps} Mbps)</button>
          ))}
        </div>
      </div>
    </div>
  );
}
