"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { processVideo, getVideoExtension } from "@/lib/video-process";
import { useFileInput } from "@/hooks/use-file-input";

type RotationKey = "90" | "180" | "270" | "hflip" | "vflip";

const ROTATIONS: { key: RotationKey }[] = [
  { key: "90" },
  { key: "180" },
  { key: "270" },
  { key: "hflip" },
  { key: "vflip" },
];

export function RotateVideo() {
  const t = useTranslations("tools.rotate-video.ui");
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<RotationKey>("90");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) return;
    setError(""); setResultUrl(""); setFile(f);
  }, []);

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({ accept: "video/*", onFile: loadFile });

  const rotate = useCallback(async () => {
    if (!file) return;
    setProcessing(true); setError(""); setProgress(0);
    try {
      const swapDims = rotation === "90" || rotation === "270";

      const result = await processVideo(file, {
        canvasSize: (video) => {
          const w = video.videoWidth || 1280;
          const h = video.videoHeight || 720;
          return swapDims ? { width: h, height: w } : { width: w, height: h };
        },
        drawFrame: (ctx, video, canvas) => {
          const vw = video.videoWidth || 1280;
          const vh = video.videoHeight || 720;
          ctx.save();
          switch (rotation) {
            case "90":
              ctx.translate(canvas.width, 0);
              ctx.rotate(Math.PI / 2);
              ctx.drawImage(video, 0, 0, vw, vh);
              break;
            case "180":
              ctx.translate(canvas.width, canvas.height);
              ctx.rotate(Math.PI);
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              break;
            case "270":
              ctx.translate(0, canvas.height);
              ctx.rotate(-Math.PI / 2);
              ctx.drawImage(video, 0, 0, vw, vh);
              break;
            case "hflip":
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              break;
            case "vflip":
              ctx.translate(0, canvas.height);
              ctx.scale(1, -1);
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              break;
          }
          ctx.restore();
        },
      }, setProgress);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(result.blob));
    } catch (err) {
      console.error("RotateVideo error:", err);
      setError(t("processError"));
    } finally {
      setProcessing(false); setProgress(0);
    }
  }, [file, rotation, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const ext = getVideoExtension();
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.\w+$/, `_rotated.${ext}`);
    a.click();
  }, [resultUrl, file]);

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
            <label className="block text-sm font-medium mb-2">{t("rotation")}</label>
            <div className="flex flex-wrap gap-2">
              {ROTATIONS.map((r) => (
                <button key={r.key} onClick={() => setRotation(r.key)} className={`py-2 px-4 rounded-lg text-sm font-medium ${rotation === r.key ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                  {t(`rot_${r.key}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={rotate} disabled={processing} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {processing ? `${t("processing")} ${progress}%` : t("rotate")}
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
