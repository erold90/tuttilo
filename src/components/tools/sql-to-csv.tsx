"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

interface ParsedInsert { table: string; columns: string[]; rows: string[][]; }

function parseSqlInserts(sql: string): ParsedInsert[] {
  const results: ParsedInsert[] = [];
  const regex = /INSERT\s+INTO\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)\s*VALUES\s*([\s\S]*?)(?=INSERT|$)/gi;
  let match;
  while ((match = regex.exec(sql)) !== null) {
    const table = match[1];
    const columns = match[2].split(",").map(c => c.trim().replace(/[`"']/g, ""));
    const valuesStr = match[3];
    const rowRegex = /\(([^)]+)\)/g;
    const rows: string[][] = [];
    let rowMatch;
    while ((rowMatch = rowRegex.exec(valuesStr)) !== null) {
      const cells = rowMatch[1].split(",").map(v => {
        const t = v.trim();
        if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) return t.slice(1, -1);
        if (t.toUpperCase() === "NULL") return "";
        return t;
      });
      rows.push(cells);
    }
    results.push({ table, columns, rows });
  }
  return results;
}

function toCsv(columns: string[], rows: string[][]): string {
  const escape = (s: string) => s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  return [columns.map(escape).join(","), ...rows.map(r => r.map(escape).join(","))].join("\n");
}

export default function SqlToCsv() {
  const t = useTranslations("tools.sql-to-csv");
  const [sql, setSql] = useState("");
  const parsed = useMemo(() => parseSqlInserts(sql), [sql]);

  return (
    <div className="space-y-4">
      <textarea value={sql} onChange={e => setSql(e.target.value)} placeholder={t("ui.pasteSql")} className="w-full h-48 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      {parsed.length === 0 && sql.trim() && <p className="text-sm text-zinc-500">{t("ui.noInserts")}</p>}
      {parsed.map((p, i) => {
        const csv = toCsv(p.columns, p.rows);
        return (
          <div key={i} className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.table")}: {p.table} ({p.rows.length} {t("ui.rows")})</h3>
            <div className="relative">
              <textarea readOnly value={csv} className="w-full h-32 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 resize-y" />
              <button onClick={() => navigator.clipboard.writeText(csv)} className="absolute top-2 right-2 px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.copy")}</button>
            </div>
            <button onClick={() => { const blob = new Blob([csv], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${p.table}.csv`; a.click(); URL.revokeObjectURL(a.href); }} className="px-3 py-1.5 rounded-lg text-sm bg-green-600 text-white font-medium hover:bg-green-700">{t("ui.download")}</button>
          </div>
        );
      })}
    </div>
  );
}
