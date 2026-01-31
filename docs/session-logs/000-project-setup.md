# Session 000 — Setup Progetto Tuttilo

**Data**: 2026-01-31

## Cosa è stato fatto

### 1. Ricerca e Scelta Dominio
- Scelto `tuttilo.com` — 7 lettere, .com, brandable
- Registrato su Porkbun (~$11/anno)
- Privacy WHOIS attivata

### 2. Analisi UI/UX Competitor
- Analizzati: iLovePDF, TinyWow, Smallpdf, 123apps, Convertio, PDF24
- Pattern vincente: 2-3 click dal landing al risultato

### 3. Tech Stack Definito
- Next.js 15 + Tailwind CSS 4 + shadcn/ui + next-intl + next-themes
- Processing client-side (pdf-lib, Canvas API, FFmpeg.wasm)
- Hosting: Cloudflare Pages + Workers + R2

### 4. Roadmap 40 Tool in 7 Sprint
- Totale: ~36M ricerche/mese coperte

## Decisioni Prese
1. Client-side processing come differenziatore
2. NO YouTube to MP3 — rischi legali
3. Colore brand: Indigo (#6366F1)
4. Font: Inter + JetBrains Mono
5. 8 lingue: EN, IT, ES, FR, DE, PT, JA, KO
