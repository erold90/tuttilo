"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Algo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

async function computeHmac(algo: Algo, key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: algo }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function HmacGenerator() {
  const t = useTranslations("tools.hmac-generator.ui");
  const [algo, setAlgo] = useState<Algo>("SHA-256");
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!key || !message) { setError(t("fillBoth")); return; }
    setError("");
    try {
      const hmac = await computeHmac(algo, key, message);
      setResult(hmac);
    } catch { setError(t("error")); }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const algos: Algo[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">{t("algorithm")}</label>
        <div className="flex flex-wrap gap-2">
          {algos.map(a => (
            <button key={a} onClick={() => setAlgo(a)} className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${algo === a ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">{t("secretKey")}</label>
        <input type="text" value={key} onChange={e => setKey(e.target.value)} placeholder={t("keyPlaceholder")} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">{t("message")}</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={t("messagePlaceholder")} rows={4} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none resize-none" />
      </div>

      <button onClick={generate} className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        {t("generate")}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div>
          <label className="mb-2 block text-sm font-medium">{t("result")}</label>
          <div className="flex items-start gap-2">
            <pre className="flex-1 rounded-lg border border-border bg-muted/50 p-3 font-mono text-sm break-all">{result}</pre>
            <button onClick={copy} className="shrink-0 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
