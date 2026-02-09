"use client";

import { motion } from "motion/react";

interface FeatureItem {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface HomeFeaturesAnimatedProps {
  features: FeatureItem[];
}

export function HomeFeaturesAnimated({ features }: HomeFeaturesAnimatedProps) {
  return (
    <section
      id="features-section"
      className="container mx-auto max-w-7xl px-4 py-16"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map(({ key, title, description, icon }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="text-center space-y-3"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10"
            >
              {icon}
            </motion.div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
