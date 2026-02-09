"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function toSlug(text: string, separator = "-"): string {
  return text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, separator)
    .replace(new RegExp(`[${separator}]+`, "g"), separator)
    .replace(new RegExp(`^${separator}|${separator}$`, "g"), "");
}

export default function SlugGenerator() {
  const t = useTranslations("tools.slug-generator");
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState("-");
  const slug = useMemo(() => toSlug(input, separator), [input, separator]);

  return (
    <div className="space-y-4">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t("ui.pasteText")} className="w-full h-24 p-3 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.separator")}:</label>
        {["-", "_", "."].map(s => (
          <button key={s} onClick={() => setSeparator(s)} className={`px-3 py-1 rounded text-sm font-mono ${separator === s ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-700"}`}>{s}</button>
        ))}
      </div>
      {slug && (
        <div className="flex items-center gap-3">
          <code className="flex-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg font-mono text-sm break-all">{slug}</code>
          <button onClick={() => navigator.clipboard.writeText(slug)} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">{t("ui.copy")}</button>
        </div>
      )}
      {slug && <p className="text-xs text-zinc-500">{slug.length} {t("ui.chars")}</p>}
    </div>
  );
}
