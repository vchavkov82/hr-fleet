---
phase: 04-content-aligned-with-odoo
plan: 02
subsystem: ui
tags: [next-intl, react, tailwind, i18n, features-page, pricing-page]

requires:
  - phase: 01-marketing-site
    provides: Features and pricing pages with translation infrastructure
provides:
  - Restructured features page with active/roadmap split
  - Restructured pricing page with single plan + coming-soon modules
  - Honest feature/pricing content reflecting real product capabilities
affects: [04-content-aligned-with-odoo]

tech-stack:
  added: []
  patterns: [active-vs-roadmap feature split, coming-soon badge pattern, single-column feature checklist]

key-files:
  created: []
  modified:
    - www/src/app/[locale]/features/page.tsx
    - www/src/app/[locale]/pricing/page.tsx
    - www/messages/en/pages.json
    - www/messages/bg/pages.json
    - www/messages/en/pricingPreview.json
    - www/messages/bg/pricingPreview.json

key-decisions:
  - "ACTIVE_FEATURES vs ROADMAP_FEATURES split pattern for showing real vs planned capabilities"
  - "Single-column feature checklist instead of multi-module comparison table on pricing page"
  - "Coming-soon modules shown with opacity-60 and amber badges, no CTA buttons"

patterns-established:
  - "Active/Roadmap split: Use separate arrays for built vs planned features, render differently"
  - "Coming Soon badge: amber-100 bg, amber-800 text, rounded-full pill"

requirements-completed: [CONTENT-02, CONTENT-03]

duration: 12min
completed: 2026-03-08
---

# Phase 04 Plan 02: Features & Pricing Restructure Summary

**Features page split into 3 active feature rows (employees, calculators, compliance) + 5 roadmap cards with Coming Soon badges; pricing page restructured to single active plan (Core HR) with 5 muted coming-soon modules**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-08T21:00:28Z
- **Completed:** 2026-03-08T21:12:15Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Features page accurately shows 3 real capabilities (Employee Management, HR Calculators, Bulgarian Compliance) as full FeatureRow components with detailed descriptions
- 5 unbuilt modules (ATS, Leave, Payroll, Performance, Onboarding) shown in compact roadmap grid with Coming Soon amber badges
- Pricing page shows Core HR as the single active plan with Get a Quote CTA; 5 coming-soon modules shown as muted cards (opacity-60)
- Feature comparison simplified from 6-column matrix to single-column checklist of available features
- All fabricated AI claims, fake metrics (97% reduction, 70% faster), and unbuilt feature descriptions removed
- Complete EN and BG translation parity maintained

## Task Commits

Each task was committed atomically:

1. **Task 1: Restructure features page with active features and roadmap section** - `4c9f541` (feat)
2. **Task 2: Restructure pricing page to single plan with coming-soon add-ons** - `c9cbda8` (feat)

## Files Created/Modified
- `www/src/app/[locale]/features/page.tsx` - Split FEATURE_SECTIONS into ACTIVE_FEATURES + ROADMAP_FEATURES arrays, added roadmap grid section
- `www/src/app/[locale]/pricing/page.tsx` - Split MODULE_KEYS into ACTIVE_MODULES + COMING_SOON_MODULES, simplified comparison to checklist
- `www/messages/en/pages.json` - Rewrote features (employees, calculators, compliance) and pricing sections, removed AI claims, added roadmap/comingSoon keys
- `www/messages/bg/pages.json` - Matching BG translations for all changed features and pricing keys
- `www/messages/en/pricingPreview.json` - Updated heading, subheading, seeAllModules text, added coming-soon notes to ATS/leave descriptions
- `www/messages/bg/pricingPreview.json` - Matching BG translations for pricing preview

## Decisions Made
- Used ACTIVE_FEATURES/ROADMAP_FEATURES split (not a flag on each section) for cleaner rendering logic
- Chose option (a) for comparison: single-column checklist instead of multi-column table with grayed columns
- Kept all 6 modules in QuoteForm so users can express interest in coming-soon modules
- Roadmap feature cards show only title + brief description (no features array) for compact display

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing Next.js standalone mode build failure (500.html/nft.json errors) prevents `make build-www` from completing. This is a known issue documented in MEMORY.md. Verified via TypeScript type-check (clean) and JSON validation (all valid). The build compiles and generates all 228 static pages successfully before failing in the standalone trace phase.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Features and pricing pages now accurately represent product state
- Ready for remaining Phase 4 plans (homepage, about/contact pages)

---
*Phase: 04-content-aligned-with-odoo*
*Completed: 2026-03-08*
