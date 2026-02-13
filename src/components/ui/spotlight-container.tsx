"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SpotlightContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function SpotlightContainer({ children, className }: SpotlightContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canHover || !ref.current) return;
      const cards = ref.current.querySelectorAll<HTMLElement>("[data-spotlight-card]");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      });
    },
    [canHover]
  );

  return (
    <div ref={ref} className={cn(className)} onMouseMove={handleMouseMove}>
      {children}
    </div>
  );
}
