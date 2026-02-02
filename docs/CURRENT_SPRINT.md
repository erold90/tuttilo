# Sprint Corrente: PDF Tools Avanzati — Fill & Sign + Editor

## Obiettivo
Aggiungere tool professionali per compilare moduli PDF, firmare documenti e modificare testo con rilevamento automatico del font.

## Task

| # | Task | Status | Note |
|---|------|--------|------|
| P1 | Creare componente pdf-fill-sign.tsx | DONE | Form filling AcroForm + 3 modalità firma |
| P2 | Aggiungere pdf-fill-sign a registry + routing + icon | DONE | PenLine icon, slug: fill-sign |
| P3 | Traduzioni EN + IT per pdf-fill-sign | DONE | Tutte chiavi seo+faq+ui |
| P4 | Traduzioni 6 lingue rimanenti pdf-fill-sign | DONE | ES, FR, DE, PT, JA, KO in parallelo |
| P5 | Creare componente pdf-editor.tsx | DONE | Text editing + add text + freehand drawing |
| P6 | Abilitare pdf-editor in registry + routing | DONE | isAvailable: true |
| P7 | Traduzioni EN + IT per pdf-editor (full seo+faq+ui) | DONE | Sostituite placeholder con traduzioni complete |
| P8 | Traduzioni 6 lingue rimanenti pdf-editor | DONE | ES, FR, DE, PT, JA, KO in parallelo |
| P9 | Build verification | DONE | npx next build OK, zero errori |
| P10 | Push su GitHub | DONE | 3 batch push via MCP |

## Progresso
- Completati: 10/10
- **38 tool totali live su tuttilo.com** (36 precedenti + pdf-fill-sign + pdf-editor)

## Dipendenze installate
- `signature_pad@5.1.3` — Smooth signature drawing con Bezier curves
- `@pdf-lib/fontkit@1.1.1` — Custom font embedding per Unicode
- `fabric@7.1.0` — Canvas object model (disponibile per future features)

## Dettagli Tecnici

### pdf-fill-sign
- Rileva campi AcroForm: PDFTextField, PDFCheckBox, PDFDropdown
- Pre-popola valori esistenti dai campi
- Tre modalità firma: Draw (signature_pad), Type (Georgia italic canvas), Upload (immagine)
- Click-to-place su anteprima PDF con overlay indicatore
- Aspect ratio firma preservato (calcolato da immagine naturale)
- Flatten opzionale per rendere campi non-editabili
- Fallback pdfjs-dist per PDF che pdf-lib non parsifica

### pdf-editor
- **Text extraction**: pdfjs-dist getTextContent() → TextItem con str, transform[6], fontName, width, height
- **Font detection**: textContent.styles[fontName] → fontFamily (serif/sans/mono), ascent, descent
- **Bold/Italic**: page.commonObjs.get(fontName) → nome font reale → regex /bold/i, /italic|oblique/i
- **Font size**: transform[3] (abs) per testo non-ruotato, sqrt(a²+b²) per testo ruotato
- **Font matching**: 12 standard PDF fonts (Helvetica/HelveticaBold/HelveticaOblique/... TimesRoman/... Courier/...)
- **Overlay technique**: drawRectangle(white, x-pad, y+descent-pad, maxW, fontH+2pad) + drawText(newText, x, y, fontSize, font)
- **Drawing**: Strokes in PDF coordinates, render to transparent canvas 2x DPI, embedPng full-page overlay
- **Two-canvas UX**: Preview canvas (pdfjs render) + overlay canvas (highlights, annotations, strokes)

## Sprint Precedenti (Completati)
- Sprint 0-6: 36 tool live
- UX Redesign V2 Fasi 1-3: Homepage, Trust, Legal, Tool UX
- Sprint 7: SEO & Performance (JSON-LD, security headers, manifest)
- PDF Consolidation: 11→5 super-tool
- Agent Loop System: hooks, skills, ralph-loop

## Ultimo aggiornamento
2026-02-02 — pdf-fill-sign + pdf-editor completati con traduzioni 8 lingue. Build OK. Push GitHub in corso.
