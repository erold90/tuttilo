"use client";

import dynamic from "next/dynamic";

export const CompressVideo = dynamic(
  () => import("./compress-video").then((m) => m.CompressVideo),
  { ssr: false }
);

export const TrimVideo = dynamic(
  () => import("./trim-video").then((m) => m.TrimVideo),
  { ssr: false }
);

export const VideoToGif = dynamic(
  () => import("./video-to-gif").then((m) => m.VideoToGif),
  { ssr: false }
);

export const AudioConverter = dynamic(
  () => import("./audio-converter").then((m) => m.AudioConverter),
  { ssr: false }
);
