"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

const TAG_MODIFIERS = ["tutorial","how to","best","top","guide","tips","tricks","review","2026","for beginners","explained","vs","ultimate","free","easy","step by step","complete","advanced","pro","hack"];
const HASHTAG_MODIFIERS = ["viral","trending","fyp","shorts","tips","life","daily","motivation","inspo","creator","content","growth","success","mindset","reels"];
const TITLE_TEMPLATES = [
  (k: string) => `How to ${k} — Complete Guide (2026)`,
  (k: string) => `${k}: Everything You Need to Know`,
  (k: string) => `10 ${k} Tips That Actually Work`,
  (k: string) => `The Ultimate ${k} Tutorial for Beginners`,
  (k: string) => `Why ${k} Changes Everything`,
  (k: string) => `${k} in 2026: What Nobody Tells You`,
  (k: string) => `I Tried ${k} for 30 Days — Here's What Happened`,
  (k: string) => `${k} vs Traditional Methods: Which Is Better?`,
  (k: string) => `Stop Making These ${k} Mistakes!`,
  (k: string) => `${k} Made Simple — 5 Minute Guide`,
  (k: string) => `The Truth About ${k} (No One Talks About This)`,
  (k: string) => `Master ${k} in Just 7 Days`,
];

type Tab = "tags" | "hashtags" | "titles" | "description";

export function YoutubeSeoGenerator() {
  const t = useTranslations("tools.youtube-seo-generator.ui");
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("tags");
  const [copied, setCopied] = useState(false);

  // Tags generation
  const tags = useMemo(() => {
    const k = keyword.trim();
    if (!k) return [];
    const result: string[] = [k];
    const words = k.toLowerCase().split(/\s+/);
    TAG_MODIFIERS.forEach((mod) => {
      result.push(`${k} ${mod}`);
      result.push(`${mod} ${k}`);
    });
    if (words.length > 1) {
      result.push(words.join(""));
      result.push(words.join("-"));
    }
    return [...new Set(result)].slice(0, 30);
  }, [keyword]);

  // Hashtags generation
  const hashtags = useMemo(() => {
    const k = keyword.trim();
    if (!k) return [];
    const base = k.toLowerCase().replace(/\s+/g, "");
    const result = [`#${base}`];
    HASHTAG_MODIFIERS.forEach((mod) => result.push(`#${base}${mod}`));
    const words = k.toLowerCase().split(/\s+/);
    if (words.length > 1) words.forEach((w) => result.push(`#${w}`));
    result.push("#youtube", "#subscribe", "#viral");
    return [...new Set(result)].slice(0, 30);
  }, [keyword]);

  // Titles
  const titles = useMemo(() => {
    const k = keyword.trim();
    if (!k) return [];
    return TITLE_TEMPLATES.map((tpl) => tpl(k));
  }, [keyword]);

  // Description template
  const description = useMemo(() => {
    const k = keyword.trim() || "your topic";
    return `In this video, I'll show you everything about ${k}.\n\n` +
      `\u23f0 Timestamps:\n00:00 - Introduction\n01:00 - What is ${k}\n03:00 - How it works\n05:00 - Tips & tricks\n08:00 - Conclusion\n\n` +
      `\ud83d\udd17 Links:\n- Website: \n- Instagram: \n- Twitter: \n\n` +
      `\ud83c\udff7\ufe0f Tags: ${tags.slice(0, 10).join(", ")}\n\n` +
      `${hashtags.slice(0, 5).join(" ")}\n\n` +
      `If you found this helpful, please like, subscribe, and hit the notification bell!`;
  }, [keyword, tags, hashtags]);

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
