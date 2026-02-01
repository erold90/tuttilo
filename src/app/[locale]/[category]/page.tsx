export const runtime = "edge";

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { locales } from "@/i18n/routing";
import {
  categories,
  getToolsByCategory,
  getCategoryClasses,
  type ToolCategoryId,
} from "@/lib/tools/registry";
import { ToolIcon } from "@/components/tool-icon";
import { cn } from "@/lib/utils";

const BASE_URL = "https://tuttilo.com";

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

  const classes = getCategoryClasses(cat.id);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            classes.bg,
            classes.text
          )}
        >
          <ToolIcon name={cat.icon} className="h-5 w-5" />
        </span>
        <div>
          <h1 className={cn("text-3xl font-bold", classes.text)}>
            {tNav(cat.id)}
          </h1>
          <p className="text-muted-foreground mt-1">
            {tHome(`categoryDesc.${cat.id}`)}
          </p>
        </div>
      </div>

      {availableTools.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {availableTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/${category}/${tool.slug}`}
              className={cn(
                "flex flex-col gap-3 rounded-xl border p-5 transition-all hover:shadow-md",
                classes.border,
                classes.hoverBorder
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    classes.bg,
                    classes.text
                  )}
                >
                  <ToolIcon name={tool.icon} className="h-4 w-4" />
                </span>
                <h2 className="font-semibold text-lg">
                  {tTools(`${tool.id}.name`)}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {tTools(`${tool.id}.description`)}
              </p>
              <span className={cn("text-xs font-medium mt-auto", classes.text)}>
                {tCommon("tryNow")} \u2192
              </span>
            </Link>
          ))}
        </div>
      )}

      {comingSoonTools.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-muted-foreground mb-4">
            Coming soon
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
            {comingSoonTools.map((tool) => (
              <div
                key={tool.id}
                className="flex flex-col gap-2 rounded-xl border border-border/50 p-5"
              >
                <div className="flex items-center gap-3">
                  <ToolIcon
                    name={tool.icon}
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <h3 className="font-semibold">
                    {tTools(`${tool.id}.name`)}
                  </h3>
                </div>
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
