# Tuttilo — Roadmap Testing & Bug Fix (36 Tool)

## ISTRUZIONI PER CLAUDE CODE
**DOPO OGNI /compact o /clear, leggi QUESTO file per sapere cosa fare.**
1. Leggi `docs/TESTING_ROADMAP.md` (questo file)
2. Trova il primo batch con status `IN CORSO` o `TODO`
3. Continua da dove eri rimasto
4. Dopo ogni fix: aggiorna status tool in questo file, committa, pusha

## Stato Generale
- **Tool totali**: 36 disponibili (isAvailable: true)
- **Tool testati**: 20/36
- **Bug trovati**: 5
- **Bug fixati**: 5
- **Ultimo aggiornamento**: 2026-01-31

---

## BATCH 1: Text/Dev Tools (6 tool) — Status: DONE

### T01. Word Counter `/en/text/word-counter`
- **File**: `src/components/tools/word-counter.tsx`
- **Bug fixati**: readingTime/speakingTime "1 min" con 0 parole → "0 min"
- **Status**: DONE

### T02. JSON Formatter `/en/developer/json-formatter`
- **File**: `src/components/tools/json-formatter.tsx`
- **Bug fixati**: `catch (e: any)` → `catch (e: unknown)` con type guard
- **Status**: DONE

### T03. Base64 Encoder `/en/developer/base64`
- **File**: `src/components/tools/base64-encoder.tsx`
- **Bug fixati**: Rimosso escape()/unescape() → TextEncoder/TextDecoder
- **Status**: DONE

### T04. Lorem Ipsum `/en/text/lorem-ipsum`
- **File**: `src/components/tools/lorem-ipsum.tsx`
- **Bug fixati**: Aggiunto Math.min(100) cap
- **Status**: DONE

### T05. Color Picker `/en/developer/color-picker`
- **File**: `src/components/tools/color-picker.tsx`
- **Status**: DONE (nessun fix necessario)

### T06. Regex Tester `/en/developer/regex-tester`
- **File**: `src/components/tools/regex-tester.tsx`
- **Bug fixati**: setError in useMemo → matchError return, MAX_MATCHES=500, catch unknown
- **Status**: DONE

---

## BATCH 2: Image Tools (8 tool) — Status: DONE

### T07. Compress Image — DONE
- **Bug fixati**: img.onerror handler + URL cleanup in reset()

### T08. Resize Image — DONE
- **Bug fixati**: URL cleanup in reset()

### T09. Crop Image — DONE
- **Bug fixati**: URL cleanup in reset()

### T10. PNG to JPG — DONE
- **Bug fixati**: URL cleanup in reset()

### T11. JPG to PNG — DONE
- **Bug fixati**: URL cleanup in reset()

### T12. WebP to PNG — DONE
- **Bug fixati**: URL cleanup in reset()

### T13. WebP to JPG — DONE
- **Bug fixati**: URL cleanup in reset()

### T14. HEIC to JPG — DONE
- **Bug fixati**: URL cleanup in reset()

---

## BATCH 3: PDF Core (6 tool) — Status: DONE

### T15. Merge PDF — DONE (nessun fix necessario)
- URL cleanup gia presente. Codice solido.

### T16. Split PDF — DONE (nessun fix necessario)
- Range parsing gia validata. URL cleanup in reset.

### T17. Compress PDF — DONE (nessun fix necessario)
- Compressione limitata a metadata+object streams (limitazione pdf-lib). URL cleanup presente.

### T18. PDF to JPG — DONE (nessun fix necessario)
- Worker CDN funzionante. URL cleanup in reset. Progress bar OK.

### T19. JPG to PDF — DONE (nessun fix necessario)
- WebP doppia conversione necessaria. URL cleanup in removeImage e reset.

### T20. Rotate PDF — DONE (nessun fix necessario)
- Rotazione cumulativa non e un problema (UI richiede reset). URL cleanup presente.

---

## BATCH 4: PDF Avanzato (5 tool) — Status: TODO

### T21. PDF to PNG `/en/pdf/to-png`
- **File**: `src/components/tools/pdf-to-png.tsx`
- **Test**: Convertire PDF in PNG con scale 1-4x, opzione trasparenza
- **Bug noti dal codice**:
  - Scale 4x su A4 = 2480x3508px (RAM critica)
- **Status**: TODO
- **Fix applicati**: —

### T22. Images to PDF `/en/pdf/from-images`
- **File**: `src/components/tools/images-to-pdf.tsx`
- **Test**: Caricare immagini multiple, testare page size (fit/A4/Letter), margini
- **Bug noti dal codice**:
  - Unita inconsistenti (punti PDF vs pixel)
- **Status**: TODO
- **Fix applicati**: —

