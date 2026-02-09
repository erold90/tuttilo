"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface HeaderInfo { name: string; value: string; category: string; description: string; }

const HEADER_INFO: Record<string, { category: string; description: string }> = {
  "content-type": { category: "content", description: "Media type of the resource" },
  "content-length": { category: "content", description: "Size of the response body in bytes" },
  "content-encoding": { category: "content", description: "Compression algorithm used" },
  "cache-control": { category: "caching", description: "Caching directives for both client and proxies" },
  "expires": { category: "caching", description: "Date after which the response is considered stale" },
  "etag": { category: "caching", description: "Unique identifier for a specific version of a resource" },
  "last-modified": { category: "caching", description: "Date the resource was last modified" },
  "x-content-type-options": { category: "security", description: "Prevents MIME type sniffing (should be nosniff)" },
  "x-frame-options": { category: "security", description: "Controls whether page can be embedded in frames" },
  "x-xss-protection": { category: "security", description: "XSS filter configuration" },
  "strict-transport-security": { category: "security", description: "Forces HTTPS connections" },
  "content-security-policy": { category: "security", description: "Controls resources the browser is allowed to load" },
  "referrer-policy": { category: "security", description: "Controls referrer information sent with requests" },
  "permissions-policy": { category: "security", description: "Controls browser features and APIs available" },
  "access-control-allow-origin": { category: "cors", description: "Specifies which origins can access the resource" },
  "access-control-allow-methods": { category: "cors", description: "Allowed HTTP methods for CORS" },
  "access-control-allow-headers": { category: "cors", description: "Allowed headers for CORS requests" },
  "server": { category: "info", description: "Server software information" },
  "x-powered-by": { category: "info", description: "Technology powering the application" },
  "set-cookie": { category: "cookies", description: "Sets an HTTP cookie" },
  "location": { category: "redirect", description: "URL to redirect to" },
};

const CATEGORY_COLORS: Record<string, string> = {
  security: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  caching: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  content: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  cors: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  cookies: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  info: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  redirect: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  other: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default function HttpHeaderAnalyzer() {
  const t = useTranslations("tools.http-header-analyzer");
  const [input, setInput] = useState(`content-type: text/html; charset=utf-8
cache-control: max-age=3600, public
strict-transport-security: max-age=31536000; includeSubDomains
x-content-type-options: nosniff
x-frame-options: DENY
content-security-policy: default-src 'self'
server: nginx/1.24.0`);
  const [headers, setHeaders] = useState<HeaderInfo[]>([]);

  const analyze = useCallback(() => {
    const lines = input.split("\n").filter(l => l.trim());
    const parsed: HeaderInfo[] = lines.map(line => {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) return null;
      const name = line.slice(0, colonIdx).trim().toLowerCase();
      const value = line.slice(colonIdx + 1).trim();
      const info = HEADER_INFO[name] || { category: "other", description: "Custom or uncommon header" };
      return { name, value, ...info };
    }).filter((h): h is HeaderInfo => h !== null);
    setHeaders(parsed);
  }, [input]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t("ui.pasteHeaders")}
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={8} placeholder="content-type: text/html" className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" />
      </label>
      <button onClick={analyze} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.analyze")}</button>
      {headers.length > 0 && (
        <div className="space-y-2">
          {headers.map((h, i) => (
            <div key={i} className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100">{h.name}</code>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[h.category] || CATEGORY_COLORS.other}`}>{h.category}</span>
              </div>
              <code className="text-sm font-mono text-blue-600 dark:text-blue-400 break-all">{h.value}</code>
              <p className="text-xs text-zinc-500 mt-1">{h.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
