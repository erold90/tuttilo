"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

export default function Stopwatch() {
  const t = useTranslations("tools.stopwatch");
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    let raf: number;
    if (running) {
      startRef.current = performance.now() - offsetRef.current;
      const tick = () => {
        setElapsed(performance.now() - startRef.current);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const start = () => { setRunning(true); };
  const pause = () => { setRunning(false); offsetRef.current = elapsed; };
  const reset = () => { setRunning(false); setElapsed(0); offsetRef.current = 0; setLaps([]); };
  const lap = () => setLaps(prev => [elapsed, ...prev]);

  const fmt = (ms: number) => {
    const totalMs = Math.floor(ms);
    const h = Math.floor(totalMs / 3600000);
    const m = Math.floor((totalMs % 3600000) / 60000);
    const s = Math.floor((totalMs % 60000) / 1000);
    const cs = Math.floor((totalMs % 1000) / 10);
    const pad = (n: number, d = 2) => String(n).padStart(d, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}` : `${pad(m)}:${pad(s)}.${pad(cs)}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-6xl font-mono font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">{fmt(elapsed)}</p>
      </div>
      <div className="flex items-center justify-center gap-3">
        {!running ? (
          <button onClick={start} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{elapsed > 0 ? t("ui.resume") : t("ui.start")}</button>
        ) : (
          <>
            <button onClick={pause} className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600">{t("ui.pause")}</button>
            <button onClick={lap} className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">{t("ui.lap")}</button>
          </>
        )}
        <button onClick={reset} className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-500">{t("ui.reset")}</button>
      </div>
      {laps.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t("ui.laps")}</h3>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {laps.map((l, i) => (
              <div key={i} className="flex justify-between px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded text-sm">
                <span className="text-zinc-500">#{laps.length - i}</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">{fmt(l)}</span>
                {i < laps.length - 1 && <span className="text-xs text-zinc-400">+{fmt(l - laps[i + 1])}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
