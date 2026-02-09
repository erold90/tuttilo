"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const CODES: [number, string, string][] = [
  [100, "Continue", "informational"], [101, "Switching Protocols", "informational"],
  [200, "OK", "success"], [201, "Created", "success"], [202, "Accepted", "success"],
  [204, "No Content", "success"], [206, "Partial Content", "success"],
  [301, "Moved Permanently", "redirect"], [302, "Found", "redirect"], [303, "See Other", "redirect"],
  [304, "Not Modified", "redirect"], [307, "Temporary Redirect", "redirect"], [308, "Permanent Redirect", "redirect"],
  [400, "Bad Request", "client"], [401, "Unauthorized", "client"], [403, "Forbidden", "client"],
  [404, "Not Found", "client"], [405, "Method Not Allowed", "client"], [408, "Request Timeout", "client"],
  [409, "Conflict", "client"], [410, "Gone", "client"], [413, "Payload Too Large", "client"],
  [415, "Unsupported Media Type", "client"], [418, "I'm a Teapot", "client"],
  [422, "Unprocessable Entity", "client"], [429, "Too Many Requests", "client"],
  [500, "Internal Server Error", "server"], [501, "Not Implemented", "server"],
  [502, "Bad Gateway", "server"], [503, "Service Unavailable", "server"],
  [504, "Gateway Timeout", "server"],
];

const CATEGORY_COLORS: Record<string, string> = {
  informational: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  redirect: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  client: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  server: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
};

export default function HttpStatusCodes() {
  const t = useTranslations("tools.http-status-codes");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => CODES.filter(([code, name, cat]) => {
    if (filter !== "all" && cat !== filter) return false;
    if (search) { const s = search.toLowerCase(); return String(code).includes(s) || name.toLowerCase().includes(s); }
    return true;
  }), [search, filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("ui.search")} className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
          <option value="all">{t("ui.all")}</option>
          <option value="informational">1xx</option>
          <option value="success">2xx</option>
          <option value="redirect">3xx</option>
          <option value="client">4xx</option>
          <option value="server">5xx</option>
        </select>
      </div>
      <div className="space-y-1">
        {filtered.map(([code, name, cat]) => (
          <div key={code} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${CATEGORY_COLORS[cat]}`}>
            <span className="font-mono font-bold w-12">{code}</span>
            <span className="font-medium">{name}</span>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-zinc-500 py-4 text-center">{t("ui.noResults")}</p>}
      </div>
    </div>
  );
}
