"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { CircleNotch as Loader2 } from "@phosphor-icons/react";

interface ProcessingProgressProps {
  progress: number;
  text: string;
  isProcessing: boolean;
  className?: string;
}

export function ProcessingProgress({
  progress,
  text,
  isProcessing,
  className,
}: ProcessingProgressProps) {
  if (!isProcessing) return null;

  return (
    <div
      className={cn(
        "w-full rounded-xl border border-border bg-card p-6",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium">
            {text}
          </span>
        </div>
        <span className="text-sm font-semibold tabular-nums text-primary">
          {Math.round(progress)}%
        </span>
      </div>

      <Progress
        value={progress}
        className="h-2.5 transition-all duration-300"
      />
    </div>
  );
}
