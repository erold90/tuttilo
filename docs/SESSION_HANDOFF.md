# Session Handoff — Tuttilo

## Ultimo aggiornamento: 2026-02-02

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

## PDF Fill & Sign + PDF Editor (2026-02-02) — COMPLETO
- **pdf-fill-sign** (slug: `fill-sign`): Form filling (AcroForm) + visual signature
  - Tre modalità firma: Draw (signature_pad), Type (font Georgia), Upload (immagine)
  - Rileva campi modulo automaticamente (text, checkbox, dropdown)
  - Supporta pre-fill valori esistenti e flatten form
  - Click-to-place firma su anteprima PDF
  - Librerie: signature_pad@5.1.3, pdf-lib, pdfjs-dist
- **pdf-editor** (slug: `editor`): Editor PDF professionale con rilevamento font
  - **Text editing**: Click su testo → rileva font family (serif/sans/mono), bold/italic, dimensione
  - **Font matching**: Mappa fontFamily + bold/italic a 12 standard PDF fonts (Helvetica/Times/Courier families)
  - **Overlay technique**: White rectangle su testo originale + ridisegna con font corrispondente
  - **Add text**: Click su PDF per aggiungere nuovo testo con dimensione configurabile
  - **Freehand drawing**: Disegno libero con colore e spessore pen configurabili
  - **Two-canvas**: Preview canvas (pdfjs-dist) + overlay canvas (highlights, strokes, annotations)
  - Librerie: pdfjs-dist (getTextContent + commonObjs), pdf-lib + @pdf-lib/fontkit, StandardFonts
- **Entrambi i tool**: Traduzioni complete in 8 lingue, build OK, push GitHub

## Testing Completo (Post-Sprint 6)
- **36/36 tool testati** — tutti funzionanti
- **11 bug trovati e fixati** (vedi docs/TESTING_ROADMAP.md per dettagli)
- **Fix critici**: video-to-mp3 riscritto con FFmpeg, XSS fix su svg-to-png e word-to-pdf, memory leak fix su 8 image tools + audio-cutter
- **i18n audit**: 43/45 tool perfetti, 2 fixati (images-to-pdf, pdf-to-png) — 6 chiavi aggiunte a 7 lingue
- **Build OK** dopo tutti i fix

## Agent Loop System (2026-02-02) — COMPLETO
- `.claude/settings.json` — Stop hook per salvare stato prima di fermarsi
- `.claude/commands/implement-tool.md` — Skill 5 fasi per implementare nuovi tool
- `.claude/commands/translate-tool.md` — Skill traduzione batch con subagent paralleli
- `scripts/ralph-loop.sh` — Bash wrapper per loop multi-sessione con context fresco
- `CLAUDE.md` — Enhanced con istruzioni compaction, agent loop docs, tool checklist

## Cosa resta da fare
- UX Redesign V2 Fase 1: F1.6 mega-menu (opzionale)
- Sprint AI/Server: Remove Background, OCR, Excel→PDF, YT Transcript (richiede server-side)
- Vedere docs/ROADMAP.md per piano sprint completo
- **38 tool totali live** (36 precedenti + pdf-fill-sign + pdf-editor)

## Deploy Automatico (2026-02-01)
- **GitHub Actions** configurato: `.github/workflows/deploy.yml`
- Ogni push su `main` (incluso MCP) → build automatica → deploy su Cloudflare Pages
- Secrets GitHub: `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` configurati
- NON serve più wrangler login locale o deploy manuale
- Monitoraggio: https://github.com/erold90/tuttilo/actions
- Tempo medio: ~2:30 minuti

## File creati/modificati — PDF Fill & Sign + Editor
- `src/components/tools/pdf-fill-sign.tsx` — NEW. Form filling + visual signature (draw/type/upload)
- `src/components/tools/pdf-editor.tsx` — NEW. Text editing con font detection + add text + freehand drawing
- `src/lib/tools/registry.ts` — MODIFY. pdf-fill-sign (new, isAvailable: true), pdf-editor (isAvailable: true)
- `src/components/tool-icon.tsx` — MODIFY. Aggiunto PenLine per pdf-fill-sign
- `src/app/[locale]/[category]/[tool]/page.tsx` — MODIFY. Import + mapping PdfFillSign, PdfEditor
- `src/messages/*.json` (x8) — MODIFY. Traduzioni complete per entrambi i tool (name, description, seo, faq, ui)

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
10. PDF slug: merge/split/compress/rotate (corti), to-jpg/from-jpg (con prefisso)
11. TypeScript 5.7 + pdf-lib: `pdfBytes.buffer as ArrayBuffer` per Blob
12. pdfjs-dist: dynamic import + CDN worker, canvas prop obbligatorio in render
13. PDF text editing: overlay approach (white rect + redraw) — editing inline non supportato da nessuna lib JS
14. Font detection: pdfjs getTextContent() → fontFamily + commonObjs → bold/italic → 12 standard PDF fonts
15. Signature: signature_pad (draw), Georgia italic (type), file upload — embed as PNG via pdf-lib

## Problemi aperti
- git push locale non funziona (SSH key mismatch witerose ≠ erold90) — usare MCP GitHub
- HTTPS push fallisce ("could not read Username") — usare MCP GitHub
- @cloudflare/next-on-pages è deprecated, migrare a OpenNext in futuro
