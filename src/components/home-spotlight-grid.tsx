"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { motion, useInView } from "motion/react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ToolIcon } from "@/components/tool-icon";

export interface SpotlightCardData {
  id: string;
  slug: string;
  category: string;
  categorySlug: string;
  icon: string;
  name: string;
  description: string;
  color: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  hoverBorderClass: string;
}

interface SpotlightGridProps {
  cards: SpotlightCardData[];
  columns?: "3" | "4";
  variant?: "popular" | "category";
}

export function SpotlightGrid({
  cards,
  columns = "3",
  variant = "category",
}: SpotlightGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, margin: "-40px" });
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canHover || !gridRef.current) return;
      const cardEls = gridRef.current.querySelectorAll<HTMLElement>(
        "[data-spotlight-card]"
      );
      cardEls.forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      });
    },
    [canHover]
  );

  const colsClass =
    columns === "4"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div
      ref={gridRef}
      className={cn("grid gap-4", colsClass)}
      onMouseMove={handleMouseMove}
    >
      {cards.map((card, i) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.4,
            delay: Math.min(i * 0.05, 0.4),
            ease: "easeOut",
          }}
        >
          <Link
            href={`/${card.categorySlug}/${card.slug}` as any}
            data-spotlight-card
            className="group block h-full"
            style={
              {
                "--spotlight-color": `${card.color}14`,
              } as React.CSSProperties
            }
          >
            {/* Gradient border wrapper */}
            <div
              className={cn(
                "rounded-xl p-px bg-gradient-to-b from-white/10 to-transparent h-full",
                "transition-transform duration-300",
                "group-hover:-translate-y-1"
              )}
            >
              {/* Inner card */}
              <div
                className={cn(
                  "relative rounded-[11px] bg-slate-950/80 p-4 h-full",
                  "border border-white/[0.04]",
                  "transition-shadow duration-300",
                  "group-hover:shadow-lg",
                  "flex items-center gap-3"
                )}
                data-spotlight-card
                style={
                  {
                    "--spotlight-color": `${card.color}14`,
                  } as React.CSSProperties
                }
              >
                {/* Icon with glow */}
                <span
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-lg icon-glow",
                    variant === "popular" ? "h-10 w-10" : "h-9 w-9",
                    card.bgClass,
                    card.textClass
                  )}
                  style={{ "--glow-color": `${card.color}4D` } as React.CSSProperties}
                >
                  <ToolIcon
                    name={card.icon}
                    className={variant === "popular" ? "h-5 w-5" : "h-4 w-4"}
                  />
                </span>

                {/* Text */}
                <div className="min-w-0 relative z-10">
                  <p className="font-medium text-sm truncate text-slate-100">
                    {card.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
