"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getFFmpeg, ffmpegFetchFile } from "@/lib/ffmpeg";

const FORMATS = [
  { value: "mp3", label: "MP3", mime: "audio/mpeg", ext: ".mp3" },
  { value: "wav", label: "WAV", mime: "audio/wav", ext: ".wav" },
  { value: "ogg", label: "OGG", mime: "audio/ogg", ext: ".ogg" },
  { value: "flac", label: "FLAC", mime: "audio/flac", ext: ".flac" },
  { value: "aac", label: "AAC", mime: "audio/aac", ext: ".aac" },
] as const;

type FormatValue = (typeof FORMATS)[number]["value"];

export function AudioConverter() {
  const t = useTranslations("tools.audio-converter.ui");
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<FormatValue>("mp3");
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");

  const loadFile = useCallback((f: File) => {
    setError("");
    setResultUrl("");
    setFile(f);
  }, []);

  const convert = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const ffmpeg = await getFFmpeg(setProgress);
      setLoading(false);
      setConverting(true);

      const inputName = "input" + (file.name.match(/\.\w+$/)?.[0] || ".bin");
      const fmt = FORMATS.find((f) => f.value === outputFormat)!;
      const outputName = "output" + fmt.ext;

      await ffmpeg.writeFile(inputName, await ffmpegFetchFile(file));

      const args = ["-i", inputName];
      if (outputFormat === "mp3") args.push("-codec:a", "libmp3lame", "-q:a", "2");
      else if (outputFormat === "ogg") args.push("-codec:a", "libvorbis", "-q:a", "5");
      else if (outputFormat === "flac") args.push("-codec:a", "flac");
      else if (outputFormat === "aac") args.push("-codec:a", "aac", "-b:a", "192k");
      args.push(outputName);

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([(data as Uint8Array).buffer as ArrayBuffer], { type: fmt.mime });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch {
      setError(t("convertError"));
    } finally {
      setLoading(false);
      setConverting(false);
      setProgress(0);
    }
  }, [file, outputFormat, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const fmt = FORMATS.find((f) => f.value === outputFormat)!;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.\w+$/, fmt.ext);
    a.click();
  }, [resultUrl, file, outputFormat]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setResultUrl("");
    setResultSize(0);
    setError("");
    setProgress(0);
  }, [resultUrl]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "audio/*"; input.onchange = () => input.files?.[0] && loadFile(input.files[0]); input.click(); }}
        >
          <div className="text-4xl mb-3">🔄</div>
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t("outputFormat")}</label>
            <div className="flex gap-2 flex-wrap">
              {FORMATS.map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setOutputFormat(fmt.value)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${outputFormat === fmt.value ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={convert}
            disabled={loading || converting}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? t("loadingFfmpeg") : converting ? `${t("converting")} ${progress}%` : t("convert")}
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
          <p className="font-medium">{t("done")}</p>
          <p className="text-sm text-muted-foreground">
            {formatSize(file.size)} → {formatSize(resultSize)}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={download} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
            <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}
    </div>
  );
}
