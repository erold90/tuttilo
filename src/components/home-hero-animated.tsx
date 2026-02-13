"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ShieldCheck as Shield } from "@/components/icons";

/* ── Animated Logo: 4 quadrants appear with staggered spring ── */

const CYAN = "#06B6D4";

const logoPaths = [
  // top-left
  "M4847 7282 c63 -33 106 -74 133 -129 l25 -48 3 -396 c3 -377 2 -399 -18 -450 -24 -64 -83 -129 -148 -161 -46 -23 -53 -23 -420 -26 -416 -3 -444 0 -523 61 -23 17 -56 57 -73 87 l-31 55 0 415 0 415 27 51 c31 60 73 98 143 131 l50 23 395 -2 c388 -3 396 -3 437 -26Z",
  // top-right (with notch)
  "M6295 7284 c53 -29 100 -75 124 -122 37 -73 43 -140 39 -517 -3 -342 -4 -362 -24 -406 -46 -99 -136 -159 -250 -167 -105 -7 -174 17 -241 84 -67 66 -83 119 -83 267 0 126 -11 171 -52 222 -52 63 -94 77 -253 84 -104 5 -148 12 -173 25 -44 23 -105 87 -128 134 -26 52 -30 167 -10 230 32 94 128 177 222 190 26 4 214 5 418 2 355 -5 373 -6 411 -26Z",
  // bottom-left
  "M4859 5815 c61 -34 123 -108 141 -170 8 -28 10 -157 8 -435 l-3 -395 -27 -45 c-35 -60 -83 -105 -138 -129 -43 -19 -69 -20 -437 -22 l-391 -1 -68 33 c-57 28 -73 42 -105 92 -21 32 -41 77 -44 100 -3 23 -5 213 -3 422 3 375 3 381 26 423 13 24 43 63 66 87 74 74 78 74 526 72 l395 -2 54 -30Z",
  // bottom-right
  "M6287 5822 c66 -35 110 -79 140 -140 l28 -57 0 -396 0 -395 -30 -59 c-34 -66 -101 -125 -166 -144 -27 -8 -155 -12 -417 -11 -418 0 -436 3 -508 64 -22 19 -53 58 -69 87 l-30 54 0 410 c0 382 1 412 19 445 34 65 85 118 138 144 l53 27 400 -3 c393 -3 401 -3 442 -26Z",
];

// Staggered delays for spiral appearance: TL → TR → BL → BR
const quadrantDelays = [0, 0.15, 0.3, 0.45];

function AnimatedLogo() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Glow pulse behind logo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          background: `radial-gradient(circle, ${CYAN}30 0%, ${CYAN}10 40%, transparent 70%)`,
          filter: "blur(30px)",
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.6, 0.4], scale: [0.6, 1.2, 1] }}
        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
      />
      {/* SVG logo with staggered quadrants */}
      <motion.svg
        viewBox="350 265 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 md:h-20 md:w-20 relative z-[1]"
        style={{
          filter: `drop-shadow(0 0 15px ${CYAN}80) drop-shadow(0 0 35px ${CYAN}30)`,
        }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, delay: 0.6, type: "spring", stiffness: 60, damping: 12 }}
      >
        <g transform="translate(0,1024) scale(0.1,-0.1)" fill={CYAN} stroke="none">
          {logoPaths.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: quadrantDelays[i],
                duration: 0.6,
                type: "spring",
                stiffness: 120,
                damping: 10,
              }}
              style={{ transformOrigin: "center", transformBox: "fill-box" }}
            />
          ))}
        </g>
      </motion.svg>
    </div>
  );
}

/* ── Main Hero ── */

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
  const [searchFocused, setSearchFocused] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onFocusIn = (e: FocusEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") setSearchFocused(true);
    };
    const onFocusOut = (e: FocusEvent) => {
      // Only unfocus if the new focus target is outside the hero
      if (!hero.contains(e.relatedTarget as Node)) setSearchFocused(false);
    };
    hero.addEventListener("focusin", onFocusIn);
    hero.addEventListener("focusout", onFocusOut);
    return () => {
      hero.removeEventListener("focusin", onFocusIn);
      hero.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return (
    <AuroraBackground className="min-h-[58vh] md:min-h-[68vh] py-8 md:py-12">
      <div ref={heroRef} className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="mx-auto max-w-3xl text-center space-y-4 md:space-y-5">
          {/* Brand — Animated logo + neon text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={searchFocused ? { opacity: 0, scale: 0.6, marginBottom: -80 } : { opacity: 1, scale: 1, marginBottom: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <AnimatedLogo />
            </motion.div>
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

          {/* Title + Subtitle — collapse when search focused */}
          <motion.div
            animate={searchFocused
              ? { opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }
              : { opacity: 1, height: "auto", marginTop: undefined, marginBottom: undefined }
            }
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            {/* Title — split on ". " for line break */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: searchFocused ? 0 : 1, y: searchFocused ? -10 : 0 }}
              transition={{ duration: 0.8, delay: searchFocused ? 0 : 0.12, ease: "easeOut" }}
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
              animate={{ opacity: searchFocused ? 0 : 1, y: searchFocused ? -10 : 0 }}
              transition={{ duration: 0.7, delay: searchFocused ? 0 : 0.4, ease: "easeOut" }}
              className="text-base text-white/40 md:text-lg leading-relaxed max-w-xl mx-auto mt-4"
            >
              {subtitle}
            </motion.p>
          </motion.div>

          {/* Search — THE hero element */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: searchFocused ? 1.03 : 1,
            }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="pt-1"
          >
            <div className={`mx-auto transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${searchFocused ? "max-w-3xl" : "max-w-2xl"}`}>
              {searchTrigger}
            </div>
          </motion.div>

          {/* Privacy note — whisper */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: searchFocused ? 0 : 1 }}
            transition={{ duration: 0.3 }}
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
