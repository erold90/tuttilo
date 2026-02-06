"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export function ChangeAudioSpeed() {
  const t = useTranslations("tools.change-audio-speed.ui");
  const [file, setFile] = useState<File | null>(null);
  const [speed, setSpeed] = useState(1.5);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("audio/")) return;
    setFile(f); setResultUrl(""); setError("");
  }, []);

  const process = useCallback(async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const audioCtx = new OfflineAudioContext(2, 1, 44100);
      const arrayBuf = await file.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arrayBuf);

      const newLength = Math.ceil(decoded.length / speed);
      const offline = new OfflineAudioContext(decoded.numberOfChannels, newLength, decoded.sampleRate);
      const source = offline.createBufferSource();
      source.buffer = decoded;
      source.playbackRate.value = speed;
      source.connect(offline.destination);
      source.start();
      const rendered = await offline.startRendering();

      // Encode to WAV
      const wavBlob = audioBufferToWav(rendered);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(wavBlob));
    } catch (err) {
      console.error("ChangeAudioSpeed error:", err);
      setError(t("processError"));
    } finally {
      setLoading(false);
    }
  }, [file, speed, resultUrl, t]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setResultUrl(""); setError("");
  }, [resultUrl]);

  return (
    <div className="space-y-6">
      {!file ? (
        <div onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }} className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 cursor-pointer">
          <p className="text-lg font-medium">{t("dropzone")}</p>
          <p className="text-sm text-muted-foreground">{t("formats")}</p>
          <input ref={inputRef} type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} className="hidden" />
        </div>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t("speed")}: {speed}x</label>
            <div className="flex flex-wrap gap-2">
              {SPEEDS.map((s) => (
                <button key={s} onClick={() => setSpeed(s)} className={`py-2 px-4 rounded-lg text-sm font-medium ${speed === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
                  {s}x
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={process} disabled={loading} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {loading ? t("processing") : t("apply")}
            </button>
            <button onClick={reset} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-green-500 font-medium">{t("done")}</p>
          <audio controls src={resultUrl} className="w-full" />
          <div className="flex gap-2">
            <a href={resultUrl} download={file.name.replace(/\.\w+$/, `_${speed}x.wav`)} className="flex-1 text-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("download")}</a>
            <button onClick={reset} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels, sr = buffer.sampleRate, len = buffer.length;
  const blockAlign = numCh * 2, dataSize = len * blockAlign;
  const buf = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buf);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + dataSize, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, numCh, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * blockAlign, true);
  v.setUint16(32, blockAlign, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, dataSize, true);
  let off = 44;
  const chs: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) chs.push(buffer.getChannelData(c));
  for (let i = 0; i < len; i++) for (let c = 0; c < numCh; c++) { const s = Math.max(-1, Math.min(1, chs[c][i])); v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true); off += 2; }
  return new Blob([buf], { type: "audio/wav" });
}
