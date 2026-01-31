# Tuttilo — Roadmap Testing & Bug Fix (36 Tool)

## ISTRUZIONI PER CLAUDE CODE
**DOPO OGNI /compact o /clear, leggi QUESTO file per sapere cosa fare.**
1. Leggi `docs/TESTING_ROADMAP.md` (questo file)
2. Trova il primo batch con status `IN CORSO` o `TODO`
3. Continua da dove eri rimasto
4. Dopo ogni fix: aggiorna status tool in questo file, committa, pusha

## Stato Generale
- **Tool totali**: 36 disponibili (isAvailable: true)
- **Tool testati**: 36/36
- **Bug trovati**: 11
- **Bug fixati**: 11
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

## BATCH 2: Image Tools (8 tool) — Status: DONE

### T07. Compress Image `/en/image/compress`
- **File**: `src/components/tools/compress-image.tsx`
- **Test**: Caricare JPG/PNG/WebP, regolare qualità, verificare riduzione peso
- **Bug fixati**:
  - Aggiunto `img.onerror` handler nel fallback canvas (UI non restava bloccata)
  - Memory leak: aggiunto `URL.revokeObjectURL()` in reset()
- **Note**: PNG perde trasparenza nel fallback JPEG — comportamento accettabile per compressione
- **Status**: DONE

### T08. Resize Image `/en/image/resize`
- **File**: `src/components/tools/resize-image.tsx`
- **Test**: Ridimensionare con lock ratio ON/OFF, preset %, valori custom
- **Bug fixati**:
  - Memory leak: aggiunto `URL.revokeObjectURL()` in reset()
- **Note**: Qualita 0.92 per PNG accettabile (canvas toBlob PNG e lossless, quality ignorata)
- **Status**: DONE

### T09. Crop Image `/en/image/crop`
- **File**: `src/components/tools/crop-image.tsx`
- **Test**: Crop con preset aspect ratio (1:1, 16:9, 4:3, 3:2, free)
- **Bug fixati**:
  - Memory leak: aggiunto `URL.revokeObjectURL()` in reset()
- **Note**: `as any` su Cropper necessario per tipizzazione react-cropper, non un bug
- **Status**: DONE

### T10. PNG to JPG `/en/image/png-to-jpg`
- **File**: `src/components/tools/png-to-jpg.tsx`
- **Test**: Convertire PNG (con e senza trasparenza), verificare background bianco
- **Bug fixati**:
  - Memory leak: aggiunto `URL.revokeObjectURL()` in reset()
- **Note**: Background bianco e il comportamento standard per PNG→JPG
- **Status**: DONE

### T11. JPG to PNG `/en/image/jpg-to-png`
- **File**: `src/components/tools/jpg-to-png.tsx`
- **Test**: Convertire JPG, verificare output PNG lossless
- **Bug fixati**:
  - Memory leak: aggiunto `URL.revokeObjectURL()` in reset()
- **Status**: DONE

### T12. WebP to PNG `/en/image/webp-to-png`
- **File**: `src/components/tools/webp-to-png.tsx`
- **Test**: Convertire WebP in PNG, verificare qualita
- **Bug fixati**:
  - Memory leak: aggiunto `URL.revokeObjectURL()` in reset()
- **Status**: DONE

### T13. WebP to JPG `/en/image/webp-to-jpg`
- **File**: `src/components/tools/webp-to-jpg.tsx`
- **Test**: Convertire WebP in JPG, regolare qualita
- **Bug fixati**:
  - Memory leak: aggiunto `URL.revokeObjectURL()` in reset()
- **Status**: DONE

### T14. HEIC to JPG `/en/image/heic-to-jpg`
- **File**: `src/components/tools/heic-to-jpg.tsx`
- **Test**: Convertire HEIC da iPhone, verificare output JPG
- **Bug fixati**:
  - Memory leak: aggiunto `URL.revokeObjectURL()` in reset()
