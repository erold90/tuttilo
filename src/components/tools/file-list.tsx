"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { X, FileText, FileImage, FileAudio, FileVideo, File as FileIcon, GripVertical } from "lucide-react";
import { formatFileSize } from "@/lib/utils/file";
import { Button } from "@/components/ui/button";

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
  className?: string;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("audio/")) return FileAudio;
  if (type.startsWith("video/")) return FileVideo;
  if (
    type === "application/pdf" ||
    type.includes("document") ||
    type.includes("text")
  )
    return FileText;
  return FileIcon;
}

export function FileList({ files, onRemove, className }: FileListProps) {
  const t = useTranslations("fileList");

  const handleRemove = useCallback(
    (index: number) => {
      onRemove(index);
    },
    [onRemove]
  );

  if (files.length === 0) return null;

  const isCompact = files.length <= 3;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {t("filesSelected", { count: files.length })}
        </p>
      </div>

      <div
        className={cn(
          "gap-2",
          isCompact
            ? "flex flex-wrap"
            : "flex flex-col"
        )}
      >
        {files.map((file, index) => {
          const Icon = getFileIcon(file.type);
          return (
            <div
              key={`${file.name}-${file.size}-${index}`}
              className={cn(
                "group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50",
                isCompact ? "flex-1 min-w-[200px]" : "w-full"
              )}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/40" />

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleRemove(index)}
                aria-label={t("removeFile", { name: file.name })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
