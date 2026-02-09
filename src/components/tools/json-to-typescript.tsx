"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function jsonToTs(json: string, rootName = "Root"): string {
  const data = JSON.parse(json);
  const interfaces: string[] = [];
  const seen = new Map<string, string>();

  function getType(val: unknown, name: string): string {
    if (val === null) return "null";
    if (typeof val === "string") return "string";
    if (typeof val === "number") return Number.isInteger(val) ? "number" : "number";
    if (typeof val === "boolean") return "boolean";
    if (Array.isArray(val)) {
      if (val.length === 0) return "unknown[]";
      const types = [...new Set(val.map((v, i) => getType(v, `${name}Item`)))];
      return types.length === 1 ? `${types[0]}[]` : `(${types.join(" | ")})[]`;
    }
    if (typeof val === "object") {
      const iName = name.charAt(0).toUpperCase() + name.slice(1);
      const key = JSON.stringify(Object.keys(val).sort());
      if (seen.has(key)) return seen.get(key)!;
      seen.set(key, iName);
      generateInterface(val as Record<string, unknown>, iName);
      return iName;
    }
    return "unknown";
  }

  function generateInterface(obj: Record<string, unknown>, name: string) {
    const props = Object.entries(obj).map(([k, v]) => {
      const safeName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
      return `  ${safeName}: ${getType(v, k)};`;
    });
    interfaces.push(`interface ${name} {\n${props.join("\n")}\n}`);
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
      generateInterface(data[0] as Record<string, unknown>, rootName);
      return interfaces.reverse().join("\n\n") + `\n\ntype ${rootName}Array = ${rootName}[];`;
    }
    return `type ${rootName} = ${getType(data, rootName)};`;
  }
  if (typeof data === "object" && data !== null) {
    generateInterface(data as Record<string, unknown>, rootName);
    return interfaces.reverse().join("\n\n");
  }
  return `type ${rootName} = ${typeof data};`;
}

export default function JsonToTypescript() {
  const t = useTranslations("tools.json-to-typescript");
  const [input, setInput] = useState("");
  const [rootName, setRootName] = useState("Root");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = () => {
    setError("");
    try { setOutput(jsonToTs(input, rootName || "Root")); } catch (e) { setError(e instanceof Error ? e.message : "Invalid JSON"); setOutput(""); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.rootName")}:</label>
        <input value={rootName} onChange={e => setRootName(e.target.value)} className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono w-40" />
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t("ui.pasteJson")} className="w-full h-40 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      <button onClick={convert} disabled={!input.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700">{t("ui.convert")}</button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {output && (
        <div className="relative">
          <textarea readOnly value={output} className="w-full h-48 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 resize-y" />
          <button onClick={() => navigator.clipboard.writeText(output)} className="absolute top-2 right-2 px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600">{t("ui.copy")}</button>
        </div>
      )}
    </div>
  );
}
