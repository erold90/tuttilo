"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Aurora polygon mesh background
 * Soft, overlapping blurred gradient shapes create
 * an elegant aurora color-play. Pure CSS, GPU-accelerated.
 */
export const AuroraBackground = ({
  className,
  children,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center bg-[#07070c]",
        className,
      )}
      {...props}
    >
      {/* Aurora polygon mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Shape 1 — Cyan, large, bottom-left flowing upward */}
        <div
          className="absolute animate-aurora-drift will-change-transform"
          style={{
            width: "90%",
            height: "90%",
            bottom: "-20%",
            left: "-20%",
            background: "radial-gradient(ellipse 80% 70% at 60% 50%, hsla(185, 80%, 50%, 0.30), hsla(195, 85%, 45%, 0.12) 40%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />

        {/* Shape 2 — Purple/violet, top-right */}
        <div
          className="absolute animate-aurora-drift-reverse will-change-transform"
          style={{
            width: "80%",
            height: "80%",
            top: "-25%",
            right: "-15%",
            background: "radial-gradient(ellipse 70% 80% at 40% 55%, hsla(265, 75%, 55%, 0.28), hsla(280, 70%, 50%, 0.10) 45%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />

        {/* Shape 3 — Pink/magenta, bottom-right */}
        <div
          className="absolute animate-aurora-drift will-change-transform"
          style={{
            width: "70%",
            height: "70%",
            bottom: "-15%",
            right: "-5%",
            background: "radial-gradient(ellipse 75% 65% at 45% 50%, hsla(325, 70%, 55%, 0.22), hsla(340, 65%, 50%, 0.08) 40%, transparent 65%)",
            filter: "blur(110px)",
            animationDelay: "-8s",
          }}
        />

        {/* Shape 4 — Blue/indigo, center-left */}
        <div
          className="absolute animate-aurora-drift-reverse will-change-transform"
          style={{
            width: "75%",
            height: "75%",
            top: "-5%",
            left: "-10%",
            background: "radial-gradient(ellipse 65% 75% at 55% 45%, hsla(220, 80%, 55%, 0.20), hsla(235, 70%, 50%, 0.08) 40%, transparent 65%)",
            filter: "blur(100px)",
            animationDelay: "-12s",
          }}
        />

        {/* Shape 5 — Teal glow, center, subtle pulse */}
        <div
          className="absolute animate-aurora-pulse will-change-transform"
          style={{
            width: "60%",
            height: "55%",
            top: "20%",
            left: "20%",
            background: "radial-gradient(ellipse at center, hsla(190, 85%, 50%, 0.15), hsla(200, 80%, 45%, 0.05) 45%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        {/* Shape 6 — Warm accent, bottom-center overlap */}
        <div
          className="absolute animate-aurora-drift will-change-transform"
          style={{
            width: "65%",
            height: "50%",
            bottom: "-10%",
            left: "15%",
            background: "radial-gradient(ellipse 80% 60% at 50% 40%, hsla(290, 60%, 50%, 0.14), hsla(310, 55%, 45%, 0.06) 40%, transparent 65%)",
            filter: "blur(120px)",
            animationDelay: "-18s",
          }}
        />

        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />

        {/* Soft edge vignette — much lighter than before */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 45%, transparent 40%, #07070c 85%)",
          }}
        />
      </div>

      {children}
    </div>
  );
};
