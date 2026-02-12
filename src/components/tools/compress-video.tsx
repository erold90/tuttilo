"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { compressVideo } from "@/lib/video-compress";
import { VideoCamera } from "@phosphor-icons/react";
import { useFileInput } from "@/hooks/use-file-input";

const QUALITY_PRESETS = [
  { key: "high", factor: 0.6 },   // 40% smaller
  { key: "medium", factor: 0.35 }, // 65% smaller
  { key: "low", factor: 0.15 },    // 85% smaller
] as const;

type QualityKey = (typeof QUALITY_PRESETS)[number]["key"];

export function CompressVideo() {
  const t = useTranslations("tools.compress-video.ui");
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<QualityKey>("medium");
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [resultExt, setResultExt] = useState("mp4");
  const [error, setError] = useState("");

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) return;
    setError("");
    setResultUrl("");
    setFile(f);
  }, []);

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({ accept: "video/*", onFile: loadFile });

  const compress = useCallback(async () => {
    if (!file) return;
    setCompressing(true);
    setError("");
    setProgress(0);
    try {
      const preset = QUALITY_PRESETS.find((p) => p.key === quality)!;
      const result = await compressVideo(file, preset.factor, setProgress);
      if (result.blob.size === 0) throw new Error("Output file is empty");
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(result.blob));
      setResultSize(result.blob.size);
      setResultExt(result.extension);
    } catch (err) {
      console.error("CompressVideo error:", err);
      setError(t("compressError"));
    } finally {
      setCompressing(false);
      setProgress(0);
    }
  }, [file, quality, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.\w+$/, `_compressed.${resultExt}`);
    a.click();
  }, [resultUrl, file, resultExt]);

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

  const reduction = file && resultSize > 0
    ? Math.round((1 - resultSize / file.size) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {!file ? (
        <>
          <input {...fileInputProps} />
          <div
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={openFileDialog}
          >
            <VideoCamera size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-medium">{t("dropzone")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
          </div>
        </>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t("quality")}</label>
            <div className="flex gap-2">
              {QUALITY_PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setQuality(p.key)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${quality === p.key ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                >
                  {t(`quality_${p.key}`)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={compress}
            disabled={compressing}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {compressing ? `${t("compressing")} ${progress}%` : t("compress")}
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
          <p className="font-medium">{t("done")}</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{t("original")}: {formatSize(file.size)}</p>
            <p>{t("compressed")}: {formatSize(resultSize)}</p>
            {reduction > 0 && <p className="text-green-600 font-medium">-{reduction}%</p>}
          </div>
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
