"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

export function VoiceRecorder() {
  const t = useTranslations("tools.voice-recorder.ui");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const drawWaveform = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(data);
      ctx.fillStyle = getComputedStyle(canvas).getPropertyValue("--waveform-bg") || "#f1f5f9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#6366f1";
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = data[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
  }, []);

  const startRecording = useCallback(async () => {
    setError("");
    setAudioUrl("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((tr) => tr.stop());
        cancelAnimationFrame(animFrameRef.current);
        audioCtx.close();
      };

      mediaRecorder.start(100);
      setRecording(true);
      setPaused(false);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      drawWaveform();
    } catch {
      setError(t("micError"));
    }
  }, [drawWaveform, t]);

  const pauseRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (paused) {
      mr.resume();
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      setPaused(false);
      drawWaveform();
    } else {
      mr.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current);
      setPaused(true);
    }
  }, [paused, drawWaveform]);

  const stopRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    setRecording(false);
    setPaused(false);
  }, []);

  const download = useCallback(() => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `recording_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.webm`;
    a.click();
  }, [audioUrl]);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
    setDuration(0);
    setError("");
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current);
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
      <div className="flex flex-col items-center gap-6">
        <canvas
          ref={canvasRef}
          width={600}
          height={120}
          className="w-full rounded-lg bg-muted/50"
          style={{ "--waveform-bg": "transparent" } as React.CSSProperties}
        />

        <div className="text-4xl font-mono font-bold tabular-nums">
          {formatTime(duration)}
        </div>

        <div className="flex gap-3">
          {!recording && !audioUrl && (
            <button
              onClick={startRecording}
              className="py-3 px-6 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <span className="w-3 h-3 rounded-full bg-white" />
              {t("record")}
            </button>
          )}

          {recording && (
            <>
              <button
                onClick={pauseRecording}
                className="py-3 px-6 bg-yellow-500 text-white rounded-full font-medium hover:bg-yellow-600 transition-colors"
              >
                {paused ? t("resume") : t("pause")}
              </button>
              <button
                onClick={stopRecording}
                className="py-3 px-6 bg-muted text-foreground rounded-full font-medium hover:bg-muted/80 transition-colors"
              >
                {t("stop")}
              </button>
            </>
          )}
        </div>

        {audioUrl && (
          <div className="w-full space-y-4">
            <audio controls src={audioUrl} className="w-full" />
            <div className="flex gap-2 justify-center">
              <button
                onClick={download}
                className="py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                {t("download")}
              </button>
              <button
                onClick={() => { reset(); }}
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
