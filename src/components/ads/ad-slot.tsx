"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  slot: string;
  width: number;
  height: number;
  className?: string;
}

export function AdSlot({ slot, width, height, className }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
      data-ad-slot={slot}
      aria-hidden="true"
    >
      {isVisible && (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center",
            "rounded-lg border border-dashed border-muted-foreground/15 bg-muted/30",
            "dark:border-muted-foreground/10 dark:bg-muted/10"
          )}
        >
          <span className="text-xs text-muted-foreground/40">
            Advertisement
          </span>
        </div>
      )}

      {/* Ad label */}
      <span className="absolute right-1 top-1 text-[10px] leading-none text-muted-foreground/30">
        Ad
      </span>
    </div>
  );
}
