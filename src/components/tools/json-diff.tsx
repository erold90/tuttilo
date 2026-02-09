"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Diff { path: string; type: "added" | "removed" | "changed"; oldVal?: string; newVal?: string; }

function diffJson(a: unknown, b: unknown, path = "$"): Diff[] {
  const diffs: Diff[] = [];
  if (a === b) return diffs;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") {
    diffs.push({ path, type: "changed", oldVal: JSON.stringify(a), newVal: JSON.stringify(b) });
    return diffs;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      if (i >= a.length) diffs.push({ path: `${path}[${i}]`, type: "added", newVal: JSON.stringify(b[i]) });
      else if (i >= b.length) diffs.push({ path: `${path}[${i}]`, type: "removed", oldVal: JSON.stringify(a[i]) });
      else diffs.push(...diffJson(a[i], b[i], `${path}[${i}]`));
    }
    return diffs;
  }
  const aObj = a as Record<string, unknown>, bObj = b as Record<string, unknown>;
  const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);
  for (const key of allKeys) {
    const p = `${path}.${key}`;
    if (!(key in aObj)) diffs.push({ path: p, type: "added", newVal: JSON.stringify(bObj[key]) });
    else if (!(key in bObj)) diffs.push({ path: p, type: "removed", oldVal: JSON.stringify(aObj[key]) });
    else diffs.push(...diffJson(aObj[key], bObj[key], p));
  }
  return diffs;
}

export default function JsonDiff() {
  const t = useTranslations("tools.json-diff");
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [diffs, setDiffs] = useState<Diff[]>([]);
  const [error, setError] = useState("");

  const compare = () => {
    setError("");
    try {
      const a = JSON.parse(left);
      const b = JSON.parse(right);
      setDiffs(diffJson(a, b));
    } catch (e) { setError(e instanceof Error ? e.message : "Invalid JSON"); }
  };

  const colors = { added: "text-green-600 dark:text-green-400", removed: "text-red-600 dark:text-red-400", changed: "text-yellow-600 dark:text-yellow-400" };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">{t("ui.left")}</label>
          <textarea value={left} onChange={e => setLeft(e.target.value)} placeholder={t("ui.pasteJson")} className="w-full h-40 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">{t("ui.right")}</label>
          <textarea value={right} onChange={e => setRight(e.target.value)} placeholder={t("ui.pasteJson")} className="w-full h-40 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
        </div>
      </div>
      <button onClick={compare} disabled={!left.trim() || !right.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700">{t("ui.compare")}</button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {diffs.length === 0 && left && right && !error && <p className="text-green-600 dark:text-green-400 font-medium">{t("ui.identical")}</p>}
      {diffs.length > 0 && (
        <div className="border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden">
          <div className="bg-zinc-100 dark:bg-zinc-700 px-3 py-2 text-sm font-medium">{diffs.length} {t("ui.differences")}</div>
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-700">
            {diffs.map((d, i) => (
              <div key={i} className="px-3 py-2 text-sm font-mono">
                <span className={`font-medium ${colors[d.type]}`}>{d.type === "added" ? "+" : d.type === "removed" ? "-" : "~"}</span>{" "}
                <span className="text-zinc-500">{d.path}</span>
                {d.type === "changed" && <span className="ml-2">{d.oldVal} → {d.newVal}</span>}
                {d.type === "added" && <span className="ml-2 text-green-600 dark:text-green-400">{d.newVal}</span>}
                {d.type === "removed" && <span className="ml-2 text-red-600 dark:text-red-400">{d.oldVal}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
