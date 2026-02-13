"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

interface ExtendedContent {
  p2: string;
  p3: string;
  p4: string;
}

const cache: Record<string, Record<string, ExtendedContent>> = {};

async function loadContent(locale: string): Promise<Record<string, ExtendedContent>> {
  if (cache[locale]) return cache[locale];
  try {
    const res = await fetch(`/data/tools/${locale}.json`);
    if (!res.ok) throw new Error("not found");
    const data = await res.json();
    cache[locale] = data;
    return data;
  } catch {
    // Fallback to EN if locale not available
    if (locale !== "en") return loadContent("en");
    return {};
  }
}

export function ToolExtendedContent({ toolId }: { toolId: string }) {
  const locale = useLocale();
  const [content, setContent] = useState<ExtendedContent | null>(null);

  useEffect(() => {
    loadContent(locale).then((data) => {
      if (data[toolId]) setContent(data[toolId]);
    });
  }, [toolId, locale]);

  if (!content) return null;

  return (
    <div className="space-y-4">
      {content.p2 && <p>{content.p2}</p>}
      {content.p3 && <p>{content.p3}</p>}
      {content.p4 && <p>{content.p4}</p>}
    </div>
  );
}
