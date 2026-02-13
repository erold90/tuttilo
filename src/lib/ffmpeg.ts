let ffmpegInstance: any = null; // eslint-disable-line
let loadPromise: Promise<any> | null = null;

export async function getFFmpeg(
  onProgress?: (progress: number) => void
): Promise<any> {
  if (ffmpegInstance?.loaded) {
    if (onProgress) {
      ffmpegInstance.off("progress");
      ffmpegInstance.on("progress", ({ progress }: { progress: number }) => {
        onProgress(Math.round(progress * 100));
      });
    }
    return ffmpegInstance;
  }
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");

    const ffmpeg = new FFmpeg();

    if (onProgress) {
      ffmpeg.on("progress", ({ progress }: { progress: number }) => {
        onProgress(Math.round(progress * 100));
      });
    }

    // Core JS is self-hosted (112KB), WASM from jsdelivr CDN (31MB, too large for CF Pages 25MB limit)
    const coreURL = await toBlobURL("/ffmpeg/ffmpeg-core.js", "text/javascript");
    const wasmURL = await toBlobURL(
      "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm",
      "application/wasm"
    );

    await ffmpeg.load({ coreURL, wasmURL });

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  try {
    return await loadPromise;
  } catch (err) {
    loadPromise = null;
    ffmpegInstance = null;
    throw err;
  }
}

export async function ffmpegFetchFile(file: File): Promise<Uint8Array> {
  const { fetchFile } = await import("@ffmpeg/util");
  return await fetchFile(file);
}
