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

function numToBin(n: number): string {
  return [24, 16, 8, 0].map(s => ((n >>> s) & 255).toString(2).padStart(8, "0")).join(".");
}

export default function SubnetCalculator() {
  const t = useTranslations("tools.subnet-calculator");
  const [ip, setIp] = useState("192.168.1.0");
  const [cidr, setCidr] = useState(24);
  const [result, setResult] = useState<Record<string, string> | null>(null);

  const calculate = useCallback(() => {
    const ipNum = ipToNum(ip);
    const mask = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
    const network = (ipNum & mask) >>> 0;
    const broadcast = (network | ~mask) >>> 0;
    const first = cidr >= 31 ? network : (network + 1) >>> 0;
    const last = cidr >= 31 ? broadcast : (broadcast - 1) >>> 0;
    const hosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : Math.pow(2, 32 - cidr) - 2;

    setResult({
      network: numToIp(network),
      broadcast: numToIp(broadcast),
      mask: numToIp(mask),
      maskBin: numToBin(mask),
      firstHost: numToIp(first),
      lastHost: numToIp(last),
      totalHosts: hosts.toLocaleString(),
      cidrNotation: `${numToIp(network)}/${cidr}`,
      wildcard: numToIp((~mask) >>> 0),
      ipClass: ip.startsWith("10.") || ip.startsWith("172.") || ip.startsWith("192.168.") ? "Private" : "Public",
    });
  }, [ip, cidr]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.ipAddress")}
          <input value={ip} onChange={e => setIp(e.target.value)} placeholder="192.168.1.0" className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.cidr")}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-mono">/</span>
            <input type="number" min={0} max={32} value={cidr} onChange={e => setCidr(Math.max(0, Math.min(32, +e.target.value)))} className="w-20 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono" />
          </div>
        </label>
        <button onClick={calculate} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mt-auto">{t("ui.calculate")}</button>
      </div>
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{t(`ui.${key}`)}</span>
              <code className="text-sm font-mono text-zinc-900 dark:text-zinc-100">{value}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
