"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function formatPEM(b64: string, type: string): string {
  const lines: string[] = [];
  for (let i = 0; i < b64.length; i += 64) lines.push(b64.slice(i, i + 64));
  return `-----BEGIN ${type}-----\n${lines.join("\n")}\n-----END ${type}-----`;
}

export default function CsrGenerator() {
  const t = useTranslations("tools.csr-generator");
  const [algorithm, setAlgorithm] = useState<"RSA" | "EC">("RSA");
  const [keySize, setKeySize] = useState(2048);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [generating, setGenerating] = useState(false);

  const generate = useCallback(async () => {
    setGenerating(true);
    setPublicKey("");
    setPrivateKey("");
    try {
      let keyPair: CryptoKeyPair;
      if (algorithm === "RSA") {
        keyPair = await crypto.subtle.generateKey(
          { name: "RSASSA-PKCS1-v1_5", modulusLength: keySize, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
          true, ["sign", "verify"]
        );
      } else {
        keyPair = await crypto.subtle.generateKey(
          { name: "ECDSA", namedCurve: "P-256" },
          true, ["sign", "verify"]
        );
      }
      const pubExported = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privExported = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
      setPublicKey(formatPEM(arrayBufferToBase64(pubExported), "PUBLIC KEY"));
      setPrivateKey(formatPEM(arrayBufferToBase64(privExported), "PRIVATE KEY"));
    } catch (e) {
      setPublicKey(`Error: ${e instanceof Error ? e.message : "Generation failed"}`);
    }
    setGenerating(false);
  }, [algorithm, keySize]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("ui.algorithm")}
          <select value={algorithm} onChange={e => setAlgorithm(e.target.value as "RSA" | "EC")} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
            <option value="RSA">RSA</option>
            <option value="EC">ECDSA (P-256)</option>
          </select>
        </label>
        {algorithm === "RSA" && (
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("ui.keySize")}
            <select value={keySize} onChange={e => setKeySize(Number(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
              <option value={2048}>2048 bit</option>
              <option value={4096}>4096 bit</option>
            </select>
          </label>
        )}
      </div>
      <button onClick={generate} disabled={generating} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
        {generating ? t("ui.generating") : t("ui.generate")}
      </button>
      {publicKey && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.publicKey")}</label>
            <button onClick={() => navigator.clipboard.writeText(publicKey)} className="text-xs text-blue-500 hover:text-blue-600">{t("ui.copy")}</button>
          </div>
          <pre className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-mono overflow-x-auto whitespace-pre-wrap">{publicKey}</pre>
        </div>
      )}
      {privateKey && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-red-600 dark:text-red-400">{t("ui.privateKey")}</label>
            <button onClick={() => navigator.clipboard.writeText(privateKey)} className="text-xs text-blue-500 hover:text-blue-600">{t("ui.copy")}</button>
          </div>
          <pre className="px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-xs font-mono overflow-x-auto whitespace-pre-wrap">{privateKey}</pre>
          <p className="text-xs text-red-500 mt-1">{t("ui.privateWarning")}</p>
        </div>
      )}
    </div>
  );
}
