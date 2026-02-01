"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChevronRight, Home } from "lucide-react";
import { SidebarAd } from "@/components/ads/sidebar-ad";
import { LeaderboardAd } from "@/components/ads/leaderboard-ad";
import { RelatedTools } from "@/components/tools/related-tools";
import { HowItWorks } from "@/components/tools/how-it-works";
import { FavoritesButton } from "@/components/tools/favorites-button";
import { useRecents } from "@/hooks/use-recents";

interface ToolLayoutProps {
  toolId: string;
  category: string;
  children: React.ReactNode;
}

export function ToolLayout({ toolId, category, children }: ToolLayoutProps) {
  const t = useTranslations();
  const { addRecent } = useRecents();

  const toolName = t(`tools.${toolId}.name`);
  const toolDescription = t(`tools.${toolId}.description`);
  const categoryName = t(`nav.${category}`);

  // Track recent tool usage
  useEffect(() => {
    const slug = toolId.replace(`${category}-`, "").replace(category, "");
    addRecent(toolId, category, slug || toolId);
  }, [toolId, category, addRecent]);

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link
          href="/"
          className="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <Home className="h-3.5 w-3.5" />
          <span>{t("nav.home")}</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/${category}`}
          className="transition-colors hover:text-foreground"
        >
          {categoryName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{toolName}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
              {toolName}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              {toolDescription}
            </p>
          </div>
          <FavoritesButton toolId={toolId} className="mt-1 shrink-0" />
        </div>
      </div>

      {/* How it works */}
      <HowItWorks />

      {/* Main content + sidebar */}
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">{children}</div>
        <aside className="hidden shrink-0 lg:block" style={{ width: 300 }}>
          <SidebarAd />
        </aside>
      </div>

      {/* Leaderboard ad */}
      <div className="mt-10">
        <LeaderboardAd />
      </div>

      {/* Related tools */}
      <div className="mt-10">
        <RelatedTools currentToolId={toolId} category={category} />
      </div>

      {/* SEO content */}
      <section className="mt-10">
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <h2>{t(`tools.${toolId}.seo.title`)}</h2>
          <p>{t(`tools.${toolId}.seo.content`)}</p>
        </div>

        {/* FAQ */}
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">{t("common.faq")}</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => {
              const question = t(`tools.${toolId}.faq.q${i}`);
              const answer = t(`tools.${toolId}.faq.a${i}`);
              if (!question) return null;
              return (
                <details
                  key={i}
                  className="group rounded-lg border border-border bg-card p-4"
                >
                  <summary className="cursor-pointer font-medium">
                    {question}
                  </summary>
                  <p className="mt-2 text-muted-foreground">{answer}</p>
                </details>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
