"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { ToolIcon } from "@/components/tool-icon";
import { cn } from "@/lib/utils";

interface CategoryPill {
  id: string;
  slug: string;
  icon: string;
  label: string;
  color: string;
}

interface HomeCategoryNavProps {
  categories: CategoryPill[];
}

export function HomeCategoryNav({ categories }: HomeCategoryNavProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const scrollToCategory = useCallback((slug: string) => {
    const el = document.getElementById(`category-${slug}`);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const animatedSections = document.querySelectorAll(".animate-on-scroll");
    const categoryEls = categories
      .map((c) => document.getElementById(`category-${c.slug}`))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.classList.contains("animate-on-scroll")) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          }
          const id = entry.target.id;
          if (id.startsWith("category-") && entry.isIntersecting) {
            setActiveId(id.replace("category-", ""));
          }
        });
      },
      {
        rootMargin: "-60px 0px -10% 0px",
        threshold: 0.05,
      }
    );

    animatedSections.forEach((el) => observer.observe(el));
    categoryEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [categories]);

  return (
    <nav
      ref={navRef}
      aria-label="Category navigation"
      className="z-30 bg-transparent"
    >
      <div className="container mx-auto max-w-7xl px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToCategory(cat.slug)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium",
                "border transition-colors duration-200 cursor-pointer",
                "shrink-0",
                activeId === cat.slug
                  ? "border-current bg-current/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300"
              )}
              aria-current={activeId === cat.slug ? "true" : undefined}
              style={
                activeId === cat.slug
                  ? { color: cat.color }
                  : undefined
              }
            >
              <ToolIcon name={cat.icon} className="h-4 w-4" />
              <span>{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </nav>
  );
}
