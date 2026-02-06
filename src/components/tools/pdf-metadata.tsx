"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

interface Metadata {
  title: string;
  author: string;
  subject: string;
  creator: string;
  producer: string;
  creationDate: string;
  modDate: string;
  pages: number;
  fileSize: string;
}

export function PdfMetadata() {
  const t = useTranslations("tools.pdf-metadata.ui");
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const extract = useCallback(async (f: File) => {
    setFile(f); setMeta(null); setError(""); setLoading(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuf, { ignoreEncryption: true });
      const formatDate = (d: Date | undefined) => d ? d.toLocaleString() : "—";
      setMeta({
        title: pdf.getTitle() || "—",
        author: pdf.getAuthor() || "—",
        subject: pdf.getSubject() || "—",
        creator: pdf.getCreator() || "—",
        producer: pdf.getProducer() || "—",
        creationDate: formatDate(pdf.getCreationDate()),
        modDate: formatDate(pdf.getModificationDate()),
        pages: pdf.getPageCount(),
        fileSize: (f.size / 1024).toFixed(1) + " KB",
      });
    } catch (err) {
      console.error("PdfMetadata error:", err);
      setError(t("extractError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const rows: [string, string][] = meta ? [
    [t("title"), meta.title],
    [t("author"), meta.author],
    [t("subject"), meta.subject],
    [t("creator"), meta.creator],
    [t("producer"), meta.producer],
    [t("created"), meta.creationDate],
    [t("modified"), meta.modDate],
    [t("pages"), String(meta.pages)],
    [t("fileSize"), meta.fileSize],
  ] : [];

  return (
    <div className="space-y-6">
      {!file ? (
        <div onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) extract(e.dataTransfer.files[0]); }} className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center hover:border-primary/50">
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground">{t("formats")}</p>
          <input ref={inputRef} type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && extract(e.target.files[0])} className="hidden" />
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      ) : meta ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={label} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-medium bg-muted/30 w-1/3">{label}</td>
                    <td className="px-4 py-2.5">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => { setFile(null); setMeta(null); }} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      ) : null}
    </div>
  );
}
