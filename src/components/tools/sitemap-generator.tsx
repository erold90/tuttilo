"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface SitemapEntry {
  url: string;
  changefreq: string;
  priority: string;
}

export default function SitemapGenerator() {
  const t = useTranslations("tools.sitemap-generator");
  const [entries, setEntries] = useState<SitemapEntry[]>([{ url: "https://example.com/", changefreq: "weekly", priority: "1.0" }]);

  const addEntry = () => setEntries([...entries, { url: "", changefreq: "weekly", priority: "0.5" }]);
  const removeEntry = (i: number) => setEntries(entries.filter((_, idx) => idx !== i));
  const updateEntry = (i: number, field: keyof SitemapEntry, value: string) => {
    const copy = [...entries];
    copy[i] = { ...copy[i], [field]: value };
    setEntries(copy);
  };

  const bulkAdd = (text: string) => {
    const urls = text.split("\n").map(u => u.trim()).filter(Boolean);
    const newEntries = urls.map(url => ({ url, changefreq: "weekly", priority: "0.5" }));
    setEntries([...entries, ...newEntries]);
  };

  const generateXml = () => {
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ];
    const today = new Date().toISOString().split("T")[0];
    for (const entry of entries) {
      if (!entry.url) continue;
      lines.push("  <url>");
      lines.push(`    <loc>${entry.url}</loc>`);
      lines.push(`    <lastmod>${today}</lastmod>`);
      lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      lines.push(`    <priority>${entry.priority}</priority>`);
      lines.push("  </url>");
    }
    lines.push("</urlset>");
    return lines.join("\n");
  };

  const output = generateXml();

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <div key={i} className="flex items-start gap-2 flex-wrap">
          <input value={entry.url} onChange={e => updateEntry(i, "url", e.target.value)} className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="https://example.com/page" />
          <select value={entry.changefreq} onChange={e => updateEntry(i, "changefreq", e.target.value)} className="px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
            <option value="always">always</option>
            <option value="hourly">hourly</option>
            <option value="daily">daily</option>
            <option value="weekly">weekly</option>
            <option value="monthly">monthly</option>
            <option value="yearly">yearly</option>
            <option value="never">never</option>
          </select>
          <select value={entry.priority} onChange={e => updateEntry(i, "priority", e.target.value)} className="px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
            {["1.0", "0.9", "0.8", "0.7", "0.6", "0.5", "0.4", "0.3", "0.2", "0.1", "0.0"].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {entries.length > 1 && <button onClick={() => removeEntry(i)} className="px-2 py-2 text-red-500 text-sm hover:underline">&times;</button>}
        </div>
      ))}
      <div className="flex gap-2 flex-wrap">
        <button onClick={addEntry} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-lg text-sm hover:bg-zinc-300 dark:hover:bg-zinc-500">{t("ui.addUrl")}</button>
        <button onClick={() => {
          const text = prompt(t("ui.bulkPrompt"));
          if (text) bulkAdd(text);
        }} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-lg text-sm hover:bg-zinc-300 dark:hover:bg-zinc-500">{t("ui.bulkAdd")}</button>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t("ui.output")} ({entries.filter(e => e.url).length} URLs)</h3>
        <pre className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap max-h-80 overflow-y-auto">{output}</pre>
        <div className="flex gap-2 mt-2">
          <button onClick={() => navigator.clipboard.writeText(output)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{t("ui.copy")}</button>
          <button onClick={() => { const blob = new Blob([output], { type: "application/xml" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "sitemap.xml"; a.click(); URL.revokeObjectURL(a.href); }} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-lg text-sm hover:bg-zinc-300 dark:hover:bg-zinc-500">{t("ui.download")}</button>
        </div>
      </div>
    </div>
  );
}
