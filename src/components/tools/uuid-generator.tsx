"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export function UuidGenerator() {
  const t = useTranslations("tools.uuid-generator.ui");
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([crypto.randomUUID()]);
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);

  const generate = useCallback(() => {
    setUuids(Array.from({ length: count }, () => {
      let id = crypto.randomUUID();
      if (uppercase) id = id.toUpperCase();
      if (noDashes) id = id.replace(/-/g, "");
      return id;
    }));
  }, [count, uppercase, noDashes]);

  const copyAll = useCallback(() => {
    navigator.clipboard.writeText(uuids.join("\n"));
  }, [uuids]);

  const copySingle = (id: string) => navigator.clipboard.writeText(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("count")}</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
            className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="rounded" />
          {t("uppercase")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={noDashes} onChange={(e) => setNoDashes(e.target.checked)} className="rounded" />
          {t("noDashes")}
        </label>
        <button onClick={generate} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("generate")}</button>
        <button onClick={copyAll} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">{t("copyAll")}</button>
      </div>

      <div className="max-h-96 overflow-auto rounded-lg border border-border bg-card">
        {uuids.map((id, i) => (
          <div key={i} className="flex items-center justify-between border-b border-border/50 px-4 py-2 last:border-0">
            <code className="text-sm">{id}</code>
            <button onClick={() => copySingle(id)} className="shrink-0 rounded px-2 py-1 text-xs text-primary hover:bg-primary/10">{t("copy")}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
