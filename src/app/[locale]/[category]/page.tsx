export const runtime = "edge";

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { locales } from "@/i18n/routing";
import {
  categories,
  getToolsByCategory,
  type ToolCategoryId,
} from "@/lib/tools/registry";

const BASE_URL = "https://tuttilo.com";

const categoryColors: Record<string, string> = {
  pdf: "border-red-500/20 hover:border-red-500/40",
  image: "border-green-500/20 hover:border-green-500/40",
  video: "border-violet-500/20 hover:border-violet-500/40",
  audio: "border-orange-500/20 hover:border-orange-500/40",
  text: "border-blue-500/20 hover:border-blue-500/40",
  developer: "border-teal-500/20 hover:border-teal-500/40",
  youtube: "border-pink-500/20 hover:border-pink-500/40",
};

const categoryTextColors: Record<string, string> = {
  pdf: "text-red-500",
  image: "text-green-500",
  video: "text-violet-500",
  audio: "text-orange-500",
  text: "text-blue-500",
  developer: "text-teal-500",
  youtube: "text-pink-500",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return {};

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tHome = await getTranslations({ locale, namespace: "home" });
  const name = tNav(cat.id);
  const description = tHome(`categoryDesc.${cat.id}`);

  return {
    title: `${name} | Tuttilo`,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/${category}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}/${category}`])
      ),
    },
    openGraph: {
      title: `${name} | Tuttilo`,
      description,
      url: `${BASE_URL}/${locale}/${category}`,
      siteName: "Tuttilo",
      locale,
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;

  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const tools = getToolsByCategory(cat.id);
  const availableTools = tools.filter((t) => t.isAvailable);
  const comingSoonTools = tools.filter((t) => !t.isAvailable);

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tTools = await getTranslations({ locale, namespace: "tools" });
  const tHome = await getTranslations({ locale, namespace: "home" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const borderColor = categoryColors[cat.id] || "";
  const textColor = categoryTextColors[cat.id] || "";

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${textColor}`}>{tNav(cat.id)}</h1>
        <p className="text-muted-foreground mt-2">
          {tHome(`categoryDesc.${cat.id}`)}
        </p>
      </div>

      {availableTools.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {availableTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/${category}/${tool.slug}`}
              className={`flex flex-col gap-2 rounded-xl border p-5 transition-all hover:shadow-md ${borderColor}`}
            >
              <h2 className="font-semibold text-lg">{tTools(`${tool.id}.name`)}</h2>
              <p className="text-sm text-muted-foreground">
                {tTools(`${tool.id}.description`)}
              </p>
              <span className={`text-xs font-medium mt-auto ${textColor}`}>
                {tCommon("tryNow")} →
              </span>
            </Link>
          ))}
        </div>
      )}

      {comingSoonTools.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-muted-foreground mb-4">Coming soon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
            {comingSoonTools.map((tool) => (
              <div
                key={tool.id}
                className="flex flex-col gap-2 rounded-xl border border-border/50 p-5"
              >
                <h3 className="font-semibold">{tTools(`${tool.id}.name`)}</h3>
                <p className="text-sm text-muted-foreground">
                  {tTools(`${tool.id}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
