"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");

function generateSentence(minWords = 6, maxWords = 15): string {
  const len = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
  const words: string[] = [];
  for (let i = 0; i < len; i++) {
    words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
  }
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function generateParagraph(sentences = 4): string {
  return Array.from({ length: sentences }, () =>
    generateSentence()
  ).join(" ");
}

export function LoremIpsum() {
  const t = useTranslations("tools.lorem-ipsum.ui");
  const [count, setCount] = useState(3);
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">(
    "paragraphs"
  );
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    if (type === "paragraphs") {
      setOutput(
        Array.from({ length: count }, () => generateParagraph()).join("\n\n")
      );
    } else if (type === "sentences") {
      setOutput(
        Array.from({ length: count }, () => generateSentence()).join(" ")
      );
    } else {
      const words: string[] = [];
      for (let i = 0; i < count; i++) {
        words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      }
      if (words.length > 0) {
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      }
      setOutput(words.join(" ") + ".");
    }
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("count")}
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("type")}
          </label>
          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as "paragraphs" | "sentences" | "words")
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="paragraphs">{t("paragraphs")}</option>
            <option value="sentences">{t("sentences")}</option>
            <option value="words">{t("words")}</option>
          </select>
        </div>
        <button
          onClick={generate}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("generate")}
        </button>
      </div>

      {/* Output */}
      {output && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {output.split(/\s+/).length} {t("wordsCount")}
            </span>
            <button
              onClick={copy}
              className="text-sm text-primary hover:underline"
            >
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <div className="whitespace-pre-wrap rounded-lg border border-border bg-card p-6 text-sm leading-relaxed">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
