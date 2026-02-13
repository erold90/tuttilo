"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

interface ArticleSection {
  h: string;
  p: string;
}

export function ArticleContent({ slug }: { slug: string }) {
  const locale = useLocale();
  const [sections, setSections] = useState<ArticleSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Try locale-specific first, fallback to EN
        let articleData = null;
        if (locale !== "en") {
          const localeRes = await fetch(`/data/blog/${locale}.json`);
          if (localeRes.ok) {
            const localeData = await localeRes.json();
            const candidate = localeData[slug];
            // Only use if it has actual sections (s1), not just title/excerpt
            if (candidate?.s1?.h) articleData = candidate;
          }
        }
        // Fallback to EN if locale has no sections
        if (!articleData) {
          const enRes = await fetch("/data/blog/en.json");
          if (!enRes.ok) { setLoading(false); return; }
          const enData = await enRes.json();
          articleData = enData[slug];
        }
        if (!articleData) {
          setLoading(false);
          return;
        }

        // Extract sections s1-s20
        const parsed: ArticleSection[] = [];
        for (let i = 1; i <= 20; i++) {
          const s = articleData[`s${i}`];
          if (!s || !s.h || !s.p) break;
          parsed.push({ h: s.h, p: s.p });
        }
        setSections(parsed);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, locale]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-7 w-1/3 bg-muted rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sections.length === 0) return null;

  return (
    <div className="max-w-none space-y-10">
      {sections.map((section, i) => (
        <section key={i} className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {section.h}
          </h2>
          <div className="space-y-4">
            {section.p.split("\n\n").map((paragraph, j) => (
              <p
                key={j}
                className="text-base leading-7 text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
