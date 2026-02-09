"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// Minimal YAML parser (handles common cases: objects, arrays, strings, numbers, booleans, null, multiline)
function parseYaml(yaml: string): unknown {
  const lines = yaml.split("\n");
  let idx = 0;

  function peekIndent(): number {
    while (idx < lines.length && (lines[idx].trim() === "" || lines[idx].trim().startsWith("#"))) idx++;
    if (idx >= lines.length) return -1;
    return lines[idx].search(/\S/);
  }

  function parseValue(val: string): unknown {
    const trimmed = val.trim();
    if (trimmed === "" || trimmed === "~" || trimmed === "null") return null;
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
    if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'")))
      return trimmed.slice(1, -1);
    if (trimmed.startsWith("[")) {
      try { return JSON.parse(trimmed); } catch { return trimmed; }
    }
    if (trimmed.startsWith("{")) {
      try { return JSON.parse(trimmed); } catch { return trimmed; }
    }
    return trimmed;
  }

  function parseBlock(minIndent: number): unknown {
    const indent = peekIndent();
    if (indent < minIndent || idx >= lines.length) return null;
    const firstLine = lines[idx].trim();
    // Array
    if (firstLine.startsWith("- ")) {
      const arr: unknown[] = [];
      while (idx < lines.length) {
        const ci = peekIndent();
        if (ci < indent || ci === -1) break;
        const line = lines[idx].trim();
        if (!line.startsWith("- ")) break;
        const rest = line.slice(2);
        if (rest.includes(": ")) {
          // inline object start — parse as nested object
          const obj: Record<string, unknown> = {};
          const [key, ...valParts] = rest.split(": ");
          const val = valParts.join(": ");
          idx++;
          obj[key.trim()] = val ? parseValue(val) : parseBlock(indent + 2);
          // continue reading keys at deeper indent
          while (idx < lines.length) {
            const ni = peekIndent();
            if (ni <= indent) break;
            const nline = lines[idx].trim();
            const colonIdx = nline.indexOf(": ");
            if (colonIdx === -1) break;
            const nkey = nline.slice(0, colonIdx).trim();
            const nval = nline.slice(colonIdx + 2);
            idx++;
            obj[nkey] = nval ? parseValue(nval) : parseBlock(ni + 2);
          }
          arr.push(obj);
        } else {
          idx++;
          arr.push(parseValue(rest));
        }
      }
      return arr;
    }
    // Object
    const obj: Record<string, unknown> = {};
    while (idx < lines.length) {
      const ci = peekIndent();
      if (ci < indent || ci === -1) break;
      const line = lines[idx];
      const trimLine = line.trim();
      const colonIdx = trimLine.indexOf(":");
      if (colonIdx === -1) { idx++; continue; }
      const key = trimLine.slice(0, colonIdx).trim();
      const rest = trimLine.slice(colonIdx + 1).trim();
      idx++;
      if (rest) {
        obj[key] = parseValue(rest);
      } else {
        obj[key] = parseBlock(indent + 1);
      }
    }
    return obj;
  }

  return parseBlock(0);
}

function jsonToYaml(data: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (data === null || data === undefined) return "null";
  if (typeof data === "boolean" || typeof data === "number") return String(data);
  if (typeof data === "string") return /[:{}\[\],&*?|>!%@`#]/.test(data) || data === "" ? JSON.stringify(data) : data;
  if (Array.isArray(data)) {
    if (data.length === 0) return "[]";
    return data.map(item => {
      const val = jsonToYaml(item, indent + 1);
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        const lines = val.split("\n");
        return `${pad}- ${lines[0].trim()}\n${lines.slice(1).map(l => `${pad}  ${l.trim()}`).join("\n")}`;
      }
      return `${pad}- ${val}`;
    }).join("\n");
  }
  const entries = Object.entries(data as Record<string, unknown>);
  if (entries.length === 0) return "{}";
  return entries.map(([k, v]) => {
    if (v === null) return `${pad}${k}: null`;
    if (typeof v !== "object") return `${pad}${k}: ${jsonToYaml(v, indent)}`;
    return `${pad}${k}:\n${jsonToYaml(v, indent + 1)}`;
  }).join("\n");
}

type Direction = "yaml-to-json" | "json-to-yaml";

export default function YamlJsonConverter() {
  const t = useTranslations("tools.yaml-json-converter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<Direction>("yaml-to-json");
  const [error, setError] = useState("");

  const convert = () => {
    setError("");
    try {
      if (direction === "yaml-to-json") {
        const parsed = parseYaml(input);
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        const parsed = JSON.parse(input);
        setOutput(jsonToYaml(parsed));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion error");
      setOutput("");
    }
  };

  const swap = () => {
    setDirection(d => d === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json");
    setInput(output);
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => { setDirection("yaml-to-json"); setOutput(""); setError(""); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${direction === "yaml-to-json" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}>YAML → JSON</button>
        <button onClick={() => { setDirection("json-to-yaml"); setOutput(""); setError(""); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${direction === "json-to-yaml" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}>JSON → YAML</button>
        {output && <button onClick={swap} className="px-3 py-1.5 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600">↔ {t("ui.swap")}</button>}
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t(`ui.${direction === "yaml-to-json" ? "pasteYaml" : "pasteJson"}`)} className="w-full h-48 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      <button onClick={convert} disabled={!input.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors">{t("ui.convert")}</button>
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
