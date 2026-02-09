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
  // Calculators (light — no heavy deps)
  "scientific-calculator": dynamic(() => import("./scientific-calculator").then(m => m.default), { ssr }),
  "percentage-calculator": dynamic(() => import("./percentage-calculator").then(m => m.default), { ssr }),
  "bmi-calculator": dynamic(() => import("./bmi-calculator").then(m => m.default), { ssr }),
  "loan-calculator": dynamic(() => import("./loan-calculator").then(m => m.default), { ssr }),
  "mortgage-calculator": dynamic(() => import("./mortgage-calculator").then(m => m.default), { ssr }),
  "compound-interest-calculator": dynamic(() => import("./compound-interest-calculator").then(m => m.default), { ssr }),
  "roi-calculator": dynamic(() => import("./roi-calculator").then(m => m.default), { ssr }),
  "tip-calculator": dynamic(() => import("./tip-calculator").then(m => m.default), { ssr }),
  "salary-calculator": dynamic(() => import("./salary-calculator").then(m => m.default), { ssr }),
  "vat-calculator": dynamic(() => import("./vat-calculator").then(m => m.default), { ssr }),
  "profit-margin-calculator": dynamic(() => import("./profit-margin-calculator").then(m => m.default), { ssr }),
  "discount-calculator": dynamic(() => import("./discount-calculator").then(m => m.default), { ssr }),
  "age-calculator": dynamic(() => import("./age-calculator").then(m => m.default), { ssr }),
  "date-diff-calculator": dynamic(() => import("./date-diff-calculator").then(m => m.default), { ssr }),
  "calorie-calculator": dynamic(() => import("./calorie-calculator").then(m => m.default), { ssr }),
  "fraction-calculator": dynamic(() => import("./fraction-calculator").then(m => m.default), { ssr }),
  "grade-calculator": dynamic(() => import("./grade-calculator").then(m => m.default), { ssr }),
  "break-even-calculator": dynamic(() => import("./break-even-calculator").then(m => m.default), { ssr }),
  "length-converter": dynamic(() => import("./length-converter").then(m => m.default), { ssr }),
  "weight-converter": dynamic(() => import("./weight-converter").then(m => m.default), { ssr }),
  "temperature-converter": dynamic(() => import("./temperature-converter").then(m => m.default), { ssr }),
  "data-size-converter": dynamic(() => import("./data-size-converter").then(m => m.default), { ssr }),
  "area-converter": dynamic(() => import("./area-converter").then(m => m.default), { ssr }),
  "volume-converter": dynamic(() => import("./volume-converter").then(m => m.default), { ssr }),
  "speed-converter": dynamic(() => import("./speed-converter").then(m => m.default), { ssr }),
  "time-converter": dynamic(() => import("./time-converter").then(m => m.default), { ssr }),
  "fuel-economy-converter": dynamic(() => import("./fuel-economy-converter").then(m => m.default), { ssr }),
  "shoe-size-converter": dynamic(() => import("./shoe-size-converter").then(m => m.default), { ssr }),
  "pressure-converter": dynamic(() => import("./pressure-converter").then(m => m.default), { ssr }),
  "energy-converter": dynamic(() => import("./energy-converter").then(m => m.default), { ssr }),
  "number-base-converter": dynamic(() => import("./number-base-converter").then(m => m.default), { ssr }),
  "roman-numeral-converter": dynamic(() => import("./roman-numeral-converter").then(m => m.default), { ssr }),
  "power-converter": dynamic(() => import("./power-converter").then(m => m.default), { ssr }),
  // Color & Design (light — no heavy deps)
  "gradient-generator": dynamic(() => import("./gradient-generator").then(m => m.default), { ssr }),
  "palette-generator": dynamic(() => import("./palette-generator").then(m => m.default), { ssr }),
  "contrast-checker": dynamic(() => import("./contrast-checker").then(m => m.default), { ssr }),
  "box-shadow-generator": dynamic(() => import("./box-shadow-generator").then(m => m.default), { ssr }),
  "border-radius-generator": dynamic(() => import("./border-radius-generator").then(m => m.default), { ssr }),
  "glassmorphism-generator": dynamic(() => import("./glassmorphism-generator").then(m => m.default), { ssr }),
  "animation-generator": dynamic(() => import("./animation-generator").then(m => m.default), { ssr }),
  "clip-path-generator": dynamic(() => import("./clip-path-generator").then(m => m.default), { ssr }),
  "flexbox-generator": dynamic(() => import("./flexbox-generator").then(m => m.default), { ssr }),
  "color-blindness-simulator": dynamic(() => import("./color-blindness-simulator").then(m => m.default), { ssr }),
  "palette-from-image": dynamic(() => import("./palette-from-image").then(m => m.default), { ssr }),
  "font-pair-suggester": dynamic(() => import("./font-pair-suggester").then(m => m.default), { ssr }),
  "css-pattern-generator": dynamic(() => import("./css-pattern-generator").then(m => m.default), { ssr }),
  // Security tools (light — Web Crypto API, no heavy deps)
  "password-strength-checker": dynamic(() => import("./password-strength-checker").then(m => m.default), { ssr }),
  "hmac-generator": dynamic(() => import("./hmac-generator").then(m => m.default), { ssr }),
  "aes-encrypt-decrypt": dynamic(() => import("./aes-encrypt-decrypt").then(m => m.default), { ssr }),
  "crc32-checker": dynamic(() => import("./crc32-checker").then(m => m.default), { ssr }),
  "credit-card-validator": dynamic(() => import("./credit-card-validator").then(m => m.default), { ssr }),
  "totp-generator": dynamic(() => import("./totp-generator").then(m => m.default), { ssr }),
  "rsa-key-generator": dynamic(() => import("./rsa-key-generator").then(m => m.default), { ssr }),
  "pbkdf2-generator": dynamic(() => import("./pbkdf2-generator").then(m => m.default), { ssr }),
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
