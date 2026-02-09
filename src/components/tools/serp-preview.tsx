"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function SerpPreview() {
  const t = useTranslations("tools.serp-preview");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const titleLen = title.length;
  const descLen = description.length;
  const titleLimit = 60;
  const descLimit = device === "desktop" ? 160 : 120;

  const displayUrl = (() => {
    try {
      if (!url) return "example.com";
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      return `${u.hostname}${u.pathname === "/" ? "" : u.pathname}`;
    } catch { return url; }
  })();

  const truncate = (str: string, max: number) => str.length > max ? str.slice(0, max) + "..." : str;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.title")}
          <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="My Amazing Page Title" />
          <span className={`text-xs ${titleLen > titleLimit ? "text-red-500" : "text-zinc-400"}`}>{titleLen}/{titleLimit}</span>
        </label>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.url")}
          <input value={url} onChange={e => setUrl(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="https://example.com/page" />
        </label>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.description")}
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="A compelling meta description..." />
          <span className={`text-xs ${descLen > descLimit ? "text-red-500" : "text-zinc-400"}`}>{descLen}/{descLimit}</span>
        </label>
        <div className="flex gap-2">
          <button onClick={() => setDevice("desktop")} className={`px-3 py-1.5 rounded-lg text-sm ${device === "desktop" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200"}`}>{t("ui.desktop")}</button>
          <button onClick={() => setDevice("mobile")} className={`px-3 py-1.5 rounded-lg text-sm ${device === "mobile" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200"}`}>{t("ui.mobile")}</button>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">{t("ui.preview")}</h3>
        <div className={`p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 ${device === "mobile" ? "max-w-sm" : "max-w-2xl"}`}>
          <div className="space-y-1">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <span className="inline-block w-4 h-4 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
              {displayUrl}
            </p>
            <h3 className="text-xl text-blue-700 dark:text-blue-400 hover:underline cursor-pointer leading-snug">
              {truncate(title || "Page Title", titleLimit)}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {truncate(description || "Your meta description will appear here. Write a compelling description to improve click-through rates.", descLimit)}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`p-3 rounded-lg text-center ${titleLen <= titleLimit ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
          <p className="text-xs text-zinc-500">{t("ui.titleLength")}</p>
          <p className={`text-lg font-bold ${titleLen <= titleLimit ? "text-green-600" : "text-red-600"}`}>{titleLen}</p>
        </div>
        <div className={`p-3 rounded-lg text-center ${descLen <= descLimit ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
          <p className="text-xs text-zinc-500">{t("ui.descLength")}</p>
          <p className={`text-lg font-bold ${descLen <= descLimit ? "text-green-600" : "text-red-600"}`}>{descLen}</p>
        </div>
        <div className={`p-3 rounded-lg text-center ${url ? "bg-green-50 dark:bg-green-900/20" : "bg-yellow-50 dark:bg-yellow-900/20"}`}>
          <p className="text-xs text-zinc-500">{t("ui.urlSet")}</p>
          <p className={`text-lg font-bold ${url ? "text-green-600" : "text-yellow-600"}`}>{url ? "✓" : "—"}</p>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
          <p className="text-xs text-zinc-500">{t("ui.pixelWidth")}</p>
          <p className="text-lg font-bold text-blue-600">~{Math.round(titleLen * 7.5)}px</p>
        </div>
      </div>
    </div>
  );
}
