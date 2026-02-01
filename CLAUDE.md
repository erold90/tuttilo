# TUTTILO — Free All-in-One Online Tools

## Compact Instructions
Quando compatti questa conversazione, PRESERVA SEMPRE:
- Sprint corrente e quale task stai facendo (leggi docs/CURRENT_SPRINT.md)
- Lista COMPLETA file creati/modificati nella sessione con percorsi ASSOLUTI
- Decisioni architetturali prese (leggi docs/ARCHITECTURE.md)
- Errori incontrati e come sono stati risolti
- Stato del task in corso (completato? a metà? bloccato?)
- Il contenuto di docs/SESSION_HANDOFF.md
- **LINGUE**: 8 lingue: EN (default), IT, ES, FR, DE, PT, JA, KO. OGNI tool DEVE essere tradotto in TUTTE le 8 lingue
- **TOOL IN CORSO**: Se stai implementando un tool, preserva: ID tool, quali fasi sono complete (componente/registry/traduzioni EN/traduzioni 7 lingue/build/push), e quali chiavi di traduzione sono state aggiunte
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

## Deploy Automatico (IMPORTANTE)
- **Il deploy e AUTOMATICO**: ogni push su `main` (anche via MCP) triggera GitHub Actions che builda e deploya su Cloudflare Pages
- Workflow: `.github/workflows/deploy.yml`
- Secrets GitHub: `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (gia configurati)
- Tempo build+deploy: ~2:30 minuti
- Monitoraggio: https://github.com/erold90/tuttilo/actions
- **NON serve** wrangler login locale o deploy manuale
- Dopo ogni push MCP, il sito su tuttilo.com si aggiorna automaticamente

## File di Stato (LEGGILI SEMPRE)
- `docs/ROADMAP.md` — Piano generale 7 sprint
- `docs/CURRENT_SPRINT.md` — Task sprint corrente con checkbox
- `docs/SESSION_HANDOFF.md` — Ultimo stato sessione (cosa fatto, cosa resta)
- `docs/ARCHITECTURE.md` — Decisioni architetturali con razionale

## Pattern per Nuovo Tool (Checklist Rapida)
1. Crea componente in `src/components/tools/{id}.tsx` ("use client", useTranslations)
2. Registra in `src/lib/tools/registry.ts` (isAvailable: true)
3. Aggiungi import + mapping in `src/app/[locale]/[category]/[tool]/page.tsx`
4. Aggiungi icona in `src/components/tool-icon.tsx` (se nuova)
5. Aggiungi traduzioni EN in `src/messages/en.json` (name, description, seo, faq, ui)
6. Traduci in 7 lingue con `/translate-tool {id}` o subagent paralleli
7. Build test: `npx next build`
8. Push GitHub via MCP
9. Aggiorna docs (CURRENT_SPRINT.md, SESSION_HANDOFF.md)
