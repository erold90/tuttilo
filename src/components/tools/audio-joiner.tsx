"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

interface AudioFile {
  id: number;
  file: File;
  name: string;
}

let nextId = 1;

export function AudioJoiner() {
  const t = useTranslations("tools.audio-joiner.ui");
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList) => {
    const newFiles: AudioFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (f.type.startsWith("audio/")) {
        newFiles.push({ id: nextId++, file: f, name: f.name });
      }
    }
    setFiles((prev) => [...prev, ...newFiles]);
    setResultUrl("");
  }, []);

  const removeFile = (id: number) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setFiles((prev) => { const n = [...prev]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n; });
  };

  const join = useCallback(async () => {
    if (files.length < 2) return;
    setLoading(true); setError("");
    try {
      const audioCtx = new AudioContext();
      const buffers: AudioBuffer[] = [];
      for (const af of files) {
        const arrayBuf = await af.file.arrayBuffer();
        const decoded = await audioCtx.decodeAudioData(arrayBuf);
        buffers.push(decoded);
      }
      const channels = Math.max(...buffers.map((b) => b.numberOfChannels));
      const sampleRate = buffers[0].sampleRate;
      const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);
      const output = audioCtx.createBuffer(channels, totalLength, sampleRate);
      let offset = 0;
      for (const buf of buffers) {
        for (let ch = 0; ch < channels; ch++) {
          const outData = output.getChannelData(ch);
          const srcData = buf.getChannelData(Math.min(ch, buf.numberOfChannels - 1));
          outData.set(srcData, offset);
        }
        offset += buf.length;
      }
      // Encode to WAV
      const wavBlob = audioBufferToWav(output);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(wavBlob));
      await audioCtx.close();
    } catch (err) {
      console.error("AudioJoiner error:", err);
      setError(t("joinError"));
    } finally {
      setLoading(false);
    }
  }, [files, resultUrl, t]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]); setResultUrl(""); setError("");
  }, [resultUrl]);

  return (
    <div className="space-y-6">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 cursor-pointer"
      >
        <p className="text-lg font-medium">{t("dropzone")}</p>
        <p className="text-sm text-muted-foreground">{t("formats")}</p>
        <input ref={inputRef} type="file" accept="audio/*" multiple onChange={(e) => e.target.files && addFiles(e.target.files)} className="hidden" />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((af, idx) => (
            <div key={af.id} className="flex items-center gap-2 rounded-lg border border-border p-2">
              <span className="text-xs text-muted-foreground w-6">{idx + 1}</span>
              <span className="flex-1 text-sm truncate">{af.name}</span>
              <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-30">{t("moveUp")}</button>
              <button onClick={() => removeFile(af.id)} className="text-xs text-red-400 px-2 py-1">{t("remove")}</button>
            </div>
          ))}
        </div>
      )}

      {files.length >= 2 && !resultUrl && (
        <div className="flex gap-2">
          <button onClick={join} disabled={loading} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? t("joining") : t("join")}
          </button>
          <button onClick={reset} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {resultUrl && (
        <div className="space-y-3">
          <audio controls src={resultUrl} className="w-full" />
          <div className="flex gap-2">
            <a href={resultUrl} download="joined_audio.wav" className="flex-1 text-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("download")}</a>
            <button onClick={reset} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">{t("reset")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = buffer.length * blockAlign;
  const headerSize = 44;
  const arrayBuffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) channels.push(buffer.getChannelData(ch));
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([arrayBuffer], { type: "audio/wav" });
}