- **Note**: Multi-image prende prima immagine — comportamento accettabile. No preview pre-conversione perche HEIC non supportato nativamente dai browser.
- **Status**: DONE

---

## BATCH 3: PDF Core (6 tool) — Status: DONE

### T15. Merge PDF `/en/pdf/merge`
- **File**: `src/components/tools/merge-pdf.tsx`
- **Test**: Unire 2+ PDF, riordinare, verificare output
- **Note**: URL cleanup gia presente in reset e prima di re-merge. Codice solido.
- **Status**: DONE (nessun fix necessario)

### T16. Split PDF `/en/pdf/split`
- **File**: `src/components/tools/split-pdf.tsx`
- **Test**: Dividere per pagina singola e per range (es. "1-3,5,7-10")
- **Note**: Range parsing gia validata (start>=1, end<=max, start<=end). Range malformati ignorati ma errore se tutti invalidi. URL cleanup in reset.
- **Status**: DONE (nessun fix necessario)

### T17. Compress PDF `/en/pdf/compress`
- **File**: `src/components/tools/compress-pdf.tsx`
- **Test**: Comprimere PDF, verificare riduzione peso
- **Note**: Compressione limitata a metadata+object streams — limitazione pdf-lib, non un bug. URL cleanup presente.
- **Status**: DONE (nessun fix necessario)

### T18. PDF to JPG `/en/pdf/to-jpg`
- **File**: `src/components/tools/pdf-to-jpg.tsx`
- **Test**: Convertire PDF multi-pagina in JPG, regolare qualita
- **Note**: Worker CDN (cdnjs) funziona correttamente. URL cleanup in reset. Progress bar funzionante.
- **Status**: DONE (nessun fix necessario)

### T19. JPG to PDF `/en/pdf/from-jpg`
- **File**: `src/components/tools/jpg-to-pdf.tsx`
- **Test**: Caricare JPG/PNG/WebP, riordinare, generare PDF
- **Note**: WebP doppia conversione necessaria (pdf-lib non supporta WebP embed). URL cleanup in removeImage e reset.
- **Status**: DONE (nessun fix necessario)

### T20. Rotate PDF `/en/pdf/rotate`
- **File**: `src/components/tools/rotate-pdf.tsx`
- **Test**: Ruotare 90/180/270, tutte pagine e range custom
- **Note**: Rotazione cumulativa non e un problema — UI mostra risultato e richiede reset per ri-ruotare. URL cleanup presente.
- **Status**: DONE (nessun fix necessario)

---

## BATCH 4: PDF Avanzato (5 tool) — Status: DONE

### T21. PDF to PNG `/en/pdf/to-png`
- **File**: `src/components/tools/pdf-to-png.tsx`
- **Test**: Convertire PDF in PNG con scale 1-4x, opzione trasparenza
- **Note**: Scale 4x su A4 genera immagini grandi ma e una scelta dell'utente, non un bug. URL cleanup presente.
- **Status**: DONE (nessun fix necessario)

### T22. Images to PDF `/en/pdf/from-images`
- **File**: `src/components/tools/images-to-pdf.tsx`
- **Test**: Caricare immagini multiple, testare page size (fit/A4/Letter), margini
- **Note**: Unita PDF (punti) gestite correttamente nel calcolo. URL cleanup presente.
- **Status**: DONE (nessun fix necessario)

### T23. Unlock PDF `/en/pdf/unlock`
- **File**: `src/components/tools/unlock-pdf.tsx`
- **Test**: PDF con owner-password, PDF con user-password, PDF non protetto
- **Note**: `ignoreEncryption: true` di pdf-lib rimuove correttamente owner-only encryption. Metodo 2 (render+OCR) e fallback accettabile. Non e un falso positivo.
- **Status**: DONE (nessun fix necessario — B05 era falso allarme)

