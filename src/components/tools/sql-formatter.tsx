"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

const KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "INSERT", "INTO", "VALUES",
  "UPDATE", "SET", "DELETE", "CREATE", "TABLE", "ALTER", "DROP", "INDEX",
  "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "FULL", "CROSS", "ON",
  "GROUP", "BY", "ORDER", "HAVING", "LIMIT", "OFFSET", "UNION", "ALL",
  "DISTINCT", "AS", "IN", "NOT", "NULL", "IS", "BETWEEN", "LIKE",
  "EXISTS", "CASE", "WHEN", "THEN", "ELSE", "END", "COUNT", "SUM",
  "AVG", "MIN", "MAX", "ASC", "DESC", "WITH", "RECURSIVE",
];

function formatSql(sql: string): string {
  let result = sql.trim();

  // Uppercase keywords
  for (const kw of KEYWORDS) {
    result = result.replace(new RegExp(`\\b${kw}\\b`, "gi"), kw);
  }

  // Add newlines before major clauses
  const clauses = ["SELECT", "FROM", "WHERE", "AND", "OR", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN", "FULL JOIN", "CROSS JOIN", "ON", "UNION", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "WITH"];

  for (const clause of clauses) {
    const pattern = new RegExp(`\\s+${clause.replace(/ /g, "\\s+")}\\b`, "gi");
    result = result.replace(pattern, `\n${clause}`);
  }

  // Indent sub-clauses
  const lines = result.split("\n");
  const formatted: string[] = [];
  let indent = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith(")")) indent = Math.max(0, indent - 1);

    const prefix = "  ".repeat(indent);
    const indentedKeywords = ["AND", "OR", "ON", "SET"];
    const isSubClause = indentedKeywords.some((k) => trimmed.startsWith(k + " ") || trimmed === k);

    formatted.push(isSubClause ? prefix + "  " + trimmed : prefix + trimmed);

    if (trimmed.endsWith("(")) indent++;
  }

  return formatted.join("\n");
}

function minifySql(sql: string): string {
  return sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function SqlFormatter() {
  const t = useTranslations("tools.sql-formatter.ui");
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"format" | "minify">("format");

  const output = useMemo(() => {
    if (!input) return "";
    return mode === "format" ? formatSql(input) : minifySql(input);
  }, [input, mode]);

  const copy = useCallback(() => navigator.clipboard.writeText(output), [output]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["format", "minify"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === m ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(m)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("input")}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            className="h-64 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("output")}</label>
          <textarea value={output} readOnly className="h-64 w-full rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs" />
        </div>
      </div>

      <button onClick={copy} disabled={!output} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{t("copy")}</button>
    </div>
  );
}
