"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

export default function CountdownTimer() {
  const t = useTranslations("tools.countdown-timer");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef(0);

  const start = useCallback(() => {
    const total = remaining > 0 ? remaining : hours * 3600 + minutes * 60 + seconds;
    if (total <= 0) return;
    endTimeRef.current = Date.now() + total * 1000;
    setRemaining(total);
    setRunning(true);
  }, [hours, minutes, seconds, remaining]);

  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setRemaining(0); };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setRemaining(left);
        if (left <= 0) {
          setRunning(false);
          try { new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgip2teleNiIJ6f4WIj5CHdmhcYHCBjoqBdWdhYG55jJSVlJKRjo6OkJKVmZudnp6cnJuanJ6foKCfnp2dnp+goaKioqKioaGhoqOkpaampqampqanqKmqq6ysrKysra2ur7CxsbKysrKzsrO0tba2t7e3t7e3t7e3t7a2tbW0s7OzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSEg4KBgH9+fXx8e3p5eHh3d3Z2dXV1dHR0c3NzcnJycXFxcXFxcXFxcXFycnJyc3N0dHR1dXZ2d3d4eHl5ent7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba2t7i4ubm5ubm5ubm5ubi3t7a1tLOzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSEg4KBgH9+fXx7enl4d3d2dXV0dHNzcnJxcXBwcG9vb29vb29vb3BwcHFxcXJycnN0dHV1dnd3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2tre3uLi4uLi4uLi3t7a2tbS0s7KxsK+uraysq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhISDgoGAf359fHt6eXh3d3Z1dXR0c3NycnFxcHBvb29vb29vb29vcHBwcXFxcnJyc3R0dXV2d3d4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqQ==").play(); } catch {}
        }
      }, 100);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const progress = (() => {
    const total = hours * 3600 + minutes * 60 + seconds;
    if (total <= 0) return 0;
    return ((total - remaining) / total) * 100;
  })();

  return (
    <div className="space-y-6">
      {!running && remaining === 0 && (
        <div className="flex items-center justify-center gap-4">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">{t("ui.hours")}
            <input type="number" min={0} max={99} value={hours} onChange={e => setHours(Math.max(0, +e.target.value))} className="ml-2 w-20 px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-center text-lg" />
          </label>
          <span className="text-2xl text-zinc-400">:</span>
          <label className="text-sm text-zinc-600 dark:text-zinc-400">{t("ui.minutes")}
            <input type="number" min={0} max={59} value={minutes} onChange={e => setMinutes(Math.max(0, +e.target.value))} className="ml-2 w-20 px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-center text-lg" />
          </label>
          <span className="text-2xl text-zinc-400">:</span>
          <label className="text-sm text-zinc-600 dark:text-zinc-400">{t("ui.seconds")}
            <input type="number" min={0} max={59} value={seconds} onChange={e => setSeconds(Math.max(0, +e.target.value))} className="ml-2 w-20 px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-center text-lg" />
          </label>
        </div>
      )}
      {(running || remaining > 0) && (
        <div className="text-center">
          <p className="text-6xl font-mono font-bold text-zinc-800 dark:text-zinc-100">{pad(h)}:{pad(m)}:{pad(s)}</p>
          <div className="mt-4 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}
      <div className="flex items-center justify-center gap-3">
        {!running ? (
          <button onClick={start} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{remaining > 0 ? t("ui.resume") : t("ui.start")}</button>
        ) : (
          <button onClick={pause} className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600">{t("ui.pause")}</button>
        )}
        <button onClick={reset} className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-500">{t("ui.reset")}</button>
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {[1, 5, 10, 15, 25, 30, 60].map(min => (
          <button key={min} onClick={() => { setHours(0); setMinutes(min); setSeconds(0); setRemaining(0); }} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded text-sm hover:bg-zinc-200 dark:hover:bg-zinc-600">{min} min</button>
        ))}
      </div>
    </div>
  );
}
