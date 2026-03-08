---
phase: 04-content-aligned-with-odoo
plan: 01
subsystem: ui
tags: [next-intl, translations, homepage, content, i18n]

requires:
  - phase: 01-marketing-site
    provides: Homepage layout with Hero, Features, HowItWorks, CTA sections
provides:
  - Honest homepage content reflecting real platform capabilities
  - Feature cards for employees, calculators, compliance (not ATS/leave)
  - Cleaned homepage without fake social proof sections
affects: [04-02, 04-03, 04-04]

tech-stack:
  added: []
  patterns:
    - "FEATURE_KEYS array must match featuresOverview.json item keys exactly"
    - "All translation files updated in EN+BG pairs simultaneously"

key-files:
  created: []
  modified:
    - www/src/app/[locale]/page.tsx
    - www/src/components/sections/features.tsx
    - www/messages/en/hero.json
    - www/messages/bg/hero.json
    - www/messages/en/cta.json
    - www/messages/bg/cta.json
    - www/messages/en/howItWorks.json
    - www/messages/bg/howItWorks.json
    - www/messages/en/features.json
    - www/messages/bg/features.json
    - www/messages/en/featuresOverview.json
    - www/messages/bg/featuresOverview.json

key-decisions:
  - "Removed trustedBy key from hero.json entirely rather than repurposing it"
  - "Used Heroicons calculator and shield-check SVGs for new feature card icons"
  - "Kept trustText unchanged as it was already accurate"

patterns-established:
  - "Content honesty: every text claim must map to a working feature"
  - "Feature keys pattern: FEATURE_KEYS in TSX must match items keys in featuresOverview.json"

requirements-completed: [CONTENT-01, CONTENT-06]

duration: 9min
completed: 2026-03-08
---

# Phase 4 Plan 1: Homepage Content Alignment Summary

**Stripped fake social proof and AI claims from homepage, replaced with honest copy reflecting real capabilities (employee management, salary calculators, Bulgarian compliance)**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-08T21:00:25Z
- **Completed:** 2026-03-08T21:09:30Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Removed TrustedCompanies, StatsCounters, and Testimonials sections from homepage
- Rewrote hero, CTA, and HowItWorks with honest copy in EN and BG
- Changed feature cards from ats/employees/leave to employees/calculators/compliance
- Eliminated all fabricated statistics ("500+ companies", "70% faster", "97% less admin")

## Task Commits

Each task was committed atomically:

1. **Task 1: Strip homepage of fake sections and rewrite hero/CTA translations** - `7bcfa1f` (feat)
2. **Task 2: Rewrite homepage feature cards for real capabilities** - `2c706f4` (feat)

## Files Created/Modified
- `www/src/app/[locale]/page.tsx` - Removed fake section imports and rendering
- `www/src/components/sections/features.tsx` - Updated FEATURE_KEYS and icons
- `www/messages/en/hero.json` - Honest hero copy without AI claims
- `www/messages/bg/hero.json` - Bulgarian hero translation
- `www/messages/en/cta.json` - CTA without fabricated stats
- `www/messages/bg/cta.json` - Bulgarian CTA translation
- `www/messages/en/howItWorks.json` - Steps reflecting real product flow
- `www/messages/bg/howItWorks.json` - Bulgarian HowItWorks translation
- `www/messages/en/features.json` - 3 real features replacing 6 fake ones
- `www/messages/bg/features.json` - Bulgarian features translation
- `www/messages/en/featuresOverview.json` - Feature cards matching real capabilities
- `www/messages/bg/featuresOverview.json` - Bulgarian feature cards translation

## Decisions Made
- Removed `trustedBy` key from hero.json entirely rather than repurposing it
- Used Heroicons calculator and shield-check SVGs for new feature card icons
- Kept `trustText` unchanged as it was already accurate (no credit card, 60-day trial)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing build failure in standalone mode (`_document.js` missing) unrelated to changes. Compilation succeeds cleanly; standalone output step fails due to known Next.js Pages Router issue documented in project memory.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Homepage content is honest and aligned with real capabilities
- Ready for Plan 02 (features page content alignment)
- Pre-existing uncommitted changes to features page and pages.json are from earlier work aligning that page

---
*Phase: 04-content-aligned-with-odoo*
*Completed: 2026-03-08*
