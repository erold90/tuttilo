"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 100000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

async function encryptText(text: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(text));
  const buf = new Uint8Array(salt.length + iv.length + ct.byteLength);
  buf.set(salt, 0);
  buf.set(iv, salt.length);
  buf.set(new Uint8Array(ct), salt.length + iv.length);
  return btoa(String.fromCharCode(...buf));
}

async function decryptText(encoded: string, password: string): Promise<string> {
  const dec = new TextDecoder();
  const raw = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
  const salt = raw.slice(0, 16);
  const iv = raw.slice(16, 28);
  const ct = raw.slice(28);
  const key = await deriveKey(password, salt);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return dec.decode(pt);
}

export default function AesEncryptDecrypt() {
  const t = useTranslations("tools.aes-encrypt-decrypt.ui");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const process = async () => {
    if (!input || !password) { setError(t("fillBoth")); return; }
    setError("");
    setLoading(true);
    try {
      const result = mode === "encrypt" ? await encryptText(input, password) : await decryptText(input, password);
      setOutput(result);
    } catch {
      setError(mode === "decrypt" ? t("decryptError") : t("encryptError"));
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["encrypt", "decrypt"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setOutput(""); setError(""); }}
            className={`flex-1 rounded-xl py-3 text-sm font-medium transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
            {t(m)}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">{t("password")}</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t("passwordPlaceholder")}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">{mode === "encrypt" ? t("plaintext") : t("ciphertext")}</label>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          placeholder={mode === "encrypt" ? t("plaintextPlaceholder") : t("ciphertextPlaceholder")}
          rows={5} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none resize-none" />
      </div>

      <button onClick={process} disabled={loading}
        className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
        {loading ? t("processing") : mode === "encrypt" ? t("encryptBtn") : t("decryptBtn")}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {output && (
        <div>
          <label className="mb-2 block text-sm font-medium">{t("result")}</label>
          <div className="flex items-start gap-2">
            <pre className="flex-1 rounded-lg border border-border bg-muted/50 p-3 font-mono text-sm break-all whitespace-pre-wrap">{output}</pre>
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
