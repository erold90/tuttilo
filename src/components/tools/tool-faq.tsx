"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

interface ToolFaqProps {
  toolId: string;
}

interface FaqData {
  [key: string]: string;
}

export function ToolFaq({ toolId }: ToolFaqProps) {
  const locale = useLocale();
  const t = useTranslations();
  const [faq, setFaq] = useState<FaqData | null>(null);

  useEffect(() => {
    fetch(`/data/faq/${locale}.json`)
      .then((r) => r.json())
      .then((all) => {
        if (all[toolId]) setFaq(all[toolId]);
      })
      .catch(() => {});
  }, [locale, toolId]);

  if (!faq) return null;

  const pairs: { q: string; a: string }[] = [];
  for (let i = 1; i <= 8; i++) {
    const q = faq[`q${i}`];
    const a = faq[`a${i}`];
    if (q && a) pairs.push({ q, a });
  }

  if (pairs.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">{t("common.faq")}</h2>
      <div className="space-y-4">
        {pairs.map((p, i) => (
          <details
            key={i}
            className="group rounded-lg border border-border bg-card p-4"
            open={i === 0}
          >
            <summary className="cursor-pointer font-medium">{p.q}</summary>
            <p className="mt-2 text-muted-foreground">{p.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
