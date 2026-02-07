import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { tools, categories } from "@/lib/tools/registry";
import { conversions } from "@/lib/tools/conversions";

const BASE_URL = "https://tuttilo.com";

// Static date to avoid crawl budget waste — update when content changes
const LAST_UPDATED = new Date("2026-02-07");

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage for each locale
  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: LAST_UPDATED,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          ...Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}`])
          ),
          "x-default": `${BASE_URL}/en`,
        },
      },
    });
  }

  // Legal / institutional pages for each locale
  const legalPages = ["about", "privacy", "terms", "contact"];
  for (const page of legalPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/${page}`,
        lastModified: LAST_UPDATED,
        changeFrequency: "monthly",
        priority: 0.4,
        alternates: {
          languages: {
            ...Object.fromEntries(
              locales.map((l) => [l, `${BASE_URL}/${l}/${page}`])
            ),
            "x-default": `${BASE_URL}/en/${page}`,
          },
        },
      });
    }
  }

  // Category pages for each locale (7 categories × 8 locales = 56 URLs)
  for (const cat of categories) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/${cat.slug}`,
        lastModified: LAST_UPDATED,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            ...Object.fromEntries(
              locales.map((l) => [l, `${BASE_URL}/${l}/${cat.slug}`])
            ),
            "x-default": `${BASE_URL}/en/${cat.slug}`,
          },
        },
      });
    }
  }

  // Tool pages for each locale (only available tools)
  for (const tool of tools) {
    const category = categories.find((c) => c.id === tool.category);
    if (!category || !tool.isAvailable) continue;

    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/${category.slug}/${tool.slug}`,
        lastModified: LAST_UPDATED,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: {
            ...Object.fromEntries(
              locales.map((l) => [
                l,
                `${BASE_URL}/${l}/${category.slug}/${tool.slug}`,
              ])
            ),
            "x-default": `${BASE_URL}/en/${category.slug}/${tool.slug}`,
          },
        },
      });
    }
  }

  // Conversion landing pages for each locale
  for (const conv of conversions) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/convert/${conv.slug}`,
        lastModified: LAST_UPDATED,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: {
            ...Object.fromEntries(
              locales.map((l) => [
                l,
                `${BASE_URL}/${l}/convert/${conv.slug}`,
              ])
            ),
            "x-default": `${BASE_URL}/en/convert/${conv.slug}`,
          },
        },
      });
    }
  }

  return entries;
}
