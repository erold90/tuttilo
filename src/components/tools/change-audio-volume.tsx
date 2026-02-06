"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

export function ChangeAudioVolume() {
  const t = useTranslations("tools.change-audio-volume.ui");
  const [file, setFile] = useState<File | null>(null);
  const [volume, setVolume] = useState(150);
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
      const audioCtx = new AudioContext();
      const arrayBuf = await file.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arrayBuf);

      const gain = volume / 100;
      const output = audioCtx.createBuffer(decoded.numberOfChannels, decoded.length, decoded.sampleRate);
      for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
        const src = decoded.getChannelData(ch);
        const dst = output.getChannelData(ch);
        for (let i = 0; i < src.length; i++) {
          dst[i] = Math.max(-1, Math.min(1, src[i] * gain));
        }
      }

      const wavBlob = audioBufferToWav(output);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(wavBlob));
      await audioCtx.close();
    } catch (err) {
      console.error("ChangeAudioVolume error:", err);
      setError(t("processError"));
    } finally {
      setLoading(false);
    }
  }, [file, volume, resultUrl, t]);

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
            <label className="block text-sm font-medium mb-2">{t("volume")}: {volume}%</label>
            <input type="range" min={10} max={400} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10%</span><span>100%</span><span>400%</span>
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
            <a href={resultUrl} download={file.name.replace(/\.\w+$/, `_vol${volume}.wav`)} className="flex-1 text-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("download")}</a>
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