### T24. Word to PDF `/en/pdf/from-word`
- **File**: `src/components/tools/word-to-pdf.tsx`
- **Test**: Caricare .docx, verificare anteprima HTML, testare stampa/PDF
- **Bug fixati**:
  - Aggiunto `sandbox="allow-same-origin allow-modals"` all'iframe per XSS hardening
- **Note**: Print dialog e limitazione intrinseca dell'approccio client-side DOCX→PDF.
- **Status**: DONE

### T25. PDF to Word `/en/pdf/to-word`
- **File**: `src/components/tools/pdf-to-word.tsx`
- **Test**: Convertire PDF con testo, verificare heading detection, page breaks
- **Bug fixati**:
  - Cast unsafe `(item as { transform: number[] }).transform[5]` → type guard con check `transform?.length >= 6`
  - `|| 12` → `?? 12` per fontSize (evita fallback errato su height=0)
- **Note**: Solo testo (no immagini) e PDF scansionati vuoti sono limitazioni note, non bug.
- **Status**: DONE

---

## BATCH 5: Audio/Media (6 tool) — Status: DONE

### T26. QR Code Generator `/en/developer/qr-code`
- **File**: `src/components/tools/qr-code.tsx`
- **Test**: Generare QR con testo/URL, personalizzare colori, scaricare PNG
- **Note**: Nessun ObjectURL usato (canvas.toDataURL). La libreria QRCode gestisce limiti lunghezza internamente con errore catturato dal try/catch.
- **Status**: DONE (nessun fix necessario)

### T27. SVG to PNG `/en/image/svg-to-png`
- **File**: `src/components/tools/svg-to-png.tsx`
- **Test**: Convertire SVG semplice e complesso, testare scale 1-4x
- **Bug fixati**:
  - XSS: `dangerouslySetInnerHTML` per SVG preview → sostituito con `<img>` e data URL (script non eseguiti)
- **Note**: URL cleanup gia presente in convert, onerror e reset. Codice solido.
- **Status**: DONE

### T28. Voice Recorder `/en/audio/voice-recorder`
- **File**: `src/components/tools/voice-recorder.tsx`
- **Test**: Registrare audio, pausa/resume, scaricare WEBM
- **Note**: Tutti i cleanup presenti: timer (useEffect unmount), animFrame, stream tracks, AudioContext (onstop), URL (reset). Ben strutturato.
- **Status**: DONE (nessun fix necessario)

### T29. Screen Recorder `/en/video/screen-recorder`
- **File**: `src/components/tools/screen-recorder.tsx`
- **Test**: Registrare schermo con/senza audio, pausa, scaricare
- **Note**: B07 non e un vero problema — `stopRecording` e stabile (deps []) e il guard `state !== "inactive"` protegge dal doppio stop. URL cleanup e unmount cleanup presenti.
- **Status**: DONE (nessun fix necessario — B07 era falso allarme)

### T30. Video to MP3 `/en/video/to-mp3`
- **File**: `src/components/tools/video-to-mp3.tsx`
- **Test**: Estrarre audio da video, verificare output MP3
- **Bug fixati**:
  - **B01 CRITICO**: Riscritto completamente — rimosso encoder WAV, ora usa FFmpeg (libmp3lame) per produrre vero MP3
  - Aggiunto al wrapper ffmpeg-tools.tsx per dynamic import (ssr: false)
  - Aggiornato import in page.tsx
- **Note**: Output ora e `.mp3` reale (audio/mpeg). Mostra progress bar FFmpeg.
- **Status**: DONE

### T31. Audio Cutter `/en/audio/cutter`
- **File**: `src/components/tools/audio-cutter.tsx`
- **Test**: Caricare audio, selezionare range su waveform, tagliare, scaricare
- **Bug fixati**:
  - Memory leak AudioContext: aggiunto `audioCtxRef.current?.close()` in loadAudio (prima di creare nuovo) e in reset
