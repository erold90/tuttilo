# Tuttilo — Roadmap Testing & Bug Fix (36 Tool)

## ISTRUZIONI PER CLAUDE CODE
**DOPO OGNI /compact o /clear, leggi QUESTO file per sapere cosa fare.**
1. Leggi `docs/TESTING_ROADMAP.md` (questo file)
2. Trova il primo batch con status `IN CORSO` o `TODO`
3. Continua da dove eri rimasto
4. Dopo ogni fix: aggiorna status tool in questo file, committa, pusha

## Stato Generale
- **Tool totali**: 36 disponibili (isAvailable: true)
- **Tool testati**: 6/36
- **Bug trovati**: 5
- **Bug fixati**: 5
- **Ultimo aggiornamento**: 2026-01-31

---

## BATCH 1: Text/Dev Tools (6 tool) — Status: DONE

### T01. Word Counter `/en/text/word-counter`
- **File**: `src/components/tools/word-counter.tsx`
- **Test**: Digitare testo → verificare conteggio parole, caratteri, frasi, paragrafi, tempi lettura
- **Bug fixati**:
  - readingTime/speakingTime mostrava "1 min" con 0 parole → ora mostra "0 min"
- **Status**: DONE

### T02. JSON Formatter `/en/developer/json-formatter`
- **File**: `src/components/tools/json-formatter.tsx`
- **Test**: Incollare JSON valido → format/minify. JSON invalido → errore chiaro
- **Bug fixati**:
  - `catch (e: any)` → `catch (e: unknown)` con type guard
- **Status**: DONE

### T03. Base64 Encoder `/en/developer/base64`
- **File**: `src/components/tools/base64-encoder.tsx`
- **Test**: Encode/decode testo ASCII e Unicode (emoji, caratteri CJK)
- **Bug fixati**:
  - Rimosso `escape()`/`unescape()` deprecated → TextEncoder/TextDecoder moderno
  - Supporta correttamente emoji e caratteri non-BMP
- **Status**: DONE

### T04. Lorem Ipsum `/en/text/lorem-ipsum`
- **File**: `src/components/tools/lorem-ipsum.tsx`
- **Test**: Generare paragrafi/frasi/parole, copiare, verificare output
- **Bug fixati**:
  - Aggiunto `Math.min(100, ...)` per cappare input a 100
- **Status**: DONE

### T05. Color Picker `/en/developer/color-picker`
- **File**: `src/components/tools/color-picker.tsx`
- **Test**: Selezionare colore, copiare HEX/RGB/HSL/RGBA, input HEX manuale
- **Note**: HEX incompleto gestito con fallback a colore default. Funziona correttamente.
- **Status**: DONE (nessun fix necessario)

### T06. Regex Tester `/en/developer/regex-tester`
- **File**: `src/components/tools/regex-tester.tsx`
- **Test**: Pattern semplici e complessi, flag g/i/m/s, capturing groups
- **Bug fixati**:
  - Rimosso `setError` side-effect da `useMemo` → ora restituisce `matchError` nel return
  - `catch (e: any)` → `catch (e: unknown)` con type guard
  - Aggiunto limite MAX_MATCHES=500 come protezione anti-loop
  - Nota: la protezione `regex.lastIndex++` su zero-length match era gia corretta
- **Status**: DONE

---

## BATCH 2: Image Tools (8 tool) — Status: TODO

### T07. Compress Image `/en/image/compress`
- **File**: `src/components/tools/compress-image.tsx`
- **Test**: Caricare JPG/PNG/WebP, regolare qualità, verificare riduzione peso
- **Bug noti dal codice**:
  - PNG perde trasparenza (fallback JPEG)
  - Memory leak su URL.createObjectURL
- **Status**: TODO
- **Fix applicati**: —

### T08. Resize Image `/en/image/resize`
- **File**: `src/components/tools/resize-image.tsx`
- **Test**: Ridimensionare con lock ratio ON/OFF, preset %, valori custom
- **Bug noti dal codice**:
  - Lock ratio non ricalcolato al cambio file
  - Qualità fissa 0.92 anche per PNG
- **Status**: TODO
- **Fix applicati**: —

### T09. Crop Image `/en/image/crop`
- **File**: `src/components/tools/crop-image.tsx`
- **Test**: Crop con preset aspect ratio (1:1, 16:9, 4:3, 3:2, free)
- **Bug noti dal codice**:
  - Type casting `as any` su Cropper
  - Cropper non distrutta al reset (memory leak)
- **Status**: TODO
- **Fix applicati**: —

### T10. PNG to JPG `/en/image/png-to-jpg`
- **File**: `src/components/tools/png-to-jpg.tsx`
- **Test**: Convertire PNG (con e senza trasparenza), verificare background bianco
- **Bug noti dal codice**:
  - Background sempre bianco (non configurabile)
  - No warning perdita trasparenza
