# Tuttilo — Piano Sistema PDF Robusto

## ISTRUZIONI PER CLAUDE CODE
**Questo file sopravvive ai /compact. Leggilo SEMPRE a inizio sessione se stai lavorando sui PDF.**

## Stato Generale
- **Tool PDF totali**: 11
- **Problema**: pdf-lib (v1.17.1) non parsifica PDF moderni con XRef Streams + Object Streams (PDF 1.6+)
- **PDF che falliscono**: bancari (ING, etc.), PA, Google Docs, molti software moderni
- **Errore**: `Failed to parse invalid PDF object` / `Invalid object ref: 95 0 R`
- **Ultimo aggiornamento**: 2026-02-01

---

## Ricerca Completata

### Librerie Analizzate

| Libreria | Tipo | Pro | Contro |
|----------|------|-----|--------|
| **pdf-lib** (Hopding) | Manipolazione | API pulita, leggera, 0 deps | Non mantenuta dal 2021, FALLISCE su XRef/ObjStm |
| **@pdfme/pdf-lib** | Fork pdf-lib | Piu mantenuto (2025) | Stesso parser, stessi bug di parsing |
| **pdfjs-dist** (Mozilla) | Rendering | Robustissimo, gestisce TUTTI i PDF | Solo lettura/rendering, non puo manipolare |
| **mupdf** (WASM) | Tutto | Engine C nativo, merge/split/compress/rotate | 13.7MB WASM, API piu complessa |
| **qpdf-wasm** | Repair/Optimize | Puo "riparare" PDF per renderli compatibili | Extra dependency, CLI-based |
| **jsPDF** | Generazione | Leggero | Solo creazione, non manipolazione |
| **pdfmake** | Generazione | JSON-driven | Solo creazione, non manipolazione |

### Fonti
- https://github.com/Hopding/pdf-lib/issues/902 (pdf-lib meno permissivo di PDF.js)
- https://github.com/Hopding/pdf-lib/issues/369 ("Trying to parse invalid object")
- https://github.com/Hopding/pdf-lib/issues/1491 (Failed to parse)
- https://www.npmjs.com/package/mupdf (MuPDF.js v1.27.0)
- https://github.com/neslinesli93/qpdf-wasm (qpdf WASM per browser)
- https://mupdfjs.readthedocs.io/en/latest/ (MuPDF.js docs)

---

## Architettura Decisa

### Strategia: pdf-lib + pdfjs-dist con Fallback Intelligente

**Motivazione**: mupdf (13.7MB WASM) e troppo pesante per Cloudflare Pages edge. La combinazione pdf-lib + pdfjs-dist copre tutti i casi con un fallback.

### Ruolo di Ogni Libreria

| Libreria | Ruolo | Tool |
|----------|-------|------|
| **pdf-lib** | Manipolazione primaria (quando il PDF e compatibile) | compress, merge, split, rotate, unlock, jpg-to-pdf, images-to-pdf |
| **pdfjs-dist** | Rendering + Fallback parsing (quando pdf-lib fallisce) | pdf-to-jpg, pdf-to-png, pdf-to-word, + FALLBACK per tutti i pdf-lib tools |
| **mammoth** | DOCX parsing | word-to-pdf |

### Utility Condivisa: `src/lib/pdf-utils.ts`

```
loadPdfRobust(bytes, opts?) → PDFDocument
  1. Tenta PDFDocument.load() con pdf-lib
  2. Se fallisce → pdfjs-dist renderizza pagine come JPEG
  3. Crea nuovo PDFDocument pulito con le immagini
  4. Chiama opts.onProgress(%) durante la ricostruzione
  5. Ritorna il PDFDocument pronto per qualsiasi operazione

getPdfPageCount(bytes) → number
  1. Tenta pdf-lib per conteggio pagine (veloce)
  2. Se fallisce → usa pdfjs-dist (leggero, nessuna ricostruzione)
```

**Nota**: La ricostruzione via pdfjs-dist perde la selezionabilita del testo. E un trade-off accettabile perche l'alternativa e rifiutare il PDF completamente.

---

## Piano Implementazione

### Fase 1: Fallback System (DONE)

- [x] Creato `src/lib/pdf-utils.ts` con `loadPdfRobust()` e `getPdfPageCount()`
- [x] `compress-pdf.tsx` — Rimossa validazione pdf-lib all'upload, usa `loadPdfRobust()` alla compressione
- [x] `merge-pdf.tsx` — `getPdfPageCount()` per conteggio, `loadPdfRobust()` al merge
- [x] `split-pdf.tsx` — `getPdfPageCount()` per conteggio, `loadPdfRobust()` allo split
- [x] `rotate-pdf.tsx` — `getPdfPageCount()` per conteggio, `loadPdfRobust()` alla rotazione
- [x] `unlock-pdf.tsx` — `loadPdfRobust()` come primo tentativo
- [x] MIME check permissivo su tutti 8 tool (accetta .pdf anche senza MIME corretto)
- [x] Build OK
- [x] Pushato su GitHub

