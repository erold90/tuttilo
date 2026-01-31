import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Search, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categoryCards = [
  {
    key: "pdf",
    href: "/pdf",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    hoverColor: "hover:border-red-500/40",
  },
  {
    key: "image",
    href: "/image",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    hoverColor: "hover:border-green-500/40",
  },
  {
    key: "video",
    href: "/video",
    color: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    hoverColor: "hover:border-violet-500/40",
  },
  {
    key: "audio",
    href: "/audio",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    hoverColor: "hover:border-orange-500/40",
  },
  {
    key: "text",
    href: "/text",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    hoverColor: "hover:border-blue-500/40",
  },
  {
    key: "developer",
    href: "/developer",
    color: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    hoverColor: "hover:border-teal-500/40",
  },
  {
    key: "youtube",
    href: "/youtube",
    color: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    hoverColor: "hover:border-pink-500/40",
  },
] as const;

const stats = [
  { key: "tools", value: "50+" },
  { key: "filesProcessed", value: "100K+" },
  { key: "noUpload", value: "100%" },
] as const;

export default function HomePage() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />
        <div className="container mx-auto max-w-7xl px-4 py-20 md:py-28 relative">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl leading-relaxed">
              {t("subtitle")}
            </p>

            {/* Search bar */}
            <div className="mx-auto max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  className="w-full rounded-lg border bg-background/50 py-3 pl-10 pr-4 text-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
                  readOnly
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  Cmd+K
                </kbd>
              </div>
            </div>

            {/* Privacy badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-500" />
              <span>{t("privacyNote")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="container mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">{t("categories")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoryCards.map((cat) => (
            <Link
              key={cat.key}
              href={cat.href}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border p-6 transition-all",
                cat.color,
                cat.hoverColor,
                "hover:shadow-md"
              )}
            >
              <span className="text-2xl font-bold">{tNav(cat.key)}</span>
              <span className="text-xs opacity-70 text-center">
                {t(`categoryDesc.${cat.key}`)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.key} className="space-y-1">
                <p className="text-3xl font-bold text-indigo-500">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t(`stats.${stat.key}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
              <Shield className="h-6 w-6 text-indigo-500" />
            </div>
            <h3 className="font-semibold">{t("features.privacy.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("features.privacy.desc")}
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
              <Zap className="h-6 w-6 text-indigo-500" />
            </div>
            <h3 className="font-semibold">{t("features.fast.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("features.fast.desc")}
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
              <Globe className="h-6 w-6 text-indigo-500" />
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