- **Status**: TODO
- **Fix applicati**: —

### T11. JPG to PNG `/en/image/jpg-to-png`
- **File**: `src/components/tools/jpg-to-png.tsx`
- **Test**: Convertire JPG, verificare output PNG lossless
- **Bug noti dal codice**:
  - File potrebbe essere piu grande (nessun warning)
- **Status**: TODO
- **Fix applicati**: —

### T12. WebP to PNG `/en/image/webp-to-png`
- **File**: `src/components/tools/webp-to-png.tsx`
- **Test**: Convertire WebP in PNG, verificare qualita
- **Bug noti dal codice**:
  - Codice duplicato con jpg-to-png
- **Status**: TODO
- **Fix applicati**: —

### T13. WebP to JPG `/en/image/webp-to-jpg`
- **File**: `src/components/tools/webp-to-jpg.tsx`
- **Test**: Convertire WebP in JPG, regolare qualita
- **Bug noti dal codice**:
  - Codice duplicato con png-to-jpg
- **Status**: TODO
- **Fix applicati**: —

### T14. HEIC to JPG `/en/image/heic-to-jpg`
- **File**: `src/components/tools/heic-to-jpg.tsx`
- **Test**: Convertire HEIC da iPhone, verificare output JPG
- **Bug noti dal codice**:
  - Multi-image: prende solo prima immagine
  - No preview pre-conversione
  - Qualita non configurabile (fissa 0.92)
- **Status**: TODO
- **Fix applicati**: —

---

## BATCH 3: PDF Core (6 tool) — Status: TODO

### T15. Merge PDF `/en/pdf/merge`
- **File**: `src/components/tools/merge-pdf.tsx`
- **Test**: Unire 2+ PDF, riordinare, verificare output
- **Bug noti dal codice**:
  - No limite massimo file caricabili
- **Status**: TODO
- **Fix applicati**: —

### T16. Split PDF `/en/pdf/split`
- **File**: `src/components/tools/split-pdf.tsx`
- **Test**: Dividere per pagina singola e per range (es. "1-3,5,7-10")
- **Bug noti dal codice**:
  - Range malformato ignorato silenziosamente
  - Range start > end non validato
- **Status**: TODO
- **Fix applicati**: —

### T17. Compress PDF `/en/pdf/compress`
- **File**: `src/components/tools/compress-pdf.tsx`
- **Test**: Comprimere PDF, verificare riduzione peso
- **Bug noti dal codice**:
  - Compressione debole (solo metadata + object streams, non comprime immagini)
- **Status**: TODO
- **Fix applicati**: —

### T18. PDF to JPG `/en/pdf/to-jpg`
- **File**: `src/components/tools/pdf-to-jpg.tsx`
- **Test**: Convertire PDF multi-pagina in JPG, regolare qualita
- **Bug noti dal codice**:
  - Worker CDN dipendenza singola (cdnjs)
  - RAM alta con PDF grandi
- **Status**: TODO
- **Fix applicati**: —

### T19. JPG to PDF `/en/pdf/from-jpg`
- **File**: `src/components/tools/jpg-to-pdf.tsx`
- **Test**: Caricare JPG/PNG/WebP, riordinare, generare PDF
- **Bug noti dal codice**:
  - WebP doppia conversione (inefficiente)
- **Status**: TODO
- **Fix applicati**: —

### T20. Rotate PDF `/en/pdf/rotate`
- **File**: `src/components/tools/rotate-pdf.tsx`
- **Test**: Ruotare 90/180/270, tutte pagine e range custom
- **Bug noti dal codice**:
  - No preview rotazioni
  - Rotazione cumulativa se lanciata 2 volte
- **Status**: TODO
- **Fix applicati**: —

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
- **Test**: Generare QR con testo/URL, personalizzare colori, scaricare PNG
- **Bug noti dal codice**:
  - No limite lunghezza testo
- **Status**: TODO
- **Fix applicati**: —

### T27. SVG to PNG `/en/image/svg-to-png`
- **File**: `src/components/tools/svg-to-png.tsx`
- **Test**: Convertire SVG semplice e complesso, testare scale 1-4x
- **Bug noti dal codice**:
  - Memory leak ObjectURL
  - SVG con CSS inline potrebbe fallire
- **Status**: TODO
- **Fix applicati**: —

### T28. Voice Recorder `/en/audio/voice-recorder`
- **File**: `src/components/tools/voice-recorder.tsx`
- **Test**: Registrare audio, pausa/resume, scaricare WEBM
- **Bug noti dal codice**:
  - No retry se permesso microfono negato
  - Timer leak su unmount
- **Status**: TODO
- **Fix applicati**: —

### T29. Screen Recorder `/en/video/screen-recorder`
- **File**: `src/components/tools/screen-recorder.tsx`
- **Test**: Registrare schermo con/senza audio, pausa, scaricare
- **Bug noti dal codice**:
  - Race condition su ended event
