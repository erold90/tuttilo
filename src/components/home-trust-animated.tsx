"use client";

import { motion } from "motion/react";

interface TrustItem {
  key: string;
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

interface HomeTrustAnimatedProps {
  items: TrustItem[];
  srTitle: string;
}

export function HomeTrustAnimated({ items, srTitle }: HomeTrustAnimatedProps) {
  return (
    <section id="trust-section">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h2 className="sr-only">{srTitle}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map(({ key, title, description, color, icon }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-start gap-2.5 p-3 border border-white/[0.04] rounded-xl transition-colors duration-300 hover:border-white/[0.08]"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}
              >
                {icon}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm leading-tight">{title}</p>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 hidden sm:block">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
