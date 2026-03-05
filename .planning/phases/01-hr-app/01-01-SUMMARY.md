---
phase: 01-hr-app
plan: 01
subsystem: ui
tags: [tailwind, framer-motion, design-system, bulgarian-tax, corporate-blue]

# Dependency graph
requires: []
provides:
  - Corporate blue Tailwind color palette (#1B4DDB primary, #0EA5E9 accent, #0F172A navy)
  - SectionReveal whileInView animation wrapper component
  - Counter animated number component with scroll-trigger
  - BG_TAX_2026 Bulgarian tax rate constants for calculators
  - Updated globals.css button/card utility classes
affects: [15-02, 15-03, 15-04, 15-05, 15-06, 15-07, 15-08, 15-09, 15-10]

# Tech tracking
tech-stack:
  added: []
  patterns: [framer-motion whileInView wrapper, useSpring animated counter, as-const tax config]

key-files:
  created:
    - app/hr/src/components/ui/section-reveal.tsx
    - app/hr/src/components/ui/counter.tsx
    - app/hr/src/lib/bulgarian-tax.ts
  modified:
    - app/hr/tailwind.config.js
    - app/hr/src/app/globals.css
    - .gitignore

key-decisions:
  - "Corporate blue #1B4DDB primary replaces bright #215cff for deeper enterprise feel (BambooHR/Personio inspired)"
  - "Sky blue #0EA5E9 accent replaces pink #EC4899 for more corporate palette"
  - "btn-secondary uses primary border/text instead of gray for stronger brand presence"
  - ".gitignore !**/src/lib/ negation unblocks app/hr/src/lib/ from Python-era lib/ pattern"

patterns-established:
  - "SectionReveal: wrap page sections for fade-up scroll reveal (viewport once, -80px margin)"
  - "Counter: animated stat numbers with useSpring duration:2000 bounce:0"
  - "BG_TAX_2026 as const: centralized tax rates module for all calculator components"

requirements-completed: []

# Metrics
duration: 2min
completed: 2026-02-25
---

# Phase 15 Plan 01: Design System Foundation Summary

**Corporate blue Tailwind palette (#1B4DDB), SectionReveal/Counter animation primitives, and BG_TAX_2026 constants for HR app redesign**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-25T06:38:21Z
- **Completed:** 2026-02-25T06:40:54Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Updated Tailwind palette from bright blue (#215cff) to corporate blue (#1B4DDB) with full shade scale (50-900)
- Replaced pink accent (#EC4899) with sky blue (#0EA5E9) for professional corporate look
- Created SectionReveal framer-motion whileInView wrapper for scroll-triggered fade-up animations
- Created Counter animated number component using useSpring for scroll-triggered stat counting
- Created BG_TAX_2026 constants module with complete 2026 Bulgarian tax/social security rates
- Updated globals.css button and card utility classes to use new palette tokens

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Tailwind palette and globals.css** - `78960c8` (feat)
2. **Task 2: Create UI primitives and Bulgarian tax constants** - `a6be8a3` (feat)

## Files Created/Modified
- `app/hr/tailwind.config.js` - Corporate blue palette with primary/accent/navy/success/warning/surface tokens
- `app/hr/src/app/globals.css` - Updated btn-primary, btn-secondary, card, section-label utility classes
- `app/hr/src/components/ui/section-reveal.tsx` - framer-motion whileInView fade-up wrapper
- `app/hr/src/components/ui/counter.tsx` - Animated number counter with useInView + useSpring
- `app/hr/src/lib/bulgarian-tax.ts` - BG_TAX_2026 constants (income tax, social security, health, pension, thresholds)
- `.gitignore` - Added !**/src/lib/ negation to unblock app/hr/src/lib/ from Python-era lib/ pattern

## Decisions Made
- Corporate blue #1B4DDB chosen as primary (was #215cff) for deeper enterprise feel
- Sky blue #0EA5E9 accent replaces pink #EC4899 for more corporate palette
- btn-secondary updated to use primary border/text instead of plain gray for stronger brand connection
- Navy deepened to #0F172A with dark (#020617) and deep (#030B24) variants for hero backgrounds
- Added success (#059669) and warning (#D97706) semantic colors
- surface.lighter changed from #F5F7FA to #F8FAFC for slightly cooler white

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] .gitignore lib/ pattern blocking app/hr/src/lib/**
- **Found during:** Task 2 (creating bulgarian-tax.ts)
- **Issue:** Python-era `lib/` gitignore pattern blocked all `lib/` directories including `app/hr/src/lib/`
- **Fix:** Added `!**/src/lib/` negation after `lib/` in .gitignore
- **Files modified:** .gitignore
- **Verification:** git add succeeds after negation
- **Committed in:** a6be8a3 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix to allow committing new lib/ files. No scope creep.

## Issues Encountered
None beyond the gitignore deviation above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Corporate blue design system tokens in place for all subsequent plans
- SectionReveal and Counter components ready for import in homepage and feature pages
- BG_TAX_2026 constants ready for salary/leave/employment-cost calculators
- Build passes clean with no TypeScript errors

---
*Phase: 15-hr-app*
*Completed: 2026-02-25*
