"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useInView } from "motion/react";

interface NumberTickerProps {
  value: number;
  className?: string;
  suffix?: string;
  delay?: number;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function NumberTicker({
  value,
  className = "",
  suffix = "",
  delay = 0,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const [display, setDisplay] = useState(0);

  const animate = useCallback(() => {
    const duration = 1500; // ms
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  }, [value]);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(animate, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, delay, animate]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
