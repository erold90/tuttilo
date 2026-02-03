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
} from "@/lib/tools/registry";
import { ToolIcon } from "@/components/tool-icon";
import { HomeSearchTrigger } from "@/components/home-search-trigger";
import { HomeUserSections } from "@/components/home-user-sections";

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

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
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
        <div className="container mx-auto max-w-7xl px-4 py-16 md:py-24 relative">
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

      {/* Trust Signals */}
      <section className="border-b bg-muted/20">
        <div className="container mx-auto max-w-7xl px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustItems.map(({ icon: Icon, key, color }) => (
              <div key={key} className="flex items-start gap-3 p-3">
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

      {/* Favorites & Recents (client-side, localStorage) */}
      <HomeUserSections />

      {/* Popular Tools */}
      <section className="container mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          {t("popularTools")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTools.map((tool) => {
            const classes = getCategoryClasses(tool.category);
            return (
              <Link
                key={tool.id}
                href={`/${tool.category}/${tool.slug}` as any}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md",
                  classes.border,
                  classes.hoverBorder
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    classes.bg,
                    classes.text
                  )}
                >
                  <ToolIcon name={tool.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {tTools(`${tool.id}.name`)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {tTools(`${tool.id}.description`)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* All Tools by Category */}
      <section className="border-t bg-muted/30">
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
              return (
                <div key={cat.id}>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {catTools.map((tool) => (
                      <Link
                        key={tool.id}
                        href={`/${cat.slug}/${tool.slug}` as any}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border bg-background p-3 transition-all hover:shadow-sm",
                          classes.border,
                          classes.hoverBorder
                        )}
                      >
                        <ToolIcon
                          name={tool.icon}
                          className={cn("h-4 w-4 shrink-0", classes.text)}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {tTools(`${tool.id}.name`)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {tTools(`${tool.id}.description`)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-7xl px-4 py-16">
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
