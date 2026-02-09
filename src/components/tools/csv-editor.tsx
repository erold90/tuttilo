"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

function parseCsv(text: string, delimiter = ","): string[][] {
  const rows: string[][] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.trim() === "") continue;
    const cells: string[] = [];
    let current = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuote) {
        if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') inQuote = false;
        else current += ch;
      } else {
        if (ch === '"') inQuote = true;
        else if (ch === delimiter) { cells.push(current); current = ""; }
        else current += ch;
      }
    }
    cells.push(current);
    rows.push(cells);
  }
  return rows;
}

function toCsv(data: string[][], delimiter = ","): string {
  return data.map(row => row.map(cell => {
    if (cell.includes(delimiter) || cell.includes('"') || cell.includes("\n")) return `"${cell.replace(/"/g, '""')}"`;
    return cell;
  }).join(delimiter)).join("\n");
}

export default function CsvEditor() {
  const t = useTranslations("tools.csv-editor");
  const [raw, setRaw] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [editMode, setEditMode] = useState(false);
  const [data, setData] = useState<string[][]>([]);

  const parsed = useMemo(() => parseCsv(raw, delimiter), [raw, delimiter]);
  const maxCols = useMemo(() => Math.max(...(editMode ? data : parsed).map(r => r.length), 0), [parsed, data, editMode]);

  const startEdit = useCallback(() => { setData(parsed.map(r => [...r])); setEditMode(true); }, [parsed]);
  const updateCell = (r: number, c: number, val: string) => {
    setData(prev => { const copy = prev.map(row => [...row]); copy[r][c] = val; return copy; });
  };
  const addRow = () => setData(prev => [...prev, new Array(maxCols).fill("")]);
  const addCol = () => setData(prev => prev.map(row => [...row, ""]));
  const deleteRow = (r: number) => setData(prev => prev.filter((_, i) => i !== r));
  const applyEdit = () => { setRaw(toCsv(data, delimiter)); setEditMode(false); };

  const rows = editMode ? data : parsed;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.delimiter")}:</label>
        <select value={delimiter} onChange={e => setDelimiter(e.target.value)} className="px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
          <option value=",">,</option>
          <option value=";">;</option>
          <option value={"\t"}>Tab</option>
          <option value="|">|</option>
        </select>
        {!editMode ? (
          <button onClick={startEdit} disabled={parsed.length === 0} className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white font-medium disabled:opacity-50 hover:bg-blue-700">{t("ui.editTable")}</button>
        ) : (
          <>
            <button onClick={addRow} className="px-3 py-1.5 rounded-lg text-sm bg-green-600 text-white font-medium hover:bg-green-700">{t("ui.addRow")}</button>
            <button onClick={addCol} className="px-3 py-1.5 rounded-lg text-sm bg-green-600 text-white font-medium hover:bg-green-700">{t("ui.addCol")}</button>
            <button onClick={applyEdit} className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white font-medium hover:bg-blue-700">{t("ui.apply")}</button>
          </>
        )}
      </div>
      {!editMode && (
        <textarea value={raw} onChange={e => setRaw(e.target.value)} placeholder={t("ui.pasteCsv")} className="w-full h-40 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      )}
      {rows.length > 0 && (
        <div className="overflow-x-auto border border-zinc-300 dark:border-zinc-600 rounded-lg">
          <table className="min-w-full text-sm">
            <tbody>
              {rows.map((row, r) => (
                <tr key={r} className={r === 0 ? "bg-zinc-100 dark:bg-zinc-700 font-medium" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}>
                  {Array.from({ length: maxCols }, (_, c) => (
                    <td key={c} className="border-b border-r border-zinc-200 dark:border-zinc-600 px-2 py-1">
                      {editMode ? (
                        <input value={row[c] || ""} onChange={e => updateCell(r, c, e.target.value)} className="w-full bg-transparent outline-none text-sm min-w-[60px]" />
                      ) : (row[c] || "")}
                    </td>
                  ))}
                  {editMode && (
                    <td className="border-b border-zinc-200 dark:border-zinc-600 px-1">
                      <button onClick={() => deleteRow(r)} className="text-red-500 text-xs hover:text-red-700">✕</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!editMode && raw && (
        <button onClick={() => navigator.clipboard.writeText(raw)} className="px-3 py-1.5 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.copy")}</button>
      )}
    </div>
  );
}
