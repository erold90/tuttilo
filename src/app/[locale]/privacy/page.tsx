import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales, Link } from "@/i18n/routing";
import { CaretRight, House } from "@phosphor-icons/react/dist/ssr";

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
  const t = await getTranslations({ locale, namespace: "pages.privacy" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/privacy`,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}/privacy`])
        ),
        "x-default": `${BASE_URL}/en/privacy`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${BASE_URL}/${locale}/privacy`,
      siteName: "Tuttilo",
      locale,
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: "Tuttilo" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}

const sections = [
  "noDataCollection",
  "analytics",
  "cookies",
  "advertising",
  "thirdParty",
  "retention",
  "rights",
  "changes",
  "contact",
] as const;

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.privacy" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="flex items-center gap-1 transition-colors hover:text-foreground">
          <House className="h-3.5 w-3.5" />
          <span>{tNav("home")}</span>
        </Link>
        <CaretRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{t("title")}</span>
      </nav>

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
