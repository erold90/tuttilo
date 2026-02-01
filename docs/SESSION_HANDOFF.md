# Session Handoff — Tuttilo

## Ultimo aggiornamento: 2026-02-01

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

## Sistema PDF Robusto (2026-02-01) — COMPLETO
- **Problema**: pdf-lib non parsifica PDF moderni (XRef Streams, Object Streams, PDF 1.6+)
- **Soluzione**: Creato `src/lib/pdf-utils.ts` con fallback pdfjs-dist
- **`loadPdfRobust()`**: Tenta pdf-lib, se fallisce ricostruisce via pdfjs-dist (render JPEG) + callback onProgress
- **`getPdfPageCount()`**: Conteggio pagine con fallback leggero
- **Tool aggiornati**: compress, merge, split, rotate, unlock + MIME check permissivo su tutti 8
- **Memory leak fix**: doc.destroy() aggiunto a pdf-to-jpg, pdf-to-png, pdf-to-word + canvas cleanup
- **Progress UX**: Tutti i tool mostrano progresso % durante elaborazione PDF complessi
- **Piano completo**: `docs/PDF_SYSTEM_PLAN.md` — Fasi 1-3 COMPLETATE, Fase 4 (mupdf) opzionale

## Sistema Immagini Robusto (2026-02-01) — COMPLETO
- **Obiettivo**: Rendere gli 8 image tool veloci, stabili e potenti
- **Fase 1**: Creato `src/lib/image-utils.ts` (shared utility), refactored tutti 8 tool con error handling, fix critico crop-image toDataURL→canvasToBlob, deduplicazione 4 converter
- **Fase 2**: Installato jSquash WASM (@jsquash/jpeg+png+webp), rimosso browser-image-compression, webpack asyncWebAssembly+layers, Canvas fallback
- **Fase 3**: Creato `src/hooks/use-batch-image.ts` + `src/components/tools/batch-image-list.tsx`, batch multi-file su 5 converter (png-to-jpg, jpg-to-png, webp-to-png, webp-to-jpg, heic-to-jpg)
- **Fase 4**: Quality sliders su resize/crop/heic, file size display su tutti, progress indicators su compress/heic/batch
- **Traduzioni**: error/quality/size/batch keys in tutte 8 lingue
- **Build OK** — zero errori

## Consolidamento PDF (2026-02-01) — COMPLETO
- **Obiettivo**: Ridurre 11 PDF tool a 5 super-tool (come iLovePDF)
- **Super-tool creati**:
  - `pdf-organizer` (slug: `organizer`) — merge + split + rotate in un unico tool con tab
  - `pdf-to-images` (slug: `to-images`) — pdf-to-jpg + pdf-to-png con selector formato
  - `pdf-word` (slug: `word`) — word-to-pdf + pdf-to-word bidirezionale
  - `compress-pdf` (slug: `compress`) — mantenuto
  - `unlock-pdf` (slug: `unlock`) — mantenuto
- **Redirect 301** in `next.config.ts`: merge→organizer, split→organizer, rotate→organizer, to-jpg→to-images, to-png→to-images, from-jpg→from-images, to-word→word, from-word→word
- **Registry**: 5 super-tool attivi, vecchi slug rimossi
- **Traduzioni**: Tutte 8 lingue aggiornate con chiavi pdf-organizer/pdf-to-images/pdf-word
- **Build OK** — zero errori
- **8 file orfani** (non importati, non causano problemi): merge-pdf.tsx, split-pdf.tsx, rotate-pdf.tsx, pdf-to-jpg.tsx, pdf-to-png.tsx, pdf-to-word.tsx, word-to-pdf.tsx, jpg-to-pdf.tsx

## Cosa resta da fare
- UX Redesign V2 Fase 1: F1.6 mega-menu (opzionale)
- UX Redesign V2 Fase 2: Trust + Legal (Privacy, Terms, About, Contact)
- UX Redesign V2 Fase 3: Tool UX Consistency
- Sprint 7 (SEO & Performance): Core Web Vitals, sitemap dinamica, structured data
- Sprint 8 (Footer Pages): About, Contact, Privacy, Terms
- Vedere docs/ROADMAP.md per piano sprint completo

## Deploy Automatico (2026-02-01)
- **GitHub Actions** configurato: `.github/workflows/deploy.yml`
- Ogni push su `main` (incluso MCP) → build automatica → deploy su Cloudflare Pages
- Secrets GitHub: `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` configurati
- NON serve più wrangler login locale o deploy manuale
- Monitoraggio: https://github.com/erold90/tuttilo/actions
- Tempo medio: ~2:30 minuti

## File creati/modificati — Consolidamento PDF
- `src/components/tools/pdf-organizer.tsx` — CREATE. Super-tool merge+split+rotate con tab UI
- `src/components/tools/pdf-to-images.tsx` — CREATE. Super-tool pdf-to-jpg+pdf-to-png con formato selector
- `src/components/tools/pdf-word.tsx` — CREATE. Super-tool word-to-pdf+pdf-to-word bidirezionale
- `src/lib/tools/registry.ts` — MODIFY. 5 super-tool, vecchi rimossi
- `src/app/[locale]/[category]/[tool]/page.tsx` — MODIFY. Nuovi import + mapping
- `src/components/tool-icon.tsx` — MODIFY. Nuove icone per super-tool
- `next.config.ts` — MODIFY. 8 redirect 301 per vecchi slug
- `src/messages/*.json` (x8) — MODIFY. Chiavi traduzione per 3 nuovi super-tool

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
18. Deploy automatico via GitHub Actions (non più wrangler manuale)
19. PDF consolidation: 11→5 super-tool, redirect 301 per SEO, tab UI per multi-funzione

## Problemi aperti
- git push locale non funziona (SSH key mismatch witerose ≠ erold90) — usare MCP GitHub
- HTTPS push fallisce ("could not read Username") — usare MCP GitHub
- @cloudflare/next-on-pages è deprecated, migrare a OpenNext in futuro

## File creati/modificati — Sistema Immagini Robusto
- `src/lib/image-utils.ts` — CREATE. Shared utility (loadImage, canvasToBlob, cleanupCanvas, formatFileSize, triggerDownload, revokeUrls, convertImageFormat, compressImage + jSquash WASM)
- `src/hooks/use-batch-image.ts` — CREATE. Batch processing hook (sequential processing, per-file status, abort support)
- `src/components/tools/batch-image-list.tsx` — CREATE. Reusable batch file list UI component
- `src/components/tools/compress-image.tsx` — MODIFY (jSquash compressImage + progress bar)
- `src/components/tools/resize-image.tsx` — MODIFY (error handling, quality slider, file size display)
- `src/components/tools/crop-image.tsx` — MODIFY (toDataURL→canvasToBlob fix, quality slider, error handling)
- `src/components/tools/png-to-jpg.tsx` — MODIFY (convertImageFormat + batch)
- `src/components/tools/jpg-to-png.tsx` — MODIFY (convertImageFormat + batch)
- `src/components/tools/webp-to-png.tsx` — MODIFY (convertImageFormat + batch)
- `src/components/tools/webp-to-jpg.tsx` — MODIFY (convertImageFormat + batch)
- `src/components/tools/heic-to-jpg.tsx` — MODIFY (quality slider + batch + file size)
- `next.config.ts` — MODIFY (webpack asyncWebAssembly + layers experiments)
- `package.json` — MODIFY (+@jsquash/jpeg+png+webp, -browser-image-compression)
- `src/messages/*.json` (x8) — MODIFY (error/quality/size/batch translation keys)

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
