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
  - Tutte le traduzioni 8 lingue (seo+faq+ui) completate
  - Build OK — Push GitHub completato — Deploy Cloudflare Pages OK
  - 31 tool totali live su tuttilo.com

## Cosa resta da fare
- Sprint 6 (SEO & Performance): Core Web Vitals, sitemap dinamica, structured data
- Sprint 7 (Footer Pages): About, Contact, Privacy, Terms
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

## Problemi aperti
- git push locale non funziona (SSH key mismatch witerose ≠ erold90) — usare MCP GitHub
- HTTPS push fallisce ("could not read Username") — usare MCP GitHub
- @cloudflare/next-on-pages è deprecated, migrare a OpenNext in futuro

## File creati/modificati in Sprint 5
- `src/components/tools/pdf-to-png.tsx` — PDF to PNG (pdfjs-dist, scale, transparent bg, ZIP)
- `src/components/tools/images-to-pdf.tsx` — Images to PDF (pdf-lib, page sizes, margins)
- `src/components/tools/unlock-pdf.tsx` — Unlock PDF (pdf-lib + pdfjs-dist password)
- `src/components/tools/word-to-pdf.tsx` — Word to PDF (mammoth DOCX→HTML, iframe print)
- `src/components/tools/pdf-to-word.tsx` — PDF to Word (pdfjs-dist → docx)
- `src/lib/tools/registry.ts` — 5 Sprint 5 tools isAvailable: true
- `src/app/[locale]/[category]/[tool]/page.tsx` — 5 new imports + mappings
- `src/messages/*.json` — Tutte 8 traduzioni aggiornate (seo+faq+ui per 5 Sprint 5 tools)
- `package.json` — mammoth + docx dependencies
