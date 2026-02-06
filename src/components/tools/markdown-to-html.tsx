"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

export function MarkdownToHtml() {
  const t = useTranslations("tools.markdown-to-html.ui");
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"html" | "preview">("html");

  const html = useMemo(() => {
    if (!input) return "";
    let result = input;
    // Headers
    result = result.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    result = result.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    result = result.replace(/^# (.+)$/gm, "<h1>$1</h1>");
    // Bold/Italic
    result = result.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
    // Code blocks
    result = result.replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>");
    result = result.replace(/`(.+?)`/g, "<code>$1</code>");
    // Links & images
    result = result.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />');
    result = result.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
    // Lists
    result = result.replace(/^\- (.+)$/gm, "<li>$1</li>");
    result = result.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
    // Blockquote
    result = result.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
    // HR
    result = result.replace(/^---$/gm, "<hr />");
    // Paragraphs
    result = result.replace(/\n\n/g, "</p><p>");
    result = "<p>" + result + "</p>";
    result = result.replace(/<p><h/g, "<h").replace(/<\/h(\d)><\/p>/g, "</h$1>");
    result = result.replace(/<p><pre>/g, "<pre>").replace(/<\/pre><\/p>/g, "</pre>");
    result = result.replace(/<p><hr \/><\/p>/g, "<hr />");
    result = result.replace(/<p><blockquote>/g, "<blockquote>").replace(/<\/blockquote><\/p>/g, "</blockquote>");
    result = result.replace(/<p><li>/g, "<ul><li>").replace(/<\/li><\/p>/g, "</li></ul>");
    return result;
  }, [input]);

  const copy = useCallback(() => navigator.clipboard.writeText(html), [html]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">{t("markdown")}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("placeholder")} className="w-full h-72 rounded-lg border border-border bg-background p-3 text-sm font-mono focus:border-primary focus:outline-none resize-none" />
        </div>
        <div>
          <div className="flex gap-2 mb-1">
            <button onClick={() => setTab("html")} className={`text-sm font-medium ${tab === "html" ? "text-primary" : "text-muted-foreground"}`}>HTML</button>
            <button onClick={() => setTab("preview")} className={`text-sm font-medium ${tab === "preview" ? "text-primary" : "text-muted-foreground"}`}>{t("preview")}</button>
          </div>
          {tab === "html" ? (
            <textarea value={html} readOnly className="w-full h-72 rounded-lg border border-border bg-muted/30 p-3 text-sm font-mono resize-none" />
          ) : (
            <div className="h-72 overflow-auto rounded-lg border border-border bg-background p-3 prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={copy} disabled={!html} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{t("copyHtml")}</button>
      </div>
    </div>
  );
}
