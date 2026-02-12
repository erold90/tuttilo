"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { getFFmpeg, ffmpegFetchFile } from "@/lib/ffmpeg";
import { useFileInput } from "@/hooks/use-file-input";
import {
  Scissors,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  DownloadSimple,
  ArrowCounterClockwise,
  Upload,
  Check,
  FrameCorners,
} from "@phosphor-icons/react";

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */
const THUMBNAIL_COUNT = 20;
const HANDLE_WIDTH = 14;
const MIN_SELECTION = 0.2; // seconds

/* ═══════════════════════════════════════════════
   FILMSTRIP THUMBNAIL EXTRACTION
   ═══════════════════════════════════════════════ */
function useFilmstrip(videoUrl: string, duration: number) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    if (!videoUrl || duration <= 0) return;

    let cancelled = false;
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "auto";
    video.src = videoUrl;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const thumbWidth = 120;
    const thumbHeight = 68;
    canvas.width = thumbWidth;
    canvas.height = thumbHeight;

    const frames: string[] = [];
    const count = Math.min(THUMBNAIL_COUNT, Math.max(8, Math.ceil(duration)));
    let index = 0;

    const captureFrame = () => {
      if (cancelled) return;
      ctx.drawImage(video, 0, 0, thumbWidth, thumbHeight);
      frames.push(canvas.toDataURL("image/jpeg", 0.5));
      index++;
      if (index < count) {
        video.currentTime = (index / count) * duration;
      } else {
        setThumbnails(frames);
      }
    };

    video.addEventListener("seeked", captureFrame);
    video.addEventListener("loadeddata", () => {
      if (!cancelled) video.currentTime = 0;
    });

    return () => {
      cancelled = true;
      video.removeEventListener("seeked", captureFrame);
      video.src = "";
    };
  }, [videoUrl, duration]);

  return thumbnails;
}

