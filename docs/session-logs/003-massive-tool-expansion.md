# Session 003 — Massive Tool Expansion

**Data**: 2026-02-06
**Obiettivo**: Portare Tuttilo da 37 tool attivi a 80+ tool, colmando i gap con i competitor (TinyWow, 123apps, iLovePDF, Smallpdf, PDF24)

## ISTRUZIONI DEPLOY
- **Deploy**: SOLO via wrangler locale su Cloudflare
- **Comando**: `npm run build && npx @cloudflare/next-on-pages && rm -f .vercel/output/static/_worker.js/__next-on-pages-dist__/assets/*.wasm.bin && rm -f .vercel/output/static/_worker.js/nop-build-log.json && npx wrangler pages deploy .vercel/output/static --project-name tuttilo --branch main --commit-dirty=true`
- **MCP Memory**: `Tuttilo_ToolExpansion`
- **Worker size limit**: 3 MiB compresso (attuale: 10558 KiB). Traduzioni MINIMAL per nuovi tool.

## VINCOLO CRITICO: Worker Size
- Bundle attuale: 10558 KiB (~3 MiB compresso)
- Ogni tool aggiunge ~1.5-2 KB × 8 lingue = ~12-16 KB di traduzioni
- Stimati 43 nuovi tool → ~600-700 KB extra traduzioni
- REGOLA: traduzioni lean (name, description, seo.title, seo.content, 3 FAQ, UI minime)
- NO seo.p2, NO faq.q4-q5 per nuovi tool (aggiungerli dopo se c'è spazio)

## Piano di Lavoro

### Batch 1 — Quick Wins: 6 tool inattivi (text/dev, no deps)
| # | Tool ID | Categoria | Status |
|---|---------|-----------|--------|
| 1 | case-converter | text | |
| 2 | diff-checker | text | |
| 3 | markdown-editor | text | |
| 4 | hex-rgb | developer | |
| 5 | url-encoder | developer | |
| 6 | timestamp | developer | |

### Batch 2 — Developer tools: 6 nuovi tool (no deps)
| # | Tool ID | Categoria | Status |
|---|---------|-----------|--------|
| 7 | password-generator | developer | |
| 8 | hash-generator | developer | |
| 9 | uuid-generator | developer | |
| 10 | jwt-decoder | developer | |
| 11 | css-minifier | developer | |
| 12 | sql-formatter | developer | |

### Batch 3 — Image standalone: 6 tool (Canvas API)
| # | Tool ID | Categoria | Status |
|---|---------|-----------|--------|
| 13 | image-compressor | image | |
| 14 | image-resizer | image | |
| 15 | image-cropper | image | |
| 16 | add-text-to-image | image | |
| 17 | meme-maker | image | |
| 18 | image-to-text | image | |

### Batch 4 — Video: 5 tool (FFmpeg.wasm)
| # | Tool ID | Categoria | Status |
|---|---------|-----------|--------|
| 19 | video-converter | video | |
| 20 | merge-videos | video | |
| 21 | crop-video | video | |
| 22 | rotate-video | video | |
| 23 | mute-video | video | |

### Batch 5 — Audio: 6 tool (Web Audio API / FFmpeg)
| # | Tool ID | Categoria | Status |
|---|---------|-----------|--------|
| 24 | audio-joiner | audio | |
| 25 | change-audio-speed | audio | |
| 26 | text-to-speech | audio | |
| 27 | reverse-audio | audio | |
| 28 | audio-equalizer | audio | |
| 29 | change-audio-volume | audio | |

### Batch 6 — Text + Converter: 5 tool
| # | Tool ID | Categoria | Status |
|---|---------|-----------|--------|
| 30 | csv-json | developer | |
| 31 | text-formatter | text | |
| 32 | notepad | text | |
| 33 | markdown-to-html | developer | |
| 34 | find-replace | text | |

### Batch 7 — PDF addizioni: 5 tool
| # | Tool ID | Categoria | Status |
|---|---------|-----------|--------|
| 35 | redact-pdf | pdf | |
| 36 | extract-pdf-images | pdf | |
| 37 | pdf-to-text | pdf | |
| 38 | pdf-metadata | pdf | |
| 39 | grayscale-pdf | pdf | |

### Batch 8 — Video avanzati: 4 tool
| # | Tool ID | Categoria | Status |
|---|---------|-----------|--------|
| 40 | change-video-speed | video | |
| 41 | add-subtitles | video | |
| 42 | resize-video | video | |
| 43 | gif-to-video | video | |

### Post-batch — Traduzioni 7 lingue
- Dopo ogni batch di componenti + EN, tradurre in IT/ES/FR/DE/PT/JA/KO con subagent paralleli

## Checklist per ogni tool
1. Componente in `src/components/tools/{id}.tsx` ("use client", useTranslations)
2. Registry: aggiorna `isAvailable: true` o aggiungi nuova entry
3. tool-loader.tsx: aggiungi dynamic import
4. page.tsx: aggiungi a `implementedToolIds`
5. en.json: name, description, seo (title+content), faq (q1-q3, a1-a3), ui keys
6. Build test
7. Traduci in 7 lingue con subagent paralleli

## Progresso Dettagliato
(aggiornare man mano)

## File Creati/Modificati
(aggiornare man mano)
