Implementa un nuovo tool per Tuttilo seguendo questo workflow preciso.

Argomento: $ARGUMENTS (ID del tool, es: "pdf-fill-sign")

## Fase 1: Componente
1. Leggi `src/components/tools/compress-pdf.tsx` come riferimento pattern
2. Crea `src/components/tools/{tool-id}.tsx` seguendo il pattern:
   - `"use client"` + `useTranslations("tools.{tool-id}.ui")`
   - Drop zone (drag+click), stato processing/result/error
   - Download con blob URL + revokeObjectURL cleanup
   - Reset completo
3. Verifica che il componente esporta il nome corretto (PascalCase)

## Fase 2: Registry + Routing
1. Aggiungi il tool in `src/lib/tools/registry.ts` con `isAvailable: true`
2. Aggiungi import + mapping in `src/app/[locale]/[category]/[tool]/page.tsx`
3. Se serve un'icona nuova, aggiungila in `src/components/tool-icon.tsx`

## Fase 3: Traduzioni EN
1. Aggiungi in `src/messages/en.json` sotto `tools.{tool-id}`:
   - `name`, `description`
   - `seo.title`, `seo.content`
   - `faq.q1`-`q3`, `faq.a1`-`a3`
   - `ui.*` (tutte le chiavi usate nel componente)

## Fase 4: Traduzioni 7 lingue rimanenti
Usa il Task tool per lanciare subagent PARALLELI per tradurre:
- IT, ES, FR, DE, PT, JA, KO
- Ogni subagent riceve le chiavi EN come riferimento
- Prompt tipo: "Read src/messages/en.json tools.{tool-id} section. Translate ALL keys to {LINGUA} maintaining the same JSON structure. Read src/messages/{locale}.json, find the tools section, and add the translated block. Use natural fluent translations, not literal."

## Fase 5: Verifica
1. Esegui `npx next build` — deve passare senza errori
2. Pusha su GitHub via MCP
3. Aggiorna `docs/CURRENT_SPRINT.md` e `docs/SESSION_HANDOFF.md`
4. Aggiorna memoria MCP con `mcp__memory__add_observations`