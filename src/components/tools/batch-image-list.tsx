"use client";

import { useTranslations } from "next-intl";
import { formatFileSize, triggerDownload } from "@/lib/image-utils";
import type { BatchFile } from "@/hooks/use-batch-image";

interface BatchImageListProps {
  files: BatchFile[];
  processing: boolean;
  totalProgress: number;
  allDone: boolean;
  doneCount: number;
  onRemove: (id: string) => void;
  onProcessAll: () => void;
  onReset: () => void;
}

export function BatchImageList({
  files,
  processing,
  totalProgress,
  allDone,
  doneCount,
  onRemove,
  onProcessAll,
  onReset,
}: BatchImageListProps) {
  const t = useTranslations("common.batch");

  function downloadAll() {
    for (const f of files) {
      if (f.resultUrl) {
        triggerDownload(f.resultUrl, f.file.name.replace(/\.[^.]+$/, "") + "-converted" + getExt(f));
      }
    }
  }

  function getExt(f: BatchFile) {
    if (f.resultBlob?.type === "image/jpeg") return ".jpg";
    if (f.resultBlob?.type === "image/png") return ".png";
    if (f.resultBlob?.type === "image/webp") return ".webp";
    return ".jpg";
  }

  const statusIcon = (status: BatchFile["status"]) => {
    switch (status) {
      case "pending": return "\u23F3";
      case "processing": return "\u2699\uFE0F";
      case "done": return "\u2705";
      case "error": return "\u274C";
    }
  };

  return (
    <div className="space-y-4">
      {/* File list */}
      <div className="space-y-2">
        {files.map((f) => (
          <div
            key={f.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <span className="text-lg">{statusIcon(f.status)}</span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{f.file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(f.file.size)}
                {f.resultSize > 0 && (
                  <span className="text-primary"> {"\u2192"} {formatFileSize(f.resultSize)}</span>
                )}
              </p>
            </div>
            {f.status === "processing" && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
            {f.resultUrl && (
              <button
                onClick={() => triggerDownload(f.resultUrl, f.file.name.replace(/\.[^.]+$/, "") + "-converted" + getExt(f))}
                className="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
              >
                {t("download")}
              </button>
            )}
            {!processing && (
              <button
                onClick={() => onRemove(f.id)}
                className="rounded-md p-1 text-xs text-muted-foreground hover:text-red-500"
              >
                \u2715
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {processing && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("processing")}</span>
            <span>{totalProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Summary */}
      {allDone && (
        <p className="text-sm text-green-500 font-medium">
          {t("done")} ({doneCount}/{files.length})
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {!allDone && (
          <button
            onClick={onProcessAll}
            disabled={processing || files.length === 0}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {processing ? t("processing") : t("convertAll")}
          </button>
        )}
        {allDone && doneCount > 1 && (
          <button
            onClick={downloadAll}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            {t("downloadAll")}
          </button>
        )}
        <button
          onClick={onReset}
          className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
        >
          {t("reset")}
        </button>
      </div>
    </div>
  );
}
