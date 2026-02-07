"use client";

import dynamic from "next/dynamic";

// All tool components loaded dynamically with ssr:false.
// This "use client" boundary ensures Next.js excludes the tool component
// code from the edge Worker bundle, keeping it under Cloudflare's 3 MiB limit.
// Tools are interactive client-side apps — SSR adds no SEO value.
const ssr = false;

// Lightweight tools (no heavy deps) — direct dynamic import
const lightTools: Record<string, React.ComponentType> = {
  "word-counter": dynamic(() => import("./word-counter").then(m => m.WordCounter), { ssr }),
  "json-formatter": dynamic(() => import("./json-formatter").then(m => m.JsonFormatter), { ssr }),
  "base64": dynamic(() => import("./base64-encoder").then(m => m.Base64Encoder), { ssr }),
  "lorem-ipsum": dynamic(() => import("./lorem-ipsum").then(m => m.LoremIpsum), { ssr }),
  "color-picker": dynamic(() => import("./color-picker").then(m => m.ColorPicker), { ssr }),
  "regex-tester": dynamic(() => import("./regex-tester").then(m => m.RegexTester), { ssr }),
  "voice-recorder": dynamic(() => import("./voice-recorder").then(m => m.VoiceRecorder), { ssr }),
  "screen-recorder": dynamic(() => import("./screen-recorder").then(m => m.ScreenRecorder), { ssr }),
  "audio-cutter": dynamic(() => import("./audio-cutter").then(m => m.AudioCutter), { ssr }),
  "case-converter": dynamic(() => import("./case-converter").then(m => m.CaseConverter), { ssr }),
  "diff-checker": dynamic(() => import("./diff-checker").then(m => m.DiffChecker), { ssr }),
  "markdown-editor": dynamic(() => import("./markdown-editor").then(m => m.MarkdownEditor), { ssr }),
  "hex-rgb": dynamic(() => import("./hex-rgb").then(m => m.HexRgb), { ssr }),
  "url-encoder": dynamic(() => import("./url-encoder").then(m => m.UrlEncoder), { ssr }),
  "timestamp": dynamic(() => import("./timestamp-converter").then(m => m.TimestampConverter), { ssr }),
  "password-generator": dynamic(() => import("./password-generator").then(m => m.PasswordGenerator), { ssr }),
  "hash-generator": dynamic(() => import("./hash-generator").then(m => m.HashGenerator), { ssr }),
  "uuid-generator": dynamic(() => import("./uuid-generator").then(m => m.UuidGenerator), { ssr }),
  "jwt-decoder": dynamic(() => import("./jwt-decoder").then(m => m.JwtDecoder), { ssr }),
  "css-minifier": dynamic(() => import("./css-minifier").then(m => m.CssMinifier), { ssr }),
  "sql-formatter": dynamic(() => import("./sql-formatter").then(m => m.SqlFormatter), { ssr }),
};

// FFmpeg-based tools — loaded via ffmpeg-tools proxy
const ffmpegTools: Record<string, React.ComponentType> = {
  "video-to-mp3": dynamic(() => import("./ffmpeg-tools").then(m => m.VideoToMp3), { ssr }),
  "compress-video": dynamic(() => import("./ffmpeg-tools").then(m => m.CompressVideo), { ssr }),
  "trim-video": dynamic(() => import("./ffmpeg-tools").then(m => m.TrimVideo), { ssr }),
  "video-to-gif": dynamic(() => import("./ffmpeg-tools").then(m => m.VideoToGif), { ssr }),
  "audio-converter": dynamic(() => import("./ffmpeg-tools").then(m => m.AudioConverter), { ssr }),
};

