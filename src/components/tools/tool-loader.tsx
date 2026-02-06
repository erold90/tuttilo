"use client";

import dynamic from "next/dynamic";

// All tool components loaded dynamically with ssr:false.
// This "use client" boundary ensures Next.js excludes the tool component
// code from the edge Worker bundle, keeping it under Cloudflare's 3 MiB limit.
// Tools are interactive client-side apps — SSR adds no SEO value.
const ssr = false;

const toolComponents: Record<string, React.ComponentType> = {
  "word-counter": dynamic(() => import("./word-counter").then(m => m.WordCounter), { ssr }),
  "json-formatter": dynamic(() => import("./json-formatter").then(m => m.JsonFormatter), { ssr }),
  "base64": dynamic(() => import("./base64-encoder").then(m => m.Base64Encoder), { ssr }),
  "lorem-ipsum": dynamic(() => import("./lorem-ipsum").then(m => m.LoremIpsum), { ssr }),
  "color-picker": dynamic(() => import("./color-picker").then(m => m.ColorPicker), { ssr }),
  "regex-tester": dynamic(() => import("./regex-tester").then(m => m.RegexTester), { ssr }),
  "image-converter": dynamic(() => import("./image-converter").then(m => m.ImageConverter), { ssr }),
  "image-editor": dynamic(() => import("./image-editor").then(m => m.ImageEditor), { ssr }),
  "pdf-organizer": dynamic(() => import("./pdf-organizer").then(m => m.PdfOrganizer), { ssr }),
  "compress-pdf": dynamic(() => import("./compress-pdf").then(m => m.CompressPdf), { ssr }),
  "qr-code": dynamic(() => import("./qr-code").then(m => m.QrCode), { ssr }),
  "voice-recorder": dynamic(() => import("./voice-recorder").then(m => m.VoiceRecorder), { ssr }),
  "screen-recorder": dynamic(() => import("./screen-recorder").then(m => m.ScreenRecorder), { ssr }),
  "video-to-mp3": dynamic(() => import("./ffmpeg-tools").then(m => m.VideoToMp3), { ssr }),
  "audio-cutter": dynamic(() => import("./audio-cutter").then(m => m.AudioCutter), { ssr }),
  "pdf-editor": dynamic(() => import("./pdf-editor-unified").then(m => m.PdfEditorUnified), { ssr }),
  "pdf-fill-sign": dynamic(() => import("./pdf-fill-sign-wrapper").then(m => m.PdfFillSignWrapper), { ssr }),
  "pdf-images": dynamic(() => import("./pdf-images").then(m => m.PdfImages), { ssr }),
  "unlock-pdf": dynamic(() => import("./unlock-pdf").then(m => m.UnlockPdf), { ssr }),
  "pdf-word": dynamic(() => import("./pdf-word").then(m => m.PdfWord), { ssr }),
  "pdf-excel": dynamic(() => import("./pdf-excel").then(m => m.PdfExcel), { ssr }),
  "pdf-pptx": dynamic(() => import("./pdf-pptx").then(m => m.PdfPptx), { ssr }),
  "pdf-protect": dynamic(() => import("./pdf-protect").then(m => m.PdfProtect), { ssr }),
  "pdf-page-numbers": dynamic(() => import("./pdf-page-numbers").then(m => m.PdfPageNumbers), { ssr }),
  "pdf-watermark": dynamic(() => import("./pdf-watermark").then(m => m.PdfWatermark), { ssr }),
  "pdf-ocr": dynamic(() => import("./pdf-ocr").then(m => m.PdfOcr), { ssr }),
  "pdf-repair": dynamic(() => import("./pdf-repair").then(m => m.PdfRepair), { ssr }),
  "pdf-to-pdfa": dynamic(() => import("./pdf-to-pdfa").then(m => m.PdfToPdfa), { ssr }),
  "html-to-pdf": dynamic(() => import("./html-to-pdf").then(m => m.HtmlToPdf), { ssr }),
  "pdf-flatten": dynamic(() => import("./pdf-flatten").then(m => m.PdfFlatten), { ssr }),
  "pdf-compare": dynamic(() => import("./pdf-compare").then(m => m.PdfCompare), { ssr }),
  "pdf-crop": dynamic(() => import("./pdf-crop").then(m => m.PdfCrop), { ssr }),
  "compress-video": dynamic(() => import("./ffmpeg-tools").then(m => m.CompressVideo), { ssr }),
  "trim-video": dynamic(() => import("./ffmpeg-tools").then(m => m.TrimVideo), { ssr }),
  "video-to-gif": dynamic(() => import("./ffmpeg-tools").then(m => m.VideoToGif), { ssr }),
  "audio-converter": dynamic(() => import("./ffmpeg-tools").then(m => m.AudioConverter), { ssr }),
  "youtube-thumbnail": dynamic(() => import("./youtube-thumbnail").then(m => m.YoutubeThumbnail), { ssr }),
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
  "image-compressor": dynamic(() => import("./image-compressor").then(m => m.ImageCompressor), { ssr }),
  "image-resizer": dynamic(() => import("./image-resizer").then(m => m.ImageResizer), { ssr }),
  "image-cropper": dynamic(() => import("./image-cropper").then(m => m.ImageCropper), { ssr }),
  "image-to-text": dynamic(() => import("./image-to-text").then(m => m.ImageToText), { ssr }),
  "meme-maker": dynamic(() => import("./meme-maker").then(m => m.MemeMaker), { ssr }),
  "add-text-to-image": dynamic(() => import("./add-text-to-image").then(m => m.AddTextToImage), { ssr }),
};

interface ToolLoaderProps {
  toolId: string;
}

export function ToolLoader({ toolId }: ToolLoaderProps) {
  const Component = toolComponents[toolId];
  if (!Component) return null;
  return <Component />;
}
