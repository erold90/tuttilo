"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export function UrlEncoder() {
  const t = useTranslations("tools.url-encoder.ui");
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const output = (() => {
    try {
      if (mode === "encode") return encodeURIComponent(input);
      return decodeURIComponent(input);
    } catch {
      return t("error");
    }
  })();

  const copy = useCallback(() => {
    if (output) navigator.clipboard.writeText(output);
  }, [output]);

  const swap = useCallback(() => {
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    setInput(output === t("error") ? "" : output);
  }, [output, t]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["encode", "decode"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === m ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(m)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("input")}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "https://example.com/path?q=hello world" : "https%3A%2F%2Fexample.com"}
            className="h-40 w-full rounded-lg border border-border bg-background p-3 font-mono text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("output")}</label>
          <textarea
            value={output}
            readOnly
            className="h-40 w-full rounded-lg border border-border bg-muted/30 p-3 font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={copy} disabled={!output} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{t("copy")}</button>
        <button onClick={swap} className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted">{t("swap")}</button>
      </div>
    </div>
  );
}
