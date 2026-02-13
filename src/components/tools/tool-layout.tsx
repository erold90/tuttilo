"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { CaretRight as ChevronRight, House as Home } from "@phosphor-icons/react";
import { SidebarAd } from "@/components/ads/sidebar-ad";
import { LeaderboardAd } from "@/components/ads/leaderboard-ad";
import { MobileStickyAd } from "@/components/ads/mobile-sticky-ad";
import { SupportNotice } from "@/components/ads/support-notice";
import { RelatedTools } from "@/components/tools/related-tools";
import { FavoritesButton } from "@/components/tools/favorites-button";
import { BookmarkButton } from "@/components/tools/bookmark-button";
import { useRecents } from "@/hooks/use-recents";
import { ToolExtendedContent } from "@/components/tools/tool-extended-content";
import { ToolFaq } from "@/components/tools/tool-faq";

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
          <div className="mt-1 flex shrink-0 items-center gap-2">
            <BookmarkButton />
            <FavoritesButton toolId={toolId} />
          </div>
        </div>
      </div>

      {/* Main content + sidebar — wrapped by support notice wall */}
      <SupportNotice>
        <div className="flex gap-8">
          <div className="min-w-0 flex-1">{children}</div>
          <aside className="hidden shrink-0 lg:block" style={{ width: 300 }}>
            <SidebarAd />
          </aside>
        </div>
      </SupportNotice>

      {/* Leaderboard ad */}
      <div className="mt-10">
        <LeaderboardAd />
      </div>

      {/* Mobile sticky bottom ad */}
      <MobileStickyAd />

      {/* Related tools */}
      <div className="mt-10">
        <RelatedTools currentToolId={toolId} category={category} />
      </div>

      {/* SEO content */}
      <section className="mt-10">
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <h2>{t(`tools.${toolId}.seo.title`)}</h2>
          <p>{t(`tools.${toolId}.seo.content`)}</p>
          {/* Extended content loaded from static JSON */}
          <ToolExtendedContent toolId={toolId} />
          {/* Shared privacy paragraph */}
          <p>{t("common.seoPrivacy")}</p>
        </div>

        {/* FAQ — loaded from static JSON */}
        <ToolFaq toolId={toolId} />
      </section>
    </div>
  );
}
