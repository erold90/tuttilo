"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface FontPair {
  heading: string;
  body: string;
  style: string;
}

const pairs: FontPair[] = [
  { heading: "Playfair Display", body: "Source Sans 3", style: "elegant" },
  { heading: "Montserrat", body: "Open Sans", style: "modern" },
  { heading: "Lora", body: "Roboto", style: "classic" },
  { heading: "Oswald", body: "Quattrocento", style: "bold" },
  { heading: "Raleway", body: "Lato", style: "minimal" },
  { heading: "Merriweather", body: "Lato", style: "editorial" },
  { heading: "Poppins", body: "Inter", style: "tech" },
  { heading: "Libre Baskerville", body: "Nunito", style: "traditional" },
  { heading: "Work Sans", body: "Bitter", style: "professional" },
  { heading: "Space Grotesk", body: "DM Sans", style: "startup" },
  { heading: "Archivo Black", body: "Roboto", style: "impact" },
  { heading: "Cormorant Garamond", body: "Proza Libre", style: "luxury" },
];

const styles = ["all", "elegant", "modern", "classic", "bold", "minimal", "editorial", "tech", "traditional", "professional", "startup", "impact", "luxury"];

export default function FontPairSuggester() {
  const t = useTranslations("tools.font-pair-suggester.ui");
  const [filter, setFilter] = useState("all");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const filtered = filter === "all" ? pairs : pairs.filter((p) => p.style === filter);

  const copy = (pair: FontPair, idx: number) => {
    const css = `/* Heading */\nfont-family: '${pair.heading}', serif;\n\n/* Body */\nfont-family: '${pair.body}', sans-serif;`;
    navigator.clipboard.writeText(css);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const copyImport = (pair: FontPair) => {
    const hf = pair.heading.replace(/ /g, "+");
    const bf = pair.body.replace(/ /g, "+");
    const link = `<link href="https://fonts.googleapis.com/css2?family=${hf}:wght@700&family=${bf}:wght@400;600&display=swap" rel="stylesheet">`;
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div>
        <label className="mb-2 block text-sm font-medium">{t("filterStyle")}</label>
        <div className="flex flex-wrap gap-2">
          {styles.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"
              }`}
            >
              {t(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Pairs */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((pair, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{t(pair.style)}</span>
              <div className="flex gap-2">
                <button onClick={() => copyImport(pair)} className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted" title={t("copyImport")}>
                  {"</>"}
                </button>
                <button onClick={() => copy(pair, i)} className="rounded border border-border px-2 py-1 text-xs hover:bg-muted">
                  {copiedIdx === i ? t("copied") : t("copyCSS")}
                </button>
              </div>
            </div>
            <p className="text-2xl font-bold leading-tight" style={{ fontFamily: `'${pair.heading}', serif` }}>
              {pair.heading}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground" style={{ fontFamily: `'${pair.body}', sans-serif` }}>
              {t("sampleText")} — {pair.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
