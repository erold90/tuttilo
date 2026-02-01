"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

export function HomeSearchTrigger() {
  const t = useTranslations("home");

  const openSearch = useCallback(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    );
  }, []);

  return (
    <div className="mx-auto max-w-lg">
      <button
        onClick={openSearch}
        className="relative w-full rounded-lg border bg-background/50 py-3 pl-10 pr-4 text-sm backdrop-blur hover:bg-accent/50 transition-colors text-left cursor-pointer"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">{t("searchPlaceholder")}</span>
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          Cmd+K
        </kbd>
      </button>
    </div>
  );
}
