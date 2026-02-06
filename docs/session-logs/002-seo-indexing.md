# Session 002 — SEO Indexing & Ottimizzazione

**Data**: 2026-02-06
**Obiettivo**: Implementare SEO completo per indicizzazione Google massima

## ISTRUZIONI DEPLOY (LEGGERE SEMPRE)
- **Deploy**: SOLO via wrangler locale su Cloudflare. Push GitHub solo a progetto finito.
- **Comando deploy**: `npm run build && npx @cloudflare/next-on-pages && rm -f .vercel/output/static/_worker.js/__next-on-pages-dist__/assets/*.wasm.bin && rm -f .vercel/output/static/_worker.js/nop-build-log.json && npx wrangler pages deploy .vercel/output/static --project-name tuttilo --branch main --commit-dirty=true`
- **MCP Memory**: Cerca entita "Tuttilo_SEO_Sprint" per contesto persistente

## Stato SEO Pre-Sprint
- Sitemap.xml: OK (con hreflang 8 lingue)
- Robots.txt: OK
- JSON-LD: WebSite + BreadcrumbList + SoftwareApplication + FAQPage
- Meta tags: title, description, OG (no image), Twitter, canonical, hreflang
- 301 Redirects: OK per vecchi URL
- MANCA: Google Search Console, og:image, GA4, HowTo schema, IndexNow, x-default, contenuto sotto tool

## Task Plan

| # | Task | Fase | Status |
|---|------|------|--------|
| 1 | Aggiungere meta tag Google Search Console verification | F1 | DONE |
| 2 | Aggiungere x-default hreflang (layout, tool, category, home, sitemap) | F1 | DONE |
| 3 | Creare og:image (1200x630) e configurare OG + Twitter | F1 | DONE |
| 4 | Aggiungere HowTo schema JSON-LD su tool pages (3 step) | F1 | DONE |
| 5 | Implementare IndexNow per Bing/Yandex (API route + key) | F1 | DONE |
| 6 | Build + Deploy F1 | F1 | DONE |
| 7 | Espandere contenuto SEO sotto ogni tool (seo.p2 + seo.p3→seoPrivacy) | F2 | DONE |
| 8 | Espandere FAQ da 3 a 5 domande per tool (q4/a4 + q5/a5) × 38 tool × 8 lingue | F2 | DONE |
| 9 | Migliorare sezione "Strumenti correlati" (cross-category workflow map) | F2 | DONE |
| 10 | Build + Deploy F2 | F2 | DONE |
| 11 | Implementare Google Analytics 4 | F3 | DONE |
| 12 | Submissione sitemap a Google Search Console | F3 | DONE |
| 13 | Build + Deploy finale | F3 | DONE |

## Progresso Dettagliato

### FASE 1 — Indicizzazione Immediata (COMPLETATA)
- **x-default hreflang**: Aggiunto a layout.tsx, page.tsx (home), [category]/page.tsx, [tool]/page.tsx, sitemap.ts
- **Google verification**: Placeholder `google-site-verification-token` in layout.tsx (utente deve sostituire con token reale da GSC)
- **og:image**: Creato `public/og-image.svg` (1200x630, brand Tuttilo indigo), referenziato in tutti i metadata (OG + Twitter)
- **HowTo schema**: JSON-LD HowTo con 3 step (Upload, Process, Download) su ogni tool page. Traduzioni `howToSchema` in 8 lingue.
- **IndexNow**: Key `a1fd1ae7e759405497c1deaf450ae405`, file verifica in public/, API route `/api/indexnow`. Submission: 360 URL inviate, Yandex 202 OK, Bing 429 (rate limit, URL in coda).
- **Deploy**: https://61854202.tuttilo.pages.dev — Build OK

## File Creati/Modificati

### Fase 1
- `src/app/[locale]/layout.tsx` — x-default, google verification, og:image, twitter images
- `src/app/[locale]/page.tsx` — x-default hreflang
- `src/app/[locale]/[category]/page.tsx` — x-default, og:image, twitter card
- `src/app/[locale]/[category]/[tool]/page.tsx` — x-default, og:image, twitter, HowTo JSON-LD
- `src/app/sitemap.ts` — x-default su tutti gli entry (home, category, tool)
- `src/app/api/indexnow/route.ts` — NEW: API route per IndexNow submission
- `public/og-image.svg` — NEW: Immagine OG 1200x630 branded
- `public/a1fd1ae7e759405497c1deaf450ae405.txt` — NEW: IndexNow key verification
- `src/messages/en.json` — Aggiunte chiavi `common.howToSchema`
- `src/messages/{it,es,fr,de,pt,ja,ko}.json` — Traduzioni `howToSchema` in 7 lingue

