"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
      const offset = 80; // account for sticky header
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
          // Scroll animations
          if (entry.target.classList.contains("animate-on-scroll")) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          }

          // Active category tracking
          const id = entry.target.id;
          if (id.startsWith("category-") && entry.isIntersecting) {
            setActiveId(id.replace("category-", ""));
          }
        });
      },
      {
        rootMargin: "-80px 0px -40% 0px",
        threshold: 0.1,
      }
    );

    animatedSections.forEach((el) => observer.observe(el));
    categoryEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [categories]);

  return (
    <nav
      ref={navRef}
      className="z-30 bg-transparent"
    >
      <div className="container mx-auto max-w-7xl px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.slug)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium",
                "border transition-all duration-200 cursor-pointer",
                "shrink-0",
                activeId === cat.slug
                  ? "border-current bg-current/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300"
              )}
              style={
                activeId === cat.slug
                  ? { color: cat.color }
                  : undefined
              }
            >
              <ToolIcon name={cat.icon} className="h-4 w-4" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
