"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

function inferSchema(value: unknown, depth = 0): Record<string, unknown> {
  if (depth > 10) return { type: "object" };

  if (value === null) return { type: "null" };
  if (typeof value === "string") return { type: "string" };
  if (typeof value === "number") return Number.isInteger(value) ? { type: "integer" } : { type: "number" };
  if (typeof value === "boolean") return { type: "boolean" };

  if (Array.isArray(value)) {
    if (value.length === 0) return { type: "array", items: {} };
    // Infer from first item
    return { type: "array", items: inferSchema(value[0], depth + 1) };
  }

  if (typeof value === "object") {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      properties[k] = inferSchema(v, depth + 1);
      if (v !== null && v !== undefined) required.push(k);
    }
    return {
      type: "object",
      properties,
      ...(required.length > 0 ? { required } : {}),
    };
  }

  return {};
}

export default function JsonSchemaGenerator() {
  const t = useTranslations("tools.json-schema-generator");
  const [input, setInput] = useState(`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "active": true,
  "tags": ["developer", "designer"],
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "zip": "62701"
  }
}`);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const schemaObj = {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        ...inferSchema(parsed),
      };
      setSchema(JSON.stringify(schemaObj, null, 2));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setSchema("");
    }
  }, [input]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t("ui.inputJson")}
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={10} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" />
      </label>
      {error && <p className="text-sm text-red-500 font-mono">{error}</p>}
      <button onClick={handleGenerate} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.generate")}</button>
      {schema && (
        <div className="relative">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("ui.generatedSchema")}</label>
          <pre className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-mono overflow-x-auto">{schema}</pre>
          <button onClick={() => navigator.clipboard.writeText(schema)} className="absolute top-8 right-2 text-xs text-blue-500 hover:text-blue-600">{t("ui.copy")}</button>
        </div>
      )}
    </div>
  );
}
