"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

type Tab = "tags" | "hashtags" | "titles" | "description";

export function YoutubeSeoGenerator() {
  const t = useTranslations("tools.youtube-seo-generator.ui");
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("tags");
  const [copied, setCopied] = useState(false);

  // Parse comma-separated modifiers from translations
  const tagMods = useMemo(() => t("tagModifiers").split(",").map((s) => s.trim()).filter(Boolean), [t]);
  const hashtagMods = useMemo(() => t("hashtagModifiers").split(",").map((s) => s.trim()).filter(Boolean), [t]);

  // Tags generation
  const tags = useMemo(() => {
    const k = keyword.trim();
    if (!k) return [];
    const result: string[] = [k];
    const words = k.toLowerCase().split(/\s+/);
    tagMods.forEach((mod) => {
      result.push(`${k} ${mod}`);
      result.push(`${mod} ${k}`);
    });
    if (words.length > 1) {
      result.push(words.join(""));
      result.push(words.join("-"));
    }
    return [...new Set(result)].slice(0, 30);
  }, [keyword, tagMods]);

  // Hashtags generation
  const hashtags = useMemo(() => {
    const k = keyword.trim();
    if (!k) return [];
    const base = k.toLowerCase().replace(/\s+/g, "");
    const result = [`#${base}`];
    hashtagMods.forEach((mod) => result.push(`#${base}${mod}`));
    const words = k.toLowerCase().split(/\s+/);
    if (words.length > 1) words.forEach((w) => result.push(`#${w}`));
    result.push("#youtube", "#subscribe", "#viral");
    return [...new Set(result)].slice(0, 30);
  }, [keyword, hashtagMods]);

  // Titles from translation templates
  const titles = useMemo(() => {
    const k = keyword.trim();
    if (!k) return [];
    const result: string[] = [];
    for (let i = 1; i <= 12; i++) {
      try {
        const tpl = t(`titleTemplate${i}`, { keyword: k });
        if (tpl && !tpl.startsWith("tools.")) result.push(tpl);
      } catch { break; }
    }
    return result;
  }, [keyword, t]);

  // Description template from translations
  const description = useMemo(() => {
    const k = keyword.trim() || "your topic";
    return t("descriptionTemplate", {
      keyword: k,
      tags: tags.slice(0, 10).join(", "),
      hashtags: hashtags.slice(0, 5).join(" "),
    });
  }, [keyword, tags, hashtags, t]);

  const copyAll = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const tabContent: Record<Tab, string> = {
    tags: tags.join(", "),
    hashtags: hashtags.join(" "),
    titles: titles.join("\n"),
    description,
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "tags", label: t("tabTags") },
    { key: "hashtags", label: t("tabHashtags") },
    { key: "titles", label: t("tabTitles") },
    { key: "description", label: t("tabDescription") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">{t("keyword")}</label>
        <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={t("keywordPlaceholder")}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      </div>

      {keyword.trim() && (
        <>
          <div className="flex gap-1 border-b border-border">
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div>
            {activeTab === "tags" && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-muted text-sm">{tag}</span>
                ))}
              </div>
            )}
            {activeTab === "hashtags" && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((h, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">{h}</span>
                ))}
              </div>
            )}
            {activeTab === "titles" && (
              <div className="space-y-2">
                {titles.map((title, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm cursor-pointer hover:bg-muted"
                    onClick={() => copyAll(title)}>
                    <span className="text-muted-foreground text-xs w-6">{i + 1}.</span>
                    <span className="flex-1">{title}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "description" && (
              <pre className="rounded-lg border border-border bg-muted/30 p-4 text-sm whitespace-pre-wrap">{description}</pre>
            )}
          </div>

          <button onClick={() => copyAll(tabContent[activeTab])}
            className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 text-sm">
            {copied ? t("copied") : t("copyAll")}
          </button>
        </>
      )}
    </div>
  );
}
