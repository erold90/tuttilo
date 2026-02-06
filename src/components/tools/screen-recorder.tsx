"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

export function ScreenRecorder() {
  const t = useTranslations("tools.screen-recorder.ui");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [includeAudio, setIncludeAudio] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const startRecording = useCallback(async () => {
    setError("");
    setVideoUrl("");
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: includeAudio,
      });
      streamRef.current = displayStream;

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = displayStream;
        videoPreviewRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(displayStream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
        displayStream.getTracks().forEach((tr) => tr.stop());
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
      };

      displayStream.getVideoTracks()[0].addEventListener("ended", () => {
        stopRecording();
      });

      mediaRecorder.start(100);
      setRecording(true);
      setPaused(false);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      console.error("ScreenRecorder error:", err);
      setError(t("screenError"));
    }
  }, [includeAudio, t]);

  const pauseRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (paused) {
      mr.resume();
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      setPaused(false);
    } else {
      mr.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setPaused(true);
    }
  }, [paused]);

  const stopRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    setPaused(false);
  }, []);

  const download = useCallback(() => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `screen_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.webm`;
    a.click();
  }, [videoUrl]);

  const reset = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl("");
    setDuration(0);
    setError("");
  }, [videoUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6">
      {recording && (
        <div className="rounded-lg overflow-hidden bg-black aspect-video">
          <video ref={videoPreviewRef} muted className="w-full h-full object-contain" />
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        {recording && (
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-4xl font-mono font-bold tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        )}

        {!recording && !videoUrl && (
          <div className="space-y-4 w-full">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAudio}
                onChange={(e) => setIncludeAudio(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm">{t("includeAudio")}</span>
            </label>
            <button
              onClick={startRecording}
              className="w-full py-3 px-6 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <span className="w-3 h-3 rounded-full bg-white" />
              {t("startRecording")}
            </button>
          </div>
        )}

        {recording && (
          <div className="flex gap-3">
            <button
              onClick={pauseRecording}
              className="py-3 px-6 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
            >
              {paused ? t("resume") : t("pause")}
            </button>
            <button
              onClick={stopRecording}
              className="py-3 px-6 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
            >
              {t("stop")}
            </button>
          </div>
        )}

        {videoUrl && (
          <div className="w-full space-y-4">
            <video controls src={videoUrl} className="w-full rounded-lg" />
            <div className="flex gap-2 justify-center">
              <button
                onClick={download}
                className="py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                {t("download")}
              </button>
              <button
                onClick={reset}
                className="py-2 px-4 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
              >
                {t("newRecording")}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}
    </div>
  );
}
