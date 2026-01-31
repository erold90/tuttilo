"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function WordCounter() {
  const t = useTranslations("tools.word-counter.ui");
  const [text, setText] = useState("");

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.trim()
    ? text.split(/[.!?]+/).filter((s) => s.trim()).length
    : 0;
  const paragraphs = text.trim()
    ? text.split(/\n\s*\n/).filter((p) => p.trim()).length
    : 0;
  const readingTime = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));
  const speakingTime = words === 0 ? 0 : Math.max(1, Math.ceil(words / 130));

  const stats = [
    { label: t("words"), value: words },
    { label: t("characters"), value: characters },
    { label: t("charactersNoSpaces"), value: charactersNoSpaces },
    { label: t("sentences"), value: sentences },
    { label: t("paragraphs"), value: paragraphs },
    { label: t("readingTime"), value: `${readingTime} min` },
    { label: t("speakingTime"), value: `${speakingTime} min` },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-4 text-center"
          >
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("placeholder")}
        className="min-h-[300px] w-full resize-y rounded-lg border border-border bg-background p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50"
      />

      {/* Clear button */}
      {text && (
        <button
          onClick={() => setText("")}
          className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
        >
          {t("clear")}
        </button>
      )}
    </div>
  );
}
