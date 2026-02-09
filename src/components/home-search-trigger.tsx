"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { MagnifyingGlass as Search } from "@phosphor-icons/react";
import { type Tool, type ToolCategoryId, getCategoryClasses } from "@/lib/tools/registry";
import { ToolIcon } from "@/components/tool-icon";
import { cn } from "@/lib/utils";
import { useFuseSearch, type SearchableTool } from "@/hooks/use-fuse-search";

const TYPING_SPEED = 55;
const DELETING_SPEED = 30;
const PAUSE_AFTER_TYPE = 2200;
const PAUSE_AFTER_DELETE = 400;

const PHRASES: Record<string, string[]> = {
  en: [
    "Compress a PDF file...",
    "Convert an image to PNG...",
    "Trim a video clip...",
    "Remove background from a photo...",
    "Merge multiple PDFs...",
    "Convert video to GIF...",
    "Extract text from a PDF...",
    "Resize an image...",
  ],
  it: [
    "Comprimi un file PDF...",
    "Converti un'immagine in PNG...",
    "Taglia un video...",
    "Rimuovi lo sfondo da una foto...",
    "Unisci più PDF insieme...",
    "Converti un video in GIF...",
    "Estrai il testo da un PDF...",
    "Ridimensiona un'immagine...",
  ],
  es: [
    "Comprimir un archivo PDF...",
    "Convertir una imagen a PNG...",
    "Recortar un video...",
    "Eliminar el fondo de una foto...",
    "Fusionar varios PDF...",
    "Convertir video a GIF...",
    "Extraer texto de un PDF...",
    "Redimensionar una imagen...",
  ],
  fr: [
    "Compresser un fichier PDF...",
    "Convertir une image en PNG...",
    "Couper une vidéo...",
    "Supprimer le fond d'une photo...",
    "Fusionner plusieurs PDF...",
    "Convertir une vidéo en GIF...",
    "Extraire le texte d'un PDF...",
    "Redimensionner une image...",
  ],
  de: [
    "Eine PDF-Datei komprimieren...",
    "Ein Bild in PNG umwandeln...",
    "Ein Video schneiden...",
    "Hintergrund von einem Foto entfernen...",
    "Mehrere PDFs zusammenfügen...",
    "Video in GIF umwandeln...",
    "Text aus einer PDF extrahieren...",
    "Ein Bild skalieren...",
  ],
  pt: [
    "Comprimir um arquivo PDF...",
    "Converter uma imagem para PNG...",
    "Cortar um vídeo...",
    "Remover o fundo de uma foto...",
    "Juntar vários PDFs...",
    "Converter vídeo em GIF...",
    "Extrair texto de um PDF...",
    "Redimensionar uma imagem...",
  ],
  ja: [
    "PDFファイルを圧縮...",
    "画像をPNGに変換...",
    "動画をトリミング...",
    "写真の背景を削除...",
    "複数のPDFを結合...",
    "動画をGIFに変換...",
    "PDFからテキストを抽出...",
    "画像をリサイズ...",
  ],
  ko: [
    "PDF 파일 압축...",
    "이미지를 PNG로 변환...",
    "동영상 자르기...",
    "사진 배경 제거...",
    "여러 PDF 합치기...",
    "동영상을 GIF로 변환...",
    "PDF에서 텍스트 추출...",
    "이미지 크기 조절...",
  ],
};

function useTypewriter(phrases: string[], active: boolean) {
  const [display, setDisplay] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!active) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const phrase = phrases[phraseIndex];

    if (!isDeleting && charIndex <= phrase.length) {
      setDisplay(phrase.slice(0, charIndex));
      if (charIndex === phrase.length) {
        timeoutRef.current = setTimeout(() => setIsDeleting(true), PAUSE_AFTER_TYPE);
      } else {
        timeoutRef.current = setTimeout(() => setCharIndex((c) => c + 1), TYPING_SPEED);
      }
    } else if (isDeleting && charIndex >= 0) {
      setDisplay(phrase.slice(0, charIndex));
      if (charIndex === 0) {
        timeoutRef.current = setTimeout(() => {
          setIsDeleting(false);
          setPhraseIndex((i) => (i + 1) % phrases.length);
        }, PAUSE_AFTER_DELETE);
      } else {
        timeoutRef.current = setTimeout(() => setCharIndex((c) => c - 1), DELETING_SPEED);
      }
    }

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [charIndex, isDeleting, phraseIndex, phrases, active]);

  return display;
}

