"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ArrowRight } from "@phosphor-icons/react";
import {
  getToolsByCategory,
  categories,
  tools as allTools,
  getCategoryClasses,
  type ToolCategoryId,
} from "@/lib/tools/registry";
import { ToolIcon } from "@/components/tool-icon";

// Cross-category workflow suggestions: toolId -> related tool IDs from other categories
const crossCategoryMap: Record<string, string[]> = {
  // PDF -> Image workflows
  "compress-pdf": ["image-converter", "compress-video"],
  "pdf-to-images": ["image-editor", "image-converter"],
  "pdf-images": ["image-converter", "image-editor"],
  "pdf-editor": ["pdf-fill-sign", "image-editor"],
  "pdf-word": ["word-counter", "pdf-protect"],
  "pdf-excel": ["pdf-to-images", "pdf-protect"],
  "pdf-ocr": ["pdf-editor", "image-converter"],
  "html-to-pdf": ["json-formatter", "pdf-protect"],
  // Image -> PDF/Video
  "image-converter": ["compress-pdf", "video-to-gif"],
  "image-editor": ["image-converter", "qr-code"],
  // Video -> Audio
  "compress-video": ["trim-video", "compress-pdf"],
  "trim-video": ["video-to-gif", "video-to-mp3"],
  "video-to-gif": ["image-converter", "trim-video"],
  "video-to-mp3": ["audio-cutter", "audio-converter"],
  // Audio -> Video
  "audio-cutter": ["voice-recorder", "video-to-mp3"],
  "audio-converter": ["audio-cutter", "compress-video"],
  "voice-recorder": ["audio-cutter", "screen-recorder"],
  "screen-recorder": ["trim-video", "compress-video"],
  // Text/Dev -> others
  "word-counter": ["lorem-ipsum", "json-formatter"],
  "json-formatter": ["base64", "regex-tester"],
  "base64": ["json-formatter", "qr-code"],
  "regex-tester": ["json-formatter", "word-counter"],
  "color-picker": ["qr-code", "image-editor"],
  "qr-code": ["color-picker", "image-converter"],
  "youtube-thumbnail": ["image-editor", "video-to-mp3"],
};

interface RelatedToolsProps {
  currentToolId: string;
  category: string;
}

export function RelatedTools({ currentToolId, category }: RelatedToolsProps) {
  const t = useTranslations();

  // Same-category tools (up to 4)
  const categoryTools = getToolsByCategory(category as ToolCategoryId);
  const sameCategory = categoryTools
    .filter((tool) => tool.id !== currentToolId && tool.isAvailable)
    .slice(0, 4);

  // Cross-category suggestions (up to 2)
  const crossIds = crossCategoryMap[currentToolId] || [];
  const crossCategory = crossIds
    .map((id) => allTools.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => !!t && t.isAvailable && t.id !== currentToolId)
    .slice(0, 2);

  const allRelated = [...sameCategory, ...crossCategory];
  if (allRelated.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">{t("common.relatedTools")}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allRelated.map((tool) => {
          const cat = categories.find((c) => c.id === tool.category);
          const catSlug = cat?.slug || tool.category;
          const classes = getCategoryClasses(tool.category);
          const isCross = tool.category !== category;

          return (
            <Link
              key={tool.id}
              href={`/${catSlug}/${tool.slug}`}
              className={cn(
                "group flex flex-col rounded-xl border bg-card p-5 transition-all",
                isCross
                  ? "border-dashed border-border/60 hover:border-primary/30 hover:shadow-md"
                  : "border-border hover:border-primary/30 hover:shadow-md dark:hover:border-primary/20"
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={cn("flex h-6 w-6 items-center justify-center rounded", classes.bg, classes.text)}>
                  <ToolIcon name={tool.icon} className="h-3.5 w-3.5" />
                </span>
                <h3 className="font-semibold group-hover:text-primary">
                  {t(`tools.${tool.id}.name`)}
                </h3>
              </div>
              <p className="mb-3 flex-1 text-sm text-muted-foreground line-clamp-2">
                {t(`tools.${tool.id}.description`)}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                {t("common.tryNow")}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
