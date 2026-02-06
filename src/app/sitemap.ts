import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { tools, categories } from "@/lib/tools/registry";

const BASE_URL = "https://tuttilo.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage for each locale
  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
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

  // Category pages for each locale
  for (const category of categories) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            ...Object.fromEntries(
              locales.map((l) => [l, `${BASE_URL}/${l}/${category.slug}`])
            ),
            "x-default": `${BASE_URL}/en/${category.slug}`,
          },
        },
      });
    }
  }

  // Tool pages for each locale
  for (const tool of tools) {
    const category = categories.find((c) => c.id === tool.category);
    if (!category) continue;

    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/${category.slug}/${tool.slug}`,
        lastModified: new Date(),
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

  return entries;
}
