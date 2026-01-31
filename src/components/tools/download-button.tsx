"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Download, RotateCcw, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils/file";
import { downloadBlob, downloadMultiple } from "@/lib/utils/download";
import { BeforeAfter } from "@/components/tools/before-after";

interface DownloadButtonProps {
  results: Blob[];
  filenames: string[];
  originalFiles?: File[];
  onReset: () => void;
  className?: string;
}

export function DownloadButton({
  results,
  filenames,
  originalFiles,
  onReset,
  className,
}: DownloadButtonProps) {
  const t = useTranslations("download");
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current = [];
    };
  }, []);

  const handleDownloadSingle = useCallback(() => {
    if (results[0] && filenames[0]) {
      downloadBlob(results[0], filenames[0]);
    }
  }, [results, filenames]);

  const handleDownloadAll = useCallback(() => {
    downloadMultiple(results, filenames);
  }, [results, filenames]);

  const handleDownloadOne = useCallback(
    (index: number) => {
      if (results[index] && filenames[index]) {
        downloadBlob(results[index], filenames[index]);
      }
    },
    [results, filenames]
  );

  if (results.length === 0) return null;

  const totalResultSize = results.reduce((acc, b) => acc + b.size, 0);
  const totalOriginalSize = originalFiles
    ? originalFiles.reduce((acc, f) => acc + f.size, 0)
    : undefined;

  const isSingle = results.length === 1;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Before/After comparison */}
      {totalOriginalSize !== undefined && (
        <BeforeAfter
          originalSize={totalOriginalSize}
          resultSize={totalResultSize}
        />
      )}

      {/* Download action */}
      {isSingle ? (
        <Button
          size="lg"
          onClick={handleDownloadSingle}
          className="w-full gap-2 text-base"
        >
          <Download className="h-5 w-5" />
          {t("downloadFile")}
          <span className="ml-1 text-sm opacity-75">
            ({formatFileSize(results[0].size)})
          </span>
        </Button>
      ) : (
        <div className="space-y-3">
          <Button
            size="lg"
            onClick={handleDownloadAll}
            className="w-full gap-2 text-base"
          >
            <Package className="h-5 w-5" />
            {t("downloadAll", { count: results.length })}
          </Button>

          <div className="space-y-2">
            {results.map((blob, index) => (
              <button
                key={filenames[index]}
                onClick={() => handleDownloadOne(index)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-sm transition-colors hover:bg-accent/50"
              >
                <span className="truncate font-medium">
                  {filenames[index]}
                </span>
                <span className="ml-2 shrink-0 text-muted-foreground">
                  {formatFileSize(blob.size)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onReset}
        className="w-full gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        {t("processAnother")}
      </Button>
    </div>
  );
}
