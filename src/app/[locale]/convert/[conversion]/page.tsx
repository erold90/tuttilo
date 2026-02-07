import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/routing";
import { conversions, getConversion } from "@/lib/tools/conversions";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  ArrowRight,
  CheckCircle,
  CaretRight,
  House,
  Question,
} from "@phosphor-icons/react/dist/ssr";

const BASE_URL = "https://tuttilo.com";

export function generateStaticParams() {
  return conversions.flatMap((c) =>
    locales.map((locale) => ({ locale, conversion: c.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; conversion: string }>;
}): Promise<Metadata> {
  const { locale, conversion: slug } = await params;
  const conv = getConversion(slug);
  if (!conv) return {};

  const t = await getTranslations({ locale, namespace: "conversions" });
  const title = t(`${slug}.title`);
  const description = t(`${slug}.description`);
  const url = `${BASE_URL}/${locale}/convert/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}/convert/${slug}`])
        ),
        "x-default": `${BASE_URL}/en/convert/${slug}`,
      },
    },
    openGraph: {
      title: `${title} | Tuttilo`,
      description,
      url,
      siteName: "Tuttilo",
      locale,
      type: "website",
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
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

export default async function ConversionPage({
  params,
}: {
  params: Promise<{ locale: string; conversion: string }>;
}) {
  const { locale, conversion: slug } = await params;
  const conv = getConversion(slug);
  if (!conv) notFound();

  const t = await getTranslations({ locale, namespace: "conversions" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const title = t(`${slug}.title`);
  const description = t(`${slug}.description`);
  const content = t(`${slug}.content`);
  const source = t(`${slug}.source`);
  const target = t(`${slug}.target`);
  const cta = t(`${slug}.cta`);
  const ctaBottom = t(`${slug}.ctaBottom`);
  const howToTitle = t(`${slug}.howToTitle`);
  const readyTitle = t(`${slug}.readyTitle`);
  const readySubtitle = t(`${slug}.readySubtitle`);

  const steps = [
    t(`${slug}.step1`),
    t(`${slug}.step2`),
    t(`${slug}.step3`),
  ];

  const faq = [
    { q: t(`${slug}.faq.q1`), a: t(`${slug}.faq.a1`) },
    { q: t(`${slug}.faq.q2`), a: t(`${slug}.faq.a2`) },
    { q: t(`${slug}.faq.q3`), a: t(`${slug}.faq.a3`) },
  ];

  const toolUrl = `/${conv.category}/${conv.toolSlug}`;
  const pageUrl = `${BASE_URL}/${locale}/convert/${slug}`;

  // Structured data
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${BASE_URL}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${source} to ${target}`,
        item: pageUrl,
      },
    ],
  };

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    description,
    url: pageUrl,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: "Tuttilo", url: BASE_URL },
  };

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description,
    totalTime: "PT2M",
    tool: { "@type": "HowToTool", name: "Web browser" },
    step: steps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: `Step ${i + 1}`,
      text,
    })),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link
          href="/"
          className="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <House className="h-3.5 w-3.5" weight="duotone" />
          <span>Home</span>
        </Link>
        <CaretRight className="h-3.5 w-3.5" />
        <span className="text-foreground">
          {source} to {target}
        </span>
      </nav>

      {/* Hero */}
      <div className="mb-10">
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mb-6 text-lg text-muted-foreground">
          {description}
        </p>
        <Link
          href={toolUrl}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {cta}
          <ArrowRight className="h-4 w-4" weight="bold" />
        </Link>
      </div>

      {/* Content */}
      <section className="mb-10">
        <p className="leading-relaxed text-muted-foreground">{content}</p>
      </section>

      {/* How-to Steps */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">
          {howToTitle}
        </h2>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="mb-10 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-bold">{tCommon("whyUseTuttilo")}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            tCommon("features.free"),
            tCommon("features.browser"),
            tCommon("features.fast"),
            tCommon("features.privacy"),
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <CheckCircle
                className="h-5 w-5 shrink-0 text-green-500"
                weight="duotone"
              />
              {feature}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">{tCommon("faqTitle")}</h2>
        <div className="space-y-4">
          {faq.map((f, i) => (
            <details
              key={i}
              className="group rounded-lg border border-border bg-card"
            >
              <summary className="flex cursor-pointer items-center gap-3 px-5 py-4 font-medium">
                <Question
                  className="h-5 w-5 shrink-0 text-primary"
                  weight="duotone"
                />
                {f.q}
              </summary>
              <div className="px-5 pb-4 text-sm text-muted-foreground">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
        <h2 className="mb-2 text-xl font-bold">
          {readyTitle}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {readySubtitle}
        </p>
        <Link
          href={toolUrl}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {ctaBottom}
          <ArrowRight className="h-4 w-4" weight="bold" />
        </Link>
      </div>
    </div>
  );
}
