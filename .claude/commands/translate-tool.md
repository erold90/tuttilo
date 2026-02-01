Traduci un tool Tuttilo in tutte le 8 lingue.

Argomento: $ARGUMENTS (ID del tool, es: "pdf-fill-sign")

## Prerequisiti
Le chiavi EN devono già esistere in `src/messages/en.json` sotto `tools.{tool-id}`.

## Workflow

1. Leggi `src/messages/en.json` e estrai il blocco `tools.{tool-id}` completo (name, description, seo, faq, ui)

2. Verifica quali lingue mancano leggendo brevemente ogni file:
   - `src/messages/it.json`
   - `src/messages/es.json`
   - `src/messages/fr.json`
   - `src/messages/de.json`
   - `src/messages/pt.json`
   - `src/messages/ja.json`
   - `src/messages/ko.json`

3. Per ogni lingua mancante, lancia un subagent PARALLELO con il Task tool:
   ```
   Prompt: "Read /Users/witerose/Desktop/Tuttilo-app/src/messages/en.json and find the tools.{tool-id} section.
   Translate ALL keys to {LINGUA_NOME} ({CODICE}).
   Then read /Users/witerose/Desktop/Tuttilo-app/src/messages/{codice}.json, find where the tools section ends,
   and use the Edit tool to add the translated {tool-id} block.
   Rules:
   - Natural fluent translations, NOT literal
   - Keep tool IDs and technical terms in English
   - No ICU placeholders
   - Match the JSON structure exactly
   - SEO content should be search-optimized for {LINGUA_NOME}"
   ```

4. Aspetta che tutti i subagent completino

5. Verifica con `npx next build` che non ci siano errori di chiavi mancanti

## Lingue
| Codice | Nome | File |
|--------|------|------|
| it | Italiano | src/messages/it.json |
| es | Spagnolo | src/messages/es.json |
| fr | Francese | src/messages/fr.json |
| de | Tedesco | src/messages/de.json |
| pt | Portoghese | src/messages/pt.json |
| ja | Giapponese | src/messages/ja.json |
| ko | Coreano | src/messages/ko.json |