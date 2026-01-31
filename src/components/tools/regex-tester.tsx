"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

interface MatchResult {
  match: string;
  index: number;
  groups: string[];
}

export function RegexTester() {
  const t = useTranslations("tools.regex-tester.ui");
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [error, setError] = useState("");

  const flagOptions = [
    { flag: "g", label: t("global") },
    { flag: "i", label: t("caseInsensitive") },
    { flag: "m", label: t("multiline") },
    { flag: "s", label: t("dotAll") },
  ];

  function toggleFlag(flag: string) {
    setFlags((prev) =>
      prev.includes(flag) ? prev.replace(flag, "") : prev + flag
    );
  }

  const matches = useMemo<MatchResult[]>(() => {
    if (!pattern || !testString) {
      setError("");
      return [];
    }
    try {
      const regex = new RegExp(pattern, flags);
      setError("");
      const results: MatchResult[] = [];
      let match;

      if (flags.includes("g")) {
        while ((match = regex.exec(testString)) !== null) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (match.index === regex.lastIndex) regex.lastIndex++;
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }
      return results;
    } catch (e: any) {
      setError(e.message);
      return [];
    }
  }, [pattern, flags, testString]);

  // Build highlighted text
  const highlightedText = useMemo(() => {
    if (!pattern || !testString || matches.length === 0) return null;
    try {
      const regex = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const parts: { text: string; isMatch: boolean }[] = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(testString)) !== null) {
        if (match.index > lastIndex) {
          parts.push({
            text: testString.slice(lastIndex, match.index),
            isMatch: false,
          });
        }
        parts.push({ text: match[0], isMatch: true });
        lastIndex = regex.lastIndex;
        if (match.index === regex.lastIndex) regex.lastIndex++;
      }
      if (lastIndex < testString.length) {
        parts.push({ text: testString.slice(lastIndex), isMatch: false });
      }
      return parts;
    } catch {
      return null;
    }
  }, [pattern, flags, testString, matches]);

  return (
    <div className="space-y-4">
      {/* Pattern input */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t("pattern")}
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3">
          <span className="text-muted-foreground">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder={t("patternPlaceholder")}
            className="flex-1 bg-transparent py-2 font-mono text-sm focus:outline-none"
            spellCheck={false}
          />
          <span className="text-muted-foreground">/{flags}</span>
        </div>
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-2">
        {flagOptions.map((opt) => (
          <button
            key={opt.flag}
            onClick={() => toggleFlag(opt.flag)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              flags.includes(opt.flag)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            {opt.flag} — {opt.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Test string */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t("testString")}
        </label>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder={t("testPlaceholder")}
          className="h-[200px] w-full resize-y rounded-lg border border-border bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          spellCheck={false}
        />
      </div>

      {/* Highlighted output */}
      {highlightedText && highlightedText.length > 0 && (
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("result")}
          </label>
          <div className="whitespace-pre-wrap rounded-lg border border-border bg-card p-4 font-mono text-sm">
            {highlightedText.map((part, i) =>
              part.isMatch ? (
                <mark
                  key={i}
                  className="rounded bg-primary/20 px-0.5 text-primary"
                >
                  {part.text}
                </mark>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )}
          </div>
        </div>
      )}

      {/* Match info */}
      {matches.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-2 text-sm font-medium">
            {matches.length} {t("matchesFound")}
          </p>
          <div className="space-y-1">
            {matches.slice(0, 20).map((m, i) => (
              <div
                key={i}
                className="flex gap-3 text-xs font-mono text-muted-foreground"
              >
                <span className="text-primary">#{i + 1}</span>
                <span>&ldquo;{m.match}&rdquo;</span>
                <span>
                  {t("atIndex")} {m.index}
                </span>
                {m.groups.length > 0 && (
                  <span>
                    groups: [{m.groups.map((g) => `"${g}"`).join(", ")}]
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
