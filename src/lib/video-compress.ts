/**
 * Video compression using Canvas + MediaRecorder
 * Re-encodes at a reduced bitrate (relative to original) to shrink file size.
 * Works on all modern browsers without WASM or server-side processing.
 */

export interface CompressResult {
  blob: Blob;
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

/**
 * @param file - input video file
 * @param reductionFactor - target bitrate as fraction of original (e.g. 0.4 = 40% of original bitrate)
 * @param onProgress - progress callback (0-100)
 */
export async function compressVideo(
  file: File,
  reductionFactor: number,
  onProgress?: (pct: number) => void
): Promise<CompressResult> {
  const { mimeType, extension } = getBestFormat();

  return new Promise<CompressResult>((resolve, reject) => {
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

    let duration = 0;

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      duration = video.duration;

      if (!isFinite(duration) || duration <= 0) {
        cleanup();
        reject(new Error("Cannot determine video duration"));
        return;
      }

      video.currentTime = 0;
    };

    let started = false;
    video.onseeked = () => {
      if (started) return;
      started = true;

      try {
        // Calculate target bitrate from original file size
        const originalBitrate = (file.size * 8) / duration;
        const targetBitrate = Math.max(
          100_000, // minimum 100kbps
          Math.round(originalBitrate * reductionFactor)
        );

        console.log(
          `[video-compress] Original: ${(originalBitrate / 1_000_000).toFixed(2)} Mbps, ` +
            `target: ${(targetBitrate / 1_000_000).toFixed(2)} Mbps (${Math.round(reductionFactor * 100)}%)`
        );

        const canvasStream = canvas.captureStream(30);

        let audioCtx: AudioContext | null = null;
        const allTracks: MediaStreamTrack[] = [
          ...canvasStream.getVideoTracks(),
        ];

        try {
          audioCtx = new AudioContext();
          const source = audioCtx.createMediaElementSource(video);
          const dest = audioCtx.createMediaStreamDestination();
          source.connect(dest);
          dest.stream.getAudioTracks().forEach((t) => allTracks.push(t));
          video.muted = false;
        } catch {
          // no audio
        }

        const stream = new MediaStream(allTracks);
        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: targetBitrate,
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
            `[video-compress] Output: ${(blob.size / 1024).toFixed(0)} KB ` +
              `(was ${(file.size / 1024).toFixed(0)} KB, ${Math.round((1 - blob.size / file.size) * 100)}% reduction)`
          );
          resolve({ blob, extension });
        };

        recorder.onerror = () => {
          if (audioCtx) audioCtx.close().catch(() => {});
          cleanup();
          reject(new Error("Recording failed"));
        };

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        recorder.start(100);

        video
          .play()
          .then(() => {
            const onFrame = () => {
              if (video.paused || video.ended) {
                setTimeout(() => {
                  if (recorder.state === "recording") recorder.stop();
                }, 200);
                return;
              }

              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              if (onProgress && duration > 0) {
                const pct = (video.currentTime / duration) * 100;
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
