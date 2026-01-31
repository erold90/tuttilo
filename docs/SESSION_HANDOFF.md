# Session Handoff — Tuttilo

## Ultimo aggiornamento: 2026-01-31

## Cosa è stato completato
- Registrato dominio tuttilo.com su Porkbun
- Privacy WHOIS attivata
- Ricerca completa: UI/UX, monetizzazione, tech stack, priorità tool
- Scritto CLAUDE.md con architettura completa
- Scritto session log 000-project-setup.md
- Creata struttura file di gestione contesto
- Salvato tutto in memoria MCP
- Consolidato tutto in una singola directory (Tuttilo-app/)
- **Sprint 0 COMPLETATO (16/16 task)**
- SEO: sitemap.ts dinamica, robots.ts, generateMetadata con OpenGraph/Twitter/hreflang, JSON-LD WebSite schema
- Deploy: Cloudflare Pages live su tuttilo.pages.dev
- Custom domain: tuttilo.com + www.tuttilo.com configurati (SSL in provisioning)
- wrangler.toml con nodejs_compat, edge runtime su layout
- Favicon SVG brand indigo

## Cosa resta da fare
- Iniziare Sprint 1 (Text/Dev tools)
- Verificare che tuttilo.com punti correttamente (DNS propagation)
- Se www.tuttilo.com non funziona: aggiungere CNAME www → tuttilo.pages.dev nel DNS Cloudflare

## Decisioni prese
1. Dominio: tuttilo.com (PMD, 7 lettere, brand + hint "tutti")
2. Registrar: Porkbun (Cloudflare fallito al checkout)
3. Tech stack: Next.js 15 + Tailwind + shadcn/ui + Cloudflare
4. Processing client-side come differenziatore
5. Colore brand: Indigo #6366F1
6. Font: Inter + JetBrains Mono
7. Ordine sprint: Text/Dev → Immagini → PDF → Audio → PDF Avanzato → Video → AI
8. **i18n 8 lingue**: EN (default), IT, ES, FR, DE, PT, JA, KO — OGNI contenuto deve essere tradotto in tutte le 8 lingue
9. **Edge runtime**: richiesto per Cloudflare Pages con @cloudflare/next-on-pages
10. **Git push via MCP**: SSH key locale non corrisponde a erold90, usare mcp__github__push_files

## Problemi aperti
- git push locale non funziona (SSH key mismatch) — usare MCP GitHub per push
- www.tuttilo.com potrebbe necessitare CNAME manuale nel DNS Cloudflare

## File principali
- `CLAUDE.md` — Architettura completa
- `docs/ROADMAP.md` — Piano sprint
- `docs/CURRENT_SPRINT.md` — Task sprint corrente
- `docs/ARCHITECTURE.md` — Decisioni architetturali
- `docs/session-logs/` — Log sessioni
- `wrangler.toml` — Config Cloudflare Pages
- `src/app/sitemap.ts` — Sitemap dinamica
- `src/app/robots.ts` — Robots.txt
