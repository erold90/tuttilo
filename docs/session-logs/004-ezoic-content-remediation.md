# Session Log 004 — Ezoic Content Remediation

## Date
2026-02-14

## Objective
Address Ezoic "Reason: Content" rejection with concrete technical and content-visibility fixes, then deploy.

## Requested by user
- Fix everything actionable now
- Deploy after fixes
- Keep persistent memory across compaction
- Maintain `codex.md` continuously

## Initial findings
- Crawl-visible fallback skeleton present on key pages.
- HowTo schema has untranslated step-name keys on tool pages.
- Layout runtime forced to edge.
- Tool content wrapped with support notice container.
- EN JSON-LD URLs generated with `/en` prefix.
- ads.txt not production-filled yet (missing definitive seller lines).

## Work log
- [x] Created this session log
- [x] Created `codex.md` with plan and tracker
- [ ] Applied code fixes
- [ ] Verified with lint/build/curl
- [ ] Deployed to Cloudflare

## Files planned to change
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/loading.tsx` (remove)
- `src/app/[locale]/[category]/loading.tsx` (remove)
- `src/app/[locale]/[category]/[tool]/loading.tsx` (remove)
- `src/app/[locale]/[category]/[tool]/page.tsx`
- `src/components/tools/tool-layout.tsx`
- `src/app/[locale]/page.tsx`
- `codex.md`
- `docs/session-logs/004-ezoic-content-remediation.md`


## Work log update #1
- [x] Removed forced Edge runtime in locale layout
- [x] Removed all App Router loading fallback skeleton files for locale/category/tool segments
- [x] Fixed HowTo JSON-LD step-name translation leakage with safe fallback text
- [x] Removed `SupportNotice` wrapper from tool main content path
- [x] Fixed EN canonical URL handling in homepage structured data
- [ ] Validate with lint/build
- [ ] Recheck live HTML signals
- [ ] Deploy via Wrangler

## Work log update #2 — Validation
- [x] `npm run lint` completed (warnings only)
- [x] `npm run build` completed successfully
- [x] Route generation confirmed as SSG for locale/category/tool pages
- [ ] Deploy via Wrangler

## Work log update #3 — Deploy
- [x] Deploy completed via Wrangler + next-on-pages
- [x] Latest deployment URL: https://a4e9e1f9.tuttilo.pages.dev
- [x] Cloudflare deployment ID: a4e9e1f9-52ee-4921-9301-0147ff077824

## Final status
Completed all requested technical fixes and deployed.
Remaining known gap for Ezoic review readiness is `ads.txt` publisher lines (needs account-specific IDs not inferable from codebase).

## Work log update #4 — Final hardening + redeploy
- [x] Added message fallback merge (EN base + locale override) in `src/i18n/request.ts`
- [x] Removed edge-incompatible `fs/path` pattern from static JSON loader (`src/lib/read-static-data.ts`)
- [x] Fixed invalid blog related tool mappings (`src/lib/blog/articles.ts`)
- [x] Rebuilt and redeployed successfully
- [x] Latest deployment URL: https://b024f348.tuttilo.pages.dev
- [x] Latest deployment ID: b024f348-d4d6-4890-a05e-6eaab839b88f