/* ═══════════════════════════════════════════════
   FORMAT HELPERS
   ═══════════════════════════════════════════════ */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${m}:${s.toString().padStart(2, "0")}.${ms}`;
}

function formatTimeFull(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseTimeInput(str: string): number | null {
  const parts = str.split(":");
  if (parts.length === 2) {
    const [m, sms] = parts;
    const [s, ms] = (sms || "0").split(".");
    return (parseInt(m) || 0) * 60 + (parseInt(s) || 0) + (parseInt(ms) || 0) / (ms?.length === 1 ? 10 : 100);
  }
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/* ═══════════════════════════════════════════════
   TIMELINE COMPONENT
   ═══════════════════════════════════════════════ */
function Timeline({
  duration,
  start,
  end,
  currentTime,
  thumbnails,
  onStartChange,
  onEndChange,
  onSeek,
}: {
  duration: number;
  start: number;
  end: number;
  currentTime: number;
  thumbnails: string[];
  onStartChange: (v: number) => void;
  onEndChange: (v: number) => void;
  onSeek: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"start" | "end" | "playhead" | null>(null);

  const toPercent = (v: number) => (v / duration) * 100;
  const fromX = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * duration;
  };

  const handlePointerDown = useCallback(
    (type: "start" | "end" | "playhead") => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragging.current = type;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const time = fromX(e.clientX);
      if (dragging.current === "start") {
        onStartChange(Math.min(time, end - MIN_SELECTION));
      } else if (dragging.current === "end") {
        onEndChange(Math.max(time, start + MIN_SELECTION));
      } else {
        onSeek(time);
      }
    },
    [start, end, onStartChange, onEndChange, onSeek]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = null;
  }, []);

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (dragging.current) return;
      const time = fromX(e.clientX);
      onSeek(time);
    },
    [onSeek]
  );

  const startPct = toPercent(start);
  const endPct = toPercent(end);
  const playheadPct = toPercent(currentTime);

  return (
    <div className="space-y-2">
      {/* Time ruler */}
      <div className="relative h-5 select-none" style={{ marginLeft: 0, marginRight: 0 }}>
        {Array.from({ length: Math.min(11, Math.ceil(duration) + 1) }, (_, i) => {
          const time = (i / Math.min(10, Math.ceil(duration))) * duration;
          const pct = toPercent(time);
          return (
            <span
              key={i}
              className="absolute text-[10px] text-muted-foreground/60 -translate-x-1/2"
              style={{ left: `${pct}%` }}
            >
              {formatTime(time)}
            </span>
          );
        })}
      </div>

      {/* Timeline track */}
      <div
        ref={trackRef}
        className="relative h-16 rounded-lg overflow-hidden cursor-pointer select-none"
        style={{ touchAction: "none" }}
        onClick={handleTrackClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Filmstrip thumbnails */}
        <div className="absolute inset-0 flex">
          {thumbnails.length > 0
            ? thumbnails.map((thumb, i) => (
                <img
                  key={i}
                  src={thumb}
                  alt=""
                  className="h-full flex-1 object-cover"
                  draggable={false}
                />
              ))
            : (
              <div className="w-full h-full bg-muted/30 animate-pulse" />
            )}
        </div>

        {/* Dimmed overlay — before start */}
        <div
          className="absolute inset-y-0 left-0 bg-black/60 pointer-events-none"
          style={{ width: `${startPct}%` }}
        />

        {/* Dimmed overlay — after end */}
        <div
          className="absolute inset-y-0 right-0 bg-black/60 pointer-events-none"
          style={{ width: `${100 - endPct}%` }}
        />

        {/* Selected region border */}
        <div
          className="absolute inset-y-0 border-y-2 border-amber-400 pointer-events-none"
          style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
        />

        {/* Start handle */}
        <div
          className="absolute inset-y-0 z-10 flex items-center group"
          style={{ left: `${startPct}%`, transform: "translateX(-50%)", width: HANDLE_WIDTH * 2, cursor: "ew-resize" }}
          onPointerDown={handlePointerDown("start")}
        >
          <div className="w-[6px] h-full bg-amber-400 rounded-l-sm flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.4)] group-hover:bg-amber-300 transition-colors" style={{ marginLeft: "50%" }}>
            <div className="w-[2px] h-6 bg-amber-900/40 rounded-full" />
          </div>
        </div>

        {/* End handle */}
        <div
          className="absolute inset-y-0 z-10 flex items-center group"
          style={{ left: `${endPct}%`, transform: "translateX(-50%)", width: HANDLE_WIDTH * 2, cursor: "ew-resize" }}
          onPointerDown={handlePointerDown("end")}
        >
          <div className="w-[6px] h-full bg-amber-400 rounded-r-sm flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.4)] group-hover:bg-amber-300 transition-colors" style={{ marginRight: "50%" }}>
            <div className="w-[2px] h-6 bg-amber-900/40 rounded-full" />
          </div>
        </div>

        {/* Playhead */}
        <div
          className="absolute inset-y-0 z-20 flex flex-col items-center"
          style={{ left: `${playheadPct}%`, transform: "translateX(-50%)", width: 20, cursor: "ew-resize" }}
          onPointerDown={handlePointerDown("playhead")}
        >
          {/* Triangle marker on top */}
          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-cyan-400" />
          {/* Line */}
          <div className="w-[2px] flex-1 bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TIME INPUT
   ═══════════════════════════════════════════════ */
function TimeInput({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");

  const commit = () => {
    const parsed = parseTimeInput(text);
    if (parsed !== null && parsed >= 0 && parsed <= max) {
      onChange(parsed);
    }
    setEditing(false);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">{label}</span>
      {editing ? (
        <input
          autoFocus
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          className="w-24 text-center text-sm font-mono bg-muted/50 border border-muted-foreground/20 rounded px-2 py-1 focus:border-cyan-500 focus:outline-none"
        />
      ) : (
        <button
          onClick={() => { setText(formatTimeFull(value)); setEditing(true); }}
          className="text-sm font-mono text-foreground hover:text-cyan-400 transition-colors cursor-text px-2 py-1 rounded hover:bg-muted/50"
        >
          {formatTimeFull(value)}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export function TrimVideo() {
  const t = useTranslations("tools.trim-video.ui");
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trimming, setTrimming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const thumbnails = useFilmstrip(videoUrl, duration);

  const selectionDuration = useMemo(() => Math.max(0, end - start), [start, end]);

  /* ── File loading ── */
  const loadFile = useCallback(
    (f: File) => {
      if (!f.type.startsWith("video/")) return;
      setError("");
      setResultUrl("");
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      const url = URL.createObjectURL(f);
      setVideoUrl(url);
      setFile(f);
    },
    [videoUrl]
  );

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({ accept: "video/*", onFile: loadFile });

  /* ── Video metadata ── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoaded = () => {
      const dur = video.duration;
      if (isFinite(dur)) {
        setDuration(dur);
        setEnd(dur);
        setStart(0);
      }
    };
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [videoUrl]);

  /* ── Sync video time + constrain to selection ── */
  const startRef = useRef(start);
  const endRef = useRef(end);
  startRef.current = start;
  endRef.current = end;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => {
      const t = video.currentTime;
      setCurrentTime(t);
      // Stop at end of selection
      if (t >= endRef.current) {
        video.pause();
        video.currentTime = endRef.current;
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [videoUrl]);

  /* ── Player controls ── */
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      // If current time is outside selection or at end, jump to start of selection
      if (video.currentTime < startRef.current || video.currentTime >= endRef.current - 0.05) {
        video.currentTime = startRef.current;
      }
      video.play();
    } else {
      video.pause();
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.max(0, Math.min(duration, time));
  }, [duration]);

  const skipBack = useCallback(() => seekTo((videoRef.current?.currentTime ?? 0) - 5), [seekTo]);
  const skipForward = useCallback(() => seekTo((videoRef.current?.currentTime ?? 0) + 5), [seekTo]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    if (!file || resultUrl) return;
    const handler = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - (e.shiftKey ? 0.1 : 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(duration, video.currentTime + (e.shiftKey ? 0.1 : 1));
          break;
        case "i":
        case "I":
          setStart(video.currentTime);
          break;
        case "o":
        case "O":
          setEnd(video.currentTime);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [file, resultUrl, duration, togglePlay]);

  /* ── FFmpeg trim ── */
  const trim = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const ffmpeg = await getFFmpeg(setProgress);
      setLoading(false);
      setTrimming(true);

      const ext = file.name.match(/\.\w+$/)?.[0] || ".mp4";
      const inputName = "input" + ext;
      const outputName = "output" + ext;
      const dur = (end - start).toFixed(3);

      await ffmpeg.writeFile(inputName, await ffmpegFetchFile(file));

      // Use -c copy (stream copy) — fast and doesn't require libx264/aac encoders
      // -ss before -i for fast keyframe seek, -t for duration
      await ffmpeg.exec([
        "-ss", start.toFixed(3),
        "-i", inputName,
        "-t", dur,
        "-c", "copy",
        "-avoid_negative_ts", "make_zero",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([(data as Uint8Array).buffer as ArrayBuffer], { type: file.type || "video/mp4" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      console.error("TrimVideo error:", err);
      setError(t("trimError"));
    } finally {
      setLoading(false);
      setTrimming(false);
      setProgress(0);
    }
  }, [file, start, end, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.\w+$/, "_trimmed.mp4");
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
    setCurrentTime(0);
    setIsPlaying(false);
    setResultUrl("");
    setResultSize(0);
    setError("");
    setProgress(0);
  }, [videoUrl, resultUrl]);

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */

  // ── Upload state ──
  if (!file) {
    return (
      <div className="space-y-6">
        <input {...fileInputProps} />
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-cyan-500", "bg-cyan-500/5"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("border-cyan-500", "bg-cyan-500/5"); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-cyan-500", "bg-cyan-500/5"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-2xl p-12 text-center hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer group"
          onClick={openFileDialog}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 mb-4 group-hover:bg-cyan-500/20 transition-colors">
            <Upload size={32} weight="duotone" className="text-cyan-500" />
          </div>
          <p className="text-lg font-semibold">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground mt-2">{t("dropzoneHint")}</p>
          <p className="text-xs text-muted-foreground/50 mt-3">MP4, WebM, MOV — max 500 MB</p>
        </div>
      </div>
    );
  }

  // ── Result state ──
  if (resultUrl) {
    return (
      <div className="space-y-5">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check size={20} weight="bold" className="text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold">{t("done")}</p>
                <p className="text-sm text-muted-foreground">
                  {formatSize(resultSize)} — {formatTime(selectionDuration)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={download}
                className="flex items-center gap-2 py-2.5 px-5 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors"
              >
                <DownloadSimple size={18} weight="bold" />
                {t("download")}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 py-2.5 px-5 bg-muted rounded-xl font-medium hover:bg-muted/80 transition-colors"
              >
                <ArrowCounterClockwise size={18} />
                {t("reset")}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-muted-foreground/10">
          <video src={resultUrl} controls className="w-full max-h-[460px] bg-black" />
        </div>
      </div>
    );
  }

  // ── Editor state ──
  return (
    <div ref={containerRef} className="space-y-4">
      {/* Video preview */}
      <div className="rounded-2xl overflow-hidden border border-muted-foreground/10 bg-black relative">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full max-h-[400px] mx-auto"
          onClick={togglePlay}
          playsInline
        />
        {/* Play overlay on pause */}
        {!isPlaying && duration > 0 && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play size={28} weight="fill" className="text-white ml-1" />
            </div>
          </button>
        )}
      </div>

      {duration > 0 && (
        <>
          {/* Player controls bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1">
              <button onClick={skipBack} className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground" title="-5s">
                <SkipBack size={18} weight="bold" />
              </button>
              <button onClick={togglePlay} className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors text-cyan-400" title="Space">
                {isPlaying ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
              </button>
              <button onClick={skipForward} className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground" title="+5s">
                <SkipForward size={18} weight="bold" />
              </button>
            </div>

            <span className="text-xs font-mono text-muted-foreground">
              {formatTimeFull(currentTime)} / {formatTimeFull(duration)}
            </span>
          </div>

          {/* Timeline with filmstrip */}
          <Timeline
            duration={duration}
            start={start}
            end={end}
            currentTime={currentTime}
            thumbnails={thumbnails}
            onStartChange={setStart}
            onEndChange={setEnd}
            onSeek={seekTo}
          />

          {/* Time inputs + selection info */}
          <div className="flex items-center justify-between px-1">
            <TimeInput label={t("start")} value={start} onChange={(v) => setStart(Math.min(v, end - MIN_SELECTION))} max={duration} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">{t("selection")}</span>
              <span className="text-sm font-mono text-cyan-400 font-semibold">{formatTimeFull(selectionDuration)}</span>
            </div>
            <TimeInput label={t("end")} value={end} onChange={(v) => setEnd(Math.max(v, start + MIN_SELECTION))} max={duration} />
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-[10px] text-muted-foreground/40">
            <span><kbd className="px-1 py-0.5 rounded bg-muted/50 font-mono text-[9px]">Space</kbd> play/pause</span>
            <span><kbd className="px-1 py-0.5 rounded bg-muted/50 font-mono text-[9px]">←→</kbd> ±1s</span>
            <span><kbd className="px-1 py-0.5 rounded bg-muted/50 font-mono text-[9px]">I</kbd> set start</span>
            <span><kbd className="px-1 py-0.5 rounded bg-muted/50 font-mono text-[9px]">O</kbd> set end</span>
          </div>

          {/* Trim button */}
          <button
            onClick={trim}
            disabled={loading || trimming || selectionDuration < MIN_SELECTION}
            className="w-full py-3.5 px-4 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>{t("loadingFfmpeg")}</>
            ) : trimming ? (
              <>
                <div className="w-full bg-cyan-800/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-white h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <span className="ml-2 shrink-0">{progress}%</span>
              </>
            ) : (
              <>
                <Scissors size={20} weight="bold" />
                {t("trim")}
              </>
            )}
          </button>
        </>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-sm">{error}</div>
      )}
    </div>
  );
}
