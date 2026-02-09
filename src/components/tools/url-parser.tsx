"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

interface ParsedUrl {
  protocol: string; hostname: string; port: string; pathname: string;
  search: string; hash: string; username: string; password: string;
  params: [string, string][];
}

function parseUrl(input: string): ParsedUrl | null {
  try {
    const url = new URL(input);
    return {
      protocol: url.protocol, hostname: url.hostname, port: url.port,
      pathname: url.pathname, search: url.search, hash: url.hash,
      username: url.username, password: url.password,
      params: Array.from(url.searchParams.entries()),
    };
  } catch { return null; }
}

export default function UrlParser() {
  const t = useTranslations("tools.url-parser");
  const [input, setInput] = useState("");
  const parsed = useMemo(() => input.trim() ? parseUrl(input.trim()) : null, [input]);

  const fields = parsed ? [
    ["protocol", parsed.protocol],
    ["hostname", parsed.hostname],
    ["port", parsed.port || "(default)"],
    ["pathname", parsed.pathname],
    ["search", parsed.search || "(none)"],
    ["hash", parsed.hash || "(none)"],
    ["username", parsed.username || "(none)"],
    ["password", parsed.password ? "***" : "(none)"],
  ] : [];

  return (
    <div className="space-y-4">
      <input value={input} onChange={e => setInput(e.target.value)} placeholder={t("ui.pasteUrl")} className="w-full px-3 py-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800" />
      {input.trim() && !parsed && <p className="text-red-500 text-sm">{t("ui.invalid")}</p>}
      {parsed && (
        <>
          <div className="border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden">
            {fields.map(([label, value]) => (
              <div key={label} className="flex border-b border-zinc-200 dark:border-zinc-700 last:border-0">
                <span className="w-28 shrink-0 px-3 py-2 text-sm font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">{label}</span>
                <span className="px-3 py-2 text-sm font-mono text-zinc-600 dark:text-zinc-400 break-all">{value}</span>
              </div>
            ))}
          </div>
          {parsed.params.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">{t("ui.queryParams")} ({parsed.params.length})</h3>
              <div className="border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden">
                {parsed.params.map(([k, v], i) => (
                  <div key={i} className="flex border-b border-zinc-200 dark:border-zinc-700 last:border-0">
                    <span className="w-40 shrink-0 px-3 py-2 text-sm font-mono font-medium bg-zinc-50 dark:bg-zinc-800">{k}</span>
                    <span className="px-3 py-2 text-sm font-mono text-zinc-600 dark:text-zinc-400 break-all">{decodeURIComponent(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
