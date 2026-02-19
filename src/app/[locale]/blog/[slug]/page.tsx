import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { blogArticles, getArticleBySlug } from "@/lib/blog/articles";
import { tools, categories } from "@/lib/tools/registry";
import { notFound } from "next/navigation";
import { CaretRight, House, Clock, User, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { readStaticJsonWithFallback } from "@/lib/read-static-data";
import { TranslatedTitle, TranslatedExcerpt } from "@/components/blog/translated-text";

interface BlogArticleData {
  [key: string]: { h: string; p: string } | string;
}

async function ServerArticleBody({ locale, slug }: { locale: string; slug: string }) {
  const articleData = await readStaticJsonWithFallback<BlogArticleData>("blog", locale, `${slug}.json`);
  if (!articleData) return null;

  const sections: { h: string; p: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const s = articleData[`s${i}`];
    if (!s || typeof s === "string" || !s.h || !s.p) break;
    sections.push({ h: s.h, p: s.p });
  }
  if (sections.length === 0) return null;

  return (
    <div className="max-w-none space-y-10">
      {sections.map((section, i) => (
        <section key={i} className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {section.h}
          </h2>
          <div className="space-y-4">
            {section.p.split("\n\n").map((paragraph, j) => (
              <p
                key={j}
                className="text-base leading-7 text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const BASE_URL = "https://tuttilo.com";

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const article of blogArticles) {
      params.push({ locale, slug: article.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  // Metadata uses EN - visible titles are translated client-side via static JSON
  const t = await getTranslations({ locale: "en", namespace: "blog.articles" });

  let title: string;
  let description: string;
  try {
    title = t(`${slug}.title`);
    description = t(`${slug}.excerpt`);
    if (title.startsWith("blog.")) return {};
  } catch {
    return {};
  }

  const url = locale === "en" ? `${BASE_URL}/blog/${slug}` : `${BASE_URL}/${locale}/blog/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: locale === "en" ? `${BASE_URL}/blog/${slug}` : `${BASE_URL}/${locale}/blog/${slug}`,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, l === "en" ? `${BASE_URL}/blog/${slug}` : `${BASE_URL}/${l}/blog/${slug}`])
        ),
        "x-default": `${BASE_URL}/blog/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Tuttilo",
      locale,
      type: "article",
      publishedTime: article.date,
      authors: ["Daniele Lo Re"],
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const t = await getTranslations({ locale, namespace: "blog" });
  const tArticle = await getTranslations({ locale: "en", namespace: `blog.articles.${slug}` });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tTools = await getTranslations({ locale, namespace: "tools" });

  let title: string;
  let excerpt: string;
  try {
    title = tArticle("title");
    excerpt = tArticle("excerpt");
    if (title.startsWith("blog.")) notFound();
  } catch {
    notFound();
  }

  // Get related tools info
  const relatedToolsInfo = article.relatedTools
    .map((toolId) => {
      const tool = tools.find((t) => t.id === toolId);
      if (!tool || !tool.isAvailable) return null;
      const cat = categories.find((c) => c.id === tool.category);
      if (!cat) return null;
      let name: string;
      let description: string;
      try {
        name = tTools(`${toolId}.name`);
        description = tTools(`${toolId}.description`);
      } catch {
        return null;
      }
      return { id: toolId, name, description, href: `/${cat.slug}/${tool.slug}` };
    })
    .filter(Boolean) as { id: string; name: string; description: string; href: string }[];

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

  const formattedDate = new Date(article.date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="container mx-auto max-w-4xl px-4 pt-8 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/" className="flex items-center gap-1 transition-colors hover:text-foreground">
          <House className="h-3.5 w-3.5" />
          <span>{tNav("home")}</span>
        </Link>
        <CaretRight className="h-3.5 w-3.5" />
        <Link href="/blog" className="transition-colors hover:text-foreground">
          {t("title")}
        </Link>
        <CaretRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground truncate max-w-[200px]">{title}</span>
      </nav>

      {/* Article header */}
      <header className="container mx-auto max-w-4xl px-4 py-12">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${categoryColors[article.category] || ""}`}
        >
          {categoryLabels[article.category]}
        </span>

        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          <TranslatedTitle slug={slug} fallback={title} />
        </h1>

        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          <TranslatedExcerpt slug={slug} fallback={excerpt} />
        </p>

        <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {t("author.daniele")}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {article.readingTime} {t("minRead")}
          </span>
          <time dateTime={article.date}>{formattedDate}</time>
        </div>
      </header>

      {/* Article body — server-rendered for crawlers */}
      <article className="container mx-auto max-w-4xl px-4">
        <ServerArticleBody locale={locale} slug={slug} />
      </article>

      {/* Related tools */}
      {relatedToolsInfo.length > 0 && (
        <section className="container mx-auto max-w-4xl px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">{t("relatedTools")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedToolsInfo.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="group flex flex-col gap-2 rounded-xl border p-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <h3 className="font-semibold group-hover:text-primary transition-colors flex items-center gap-2">
                  {tool.name}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to blog */}
      <div className="container mx-auto max-w-4xl px-4 pb-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          ← {t("backToBlog")}
        </Link>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: excerpt,
            image: `${BASE_URL}/og-image.png`,
            datePublished: article.date,
            dateModified: article.date,
            author: {
              "@type": "Person",
              name: "Daniele Lo Re",
              url: `${BASE_URL}/${locale === "en" ? "" : `${locale}/`}about`,
            },
            publisher: {
              "@type": "Organization",
              name: "Tuttilo",
              url: BASE_URL,
              logo: {
                "@type": "ImageObject",
                url: `${BASE_URL}/favicon.svg`,
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": locale === "en" ? `${BASE_URL}/blog/${slug}` : `${BASE_URL}/${locale}/blog/${slug}`,
            },
            inLanguage: locale,
            wordCount: article.readingTime * 200,
          }),
        }}
      />
    </div>
  );
}
