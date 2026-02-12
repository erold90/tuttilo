"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getFFmpeg, ffmpegFetchFile } from "@/lib/ffmpeg";
import { MusicNotes } from "@phosphor-icons/react";
import { useFileInput } from "@/hooks/use-file-input";

export function VideoToMp3() {
  const t = useTranslations("tools.video-to-mp3.ui");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(null);
  const [error, setError] = useState("");

  const loadVideo = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) return;
    setError("");
    setResult(null);
    setFile(f);
  }, []);

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({ accept: "video/*", onFile: loadVideo });

  const extract = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setProgress(0);
    try {
      const ffmpeg = await getFFmpeg(setProgress);
      setLoading(false);
      setConverting(true);

      const inputExt = file.name.match(/\.\w+$/)?.[0] || ".mp4";
      const inputName = "input" + inputExt;
      const outputName = "output.mp3";

      await ffmpeg.writeFile(inputName, await ffmpegFetchFile(file));
      await ffmpeg.exec(["-i", inputName, "-vn", "-codec:a", "libmp3lame", "-q:a", "2", outputName]);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([(data as Uint8Array).buffer as ArrayBuffer], { type: "audio/mpeg" });

      const baseName = file.name.replace(/\.[^.]+$/, "");
      if (result) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(blob),
        name: `${baseName}.mp3`,
        size: blob.size,
      });

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      console.error("VideoToMp3 error:", err);
      setError(t("extractError"));
    } finally {
      setLoading(false);
      setConverting(false);
      setProgress(0);
    }
  }, [file, result, t]);

  const download = useCallback(() => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.name;
    a.click();
  }, [result]);

  const reset = useCallback(() => {
    if (result) URL.revokeObjectURL(result.url);
    setFile(null);
    setResult(null);
    setProgress(0);
    setError("");
  }, [result]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <>
          <input {...fileInputProps} />
          <div
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadVideo(e.dataTransfer.files[0]); }}
            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={openFileDialog}
          >
            <MusicNotes size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-medium">{t("dropzone")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
          </div>
        </>
      ) : !result ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
          </div>

          {(loading || converting) && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <button
            onClick={extract}
            disabled={loading || converting}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? t("processing") : converting ? `${t("processing")} ${progress}%` : t("extract")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <audio controls src={result.url} className="w-full" />
          <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{result.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatSize(file.size)} → {formatSize(result.size)}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={download} className="py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                {t("download")}
              </button>
              <button onClick={reset} className="py-2 px-4 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors">
                {t("reset")}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}
    </div>
  );
}
