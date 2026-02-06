"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getFFmpeg, ffmpegFetchFile } from "@/lib/ffmpeg";

const FORMATS = [
  { ext: "mp4", mime: "video/mp4" },
  { ext: "webm", mime: "video/webm" },
  { ext: "avi", mime: "video/x-msvideo" },
  { ext: "mov", mime: "video/quicktime" },
] as const;

type Format = (typeof FORMATS)[number]["ext"];

export function VideoConverter() {
  const t = useTranslations("tools.video-converter.ui");
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>("mp4");
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) return;
    setError(""); setResultUrl(""); setFile(f);
  }, []);

  const convert = useCallback(async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const ffmpeg = await getFFmpeg(setProgress);
      setLoading(false); setConverting(true);
      const ext = file.name.match(/\.\w+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = "output." + format;
      await ffmpeg.writeFile(inputName, await ffmpegFetchFile(file));

      const args = ["-i", inputName];
      if (format === "mp4") args.push("-c:v", "libx264", "-preset", "fast", "-c:a", "aac", "-movflags", "+faststart");
      else if (format === "webm") args.push("-c:v", "libvpx", "-c:a", "libvorbis", "-b:v", "1M");
      else args.push("-c:v", "mpeg4", "-c:a", "aac");
      args.push(outputName);

      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile(outputName);
      const mime = FORMATS.find((f) => f.ext === format)?.mime || "video/mp4";
      const blob = new Blob([(data as Uint8Array).buffer as ArrayBuffer], { type: mime });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      console.error("VideoConverter error:", err);
      setError(t("convertError"));
    } finally {
      setLoading(false); setConverting(false); setProgress(0);
    }
  }, [file, format, resultUrl, t]);

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
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "video/*"; i.onchange = () => i.files?.[0] && loadFile(i.files[0]); i.click(); }}
          className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 cursor-pointer"
        >
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground">{t("formats")}</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t("outputFormat")}</label>
            <div className="flex gap-2">
              {FORMATS.map((f) => (
                <button key={f.ext} onClick={() => setFormat(f.ext)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${format === f.ext ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                  {f.ext.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={convert} disabled={loading || converting} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {loading ? t("loadingFFmpeg") : converting ? `${t("converting")} ${progress}%` : t("convert")}
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
