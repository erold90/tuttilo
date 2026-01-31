import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface RelatedToolsProps {
  currentToolId: string;
  category: string;
}

const TOOLS_BY_CATEGORY: Record<string, string[]> = {
  pdf: [
    "compress-pdf",
    "merge-pdf",
    "split-pdf",
    "pdf-to-word",
    "word-to-pdf",
    "pdf-to-jpg",
    "jpg-to-pdf",
    "rotate-pdf",
    "unlock-pdf",
    "protect-pdf",
  ],
  image: [
    "compress-image",
    "resize-image",
    "crop-image",
    "convert-image",
    "image-to-png",
    "image-to-jpg",
    "image-to-webp",
    "remove-background",
  ],
  convert: [
    "pdf-to-word",
    "word-to-pdf",
    "excel-to-pdf",
    "pdf-to-excel",
    "pdf-to-ppt",
    "ppt-to-pdf",
    "csv-to-json",
    "json-to-csv",
  ],
  text: [
    "word-counter",
    "character-counter",
    "lorem-ipsum",
    "case-converter",
    "text-diff",
    "markdown-editor",
  ],
  dev: [
    "json-formatter",
    "base64-encode",
    "url-encode",
    "hash-generator",
    "uuid-generator",
    "regex-tester",
    "color-picker",
    "css-minifier",
  ],
};

export async function RelatedTools({ currentToolId, category }: RelatedToolsProps) {
  const t = await getTranslations();

  const categoryTools = TOOLS_BY_CATEGORY[category] || [];
  const related = categoryTools
    .filter((id) => id !== currentToolId)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">
        {t("common.relatedTools")}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((toolId) => (
          <Link
            key={toolId}
            href={`/tools/${category}/${toolId}`}
            className={cn(
              "group flex flex-col rounded-xl border border-border bg-card p-5 transition-all",
              "hover:border-primary/30 hover:shadow-md dark:hover:border-primary/20"
            )}
          >
            <h3 className="mb-1.5 font-semibold group-hover:text-primary">
              {t(`tools.${toolId}.name`)}
            </h3>
            <p className="mb-3 flex-1 text-sm text-muted-foreground line-clamp-2">
              {t(`tools.${toolId}.description`)}
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
