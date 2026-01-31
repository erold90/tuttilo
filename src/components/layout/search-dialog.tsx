"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getAllTools, type Tool } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  pdf: "text-[#EF4444]",
  image: "text-[#22C55E]",
  video: "text-[#8B5CF6]",
  audio: "text-[#F97316]",
  text: "text-[#3B82F6]",
  developer: "text-[#14B8A6]",
  youtube: "text-[#EC4899]",
};

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const t = useTranslations("search");
  const router = useRouter();

  // CMD+K / CTRL+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const allTools = useMemo(() => {
    try {
      return getAllTools();
    } catch {
      return [];
    }
  }, []);

  const filteredTools = useMemo(() => {
    if (!query.trim()) return allTools.slice(0, 12);
    const q = query.toLowerCase();
    return allTools.filter(
      (tool: Tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.description?.toLowerCase().includes(q) ||
        tool.category?.toLowerCase().includes(q)
    );
  }, [query, allTools]);

  const grouped = useMemo(() => {
    const groups: Record<string, Tool[]> = {};
    for (const tool of filteredTools) {
      const cat = tool.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(tool);
    }
    return groups;
  }, [filteredTools]);

  const handleSelect = useCallback(
    (tool: Tool) => {
      setOpen(false);
      setQuery("");
      router.push(tool.href);
    },
    [router]
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors"
        aria-label={t("openSearch")}
      >
        <Search className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("placeholder")}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-11"
              autoFocus
            />
            <kbd className="ml-2 hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2">
            {Object.keys(grouped).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("noResults")}
              </p>
            ) : (
              Object.entries(grouped).map(([category, tools]) => (
                <div key={category} className="mb-2">
                  <p
                    className={cn(
                      "px-2 py-1.5 text-xs font-semibold uppercase tracking-wider",
                      categoryColors[category] || "text-muted-foreground"
                    )}
                  >
                    {category}
                  </p>
                  {tools.map((tool: Tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelect(tool)}
                      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors text-left"
                    >
                      {tool.icon && (
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                          {tool.icon}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{tool.name}</p>
                        {tool.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {tool.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          <div className="border-t p-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>{t("hint")}</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              Cmd+K
            </kbd>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
