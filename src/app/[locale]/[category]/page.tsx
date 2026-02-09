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
import { CheckCircle, Question } from "@phosphor-icons/react/dist/ssr";

const BASE_URL = "https://tuttilo.com";

export function generateStaticParams() {
  return categories.flatMap((cat) =>
    locales.map((locale) => ({ locale, category: cat.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return {};

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tCat = await getTranslations({ locale, namespace: "categories" });
  const name = tNav(cat.id);
  const description = tCat(`${cat.id}.description`);
  const title = tCat(`${cat.id}.title`);

  return {
    title: `${title} | Tuttilo`,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/${category}`,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}/${category}`])
        ),
        "x-default": `${BASE_URL}/en/${category}`,
      },
    },
    openGraph: {
      title: `${title} | Tuttilo`,
      description,
      url: `${BASE_URL}/${locale}/${category}`,
      siteName: "Tuttilo",
      locale,
      type: "website",
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${title} | Tuttilo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Tuttilo`,
      description,
      images: [`${BASE_URL}/og-image.png`],
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
  const tCat = await getTranslations({ locale, namespace: "categories" });

  const classes = getCategoryClasses(cat.id);
  const catKey = cat.id as ToolCategoryId;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tNav("home"), item: `${BASE_URL}/${locale}`, "@id": `${BASE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: tNav(cat.id), item: `${BASE_URL}/${locale}/${category}`, "@id": `${BASE_URL}/${locale}/${category}` },
    ],
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: tCat(`${catKey}.title`),
    description: tCat(`${catKey}.description`),
    url: `${BASE_URL}/${locale}/${category}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: availableTools.length,
      itemListElement: availableTools.map((tool, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: tTools(`${tool.id}.name`),
        url: `${BASE_URL}/${locale}/${category}/${tool.slug}`,
      })),
    },
  };

  const faqEntries: Array<{ "@type": string; name: string; acceptedAnswer: { "@type": string; text: string } }> = [];
  for (let n = 1; n <= 3; n++) {
    try {
      const q = tCat(`${catKey}.faq.q${n}`);
      const a = tCat(`${catKey}.faq.a${n}`);
      if (q && !q.startsWith("categories.") && a && !a.startsWith("categories.")) {
        faqEntries.push({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } });
      }
    } catch { break; }
  }

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries,
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Header */}
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
            {tCat(`${catKey}.title`)}
          </h1>
          <p className="text-muted-foreground mt-1">
            {tCat(`${catKey}.description`)}
          </p>
        </div>
      </div>

      {/* Tool grid */}
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
                {tCommon("tryNow")} {"\u2192"}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Coming soon */}
      {comingSoonTools.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-muted-foreground mb-4">
            {tCommon("comingSoon")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
            {comingSoonTools.map((tool) => (
              <div
                key={tool.id}
                className="relative flex flex-col gap-2 rounded-xl border border-border/50 p-5"
              >
                <span className="absolute top-3 right-3 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {tCommon("comingSoon")}
                </span>
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

      {/* Why Use section */}
      <section className="mb-12 rounded-2xl border bg-muted/30 p-6 sm:p-8">
        <h2 className="text-xl font-bold mb-4">
          {tCat(`${catKey}.whyTitle`)}
        </h2>
        <ul className="space-y-3">
          {[1, 2, 3].map((n) => (
            <li key={n} className="flex items-start gap-3">
              <CheckCircle weight="fill" className={cn("mt-0.5 h-5 w-5 shrink-0", classes.text)} />
              <span className="text-muted-foreground">
                {tCat(`${catKey}.why${n}`)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Question weight="fill" className={cn("h-5 w-5", classes.text)} />
          {tCommon("faqTitle")}
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <details key={n} className="group rounded-xl border p-4">
              <summary className="cursor-pointer font-medium list-none flex items-center justify-between">
                {tCat(`${catKey}.faq.q${n}`)}
                <span className="ml-2 transition-transform group-open:rotate-45 text-muted-foreground">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {tCat(`${catKey}.faq.a${n}`)}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
