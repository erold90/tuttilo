"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { getFFmpeg, ffmpegFetchFile } from "@/lib/ffmpeg";
import { useFileInput } from "@/hooks/use-file-input";

const SPEEDS = [0.25, 0.5, 0.75, 1.5, 2, 4] as const;

export function ChangeVideoSpeed() {
  const t = useTranslations("tools.change-video-speed.ui");
  const [file, setFile] = useState<File | null>(null);
  const [speed, setSpeed] = useState(2);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) return;
    setError(""); setResultUrl(""); setFile(f);
  }, []);

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({ accept: "video/*", onFile: loadFile });

  const process = useCallback(async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const ffmpeg = await getFFmpeg(setProgress);
      setLoading(false); setProcessing(true);
      const ext = file.name.match(/\.\w+$/)?.[0] || ".mp4";
      await ffmpeg.writeFile("input" + ext, await ffmpegFetchFile(file));
      const pts = (1 / speed).toFixed(4);
      const atempo = speed <= 0.5 ? `atempo=${speed * 2},atempo=0.5` : speed >= 4 ? `atempo=${speed / 2},atempo=2` : `atempo=${speed}`;
      await ffmpeg.exec(["-i", "input" + ext, "-filter:v", `setpts=${pts}*PTS`, "-filter:a", atempo, "output.mp4"]);
      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([(data as Uint8Array).buffer as ArrayBuffer], { type: "video/mp4" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      await ffmpeg.deleteFile("input" + ext);
      await ffmpeg.deleteFile("output.mp4");
    } catch (err) {
      console.error("ChangeVideoSpeed error:", err);
      setError(t("processError"));
    } finally {
      setLoading(false); setProcessing(false); setProgress(0);
    }
  }, [file, speed, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.\w+$/, `_${speed}x.mp4`);
    a.click();
  }, [resultUrl, file, speed]);

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
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t("speed")}</label>
            <div className="flex flex-wrap gap-2">
              {SPEEDS.map((s) => (
                <button key={s} onClick={() => setSpeed(s)} className={`py-2 px-4 rounded-lg text-sm font-medium ${speed === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                  {s}x
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={process} disabled={loading || processing} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {loading ? t("loadingFFmpeg") : processing ? `${t("processing")} ${progress}%` : t("apply")}
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
