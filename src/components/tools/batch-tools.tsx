"use client";

import dynamic from "next/dynamic";

// Batch 4: Video tools
export const VideoConverter = dynamic(() => import("./video-converter").then(m => m.VideoConverter), { ssr: false });
export const RotateVideo = dynamic(() => import("./rotate-video").then(m => m.RotateVideo), { ssr: false });
export const MuteVideo = dynamic(() => import("./mute-video").then(m => m.MuteVideo), { ssr: false });
export const ChangeVideoSpeed = dynamic(() => import("./change-video-speed").then(m => m.ChangeVideoSpeed), { ssr: false });
export const ResizeVideo = dynamic(() => import("./resize-video").then(m => m.ResizeVideo), { ssr: false });

// Batch 5: Audio tools
export const AudioJoiner = dynamic(() => import("./audio-joiner").then(m => m.AudioJoiner), { ssr: false });
export const ChangeAudioSpeed = dynamic(() => import("./change-audio-speed").then(m => m.ChangeAudioSpeed), { ssr: false });
export const TextToSpeech = dynamic(() => import("./text-to-speech").then(m => m.TextToSpeech), { ssr: false });
export const ReverseAudio = dynamic(() => import("./reverse-audio").then(m => m.ReverseAudio), { ssr: false });
export const ChangeAudioVolume = dynamic(() => import("./change-audio-volume").then(m => m.ChangeAudioVolume), { ssr: false });

// Batch 6: Text/Converter tools
export const CsvJson = dynamic(() => import("./csv-json").then(m => m.CsvJson), { ssr: false });
export const TextFormatter = dynamic(() => import("./text-formatter").then(m => m.TextFormatter), { ssr: false });
export const Notepad = dynamic(() => import("./notepad").then(m => m.Notepad), { ssr: false });
export const MarkdownToHtml = dynamic(() => import("./markdown-to-html").then(m => m.MarkdownToHtml), { ssr: false });
export const FindReplace = dynamic(() => import("./find-replace").then(m => m.FindReplace), { ssr: false });

// Batch 7: PDF tools
export const PdfToText = dynamic(() => import("./pdf-to-text").then(m => m.PdfToText), { ssr: false });
export const PdfMetadata = dynamic(() => import("./pdf-metadata").then(m => m.PdfMetadata), { ssr: false });
export const GrayscalePdf = dynamic(() => import("./grayscale-pdf").then(m => m.GrayscalePdf), { ssr: false });
export const RedactPdf = dynamic(() => import("./redact-pdf").then(m => m.RedactPdf), { ssr: false });
export const ExtractPdfImages = dynamic(() => import("./extract-pdf-images").then(m => m.ExtractPdfImages), { ssr: false });

// Batch 8: YouTube tools
export const YoutubeMoneyCalculator = dynamic(() => import("./youtube-money-calculator").then(m => m.YoutubeMoneyCalculator), { ssr: false });
export const YoutubeEmbedGenerator = dynamic(() => import("./youtube-embed-generator").then(m => m.YoutubeEmbedGenerator), { ssr: false });
export const YoutubeSeoGenerator = dynamic(() => import("./youtube-seo-generator").then(m => m.YoutubeSeoGenerator), { ssr: false });
export const YoutubeChannelNameGenerator = dynamic(() => import("./youtube-channel-name-generator").then(m => m.YoutubeChannelNameGenerator), { ssr: false });
export const YoutubeWatchTimeCalculator = dynamic(() => import("./youtube-watch-time-calculator").then(m => m.YoutubeWatchTimeCalculator), { ssr: false });
export const YoutubeVideoAnalyzer = dynamic(() => import("./youtube-video-analyzer").then(m => m.YoutubeVideoAnalyzer), { ssr: false });
export const YoutubeChannelAnalyzer = dynamic(() => import("./youtube-channel-analyzer").then(m => m.YoutubeChannelAnalyzer), { ssr: false });

// Batch 9: Heavy tools moved from direct import to prevent server bundle bloat
// PDF tools with pdf-lib/pdfjs-dist static imports
export const PdfOrganizer = dynamic(() => import("./pdf-organizer").then(m => m.PdfOrganizer), { ssr: false });
export const CompressPdf = dynamic(() => import("./compress-pdf").then(m => m.CompressPdf), { ssr: false });
export const UnlockPdf = dynamic(() => import("./unlock-pdf").then(m => m.UnlockPdf), { ssr: false });
export const PdfWord = dynamic(() => import("./pdf-word").then(m => m.PdfWord), { ssr: false });
export const PdfExcel = dynamic(() => import("./pdf-excel").then(m => m.PdfExcel), { ssr: false });
export const PdfPptx = dynamic(() => import("./pdf-pptx").then(m => m.PdfPptx), { ssr: false });
export const PdfProtect = dynamic(() => import("./pdf-protect").then(m => m.PdfProtect), { ssr: false });
export const PdfPageNumbers = dynamic(() => import("./pdf-page-numbers").then(m => m.PdfPageNumbers), { ssr: false });
export const PdfWatermark = dynamic(() => import("./pdf-watermark").then(m => m.PdfWatermark), { ssr: false });
export const PdfOcr = dynamic(() => import("./pdf-ocr").then(m => m.PdfOcr), { ssr: false });
export const PdfRepair = dynamic(() => import("./pdf-repair").then(m => m.PdfRepair), { ssr: false });
export const PdfToPdfa = dynamic(() => import("./pdf-to-pdfa").then(m => m.PdfToPdfa), { ssr: false });
export const HtmlToPdf = dynamic(() => import("./html-to-pdf").then(m => m.HtmlToPdf), { ssr: false });
export const PdfFlatten = dynamic(() => import("./pdf-flatten").then(m => m.PdfFlatten), { ssr: false });
export const PdfCompare = dynamic(() => import("./pdf-compare").then(m => m.PdfCompare), { ssr: false });
export const PdfCrop = dynamic(() => import("./pdf-crop").then(m => m.PdfCrop), { ssr: false });
export const PdfImages = dynamic(() => import("./pdf-images").then(m => m.PdfImages), { ssr: false });
export const PdfEditorUnified = dynamic(() => import("./pdf-editor-unified").then(m => m.PdfEditorUnified), { ssr: false });
export const PdfFillSignWrapper = dynamic(() => import("./pdf-fill-sign-wrapper").then(m => m.PdfFillSignWrapper), { ssr: false });
// Image tools with heavy deps
export const ImageEditor = dynamic(() => import("./image-editor").then(m => m.ImageEditor), { ssr: false });
export const ImageConverter = dynamic(() => import("./image-converter").then(m => m.ImageConverter), { ssr: false });
export const ImageCompressor = dynamic(() => import("./image-compressor").then(m => m.ImageCompressor), { ssr: false });
export const ImageResizer = dynamic(() => import("./image-resizer").then(m => m.ImageResizer), { ssr: false });
export const ImageCropper = dynamic(() => import("./image-cropper").then(m => m.ImageCropper), { ssr: false });
export const ImageToText = dynamic(() => import("./image-to-text").then(m => m.ImageToText), { ssr: false });
export const MemeMaker = dynamic(() => import("./meme-maker").then(m => m.MemeMaker), { ssr: false });
export const AddTextToImage = dynamic(() => import("./add-text-to-image").then(m => m.AddTextToImage), { ssr: false });
// Other heavy tools
export const QrCode = dynamic(() => import("./qr-code").then(m => m.QrCode), { ssr: false });
export const YoutubeThumbnail = dynamic(() => import("./youtube-thumbnail").then(m => m.YoutubeThumbnail), { ssr: false });
