---
phase: 01-hr-app
plan: 02
subsystem: ui
tags: [header, footer, hero, i18n, product-mockup, corporate-blue]

# Dependency graph
requires:
  - phase: 15-01
    provides: Corporate blue Tailwind palette, btn-primary/btn-secondary utility classes
provides:
  - Updated header with Features dropdown (6 HR modules) and Start free trial CTA
  - Corporate footer with Product/Resources/Company/Legal column structure
  - Two-column hero with text left and product dashboard mockup right
  - Trusted companies strip below hero
affects: [15-03, 15-04, 15-05, 15-06, 15-07, 15-08, 15-09, 15-10]

# Tech tracking
tech-stack:
  added: []
  patterns: [two-column hero grid with product mockup, browser-chrome frame UI pattern]

key-files:
  created: []
  modified:
    - app/hr/src/components/layout/header.tsx
    - app/hr/src/components/layout/footer.tsx
    - app/hr/src/components/sections/hero.tsx
    - app/hr/messages/en.json
    - app/hr/messages/bg.json

key-decisions:
  - "Header Features dropdown replaces Platform and Resources dropdowns -- single dropdown with 6 HR module items"
  - "Book a Demo removed entirely; Start free trial is sole header CTA linking to /auth/sign-up"
  - "Footer reduced from 5 columns to 4 (Product, Resources, Company, Legal) -- cleaner for HR SaaS"
  - "Hero stat cards removed from hero; will be reused as separate Counter section in later plans"
  - "Product mockup uses browser-chrome frame with fake dashboard (sidebar + stat cards + content grid) -- no images needed"

patterns-established:
  - "Header nav: Features dropdown + Pricing + HR Tools + Blog direct links"
  - "ProductMockup: browser-chrome framed dashboard placeholder for screenshot areas"

requirements-completed: []

# Metrics
duration: 8min
completed: 2026-02-25
---

# Phase 15 Plan 02: Layout & Hero Redesign Summary

**Header with Features dropdown and free trial CTA, 4-column corporate footer, and two-column hero with product dashboard mockup**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-25T06:43:26Z
- **Completed:** 2026-02-25T06:51:22Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Redesigned header with Features dropdown containing 6 HR modules (ATS, Employee Management, Leave, Payroll, Performance, Onboarding)
- Replaced "Book a Demo" with "Start free trial" CTA linking to /auth/sign-up
- Added HR Tools as direct nav link alongside Pricing and Blog
- Restructured footer from 5 columns to 4 (Product, Resources, Company, Legal) with HR-appropriate links
- Converted hero from centered text layout to two-column grid (text left, product mockup right)
- Created browser-chrome-framed product dashboard mockup with sidebar, stat cards, and content grid
- Added trusted companies strip with 8 placeholder company names below hero
- Updated both en.json and bg.json with matching translations

## Task Commits

Each task was committed atomically:

1. **Task 1: Redesign header and footer with corporate branding and free trial CTA** - `c3d40f9` (feat)
2. **Task 2: Redesign homepage hero with product screenshot layout** - `7a21467` (feat)

## Files Created/Modified
- `app/hr/src/components/layout/header.tsx` - Features dropdown, Start free trial CTA, HR Tools nav link, removed Book a Demo
- `app/hr/src/components/layout/footer.tsx` - 4-column structure (Product, Resources, Company, Legal)
- `app/hr/src/components/sections/hero.tsx` - Two-column grid layout with ProductMockup component and trusted companies strip
- `app/hr/messages/en.json` - Updated nav (features dropdown items), hero (new headlines, trustedBy), footer (product column)
- `app/hr/messages/bg.json` - Matching Bulgarian translations for all updated nav, hero, and footer strings

## Decisions Made
- Header Features dropdown replaces both Platform and Resources dropdowns -- single dropdown with 6 HR module items is cleaner and more focused
- "Book a Demo" removed entirely -- "Start free trial" is the sole CTA per context decision (no demo request path)
- Footer reduced from 5 columns (Platform, Features, Resources, Company, Legal) to 4 (Product, Resources, Company, Legal) -- more appropriate for HR SaaS
- Hero stat cards removed from hero section; they'll be reused as a separate Counter section in later plans
- Product mockup uses a browser-chrome frame with fake dashboard UI -- no external images needed, renders consistently

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Build export error on `/bg/pricing` page -- pre-existing missing translation keys for modular pricing structure added by linter in earlier session. Not caused by this plan's changes. Logged as out-of-scope.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Header and footer wrap every page -- all subsequent page work inherits the new corporate design
- Hero establishes the product-screenshot layout pattern for feature pages
- ProductMockup component pattern can be adapted for feature-specific mockups
- All i18n strings in place for both English and Bulgarian

## Self-Check: PASSED

All files verified present. All commits verified in git log.

---
*Phase: 15-hr-app*
*Completed: 2026-02-25*
