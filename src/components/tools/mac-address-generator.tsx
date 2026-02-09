"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type MacFormat = "colon" | "dash" | "dot" | "none";

function generateMac(unicast: boolean, local: boolean): Uint8Array {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  if (unicast) bytes[0] &= 0xFE; // clear multicast bit
  else bytes[0] |= 0x01;
  if (local) bytes[0] |= 0x02; // set locally administered bit
  else bytes[0] &= 0xFD;
  return bytes;
}

function formatMac(bytes: Uint8Array, format: MacFormat, uppercase: boolean): string {
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, "0"));
  const str = format === "colon" ? hex.join(":") :
    format === "dash" ? hex.join("-") :
    format === "dot" ? `${hex[0]}${hex[1]}.${hex[2]}${hex[3]}.${hex[4]}${hex[5]}` :
    hex.join("");
  return uppercase ? str.toUpperCase() : str;
}

export default function MacAddressGenerator() {
  const t = useTranslations("tools.mac-address-generator");
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState<MacFormat>("colon");
  const [uppercase, setUppercase] = useState(true);
  const [unicast, setUnicast] = useState(true);
  const [local, setLocal] = useState(true);
  const [macs, setMacs] = useState<string[]>([]);

  const generate = useCallback(() => {
    setMacs(Array.from({ length: count }, () => formatMac(generateMac(unicast, local), format, uppercase)));
  }, [count, format, uppercase, unicast, local]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("ui.count")}:
          <input type="number" min={1} max={100} value={count} onChange={e => setCount(Math.max(1, Math.min(100, +e.target.value)))} className="ml-2 w-20 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        </label>
        <select value={format} onChange={e => setFormat(e.target.value as MacFormat)} className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
          <option value="colon">AA:BB:CC:DD:EE:FF</option>
          <option value="dash">AA-BB-CC-DD-EE-FF</option>
          <option value="dot">AABB.CCDD.EEFF</option>
          <option value="none">AABBCCDDEEFF</option>
        </select>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} className="accent-blue-600" />
          {t("ui.uppercase")}
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" checked={unicast} onChange={e => setUnicast(e.target.checked)} className="accent-blue-600" />
          {t("ui.unicast")}
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" checked={local} onChange={e => setLocal(e.target.checked)} className="accent-blue-600" />
          {t("ui.localAdmin")}
        </label>
      </div>
      <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t("ui.generate")}</button>
      {macs.length > 0 && (
        <div className="space-y-1">
          {macs.map((mac, i) => (
            <div key={i} className="flex items-center gap-2">
              <code className="flex-1 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-700 rounded text-sm font-mono">{mac}</code>
              <button onClick={() => navigator.clipboard.writeText(mac)} className="px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-600 rounded hover:bg-zinc-300 dark:hover:bg-zinc-500 shrink-0">{t("ui.copy")}</button>
            </div>
          ))}
          <button onClick={() => navigator.clipboard.writeText(macs.join("\n"))} className="text-sm text-blue-600 hover:underline">{t("ui.copyAll")}</button>
        </div>
      )}
    </div>
  );
}
