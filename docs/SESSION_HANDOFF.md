# Session Handoff — Tuttilo

## Ultimo aggiornamento: 2026-01-31

## Cosa è stato completato
- **Sprint 0 COMPLETATO** (16/16 task) — Setup progetto, SEO, deploy
- **Sprint 1 COMPLETATO** (11/11 task) — 6 Text/Dev tool funzionanti
  - Word Counter, JSON Formatter, Base64 Encoder, Lorem Ipsum Generator, Color Picker, Regex Tester
  - Dynamic route: `src/app/[locale]/[category]/[tool]/page.tsx` (edge runtime)
  - ToolLayout: breadcrumb fix, SEO section, FAQ section
  - RelatedTools: client component, filtra per isAvailable
  - Registry: 6 tool isAvailable: true
  - Traduzioni complete 8 lingue (seo+faq+ui per ogni tool)
  - Fix placeholder DE/ES/FR, fix ESLint regex-tester
  - Push GitHub (MCP push_files in batch da 2) + Deploy Cloudflare Pages
- Sito live su tuttilo.com e tuttilo.pages.dev

## Cosa resta da fare
- Iniziare Sprint 2 (Image tools: compress, resize, crop, format convert)
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
9. Traduzioni senza ICU placeholder per valori che sono renderizzati come `{number} {t("key")}` nei componenti
10. Build CF Pages richiede `@vercel/next` installato esplicitamente

## Problemi aperti
- git push locale non funziona (SSH key mismatch) — usare MCP GitHub per push
- Build CF Pages: `@vercel/next` va installato manualmente (`npm install @vercel/next`)
- @cloudflare/next-on-pages è deprecated, migrare a OpenNext in futuro

## File principali modificati in Sprint 1
- `src/app/[locale]/[category]/[tool]/page.tsx` — Dynamic tool route
- `src/components/tools/tool-layout.tsx` — ToolLayout wrapper
- `src/components/tools/related-tools.tsx` — Related tools client component
- `src/components/tools/word-counter.tsx` — Word Counter
- `src/components/tools/json-formatter.tsx` — JSON Formatter
- `src/components/tools/base64-encoder.tsx` — Base64 Encoder/Decoder
- `src/components/tools/lorem-ipsum.tsx` — Lorem Ipsum Generator
- `src/components/tools/color-picker.tsx` — Color Picker
- `src/components/tools/regex-tester.tsx` — Regex Tester
- `src/lib/tools/registry.ts` — Tool registry (6 tool available)
- `src/messages/*.json` — Tutte 8 traduzioni aggiornate
