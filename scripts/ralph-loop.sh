#!/bin/bash
# ralph-loop.sh — Multi-session agent loop per Tuttilo
# Risolve il problema del context window lanciando sessioni fresche
#
# Usage:
#   ./scripts/ralph-loop.sh task-file.md [max_iterations]
#
# Il task file deve descrivere cosa fare. Claude leggerà automaticamente
# SESSION_HANDOFF.md e CURRENT_SPRINT.md per il contesto.
#
# Esempio:
#   echo "Implementa il tool pdf-fill-sign seguendo /implement-tool pdf-fill-sign" > /tmp/task.md
#   ./scripts/ralph-loop.sh /tmp/task.md 5

set -euo pipefail

TASK_FILE="${1:?Uso: $0 <task-file.md> [max_iterations]}"
MAX_ITER="${2:-10}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STATUS_FILE="$PROJECT_DIR/.claude/loop-status.txt"

# Colori
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Ralph Loop per Tuttilo ===${NC}"
echo "Task: $TASK_FILE"
echo "Max iterazioni: $MAX_ITER"
echo "Progetto: $PROJECT_DIR"
echo ""

# Pulisci status precedente
rm -f "$STATUS_FILE"

TASK_CONTENT=$(cat "$TASK_FILE")

for i in $(seq 1 "$MAX_ITER"); do
    echo -e "${YELLOW}=== Iterazione $i/$MAX_ITER ===${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') — Iterazione $i" >> "$PROJECT_DIR/.claude/activity.log"

    PROMPT="Sei in una sessione del Ralph Loop (iterazione $i/$MAX_ITER).

PRIMA DI TUTTO: Leggi docs/SESSION_HANDOFF.md e docs/CURRENT_SPRINT.md per capire dove eravamo.

TASK:
$TASK_CONTENT

REGOLE RALPH LOOP:
- Lavora in modo autonomo senza chiedere conferme
- Dopo ogni sotto-task completato, aggiorna docs/SESSION_HANDOFF.md
- Se completi TUTTO il task, scrivi 'TASK_COMPLETE' nel file .claude/loop-status.txt
- Se hai completato un sotto-task ma c'è ancora lavoro, aggiorna i docs e fermati
- NON chiedere conferme, esegui e basta"

    # Lancia Claude Code in modalità non-interattiva
    cd "$PROJECT_DIR"
    claude -p "$PROMPT" --max-turns 50 2>&1 | tee "$PROJECT_DIR/.claude/loop-iteration-$i.log" || true

    # Controlla completamento
    if [ -f "$STATUS_FILE" ] && grep -q "TASK_COMPLETE" "$STATUS_FILE"; then
        echo -e "${GREEN}=== TASK COMPLETATO in $i iterazioni ===${NC}"
        rm -f "$STATUS_FILE"
        exit 0
    fi

    echo -e "Iterazione $i completata. Pausa 5s prima della prossima..."
    sleep 5
done

echo -e "${RED}=== Max iterazioni raggiunte ($MAX_ITER) ===${NC}"
echo "Controlla docs/SESSION_HANDOFF.md per lo stato attuale."
exit 1
