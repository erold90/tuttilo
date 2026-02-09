"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function arrayBufferToPem(buffer: ArrayBuffer, type: "PUBLIC" | "PRIVATE"): string {
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const lines = b64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${type} KEY-----\n${lines.join("\n")}\n-----END ${type} KEY-----`;
}

async function generateRSAKeyPair(bits: number): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: bits, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true, ["encrypt", "decrypt"]
  );
  const pubBuf = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  const privBuf = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  return { publicKey: arrayBufferToPem(pubBuf, "PUBLIC"), privateKey: arrayBufferToPem(privBuf, "PRIVATE") };
}

export default function RSAKeyGenerator() {
  const t = useTranslations("tools.rsa-key-generator.ui");
  const [bits, setBits] = useState(2048);
  const [keys, setKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedPub, setCopiedPub] = useState(false);
  const [copiedPriv, setCopiedPriv] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const pair = await generateRSAKeyPair(bits);
      setKeys(pair);
    } catch { /* noop */ }
    finally { setLoading(false); }
  };

  const copyKey = (key: string, type: "pub" | "priv") => {
    navigator.clipboard.writeText(key);
    if (type === "pub") { setCopiedPub(true); setTimeout(() => setCopiedPub(false), 2000); }
    else { setCopiedPriv(true); setTimeout(() => setCopiedPriv(false), 2000); }
  };

  const download = (key: string, name: string) => {
    const blob = new Blob([key], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">{t("keySize")}</label>
        <div className="flex gap-2">
          {[1024, 2048, 4096].map(b => (
            <button key={b} onClick={() => setBits(b)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${bits === b ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}>
              {b} bit
            </button>
          ))}
        </div>
      </div>

      <button onClick={generate} disabled={loading}
        className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
        {loading ? t("generating") : t("generate")}
      </button>

      {keys && (
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">{t("publicKey")}</label>
              <div className="flex gap-2">
                <button onClick={() => copyKey(keys.publicKey, "pub")} className="rounded-lg border border-border px-3 py-1 text-xs font-medium hover:bg-muted">
                  {copiedPub ? t("copied") : t("copy")}
                </button>
                <button onClick={() => download(keys.publicKey, "public_key.pem")} className="rounded-lg border border-border px-3 py-1 text-xs font-medium hover:bg-muted">
                  {t("download")}
                </button>
              </div>
            </div>
            <pre className="max-h-40 overflow-auto rounded-lg border border-border bg-muted/50 p-3 font-mono text-xs">{keys.publicKey}</pre>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">{t("privateKey")}</label>
              <div className="flex gap-2">
                <button onClick={() => copyKey(keys.privateKey, "priv")} className="rounded-lg border border-border px-3 py-1 text-xs font-medium hover:bg-muted">
                  {copiedPriv ? t("copied") : t("copy")}
                </button>
                <button onClick={() => download(keys.privateKey, "private_key.pem")} className="rounded-lg border border-border px-3 py-1 text-xs font-medium hover:bg-muted">
                  {t("download")}
                </button>
              </div>
            </div>
            <pre className="max-h-40 overflow-auto rounded-lg border border-border bg-muted/50 p-3 font-mono text-xs">{keys.privateKey}</pre>
          </div>

          <p className="text-xs text-muted-foreground">{t("warning")}</p>
        </div>
      )}
    </div>
  );
}
