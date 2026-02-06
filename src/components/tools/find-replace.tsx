"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

export function FindReplace() {
  const t = useTranslations("tools.find-replace.ui");
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  const matchCount = useMemo(() => {
    if (!find || !text) return 0;
    try {
      const flags = caseSensitive ? "g" : "gi";
      const regex = useRegex ? new RegExp(find, flags) : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
      return (text.match(regex) || []).length;
    } catch { return 0; }
  }, [text, find, caseSensitive, useRegex]);

  const doReplace = useCallback(() => {
    if (!find) return;
    try {
      const flags = caseSensitive ? "g" : "gi";
      const regex = useRegex ? new RegExp(find, flags) : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
      setText(text.replace(regex, replace));
    } catch { /* invalid regex */ }
  }, [text, find, replace, caseSensitive, useRegex]);

  const copy = () => navigator.clipboard.writeText(text);

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("textPlaceholder")}
        className="w-full h-48 rounded-lg border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none resize-none"
      />
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium mb-1">{t("find")}</label>
          <input value={find} onChange={(e) => setFind(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t("replaceWith")}</label>
          <input value={replace} onChange={(e) => setReplace(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="rounded" />
          {t("caseSensitive")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} className="rounded" />
          {t("regex")}
        </label>
        {find && <span className="text-xs text-muted-foreground">{matchCount} {t("matches")}</span>}
      </div>
      <div className="flex gap-2">
        <button onClick={doReplace} disabled={!find || matchCount === 0} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{t("replaceAll")}</button>
        <button onClick={copy} disabled={!text} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted disabled:opacity-50">{t("copy")}</button>
      </div>
    </div>
  );
}
