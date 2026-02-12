"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { processVideo } from "@/lib/video-process";
import { useFileInput } from "@/hooks/use-file-input";

interface OutputFormat {
  ext: string;
  label: string;
  mimeType: string;
}

export function VideoConverter() {
  const t = useTranslations("tools.video-converter.ui");
  const [file, setFile] = useState<File | null>(null);
  const [formats, setFormats] = useState<OutputFormat[]>([]);
  const [format, setFormat] = useState("");
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const available: OutputFormat[] = [];
    if (typeof MediaRecorder !== "undefined") {
      if (MediaRecorder.isTypeSupported("video/mp4")) {
        available.push({ ext: "mp4", label: "MP4", mimeType: "video/mp4" });
      }
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") || MediaRecorder.isTypeSupported("video/webm")) {
        available.push({ ext: "webm", label: "WebM", mimeType: "video/webm" });
      }
    }
    if (available.length === 0) {
      available.push({ ext: "webm", label: "WebM", mimeType: "video/webm" });
    }
    setFormats(available);
    setFormat(available[0].ext);
  }, []);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) return;
    setError(""); setResultUrl(""); setFile(f);
  }, []);

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({ accept: "video/*", onFile: loadFile });

  const convert = useCallback(async () => {
    if (!file || !format) return;
    setConverting(true); setError(""); setProgress(0);
    try {
      const fmt = formats.find((f) => f.ext === format);
      const result = await processVideo(file, {
        outputFormat: fmt ? { mimeType: fmt.mimeType, extension: fmt.ext } : undefined,
      }, setProgress);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(result.blob));
    } catch (err) {
      console.error("VideoConverter error:", err);
      setError(t("convertError"));
    } finally {
      setConverting(false); setProgress(0);
    }
  }, [file, format, formats, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.\w+$/, "." + format);
    a.click();
  }, [resultUrl, file, format]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setResultUrl(""); setError(""); setProgress(0);
  }, [resultUrl]);

  return (
    <div className="space-y-6">
      {!file ? (
        <>
          <input {...fileInputProps} />
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
            onClick={openFileDialog}
            className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 cursor-pointer"
          >
            <p className="text-lg font-medium">{t("dropzone")}</p>
            <p className="text-sm text-muted-foreground">{t("formats")}</p>
          </div>
        </>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          {formats.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">{t("outputFormat")}</label>
              <div className="flex gap-2">
                {formats.map((f) => (
                  <button key={f.ext} onClick={() => setFormat(f.ext)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${format === f.ext ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={convert} disabled={converting} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {converting ? `${t("converting")} ${progress}%` : t("convert")}
            </button>
            <button onClick={reset} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-green-500 font-medium">{t("done")}</p>
          <div className="flex gap-2">
            <button onClick={download} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("download")}</button>
            <button onClick={reset} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
