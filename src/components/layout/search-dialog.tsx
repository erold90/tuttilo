"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { MagnifyingGlass as Search } from "@phosphor-icons/react";
import { type Tool, type ToolCategoryId, getCategoryClasses } from "@/lib/tools/registry";
import { ToolIcon } from "@/components/tool-icon";
import { cn } from "@/lib/utils";
import { useFuseSearch, type SearchableTool } from "@/hooks/use-fuse-search";

function getToolHref(tool: Tool): string {
  return `/${tool.category}/${tool.slug}`;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const tSearch = useTranslations("search");
  const tNav = useTranslations("nav");
  const router = useRouter();

  const { fuse, toolsWithMeta } = useFuseSearch();

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Auto-focus input when open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Fuzzy search with Fuse.js
  const filteredTools = useMemo(() => {
    const q = query.trim();
    if (!q) return toolsWithMeta.slice(0, 8);
    const results = fuse.search(q, { limit: 12 });
    return results.map((r) => r.item);
  }, [query, fuse, toolsWithMeta]);

  const grouped = useMemo(() => {
    const groups: Record<string, SearchableTool[]> = {};
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

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredTools.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filteredTools[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredTools[selectedIndex]);
      }
    },
    [filteredTools, selectedIndex, handleSelect]
  );

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Track flat index
  let flatIndex = -1;

  return (
    <>
      {/* Navbar trigger — small search icon */}
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/[0.06] transition-colors"
        aria-label={tSearch("openSearch")}
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Overlay + Dialog */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
            onClick={() => setOpen(false)}
          />

          {/* Search panel */}
          <div className="relative mx-auto mt-[12vh] w-full max-w-[560px] px-4 animate-in fade-in-0 slide-in-from-top-4 duration-300">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0f]/90 backdrop-blur-xl shadow-2xl shadow-cyan-500/[0.05]">
              {/* Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                <Search className="h-4.5 w-4.5 text-white/30 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={tSearch("placeholder")}
                  className="flex-1 bg-transparent text-[15px] text-white placeholder:text-white/25 outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                <kbd className="hidden sm:inline-flex h-5 items-center rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 font-mono text-[10px] text-white/20">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[360px] overflow-y-auto overscroll-contain py-2 px-2">
                {Object.keys(grouped).length === 0 ? (
                  <p className="py-8 text-center text-sm text-white/30">
                    {tSearch("noResults")}
                  </p>
                ) : (
                  Object.entries(grouped).map(([category, categoryTools]) => (
                    <div key={category} className="mb-1">
                      <p
                        className={cn(
                          "px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest",
                          getCategoryClasses(category as ToolCategoryId).text,
                          "opacity-60"
                        )}
                      >
                        {(() => { try { return tNav(category); } catch { return category; } })()}
                      </p>
                      {categoryTools.map((tool) => {
                        flatIndex++;
                        const idx = flatIndex;
                        const isSelected = idx === selectedIndex;
                        return (
                          <button
                            key={tool.id}
                            data-index={idx}
                            onClick={() => handleSelect(tool)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                              isSelected
                                ? "bg-white/[0.06]"
                                : "hover:bg-white/[0.04]"
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                                isSelected ? "bg-white/[0.08]" : "bg-white/[0.04]",
                                getCategoryClasses(tool.category).text
                              )}
                            >
                              <ToolIcon name={tool.icon} className="h-4 w-4" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium truncate transition-colors",
                                isSelected ? "text-white" : "text-white/70"
                              )}>
                                {tool.name}
                              </p>
                              <p className="text-xs text-white/25 truncate">
                                {tool.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="border-t border-white/[0.06] px-5 py-2.5 flex items-center justify-between">
                <span className="text-[10px] text-white/15">{tSearch("hint")}</span>
                <kbd className="hidden sm:inline-flex items-center rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-white/15">
                  Cmd+K
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
