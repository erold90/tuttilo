# Sprint Corrente: Sprint 1 — Text/Dev Tools (6 tool)

## Obiettivo
Implementare i primi 6 tool funzionanti: 3 Text + 3 Developer, con traduzioni complete in 8 lingue, SEO (meta + FAQ), e deploy su Cloudflare Pages.

## REGOLA CRITICA: 8 LINGUE
Ogni pagina, componente e contenuto DEVE essere tradotto in TUTTE le 8 lingue:
EN (default), IT, ES, FR, DE, PT, JA, KO.
File traduzioni: src/messages/{locale}.json

## Task

| # | Task | Status | Note |
|---|------|--------|------|
| 1.1 | Word Counter component | DONE | Stats: words, chars, chars no spaces, sentences, paragraphs, reading/speaking time |
| 1.2 | JSON Formatter component | DONE | Two-panel, Format/Minify/Copy, indent 2/4/8 |
| 1.3 | Base64 Encoder component | DONE | Encode/Decode toggle, Unicode support |
| 1.4 | Lorem Ipsum Generator component | DONE | Paragraphs/sentences/words, standard vocabulary |
| 1.5 | Color Picker component | DONE | HEX/RGB/HSL/CSS rgba(), copy buttons |
| 1.6 | Regex Tester component | DONE | Flags g/i/m/s, highlighted matches, match results |
| 1.7 | Dynamic tool route page | DONE | src/app/[locale]/[category]/[tool]/page.tsx, edge runtime |
| 1.8 | ToolLayout + RelatedTools fix | DONE | Breadcrumb links, client component for RelatedTools |
| 1.9 | Traduzioni 8 lingue (seo+faq+ui) | DONE | EN, IT, ES, FR, DE, PT, JA, KO — fix placeholder issues |
| 1.10 | Registry update (6 tool available) | DONE | isAvailable: true per i 6 tool |
| 1.11 | Build + Push GitHub + Deploy CF | DONE | Live su tuttilo.com |

## Progresso
- Completati: 11/11
- In corso: 0/11
- Rimanenti: 0/11

## SPRINT 1 COMPLETATO

## Fix applicati
- DE/ES/FR: rimossi placeholder `{count}` e `{index}` da wordsCount, matchesFound, atIndex (i componenti rendono i numeri separatamente)
- regex-tester.tsx: fix ESLint unescaped entities (`"` → `&ldquo;`/`&rdquo;`)
- Installato @vercel/next per build Cloudflare Pages

## Ultimo aggiornamento
2026-01-31 — Sprint 1 completato al 100%. 6 tool live su tuttilo.com
