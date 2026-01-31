# Sprint Corrente: Sprint 6 — Video Tools (5 tool)

## Obiettivo
Implementare 5 tool video/audio/youtube: Compress Video, Trim Video, Video→GIF, Audio Converter, YouTube Thumbnail. FFmpeg.wasm per video/audio processing, client-side.

## REGOLA CRITICA: 8 LINGUE
Ogni pagina, componente e contenuto DEVE essere tradotto in TUTTE le 8 lingue:
EN (default), IT, ES, FR, DE, PT, JA, KO.
File traduzioni: src/messages/{locale}.json

## Task

| # | Task | Status | Note |
|---|------|--------|------|
| 6.1 | Install FFmpeg deps + shared utility | DONE | @ffmpeg/ffmpeg, @ffmpeg/util, src/lib/ffmpeg.ts |
| 6.2 | YouTube Thumbnail component | DONE | Client-side, YouTube image URL pattern, no FFmpeg |
| 6.3 | Audio Converter component | DONE | FFmpeg, MP3/WAV/OGG/FLAC/AAC conversion |
| 6.4 | Compress Video component | DONE | FFmpeg, CRF quality levels (23/28/33), H.264 |
| 6.5 | Trim Video component | DONE | FFmpeg, video player, time range selector |
| 6.6 | Video to GIF component | DONE | FFmpeg, 2-pass palette, fps/width/loop controls |
| 6.7 | Registry update (5 tool available) | DONE | isAvailable: true for 5 tools |
| 6.8 | Tool page imports + mapping | DONE | ffmpeg-tools.tsx wrapper + 5 toolComponents entries |
| 6.9 | Traduzioni 8 lingue (seo+faq+ui) | DONE | EN, IT, ES, FR, DE, PT, JA, KO — tutte complete |
| 6.10 | Build verification | DONE | next build OK — 0 errors |
| 6.11 | Push GitHub | DONE | MCP push — 12 commit su main |
| 6.12 | Deploy Cloudflare Pages | DONE | wrangler pages deploy — 36 tool totali live |

## Progresso
- Completati: 12/12
- In corso: 0/12
- Rimanenti: 0/12

## Dependencies
- @ffmpeg/ffmpeg: FFmpeg.wasm core (single-threaded, no COOP/COEP needed)
- @ffmpeg/util: fetchFile, toBlobURL utilities
- WASM loaded from unpkg CDN (~25MB, lazy loaded on first use)

## Note tecniche
- FFmpeg.wasm single-threaded mode: no SharedArrayBuffer, no COOP/COEP headers needed
- WASM caricato da CDN unpkg.com (non bundlato)
- YouTube thumbnail: client-side URL construction (i.ytimg.com)
- processingType youtube-thumbnail: cambiato da 'server' a 'client'
- Client wrapper pattern: ffmpeg-tools.tsx con "use client" + next/dynamic ssr:false
- TypeScript 5.7 Uint8Array fix: (data as Uint8Array).buffer as ArrayBuffer

## Ultimo aggiornamento
2026-01-31 — Sprint 6 COMPLETATO. 12/12 task. 36 tool totali live su tuttilo.com.
