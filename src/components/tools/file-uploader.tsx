"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Upload, WarningCircle as AlertCircle } from "@phosphor-icons/react";
import { isValidFileType, isValidFileSize, formatFileSize } from "@/lib/utils/file";

interface FileUploaderProps {
  accept: string[];
  maxSize: number;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

export function FileUploader({
  accept,
  maxSize,
  multiple = true,
  onFilesSelected,
  className,
}: FileUploaderProps) {
  const t = useTranslations("fileUploader");
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList);
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        if (!isValidFileType(file, accept)) {
          errors.push(
            t("errorFormat", { name: file.name })
          );
          continue;
        }
        if (!isValidFileSize(file, maxSize)) {
          errors.push(
            t("errorSize", {
              name: file.name,
              maxSize: formatFileSize(maxSize),
            })
          );
          continue;
        }
        validFiles.push(file);
      }

      if (errors.length > 0) {
        setError(errors.join(" "));
      } else {
        setError(null);
      }

      if (validFiles.length > 0) {
        onFilesSelected(multiple ? validFiles : [validFiles[0]]);
      }
    },
    [accept, maxSize, multiple, onFilesSelected, t]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      validateAndSelect(e.dataTransfer.files);
    },
    [validateAndSelect]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      validateAndSelect(e.target.files);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [validateAndSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const acceptString = accept.join(",");
  const acceptDisplay = accept
    .map((type) => {
      const ext = type.split("/")[1]?.toUpperCase();
      return ext || type;
    })
    .join(", ");

  return (
    <div className={cn("w-full", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label={t("ariaLabel")}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all",
          "border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
          "dark:border-muted-foreground/20 dark:bg-muted/10 dark:hover:border-primary/40",
          isDragOver && "border-primary bg-primary/5 dark:bg-primary/10"
        )}
      >
        <div
          className={cn(
            "rounded-full bg-muted p-4 transition-colors",
            isDragOver && "bg-primary/10"
          )}
        >
          <Upload
            className={cn(
              "h-8 w-8 text-muted-foreground transition-colors",
              isDragOver && "text-primary"
            )}
          />
        </div>

        <div className="text-center">
          <p className="text-base font-medium">
            {t("dragDrop")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("orClick")}
          </p>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>{t("acceptedFormats", { formats: acceptDisplay })}</p>
          <p>{t("maxSize", { size: formatFileSize(maxSize) })}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={acceptString}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