### T23. Unlock PDF `/en/pdf/unlock`
- **File**: `src/components/tools/unlock-pdf.tsx`
- **Test**: PDF con owner-password, PDF con user-password, PDF non protetto
- **Bug noti dal codice**:
  - **CRITICO**: Falso positivo su owner-only passwords
  - Metodo 2 converte in JPEG lossy (qualita persa)
- **Status**: TODO
- **Fix applicati**: —

### T24. Word to PDF `/en/pdf/from-word`
- **File**: `src/components/tools/word-to-pdf.tsx`
- **Test**: Caricare .docx, verificare anteprima HTML, testare stampa/PDF
- **Bug noti dal codice**:
  - **CRITICO**: Richiede azione manuale (Print dialog)
  - Potenziale XSS da DOCX malformato
- **Status**: TODO
- **Fix applicati**: —

### T25. PDF to Word `/en/pdf/to-word`
- **File**: `src/components/tools/pdf-to-word.tsx`
- **Test**: Convertire PDF con testo, verificare heading detection, page breaks
- **Bug noti dal codice**:
  - **CRITICO**: Cast unsafe su transform array
  - Threshold Y arbitrario (5px)
  - Solo testo (niente immagini)
  - PDF scansionati: fallimento silenzioso
- **Status**: TODO
- **Fix applicati**: —

---

## BATCH 5: Audio/Media (6 tool) — Status: TODO

### T26. QR Code Generator `/en/developer/qr-code`
- **File**: `src/components/tools/qr-code.tsx`
- **Status**: TODO

### T27. SVG to PNG `/en/image/svg-to-png`
- **File**: `src/components/tools/svg-to-png.tsx`
- **Status**: TODO

### T28. Voice Recorder `/en/audio/voice-recorder`
- **File**: `src/components/tools/voice-recorder.tsx`
- **Status**: TODO

### T29. Screen Recorder `/en/video/screen-recorder`
- **File**: `src/components/tools/screen-recorder.tsx`
- **Status**: TODO

### T30. Video to MP3 `/en/video/to-mp3`
- **File**: `src/components/tools/video-to-mp3.tsx`
- **Bug noti**: **CRITICO** Output WAV non MP3
- **Status**: TODO

### T31. Audio Cutter `/en/audio/cutter`
- **File**: `src/components/tools/audio-cutter.tsx`
- **Status**: TODO

---

## BATCH 6: Video Tools (5 tool) — Status: TODO

### T32. Compress Video `/en/video/compress`
- **File**: `src/components/tools/compress-video.tsx`
- **Status**: TODO

### T33. Trim Video `/en/video/trim`
- **File**: `src/components/tools/trim-video.tsx`
- **Status**: TODO

### T34. Video to GIF `/en/video/to-gif`
- **File**: `src/components/tools/video-to-gif.tsx`
- **Status**: TODO

### T35. Audio Converter `/en/audio/converter`
- **File**: `src/components/tools/audio-converter.tsx`
- **Status**: TODO

### T36. YouTube Thumbnail `/en/youtube/thumbnail`
- **File**: `src/components/tools/youtube-thumbnail.tsx`
- **Status**: TODO

---

## BATCH 7: Navigazione & i18n — Status: TODO

### T37. Navigazione pagine — TODO
### T38. Traduzioni 8 lingue — TODO
### T39. Build & Deploy — TODO

---

## BUG CRITICI DA RISOLVERE (priorita)

| # | Tool | Bug | Severita | Status |
|---|------|-----|----------|--------|
| B01 | video-to-mp3 | Output WAV non MP3 | CRITICA | TODO |
| B02 | regex-tester | setError in useMemo + no max matches | MEDIA | DONE |
| B03 | word-to-pdf | Richiede Print dialog manuale | ALTA | TODO |
| B04 | pdf-to-word | Cast unsafe transform, threshold arbitrario | ALTA | TODO |
| B05 | unlock-pdf | Falso positivo owner-password | ALTA | TODO |
| B06 | base64 | escape()/unescape() deprecated | MEDIA | DONE |
| B07 | screen-recorder | Race condition ended event | MEDIA | TODO |
| B08 | audio-cutter | Play/stop bug | MEDIA | TODO |
| B09 | compress-image | PNG perde trasparenza | MEDIA | TODO |
| B10 | audio-converter | Accetta qualsiasi file tipo | MEDIA | TODO |

---

## WORKFLOW PER SESSIONE

```
1. Leggi docs/TESTING_ROADMAP.md
2. Trova primo batch TODO/IN CORSO
3. Per ogni tool nel batch:
   a. Analizza codice per bug
   b. Fixa bug trovati
   c. Aggiorna status in questo file
4. Dopo batch completato: build test, pusha
5. Aggiorna SESSION_HANDOFF.md
```
