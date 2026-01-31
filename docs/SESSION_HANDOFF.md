# Session Handoff — Tuttilo

## Ultimo aggiornamento: 2026-01-31

## Cosa è stato completato
- **Sprint 0 COMPLETATO** (16/16 task) — Setup progetto, SEO, deploy
- **Sprint 1 COMPLETATO** (11/11 task) — 6 Text/Dev tool funzionanti
  - Word Counter, JSON Formatter, Base64 Encoder, Lorem Ipsum Generator, Color Picker, Regex Tester
- **Sprint 2 COMPLETATO** (14/14 task) — 8 Image tool funzionanti
  - Compress Image, Resize Image, Crop Image, PNG→JPG, JPG→PNG, WebP→PNG, WebP→JPG, HEIC→JPG
- **Sprint 3 COMPLETATO** (12/12 task) — 6 PDF Core tool funzionanti
  - Merge PDF, Split PDF, Compress PDF, PDF→JPG, JPG→PDF, Rotate PDF
- **Sprint 4 COMPLETATO** (12/12 task) — 6 Audio/Media tool live
  - QR Code Generator, SVG→PNG, Voice Recorder, Screen Recorder, Video→MP3, Audio Cutter
- **Sprint 5 COMPLETATO** (11/11 task) — 5 PDF Advanced tool live
  - PDF→PNG, Images→PDF, Unlock PDF, Word→PDF, PDF→Word
- **Sprint 6 COMPLETATO** (12/12 task) — 5 Video tool live
  - Compress Video, Trim Video, Video→GIF, Audio Converter, YouTube Thumbnail
  - Tutte le traduzioni 8 lingue (seo+faq+ui) completate
  - Build OK — Push GitHub OK — Deploy Cloudflare Pages OK
  - 36 tool totali live su tuttilo.com

## Testing Completo (Post-Sprint 6)
- **36/36 tool testati** — tutti funzionanti
- **11 bug trovati e fixati** (vedi docs/TESTING_ROADMAP.md per dettagli)
- **Fix critici**: video-to-mp3 riscritto con FFmpeg, XSS fix su svg-to-png e word-to-pdf, memory leak fix su 8 image tools + audio-cutter
- **i18n audit**: 43/45 tool perfetti, 2 fixati (images-to-pdf, pdf-to-png) — 6 chiavi aggiunte a 7 lingue
- **Build OK** dopo tutti i fix

## Cosa resta da fare
- Sprint 7 (SEO & Performance): Core Web Vitals, sitemap dinamica, structured data
- Sprint 8 (Footer Pages): About, Contact, Privacy, Terms
- Vedere docs/ROADMAP.md per piano sprint completo

## Decisioni prese
1. Dominio: tuttilo.com
2. Tech stack: Next.js 15 + Tailwind + shadcn/ui + Cloudflare Pages
3. Processing client-side come differenziatore
4. Colore brand: Indigo #6366F1, Font: Inter + JetBrains Mono
5. i18n 8 lingue: EN (default), IT, ES, FR, DE, PT, JA, KO
6. Edge runtime per Cloudflare Pages
7. Git push via MCP (mcp__github__push_files) — SSH key mismatch locale
8. Tool components: `"use client"`, `useTranslations("tools.{tool-id}.ui")`
9. Traduzioni senza ICU placeholder
10. Build CF Pages richiede `@vercel/next` installato esplicitamente
11. cropperjs v1 (non v2) — v2 ha rimosso dist/cropper.css
12. PDF slug: merge/split/compress/rotate (corti), to-jpg/from-jpg (con prefisso)
13. TypeScript 5.7 + pdf-lib: `pdfBytes.buffer as ArrayBuffer` per Blob
14. pdfjs-dist: dynamic import + CDN worker, canvas prop obbligatorio in render
15. mammoth: dynamic import per DOCX→HTML (browser-side)
16. docx: client-side DOCX creation via Packer.toBlob()
17. FFmpeg.wasm: single-threaded mode, WASM da unpkg CDN, client wrapper pattern

## Problemi aperti
- git push locale non funziona (SSH key mismatch witerose ≠ erold90) — usare MCP GitHub
- HTTPS push fallisce ("could not read Username") — usare MCP GitHub
- @cloudflare/next-on-pages è deprecated, migrare a OpenNext in futuro

## File creati/modificati in Sprint 6
- `src/lib/ffmpeg.ts` — Shared FFmpeg utility (lazy load, singleton, progress callback)
- `src/components/tools/ffmpeg-tools.tsx` — Client wrapper con next/dynamic ssr:false
- `src/components/tools/compress-video.tsx` — Video compression (H.264, CRF 23/28/33)
- `src/components/tools/trim-video.tsx` — Video trimming (range sliders, re-encode MP4)
- `src/components/tools/video-to-gif.tsx` — Video→GIF (2-pass palette, fps/width controls)
- `src/components/tools/audio-converter.tsx` — Audio format converter (MP3/WAV/OGG/FLAC/AAC)
- `src/components/tools/youtube-thumbnail.tsx` — YouTube thumbnail downloader (4 risoluzioni)
- `src/lib/tools/registry.ts` — 5 Sprint 6 tools isAvailable: true
- `src/app/[locale]/[category]/[tool]/page.tsx` — 5 new imports + mappings
- `src/messages/*.json` — Tutte 8 traduzioni aggiornate (seo+faq+ui per 5 Sprint 6 tools)
- `package.json` — @ffmpeg/ffmpeg + @ffmpeg/util dependencies
