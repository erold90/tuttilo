"use client";

import { motion } from "motion/react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ShieldCheck as Shield } from "@/components/icons";
import { LogoIcon } from "@/components/logo";

interface HomeHeroAnimatedProps {
  title: string;
  subtitle: string;
  privacyNote: string;
  searchTrigger: React.ReactNode;
}

export function HomeHeroAnimated({
  title,
  subtitle,
  privacyNote,
  searchTrigger,
}: HomeHeroAnimatedProps) {
  return (
    <AuroraBackground className="min-h-[58vh] md:min-h-[68vh] py-8 md:py-12">
      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="mx-auto max-w-3xl text-center space-y-4 md:space-y-5">
          {/* Brand — Icon + Neon glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <LogoIcon
              className="h-14 w-14 md:h-18 md:w-18 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            />
            <span
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight tracking-tight select-none lowercase"
              style={{
                fontFamily: "var(--font-heading)",
                color: "#fff",
                textShadow: [
                  "0 0 5px rgba(255,255,255,0.9)",
                  "0 0 10px rgba(255,255,255,0.5)",
                  "0 0 20px #06b6d4",
                  "0 0 40px rgba(6,182,212,0.6)",
                  "0 0 60px rgba(6,182,212,0.3)",
                  "0 0 80px rgba(6,182,212,0.15)",
                ].join(", "),
              }}
            >
              tuttilo
            </span>
          </motion.div>

          {/* Title — split on ". " for line break */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
          >
            {title.includes(". ") ? (
              <h1 className="text-2xl sm:text-3xl md:text-4xl tracking-tight font-bold text-white">
                {title.split(". ").map((part, i, arr) => (
                  <span key={i}>
                    {part}{i < arr.length - 1 ? "." : ""}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </h1>
            ) : (
              <TextGenerateEffect
                words={title}
                className="text-2xl sm:text-3xl md:text-4xl tracking-tight"
                duration={0.4}
              />
            )}
          </motion.div>

          {/* Subtitle — muted */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            className="text-base text-white/40 md:text-lg leading-relaxed max-w-xl mx-auto"
          >
            {subtitle}
          </motion.p>

          {/* Search — THE hero element */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="pt-1"
          >
            {searchTrigger}
          </motion.div>

          {/* Privacy note — whisper */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex items-center justify-center gap-1.5 text-[11px] text-white/20"
          >
            <Shield className="h-3 w-3" />
            {privacyNote}
          </motion.p>
        </div>
      </div>
    </AuroraBackground>
  );
}
