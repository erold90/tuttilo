"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type Mode = "csv-to-json" | "json-to-csv";

export function CsvJson() {
  const t = useTranslations("tools.csv-json.ui");
  const [mode, setMode] = useState<Mode>("csv-to-json");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    setError("");
    if (!input.trim()) return;
    try {
      if (mode === "csv-to-json") {
        const lines = input.trim().split("\n");
        const headers = parseCsvLine(lines[0]);
        const result = lines.slice(1).filter((l) => l.trim()).map((line) => {
          const values = parseCsvLine(line);
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => { obj[h] = values[i] || ""; });
          return obj;
        });
        setOutput(JSON.stringify(result, null, 2));
      } else {
        const data = JSON.parse(input);
        if (!Array.isArray(data) || data.length === 0) throw new Error("Expected JSON array");
        const headers = Object.keys(data[0]);
        const csvLines = [headers.join(",")];
        for (const row of data) {
          csvLines.push(headers.map((h) => {
            const v = String(row[h] ?? "");
            return v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v;
          }).join(","));
        }
        setOutput(csvLines.join("\n"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
    }
  }, [input, mode]);

  const copy = () => navigator.clipboard.writeText(output);
  const swap = () => { setMode(mode === "csv-to-json" ? "json-to-csv" : "csv-to-json"); setInput(output); setOutput(""); setError(""); };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => { setMode("csv-to-json"); setOutput(""); }} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "csv-to-json" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>CSV → JSON</button>
        <button onClick={() => { setMode("json-to-csv"); setOutput(""); }} className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === "json-to-csv" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>JSON → CSV</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">{t("input")} ({mode === "csv-to-json" ? "CSV" : "JSON"})</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "csv-to-json" ? "name,age,city\nJohn,30,NYC" : '[{"name":"John","age":30}]'} className="w-full h-64 rounded-lg border border-border bg-background p-3 text-sm font-mono focus:border-primary focus:outline-none resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t("output")} ({mode === "csv-to-json" ? "JSON" : "CSV"})</label>
          <textarea value={output} readOnly className="w-full h-64 rounded-lg border border-border bg-muted/30 p-3 text-sm font-mono resize-none" />
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button onClick={convert} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("convert")}</button>
        {output && <button onClick={copy} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("copy")}</button>}
        {output && <button onClick={swap} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("swap")}</button>}
      </div>
    </div>
  );
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { result.push(current.trim()); current = ""; }
      else current += ch;
    }
  }
  result.push(current.trim());
  return result;
}
