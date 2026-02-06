"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

async function computeHash(algo: string, text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest(algo, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const ALGOS = [
  { id: "SHA-1", label: "SHA-1" },
  { id: "SHA-256", label: "SHA-256" },
  { id: "SHA-384", label: "SHA-384" },
  { id: "SHA-512", label: "SHA-512" },
];

export function HashGenerator() {
  const t = useTranslations("tools.hash-generator.ui");
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!input) { setHashes({}); return; }
    let cancelled = false;
    Promise.all(ALGOS.map(async (a) => ({ id: a.id, hash: await computeHash(a.id, input) }))).then((results) => {
      if (!cancelled) setHashes(Object.fromEntries(results.map((r) => [r.id, r.hash])));
    });
    return () => { cancelled = true; };
  }, [input]);

  const copy = (v: string) => navigator.clipboard.writeText(v);

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("input")}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          className="h-32 w-full rounded-lg border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {input && (
        <div className="space-y-3">
          {ALGOS.map((a) => (
            <div key={a.id} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-primary">{a.label}</span>
                <button onClick={() => copy(hashes[a.id] || "")} className="text-xs text-primary hover:underline">{t("copy")}</button>
              </div>
              <code className="block break-all text-xs text-muted-foreground">{hashes[a.id] || "..."}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
