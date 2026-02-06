# TUTTILO — Free All-in-One Online Tools

## Compact Instructions
Quando compatti questa conversazione, PRESERVA SEMPRE:
- **DEPLOY**: Solo deploy via wrangler su Cloudflare. Push GitHub solo a progetto finito.
- Sprint corrente e quale task stai facendo (leggi docs/CURRENT_SPRINT.md)
- Lista COMPLETA file creati/modificati nella sessione con percorsi ASSOLUTI
- Decisioni architetturali prese (leggi docs/ARCHITECTURE.md)
- Errori incontrati e come sono stati risolti
- Stato del task in corso (completato? a metà? bloccato?)
- Il contenuto di docs/SESSION_HANDOFF.md
- **LINGUE**: 8 lingue: EN (default), IT, ES, FR, DE, PT, JA, KO. OGNI tool DEVE essere tradotto in TUTTE le 8 lingue
- **TOOL IN CORSO**: Se stai implementando un tool, preserva: ID tool, quali fasi sono complete (componente/registry/traduzioni EN/traduzioni 7 lingue/build/deploy-wrangler), e quali chiavi di traduzione sono state aggiunte
- **DIPENDENZE**: Se hai installato nuove dipendenze npm, elencale
- **MEMORIA MCP**: Cerca entità "Tuttilo_PDFEditTools" per contesto sui PDF tool in sviluppo

## Regole Sessione
- ALL'INIZIO di ogni sessione: leggi docs/SESSION_HANDOFF.md + docs/CURRENT_SPRINT.md
- ALL'INIZIO: esegui `mcp__memory__search_nodes("Tuttilo")` per contesto persistente
- PRIMA di /compact o /clear: aggiorna SESSION_HANDOFF.md e CURRENT_SPRINT.md
- DOPO ogni tool completato: aggiorna CURRENT_SPRINT.md e committa
- USA subagent (Task tool) per esplorazioni pesanti del codebase
- USA subagent PARALLELI per traduzioni (7 lingue in contemporanea)
- 1 TOOL = 1 sessione corta. Compatta tra un tool e l'altro.
- PRIMA DI FERMARTI: aggiorna sempre SESSION_HANDOFF.md (il Stop hook te lo ricorderà)

## Comandi Custom Disponibili
- `/start-session` — Carica contesto e mostra dove eravamo rimasti
- `/end-session` — Salva stato, aggiorna file, crea session log
- `/sprint-status` — Mostra progresso sprint corrente
- `/implement-tool {id}` — Workflow completo per implementare un nuovo tool Tuttilo
- `/translate-tool {id}` — Traduci un tool in tutte le 8 lingue con subagent paralleli

## Agent Loop System
Questo progetto usa un sistema di agent loop per gestire task grandi:

### Subagent Pattern (per traduzioni)
Quando devi tradurre in 7 lingue, lancia 7 Task subagent IN PARALLELO:
```
Task(subagent_type="general-purpose", prompt="Traduci tools.{id} in {LINGUA}...")
```
Ogni subagent ha il suo contesto separato → niente overflow.

### Ralph Loop (per task multi-sessione)
Per task che superano il context window:
```bash
./scripts/ralph-loop.sh task-file.md 10
```
Lancia sessioni Claude fresche in loop, stato passato via file.

### Stop Hook
Il file `.claude/settings.json` contiene un Stop hook che ricorda di salvare lo stato prima di fermarsi.

### Memoria Persistente
Usa MCP Memory per salvare stato tra sessioni:
- `mcp__memory__search_nodes("Tuttilo")` — recupera contesto
- `mcp__memory__add_observations` — salva nuove info
- Entità chiave: `Tuttilo_Progetto`, `Tuttilo_PDFEditTools`

## Deploy

**DOPO OGNI MODIFICA: deploy locale via Wrangler su Cloudflare.**

### Deploy su Cloudflare via Wrangler
```bash
npm run build && npx @cloudflare/next-on-pages && rm -f .vercel/output/static/_worker.js/__next-on-pages-dist__/assets/*.wasm.bin && rm -f .vercel/output/static/_worker.js/nop-build-log.json && npx wrangler pages deploy .vercel/output/static --project-name tuttilo --branch main --commit-dirty=true
```
- Account Cloudflare: erold90@gmail.com
- Progetto Pages: tuttilo
- URL produzione: https://tuttilo.com
- Wrangler autenticato localmente (OAuth token in ~/.wrangler/)
- **WASM FIX**: Il `rm -f *.wasm.bin` rimuove i binari jSquash dal Worker (usati solo client-side). Senza questo step il Worker supera il limite 3 MiB del piano free Cloudflare. I WASM restano disponibili in `_next/static/media/` per il client.

### Push GitHub (SOLO A PROGETTO FINITO)
Il push su GitHub si fa solo quando il progetto è completo o a milestone importanti.
NON pushare dopo ogni singola modifica — lavoriamo in locale e deployiamo su Cloudflare.
- SSH/HTTPS push locale NON funziona (witerose ≠ erold90)
- Per pushare: usa GitHub API con token dal processo MCP (`ps eww` per estrarlo)
- Oppure: `mcp__github__push_files` per file piccoli

### Regole Deploy
- **SEMPRE** verificare che il build passi PRIMA di deployare
- **SEMPRE** deploy su Cloudflare dopo modifiche
- Push GitHub NON è richiesto per ogni sessione

## File di Stato (LEGGILI SEMPRE)
- `docs/ROADMAP.md` — Piano generale 7 sprint
- `docs/CURRENT_SPRINT.md` — Task sprint corrente con checkbox
- `docs/SESSION_HANDOFF.md` — Ultimo stato sessione (cosa fatto, cosa resta)
- `docs/ARCHITECTURE.md` — Decisioni architetturali con razionale

## Pattern per Nuovo Tool (Checklist Rapida)
1. Crea componente in `src/components/tools/{id}.tsx` ("use client", useTranslations)
2. Registra in `src/lib/tools/registry.ts` (isAvailable: true)
3. Aggiungi dynamic import in `src/components/tools/tool-loader.tsx` + ID in `implementedToolIds` in `src/app/[locale]/[category]/[tool]/page.tsx`
4. Aggiungi icona in `src/components/tool-icon.tsx` (se nuova, Phosphor Icons duotone)
5. Aggiungi traduzioni EN in `src/messages/en.json` (name, description, seo, faq, ui)
6. Traduci in 7 lingue con `/translate-tool {id}` o subagent paralleli
7. Build test: `npm run build`
8. **DEPLOY Cloudflare via wrangler** (vedi sezione Deploy sopra)
9. Aggiorna docs (CURRENT_SPRINT.md, SESSION_HANDOFF.md)
