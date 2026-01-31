# TUTTILO — Free All-in-One Online Tools

## Compact Instructions
Quando compatti questa conversazione, PRESERVA SEMPRE:
- Sprint corrente e quale task stai facendo (leggi docs/CURRENT_SPRINT.md)
- Lista file creati/modificati nella sessione con percorsi COMPLETI
- Decisioni architetturali prese (leggi docs/ARCHITECTURE.md)
- Errori incontrati e come sono stati risolti
- Stato del task in corso (completato? a metà? bloccato?)
- Il contenuto di docs/SESSION_HANDOFF.md
- **LINGUE**: Il sito supporta 8 lingue: EN (default), IT, ES, FR, DE, PT, JA, KO. OGNI pagina, componente e tool DEVE essere tradotto in TUTTE le 8 lingue. MAI creare contenuti solo in 1-2 lingue.

## Regole Sessione
- ALL'INIZIO di ogni sessione: leggi docs/SESSION_HANDOFF.md + docs/CURRENT_SPRINT.md
- PRIMA di /compact o /clear: aggiorna SESSION_HANDOFF.md e CURRENT_SPRINT.md
- DOPO ogni tool completato: aggiorna CURRENT_SPRINT.md e committa
- USA subagent (Task tool) per esplorazioni pesanti del codebase
- 1 TOOL = 1 sessione corta. Compatta tra un tool e l'altro.

## Comandi Custom Disponibili
- `/start-session` — Carica contesto e mostra dove eravamo rimasti
- `/end-session` — Salva stato, aggiorna file, crea session log
- `/sprint-status` — Mostra progresso sprint corrente

## File di Stato (LEGGILI SEMPRE)
- `docs/ROADMAP.md` — Piano generale 7 sprint
- `docs/CURRENT_SPRINT.md` — Task sprint corrente con checkbox
- `docs/SESSION_HANDOFF.md` — Ultimo stato sessione (cosa fatto, cosa resta)
- `docs/ARCHITECTURE.md` — Decisioni architetturali con razionale
