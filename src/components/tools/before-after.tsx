"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ArrowRight } from "@phosphor-icons/react";
import { formatFileSize } from "@/lib/utils/file";

interface BeforeAfterProps {
  originalSize: number;
  resultSize: number;
  originalFormat?: string;
  resultFormat?: string;
  className?: string;
}

export function BeforeAfter({
  originalSize,
  resultSize,
  originalFormat,
  resultFormat,
  className,
}: BeforeAfterProps) {
  const t = useTranslations("beforeAfter");

  const reduction = originalSize > 0
    ? Math.round(((originalSize - resultSize) / originalSize) * 100)
    : 0;

  const isReduction = reduction > 0;
  const isIncrease = reduction < 0;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4 rounded-xl border border-border bg-card p-5",
        className
      )}
    >
      {/* Original */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {t("original")}
        </p>
        <p className="mt-1 text-lg font-semibold tabular-nums">
          {formatFileSize(originalSize)}
        </p>
        {originalFormat && (
          <p className="text-xs text-muted-foreground">
            {originalFormat.toUpperCase()}
          </p>
        )}
      </div>

      {/* Arrow + percentage */}
      <div className="flex flex-col items-center gap-1">
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-bold",
            isReduction && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            isIncrease && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            !isReduction && !isIncrease && "bg-muted text-muted-foreground"
          )}
        >
          {isReduction ? "-" : isIncrease ? "+" : ""}
          {Math.abs(reduction)}%
        </span>
      </div>

      {/* Result */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {t("result")}
        </p>
        <p
          className={cn(
            "mt-1 text-lg font-semibold tabular-nums",
            isReduction && "text-green-600 dark:text-green-400"
          )}
        >
          {formatFileSize(resultSize)}
        </p>
        {resultFormat && (
          <p className="text-xs text-muted-foreground">
            {resultFormat.toUpperCase()}
          </p>
        )}
      </div>
    </div>
  );
}
