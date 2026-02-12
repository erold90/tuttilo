"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MusicNotes } from "@phosphor-icons/react";
import { useFileInput } from "@/hooks/use-file-input";

function encodeWav(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length * numChannels * 2;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + length, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, length, true);

  let offset = 44;
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(audioBuffer.getChannelData(ch));
  }

  for (let i = 0; i < audioBuffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export function AudioCutter() {
  const t = useTranslations("tools.audio-cutter.ui");
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const drawWaveform = useCallback((buffer: AudioBuffer, start: number, end: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const data = buffer.getChannelData(0);
    const { width, height } = canvas;

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, width, height);

    const startX = (start / buffer.duration) * width;
    const endX = (end / buffer.duration) * width;
    ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
    ctx.fillRect(startX, 0, endX - startX, height);

    const step = Math.ceil(data.length / width);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < width; i++) {
      const idx = Math.floor((i / width) * data.length);
      let min = 1.0, max = -1.0;
      for (let j = 0; j < step; j++) {
        const val = data[idx + j] || 0;
        if (val < min) min = val;
        if (val > max) max = val;
      }
      const x = i;
      const isSelected = x >= startX && x <= endX;
      if (isSelected) ctx.strokeStyle = "#6366f1";
      else ctx.strokeStyle = "#475569";

      ctx.beginPath();
      ctx.moveTo(x + 0.5, ((1 + min) / 2) * height);
      ctx.lineTo(x + 0.5, ((1 + max) / 2) * height);
      ctx.stroke();
    }

    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, height);
    ctx.stroke();

    ctx.strokeStyle = "#6366f1";
    ctx.beginPath();
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX, height);
    ctx.stroke();
  }, []);

  const loadAudio = useCallback(async (f: File) => {
    setError("");
    setResult(null);
    setFile(f);
    try {
      const arrayBuffer = await f.arrayBuffer();
      audioCtxRef.current?.close();
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      setStartTime(0);
      setEndTime(buffer.duration);
      requestAnimationFrame(() => drawWaveform(buffer, 0, buffer.duration));
    } catch (err) {
      console.error("AudioCutter error:", err);
      setError(t("loadError"));
    }
  }, [drawWaveform, t]);

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({
    accept: "audio/*",
    onFile: loadAudio,
  });

  useEffect(() => {
    if (audioBuffer) drawWaveform(audioBuffer, startTime, endTime);
  }, [audioBuffer, startTime, endTime, drawWaveform]);

  const playPreview = useCallback(() => {
    if (!audioBuffer) return;
    if (playing) {
      audioSourceRef.current?.stop();
      setPlaying(false);
      return;
    }
    const ctx = audioCtxRef.current || new AudioContext();
    audioCtxRef.current = ctx;
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.onended = () => setPlaying(false);
    source.start(0, startTime, endTime - startTime);
    audioSourceRef.current = source;
    setPlaying(true);
  }, [audioBuffer, startTime, endTime, playing]);

  const cut = useCallback(async () => {
    if (!audioBuffer) return;
    setProcessing(true);
    setError("");
    try {
      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const length = endSample - startSample;
      const numChannels = audioBuffer.numberOfChannels;

      const offlineCtx = new OfflineAudioContext(numChannels, length, sampleRate);
      const newBuffer = offlineCtx.createBuffer(numChannels, length, sampleRate);

      for (let ch = 0; ch < numChannels; ch++) {
        const sourceData = audioBuffer.getChannelData(ch);
        const targetData = newBuffer.getChannelData(ch);
        for (let i = 0; i < length; i++) {
          targetData[i] = sourceData[startSample + i];
        }
      }

      const wavBlob = encodeWav(newBuffer);
      const baseName = file?.name.replace(/\.[^.]+$/, "") || "audio";
      setResult({
        url: URL.createObjectURL(wavBlob),
        name: `${baseName}_cut.wav`,
        size: wavBlob.size,
      });
    } catch (err) {
      console.error("AudioCutter error:", err);
      setError(t("cutError"));
    } finally {
      setProcessing(false);
    }
  }, [audioBuffer, startTime, endTime, file, t]);

  const download = useCallback(() => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.name;
    a.click();
  }, [result]);

  const reset = useCallback(() => {
    if (result) URL.revokeObjectURL(result.url);
    audioSourceRef.current?.stop();
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setFile(null);
    setAudioBuffer(null);
    setResult(null);
    setStartTime(0);
    setEndTime(0);
    setPlaying(false);
    setError("");
  }, [result]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(1);
    return `${m}:${s.padStart(4, "0")}`;
  };

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
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadAudio(e.dataTransfer.files[0]); }}
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
            {audioBuffer && (
              <p className="text-sm text-muted-foreground">
                {formatTime(audioBuffer.duration)} · {formatSize(file.size)}
              </p>
            )}
          </div>

          <canvas
            ref={canvasRef}
            width={800}
            height={120}
            className="w-full rounded-lg cursor-crosshair"
          />

          {audioBuffer && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("start")}</label>
                  <input
                    type="range"
                    min="0"
                    max={audioBuffer.duration}
                    step="0.1"
                    value={startTime}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (v < endTime) setStartTime(v);
                    }}
                    className="w-full accent-primary"
                  />
                  <span className="text-xs text-muted-foreground font-mono">{formatTime(startTime)}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("end")}</label>
                  <input
                    type="range"
                    min="0"
                    max={audioBuffer.duration}
                    step="0.1"
                    value={endTime}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (v > startTime) setEndTime(v);
                    }}
                    className="w-full accent-primary"
                  />
                  <span className="text-xs text-muted-foreground font-mono">{formatTime(endTime)}</span>
                </div>
              </div>

              <div className="text-sm text-center text-muted-foreground">
                {t("selection")}: {formatTime(endTime - startTime)}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={playPreview}
                  className="flex-1 py-2 px-4 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors"
                >
                  {playing ? t("stopPreview") : t("preview")}
                </button>
                <button
                  onClick={cut}
                  disabled={processing}
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {processing ? t("processing") : t("cut")}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <audio controls src={result.url} className="w-full" />
          <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{result.name}</p>
              <p className="text-sm text-muted-foreground">{formatSize(result.size)}</p>
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
