"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";

function makeCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(data: Uint8Array): string {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, "0").toUpperCase();
}

export default function Crc32Checker() {
  const t = useTranslations("tools.crc32-checker.ui");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const hashText = () => {
    const enc = new TextEncoder();
    setResult(crc32(enc.encode(text)));
    setFileName("");
  };

  const hashFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { setResult(t("fileTooLarge")); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      setResult(crc32(data));
    };
    reader.readAsArrayBuffer(file);
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">{t("inputText")}</label>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder={t("placeholder")}
          rows={4} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none resize-none" />
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={hashText} disabled={!text}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
          {t("hashText")}
        </button>
        <button onClick={() => fileRef.current?.click()}
          className="rounded-xl border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors">
          {t("hashFile")}
        </button>
        <input ref={fileRef} type="file" onChange={hashFile} className="hidden" />
      </div>

      {fileName && <p className="text-sm text-muted-foreground">{t("file")}: {fileName}</p>}

      {result && (
        <div>
          <label className="mb-2 block text-sm font-medium">{t("result")}</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-border bg-muted/50 p-3 font-mono text-lg tracking-wider">{result}</code>
            <button onClick={copy} className="shrink-0 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
