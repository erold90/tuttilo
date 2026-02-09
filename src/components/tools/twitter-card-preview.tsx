"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function TwitterCardPreview() {
  const t = useTranslations("tools.twitter-card-preview");
  const [cardType, setCardType] = useState("summary_large_image");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [site, setSite] = useState("");
  const [url, setUrl] = useState("");

  const generateTags = () => {
    const lines: string[] = [];
    lines.push(`<meta name="twitter:card" content="${cardType}">`);
    if (title) lines.push(`<meta name="twitter:title" content="${title}">`);
    if (description) lines.push(`<meta name="twitter:description" content="${description}">`);
    if (image) lines.push(`<meta name="twitter:image" content="${image}">`);
    if (site) lines.push(`<meta name="twitter:site" content="${site}">`);
    return lines.join("\n");
  };

  const domain = (() => { try { return url ? new URL(url.startsWith("http") ? url : `https://${url}`).hostname : "example.com"; } catch { return "example.com"; } })();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.cardType")}
            <select value={cardType} onChange={e => setCardType(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
              <option value="summary">Summary</option>
              <option value="summary_large_image">Summary Large Image</option>
              <option value="app">App</option>
              <option value="player">Player</option>
            </select>
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.title")}
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={70} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
            <span className="text-xs text-zinc-400">{title.length}/70</span>
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.description")}
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} maxLength={200} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
            <span className="text-xs text-zinc-400">{description.length}/200</span>
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.image")}
            <input value={image} onChange={e => setImage(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="https://example.com/image.jpg" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.site")}
            <input value={site} onChange={e => setSite(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="@username" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.url")}
            <input value={url} onChange={e => setUrl(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="https://example.com" />
          </label>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">{t("ui.preview")}</h3>
          <div className="border border-zinc-300 dark:border-zinc-600 rounded-xl overflow-hidden max-w-sm">
            {cardType === "summary_large_image" && image && (
              <div className="h-48 bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                <img src={image} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
              </div>
            )}
            <div className="p-3 flex gap-3">
              {cardType === "summary" && image && (
                <div className="w-24 h-24 shrink-0 bg-zinc-200 dark:bg-zinc-700 rounded overflow-hidden">
                  <img src={image} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-zinc-500">{domain}</p>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-2">{title || "Card Title"}</p>
                <p className="text-xs text-zinc-500 line-clamp-2">{description || "Card description..."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t("ui.output")}</h3>
        <pre className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap">{generateTags()}</pre>
        <button onClick={() => navigator.clipboard.writeText(generateTags())} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{t("ui.copy")}</button>
      </div>
    </div>
  );
}
