"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function MetaTagGenerator() {
  const t = useTranslations("tools.meta-tag-generator");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [author, setAuthor] = useState("");
  const [robots, setRobots] = useState("index, follow");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [ogUrl, setOgUrl] = useState("");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [viewport, setViewport] = useState("width=device-width, initial-scale=1");
  const [charset, setCharset] = useState("UTF-8");
  const [canonical, setCanonical] = useState("");

  const generateTags = () => {
    const lines: string[] = [];
    lines.push(`<meta charset="${charset}">`);
    lines.push(`<meta name="viewport" content="${viewport}">`);
    if (title) lines.push(`<title>${title}</title>`);
    if (description) lines.push(`<meta name="description" content="${description}">`);
    if (keywords) lines.push(`<meta name="keywords" content="${keywords}">`);
    if (author) lines.push(`<meta name="author" content="${author}">`);
    lines.push(`<meta name="robots" content="${robots}">`);
    if (canonical) lines.push(`<link rel="canonical" href="${canonical}">`);
    // Open Graph
    if (ogTitle || title) lines.push(`<meta property="og:title" content="${ogTitle || title}">`);
    if (ogDescription || description) lines.push(`<meta property="og:description" content="${ogDescription || description}">`);
    if (ogImage) lines.push(`<meta property="og:image" content="${ogImage}">`);
    if (ogUrl) lines.push(`<meta property="og:url" content="${ogUrl}">`);
    lines.push(`<meta property="og:type" content="website">`);
    // Twitter
    lines.push(`<meta name="twitter:card" content="${twitterCard}">`);
    if (ogTitle || title) lines.push(`<meta name="twitter:title" content="${ogTitle || title}">`);
    if (ogDescription || description) lines.push(`<meta name="twitter:description" content="${ogDescription || description}">`);
    if (ogImage) lines.push(`<meta name="twitter:image" content="${ogImage}">`);
    return lines.join("\n");
  };

  const output = generateTags();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("ui.basic")}</h3>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.title")}
            <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="My Website" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.description")}
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} maxLength={160} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="A brief description..." />
            <span className="text-xs text-zinc-400">{description.length}/160</span>
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.keywords")}
            <input value={keywords} onChange={e => setKeywords(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="keyword1, keyword2" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.author")}
            <input value={author} onChange={e => setAuthor(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.robots")}
            <select value={robots} onChange={e => setRobots(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
              <option value="index, follow">index, follow</option>
              <option value="noindex, follow">noindex, follow</option>
              <option value="index, nofollow">index, nofollow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </select>
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.canonical")}
            <input value={canonical} onChange={e => setCanonical(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="https://example.com/page" />
          </label>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("ui.openGraph")}</h3>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.ogTitle")}
            <input value={ogTitle} onChange={e => setOgTitle(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder={title || "OG Title"} />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.ogDescription")}
            <textarea value={ogDescription} onChange={e => setOgDescription(e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.ogImage")}
            <input value={ogImage} onChange={e => setOgImage(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="https://example.com/image.jpg" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.ogUrl")}
            <input value={ogUrl} onChange={e => setOgUrl(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="https://example.com" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.twitterCard")}
            <select value={twitterCard} onChange={e => setTwitterCard(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
              <option value="summary">summary</option>
              <option value="summary_large_image">summary_large_image</option>
              <option value="app">app</option>
              <option value="player">player</option>
            </select>
          </label>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t("ui.output")}</h3>
        <pre className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap">{output}</pre>
        <button onClick={() => navigator.clipboard.writeText(output)} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{t("ui.copy")}</button>
      </div>
    </div>
  );
}
