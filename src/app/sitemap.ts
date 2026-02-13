import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { tools, categories } from "@/lib/tools/registry";
import { conversions } from "@/lib/tools/conversions";
import { blogArticles } from "@/lib/blog/articles";

const BASE_URL = "https://tuttilo.com";
const DEFAULT_LOCALE = "en";

// Build-time date — refreshed on each deploy
const LAST_UPDATED = new Date();

/** Build locale-prefixed URL: default locale (en) has no prefix */
function localeUrl(locale: string, path = "") {
  if (locale === DEFAULT_LOCALE) {
    return path ? `${BASE_URL}/${path}` : BASE_URL;
  }
  return path ? `${BASE_URL}/${locale}/${path}` : `${BASE_URL}/${locale}`;
}

/** Build alternates map for all locales + x-default */
function alternates(path = "") {
  return {
    languages: {
      ...Object.fromEntries(
        locales.map((l) => [l, localeUrl(l, path)])
      ),
      "x-default": localeUrl(DEFAULT_LOCALE, path),
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage for each locale
  for (const locale of locales) {
    entries.push({
      url: localeUrl(locale),
      lastModified: LAST_UPDATED,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: alternates(),
    });
  }

  // Legal / institutional pages
  const legalPages = ["about", "privacy", "terms", "contact"];
  for (const page of legalPages) {
    for (const locale of locales) {
      entries.push({
        url: localeUrl(locale, page),
        lastModified: LAST_UPDATED,
        changeFrequency: "monthly",
        priority: 0.4,
        alternates: alternates(page),
      });
    }
  }

  // Category pages
  for (const cat of categories) {
    for (const locale of locales) {
      entries.push({
        url: localeUrl(locale, cat.slug),
        lastModified: LAST_UPDATED,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: alternates(cat.slug),
      });
    }
  }

  // Tool pages (only available tools)
  for (const tool of tools) {
    const category = categories.find((c) => c.id === tool.category);
    if (!category || !tool.isAvailable) continue;

    const path = `${category.slug}/${tool.slug}`;
    for (const locale of locales) {
      entries.push({
        url: localeUrl(locale, path),
        lastModified: LAST_UPDATED,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: alternates(path),
      });
    }
  }

  // Blog index
  for (const locale of locales) {
    entries.push({
      url: localeUrl(locale, "blog"),
      lastModified: LAST_UPDATED,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: alternates("blog"),
    });
  }

  // Blog articles
  for (const article of blogArticles) {
    const path = `blog/${article.slug}`;
    for (const locale of locales) {
      entries.push({
        url: localeUrl(locale, path),
        lastModified: new Date(article.date),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: alternates(path),
      });
    }
  }

  // Conversion landing pages
  for (const conv of conversions) {
    const path = `convert/${conv.slug}`;
    for (const locale of locales) {
      entries.push({
        url: localeUrl(locale, path),
        lastModified: LAST_UPDATED,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: alternates(path),
      });
    }
  }

  return entries;
}
