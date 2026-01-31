"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import { SidebarAd } from "@/components/ads/sidebar-ad";
import { LeaderboardAd } from "@/components/ads/leaderboard-ad";
import { RelatedTools } from "@/components/tools/related-tools";

interface ToolLayoutProps {
  toolId: string;
  category: string;
  children: React.ReactNode;
}

export function ToolLayout({ toolId, category, children }: ToolLayoutProps) {
  const t = useTranslations();

  const toolName = t(`tools.${toolId}.name`);
  const toolDescription = t(`tools.${toolId}.description`);
  const categoryName = t(`categories.${category}`);

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
          <span>{t("common.home")}</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/tools/${category}`}
          className="transition-colors hover:text-foreground"
        >
          {categoryName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{toolName}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
          {toolName}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {toolDescription}
        </p>
      </div>

      {/* Main content + sidebar */}
      <div className="flex gap-8">
        {/* Main area */}
        <div className="min-w-0 flex-1">
          {children}
        </div>

        {/* Sidebar ads - hidden on mobile */}
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
          <h2 className="mb-4 text-2xl font-bold">
            {t("common.faq")}
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => {
              const question = t.rich(`tools.${toolId}.faq.q${i}`, {
                defaultValue: "",
              });
              const answer = t.rich(`tools.${toolId}.faq.a${i}`, {
                defaultValue: "",
              });
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
