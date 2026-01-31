"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { getToolsByCategory, type ToolCategoryId } from "@/lib/tools/registry";

interface RelatedToolsProps {
  currentToolId: string;
  category: string;
}

export function RelatedTools({ currentToolId, category }: RelatedToolsProps) {
  const t = useTranslations();

  const categoryTools = getToolsByCategory(category as ToolCategoryId);
  const related = categoryTools
    .filter((tool) => tool.id !== currentToolId && tool.isAvailable)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">{t("common.relatedTools")}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((tool) => (
          <Link
            key={tool.id}
            href={`/${category}/${tool.slug}`}
            className={cn(
              "group flex flex-col rounded-xl border border-border bg-card p-5 transition-all",
              "hover:border-primary/30 hover:shadow-md dark:hover:border-primary/20"
            )}
          >
            <h3 className="mb-1.5 font-semibold group-hover:text-primary">
              {t(`tools.${tool.id}.name`)}
            </h3>
            <p className="mb-3 flex-1 text-sm text-muted-foreground line-clamp-2">
              {t(`tools.${tool.id}.description`)}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              {t("common.tryNow")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
