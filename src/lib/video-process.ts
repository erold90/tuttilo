/**
 * Shared video processing via Canvas + MediaRecorder.
 * Replaces FFmpeg WASM for all video tools.
 */

export interface ProcessResult {
  blob: Blob;
  extension: string;
}

function getBestVideoFormat(): { mimeType: string; extension: string } {
  if (typeof MediaRecorder === "undefined")
    return { mimeType: "video/webm", extension: "webm" };
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

export function getVideoExtension(): string {
  return getBestVideoFormat().extension;
}

export interface VideoProcessOptions {
  canvasSize?: (video: HTMLVideoElement) => { width: number; height: number };
  drawFrame?: (
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ) => void;
  playbackRate?: number;
  includeAudio?: boolean;
  videoBitsPerSecond?: number;
  outputFormat?: { mimeType: string; extension: string };
}

export async function processVideo(
  file: File,
  options: VideoProcessOptions = {},
  onProgress?: (pct: number) => void
): Promise<ProcessResult> {
  const {
    canvasSize,
    drawFrame,
    playbackRate = 1,
    includeAudio = true,
    videoBitsPerSecond = 8_000_000,
    outputFormat,
  } = options;

  const { mimeType, extension } = outputFormat && typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(outputFormat.mimeType)
    ? outputFormat
    : getBestVideoFormat();

  return new Promise<ProcessResult>((resolve, reject) => {
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
      const size = canvasSize
        ? canvasSize(video)
        : {
            width: video.videoWidth || 1280,
            height: video.videoHeight || 720,
          };
      canvas.width = size.width;
      canvas.height = size.height;
      duration = video.duration;

      if (!isFinite(duration) || duration <= 0) {
        cleanup();
        reject(new Error("Cannot determine video duration"));
        return;
      }

      video.playbackRate = playbackRate;
      video.currentTime = 0;
    };

    let started = false;
    video.onseeked = () => {
      if (started) return;
      started = true;

      try {
        const canvasStream = canvas.captureStream(30);
        let audioCtx: AudioContext | null = null;
        const allTracks: MediaStreamTrack[] = [
          ...canvasStream.getVideoTracks(),
        ];

        if (includeAudio) {
          try {
            audioCtx = new AudioContext();
            const source = audioCtx.createMediaElementSource(video);
            const dest = audioCtx.createMediaStreamDestination();
            source.connect(dest);
            dest.stream
              .getAudioTracks()
              .forEach((t) => allTracks.push(t));
            video.muted = false;
          } catch {
            /* no audio */
          }
        }

        const stream = new MediaStream(allTracks);
        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond,
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
          resolve({ blob, extension });
        };

        recorder.onerror = () => {
          if (audioCtx) audioCtx.close().catch(() => {});
          cleanup();
          reject(new Error("Recording failed"));
        };

        const draw =
          drawFrame ||
          ((c: CanvasRenderingContext2D, v: HTMLVideoElement, cvs: HTMLCanvasElement) =>
            c.drawImage(v, 0, 0, cvs.width, cvs.height));
        draw(ctx, video, canvas);

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
              draw(ctx, video, canvas);
              if (onProgress && duration > 0) {
                onProgress(
                  Math.min(
                    99,
                    Math.round((video.currentTime / duration) * 100)
                  )
                );
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

/**
 * Extract audio from a video/audio file using AudioContext + MediaRecorder.
 * Returns the best audio format the browser supports.
 */
export function getBestAudioFormat(): { mimeType: string; extension: string } {
  if (typeof MediaRecorder === "undefined")
    return { mimeType: "audio/webm", extension: "webm" };
  const formats = [
    { mimeType: "audio/mp4", extension: "m4a" },
    { mimeType: "audio/webm;codecs=opus", extension: "ogg" },
    { mimeType: "audio/webm", extension: "webm" },
    { mimeType: "audio/ogg;codecs=opus", extension: "ogg" },
  ];
  for (const f of formats) {
    if (MediaRecorder.isTypeSupported(f.mimeType)) return f;
  }
  return formats[2];
}

export async function extractAudio(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ blob: Blob; extension: string }> {
  const { mimeType, extension } = getBestAudioFormat();

  return new Promise((resolve, reject) => {
    const el = document.createElement(
      file.type.startsWith("video/") ? "video" : "audio"
    ) as HTMLMediaElement;
    el.preload = "auto";
    el.muted = true;

    const url = URL.createObjectURL(file);
    el.src = url;

    let finished = false;
    const cleanup = () => {
      if (finished) return;
      finished = true;
      el.pause();
      el.removeAttribute("src");
      el.load();
      URL.revokeObjectURL(url);
    };

    el.onerror = () => {
      cleanup();
      reject(new Error("Failed to load media"));
    };

    let duration = 0;

    el.onloadedmetadata = () => {
      duration = el.duration;
      if (!isFinite(duration) || duration <= 0) {
        cleanup();
        reject(new Error("Cannot determine duration"));
        return;
      }
      el.currentTime = 0;
    };

    let started = false;
    el.onseeked = () => {
      if (started) return;
      started = true;

      try {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(el);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        el.muted = false;

        const recorder = new MediaRecorder(dest.stream, { mimeType });
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          audioCtx.close().catch(() => {});
          cleanup();
          dest.stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, { type: mimeType.split(";")[0] });
          if (onProgress) onProgress(100);
          resolve({ blob, extension });
        };

        recorder.onerror = () => {
          audioCtx.close().catch(() => {});
          cleanup();
          reject(new Error("Recording failed"));
        };

        recorder.start(100);

        el.play()
          .then(() => {
            const check = () => {
              if (el.paused || el.ended) {
                setTimeout(() => {
                  if (recorder.state === "recording") recorder.stop();
                }, 200);
                return;
              }
              if (onProgress && duration > 0) {
                onProgress(
                  Math.min(99, Math.round((el.currentTime / duration) * 100))
                );
              }
              requestAnimationFrame(check);
            };
            requestAnimationFrame(check);
          })
          .catch(() => {
            cleanup();
            reject(new Error("Playback blocked"));
          });
      } catch (err) {
        cleanup();
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };
  });
}
