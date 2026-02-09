"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type HashAlgo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

async function derivePBKDF2(password: string, salt: string, iterations: number, keyLength: number, hash: HashAlgo): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations, hash }, key, keyLength * 8);
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function PBKDF2Generator() {
  const t = useTranslations("tools.pbkdf2-generator.ui");
  const [password, setPassword] = useState("");
  const [salt, setSalt] = useState("");
  const [iterations, setIterations] = useState(100000);
  const [keyLength, setKeyLength] = useState(32);
  const [hash, setHash] = useState<HashAlgo>("SHA-256");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!password) { setError(t("enterPassword")); return; }
    setError("");
    setLoading(true);
    try {
      const s = salt || crypto.getRandomValues(new Uint8Array(16)).reduce((a, b) => a + b.toString(16).padStart(2, "0"), "");
      if (!salt) setSalt(s);
      const hex = await derivePBKDF2(password, s, iterations, keyLength, hash);
      setResult(hex);
    } catch { setError(t("error")); }
    finally { setLoading(false); }
  };

  const genSalt = () => {
    const s = crypto.getRandomValues(new Uint8Array(16));
    setSalt(Array.from(s).map(b => b.toString(16).padStart(2, "0")).join(""));
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">{t("password")}</label>
        <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder={t("passwordPlaceholder")}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">{t("salt")}</label>
        <div className="flex gap-2">
          <input type="text" value={salt} onChange={e => setSalt(e.target.value)} placeholder={t("saltPlaceholder")}
            className="flex-1 rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none" />
          <button onClick={genSalt} className="shrink-0 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted">
            {t("randomSalt")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium">{t("hash")}</label>
          <select value={hash} onChange={e => setHash(e.target.value as HashAlgo)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
            {(["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const).map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">{t("iterations")}</label>
          <input type="number" value={iterations} onChange={e => setIterations(Math.max(1, Number(e.target.value)))} min={1} max={10000000}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">{t("keyLength")}</label>
          <select value={keyLength} onChange={e => setKeyLength(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
            {[16, 32, 48, 64].map(l => <option key={l} value={l}>{l} bytes ({l * 8} bits)</option>)}
          </select>
        </div>
      </div>

      <button onClick={generate} disabled={loading}
        className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
        {loading ? t("deriving") : t("derive")}
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

      <p className="text-xs text-muted-foreground">{t("info")}</p>
    </div>
  );
}
