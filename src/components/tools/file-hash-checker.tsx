"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface HashResult { algorithm: string; hash: string; }

const ALGORITHMS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

export default function FileHashChecker() {
  const t = useTranslations("tools.file-hash-checker");
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [fileName, setFileName] = useState("");
  const [computing, setComputing] = useState(false);
  const [compareHash, setCompareHash] = useState("");

  const computeHashes = useCallback(async (file: File) => {
    setFileName(file.name);
    setComputing(true);
    setHashes([]);
    const buffer = await file.arrayBuffer();
    const results: HashResult[] = [];
    for (const algo of ALGORITHMS) {
      const hashBuffer = await crypto.subtle.digest(algo, buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      results.push({ algorithm: algo, hash: hex });
    }
    setHashes(results);
    setComputing(false);
  }, []);

  const matchResult = compareHash.trim()
    ? hashes.find(h => h.hash.toLowerCase() === compareHash.trim().toLowerCase())
    : null;

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
        onDragOver={e => { e.preventDefault(); }}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) computeHashes(f); }}
        onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.onchange = () => { if (inp.files?.[0]) computeHashes(inp.files[0]); }; inp.click(); }}
      >
        <p className="text-sm text-zinc-500">{t("ui.dropFile")}</p>
      </div>
      {fileName && <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("ui.file")}: {fileName}</p>}
      {computing && <p className="text-sm text-blue-500">{t("ui.computing")}</p>}
      {hashes.length > 0 && (
        <div className="space-y-2">
          {hashes.map(h => (
            <div key={h.algorithm} className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{h.algorithm}</span>
                <button onClick={() => navigator.clipboard.writeText(h.hash)} className="text-xs text-blue-500 hover:text-blue-600">{t("ui.copy")}</button>
              </div>
              <code className="text-xs font-mono text-zinc-600 dark:text-zinc-400 break-all">{h.hash}</code>
            </div>
          ))}
        </div>
      )}
      {hashes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("ui.compare")}</label>
          <input
            type="text" value={compareHash} onChange={e => setCompareHash(e.target.value)}
            placeholder={t("ui.pasteHash")}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-mono"
          />
          {compareHash.trim() && (
            <p className={`mt-1 text-sm font-medium ${matchResult ? "text-green-600" : "text-red-500"}`}>
              {matchResult ? `${t("ui.match")} (${matchResult.algorithm})` : t("ui.noMatch")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
