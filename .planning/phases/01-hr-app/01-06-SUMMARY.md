---
phase: 01-hr-app
plan: 06
subsystem: ui
tags: [react, next-intl, calculators, bulgarian-tax, seo, tailwindcss]

# Dependency graph
requires:
  - phase: 15-01
    provides: "Design system foundation, BG_TAX_2026 constants, tailwind config"
provides:
  - "Salary net/gross calculator with full Bulgarian deduction breakdown"
  - "Leave day calculator with service years, disability, hazardous work factors"
  - "Employment cost calculator with per-employee and team cost projections"
  - "Redesigned HR tools index page with calculator cards and template sections"
affects: [15-hr-app]

# Tech tracking
tech-stack:
  added: []
  patterns: [server-page-wraps-client-calculator, labels-prop-for-i18n, binary-search-net-to-gross]

key-files:
  created:
    - app/hr/src/components/calculators/salary-calculator.tsx
    - app/hr/src/components/calculators/leave-calculator.tsx
    - app/hr/src/components/calculators/employment-cost-calculator.tsx
    - app/hr/src/app/[locale]/hr-tools/salary-calculator/page.tsx
    - app/hr/src/app/[locale]/hr-tools/leave-calculator/page.tsx
    - app/hr/src/app/[locale]/hr-tools/employment-cost-calculator/page.tsx
  modified:
    - app/hr/src/app/[locale]/hr-tools/page.tsx
    - app/hr/messages/en.json
    - app/hr/messages/bg.json

key-decisions:
  - "Labels passed as Record<string,string> props from server page to client calculator — avoids useTranslations in client components"
  - "Binary search algorithm for net-to-gross mode — iterates to find gross that yields target net within 0.01 BGN precision"
  - "Intl.NumberFormat('bg-BG') for Bulgarian locale currency formatting in all calculators"

patterns-established:
  - "Calculator pattern: 'use client' component receives labels prop, server page.tsx wraps with SEO content + breadcrumb + CTA"
  - "HR tools index: hero (navy-deep) + calculators section (surface-light) + templates section (white) + CTA (cta-gradient)"

requirements-completed: []

# Metrics
duration: 7min
completed: 2026-02-25
---

# Phase 15 Plan 06: HR Calculators Summary

**3 interactive Bulgarian tax calculators (salary net/gross, leave entitlement, employment cost) with real 2026 rates, SEO content pages, and redesigned HR tools index**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-25T06:43:20Z
- **Completed:** 2026-02-25T06:50:11Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Salary calculator computes net from gross (and reverse via binary search) using all BG_TAX_2026 social security, health, and pension rates
- Leave calculator computes annual leave entitlement factoring service years, disability, age, and hazardous work conditions
- Employment cost calculator projects per-employee and team costs with monthly/annual totals
- HR tools index page redesigned with navy hero, calculator cards section, templates section, and gradient CTA
- All calculators use Bulgarian locale number formatting (Intl.NumberFormat bg-BG)
- Each calculator page has SEO content about Bulgarian payroll/labor laws above and below the calculator

## Task Commits

Each task was committed atomically:

1. **Task 1: Build salary calculator and leave calculator** - `28390b7` (feat)
2. **Task 2: Build employment cost calculator and update HR tools index** - `9cfeb7d` (feat)

## Files Created/Modified
- `app/hr/src/components/calculators/salary-calculator.tsx` - Interactive gross-to-net and net-to-gross salary calculator
- `app/hr/src/components/calculators/leave-calculator.tsx` - Annual leave entitlement calculator
- `app/hr/src/components/calculators/employment-cost-calculator.tsx` - Total employer cost calculator with team scaling
- `app/hr/src/app/[locale]/hr-tools/salary-calculator/page.tsx` - SEO content page wrapping salary calculator
- `app/hr/src/app/[locale]/hr-tools/leave-calculator/page.tsx` - SEO content page wrapping leave calculator
- `app/hr/src/app/[locale]/hr-tools/employment-cost-calculator/page.tsx` - SEO content page wrapping employment cost calculator
- `app/hr/src/app/[locale]/hr-tools/page.tsx` - Redesigned HR tools index with calculator and template sections
- `app/hr/messages/en.json` - Added all calculator translations, SEO content, and index page sections
- `app/hr/messages/bg.json` - Synced new hrTools keys (English placeholders for future translation)

## Decisions Made
- Labels passed as Record<string,string> props from server page to client calculator -- avoids useTranslations in client components
- Binary search algorithm for net-to-gross mode -- iterates to find gross that yields target net within 0.01 BGN precision
- Intl.NumberFormat('bg-BG') for Bulgarian locale currency formatting in all calculators
- Insurable income clamped between MIN_INSURABLE_INCOME (1,213) and MAX_INSURABLE_INCOME (3,850) for social security calculations
- bg.json synced with English placeholders to prevent runtime MISSING_MESSAGE errors on calculator pages

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Synced bg.json with calculator translations**
- **Found during:** Task 2
- **Issue:** bg.json lacked all new hrTools keys (salaryCalculator, leaveCalculator, employmentCostCalculator, index page keys). Would cause runtime MISSING_MESSAGE errors for /bg locale.
- **Fix:** Copied all new en.json hrTools keys to bg.json as English placeholders
- **Files modified:** app/hr/messages/bg.json
- **Verification:** Build no longer throws MISSING_MESSAGE for calculator pages
- **Committed in:** 9cfeb7d (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for bg locale support. No scope creep.

## Issues Encountered
- Pre-existing build errors on /bg pricing and /bg contact pages (MISSING_MESSAGE for pages.pricing.modules and pages.contact) -- not related to this plan's changes, existed before

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 3 calculator URLs live and functional
- HR tools index page links to all calculators
- Ready for template pages (Plan 07+) and further SEO content

## Self-Check: PASSED

- All 7 key files verified present on disk
- Both task commits (28390b7, 9cfeb7d) verified in git log

---
*Phase: 15-hr-app*
*Completed: 2026-02-25*
