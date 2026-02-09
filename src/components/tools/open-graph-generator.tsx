"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function OpenGraphGenerator() {
  const t = useTranslations("tools.open-graph-generator");
  const [ogType, setOgType] = useState("website");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [siteName, setSiteName] = useState("");
  const [locale, setLocale] = useState("en_US");
  const [fbAppId, setFbAppId] = useState("");
  const [twitterSite, setTwitterSite] = useState("");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");

  const generateTags = () => {
    const lines: string[] = [];
    lines.push(`<meta property="og:type" content="${ogType}">`);
    if (title) lines.push(`<meta property="og:title" content="${title}">`);
    if (description) lines.push(`<meta property="og:description" content="${description}">`);
    if (url) lines.push(`<meta property="og:url" content="${url}">`);
    if (image) lines.push(`<meta property="og:image" content="${image}">`);
    if (siteName) lines.push(`<meta property="og:site_name" content="${siteName}">`);
    lines.push(`<meta property="og:locale" content="${locale}">`);
    if (fbAppId) lines.push(`<meta property="fb:app_id" content="${fbAppId}">`);
    // Twitter
    lines.push(`<meta name="twitter:card" content="${twitterCard}">`);
    if (title) lines.push(`<meta name="twitter:title" content="${title}">`);
    if (description) lines.push(`<meta name="twitter:description" content="${description}">`);
    if (image) lines.push(`<meta name="twitter:image" content="${image}">`);
    if (twitterSite) lines.push(`<meta name="twitter:site" content="${twitterSite}">`);
    return lines.join("\n");
  };

  const output = generateTags();

  // Simple OG preview card
  const previewTitle = title || "Page Title";
  const previewDesc = description || "Page description will appear here...";
  const previewDomain = url ? new URL(url.startsWith("http") ? url : `https://${url}`).hostname : "example.com";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.ogType")}
            <select value={ogType} onChange={e => setOgType(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
              <option value="website">website</option>
              <option value="article">article</option>
              <option value="product">product</option>
              <option value="profile">profile</option>
              <option value="video.other">video</option>
              <option value="music.song">music</option>
            </select>
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.title")}
            <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.description")}
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.url")}
            <input value={url} onChange={e => setUrl(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="https://example.com" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.image")}
            <input value={image} onChange={e => setImage(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="https://example.com/og.jpg" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.siteName")}
            <input value={siteName} onChange={e => setSiteName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.locale")}
            <input value={locale} onChange={e => setLocale(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.twitterSite")}
            <input value={twitterSite} onChange={e => setTwitterSite(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="@username" />
          </label>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("ui.preview")}</h3>
          <div className="border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden">
            {image && <div className="h-40 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs text-zinc-500 overflow-hidden"><img src={image} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} /></div>}
            <div className="p-3">
              <p className="text-xs text-zinc-500 uppercase">{previewDomain}</p>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-2">{previewTitle}</p>
              <p className="text-xs text-zinc-500 line-clamp-2">{previewDesc}</p>
            </div>
          </div>
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
