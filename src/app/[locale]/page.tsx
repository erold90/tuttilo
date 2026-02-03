import type { Metadata } from "next";
import { useTranslations } from "next-intl";
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
import { HomeCategoryNav } from "@/components/home-category-nav";

const BASE_URL = "https://tuttilo.com";

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
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}`])
      ),
    },
    openGraph: { description: desc },
    twitter: { description: desc },
  };
}

export default function HomePage() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const tTools = useTranslations("tools");
  const tTrust = useTranslations("home.trust");

  const popularTools = getPopularTools();

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

  // Serialize category nav pills
  const categoryPills = categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    icon: cat.icon,
    label: tNav(cat.id),
    color: getCategoryColor(cat.id),
  }));

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section id="hero-section" className="relative overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero-bg.webm" type="video/webm" />
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
        <div className="container mx-auto max-w-7xl px-4 py-10 md:py-16 relative">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-white">
              {t("title")}
            </h1>
            <p className="text-lg text-white/80 md:text-xl leading-relaxed">
              {t("subtitle")}
            </p>
            <HomeSearchTrigger />
            <div className="flex items-center justify-center gap-2 text-sm text-white/70">
              <Shield className="h-4 w-4 text-green-400" />
              <span>{t("privacyNote")}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="gradient-divider" />

      {/* Trust Signals — glassmorphism (#7) */}
      <section id="trust-section" className="animate-on-scroll bg-muted/10">
        <div className="container mx-auto max-w-7xl px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustItems.map(({ icon: Icon, key, color }) => (
              <div
                key={key}
                className="flex items-start gap-3 p-4 bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}
                >
                  <Icon weight="duotone" className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{tTrust(key)}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tTrust(`${key}Desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="gradient-divider" />

      {/* Category Navigation Pills */}
      <HomeCategoryNav categories={categoryPills} />

      {/* Favorites & Recents (client-side, localStorage) */}
      <HomeUserSections />

      <div className="gradient-divider" />

      {/* Popular Tools */}
      <section id="popular-section" className="animate-on-scroll container mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          {t("popularTools")}
        </h2>
        <SpotlightGrid cards={popularCards} columns="4" variant="popular" />
      </section>

      <div className="gradient-divider" />

      {/* All Tools by Category */}
      <section className="bg-muted/10">
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-12">
            {t("allTools")}
          </h2>
          <div className="space-y-12">
            {categories.map((cat) => {
              const catTools = getToolsByCategory(cat.id).filter(
                (tool) => tool.isAvailable
              );
              if (catTools.length === 0) return null;
              const classes = getCategoryClasses(cat.id);

              // Serialize category tools for SpotlightGrid
              const catCards: SpotlightCardData[] = catTools.map((tool) => ({
                id: tool.id,
                slug: tool.slug,
                category: tool.category,
                categorySlug: cat.slug,
                icon: tool.icon,
                name: tTools(`${tool.id}.name`),
                description: tTools(`${tool.id}.description`),
                color: getCategoryColor(tool.category),
                textClass: classes.text,
                bgClass: classes.bg,
                borderClass: classes.border,
                hoverBorderClass: classes.hoverBorder,
              }));

              return (
                <div
                  key={cat.id}
                  id={`category-${cat.slug}`}
                  className="animate-on-scroll"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        classes.bg,
                        classes.text
                      )}
                    >
                      <ToolIcon name={cat.icon} className="h-4 w-4" />
                    </span>
                    <Link
                      href={`/${cat.slug}` as any}
                      className="group flex items-center gap-2"
                    >
                      <h3 className={cn("text-lg font-semibold", classes.text)}>
                        {tNav(cat.id)}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        ({catTools.length})
                      </span>
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
                    </Link>
                  </div>
                  <SpotlightGrid cards={catCards} columns="3" variant="category" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="gradient-divider" />

      {/* Features */}
      <section id="features-section" className="animate-on-scroll container mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
              <Shield weight="duotone" className="h-6 w-6 text-cyan-500" />
            </div>
            <h3 className="font-semibold">{t("features.privacy.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("features.privacy.desc")}
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
              <Zap weight="duotone" className="h-6 w-6 text-cyan-500" />
            </div>
            <h3 className="font-semibold">{t("features.fast.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("features.fast.desc")}
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
              <Globe weight="duotone" className="h-6 w-6 text-cyan-500" />
            </div>
            <h3 className="font-semibold">{t("features.free.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("features.free.desc")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
