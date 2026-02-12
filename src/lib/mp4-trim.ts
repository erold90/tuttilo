/**
 * Video trimming using Canvas + MediaRecorder
 * Re-encodes to achieve exact start/end times (not limited by keyframes).
 * Works on all modern browsers without WASM or server-side processing.
 */

export interface TrimResult {
  blob: Blob;
  duration: number;
  extension: string;
}

function getBestFormat(): { mimeType: string; extension: string } {
  if (typeof MediaRecorder === "undefined") {
    return { mimeType: "video/webm", extension: "webm" };
  }
  const formats = [
    { mimeType: "video/mp4", extension: "mp4" },
    { mimeType: "video/webm;codecs=vp9,opus", extension: "webm" },
    { mimeType: "video/webm;codecs=vp8,opus", extension: "webm" },
    { mimeType: "video/webm", extension: "webm" },
  ];
  for (const f of formats) {
    if (MediaRecorder.isTypeSupported(f.mimeType)) return f;
  }
  return formats[3];
}

export async function trimMP4(
  file: File,
  startTime: number,
  endTime: number,
  onProgress?: (pct: number) => void
): Promise<TrimResult> {
  const trimDuration = endTime - startTime;
  if (trimDuration <= 0) throw new Error("Invalid trim range");

  const { mimeType, extension } = getBestFormat();
  console.log(`[video-trim] Format: ${mimeType} (.${extension})`);

  return new Promise<TrimResult>((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.playsInline = true;
    video.muted = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    let finished = false;
    const cleanup = () => {
      if (finished) return;
      finished = true;
      video.pause();
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Failed to load video"));
    };

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas not supported"));
      return;
    }

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      console.log(`[video-trim] Video: ${canvas.width}x${canvas.height}, seeking to ${startTime.toFixed(2)}s`);
      video.currentTime = startTime;
    };

    let started = false;
    video.onseeked = () => {
      if (started) return;
      started = true;

      try {
        // Canvas stream at 30fps
        const canvasStream = canvas.captureStream(30);

        // Audio capture via AudioContext
        let audioCtx: AudioContext | null = null;
        const allTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

        try {
          audioCtx = new AudioContext();
          const source = audioCtx.createMediaElementSource(video);
          const dest = audioCtx.createMediaStreamDestination();
          source.connect(dest);
          dest.stream.getAudioTracks().forEach((t) => allTracks.push(t));
          video.muted = false;
        } catch {
          // no audio capture available — video-only output
        }

        const stream = new MediaStream(allTracks);
        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 8_000_000,
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          if (audioCtx) audioCtx.close().catch(() => {});
          cleanup();
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, {
            type: mimeType.split(";")[0],
          });
          if (onProgress) onProgress(100);
          console.log(
            `[video-trim] Output: ${(blob.size / 1024).toFixed(0)} KB, ` +
              `duration: ${trimDuration.toFixed(2)}s, format: ${extension}`
          );
          resolve({ blob, duration: trimDuration, extension });
        };

        recorder.onerror = () => {
          if (audioCtx) audioCtx.close().catch(() => {});
          cleanup();
          reject(new Error("Recording failed"));
        };

        // Draw first frame before recording starts
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        recorder.start(100);

        video
          .play()
          .then(() => {
            console.log(
              `[video-trim] Recording ${startTime.toFixed(2)}s → ${endTime.toFixed(2)}s`
            );

            const onFrame = () => {
              if (
                video.currentTime >= endTime ||
                video.paused ||
                video.ended
              ) {
                video.pause();
                setTimeout(() => {
                  if (recorder.state === "recording") recorder.stop();
                }, 200);
                return;
              }

              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              if (onProgress) {
                const pct =
                  ((video.currentTime - startTime) / trimDuration) * 100;
                onProgress(Math.min(99, Math.round(pct)));
              }

              requestAnimationFrame(onFrame);
            };
            requestAnimationFrame(onFrame);
          })
          .catch(() => {
            cleanup();
            reject(new Error("Playback blocked by browser"));
          });
      } catch (err) {
        cleanup();
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };
  });
}
