# Piano Espansione Tuttilo — Da 82 a 250+ Tool

## Obiettivo
Espandere Tuttilo da 82 a 250+ tool, riorganizzando la navigazione e le categorie per scalare da 7 a 16 categorie con mega menu e homepage ridisegnata.

## Analisi Stato Pre-Espansione (2026-02-09)

### Tool Esistenti: 82 attivi su 91 registrati
- PDF: 24 | Image: 9 | Video: 10 | Audio: 8 | Text: 10 | Developer: 14 | YouTube: 8

### Architettura Attuale
- Header: 7 categorie tutte visibili nella navbar
- Homepage: Hero + 8 Popular + tutti i tool per categoria (troppo lungo con 250+)
- Sitemap: GIA' DINAMICO (legge da registry.ts)
- Search: Fuse.js fuzzy search con sinonimi
- Routing: /{locale}/{category}/{tool} (completamente dinamico)

### Sicurezza Attuale
- Security headers: A- (6 headers nel middleware)
- CSP: permissivo (unsafe-inline, unsafe-eval per Ezoic)
- Rate limiting: solo YouTube API (30 req/min per IP)
- XSS: fix applicati a markdown-to-html
- Input validation: 80% copertura (mancano size limits)
- Anti-bot: NON implementato

### Ads/Monetizzazione
- Ezoic Standalone con Gatekeeper CMP
- 4 placement: leaderboard, sidebar, mobile sticky, support notice
- Anti-adblock wall PRESENTE (da ridisegnare — troppo aggressivo)
- ads.txt: MANCANTE (da creare)

### SEO
- Structured data: eccellente (BreadcrumbList, SoftwareApplication, FAQPage, HowTo)
- Sitemap: ~850 URL dinamiche con hreflang
- IndexNow: implementato (Bing + Yandex)
- OG images: statiche (stessa per tutti — da migliorare)

---

## NUOVE 16 CATEGORIE

| # | ID | Slug | Colore | Icona | Tool | Stato |
|---|------|------|--------|-------|------|-------|
| 1 | pdf | /pdf | #EF4444 | FileText | 24 | ESISTE |
| 2 | image | /image | #22C55E | Image | 9 | ESISTE |
| 3 | video | /video | #8B5CF6 | Video | 10 | ESISTE |
| 4 | audio | /audio | #F97316 | Music | 8 | ESISTE |
| 5 | text | /text | #3B82F6 | Type | 26 | ESPANDERE (+16) |
| 6 | developer | /developer | #14B8A6 | Code | 34 | ESPANDERE (+20) |
| 7 | youtube | /youtube | #EC4899 | Youtube | 8 | ESISTE |
| 8 | calculators | /calculators | #F59E0B | Calculator | 18 | NUOVO |
| 9 | converters | /converters | #06B6D4 | ArrowsClockwise | 27 | NUOVO |
| 10 | color-design | /color-design | #A855F7 | Palette | 15 | NUOVO |
| 11 | security | /security | #DC2626 | ShieldCheck | 14 | NUOVO |
| 12 | datetime | /datetime | #0EA5E9 | Clock | 8 | NUOVO |
| 13 | seo | /seo | #84CC16 | MagnifyingGlass | 12 | NUOVO |
| 14 | social | /social | #E11D48 | ShareNetwork | 8 | NUOVO |
| 15 | generators | /generators | #7C3AED | Shuffle | 17 | NUOVO |
| 16 | network | /network | #475569 | Globe | 8 | NUOVO |

### Macro-Gruppi (per mega menu e mobile)
- **File Tools**: pdf, image, video, audio
- **Content**: text, youtube
- **Utility**: calculators, converters, color-design, datetime, generators
- **Web & Dev**: developer, seo, social, network, security

---

## NAVBAR REDESIGN

### Desktop (6 + More)
```
[Logo] [PDF] [Image] [Video] [Converters] [Calculators] [All Tools v] [Search] [Lang]
```

### Mega Menu "All Tools" (3 colonne)
```
FILE TOOLS          UTILITY              WEB & DEV
PDF (24)            Calculators (18)     Developer (34)
Image (9)           Converters (27)      SEO (12)
Video (10)          Color & CSS (15)     Social (8)
Audio (8)           Date & Time (8)      Network (8)
                    Generators (17)      Security (14)
CONTENT
Text (26)
YouTube (8)
```

### Mobile (Accordion gruppi nel hamburger)

---

## HOMEPAGE REDESIGN

