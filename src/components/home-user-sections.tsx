"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Heart, Clock } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/use-favorites";
import { useRecents } from "@/hooks/use-recents";
import {
  getAvailableTools,
  getCategoryClasses,
  getCategoryColor,
  type ToolCategoryId,
} from "@/lib/tools/registry";
import { ToolIcon } from "@/components/tool-icon";
import { SpotlightContainer } from "@/components/ui/spotlight-container";

export function HomeUserSections() {
  const t = useTranslations();
  const { favorites } = useFavorites();
  const { recents } = useRecents();

  const allTools = getAvailableTools();

  const favoriteTools = favorites
    .map((id) => allTools.find((tool) => tool.id === id))
    .filter(Boolean);

  const recentTools = recents
    .map((r) => {
      const tool = allTools.find((t) => t.id === r.toolId);
      return tool ? { ...tool, category: r.category } : null;
    })
    .filter(Boolean);

  if (favoriteTools.length === 0 && recentTools.length === 0) return null;

  return (
    <section className="container mx-auto max-w-7xl px-4 pt-10">
      <div className="space-y-8">
        {/* Favorites */}
        {favoriteTools.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart weight="fill" className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold">{t("home.favorites")}</h2>
            </div>
            <SpotlightContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {favoriteTools.map((tool) => {
                if (!tool) return null;
                const classes = getCategoryClasses(tool.category);
                const color = getCategoryColor(tool.category);
                return (
                  <Link
                    key={tool.id}
                    href={`/${tool.category}/${tool.slug}` as any}
                    data-spotlight-card
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-300",
                      "hover:shadow-md hover:-translate-y-0.5",
                      classes.border,
                      classes.hoverBorder
                    )}
                    style={{ "--spotlight-color": `${color}14` } as React.CSSProperties}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg icon-glow relative z-10",
                        classes.bg,
                        classes.text
                      )}
                      style={{ "--glow-color": `${color}4D` } as React.CSSProperties}
                    >
                      <ToolIcon name={tool.icon} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 relative z-10">
                      <p className="font-medium text-sm truncate">
                        {t(`tools.${tool.id}.name`)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t(`tools.${tool.id}.description`)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </SpotlightContainer>
          </div>
        )}

        {/* Recents */}
        {recentTools.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">{t("home.recents")}</h2>
            </div>
            <SpotlightContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentTools.map((tool) => {
                if (!tool) return null;
                const classes = getCategoryClasses(tool.category as ToolCategoryId);
                const color = getCategoryColor(tool.category as ToolCategoryId);
                return (
                  <Link
                    key={tool.id}
                    href={`/${tool.category}/${tool.slug}` as any}
                    data-spotlight-card
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg border p-3 transition-all duration-300",
                      "hover:shadow-sm hover:-translate-y-0.5",
                      classes.border,
                      classes.hoverBorder
                    )}
                    style={{ "--spotlight-color": `${color}14` } as React.CSSProperties}
                  >
                    <ToolIcon
                      name={tool.icon}
                      className={cn("h-4 w-4 shrink-0 relative z-10", classes.text)}
                    />
                    <p className="font-medium text-sm truncate relative z-10">
                      {t(`tools.${tool.id}.name`)}
                    </p>
                  </Link>
                );
              })}
            </SpotlightContainer>
          </div>
        )}
      </div>
    </section>
  );
}
