"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Rule {
  userAgent: string;
  allow: string;
  disallow: string;
}

export default function RobotsTxtGenerator() {
  const t = useTranslations("tools.robots-txt-generator");
  const [rules, setRules] = useState<Rule[]>([{ userAgent: "*", allow: "/", disallow: "" }]);
  const [sitemap, setSitemap] = useState("");
  const [crawlDelay, setCrawlDelay] = useState("");

  const addRule = () => setRules([...rules, { userAgent: "*", allow: "", disallow: "" }]);
  const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i));
  const updateRule = (i: number, field: keyof Rule, value: string) => {
    const copy = [...rules];
    copy[i] = { ...copy[i], [field]: value };
    setRules(copy);
  };

  const generateOutput = () => {
    const lines: string[] = [];
    for (const rule of rules) {
      lines.push(`User-agent: ${rule.userAgent}`);
      if (rule.allow) rule.allow.split("\n").forEach(a => lines.push(`Allow: ${a.trim()}`));
      if (rule.disallow) rule.disallow.split("\n").forEach(d => lines.push(`Disallow: ${d.trim()}`));
      if (crawlDelay) lines.push(`Crawl-delay: ${crawlDelay}`);
      lines.push("");
    }
    if (sitemap) lines.push(`Sitemap: ${sitemap}`);
    return lines.join("\n").trim();
  };

  const output = generateOutput();

  return (
    <div className="space-y-4">
      {rules.map((rule, i) => (
        <div key={i} className="p-4 border border-zinc-300 dark:border-zinc-600 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("ui.rule")} {i + 1}</span>
            {rules.length > 1 && <button onClick={() => removeRule(i)} className="text-xs text-red-500 hover:underline">{t("ui.remove")}</button>}
          </div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.userAgent")}
            <input value={rule.userAgent} onChange={e => updateRule(i, "userAgent", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.allow")}
            <textarea value={rule.allow} onChange={e => updateRule(i, "allow", e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" placeholder="/" />
          </label>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.disallow")}
            <textarea value={rule.disallow} onChange={e => updateRule(i, "disallow", e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" placeholder="/admin&#10;/private" />
          </label>
        </div>
      ))}
      <div className="flex gap-4 flex-wrap">
        <button onClick={addRule} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-lg text-sm hover:bg-zinc-300 dark:hover:bg-zinc-500">{t("ui.addRule")}</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.sitemap")}
          <input value={sitemap} onChange={e => setSitemap(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="https://example.com/sitemap.xml" />
        </label>
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">{t("ui.crawlDelay")}
          <input type="number" value={crawlDelay} onChange={e => setCrawlDelay(e.target.value)} min={0} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" placeholder="10" />
        </label>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t("ui.output")}</h3>
        <pre className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap">{output}</pre>
        <div className="flex gap-2 mt-2">
          <button onClick={() => navigator.clipboard.writeText(output)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{t("ui.copy")}</button>
          <button onClick={() => { const blob = new Blob([output], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "robots.txt"; a.click(); URL.revokeObjectURL(a.href); }} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-lg text-sm hover:bg-zinc-300 dark:hover:bg-zinc-500">{t("ui.download")}</button>
        </div>
      </div>
    </div>
  );
}
