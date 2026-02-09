"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function xmlToJson(xml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error(err.textContent || "Invalid XML");

  function nodeToObj(node: Element): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    // attributes
    if (node.attributes.length) {
      const attrs: Record<string, string> = {};
      for (let i = 0; i < node.attributes.length; i++) {
        const a = node.attributes[i];
        attrs[`@${a.name}`] = a.value;
      }
      Object.assign(obj, attrs);
    }
    // children
    const children = Array.from(node.children);
    if (children.length === 0) {
      const text = node.textContent?.trim() || "";
      if (Object.keys(obj).length === 0) return text as unknown as Record<string, unknown>;
      if (text) obj["#text"] = text;
      return obj;
    }
    const grouped: Record<string, unknown[]> = {};
    for (const child of children) {
      const name = child.tagName;
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(nodeToObj(child));
    }
    for (const [key, val] of Object.entries(grouped)) {
      obj[key] = val.length === 1 ? val[0] : val;
    }
    return obj;
  }

  const root = doc.documentElement;
  const result = { [root.tagName]: nodeToObj(root) };
  return JSON.stringify(result, null, 2);
}

function jsonToXml(json: string): string {
  const data = JSON.parse(json);
  function objToXml(obj: unknown, tag?: string): string {
    if (obj === null || obj === undefined) return tag ? `<${tag}/>` : "";
    if (typeof obj !== "object") return tag ? `<${tag}>${escapeXml(String(obj))}</${tag}>` : escapeXml(String(obj));
    if (Array.isArray(obj)) return obj.map(item => objToXml(item, tag)).join("\n");
    const entries = Object.entries(obj as Record<string, unknown>);
    const attrs = entries.filter(([k]) => k.startsWith("@")).map(([k, v]) => ` ${k.slice(1)}="${escapeXml(String(v))}"`).join("");
    const textEntry = entries.find(([k]) => k === "#text");
    const children = entries.filter(([k]) => !k.startsWith("@") && k !== "#text");
    const inner = (textEntry ? escapeXml(String(textEntry[1])) : "") + children.map(([k, v]) => objToXml(v, k)).join("\n");
    return tag ? `<${tag}${attrs}>${inner}</${tag}>` : inner;
  }
  function escapeXml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n${objToXml(data)}`;
}

type Direction = "xml-to-json" | "json-to-xml";

export default function XmlJsonConverter() {
  const t = useTranslations("tools.xml-json-converter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<Direction>("xml-to-json");
  const [error, setError] = useState("");

  const convert = () => {
    setError("");
    try {
      setOutput(direction === "xml-to-json" ? xmlToJson(input) : jsonToXml(input));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion error");
      setOutput("");
    }
  };

  const swap = () => {
    setDirection(d => d === "xml-to-json" ? "json-to-xml" : "xml-to-json");
    setInput(output);
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => { setDirection("xml-to-json"); setOutput(""); setError(""); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${direction === "xml-to-json" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}>XML → JSON</button>
        <button onClick={() => { setDirection("json-to-xml"); setOutput(""); setError(""); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${direction === "json-to-xml" ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}>JSON → XML</button>
        {output && <button onClick={swap} className="px-3 py-1.5 rounded-lg text-sm bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600">↔ {t("ui.swap")}</button>}
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t(`ui.${direction === "xml-to-json" ? "pasteXml" : "pasteJson"}`)} className="w-full h-48 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
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