export function HomeSearchTrigger() {
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const tSearch = useTranslations("search");
  const router = useRouter();

  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const phrases = PHRASES[locale] || PHRASES.en;
  const typewriterActive = !focused && query === "";
  const typedText = useTypewriter(phrases, typewriterActive);

  const { fuse, toolsWithMeta } = useFuseSearch();

  // Fuzzy search with Fuse.js
  const filteredTools = useMemo(() => {
    const q = query.trim();
    if (!q) return [] as SearchableTool[];
    const results = fuse.search(q, { limit: 8 });
    return results.map((r) => r.item);
  }, [query, fuse]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, SearchableTool[]> = {};
    for (const tool of filteredTools) {
      if (!groups[tool.category]) groups[tool.category] = [];
      groups[tool.category].push(tool);
    }
    return groups;
  }, [filteredTools]);

  const showResults = focused && query.trim().length > 0;

  const handleSelect = useCallback(
    (tool: Tool) => {
      setFocused(false);
      setQuery("");
      inputRef.current?.blur();
      const cat = tool.category;
      router.push(`/${cat}/${tool.slug}` as any);
    },
    [router]
  );

  // Keyboard nav
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
      } else if (e.key === "Escape") {
        inputRef.current?.blur();
        setFocused(false);
      }
    },
    [filteredTools, selectedIndex, handleSelect]
  );

  // Reset selection on query change
  useEffect(() => { setSelectedIndex(0); }, [query]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Click outside to close
  useEffect(() => {
    if (!focused) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [focused]);

  // Cmd+K focuses the hero input
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setFocused(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  let flatIndex = -1;

  return (
    <div ref={containerRef} className="mx-auto max-w-2xl relative z-[60]">
      {/* Search bar */}
      <div
        className={cn(
          "relative rounded-2xl border transition-all duration-300",
          focused
            ? "border-cyan-500/20 bg-white/[0.05] shadow-lg shadow-cyan-500/[0.05]"
            : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.12]"
        )}
      >
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/25 pointer-events-none z-10" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent py-5 pl-14 pr-24 text-base text-white outline-none placeholder:text-transparent"
          autoComplete="off"
          spellCheck={false}
        />
        {/* Typewriter overlay — hidden when focused with text */}
        {(typewriterActive || (focused && query === "")) && query === "" && (
          <div className="absolute left-14 top-1/2 -translate-y-1/2 pointer-events-none text-base text-white/25">
            {focused ? (
              <span>{tSearch("placeholder")}</span>
            ) : (
              <span>
                {typedText}
                <span className="inline-block w-[2px] h-[1.1em] bg-cyan-400/60 ml-[1px] align-middle animate-pulse" />
              </span>
            )}
          </div>
        )}
        <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-6 items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 font-mono text-[11px] font-medium text-white/20">
          {focused ? "ESC" : "Cmd+K"}
        </kbd>
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200"
        >
          <div
            ref={listRef}
            className="max-h-[400px] overflow-y-auto overscroll-contain py-2 px-2"
            onWheel={(e) => {
              const el = e.currentTarget;
              const atTop = el.scrollTop === 0 && e.deltaY < 0;
              const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && e.deltaY > 0;
              if (!atTop && !atBottom) e.stopPropagation();
            }}
          >
            {filteredTools.length === 0 ? (
              <p className="py-8 text-center text-sm text-white/25">
                {tSearch("noResults")}
              </p>
            ) : (
              Object.entries(grouped).map(([category, categoryTools]) => (
                <div key={category} className="mb-1">
                  <div className="flex items-center gap-2 px-3.5 pt-3 pb-1.5">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full opacity-60",
                        getCategoryClasses(category as ToolCategoryId).bg
                      )}
                    />
                    <p className="text-[11px] font-medium uppercase tracking-wider text-white/30">
                      {(() => { try { return tNav(category); } catch { return category; } })()}
                    </p>
                  </div>
                  {categoryTools.map((tool) => {
                    flatIndex++;
                    const idx = flatIndex;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={tool.id}
                        data-idx={idx}
                        onClick={() => handleSelect(tool)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-all duration-150",
                          isSelected
                            ? "bg-white/[0.06] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                            : "hover:bg-white/[0.04]"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-150",
                            isSelected ? "bg-white/[0.08]" : "bg-white/[0.04]",
                            getCategoryClasses(tool.category).text,
                            isSelected ? "opacity-100" : "opacity-60"
                          )}
                        >
                          <ToolIcon name={tool.icon} className="h-[18px] w-[18px]" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate transition-colors",
                            isSelected ? "text-white" : "text-white/60"
                          )}>
                            {tool.name}
                          </p>
                          <p className={cn(
                            "text-xs truncate transition-colors",
                            isSelected ? "text-white/35" : "text-white/20"
                          )}>
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

          {/* Footer */}
          <div className="border-t border-white/[0.06] px-4 py-2.5 flex items-center justify-between">
            <span className="text-[11px] text-white/20">{tSearch("hint")}</span>
            <span className="text-[11px] text-white/20">
              {filteredTools.length} {filteredTools.length === 1 ? tSearch("result") : tSearch("results")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
