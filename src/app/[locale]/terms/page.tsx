export const runtime = "edge";

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/routing";

const BASE_URL = "https://tuttilo.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.terms" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/terms`,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}/terms`])
        ),
        "x-default": `${BASE_URL}/en/terms`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${BASE_URL}/${locale}/terms`,
      siteName: "Tuttilo",
      locale,
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: "Tuttilo" }],
    },
  };
}

const sections = [
  "service",
  "usage",
  "ip",
  "liability",
  "warranty",
  "modifications",
  "law",
  "contact",
] as const;

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.terms" });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t("lastUpdated")}</p>
      <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
        {t("intro")}
      </p>
      <div className="prose prose-gray max-w-none dark:prose-invert">
        {sections.map((key) => (
          <section key={key} className="mb-8">
            <h2 className="text-xl font-semibold mb-3">{t(`${key}.title`)}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t(`${key}.content`)}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