### Fase 2: Hardening pdfjs-dist Tools (DONE)

I tool che usano pdfjs-dist diretto gestiscono gia tutti i PDF. Hardening completato:

- [x] `pdf-to-jpg.tsx` — Aggiunto `doc.destroy()` (fix memory leak)
- [x] `pdf-to-png.tsx` — Aggiunto `doc.destroy()` (fix memory leak)
- [x] `pdf-to-word.tsx` — Aggiunto `doc.destroy()` (fix memory leak)
- [x] `pdf-utils.ts` — Canvas cleanup (width/height=0) in reconstructPdf

### Fase 3: Ottimizzazione UX Fallback (DONE)

Migliorata UX durante il fallback pdfjs-dist:

- [x] `loadPdfRobust()` accetta `onProgress` callback — mostra percentuale durante ricostruzione
- [x] compress-pdf: progress % visibile durante elaborazione PDF complessi
- [x] merge-pdf: progress per file (es. "2/5") durante merge
- [x] split-pdf: progress % durante caricamento PDF complessi
- [x] rotate-pdf: progress % durante caricamento PDF complessi
- [x] unlock-pdf: progress % durante caricamento PDF complessi
- [x] Qualita JPEG fallback: scale 2 (144 DPI) + quality 0.92 (buon bilanciamento dimensione/qualita)

### Fase 4: Migrazione Futura a mupdf (OPZIONALE)

Se in futuro il bundle size non e un problema o si vuole qualita professionale:

- [ ] Installare `mupdf` npm package
- [ ] Creare Web Worker per mupdf (non blocca UI thread)
- [ ] Migrare compress/merge/split/rotate a mupdf nativo
- [ ] Mantiene testo selezionabile (nessuna ricostruzione immagini)
- [ ] ~13.7MB WASM caricato lazy alla prima operazione PDF

---

## Mappa Tool PDF

| # | Tool | File | Engine Primario | Fallback |
|---|------|------|-----------------|----------|
| 1 | Compress PDF | compress-pdf.tsx | pdf-lib → `loadPdfRobust` | pdfjs-dist reconstruction |
| 2 | Merge PDF | merge-pdf.tsx | pdf-lib → `loadPdfRobust` | pdfjs-dist reconstruction |
| 3 | Split PDF | split-pdf.tsx | pdf-lib → `loadPdfRobust` | pdfjs-dist reconstruction |
| 4 | Rotate PDF | rotate-pdf.tsx | pdf-lib → `loadPdfRobust` | pdfjs-dist reconstruction |
| 5 | Unlock PDF | unlock-pdf.tsx | pdf-lib → `loadPdfRobust` | pdfjs-dist + password |
| 6 | PDF to JPG | pdf-to-jpg.tsx | pdfjs-dist diretto | - (gia robusto) |
| 7 | PDF to PNG | pdf-to-png.tsx | pdfjs-dist diretto | - (gia robusto) |
| 8 | PDF to Word | pdf-to-word.tsx | pdfjs-dist diretto | - (gia robusto) |
| 9 | JPG to PDF | jpg-to-pdf.tsx | pdf-lib (crea nuovo) | - (nessun parsing) |
| 10 | Images to PDF | images-to-pdf.tsx | pdf-lib (crea nuovo) | - (nessun parsing) |
| 11 | Word to PDF | word-to-pdf.tsx | mammoth + browser print | - (nessun parsing PDF) |

---

## File Creati/Modificati

- `src/lib/pdf-utils.ts` — Utility condivisa (loadPdfRobust, getPdfPageCount)
- `src/components/tools/compress-pdf.tsx` — Usa loadPdfRobust + progress
- `src/components/tools/merge-pdf.tsx` — Usa loadPdfRobust + getPdfPageCount + progress per file
- `src/components/tools/split-pdf.tsx` — Usa loadPdfRobust + getPdfPageCount + progress
- `src/components/tools/rotate-pdf.tsx` — Usa loadPdfRobust + getPdfPageCount + progress
- `src/components/tools/unlock-pdf.tsx` — Usa loadPdfRobust + progress
- `src/components/tools/pdf-to-jpg.tsx` — MIME check permissivo + doc.destroy()
- `src/components/tools/pdf-to-png.tsx` — MIME check permissivo + doc.destroy()
- `src/components/tools/pdf-to-word.tsx` — MIME check permissivo + doc.destroy()
- `docs/PDF_SYSTEM_PLAN.md` — Questo file (piano documentato)