// Heavy tools — loaded via batch-tools proxy to prevent server bundle bloat
const batchTools: Record<string, React.ComponentType> = {
  // Video batch
  "video-converter": dynamic(() => import("./batch-tools").then(m => m.VideoConverter), { ssr }),
  "rotate-video": dynamic(() => import("./batch-tools").then(m => m.RotateVideo), { ssr }),
  "mute-video": dynamic(() => import("./batch-tools").then(m => m.MuteVideo), { ssr }),
  "change-video-speed": dynamic(() => import("./batch-tools").then(m => m.ChangeVideoSpeed), { ssr }),
  "resize-video": dynamic(() => import("./batch-tools").then(m => m.ResizeVideo), { ssr }),
  // Audio batch
  "audio-joiner": dynamic(() => import("./batch-tools").then(m => m.AudioJoiner), { ssr }),
  "change-audio-speed": dynamic(() => import("./batch-tools").then(m => m.ChangeAudioSpeed), { ssr }),
  "text-to-speech": dynamic(() => import("./batch-tools").then(m => m.TextToSpeech), { ssr }),
  "reverse-audio": dynamic(() => import("./batch-tools").then(m => m.ReverseAudio), { ssr }),
  "change-audio-volume": dynamic(() => import("./batch-tools").then(m => m.ChangeAudioVolume), { ssr }),
  // Text/Converter batch
  "csv-json": dynamic(() => import("./batch-tools").then(m => m.CsvJson), { ssr }),
  "text-formatter": dynamic(() => import("./batch-tools").then(m => m.TextFormatter), { ssr }),
  "notepad": dynamic(() => import("./batch-tools").then(m => m.Notepad), { ssr }),
  "markdown-to-html": dynamic(() => import("./batch-tools").then(m => m.MarkdownToHtml), { ssr }),
  "find-replace": dynamic(() => import("./batch-tools").then(m => m.FindReplace), { ssr }),
  // PDF batch
  "pdf-to-text": dynamic(() => import("./batch-tools").then(m => m.PdfToText), { ssr }),
  "pdf-metadata": dynamic(() => import("./batch-tools").then(m => m.PdfMetadata), { ssr }),
  "grayscale-pdf": dynamic(() => import("./batch-tools").then(m => m.GrayscalePdf), { ssr }),
  "redact-pdf": dynamic(() => import("./batch-tools").then(m => m.RedactPdf), { ssr }),
  "extract-pdf-images": dynamic(() => import("./batch-tools").then(m => m.ExtractPdfImages), { ssr }),
  // YouTube batch
  "youtube-money-calculator": dynamic(() => import("./batch-tools").then(m => m.YoutubeMoneyCalculator), { ssr }),
  "youtube-embed-generator": dynamic(() => import("./batch-tools").then(m => m.YoutubeEmbedGenerator), { ssr }),
  "youtube-seo-generator": dynamic(() => import("./batch-tools").then(m => m.YoutubeSeoGenerator), { ssr }),
  "youtube-channel-name-generator": dynamic(() => import("./batch-tools").then(m => m.YoutubeChannelNameGenerator), { ssr }),
  "youtube-watch-time-calculator": dynamic(() => import("./batch-tools").then(m => m.YoutubeWatchTimeCalculator), { ssr }),
  "youtube-video-analyzer": dynamic(() => import("./batch-tools").then(m => m.YoutubeVideoAnalyzer), { ssr }),
  "youtube-channel-analyzer": dynamic(() => import("./batch-tools").then(m => m.YoutubeChannelAnalyzer), { ssr }),
  // Heavy PDF tools (pdf-lib, pdfjs-dist, mammoth, exceljs, etc.)
  "pdf-organizer": dynamic(() => import("./batch-tools").then(m => m.PdfOrganizer), { ssr }),
  "compress-pdf": dynamic(() => import("./batch-tools").then(m => m.CompressPdf), { ssr }),
  "unlock-pdf": dynamic(() => import("./batch-tools").then(m => m.UnlockPdf), { ssr }),
  "pdf-word": dynamic(() => import("./batch-tools").then(m => m.PdfWord), { ssr }),
  "pdf-excel": dynamic(() => import("./batch-tools").then(m => m.PdfExcel), { ssr }),
  "pdf-pptx": dynamic(() => import("./batch-tools").then(m => m.PdfPptx), { ssr }),
  "pdf-protect": dynamic(() => import("./batch-tools").then(m => m.PdfProtect), { ssr }),
  "pdf-page-numbers": dynamic(() => import("./batch-tools").then(m => m.PdfPageNumbers), { ssr }),
  "pdf-watermark": dynamic(() => import("./batch-tools").then(m => m.PdfWatermark), { ssr }),
  "pdf-ocr": dynamic(() => import("./batch-tools").then(m => m.PdfOcr), { ssr }),
  "pdf-repair": dynamic(() => import("./batch-tools").then(m => m.PdfRepair), { ssr }),
  "pdf-to-pdfa": dynamic(() => import("./batch-tools").then(m => m.PdfToPdfa), { ssr }),
  "html-to-pdf": dynamic(() => import("./batch-tools").then(m => m.HtmlToPdf), { ssr }),
  "pdf-flatten": dynamic(() => import("./batch-tools").then(m => m.PdfFlatten), { ssr }),
  "pdf-compare": dynamic(() => import("./batch-tools").then(m => m.PdfCompare), { ssr }),
  "pdf-crop": dynamic(() => import("./batch-tools").then(m => m.PdfCrop), { ssr }),
  "pdf-images": dynamic(() => import("./batch-tools").then(m => m.PdfImages), { ssr }),
  "pdf-editor": dynamic(() => import("./batch-tools").then(m => m.PdfEditorUnified), { ssr }),
  "pdf-fill-sign": dynamic(() => import("./batch-tools").then(m => m.PdfFillSignWrapper), { ssr }),
  // Heavy image tools (react-cropper, heic2any, etc.)
  "image-editor": dynamic(() => import("./batch-tools").then(m => m.ImageEditor), { ssr }),
  "image-converter": dynamic(() => import("./batch-tools").then(m => m.ImageConverter), { ssr }),
  "image-compressor": dynamic(() => import("./batch-tools").then(m => m.ImageCompressor), { ssr }),
  "image-resizer": dynamic(() => import("./batch-tools").then(m => m.ImageResizer), { ssr }),
  "image-cropper": dynamic(() => import("./batch-tools").then(m => m.ImageCropper), { ssr }),
  "image-to-text": dynamic(() => import("./batch-tools").then(m => m.ImageToText), { ssr }),
  "meme-maker": dynamic(() => import("./batch-tools").then(m => m.MemeMaker), { ssr }),
  "add-text-to-image": dynamic(() => import("./batch-tools").then(m => m.AddTextToImage), { ssr }),
  // Other heavy tools
  "qr-code": dynamic(() => import("./batch-tools").then(m => m.QrCode), { ssr }),
  "youtube-thumbnail": dynamic(() => import("./batch-tools").then(m => m.YoutubeThumbnail), { ssr }),
};

const toolComponents: Record<string, React.ComponentType> = {
  ...lightTools,
  ...ffmpegTools,
  ...batchTools,
};

interface ToolLoaderProps {
  toolId: string;
}

export function ToolLoader({ toolId }: ToolLoaderProps) {
  const Component = toolComponents[toolId];
  if (!Component) return null;
  return <Component />;
}
