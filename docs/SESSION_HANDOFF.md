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
  - Tutte le traduzioni 8 lingue (seo+faq+ui) completate
  - Build OK + Deploy Cloudflare Pages completato
- Sito live su tuttilo.com con 20 tool (6 Sprint 1 + 8 Sprint 2 + 6 Sprint 3)

## Cosa resta da fare
- Iniziare Sprint 4 (Audio/Media: MP3 Cutter, Voice Recorder, Screen Recorder, MP4→MP3, QR Code, SVG→PNG)
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

## Problemi aperti
- git push locale non funziona (SSH key mismatch witerose ≠ erold90) — usare MCP GitHub
- HTTPS push fallisce ("could not read Username") — usare MCP GitHub
- @cloudflare/next-on-pages è deprecated, migrare a OpenNext in futuro

## File creati/modificati in Sprint 3
- `src/components/tools/merge-pdf.tsx` — Merge PDF (pdf-lib)
- `src/components/tools/split-pdf.tsx` — Split PDF (pdf-lib)
- `src/components/tools/compress-pdf.tsx` — Compress PDF (pdf-lib, object streams)
- `src/components/tools/pdf-to-jpg.tsx` — PDF to JPG (pdfjs-dist, dynamic import)
- `src/components/tools/jpg-to-pdf.tsx` — JPG to PDF (pdf-lib, embed images)
- `src/components/tools/rotate-pdf.tsx` — Rotate PDF (pdf-lib, degrees)
- `src/lib/tools/registry.ts` — 6 PDF tools isAvailable: true
- `src/app/[locale]/[category]/[tool]/page.tsx` — 6 new imports + mappings
- `src/messages/*.json` — Tutte 8 traduzioni aggiornate (seo+faq+ui per 6 PDF tools)
- `package.json` — pdf-lib + pdfjs-dist
