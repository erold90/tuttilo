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
