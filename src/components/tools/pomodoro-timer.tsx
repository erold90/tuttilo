"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

type Phase = "work" | "break" | "longBreak";

export default function PomodoroTimer() {
  const t = useTranslations("tools.pomodoro-timer");
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(4);
  const [phase, setPhase] = useState<Phase>("work");
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const endTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getPhaseMinutes = useCallback((p: Phase) => {
    if (p === "work") return workMin;
    if (p === "break") return breakMin;
    return longBreakMin;
  }, [workMin, breakMin, longBreakMin]);

  const startPhase = useCallback((p: Phase) => {
    setPhase(p);
    const total = getPhaseMinutes(p) * 60;
    setRemaining(total);
    endTimeRef.current = Date.now() + total * 1000;
    setRunning(true);
  }, [getPhaseMinutes]);

  const start = () => {
    if (remaining > 0) {
      endTimeRef.current = Date.now() + remaining * 1000;
      setRunning(true);
    } else {
      startPhase("work");
    }
  };

  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setRemaining(0); setCompleted(0); setPhase("work"); };
  const skip = () => {
    setRunning(false);
    if (phase === "work") {
      const newCompleted = completed + 1;
      setCompleted(newCompleted);
      startPhase(newCompleted % sessionsBeforeLong === 0 ? "longBreak" : "break");
    } else {
      startPhase("work");
    }
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setRemaining(left);
        if (left <= 0) {
          setRunning(false);
          try { new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgip2teleNiIJ6f4WIj5CHdmhcYHCBjoqBdWdhYG55jJSVlJKRjo6OkJKVmZudnp6cnJuanJ6foKCfnp2dnp+goaKioqKioaGhoqOkpaampqampqanqKmqq6ysrKysra2ur7CxsbKysrKzsrO0tba2t7e3t7e3t7e3t7a2tbW0s7OzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSEg4KBgH9+fXx8e3p5eHh3d3Z2dXV1dHR0c3NzcnJycXFxcXFxcXFxcXFycnJyc3N0dHR1dXZ2d3d4eHl5ent7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba2t7i4ubm5ubm5ubm5ubi3t7a1tLOzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSEg4KBgH9+fXx7enl4d3d2dXV0dHNzcnJxcXBwcG9vb29vb29vb3BwcHFxcXJycnN0dHV1dnd3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2tre3uLi4uLi4uLi3t7a2tbS0s7KxsK+uraysq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhISDgoGAf359fHt6eXh3d3Z1dXR0c3NycnFxcHBvb29vb29vb29vcHBwcXFxcnJyc3R0dXV2d3d4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqQ==").play(); } catch {}
          if (phase === "work") {
            const newCompleted = completed + 1;
            setCompleted(newCompleted);
            startPhase(newCompleted % sessionsBeforeLong === 0 ? "longBreak" : "break");
          } else {
            startPhase("work");
          }
        }
      }, 200);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, phase, completed, sessionsBeforeLong, startPhase]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const phaseColor = phase === "work" ? "text-red-500" : phase === "break" ? "text-green-500" : "text-blue-500";
  const phaseBg = phase === "work" ? "bg-red-50 dark:bg-red-900/10" : phase === "break" ? "bg-green-50 dark:bg-green-900/10" : "bg-blue-50 dark:bg-blue-900/10";

  return (
    <div className="space-y-6">
      <div className={`p-8 rounded-xl text-center ${phaseBg}`}>
        <p className={`text-sm font-semibold uppercase ${phaseColor}`}>{t(`ui.${phase}`)}</p>
        <p className="text-7xl font-mono font-bold text-zinc-800 dark:text-zinc-100 mt-2 tabular-nums">{pad(m)}:{pad(s)}</p>
        <p className="text-sm text-zinc-500 mt-2">{t("ui.session")} {completed + 1} / {sessionsBeforeLong}</p>
      </div>
      <div className="flex items-center justify-center gap-3">
        {!running ? (
          <button onClick={start} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.start")}</button>
        ) : (
          <button onClick={pause} className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600">{t("ui.pause")}</button>
        )}
        <button onClick={skip} className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-500">{t("ui.skip")}</button>
        <button onClick={reset} className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-500">{t("ui.reset")}</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.workDuration")}
          <input type="number" min={1} max={120} value={workMin} onChange={e => setWorkMin(Math.max(1, +e.target.value))} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.breakDuration")}
          <input type="number" min={1} max={60} value={breakMin} onChange={e => setBreakMin(Math.max(1, +e.target.value))} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.longBreakDuration")}
          <input type="number" min={1} max={60} value={longBreakMin} onChange={e => setLongBreakMin(Math.max(1, +e.target.value))} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.sessions")}
          <input type="number" min={1} max={12} value={sessionsBeforeLong} onChange={e => setSessionsBeforeLong(Math.max(1, +e.target.value))} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: sessionsBeforeLong }, (_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i < completed % sessionsBeforeLong ? "bg-red-400" : "bg-zinc-200 dark:bg-zinc-700"}`} />
        ))}
      </div>
    </div>
  );
}
