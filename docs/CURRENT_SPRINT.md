# Sprint Corrente: Sprint 5 — PDF Avanzato (5 tool)

## Obiettivo
Implementare 5 tool PDF avanzati: PDF→PNG, Images→PDF, Unlock PDF, Word→PDF, PDF→Word. Tutto client-side con pdfjs-dist, pdf-lib, mammoth, docx.

## REGOLA CRITICA: 8 LINGUE
Ogni pagina, componente e contenuto DEVE essere tradotto in TUTTE le 8 lingue:
EN (default), IT, ES, FR, DE, PT, JA, KO.
File traduzioni: src/messages/{locale}.json

## Task

| # | Task | Status | Note |
|---|------|--------|------|
| 5.1 | PDF to PNG component | DONE | pdfjs-dist, scale 1x-4x, transparent bg, ZIP download |
| 5.2 | Images to PDF component | DONE | pdf-lib, page size/margin options, reorder images |
| 5.3 | Unlock PDF component | DONE | pdf-lib ignoreEncryption + pdfjs-dist password fallback |
| 5.4 | Word to PDF component | DONE | mammoth DOCX→HTML, iframe + browser print |
| 5.5 | PDF to Word component | DONE | pdfjs-dist text extraction, docx library for DOCX |
| 5.6 | Registry update (5 tool available) | DONE | isAvailable: true for 5 tools |
| 5.7 | Tool page imports + mapping | DONE | 5 new imports + toolComponents entries |
| 5.8 | Traduzioni 8 lingue (seo+faq+ui) | DONE | EN, IT, ES, FR, DE, PT, JA, KO |
| 5.9 | Build verification | DONE | npm run pages:build OK |
| 5.10 | Push GitHub | DONE | MCP push — tutti i file pushati su main |
| 5.11 | Deploy Cloudflare Pages | DONE | wrangler pages deploy — 31 tool totali |

## Progresso
- Completati: 11/11
- In corso: 0/11
- Rimanenti: 0/11

## Dependencies
- mammoth: ^1.9.0 (DOCX → HTML conversion)
- docx: ^9.4.1 (DOCX file creation)
- pdfjs-dist: (PDF rendering, text extraction)
- pdf-lib: (PDF manipulation, image embedding)

## Ultimo aggiornamento
2026-01-31 — Sprint 5 COMPLETATO: 11/11 task. 5 componenti + registry + imports + traduzioni 8 lingue + push GitHub + deploy Cloudflare Pages. 31 tool totali live su tuttilo.com.
