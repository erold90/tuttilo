"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

export function ImageToText() {
  const t = useTranslations("tools.image-to-text.ui");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const recognize = useCallback(async (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setText("");
    setLoading(true);
    setProgress(0);

    try {
      const Tesseract = await import("tesseract.js");
      const result = await Tesseract.recognize(f, "eng+ita+fra+deu+spa+por", {
        logger: (m: { progress: number }) => {
          if (m.progress) setProgress(Math.round(m.progress * 100));
        },
      });
      setText(result.data.text);
    } catch (err) {
      setText("Error: " + (err instanceof Error ? err.message : "OCR failed"));
    } finally {
      setLoading(false);
    }
  }, []);

  const copy = useCallback(() => navigator.clipboard.writeText(text), [text]);

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) recognize(e.dataTransfer.files[0]); }}
          className="cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center hover:border-primary/50"
        >
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground">{t("formats")}</p>
          <input ref={inputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && recognize(e.target.files[0])} className="hidden" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <img src={preview} alt="Source" className="max-h-72 rounded-lg border border-border" />
              <button onClick={() => { setFile(null); setText(""); setPreview(""); }} className="mt-2 text-sm text-red-400 hover:underline">{t("remove")}</button>
            </div>
            <div>
              {loading ? (
                <div className="flex h-full flex-col items-center justify-center rounded-lg border border-border bg-card p-6">
                  <div className="mb-3 text-sm text-muted-foreground">{t("processing")} {progress}%</div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : text ? (
                <div>
                  <textarea value={text} onChange={(e) => setText(e.target.value)} className="h-64 w-full rounded-lg border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none" />
                  <button onClick={copy} className="mt-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("copy")}</button>
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
