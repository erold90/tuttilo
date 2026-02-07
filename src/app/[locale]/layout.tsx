export const runtime = "edge";

import type { Metadata } from "next";
import { Exo_2, Orbitron, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { routing, locales } from "@/i18n/routing";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { EzoicProvider } from "@/components/ads/ezoic-provider";
import "@/styles/globals.css";

const BASE_URL = "https://tuttilo.com";

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo2",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  const title = `${t("siteName")} — ${t("tagline")}`;
  const description =
    "Free all-in-one online tools for PDF, images, video, audio, text, and developer utilities. All processing happens in your browser.";

  return {
    title: {
      template: `%s | ${t("siteName")}`,
      default: title,
    },
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}`])
        ),
        "x-default": `${BASE_URL}/en`,
      },
    },
    verification: {
      google: "googlea6b9f851de332dd7",
    },
    icons: {
      icon: "/favicon.svg",
    },
    manifest: "/manifest.json",
    openGraph: {
      type: "website",
      locale,
      url: `${BASE_URL}/${locale}`,
      siteName: t("siteName"),
      title,
      description,
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${t("siteName")} — Free All-in-One Online Tools`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

function JsonLd({ locale }: { locale: string }) {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Tuttilo",
      url: `${BASE_URL}/${locale}`,
      description:
        "Free all-in-one online tools for PDF, images, video, audio, text, and developer utilities.",
      inLanguage: locale,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/${locale}?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Tuttilo",
      url: BASE_URL,
      logo: `${BASE_URL}/favicon.svg`,
      description:
        "Free all-in-one online tools for PDF, images, video, audio, text, and developer utilities. All processing happens in your browser.",
      sameAs: [
        "https://github.com/erold90/tuttilo",
      ],
    },
  ];

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${exo2.variable} ${orbitron.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <JsonLd locale={locale} />
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.ezojs.com" />
        {/* Ezoic CMP — raw tags so Ezoic crawler detects them */}
        <script async data-cfasync="false" src="https://cmp.gatekeeperconsent.com/min.js" />
        <script async data-cfasync="false" src="https://the.gatekeeperconsent.com/cmp.min.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: "window.ezstandalone=window.ezstandalone||{};ezstandalone.cmd=ezstandalone.cmd||[];",
          }}
        />
        <script async src="https://www.ezojs.com/ezoic/sa.min.js" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <GoogleAnalytics />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster richColors position="bottom-right" />
            <EzoicProvider />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
