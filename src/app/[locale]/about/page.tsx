export const runtime = "edge";

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/routing";
import {
  ShieldCheck as Shield,
  Lightning as Zap,
  UserMinus as UserX,
  Globe,
  Wrench,
  CurrencyDollar as DollarSign,
} from "@/components/icons";

const BASE_URL = "https://tuttilo.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.about" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/about`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}/about`])
      ),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${BASE_URL}/${locale}/about`,
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.about" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const features = [
    { icon: Shield, key: "privacy", color: "text-green-500 bg-green-500/10" },
    { icon: DollarSign, key: "free", color: "text-cyan-500 bg-cyan-500/10" },
    { icon: UserX, key: "noReg", color: "text-orange-500 bg-orange-500/10" },
    { icon: Zap, key: "fast", color: "text-yellow-500 bg-yellow-500/10" },
    { icon: Globe, key: "languages", color: "text-blue-500 bg-blue-500/10" },
    { icon: Wrench, key: "tools", color: "text-purple-500 bg-purple-500/10" },
  ];

  const categoryKeys = [
    "pdf",
    "image",
    "video",
    "audio",
    "text",
    "developer",
    "youtube",
  ] as const;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="container mx-auto max-w-4xl px-4 py-16 md:py-20 relative text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl leading-relaxed max-w-2xl mx-auto">
            {t("intro")}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="container mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-bold mb-4">{t("mission.title")}</h2>
        <p className="text-muted-foreground leading-relaxed text-lg">
          {t("mission.content")}
        </p>
      </section>

      {/* How it works */}
      <section className="border-t border-b bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <h2 className="text-2xl font-bold mb-4">{t("howItWorks.title")}</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            {t("howItWorks.content")}
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="container mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">
          {t("features.title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, key, color }) => (
            <div
              key={key}
              className="flex items-start gap-3 rounded-xl border p-4"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                {t(`features.${key}`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tool categories */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            {t("categories.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoryKeys.map((cat) => (
              <div key={cat} className="rounded-xl border bg-background p-4">
                <h3 className="font-semibold mb-1">{tNav(cat)}</h3>
                <p className="text-sm text-muted-foreground">
                  {t(`categories.${cat}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open & Transparent */}
      <section className="container mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-bold mb-4">{t("openSource.title")}</h2>
        <p className="text-muted-foreground leading-relaxed text-lg">
          {t("openSource.content")}
        </p>
      </section>
    </div>
  );
}
