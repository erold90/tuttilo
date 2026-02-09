"use client";

import { useState, useEffect, useRef } from "react";
import { BookmarkSimple } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  className?: string;
}

export function BookmarkButton({ className }: BookmarkButtonProps) {
  const t = useTranslations("common");
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMac(navigator.platform?.toUpperCase().includes("MAC") || navigator.userAgent?.includes("Mac"));
  }, []);

  useEffect(() => {
    if (!showTooltip) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current && !tooltipRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTooltip]);

  const shortcut = isMac ? "⌘ + D" : "Ctrl + D";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowTooltip((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all hover:bg-muted",
          "text-muted-foreground hover:text-foreground",
          className
        )}
        aria-label={t("bookmark.label")}
      >
        <BookmarkSimple weight="regular" className="h-4.5 w-4.5" />
        <span className="hidden sm:inline">{t("bookmark.label")}</span>
      </button>
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-lg"
        >
          <p className="mb-1 font-medium">{t("bookmark.tooltipTitle")}</p>
          <p className="text-muted-foreground">
            {t("bookmark.tooltipDesc")}{" "}
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
              {shortcut}
            </kbd>
          </p>
        </div>
      )}
    </div>
  );
}
