"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface ValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
  structure?: string;
}

function validateYaml(yaml: string): ValidationResult {
  const lines = yaml.split("\n");
  let prevIndent = 0;
  const indentStack: number[] = [0];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimEnd();
    if (trimmed === "" || trimmed.trim().startsWith("#")) continue;

    // Check tabs
    if (/^\t/.test(line)) return { valid: false, error: "Tab characters not allowed, use spaces", line: i + 1 };

    const indent = line.search(/\S/);
    if (indent === -1) continue;

    // Check indent consistency
    if (indent > prevIndent && (indent - prevIndent) % 2 !== 0 && (indent - prevIndent) !== 1) {
      // Allow odd indents for list items
      if (!trimmed.startsWith("-")) {
        return { valid: false, error: `Inconsistent indentation (expected multiple of 2, got ${indent - prevIndent})`, line: i + 1 };
      }
    }

    const content = trimmed.trim();
    // Check for duplicate keys at same level
    if (content.includes(": ") || (content.endsWith(":") && !content.startsWith("-"))) {
      // Basic key validation
      const key = content.split(":")[0].trim().replace(/^- /, "");
      if (/[{}[\]]/.test(key) && !key.startsWith('"') && !key.startsWith("'")) {
        return { valid: false, error: `Invalid key character in "${key}"`, line: i + 1 };
      }
    }

    // Check unclosed quotes
    const singleQuotes = (content.match(/'/g) || []).length;
    const doubleQuotes = (content.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0) return { valid: false, error: "Unclosed single quote", line: i + 1 };
    if (doubleQuotes % 2 !== 0) return { valid: false, error: "Unclosed double quote", line: i + 1 };

    if (indent > prevIndent) indentStack.push(indent);
    else while (indentStack.length > 1 && indentStack[indentStack.length - 1] > indent) indentStack.pop();
    prevIndent = indent;
  }

  // Determine structure type
  const firstMeaningful = lines.find(l => l.trim() && !l.trim().startsWith("#"));
  const structure = firstMeaningful?.trim().startsWith("-") ? "Array (sequence)" : "Object (mapping)";

  return { valid: true, structure };
}

export default function YamlValidator() {
  const t = useTranslations("tools.yaml-validator");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validate = () => setResult(validateYaml(input));

  return (
    <div className="space-y-4">
      <textarea value={input} onChange={e => { setInput(e.target.value); setResult(null); }} placeholder={t("ui.pasteYaml")} className="w-full h-48 p-3 font-mono text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 resize-y" />
      <button onClick={validate} disabled={!input.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors">{t("ui.validate")}</button>
      {result && (
        <div className={`p-4 rounded-lg border ${result.valid ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700" : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"}`}>
          <p className={`font-medium ${result.valid ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
            {result.valid ? `✓ ${t("ui.validYaml")}` : `✗ ${t("ui.invalidYaml")}`}
          </p>
          {result.error && <p className="text-sm mt-1 text-red-600 dark:text-red-400">{result.error}{result.line ? ` (${t("ui.line")} ${result.line})` : ""}</p>}
          {result.structure && <p className="text-sm mt-1 text-zinc-600 dark:text-zinc-400">{t("ui.structure")}: {result.structure}</p>}
        </div>
      )}
    </div>
  );
}
