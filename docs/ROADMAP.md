# Tuttilo — Roadmap Generale

## Stato: Sprint 6 (Video) - COMPLETATO — 36 tool live

### Sprint Overview

| Sprint | Categoria | Tool | Volume | Status |
|--------|-----------|------|--------|--------|
| **0** | Setup | Progetto + Layout + Components | - | COMPLETATO |
| **1** | Text/Dev | Word Counter, JSON Formatter, Base64, Lorem Ipsum, Color Picker, Regex Tester | 3.9M | COMPLETATO |
| **2** | Immagini | Compress, Resize, Crop, PNG↔JPG, WebP↔PNG/JPG, HEIC→JPG | 5.6M | COMPLETATO |
| **3** | PDF Core | Merge, Split, Compress, PDF→JPG, JPG→PDF, Rotate | 8.2M | COMPLETATO |
| **4** | Audio/Media | QR Code, SVG→PNG, Voice Recorder, Screen Recorder, Video→MP3, Audio Cutter | 3.6M | COMPLETATO |
| **5** | PDF Avanzato | PDF→PNG, Images→PDF, Unlock PDF, Word→PDF, PDF→Word | 6.2M | COMPLETATO |
| **6** | Video | Compress Video, Trim Video, Video→GIF, Audio Converter, YT Thumbnail | 1.8M | COMPLETATO |
| **7** | AI/Server | Remove Background, OCR, PDF Editor, Excel→PDF, YT Transcript | 6.7M | PENDING |

### Milestone

- [x] **M0**: Sito online con layout, homepage, dark mode, i18n (Sprint 0)
- [x] **M1**: 6 tool live (Sprint 1)
- [x] **M2**: 14 tool live (Sprint 2)
- [x] **M3**: 20 tool live (Sprint 3)
- [x] **M4**: 26 tool live (Sprint 4)
- [x] **M5**: 31 tool live (Sprint 5)
- [x] **M6**: 36 tool live (Sprint 6)
- [ ] **M7**: 41 tool (+ AI), lancio completo (Sprint 7)

### Riepilogo Tecnologie per Sprint

| Sprint | Librerie Principali |
|--------|-------------------|
| 1 | Vanilla JS, Web APIs |
| 2 | browser-image-compression, cropperjs v1, heic2any |
| 3 | pdf-lib, pdfjs-dist |
| 4 | MediaRecorder API, Web Audio API, qrcode |
| 5 | mammoth, docx, pdfjs-dist, pdf-lib |
| 6 | @ffmpeg/ffmpeg, @ffmpeg/util (WASM da CDN) |
| 7 | TBD — richiede server-side (Cloudflare Workers, AI APIs) |

### Decisioni Architetturali Chiave
Vedi `docs/ARCHITECTURE.md` per dettagli.
