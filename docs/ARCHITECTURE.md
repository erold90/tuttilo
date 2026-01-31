# Tuttilo — Decisioni Architetturali

## ADR-001: Client-Side Processing come Default
**Data**: 2026-01-31
**Decisione**: Elaborare i file nel browser dell'utente, non sul server.
**Razionale**: Tutti i competitor (iLovePDF, Smallpdf, TinyWow, Convertio) processano server-side. Il client-side offre: privacy reale (file mai inviati), costi server quasi zero, velocità (no upload/download). Fallback server-side solo per file >200MB o operazioni che richiedono AI/OCR.

## ADR-002: Next.js 15 App Router
**Data**: 2026-01-31
**Decisione**: Usare Next.js 15 con App Router.
**Razionale**: SSG per SEO (ogni tool pre-renderizzato), CSR per interattività (upload, progress, download). Astro è più veloce per siti statici ma manca il supporto applicativo completo necessario per i tool interattivi.

## ADR-003: Cloudflare Pages + Workers + R2
**Data**: 2026-01-31
**Decisione**: Hosting su Cloudflare, non Vercel.
**Razionale**: Zero egress fees su R2 (critico per un sito che gestisce file). Free tier molto generoso. Workers per processing server-side quando necessario. Vercel costa $20/mese base e ha limiti di bandwidth (100GB/mese free).

## ADR-004: Struttura URL con Locale Prefix — 8 Lingue
**Data**: 2026-01-31 (aggiornato)
**Decisione**: URL pattern /[locale]/[category]/[tool] con 8 lingue: EN (default), IT, ES, FR, DE, PT, JA, KO.
**Razionale**: SEO-friendly (URL separati per lingua), next-intl supporta nativamente questo pattern, Google indicizza correttamente con hreflang. Le 8 lingue coprono ~75% del traffico globale sui tool online. Default EN per massima reach internazionale.

## ADR-005: Tool Registry Centralizzato
**Data**: 2026-01-31
**Decisione**: Un file registry.ts che definisce tutti i tool con metadata.
**Razionale**: Homepage, navigazione, sitemap, related tools — tutti leggono dallo stesso registry. Aggiungere un nuovo tool = aggiungere un entry al registry + creare la pagina.

## ADR-006: Colori per Categoria
**Data**: 2026-01-31
**Decisione**: Ogni categoria ha un colore distinto (PDF=rosso, Immagini=verde, Video=viola, Audio=arancione, Testo=blu, Dev=teal, YouTube=rosa).
**Razionale**: Pattern usato da Smallpdf con successo. Aiuta la navigazione visiva e il riconoscimento delle categorie.

## ADR-007: Ads Non-Invasivi
**Data**: 2026-01-31
**Decisione**: Solo sidebar 300x250, leaderboard 728x90 sotto il tool, sticky mobile 320x50 bottom. MAI dentro l'area del tool.
**Razionale**: Ricerca UX mostra che ads dentro l'area operativa causano click accidentali (rischio ban AdSense) e frustrazione utente. I competitor che monetizzano meglio (iLovePDF) piazzano ads lontano dall'area interattiva.

## ADR-008: Font Inter + JetBrains Mono
**Data**: 2026-01-31
**Decisione**: Inter per UI generale, JetBrains Mono per developer tools.
**Razionale**: Inter è il font più leggibile per interfacce web (usato da GitHub, Vercel, Linear). JetBrains Mono è il gold standard per codice monospace.

## ADR-009: Indigo come Brand Color
**Data**: 2026-01-31
**Decisione**: Colore primario brand #6366F1 (Indigo).
**Razionale**: iLovePDF usa rosso, Smallpdf usa blu, TinyWow usa blu/viola. Indigo si differenzia pur restando professionale. Funziona bene sia in light che dark mode.

## ADR-010: NO YouTube to MP3
**Data**: 2026-01-31
**Decisione**: Non implementare il download di contenuti protetti da copyright.
**Razionale**: 8M ricerche/mese ma rischi legali enormi. Google penalizza questi tool nelle SERP. Rischio takedown DMCA. Alternativa: YouTube Thumbnail Downloader e YouTube Transcript (legali).
