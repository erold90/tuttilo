"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function decodeBase64Url(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  const s = pad ? padded + "=".repeat(4 - pad) : padded;
  return atob(s);
}

function decodeJwt(token: string): { header: unknown; payload: unknown; signature: string } | null {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return null;
    const header = JSON.parse(decodeBase64Url(parts[0]));
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    return { header, payload, signature: parts[2] };
  } catch {
    return null;
  }
}

function formatExp(exp: number): string {
  const d = new Date(exp * 1000);
  const now = Date.now();
  const expired = d.getTime() < now;
  return `${d.toISOString()} (${expired ? "EXPIRED" : "valid"})`;
}

export function JwtDecoder() {
  const t = useTranslations("tools.jwt-decoder.ui");
  const [token, setToken] = useState("");

  const decoded = useMemo(() => decodeJwt(token), [token]);

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium">{t("input")}</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={t("placeholder")}
          className="h-28 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs focus:border-primary focus:outline-none"
        />
      </div>

      {token && !decoded && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center text-sm text-red-400">{t("invalid")}</div>
      )}

      {decoded && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-red-400">HEADER</h3>
            <pre className="max-h-48 overflow-auto rounded-lg border border-red-500/20 bg-red-500/5 p-3 font-mono text-xs text-red-300">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-purple-400">PAYLOAD</h3>
            <pre className="max-h-48 overflow-auto rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 font-mono text-xs text-purple-300">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>
          <div className="md:col-span-2">
            <h3 className="mb-2 text-sm font-semibold text-blue-400">SIGNATURE</h3>
            <code className="block break-all rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 font-mono text-xs text-blue-300">
              {decoded.signature}
            </code>
          </div>
          {decoded.payload && typeof decoded.payload === "object" && "exp" in (decoded.payload as Record<string, unknown>) ? (
            <div className="md:col-span-2 rounded-lg border border-border bg-card p-3 text-sm">
              <span className="font-medium">{t("expires")}:</span>{" "}
              <span className="font-mono">{formatExp((decoded.payload as Record<string, number>).exp)}</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
