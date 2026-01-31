let ffmpegInstance: any = null; // eslint-disable-line
let loadPromise: Promise<any> | null = null;

export async function getFFmpeg(
  onProgress?: (progress: number) => void
): Promise<any> {
  if (ffmpegInstance?.loaded) return ffmpegInstance;
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

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  try {
    return await loadPromise;
  } catch {
    loadPromise = null;
    throw new Error("Failed to load FFmpeg");
  }
}

export async function ffmpegFetchFile(file: File): Promise<Uint8Array> {
  const { fetchFile } = await import("@ffmpeg/util");
  return await fetchFile(file);
}
