"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";

function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:") || trimmed.startsWith("vbscript:")) return "#";
  return url;
}

function stripScripts(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/on\w+\s*=\s*"[^"]*"/gi, "").replace(/on\w+\s*=\s*'[^']*'/gi, "");
}

function parseMarkdown(md: string): string {
  let html = stripScripts(md)
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted/50 rounded p-3 overflow-x-auto my-2"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-muted/50 px-1 rounded text-sm">$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    // Bold & Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Strikethrough
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    // Links & Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m: string, alt: string, src: string) => `<img src="${sanitizeUrl(src)}" alt="${alt}" class="max-w-full rounded my-2" />`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m: string, text: string, href: string) => `<a href="${sanitizeUrl(href)}" class="text-primary underline" target="_blank" rel="noopener">${text}</a>`)
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-2">$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-border my-4" />')
    // Unordered lists
    .replace(/^[*-] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Line breaks (double newline = paragraph)
    .replace(/\n\n/g, '</p><p class="my-2">')
    .replace(/\n/g, "<br />");

  return `<p class="my-2">${html}</p>`;
}

export function MarkdownEditor() {
  const t = useTranslations("tools.markdown-editor.ui");
  const [markdown, setMarkdown] = useState("");
  const [tab, setTab] = useState<"edit" | "preview" | "split">("split");

  const html = useMemo(() => parseMarkdown(markdown), [markdown]);

  const insert = useCallback((before: string, after = "") => {
    const ta = document.querySelector<HTMLTextAreaElement>("#md-input");
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = markdown.substring(start, end);
    const newText = markdown.substring(0, start) + before + selected + after + markdown.substring(end);
    setMarkdown(newText);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, start + before.length + selected.length); }, 0);
  }, [markdown]);

  const copy = useCallback(() => navigator.clipboard.writeText(markdown), [markdown]);
  const copyHtml = useCallback(() => navigator.clipboard.writeText(html), [html]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg border border-border p-0.5">
          {(["edit", "split", "preview"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                tab === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(v)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => insert("**", "**")} className="rounded border border-border px-2 py-1 text-xs font-bold hover:bg-muted">B</button>
          <button onClick={() => insert("*", "*")} className="rounded border border-border px-2 py-1 text-xs italic hover:bg-muted">I</button>
          <button onClick={() => insert("# ")} className="rounded border border-border px-2 py-1 text-xs hover:bg-muted">H1</button>
          <button onClick={() => insert("## ")} className="rounded border border-border px-2 py-1 text-xs hover:bg-muted">H2</button>
          <button onClick={() => insert("[", "](url)")} className="rounded border border-border px-2 py-1 text-xs hover:bg-muted">Link</button>
          <button onClick={() => insert("```\n", "\n```")} className="rounded border border-border px-2 py-1 text-xs font-mono hover:bg-muted">{"{}"}</button>
        </div>
      </div>

      <div className={`grid gap-4 ${tab === "split" ? "md:grid-cols-2" : ""}`}>
        {(tab === "edit" || tab === "split") && (
          <textarea
            id="md-input"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={t("placeholder")}
            className="h-96 w-full rounded-lg border border-border bg-background p-4 font-mono text-sm focus:border-primary focus:outline-none"
          />
        )}
        {(tab === "preview" || tab === "split") && (
          <div
            className="prose prose-sm prose-invert h-96 max-w-none overflow-auto rounded-lg border border-border bg-card p-4"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={copy} disabled={!markdown} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{t("copyMd")}</button>
        <button onClick={copyHtml} disabled={!markdown} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">{t("copyHtml")}</button>
      </div>
    </div>
  );
}
