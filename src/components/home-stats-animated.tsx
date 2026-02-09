"use client";

import { motion } from "motion/react";
import { NumberTicker } from "@/components/ui/number-ticker";

interface HomeStatsAnimatedProps {
  toolCount: number;
  categoryCount: number;
  languageCount: number;
  labels: {
    tools: string;
    categories: string;
    languages: string;
  };
}

export function HomeStatsAnimated({
  toolCount,
  categoryCount,
  languageCount,
  labels,
}: HomeStatsAnimatedProps) {
  const stats = [
    { value: toolCount, suffix: "+", label: labels.tools, color: "text-cyan-400" },
    { value: categoryCount, suffix: "", label: labels.categories, color: "text-purple-400" },
    { value: languageCount, suffix: "", label: labels.languages, color: "text-green-400" },
  ];

  return (
    <section className="container mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
        {stats.map(({ value, suffix, label, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="text-center"
          >
            <div className={`text-3xl sm:text-4xl font-bold tabular-nums ${color}`}>
              <NumberTicker value={value} suffix={suffix} delay={0.3 + i * 0.15} />
            </div>
            <p className="text-sm text-slate-400 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
