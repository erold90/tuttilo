"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type DataType = "users" | "products" | "orders" | "posts";

const NAMES = ["Alice","Bob","Charlie","Diana","Eve","Frank","Grace","Henry","Ivy","Jack","Kate","Leo","Mia","Noah","Olivia","Paul"];
const EMAILS_D = ["gmail.com","yahoo.com","outlook.com","email.com"];
const PRODUCTS = ["Laptop","Phone","Tablet","Headphones","Monitor","Keyboard","Mouse","Speaker","Camera","Watch","Printer","Router"];
const CATEGORIES = ["Electronics","Clothing","Books","Home","Sports","Toys","Food","Beauty"];
const TITLES = ["Getting Started with","Advanced Guide to","Understanding","Deep Dive into","Introduction to","Mastering","Best Practices for","Tips for"];
const TOPICS = ["JavaScript","React","TypeScript","Node.js","Python","CSS","HTML","APIs","Databases","Cloud","Security","Testing"];
const STATUSES = ["pending","processing","shipped","delivered","cancelled"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function ri(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function rid() { return `${ri(100000, 999999)}`; }

function genRow(type: DataType): Record<string, string | number> {
  switch (type) {
    case "users": {
      const n = pick(NAMES);
      return { id: rid(), name: n, email: `${n.toLowerCase()}${ri(1,99)}@${pick(EMAILS_D)}`, age: ri(18, 65), city: pick(["New York","London","Tokyo","Paris","Berlin","Sydney","Toronto","Mumbai"]) };
    }
    case "products":
      return { id: rid(), name: pick(PRODUCTS), category: pick(CATEGORIES), price: +(ri(999, 99999) / 100).toFixed(2), stock: ri(0, 500), rating: +(ri(10, 50) / 10).toFixed(1) };
    case "orders":
      return { id: rid(), customer: pick(NAMES), product: pick(PRODUCTS), quantity: ri(1, 10), total: +(ri(999, 49999) / 100).toFixed(2), status: pick(STATUSES) };
    case "posts":
      return { id: rid(), title: `${pick(TITLES)} ${pick(TOPICS)}`, author: pick(NAMES), likes: ri(0, 1000), comments: ri(0, 200), published: `2024-${String(ri(1,12)).padStart(2,"0")}-${String(ri(1,28)).padStart(2,"0")}` };
  }
}

export default function DataGenerator() {
  const t = useTranslations("tools.data-generator");
  const [dataType, setDataType] = useState<DataType>("users");
  const [count, setCount] = useState(10);
  const [data, setData] = useState<Record<string, string | number>[]>([]);

  const generate = useCallback(() => {
    setData(Array.from({ length: count }, () => genRow(dataType)));
  }, [dataType, count]);

  const exportFile = useCallback((fmt: "csv" | "json") => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    let content: string, mime: string, ext: string;
    if (fmt === "csv") {
      content = keys.join(",") + "\n" + data.map(r => keys.map(k => `"${r[k]}"`).join(",")).join("\n");
      mime = "text/csv"; ext = "csv";
    } else {
      content = JSON.stringify(data, null, 2);
      mime = "application/json"; ext = "json";
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${dataType}-data.${ext}`; a.click();
    URL.revokeObjectURL(url);
  }, [data, dataType]);

  const keys = data.length ? Object.keys(data[0]) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <select value={dataType} onChange={e => setDataType(e.target.value as DataType)} className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
          <option value="users">{t("ui.users")}</option>
          <option value="products">{t("ui.products")}</option>
          <option value="orders">{t("ui.orders")}</option>
          <option value="posts">{t("ui.posts")}</option>
        </select>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.rows")}:
          <input type="number" min={1} max={200} value={count} onChange={e => setCount(Math.max(1, Math.min(200, +e.target.value)))} className="ml-2 w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.generate")}</button>
      </div>
      {data.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-300 dark:border-zinc-600">{keys.map(k => <th key={k} className="text-left py-2 px-3 font-medium text-zinc-700 dark:text-zinc-300">{k}</th>)}</tr></thead>
              <tbody>{data.slice(0, 50).map((r, i) => <tr key={i} className="border-b border-zinc-200 dark:border-zinc-700">{keys.map(k => <td key={k} className="py-1.5 px-3 text-zinc-600 dark:text-zinc-400 font-mono text-xs">{String(r[k])}</td>)}</tr>)}</tbody>
            </table>
            {data.length > 50 && <p className="text-xs text-zinc-500 mt-2">{t("ui.showing", { shown: 50, total: data.length })}</p>}
          </div>
          <div className="flex gap-3">
            <button onClick={() => exportFile("csv")} className="px-3 py-1.5 text-sm bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.exportCsv")}</button>
            <button onClick={() => exportFile("json")} className="px-3 py-1.5 text-sm bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.exportJson")}</button>
          </div>
        </>
      )}
    </div>
  );
}
