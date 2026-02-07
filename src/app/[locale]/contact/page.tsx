export const runtime = "edge";

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/routing";
import { Envelope as Mail, GithubLogo as Github, Question as HelpCircle, Clock } from "@/components/icons";

const BASE_URL = "https://tuttilo.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.contact" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/contact`,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}/contact`])
        ),
        "x-default": `${BASE_URL}/en/contact`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${BASE_URL}/${locale}/contact`,
      siteName: "Tuttilo",
      locale,
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: "Tuttilo" }],
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.contact" });

  const cards: {
    key: string;
    icon: typeof Mail;
    color: string;
    link?: string;
    linkText?: string;
  }[] = [
    {
      key: "email",
      icon: Mail,
      color: "text-cyan-500 bg-cyan-500/10",
      link: "mailto:support@tuttilo.com",
      linkText: t("email.address"),
    },
    {
      key: "github",
      icon: Github,
      color: "text-gray-700 dark:text-gray-300 bg-gray-500/10",
      link: "https://github.com/erold90/tuttilo",
      linkText: t("github.link"),
    },
    {
      key: "faq",
      icon: HelpCircle,
      color: "text-green-500 bg-green-500/10",
    },
    {
      key: "response",
      icon: Clock,
      color: "text-orange-500 bg-orange-500/10",
    },
  ];

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

      {/* Contact cards */}
      <section className="container mx-auto max-w-4xl px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map(({ key, icon: Icon, color, link, linkText }) => (
            <div
              key={key}
              className="rounded-xl border p-6 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">{t(`${key}.title`)}</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(`${key}.content`)}
              </p>
              {link && (
                <a
                  href={link}
                  target={link.startsWith("http") ? "_blank" : undefined}
                  rel={link.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-block text-sm font-medium text-cyan-500 hover:text-cyan-600 transition-colors"
                >
                  {linkText}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
