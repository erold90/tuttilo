"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Minimal gradient background — Lovable-inspired
 * Static gradient mesh at bottom, clean dark at top.
 * Zero animation overhead, pure CSS.
 */
export const AuroraBackground = ({
  className,
  children,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center bg-[#09090b]",
        className,
      )}
      {...props}
    >
      {/* Gradient mesh — anchored at bottom */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          background: [
            "radial-gradient(ellipse 100% 70% at 25% 95%, hsla(190, 90%, 50%, 0.22), transparent 60%)",
            "radial-gradient(ellipse 80% 60% at 70% 90%, hsla(270, 80%, 55%, 0.18), transparent 55%)",
            "radial-gradient(ellipse 70% 50% at 50% 95%, hsla(330, 70%, 55%, 0.12), transparent 50%)",
            "radial-gradient(ellipse 120% 55% at 50% 88%, hsla(220, 85%, 55%, 0.10), transparent 65%)",
          ].join(", "),
        }}
      />

      {children}
    </div>
  );
};
