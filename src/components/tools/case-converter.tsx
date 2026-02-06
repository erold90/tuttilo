"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "snake" | "kebab" | "pascal" | "dot" | "path" | "constant";

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase());
}

function toSentenceCase(s: string) {
  return s.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()).replace(/^(.)/, (c) => c.toUpperCase());
}

function splitWords(s: string): string[] {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-./\\]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function convert(text: string, type: CaseType): string {
  switch (type) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "title": return toTitleCase(text);
    case "sentence": return toSentenceCase(text.toLowerCase());
    case "camel": {
      const w = splitWords(text);
      return w.map((s, i) => i === 0 ? s.toLowerCase() : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join("");
    }
    case "pascal": return splitWords(text).map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join("");
    case "snake": return splitWords(text).map((s) => s.toLowerCase()).join("_");
    case "kebab": return splitWords(text).map((s) => s.toLowerCase()).join("-");
    case "dot": return splitWords(text).map((s) => s.toLowerCase()).join(".");
    case "path": return splitWords(text).map((s) => s.toLowerCase()).join("/");
    case "constant": return splitWords(text).map((s) => s.toUpperCase()).join("_");
    default: return text;
  }
}

export function CaseConverter() {
  const t = useTranslations("tools.case-converter.ui");
  const [text, setText] = useState("");
  const [caseType, setCaseType] = useState<CaseType>("upper");

  const result = text ? convert(text, caseType) : "";

  const copy = useCallback(() => {
    if (result) navigator.clipboard.writeText(result);
  }, [result]);

  const cases: { id: CaseType; label: string; example: string }[] = [
    { id: "upper", label: t("upper"), example: "HELLO WORLD" },
    { id: "lower", label: t("lower"), example: "hello world" },
    { id: "title", label: t("title"), example: "Hello World" },
    { id: "sentence", label: t("sentence"), example: "Hello world" },
    { id: "camel", label: "camelCase", example: "helloWorld" },
    { id: "pascal", label: "PascalCase", example: "HelloWorld" },
    { id: "snake", label: "snake_case", example: "hello_world" },
    { id: "kebab", label: "kebab-case", example: "hello-world" },
    { id: "dot", label: "dot.case", example: "hello.world" },
    { id: "constant", label: "CONSTANT_CASE", example: "HELLO_WORLD" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {cases.map((c) => (
          <button
            key={c.id}
            onClick={() => setCaseType(c.id)}
            className={`rounded-lg border p-2 text-xs font-medium transition-colors ${
              caseType === c.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/30"
            }`}
          >
            <div>{c.label}</div>
            <div className="mt-0.5 font-mono text-[10px] opacity-60">{c.example}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("input")}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("placeholder")}
            className="h-48 w-full rounded-lg border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("output")}</label>
          <textarea
            value={result}
            readOnly
            className="h-48 w-full rounded-lg border border-border bg-muted/30 p-3 text-sm"
          />
        </div>
      </div>

      <button
        onClick={copy}
        disabled={!result}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {t("copy")}
      </button>
    </div>
  );
}