- **Note**: Play/stop funziona correttamente (source.start con offset). B08 era falso allarme.
- **Status**: DONE

---

## BATCH 6: Video Tools (5 tool) — Status: DONE

### T32. Compress Video `/en/video/compress`
- **File**: `src/components/tools/compress-video.tsx` (via ffmpeg-tools.tsx wrapper)
- **Test**: Comprimere video con 3 livelli qualita, verificare riduzione
- **Note**: FFmpeg init gestito da getFFmpeg con error handling. Cast Uint8Array e il pattern standard per FFmpeg.wasm v0.12. URL e FFmpeg file cleanup presenti.
- **Status**: DONE (nessun fix necessario)

### T33. Trim Video `/en/video/trim`
- **File**: `src/components/tools/trim-video.tsx` (via ffmpeg-tools.tsx wrapper)
- **Test**: Tagliare video con range slider, verificare output
- **Note**: `isFinite(dur)` gestisce edge case streaming. Guard `end - start < 0.1` disabilita trim vuoto. useEffect cleanup corretto per loadedmetadata. URL cleanup in loadFile e reset.
- **Status**: DONE (nessun fix necessario)

### T34. Video to GIF `/en/video/to-gif`
- **File**: `src/components/tools/video-to-gif.tsx` (via ffmpeg-tools.tsx wrapper)
- **Test**: Convertire video in GIF, testare fps/width/durata
- **Note**: Due passate FFmpeg (palettegen + paletteuse) e la tecnica corretta per GIF di qualita. Default 10sec visibile nei slider. URL e FFmpeg file cleanup presenti.
- **Status**: DONE (nessun fix necessario)

### T35. Audio Converter `/en/audio/converter`
- **File**: `src/components/tools/audio-converter.tsx` (via ffmpeg-tools.tsx wrapper)
- **Test**: Convertire tra MP3/WAV/OGG/FLAC/AAC
- **Bug fixati**:
  - B10: Aggiunto `if (!f.type.startsWith("audio/")) return;` in loadFile per impedire upload di file non-audio
- **Note**: Codec availability gestita da FFmpeg internamente (errore catturato dal try/catch).
- **Status**: DONE

### T36. YouTube Thumbnail `/en/youtube/thumbnail`
- **File**: `src/components/tools/youtube-thumbnail.tsx`
- **Test**: URL YouTube vari formati (watch, youtu.be, shorts, embed, video ID)
- **Note**: CORS gestito con fallback `window.open`. Download con revoke immediato. Placeholder detection (`naturalWidth > 120`). Regex 11 chars e lo standard YouTube.
- **Status**: DONE (nessun fix necessario)

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
| B01 | video-to-mp3 | Output WAV non MP3 | CRITICA | DONE (riscritto con FFmpeg/libmp3lame) |
| B02 | regex-tester | setError in useMemo + no max matches | MEDIA | DONE (MAX_MATCHES=500, matchError nel return) |
| B03 | word-to-pdf | XSS hardening iframe | ALTA | DONE (sandbox attribute aggiunto) |
| B04 | pdf-to-word | Cast unsafe transform | ALTA | DONE (type guard + ?? operator) |
| B05 | unlock-pdf | Falso allarme — funziona correttamente | ALTA | DONE (non era un bug) |
| B06 | base64 | escape()/unescape() deprecated | MEDIA | DONE (TextEncoder/TextDecoder) |
| B07 | screen-recorder | Race condition ended event | MEDIA | DONE (non era un bug — guard state check OK) |
| B08 | audio-cutter | Play/stop + AudioContext leak | MEDIA | DONE (play OK, aggiunto ctx.close()) |
| B09 | compress-image | PNG perde trasparenza | MEDIA | DONE (comportamento accettabile per JPEG) |
| B10 | audio-converter | Accetta qualsiasi file tipo | MEDIA | DONE (aggiunto type check audio/*) |

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