### Nuova struttura:
1. HERO (invariato — search prominente)
2. TRUST SIGNALS (invariato)
3. POPULAR TOOLS (12 invece di 8)
4. CATEGORY GRID (16 card con icona + nome + conteggio — NO tool singoli)
5. FEATURES (invariato)
6. FAQ HOMEPAGE (5 domande generali per SEO)

---

## FASI DI IMPLEMENTAZIONE

### FASE 0 — Infrastruttura (prerequisito)
- [ ] 0.1 Aggiungere 9 nuove categorie al registry
- [ ] 0.2 Redesign Header con mega menu
- [ ] 0.3 Redesign Homepage (category grid)
- [ ] 0.4 Aggiornare popular tools (12)
- [ ] 0.5 Traduzioni categorie (8 lingue x 9 nuove cat)
- [ ] 0.6 Mobile nav con accordion gruppi
- [ ] 0.7 Creare ads.txt
- [ ] 0.8 Fix sicurezza (file size validation, CSP, Bot Fight Mode)
- [ ] 0.9 Build + Deploy test

### FASE 1 — Sprint HIGH Priority (74 tool)
- [ ] 1.1 Calculators (18 tool) — 3 batch da 6
- [ ] 1.2 Unit Converters (15 tool) — 3 batch da 5
- [ ] 1.3 Color & CSS Design (15 tool) — 3 batch da 5
- [ ] 1.4 Security & Crypto (14 tool) — 2 batch da 7
- [ ] 1.5 Data Converters (12 tool) — 2 batch da 6

### FASE 2 — Sprint MEDIUM Priority (64 tool)
- [ ] 2.1 Dev Tools Extra (20 tool) — 4 batch da 5
- [ ] 2.2 Text Extra (16 tool) — 3 batch da 5-6
- [ ] 2.3 SEO Tools (12 tool) — 2 batch da 6
- [ ] 2.4 Date & Time (8 tool) — 1-2 batch
- [ ] 2.5 Social Media (8 tool) — 1-2 batch

### FASE 3 — Sprint LOW Priority (30 tool)
- [ ] 3.1 Random Generators (12 tool)
- [ ] 3.2 Network Tools (8 tool)
- [ ] 3.3 Document Generators (5 tool)
- [ ] 3.4 Privacy Tools (5 tool)

---

## TEMPLATE NUOVO TOOL (checklist)

Per ogni tool {id}:
1. [ ] Componente: src/components/tools/{id}.tsx ("use client", useTranslations)
2. [ ] Registry: aggiungere in registry.ts (isAvailable: true)
3. [ ] Tool Loader: dynamic import + proxy se necessario
4. [ ] Tool Page: aggiungere ID in implementedToolIds
5. [ ] Icona: tool-icon.tsx (Phosphor Icons duotone)
6. [ ] Traduzioni EN: en.json (name, desc, seo, faq x5, ui, keywords, synonyms)
7. [ ] Traduzioni x7: subagent paralleli (IT, ES, FR, DE, PT, JA, KO)
8. [ ] Sicurezza: input validation, file size limits, XSS prevention
9. [ ] Build test: npm run build
10. [ ] Deploy: wrangler su Cloudflare

---

## SICUREZZA PER OGNI TOOL

### Input Validation Standard
```typescript
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const validateFile = (file: File, types: string[]) => {
  if (file.size > MAX_FILE_SIZE) throw new Error(t("fileTooLarge"));
  if (!types.some(t => file.type.startsWith(t))) throw new Error(t("invalidFormat"));
};
```

### Misure Anti-Bot
- Bot Fight Mode attivo su Cloudflare (no code)
- Turnstile solo su form contatto
- Rate limiting YouTube API (gia' presente)

### CSP Aggiornato
- unsafe-inline necessario per Ezoic
- worker-src blob: per FFmpeg/PDF workers
- img-src data: blob: per canvas operations

---

## METRICHE TARGET

| Metrica | Pre | Post Fase 0 | Post Fase 1 | Post Fase 2 | Post Fase 3 |
|---------|-----|-------------|-------------|-------------|-------------|
| Categorie | 7 | 16 | 16 | 16 | 16 |
| Tool | 82 | 82 | 156 | 220 | 250 |
| URL sitemap | ~850 | ~950 | ~1400 | ~1900 | ~2200 |
| Bundle (compresso) | <3 MiB | <3 MiB | <3 MiB | <3 MiB | <3 MiB |
