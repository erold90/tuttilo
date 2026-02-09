# Visual Upgrade Plan — Tuttilo 2026-02-08

## Obiettivo
Trasformare Tuttilo da "sito funzionale" a "sito wow" per il lancio su Product Hunt.
Aggiungere animazioni, effetti visivi e micro-interazioni premium.

## Librerie da integrare

### 1. Motion (ex Framer Motion)
- **Install**: `npm i motion`
- **Uso**: Motore animazioni base per tutto il sito
- **Componenti**: page transitions, hover effects, entrance animations
- **Bundle**: ~16KB gzipped, tree-shakeable

### 2. Aceternity UI (copy-paste)
- **Install**: Copia componenti singoli in `src/components/ui/`
- **Uso**: Effetti hero section, spotlight cards, bento grid
- **Componenti da copiare**:
  - `aurora-background.tsx` — sfondo hero animato
  - `spotlight.tsx` — effetto spotlight su hover cards
  - `bento-grid.tsx` — layout griglia tool
  - `text-generate-effect.tsx` — testo che appare lettera per lettera
  - `background-beams.tsx` — raggi di luce sullo sfondo
- **Bundle**: Zero overhead (sono componenti React, usano Motion)

### 3. Magic UI (shadcn-compatible)
- **Install**: `npx shadcn@latest add "https://magicui.design/r/{component}"`
- **Uso**: Animated counters, marquee, shimmer buttons
- **Componenti da aggiungere**:
  - `number-ticker.tsx` — "82+ tools" con animazione contatore
  - `marquee.tsx` — scorrimento icone tool
  - `shimmer-button.tsx` — CTA button con effetto luccicante
  - `animated-beam.tsx` — connessioni animate tra elementi
  - `dot-pattern.tsx` — pattern sfondo puntinato
- **Bundle**: Minimal (componenti individuali, tree-shakeable)

### 4. Lenis (smooth scroll)
- **Install**: `npm i lenis`
- **Uso**: Smooth scrolling site-wide
- **Integrazione**: Provider wrapper in layout.tsx
- **Bundle**: ~8KB gzipped

## Piano implementazione (per fasi)

### Fase 1: Setup base (Motion + Lenis)
- [ ] `npm i motion lenis`
- [ ] Creare `src/components/smooth-scroll-provider.tsx` (Lenis wrapper)
- [ ] Aggiungere SmoothScrollProvider in `layout.tsx`
- [ ] Verificare che smooth scroll funzioni su tutte le pagine
- [ ] Build test (verificare bundle size)

### Fase 2: Homepage Hero redesign
- [ ] Copiare `aurora-background.tsx` da Aceternity UI
- [ ] Copiare `text-generate-effect.tsx` da Aceternity UI
- [ ] Sostituire video background con aurora animated gradient
- [ ] Aggiungere typewriter/text-generate effect sul titolo hero
- [ ] Animare l'ingresso della search bar con Motion
- [ ] Trust signals: fade-in staggered con Motion

### Fase 3: Tool cards & griglia
- [ ] Copiare `spotlight.tsx` da Aceternity UI
- [ ] Applicare spotlight effect alle tool cards (hover = luce che segue il mouse)
- [ ] Animare entrance delle cards con stagger (Motion)
- [ ] Aggiungere number-ticker da Magic UI per "82+ tools available"
- [ ] Categoria nav pills: hover animation migliorato

### Fase 4: Micro-interazioni
- [ ] Shimmer button da Magic UI per CTA principali
- [ ] Dot pattern background su sezioni alternate
- [ ] Marquee di icone tool sotto l'hero
- [ ] Fade-in on scroll per tutte le sezioni (sostituire animate-on-scroll CSS con Motion)

### Fase 5: Polish & ottimizzazione
- [ ] Lazy loading componenti animazione (dynamic import)
- [ ] Verificare performance su mobile
- [ ] Build finale + verificare bundle < 3 MiB compresso
- [ ] Deploy su Cloudflare

## Vincoli tecnici
- **BUNDLE LIMIT**: 3 MiB compresso su Cloudflare free tier
- **Bundle attuale**: ~6260 KiB non compresso (sotto limite compresso)
- **EDGE RUNTIME**: Tutti i componenti animazione DEVONO essere "use client"
- **NO SSR per animazioni**: Usare dynamic() con ssr: false dove necessario
- **Mobile**: Ridurre/disabilitare animazioni pesanti su mobile (prefers-reduced-motion)

## File che verranno modificati
- `src/app/[locale]/layout.tsx` — Lenis provider
- `src/app/[locale]/page.tsx` — Homepage redesign completo
- `src/components/home-spotlight-grid.tsx` — Spotlight effect su cards
- `src/components/home-category-nav.tsx` — Animazioni pills
- `src/components/home-search-trigger.tsx` — Animazione search bar
- `src/styles/globals.css` — Nuovi stili base

## File nuovi da creare
- `src/components/ui/aurora-background.tsx`
- `src/components/ui/spotlight.tsx`
- `src/components/ui/text-generate-effect.tsx`
- `src/components/ui/number-ticker.tsx`
- `src/components/ui/marquee.tsx`
- `src/components/ui/shimmer-button.tsx`
- `src/components/ui/dot-pattern.tsx`
- `src/components/smooth-scroll-provider.tsx`
