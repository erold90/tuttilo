"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { extractAudio } from "@/lib/video-process";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { useFileInput } from "@/hooks/use-file-input";

interface OutputFormat {
  value: string;
  label: string;
  ext: string;
  type: "mediarecorder" | "wav";
}

/** Encode an AudioBuffer as WAV (PCM 16-bit) */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const blockAlign = numChannels * (bitDepth / 8);
  const byteRate = sampleRate * blockAlign;
  const numSamples = buffer.length;
  const dataSize = numSamples * blockAlign;
  const totalSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  function writeStr(offset: number, s: string) {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  }

  writeStr(0, "RIFF");
  view.setUint32(4, totalSize - 8, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

export function AudioConverter() {
  const t = useTranslations("tools.audio-converter.ui");
  const [file, setFile] = useState<File | null>(null);
  const [formats, setFormats] = useState<OutputFormat[]>([]);
  const [outputFormat, setOutputFormat] = useState("");
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const available: OutputFormat[] = [];
    if (typeof MediaRecorder !== "undefined") {
      if (MediaRecorder.isTypeSupported("audio/mp4")) {
        available.push({ value: "m4a", label: "M4A (AAC)", ext: ".m4a", type: "mediarecorder" });
      }
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        available.push({ value: "ogg", label: "OGG (Opus)", ext: ".ogg", type: "mediarecorder" });
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        available.push({ value: "webm", label: "WebM", ext: ".webm", type: "mediarecorder" });
      }
    }
    available.push({ value: "wav", label: "WAV", ext: ".wav", type: "wav" });
    setFormats(available);
    setOutputFormat(available[0].value);
  }, []);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("audio/") && !f.type.startsWith("video/")) return;
    setError("");
    setResultUrl("");
    setFile(f);
  }, []);

  const { open: openFileDialog, inputProps: fileInputProps } = useFileInput({
    accept: "audio/*,video/*",
    onFile: loadFile,
  });

  const convert = useCallback(async () => {
    if (!file || !outputFormat) return;
    setConverting(true);
    setError("");
    setProgress(0);
    try {
      const fmt = formats.find((f) => f.value === outputFormat)!;
      let blob: Blob;

      if (fmt.type === "wav") {
        // Decode to AudioBuffer and encode as WAV
        setProgress(30);
        const arrayBuffer = await file.arrayBuffer();
        const audioCtx = new AudioContext();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        await audioCtx.close();
        setProgress(70);
        blob = audioBufferToWav(audioBuffer);
        setProgress(100);
      } else {
        // Use MediaRecorder via extractAudio
        const result = await extractAudio(file, setProgress);
        blob = result.blob;
      }

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch (err) {
      console.error("AudioConverter error:", err);
      setError(t("convertError"));
    } finally {
      setConverting(false);
      setProgress(0);
    }
  }, [file, outputFormat, formats, resultUrl, t]);

  const download = useCallback(() => {
    if (!resultUrl || !file) return;
    const fmt = formats.find((f) => f.value === outputFormat)!;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = file.name.replace(/\.\w+$/, fmt.ext);
    a.click();
  }, [resultUrl, file, outputFormat, formats]);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setResultUrl("");
    setResultSize(0);
    setError("");
    setProgress(0);
  }, [resultUrl]);

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
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-primary"); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }}
            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={openFileDialog}
          >
            <ArrowsClockwise size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-medium">{t("dropzone")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("dropzoneHint")}</p>
          </div>
        </>
      ) : !resultUrl ? (
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
          </div>

          {formats.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">{t("outputFormat")}</label>
              <div className="flex gap-2 flex-wrap">
                {formats.map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => setOutputFormat(fmt.value)}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${outputFormat === fmt.value ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={convert}
            disabled={converting}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {converting ? `${t("converting")} ${progress}%` : t("convert")}
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="text-3xl">✓</div>
          <p className="font-medium">{t("done")}</p>
          <p className="text-sm text-muted-foreground">
            {formatSize(file.size)} → {formatSize(resultSize)}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={download} className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">{t("download")}</button>
            <button onClick={reset} className="py-2 px-6 bg-muted rounded-lg font-medium hover:bg-muted/80">{t("reset")}</button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
      )}
    </div>
  );
}
