"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function Base64Encoder() {
  const t = useTranslations("tools.base64.ui");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function process(text: string, newMode?: "encode" | "decode") {
    const currentMode = newMode || mode;
    setError("");
    try {
      if (currentMode === "encode") {
        const bytes = new TextEncoder().encode(text);
        const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
        setOutput(btoa(binary));
      } else {
        const binary = atob(text);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        setOutput(new TextDecoder().decode(bytes));
      }
    } catch {
      setError(t("invalidInput"));
      setOutput("");
    }
  }

  function handleInputChange(text: string) {
    setInput(text);
    if (text) process(text);
    else setOutput("");
  }

  function switchMode(newMode: "encode" | "decode") {
    setMode(newMode);
    if (input) process(input, newMode);
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 rounded-lg border border-border p-1 w-fit">
        <button
          onClick={() => switchMode("encode")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "encode"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          {t("encode")}
        </button>
        <button
          onClick={() => switchMode("decode")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "decode"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          {t("decode")}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("input")}
          </label>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={
              mode === "encode" ? t("encodePlaceholder") : t("decodePlaceholder")
            }
            className="h-[300px] w-full resize-y rounded-lg border border-border bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium">{t("output")}</label>
            {output && (
              <button
                onClick={copy}
                className="text-xs text-primary hover:underline"
              >
                {copied ? t("copied") : t("copy")}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            className="h-[300px] w-full resize-y rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
