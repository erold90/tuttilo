"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { processVideo, getVideoExtension } from "@/lib/video-process";
import { useFileInput } from "@/hooks/use-file-input";

const PRESETS = [
  { label: "480p", w: 854, h: 480 },
  { label: "720p", w: 1280, h: 720 },
  { label: "1080p", w: 1920, h: 1080 },
  { label: "Instagram", w: 1080, h: 1080 },
  { label: "TikTok", w: 1080, h: 1920 },
] as const;

export function ResizeVideo() {
  const t = useTranslations("tools.resize-video.ui");
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) return;
    setError(""); setResultUrl(""); setFile(f);
  }, []);

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({ accept: "video/*", onFile: loadFile });

  const resize = useCallback(async () => {
    if (!file) return;
    setProcessing(true); setError(""); setProgress(0);
    try {
      const w = width % 2 === 0 ? width : width + 1;
      const h = height % 2 === 0 ? height : height + 1;
      const result = await processVideo(file, {
        canvasSize: () => ({ width: w, height: h }),
      }, setProgress);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(result.blob));
    } catch (err) {
      console.error("ResizeVideo error:", err);
      setError(t("processError"));
    } finally {
      setProcessing(false); setProgress(0);
    }
  }, [file, width, height, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const ext = getVideoExtension();
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.\w+$/, `_${width}x${height}.${ext}`);
    a.click();
  }, [resultUrl, file, width, height]);

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
            <label className="block text-sm font-medium mb-2">{t("presets")}</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => { setWidth(p.w); setHeight(p.h); }} className={`py-2 px-3 rounded-lg text-xs font-medium ${width === p.w && height === p.h ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                  {p.label} ({p.w}x{p.h})
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">{t("width")}</label>
              <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <span className="pb-2 text-muted-foreground">x</span>
            <div>
              <label className="block text-xs font-medium mb-1">{t("height")}</label>
              <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={resize} disabled={processing} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {processing ? `${t("processing")} ${progress}%` : t("resize")}
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
