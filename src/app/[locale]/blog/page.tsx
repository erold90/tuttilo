import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { blogArticles } from "@/lib/blog/articles";
import { CaretRight, House, Clock, User } from "@phosphor-icons/react/dist/ssr";
import { TranslatedTitle, TranslatedExcerpt } from "@/components/blog/translated-text";

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
  const t = await getTranslations({ locale, namespace: "blog" });

  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    alternates: {
      canonical: locale === "en" ? `${BASE_URL}/blog` : `${BASE_URL}/${locale}/blog`,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, l === "en" ? `${BASE_URL}/blog` : `${BASE_URL}/${l}/blog`])
        ),
        "x-default": `${BASE_URL}/blog`,
      },
    },
    openGraph: {
      title,
      description,
      url: locale === "en" ? `${BASE_URL}/blog` : `${BASE_URL}/${locale}/blog`,
      siteName: "Tuttilo",
      locale,
      type: "website",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: "Tuttilo Blog" }],
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  // Article titles/excerpts loaded client-side from static JSON for i18n
  const tArticles = await getTranslations({ locale: "en", namespace: "blog.articles" });

  const categoryLabels: Record<string, string> = {
    "how-to": t("categories.how-to"),
    guide: t("categories.guide"),
    "best-practices": t("categories.best-practices"),
    informational: t("categories.informational"),
  };

  const categoryColors: Record<string, string> = {
    "how-to": "bg-blue-500/10 text-blue-500",
    guide: "bg-purple-500/10 text-purple-500",
    "best-practices": "bg-green-500/10 text-green-500",
    informational: "bg-orange-500/10 text-orange-500",
  };

  return (
    <div className="flex flex-col">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="container mx-auto max-w-5xl px-4 pt-8 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/" className="flex items-center gap-1 transition-colors hover:text-foreground">
          <House className="h-3.5 w-3.5" />
          <span>{tNav("home")}</span>
        </Link>
        <CaretRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{t("title")}</span>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="container mx-auto max-w-5xl px-4 py-16 md:py-20 relative">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl leading-relaxed max-w-2xl">
            {t("description")}
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <section className="container mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogArticles.map((article) => {
            let articleTitle: string;
            let articleExcerpt: string;
            try {
              articleTitle = tArticles(`${article.slug}.title`);
              articleExcerpt = tArticles(`${article.slug}.excerpt`);
              if (articleTitle.startsWith("blog.")) return null;
            } catch {
              return null;
            }

            return (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group flex flex-col rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                {/* Category badge */}
                <span
                  className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[article.category] || ""}`}
                >
                  {categoryLabels[article.category]}
                </span>

                {/* Title */}
                <h2 className="mt-3 text-xl font-bold group-hover:text-primary transition-colors">
                  <TranslatedTitle slug={article.slug} fallback={articleTitle} />
                </h2>

                {/* Excerpt */}
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">
                  <TranslatedExcerpt slug={article.slug} fallback={articleExcerpt} />
                </p>

                {/* Meta */}
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {t("author.daniele")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readingTime} {t("minRead")}
                  </span>
                  <span>{new Date(article.date).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: t("title"),
            description: t("description"),
            url: locale === "en" ? `${BASE_URL}/blog` : `${BASE_URL}/${locale}/blog`,
            publisher: {
              "@type": "Organization",
              name: "Tuttilo",
              url: BASE_URL,
              logo: `${BASE_URL}/favicon.svg`,
            },
          }),
        }}
      />
    </div>
  );
}