## Decisioni Prese
1. og:image come SVG statico (non rasterizzato) — SVG non supportato da tutti i social media, ma funziona per Google. Sarà sostituito con PNG in futuro.
2. HowTo schema generico a 3 step per tutti i tool (Upload/Process/Download) — da personalizzare in Fase 2
3. IndexNow key generata come UUID senza trattini
4. IndexNow API route protetta con header `x-indexnow-auth`

### FASE 2 — SEO Content (COMPLETATA)
- **Expanded SEO paragraphs**: Aggiunto `seo.p2` per tutti i 38 tool implementati (features & benefits paragraph). `seo.p3` rimosso (era privacy generico) e sostituito con `common.seoPrivacy` condiviso.
- **Expanded FAQ**: Aggiunte q4/a4 + q5/a5 per tutti i 38 tool × 8 lingue. FAQ ora dinamiche 1-8 in tool-layout.tsx.
- **Cross-category related tools**: `crossCategoryMap` con 25+ suggerimenti workflow-based. Mostra fino a 4 same-category + 2 cross-category con bordo tratteggiato e icona colorata.
- **JSON minificati**: Tutte le traduzioni minificate (no indentazione) per rispettare limite 3 MiB Worker Cloudflare.
- **Worker size fix**: Rimosso seo.p3 per-tool (identico ovunque), sostituito con common.seoPrivacy condiviso → -335KB.
- **Deploy**: https://dc9436b2.tuttilo.pages.dev — Build OK

### FASE 3 — Authority (COMPLETATA)
- **Google Analytics 4**: Componente `GoogleAnalytics` in `src/components/analytics/google-analytics.tsx`. Usa `NEXT_PUBLIC_GA_ID` env var o costante. Placeholder `G-XXXXXXXXXX` — utente deve creare proprietà GA4 e impostare il Measurement ID.
- **Google Search Console**: Infrastruttura pronta (sitemap.xml in robots.txt, hreflang completi, google verification placeholder in layout.tsx). Ping endpoint deprecato (404 Google, 410 Bing). Utente deve:
  1. Andare su https://search.google.com/search-console
  2. Aggiungere proprietà per tuttilo.com
  3. Ottenere token verifica e sostituire `google-site-verification-token` in layout.tsx
  4. Inviare sitemap: https://tuttilo.com/sitemap.xml
  5. Creare proprietà GA4 su https://analytics.google.com → impostare `NEXT_PUBLIC_GA_ID` in Cloudflare Pages env vars
- **Deploy finale**: https://8bc8d081.tuttilo.pages.dev — Build OK, 10558 KiB (sotto limite 3 MiB compresso)

## File Creati/Modificati — Fase 2
- `src/components/tools/tool-layout.tsx` — SEO dinamico (seo.p2-p4), shared seoPrivacy, FAQ 1-8
- `src/components/tools/related-tools.tsx` — Cross-category workflow map, tool icons, grid 3-col
- `src/messages/en.json` — seo.p2 + faq.q4-q5 per 38 tool, common.seoPrivacy, MINIFICATO
- `src/messages/{it,es,fr,de,pt,ja,ko}.json` — stesse aggiunte tradotte, MINIFICATI
- `scripts/merge-seo-content.js` — NEW: merge script per en.json
- `scripts/merge-seo-lang.js` — NEW: merge script per qualsiasi lingua
- `scripts/expanded-seo.json` — NEW: contenuto espanso EN per 38 tool
- `scripts/expanded-seo-{it,es,fr,de,pt,ja,ko}.json` — NEW: contenuto tradotto per lingua

## Problemi Incontrati e Risolti
- IndexNow 429 su Bing: Rate limit per troppe URL (360) in una sola richiesta. Normale per primo submit, URL vengono comunque elaborate in coda. Yandex ha accettato (202).
- Worker size >3 MiB: Contenuti SEO espansi hanno portato bundle da 9.8MB a 11.1MB. Risolto rimuovendo seo.p3 per-tool (identico) e usando common.seoPrivacy condiviso + minificazione JSON.
