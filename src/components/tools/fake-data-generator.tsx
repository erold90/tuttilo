"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

const FIRST = ["James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda","David","Elizabeth","William","Barbara","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Christopher","Karen","Charles","Lisa","Daniel","Nancy","Matthew","Betty","Anthony","Margaret","Mark","Sandra","Donald","Ashley","Steven","Kimberly","Paul","Emily","Andrew","Donna","Joshua","Michelle"];
const LAST = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson"];
const DOMAINS = ["gmail.com","yahoo.com","outlook.com","protonmail.com","email.com","hotmail.com","icloud.com"];
const STREETS = ["Main St","Oak Ave","Elm St","Park Blvd","Cedar Ln","Maple Dr","Pine Rd","Washington Ave","Lake View Dr","Sunset Blvd","Broadway","Highland Ave"];
const CITIES = ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","Austin","Seattle","Denver","Portland","Miami"];
const COMPANIES = ["Acme Corp","Globex","Initech","Umbrella Inc","Cyberdyne","Stark Industries","Wayne Enterprises","Oscorp","LexCorp","Aperture Science","Hooli","Pied Piper"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generatePerson() {
  const first = pick(FIRST), last = pick(LAST);
  return {
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1, 99)}@${pick(DOMAINS)}`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${String(randInt(1000, 9999))}`,
    address: `${randInt(100, 9999)} ${pick(STREETS)}, ${pick(CITIES)}`,
    company: pick(COMPANIES),
  };
}

type PersonKey = "name" | "email" | "phone" | "address" | "company";

export default function FakeDataGenerator() {
  const t = useTranslations("tools.fake-data-generator");
  const [count, setCount] = useState(5);
  const [fields, setFields] = useState<Record<PersonKey, boolean>>({ name: true, email: true, phone: true, address: true, company: false });
  const [data, setData] = useState<ReturnType<typeof generatePerson>[]>([]);

  const generate = useCallback(() => { setData(Array.from({ length: count }, generatePerson)); }, [count]);

  const activeFields = (Object.keys(fields) as PersonKey[]).filter(f => fields[f]);

  const exportFile = useCallback((type: "csv" | "json") => {
    let content: string, mime: string, ext: string;
    if (type === "csv") {
      const header = activeFields.join(",");
      const rows = data.map(d => activeFields.map(f => `"${d[f]}"`).join(","));
      content = header + "\n" + rows.join("\n");
      mime = "text/csv"; ext = "csv";
    } else {
      const filtered = data.map(d => Object.fromEntries(activeFields.map(f => [f, d[f]])));
      content = JSON.stringify(filtered, null, 2);
      mime = "application/json"; ext = "json";
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `fake-data.${ext}`; a.click();
    URL.revokeObjectURL(url);
  }, [data, activeFields]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.count")}:
          <input type="number" min={1} max={100} value={count} onChange={e => setCount(Math.max(1, Math.min(100, +e.target.value)))} className="ml-2 w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {(Object.keys(fields) as PersonKey[]).map(key => (
          <label key={key} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input type="checkbox" checked={fields[key]} onChange={e => setFields(prev => ({ ...prev, [key]: e.target.checked }))} className="accent-blue-600" />
            {t(`ui.${key}`)}
          </label>
        ))}
      </div>
      <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.generate")}</button>
      {data.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-300 dark:border-zinc-600">
                  {activeFields.map(f => (
                    <th key={f} className="text-left py-2 px-3 font-medium text-zinc-700 dark:text-zinc-300">{t(`ui.${f}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i} className="border-b border-zinc-200 dark:border-zinc-700">
                    {activeFields.map(f => (
                      <td key={f} className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{d[f]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
