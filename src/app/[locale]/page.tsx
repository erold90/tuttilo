import type { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link, locales } from "@/i18n/routing";
import { ShieldCheck as Shield, Lightning as Zap, Globe, ArrowRight, Monitor, UserMinus as UserX, Lock } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  categories,
  getToolsByCategory,
  getPopularTools,
  getCategoryClasses,
  getCategoryColor,
} from "@/lib/tools/registry";
import { ToolIcon } from "@/components/tool-icon";
import { HomeSearchTrigger } from "@/components/home-search-trigger";
import { HomeUserSections } from "@/components/home-user-sections";
import { SpotlightGrid, type SpotlightCardData } from "@/components/home-spotlight-grid";
import { HomeHeroAnimated } from "@/components/home-hero-animated";
import { HomeTrustAnimated } from "@/components/home-trust-animated";
import { HomeFeaturesAnimated } from "@/components/home-features-animated";

const BASE_URL = "https://tuttilo.com";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const desc = t("subtitle");

  return {
    description: desc,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}`])
        ),
        "x-default": `${BASE_URL}/en`,
      },
    },
    openGraph: {
      description: desc,
      url: `${BASE_URL}/${locale}`,
      type: "website",
      siteName: "Tuttilo",
      locale,
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: "Tuttilo" }],
    },
    twitter: {
      card: "summary_large_image",
      description: desc,
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}

export default function HomePage() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const tTools = useTranslations("tools");
  const tTrust = useTranslations("home.trust");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const popularTools = getPopularTools();

  // Structured data for Google Sitelinks
  const siteNavigationLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tuttilo - Online Tools",
    description: t("subtitle"),
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: categories.length,
    itemListElement: categories.map((cat, i) => ({
      "@type": "SiteNavigationElement",
      position: i + 1,
      name: tNav(cat.id),
      description: tCommon("siteDescription"),
      url: `${BASE_URL}/${locale}/${cat.slug}`,
    })),
  };

  const collectionPageLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Tuttilo — ${t("title")}`,
    description: t("subtitle"),
    url: `${BASE_URL}/${locale}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: popularTools.slice(0, 8).map((tool, i) => {
        const cat = categories.find((c) => c.id === tool.category);
        return {
          "@type": "ListItem",
          position: i + 1,
          name: tTools(`${tool.id}.name`),
          url: `${BASE_URL}/${locale}/${cat?.slug ?? tool.category}/${tool.slug}`,
        };
      }),
    },
  };

  const trustItems = [
    { icon: Monitor, key: "browserOnly", color: "text-green-500 bg-green-500/10" },
    { icon: UserX, key: "noRegistration", color: "text-cyan-500 bg-cyan-500/10" },
    { icon: Zap, key: "alwaysFree", color: "text-yellow-500 bg-yellow-500/10" },
    { icon: Lock, key: "secureByDesign", color: "text-red-500 bg-red-500/10" },
  ];

  // Serialize popular tools for SpotlightGrid
  const popularCards: SpotlightCardData[] = popularTools.map((tool) => {
    const classes = getCategoryClasses(tool.category);
    const cat = categories.find((c) => c.id === tool.category);
    return {
      id: tool.id,
      slug: tool.slug,
      category: tool.category,
      categorySlug: cat?.slug ?? tool.category,
      icon: tool.icon,
      name: tTools(`${tool.id}.name`),
      description: tTools(`${tool.id}.description`),
      color: getCategoryColor(tool.category),
      textClass: classes.text,
      bgClass: classes.bg,
      borderClass: classes.border,
      hoverBorderClass: classes.hoverBorder,
    };
  });

  return (
    <div className="flex flex-col">
      {/* Structured data for Google Sitelinks */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageLd) }} />

      {/* Hero — Minimal gradient + search */}
      <section id="hero-section" className="relative z-20">
        <HomeHeroAnimated
          title={t("title")}
          subtitle={t("subtitle")}
          privacyNote={t("privacyNote")}
          searchTrigger={<HomeSearchTrigger />}
        />
      </section>

      {/* Trust Signals */}
      <HomeTrustAnimated
        srTitle={t("trustTitle")}
        items={trustItems.map(({ icon: Icon, key, color }) => ({
          key,
          title: tTrust(key),
          description: tTrust(`${key}Desc`),
          color,
          icon: <Icon weight="duotone" className="h-4.5 w-4.5" />,
        }))}
      />

      <div className="gradient-divider" />

      {/* Favorites & Recents (client-side, localStorage) */}
      <HomeUserSections />

      <div className="gradient-divider" />

      {/* Popular Tools */}
      <section id="popular-section" className="container mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          {t("popularTools")}
        </h2>
        <SpotlightGrid cards={popularCards} columns="4" variant="popular" />
      </section>

      <div className="gradient-divider" />

      {/* Browse All Categories */}
      <section className="bg-muted/10">
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-3">
            {t("allTools")}
          </h2>
          <p className="text-muted-foreground text-center mb-10 text-sm max-w-lg mx-auto">
            {t("exploreAll")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const catTools = getToolsByCategory(cat.id).filter(
                (tool) => tool.isAvailable
              );
              const classes = getCategoryClasses(cat.id);

              return (
                <Link
                  key={cat.id}
                  href={`/${cat.slug}` as Parameters<typeof Link>[0]["href"]}
                  className={cn(
                    "group relative flex flex-col items-center gap-2 rounded-xl border p-5 transition-all duration-200",
                    "hover:scale-[1.02] hover:shadow-lg",
                    classes.border,
                    classes.cardHover,
                    "bg-background/50 hover:bg-background/80"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      classes.bg
                    )}
                  >
                    <ToolIcon name={cat.icon} className={cn("h-5 w-5", classes.text)} />
                  </span>
                  <h3 className={cn("text-sm font-semibold text-center", classes.text)}>
                    {tNav(cat.id)}
                  </h3>
                  <p className="text-xs text-muted-foreground text-center line-clamp-2 leading-relaxed">
                    {t(`categoryDesc.${cat.id}`)}
                  </p>
                  {catTools.length > 0 && (
                    <span className="text-[10px] text-muted-foreground/60 font-medium">
                      {catTools.length} {catTools.length === 1 ? "tool" : "tools"}
                    </span>
                  )}
                  <ArrowRight className="absolute top-3 right-3 h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="gradient-divider" />

      {/* Features — Animated */}
      <HomeFeaturesAnimated
        features={[
          {
            key: "privacy",
            title: t("features.privacy.title"),
            description: t("features.privacy.desc"),
            icon: <Shield weight="duotone" className="h-6 w-6 text-cyan-500" />,
          },
          {
            key: "fast",
            title: t("features.fast.title"),
            description: t("features.fast.desc"),
            icon: <Zap weight="duotone" className="h-6 w-6 text-cyan-500" />,
          },
          {
            key: "free",
            title: t("features.free.title"),
            description: t("features.free.desc"),
            icon: <Globe weight="duotone" className="h-6 w-6 text-cyan-500" />,
          },
        ]}
      />
    </div>
  );
}
