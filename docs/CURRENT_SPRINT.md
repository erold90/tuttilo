# Sprint Corrente: Sprint 4 — Audio/Media Tools (6 tool)

## Obiettivo
Implementare 6 tool audio/media: audio-cutter, voice-recorder, screen-recorder, video-to-mp3, qr-code, svg-to-png. Tutto client-side con Web Audio API, MediaRecorder API, Canvas API, qrcode.

## REGOLA CRITICA: 8 LINGUE
Ogni pagina, componente e contenuto DEVE essere tradotto in TUTTE le 8 lingue:
EN (default), IT, ES, FR, DE, PT, JA, KO.
File traduzioni: src/messages/{locale}.json

## Task

| # | Task | Status | Note |
|---|------|--------|------|
| 4.1 | QR Code Generator component | DONE | qrcode lib, text/URL input, colors, sizes, error correction |
| 4.2 | SVG to PNG component | DONE | Canvas API, scale 1x-4x, transparency, drag&drop |
| 4.3 | Voice Recorder component | DONE | MediaRecorder + getUserMedia, waveform viz, pause/resume |
| 4.4 | Screen Recorder component | DONE | MediaRecorder + getDisplayMedia, WebM output, audio toggle |
| 4.5 | Video to MP3 component | DONE | Web Audio API, extract audio, WAV output |
| 4.6 | Audio Cutter component | DONE | Web Audio API, waveform, trim sliders, preview, WAV output |
| 4.7 | Registry update (6 tool available) | DONE | isAvailable: true for 6 tools |
| 4.8 | Tool page imports + mapping | DONE | 6 new imports + toolComponents entries |
| 4.9 | Traduzioni 8 lingue (seo+faq+ui) | DONE | EN, IT, ES, FR, DE, PT, JA, KO |
| 4.10 | Build verification | DONE | npm run build OK |
| 4.11 | Push GitHub | TODO | MCP push_files |
| 4.12 | Deploy Cloudflare Pages | TODO | Live su tuttilo.com — 26 tool totali |

## Progresso
- Completati: 10/12
- In corso: 0/12
- Rimanenti: 2/12

## Dependencies
- qrcode: ^1.5.4 (QR code generation)
- Web Audio API: audio decoding, waveform, slicing (built-in)
- MediaRecorder API: voice/screen recording (built-in)
- Canvas API: SVG rendering, waveform visualization (built-in)

## Ultimo aggiornamento
2026-01-31 — Sprint 4: 6 componenti + registry + imports + traduzioni 8 lingue completate. Build OK. Push e deploy in corso.
