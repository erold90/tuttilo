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
import { tools, type Tool, type ToolCategoryId, getCategoryClasses } from "@/lib/tools/registry";
import { ToolIcon } from "@/components/tool-icon";
import { cn } from "@/lib/utils";

function getToolHref(tool: Tool): string {
  return `/${tool.category}/${tool.slug}`;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const t = useTranslations("tools");
  const tSearch = useTranslations("search");
  const tNav = useTranslations("nav");
  const router = useRouter();

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

  const toolsWithNames = useMemo(() => {
    return tools.map((tool) => {
      let name = tool.id;
      let description = "";
      try {
        name = t(`${tool.id}.name`);
        description = t(`${tool.id}.description`);
      } catch {
        name = tool.id.replace(/-/g, " ");
      }
      return { ...tool, name, description };
    });
  }, [t]);

  const filteredTools = useMemo(() => {
    if (!query.trim()) return toolsWithNames.slice(0, 12);
    const q = query.toLowerCase();
    return toolsWithNames.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q)
    );
  }, [query, toolsWithNames]);

  const grouped = useMemo(() => {
    const groups: Record<string, (Tool & { name: string; description: string })[]> = {};
    for (const tool of filteredTools) {
      if (!groups[tool.category]) groups[tool.category] = [];
      groups[tool.category].push(tool);
    }
    return groups;
  }, [filteredTools]);

  const handleSelect = useCallback(
    (tool: Tool) => {
      setOpen(false);
      setQuery("");
      router.push(getToolHref(tool) as any);
    },
    [router]
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors"
        aria-label={tSearch("openSearch")}
      >
        <Search className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{tSearch("title")}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tSearch("placeholder")}
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
                {tSearch("noResults")}
              </p>
            ) : (
              Object.entries(grouped).map(([category, categoryTools]) => (
                <div key={category} className="mb-2">
                  <p
                    className={cn(
                      "px-2 py-1.5 text-xs font-semibold uppercase tracking-wider",
                      getCategoryClasses(category as ToolCategoryId).text
                    )}
                  >
                    {(() => { try { return tNav(category); } catch { return category; } })()}
                  </p>
                  {categoryTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelect(tool)}
                      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors text-left"
                    >
                      <span className={cn("flex h-8 w-8 items-center justify-center rounded-md", getCategoryClasses(tool.category).bg, getCategoryClasses(tool.category).text)}>
                        <ToolIcon name={tool.icon} className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{tool.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {tool.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          <div className="border-t p-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>{tSearch("hint")}</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              Cmd+K
            </kbd>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
