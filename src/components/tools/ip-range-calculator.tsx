"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

function ipToNum(ip: string): number {
  const p = ip.split(".").map(Number);
  return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
}

function numToIp(n: number): string {
  return `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
}

export default function IpRangeCalculator() {
  const t = useTranslations("tools.ip-range-calculator");
  const [cidr, setCidr] = useState("10.0.0.0/24");
  const [result, setResult] = useState<{ first: string; last: string; count: number; ips: string[] } | null>(null);
  const [showAll, setShowAll] = useState(false);

  const calculate = useCallback(() => {
    const match = cidr.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
    if (!match) return;
    const ip = ipToNum(match[1]);
    const prefix = Math.min(32, Math.max(0, parseInt(match[2])));
    const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | ~mask) >>> 0;
    const count = broadcast - network + 1;

    const ips: string[] = [];
    const maxShow = Math.min(count, 256);
    for (let i = 0; i < maxShow; i++) {
      ips.push(numToIp(network + i));
    }

    setResult({ first: numToIp(network), last: numToIp(broadcast), count, ips });
    setShowAll(false);
  }, [cidr]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.cidrInput")}
          <input value={cidr} onChange={e => setCidr(e.target.value)} placeholder="10.0.0.0/24" className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" />
        </label>
        <button onClick={calculate} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mt-auto">{t("ui.calculate")}</button>
      </div>
      {result && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <p className="text-xs text-zinc-500">{t("ui.firstIp")}</p>
              <code className="font-mono text-sm">{result.first}</code>
            </div>
            <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <p className="text-xs text-zinc-500">{t("ui.lastIp")}</p>
              <code className="font-mono text-sm">{result.last}</code>
            </div>
            <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <p className="text-xs text-zinc-500">{t("ui.totalIps")}</p>
              <code className="font-mono text-sm">{result.count.toLocaleString()}</code>
            </div>
          </div>
          {result.count <= 256 && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.ipList")}</h3>
              <div className="flex flex-wrap gap-1 max-h-60 overflow-y-auto">
                {(showAll ? result.ips : result.ips.slice(0, 32)).map(ip => (
                  <button key={ip} onClick={() => navigator.clipboard.writeText(ip)} className="px-2 py-1 text-xs font-mono bg-zinc-100 dark:bg-zinc-700 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600">{ip}</button>
                ))}
              </div>
              {!showAll && result.ips.length > 32 && (
                <button onClick={() => setShowAll(true)} className="text-sm text-blue-600 hover:underline">{t("ui.showAll", { count: result.ips.length })}</button>
              )}
              <button onClick={() => navigator.clipboard.writeText(result.ips.join("\n"))} className="text-sm text-blue-600 hover:underline">{t("ui.copyAll")}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
