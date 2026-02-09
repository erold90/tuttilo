"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

function base32Decode(input: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  const bytes: number[] = [];
  let buffer = 0, bitsLeft = 0;
  for (const c of clean) {
    const val = alphabet.indexOf(c);
    if (val === -1) continue;
    buffer = (buffer << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) { bitsLeft -= 8; bytes.push((buffer >> bitsLeft) & 0xFF); }
  }
  return new Uint8Array(bytes);
}

async function generateTOTP(secret: string, period = 30, digits = 6): Promise<{ code: string; remaining: number }> {
  const now = Math.floor(Date.now() / 1000);
  const counter = Math.floor(now / period);
  const remaining = period - (now % period);

  const keyData = base32Decode(secret);
  if (keyData.length === 0) return { code: "------", remaining };

  const counterBuf = new ArrayBuffer(8);
  const view = new DataView(counterBuf);
  view.setUint32(4, counter, false);

  const key = await crypto.subtle.importKey("raw", keyData.buffer as ArrayBuffer, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, counterBuf);
  const hmac = new Uint8Array(sig);

  const offset = hmac[hmac.length - 1] & 0x0F;
  const binary = ((hmac[offset] & 0x7F) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  const otp = binary % Math.pow(10, digits);

  return { code: otp.toString().padStart(digits, "0"), remaining };
}

export default function TOTPGenerator() {
  const t = useTranslations("tools.totp-generator.ui");
  const [secret, setSecret] = useState("");
  const [period, setPeriod] = useState(30);
  const [digits, setDigits] = useState(6);
  const [code, setCode] = useState("------");
  const [remaining, setRemaining] = useState(30);
  const [copied, setCopied] = useState(false);

  const update = useCallback(async () => {
    if (!secret.trim()) { setCode("------"); return; }
    try {
      const r = await generateTOTP(secret, period, digits);
      setCode(r.code);
      setRemaining(r.remaining);
    } catch { setCode("ERROR"); }
  }, [secret, period, digits]);

  useEffect(() => {
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [update]);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const genSecret = () => {
    const arr = crypto.getRandomValues(new Uint8Array(20));
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let s = "";
    for (const b of arr) s += alpha[b % 32];
    setSecret(s);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">{t("secret")}</label>
        <div className="flex gap-2">
          <input type="text" value={secret} onChange={e => setSecret(e.target.value)} placeholder={t("secretPlaceholder")}
            className="flex-1 rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm uppercase focus:border-primary focus:outline-none" />
          <button onClick={genSecret} className="shrink-0 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted">
            {t("generateSecret")}
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium">{t("period")}</label>
          <select value={period} onChange={e => setPeriod(Number(e.target.value))}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <option value={30}>30s</option>
            <option value={60}>60s</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">{t("digits")}</label>
          <select value={digits} onChange={e => setDigits(Number(e.target.value))}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <option value={6}>6</option>
            <option value={8}>8</option>
          </select>
        </div>
      </div>

      {/* Code display */}
      <div className="flex flex-col items-center rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
        <div className="mb-2 font-mono text-4xl font-bold tracking-[0.3em]">{code}</div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-1000"
              style={{ width: `${(remaining / period) * 100}%` }} />
          </div>
          <span className="text-sm text-muted-foreground">{remaining}s</span>
        </div>
        <button onClick={copy} className="mt-3 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
          {copied ? t("copied") : t("copy")}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">{t("info")}</p>
    </div>
  );
}
