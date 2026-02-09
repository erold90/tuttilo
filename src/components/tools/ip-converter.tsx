"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

export default function IpConverter() {
  const t = useTranslations("tools.ip-converter");
  const [input, setInput] = useState("192.168.1.1");
  const [results, setResults] = useState<Record<string, string> | null>(null);

  const convert = useCallback(() => {
    let num: number;
    const trimmed = input.trim();

    // Try dotted decimal
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmed)) {
      const parts = trimmed.split(".").map(Number);
      if (parts.some(p => p > 255)) return;
      num = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
    }
    // Try decimal
    else if (/^\d+$/.test(trimmed)) {
      num = parseInt(trimmed, 10) >>> 0;
    }
    // Try hex
    else if (/^(0x)?[0-9a-fA-F]+$/.test(trimmed)) {
      num = parseInt(trimmed.replace("0x", ""), 16) >>> 0;
    }
    // Try binary
    else if (/^[01.\s]+$/.test(trimmed)) {
      const clean = trimmed.replace(/[.\s]/g, "");
      if (clean.length > 32) return;
      num = parseInt(clean.padStart(32, "0"), 2) >>> 0;
    } else return;

    const dotted = `${(num >>> 24) & 255}.${(num >>> 16) & 255}.${(num >>> 8) & 255}.${num & 255}`;
    const binary = [24, 16, 8, 0].map(s => ((num >>> s) & 255).toString(2).padStart(8, "0")).join(".");
    const hex = "0x" + num.toString(16).padStart(8, "0").toUpperCase();
    const octal = "0" + num.toString(8);
    const decimal = num.toString(10);
    const mapped = `::ffff:${dotted}`;

    setResults({ dotted, decimal, hex, octal, binary, ipv6Mapped: mapped });
  }, [input]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.input")}
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="192.168.1.1 or 3232235777 or 0xC0A80101" className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" />
        </label>
        <button onClick={convert} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mt-auto">{t("ui.convert")}</button>
      </div>
      <p className="text-xs text-zinc-500">{t("ui.hint")}</p>
      {results && (
        <div className="space-y-2">
          {Object.entries(results).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{t(`ui.${key}`)}</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-zinc-900 dark:text-zinc-100">{value}</code>
                <button onClick={() => navigator.clipboard.writeText(value)} className="text-xs text-blue-600 hover:underline">{t("ui.copy")}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
