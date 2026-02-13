"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

interface BlogMeta {
  title: string;
  excerpt: string;
}

let cache: Record<string, Record<string, BlogMeta>> = {};

async function loadBlogMeta(locale: string): Promise<Record<string, BlogMeta>> {
  if (cache[locale]) return cache[locale];
  try {
    const res = await fetch(`/data/blog/${locale}.json`);
    if (!res.ok) throw new Error("not found");
    const data = await res.json();
    const result: Record<string, BlogMeta> = {};
    for (const [slug, val] of Object.entries(data as Record<string, Record<string, unknown>>)) {
      if (val.title && val.excerpt) {
        result[slug] = { title: val.title as string, excerpt: val.excerpt as string };
      }
    }
    cache[locale] = result;
    return result;
  } catch {
    return {};
  }
}

export function TranslatedTitle({
  slug,
  fallback,
  className,
}: {
  slug: string;
  fallback: string;
  className?: string;
}) {
  const locale = useLocale();
  const [text, setText] = useState(fallback);

  useEffect(() => {
    if (locale === "en") return;
    loadBlogMeta(locale).then((meta) => {
      if (meta[slug]?.title) setText(meta[slug].title);
    });
  }, [slug, locale]);

  return <span className={className}>{text}</span>;
}

export function TranslatedExcerpt({
  slug,
  fallback,
  className,
}: {
  slug: string;
  fallback: string;
  className?: string;
}) {
  const locale = useLocale();
  const [text, setText] = useState(fallback);

  useEffect(() => {
    if (locale === "en") return;
    loadBlogMeta(locale).then((meta) => {
      if (meta[slug]?.excerpt) setText(meta[slug].excerpt);
    });
  }, [slug, locale]);

  return <span className={className}>{text}</span>;
}
