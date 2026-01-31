"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getFFmpeg, ffmpegFetchFile } from "@/lib/ffmpeg";

export function VideoToGif() {
  const t = useTranslations("tools.video-to-gif.ui");
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) return;
    setError("");
    setResultUrl("");
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
    setFile(f);
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoaded = () => {
      const dur = video.duration;
      if (isFinite(dur)) {
        setDuration(dur);
        setEnd(Math.min(dur, 10));
      }
    };
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [videoUrl]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const convert = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const ffmpeg = await getFFmpeg(setProgress);
      setLoading(false);
      setConverting(true);

      const ext = file.name.match(/\.\w+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;

      await ffmpeg.writeFile(inputName, await ffmpegFetchFile(file));

      // Generate palette for better GIF quality
      await ffmpeg.exec([
        "-i", inputName,
        "-ss", start.toFixed(3),
        "-to", end.toFixed(3),
        "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen`,
        "-y", "palette.png",
      ]);

      await ffmpeg.exec([
        "-i", inputName,
        "-i", "palette.png",
        "-ss", start.toFixed(3),
        "-to", end.toFixed(3),
        "-lavfi", `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
        "-loop", "0",
        "-y", "output.gif",
      ]);

      const data = await ffmpeg.readFile("output.gif");
      const blob = new Blob([(data as Uint8Array).buffer as ArrayBuffer], { type: "image/gif" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile("palette.png");
      await ffmpeg.deleteFile("output.gif");
    } catch {
      setError(t("convertError"));
    } finally {
      setLoading(false);
      setConverting(false);
      setProgress(0);
    }
  }, [file, start, end, fps, width, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.\w+$/, ".gif");
    a.click();
  }, [resultUrl, file]);

  const reset = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setVideoUrl("");
    setDuration(0);
    setStart(0);
    setEnd(0);
    setFps(10);
    setWidth(480);
    setResultUrl("");
    setResultSize(0);
    setError("");
    setProgress(0);
  }, [videoUrl, resultUrl]);

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
          onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "video/*"; input.onchange = () => input.files?.[0] && loadFile(input.files[0]); input.click(); }}
        >
          <div className="text-4xl mb-3">🎞️</div>
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
        </div>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="border rounded-xl overflow-hidden">
            <video ref={videoRef} src={videoUrl} controls className="w-full max-h-[350px]" />
          </div>

          {duration > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("start")}</label>
                  <input type="range" min={0} max={duration} step={0.1} value={start}
                    onChange={(e) => { const v = parseFloat(e.target.value); setStart(Math.min(v, end - 0.1)); if (videoRef.current) videoRef.current.currentTime = v; }}
                    className="w-full" />
                  <p className="text-xs text-muted-foreground mt-1">{formatTime(start)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("end")}</label>
                  <input type="range" min={0} max={duration} step={0.1} value={end}
                    onChange={(e) => { const v = parseFloat(e.target.value); setEnd(Math.max(v, start + 0.1)); if (videoRef.current) videoRef.current.currentTime = v; }}
                    className="w-full" />
                  <p className="text-xs text-muted-foreground mt-1">{formatTime(end)}</p>
                </div>
              </div>

              <p className="text-sm text-center text-muted-foreground">
                {t("selection")}: {formatTime(end - start)}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("fps")}</label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20].map((v) => (
                      <button key={v} onClick={() => setFps(v)}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${fps === v ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                      >{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("width")}</label>
                  <div className="flex gap-2">
                    {[320, 480, 640].map((v) => (
                      <button key={v} onClick={() => setWidth(v)}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${width === v ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                      >{v}px</button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={convert}
                disabled={loading || converting}
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {loading ? t("loadingFfmpeg") : converting ? `${t("converting")} ${progress}%` : t("convert")}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
            <div className="text-3xl">✓</div>
            <p className="font-medium">{t("done")}</p>
            <p className="text-sm text-muted-foreground">{formatSize(resultSize)}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={download} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
              <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <p className="text-xs text-muted-foreground px-3 py-2 bg-muted/50">{t("preview")}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt="GIF preview" className="w-full" />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}
    </div>
  );
}
