"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  List as Menu,
  CaretDown,
  X,
  FileText,
  Image as ImageIcon,
  VideoCamera,
  MusicNote,
  TextT,
  YoutubeLogo,
  Calculator,
  ArrowsClockwise,
  Palette,
  Clock,
  Shuffle,
  Code,
  MagnifyingGlass as MagGlass,
  ShareNetwork,
  Globe,
  ShieldCheck,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SearchDialog } from "@/components/layout/search-dialog";
import {
  getPrimaryNavItems,
  getMegaMenuGroups,
  getCategoryNavItems,
  type ToolCategoryId,
  type CategoryGroupId,
} from "@/lib/tools/registry";
import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/logo";

const primaryNav = getPrimaryNavItems();
const megaGroups = getMegaMenuGroups();
const allCategories = getCategoryNavItems();

const categoryIconMap: Record<ToolCategoryId, React.ElementType> = {
  pdf: FileText,
  image: ImageIcon,
  video: VideoCamera,
  audio: MusicNote,
  text: TextT,
  youtube: YoutubeLogo,
  calculators: Calculator,
  converters: ArrowsClockwise,
  "color-design": Palette,
  datetime: Clock,
  generators: Shuffle,
  developer: Code,
  seo: MagGlass,
  social: ShareNetwork,
  network: Globe,
  security: ShieldCheck,
};

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<CategoryGroupId | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("nav");
  const pathname = usePathname();

  // Close mega menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    }
    if (megaOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [megaOpen]);

  // Close mega menu on route change
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const groupLabels: Record<CategoryGroupId, string> = {
    file: t("groupFile"),
    content: t("groupContent"),
    utility: t("groupUtility"),
    webdev: t("groupWebDev"),
  };

  return (
    <header className="sticky top-0 z-50 h-14 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 mx-auto max-w-7xl">
        {/* Left: Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight"
        >
          <LogoIcon className="h-6 w-6" />
          <span className="text-cyan-500">Tuttilo</span>
        </Link>

        {/* Center: Primary nav + All Tools (desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {primaryNav.map((cat) => (
            <Link
              key={cat.key}
              href={cat.href}
              className={cn(
                "group relative px-3 py-1.5 text-sm font-medium transition-colors",
                cat.hoverText,
                pathname.startsWith(cat.href)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {t(cat.key)}
              <span
                className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300",
                  pathname.startsWith(cat.href)
                    ? "w-4/5 bg-cyan-500"
                    : "w-0 group-hover:w-4/5 bg-current opacity-60"
                )}
              />
            </Link>
          ))}

          {/* All Tools mega menu trigger */}
          <div ref={megaRef} className="relative">
            <button
              onClick={() => setMegaOpen(!megaOpen)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-colors",
                megaOpen
                  ? "text-cyan-500"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("allTools")}
              <CaretDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  megaOpen && "rotate-180"
                )}
              />
            </button>

            {/* Mega menu dropdown */}
            {megaOpen && (
              <div className="absolute top-full right-0 mt-2 w-[680px] rounded-xl border bg-background/95 backdrop-blur-xl shadow-2xl p-5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-4 gap-5">
                  {megaGroups.map((group) => (
                    <div key={group.id}>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        {groupLabels[group.id]}
                      </h3>
                      <div className="flex flex-col gap-1">
                        {group.categories.map((cat) => {
                          const Icon = categoryIconMap[cat.id];
                          return (
                            <Link
                              key={cat.id}
                              href={`/${cat.slug}`}
                              onClick={() => setMegaOpen(false)}
                              className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                                pathname.startsWith(`/${cat.slug}`)
                                  ? "bg-accent text-accent-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                              )}
                            >
                              <Icon
                                className="h-4 w-4 flex-shrink-0"
                                style={{ color: cat.color }}
                                weight="duotone"
                              />
                              <span className="truncate">{t(cat.id)}</span>
                              <span className="ml-auto text-xs text-muted-foreground/60">
                                {cat.availableCount}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <SearchDialog />
          <LanguageSwitcher />

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 lg:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("openMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-left flex items-center gap-2">
                  <LogoIcon className="h-5 w-5" />
                  <span className="text-cyan-500 font-bold">Tuttilo</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                {megaGroups.map((group) => (
                  <div key={group.id}>
                    <button
                      onClick={() =>
                        setExpandedGroup(
                          expandedGroup === group.id ? null : group.id
                        )
                      }
                      className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {groupLabels[group.id]}
                      <CaretDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          expandedGroup === group.id && "rotate-180"
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200",
                        expandedGroup === group.id
                          ? "max-h-[500px] opacity-100"
                          : "max-h-0 opacity-0"
                      )}
                    >
                      {group.categories.map((cat) => {
                        const Icon = categoryIconMap[cat.id];
                        return (
                          <Link
                            key={cat.id}
                            href={`/${cat.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-md transition-colors",
                              pathname.startsWith(`/${cat.slug}`)
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Icon
                              className="h-4 w-4 flex-shrink-0"
                              style={{ color: cat.color }}
                              weight="duotone"
                            />
                            <span>{t(cat.id)}</span>
                            <span className="ml-auto text-xs text-muted-foreground/60">
                              {cat.availableCount}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
