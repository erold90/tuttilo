# Sprint Corrente: Sprint 0 — Setup Progetto

## Obiettivo
Setup completo del progetto Next.js 15 con layout, components base, i18n (8 lingue), dark mode, tool registry, e deploy su Cloudflare Pages.

## REGOLA CRITICA: 8 LINGUE
Ogni pagina, componente e contenuto DEVE essere tradotto in TUTTE le 8 lingue:
EN (default), IT, ES, FR, DE, PT, JA, KO.
File traduzioni: src/messages/{locale}.json

## Task

| # | Task | Status | Note |
|---|------|--------|------|
| 0.1 | Init Next.js 15 + TypeScript + Tailwind CSS 4 | DONE | Build OK, Turbopack |
| 0.2 | Setup shadcn/ui components base (14) | DONE | button, card, dialog, tabs, progress, input, select, toast, badge, separator, sheet, tooltip, slider, sonner |
| 0.3 | Setup next-intl (8 lingue) | DONE | EN default, IT, ES, FR, DE, PT, JA, KO |
| 0.4 | Setup next-themes (dark mode) | DONE | class-based, system default |
| 0.5 | Header component | DONE | Sticky, nav categorie, search CMD+K, lang switch 8 bandiere, theme toggle |
| 0.6 | Footer component | DONE | 4 colonne, link tool, privacy badge |
| 0.7 | Homepage | DONE | Hero, search, categorie con colori, stats, features |
| 0.8 | ToolLayout component wrapper | DONE | Breadcrumb, title, sidebar ads, related tools |
| 0.9 | FileUploader component | DONE | Drag & drop, validazione, a11y |
| 0.10 | ProcessingProgress component | DONE | Progress bar con %, testo, spinner |
| 0.11 | DownloadButton component | DONE | Single/multiple, before-after |
| 0.12 | Tool registry system | DONE | 45 tool, 7 categorie, helper functions |
| 0.13 | Ad slot components | DONE | Sidebar 300x250, leaderboard 728x90, mobile sticky |
| 0.14 | SEO setup (sitemap, robots, meta, JSON-LD) | DONE | sitemap.ts, robots.ts, generateMetadata, JSON-LD, OpenGraph, hreflang |
| 0.15 | Deploy su Cloudflare Pages | DONE | tuttilo.pages.dev live, custom domain tuttilo.com configurato |
| 0.16 | Git init + repo GitHub | DONE | erold90/tuttilo (public) |

## Progresso
- Completati: 16/16
- In corso: 0/16
- Rimanenti: 0/16

## SPRINT 0 COMPLETATO

## Ultimo aggiornamento
2026-01-31 — Sprint 0 completato al 100%. Sito live su tuttilo.pages.dev + tuttilo.com