- **Status**: TODO
- **Fix applicati**: —

### T30. Video to MP3 `/en/video/to-mp3`
- **File**: `src/components/tools/video-to-mp3.tsx`
- **Test**: Estrarre audio da video, verificare output
- **Bug noti dal codice**:
  - **CRITICO**: Output WAV, non MP3! Nome tool ingannevole
  - AudioContext leak su errore
- **Status**: TODO
- **Fix applicati**: —

### T31. Audio Cutter `/en/audio/cutter`
- **File**: `src/components/tools/audio-cutter.tsx`
- **Test**: Caricare audio, selezionare range su waveform, tagliare, scaricare
- **Bug noti dal codice**:
  - Play/stop bug (riavvia da inizio)
  - Memory leak OfflineAudioContext
- **Status**: TODO
- **Fix applicati**: —

---

## BATCH 6: Video Tools (5 tool) — Status: TODO

### T32. Compress Video `/en/video/compress`
- **File**: `src/components/tools/compress-video.tsx` (via ffmpeg-tools.tsx wrapper)
- **Test**: Comprimere video con 3 livelli qualita, verificare riduzione
- **Bug noti dal codice**:
  - No timeout su FFmpeg init
  - Cast aggressivo Uint8Array
- **Status**: TODO
- **Fix applicati**: —

### T33. Trim Video `/en/video/trim`
- **File**: `src/components/tools/trim-video.tsx` (via ffmpeg-tools.tsx wrapper)
- **Test**: Tagliare video con range slider, verificare output
- **Bug noti dal codice**:
  - Race condition su loadedmetadata
  - Start/end logic fragile se end=0
- **Status**: TODO
- **Fix applicati**: —

### T34. Video to GIF `/en/video/to-gif`
- **File**: `src/components/tools/video-to-gif.tsx` (via ffmpeg-tools.tsx wrapper)
- **Test**: Convertire video in GIF, testare fps/width/durata
- **Bug noti dal codice**:
  - Limite 10sec default non spiegato in UI
  - Due passate FFmpeg (lento)
- **Status**: TODO
- **Fix applicati**: —

### T35. Audio Converter `/en/audio/converter`
- **File**: `src/components/tools/audio-converter.tsx` (via ffmpeg-tools.tsx wrapper)
- **Test**: Convertire tra MP3/WAV/OGG/FLAC/AAC
- **Bug noti dal codice**:
  - Accetta qualsiasi file (non solo audio)
  - No check codec availability
- **Status**: TODO
- **Fix applicati**: —

### T36. YouTube Thumbnail `/en/youtube/thumbnail`
- **File**: `src/components/tools/youtube-thumbnail.tsx`
- **Test**: URL YouTube vari formati (watch, youtu.be, shorts, embed, video ID)
- **Bug noti dal codice**:
  - Possibile CORS su fetch i.ytimg.com
  - Regex assume 11 caratteri (potrebbe cambiare)
- **Status**: TODO
- **Fix applicati**: —

---

## BATCH 7: Navigazione & i18n — Status: TODO

### T37. Navigazione pagine
- **Test**: Ogni URL tool raggiungibile in EN e IT
- **Verifiche**: 404 assenti, breadcrumb corretti, SEO metadata
- **Status**: TODO

### T38. Traduzioni 8 lingue
- **Test**: Verificare che nessuna chiave traduzione manchi (no key fallback visibile)
- **Lingue**: EN, IT, ES, FR, DE, PT, JA, KO
- **Status**: TODO

### T39. Build & Deploy
- **Test**: `next build` OK, `pages:build` OK, deploy Cloudflare OK
- **Status**: TODO

---

## BUG CRITICI DA RISOLVERE (priorita)

| # | Tool | Bug | Severita | Status |
|---|------|-----|----------|--------|
| B01 | video-to-mp3 | Output WAV non MP3 — nome tool ingannevole | CRITICA | TODO |
| B02 | regex-tester | setError in useMemo + no max matches | MEDIA | DONE (MAX_MATCHES=500, matchError nel return) |
| B03 | word-to-pdf | Richiede Print dialog manuale | ALTA | TODO |
| B04 | pdf-to-word | Cast unsafe transform, threshold arbitrario | ALTA | TODO |
| B05 | unlock-pdf | Falso positivo owner-password | ALTA | TODO |
| B06 | base64 | escape()/unescape() deprecated | MEDIA | DONE (TextEncoder/TextDecoder) |
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
   a. Avvia dev server (se non attivo): npm run dev
   b. Apri URL nel browser (o verifica via codice)
   c. Analizza codice per bug noti
   d. Fixa bug trovati
   e. Aggiorna status in questo file
4. Dopo batch completato: build test, committa, pusha
5. Aggiorna SESSION_HANDOFF.md
```
