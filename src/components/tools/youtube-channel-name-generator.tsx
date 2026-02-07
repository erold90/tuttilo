"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

const PREFIXES = ["The", "My", "Pro", "Epic", "Daily", "Ultra", "Super", "Mega", "Next", "Real", "True", "Top", "Prime", "Best", "Alpha"];
const SUFFIXES = ["TV", "HQ", "Hub", "Zone", "Lab", "Studio", "Media", "World", "Central", "Nation", "Vibes", "Life", "Show", "Talks", "Guru"];
const PATTERNS = [
  (k: string, _n: string) => k + " " + SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)],
  (k: string, _n: string) => PREFIXES[Math.floor(Math.random() * PREFIXES.length)] + " " + k,
  (k: string, n: string) => k + n.charAt(0).toUpperCase() + n.slice(1),
  (_k: string, n: string) => PREFIXES[Math.floor(Math.random() * PREFIXES.length)] + n.charAt(0).toUpperCase() + n.slice(1),
  (k: string, _n: string) => k + "ify",
  (k: string, _n: string) => k + "verse",
  (k: string, n: string) => k + " & " + n,
  (k: string, _n: string) => k.toUpperCase() + " " + SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)],
  (k: string, _n: string) => "Just" + k.charAt(0).toUpperCase() + k.slice(1),
  (k: string, n: string) => n.charAt(0).toUpperCase() + n.slice(1) + "With" + k.charAt(0).toUpperCase() + k.slice(1),
];

export function YoutubeChannelNameGenerator() {
  const t = useTranslations("tools.youtube-channel-name-generator.ui");
  const [keyword, setKeyword] = useState("");
  const [niche, setNiche] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  const generate = useCallback(() => {
    const k = keyword.trim() || "Creator";
    const n = niche.trim() || "Channel";
    const results = new Set<string>();
    while (results.size < 20) {
      const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
      const name = pattern(k, n);
      if (name.length > 3 && name.length < 40) results.add(name);
    }
    setNames(Array.from(results));
  }, [keyword, niche]);

  const copyName = useCallback((name: string, idx: number) => {
    navigator.clipboard.writeText(name);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">{t("keyword")}</label>
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={t("keywordPlaceholder")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("niche")}</label>
          <input type="text" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder={t("nichePlaceholder")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      <button onClick={generate} className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
        {t("generate")}
      </button>

      {names.length > 0 && (
        <div className="grid gap-2 md:grid-cols-2">
          {names.map((name, i) => (
            <button key={i} onClick={() => copyName(name, i)}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left">
              <span>{name}</span>
              <span className="text-xs text-muted-foreground">{copied === i ? t("copied") : t("clickToCopy")}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
