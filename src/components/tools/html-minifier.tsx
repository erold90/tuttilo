"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function minifyHtml(html: string): string {
  let result = html;
  result = result.replace(/<!--[\s\S]*?-->/g, "");
  result = result.replace(/>\s+</g, "><");
  result = result.replace(/\s{2,}/g, " ");
  result = result.replace(/^\s+/gm, "");
  result = result.replace(/\s+$/gm, "");
  result = result.replace(/\n+/g, "");
  return result.trim();
}

export default function HtmlMinifier() {
  const t = useTranslations("tools.html-minifier");
  const [input, setInput] = useState("");
  const output = useMemo(() => input.trim() ? minifyHtml(input) : "", [input]);
  const saved = input.length > 0 ? Math.round((1 - output.length / input.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t("ui.pasteHtml")} className="w-full h-48 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      {output && (
        <>
          <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            <span>{t("ui.original")}: {input.length} chars</span>
            <span>{t("ui.minified")}: {output.length} chars</span>
            <span className="text-green-600 dark:text-green-400 font-medium">{t("ui.saved")}: {saved}%</span>
          </div>
          <div className="relative">
            <textarea readOnly value={output} className="w-full h-32 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 resize-y" />
            <button onClick={() => navigator.clipboard.writeText(output)} className="absolute top-2 right-2 px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.copy")}</button>
          </div>
        </>
      )}
    </div>
  );
}
