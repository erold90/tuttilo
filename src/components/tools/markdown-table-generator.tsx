"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Align = "left" | "center" | "right";

export default function MarkdownTableGenerator() {
  const t = useTranslations("tools.markdown-table-generator");
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [data, setData] = useState<string[][]>(() => Array.from({ length: 4 }, () => Array(3).fill("")));
  const [aligns, setAligns] = useState<Align[]>(() => Array(3).fill("left"));

  const ensureSize = (r: number, c: number) => {
    setData(prev => {
      const newData = Array.from({ length: r + 1 }, (_, ri) =>
        Array.from({ length: c }, (_, ci) => prev[ri]?.[ci] || "")
      );
      return newData;
    });
    setAligns(prev => {
      const newAligns = Array.from({ length: c }, (_, i) => prev[i] || "left") as Align[];
      return newAligns;
    });
  };

  const updateDimensions = (r: number, c: number) => {
    setRows(r);
    setCols(c);
    ensureSize(r, c);
  };

  const updateCell = (r: number, c: number, val: string) => {
    setData(prev => {
      const copy = prev.map(row => [...row]);
      copy[r][c] = val;
      return copy;
    });
  };

  const toggleAlign = (c: number) => {
    setAligns(prev => {
      const copy = [...prev];
      const cycle: Align[] = ["left", "center", "right"];
      copy[c] = cycle[(cycle.indexOf(copy[c]) + 1) % 3];
      return copy;
    });
  };

  const markdown = (() => {
    const pad = (s: string, w: number, align: Align) => {
      const diff = Math.max(0, w - s.length);
      if (align === "center") { const l = Math.floor(diff / 2); return " ".repeat(l) + s + " ".repeat(diff - l); }
      if (align === "right") return " ".repeat(diff) + s;
      return s + " ".repeat(diff);
    };
    const allRows = data.slice(0, rows + 1).map(r => r.slice(0, cols));
    const widths = Array.from({ length: cols }, (_, c) => Math.max(3, ...allRows.map(r => (r[c] || "").length)));

    const header = "| " + allRows[0].map((cell, c) => pad(cell || `Col ${c + 1}`, widths[c], aligns[c])).join(" | ") + " |";
    const separator = "| " + widths.map((w, c) => {
      const a = aligns[c];
      if (a === "center") return ":" + "-".repeat(w - 2) + ":";
      if (a === "right") return "-".repeat(w - 1) + ":";
      return "-".repeat(w);
    }).join(" | ") + " |";
    const body = allRows.slice(1).map(row => "| " + row.map((cell, c) => pad(cell, widths[c], aligns[c])).join(" | ") + " |");

    return [header, separator, ...body].join("\n");
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.rows")}:
          <input type="number" min={1} max={50} value={rows} onChange={e => updateDimensions(Math.max(1, +e.target.value), cols)} className="ml-2 w-16 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.columns")}:
          <input type="number" min={1} max={20} value={cols} onChange={e => updateDimensions(rows, Math.max(1, +e.target.value))} className="ml-2 w-16 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
      </div>
      <div className="overflow-x-auto border border-zinc-300 dark:border-zinc-600 rounded-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-700">
              {Array.from({ length: cols }, (_, c) => (
                <th key={c} className="border-b border-r border-zinc-200 dark:border-zinc-600 px-1 py-1">
                  <input value={data[0]?.[c] || ""} onChange={e => updateCell(0, c, e.target.value)} placeholder={`Col ${c + 1}`} className="w-full bg-transparent outline-none text-sm font-bold min-w-[60px] px-1" />
                  <button onClick={() => toggleAlign(c)} className="text-xs text-blue-500 mt-0.5">{aligns[c] === "left" ? "←" : aligns[c] === "center" ? "↔" : "→"}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                {Array.from({ length: cols }, (_, c) => (
                  <td key={c} className="border-b border-r border-zinc-200 dark:border-zinc-600 px-1 py-1">
                    <input value={data[r + 1]?.[c] || ""} onChange={e => updateCell(r + 1, c, e.target.value)} className="w-full bg-transparent outline-none text-sm min-w-[60px] px-1" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="relative">
        <textarea readOnly value={markdown} className="w-full h-32 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 resize-y" />
        <button onClick={() => navigator.clipboard.writeText(markdown)} className="absolute top-2 right-2 px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.copy")}</button>
      </div>
    </div>
  );
}
