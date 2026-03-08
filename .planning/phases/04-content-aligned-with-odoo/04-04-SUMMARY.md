---
phase: 04-content-aligned-with-odoo
plan: 04
subsystem: content
tags: [blog, seo, bulgarian, astro, labor-law, social-security, eood]

# Dependency graph
requires:
  - phase: 04-content-aligned-with-odoo
    provides: "Blog infrastructure, existing posts, content guidelines"
provides:
  - "6 Bulgarian blog posts covering labor law, social security, EOOD comparison, salary calculation, employee directory, freelancer advice"
  - "SEO content for Bulgarian HR search queries"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Blog posts in both blog/src/blog/ and www/src/content/blog/ (identical content)"

key-files:
  created:
    - blog/src/blog/bulgarian-labor-contracts-guide.md
    - blog/src/blog/social-security-bulgaria-2026.md
    - blog/src/blog/eood-vs-employment-tax-comparison-2026.md
    - blog/src/blog/salary-calculator-bulgaria-2026.md
    - blog/src/blog/employee-directory-setup-guide.md
    - blog/src/blog/when-to-switch-from-freelancer-to-employee.md
    - www/src/content/blog/bulgarian-labor-contracts-guide.md
    - www/src/content/blog/social-security-bulgaria-2026.md
    - www/src/content/blog/eood-vs-employment-tax-comparison-2026.md
    - www/src/content/blog/salary-calculator-bulgaria-2026.md
    - www/src/content/blog/employee-directory-setup-guide.md
    - www/src/content/blog/when-to-switch-from-freelancer-to-employee.md
  modified: []

key-decisions:
  - "All posts written in Bulgarian with natural HR/legal terminology"
  - "Posts reference platform tools (salary calculator, freelancer comparison) for internal linking"
  - "EOOD comparison includes concrete calculations at 3000, 5000, 8000 BGN levels"

patterns-established:
  - "Bulgarian blog content pattern: substantive 1000-2000 word posts with frontmatter, CTA, and disclaimer"

requirements-completed: [CONTENT-05, CONTENT-07]

# Metrics
duration: 10min
completed: 2026-03-08
---

# Phase 4 Plan 4: Targeted Blog Posts Summary

**6 Bulgarian blog posts covering labor contracts, social security 2026 rates, EOOD vs employment tax comparison, salary calculation walkthrough, employee directory setup, and freelancer-to-employee transition advice**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-08T21:15:12Z
- **Completed:** 2026-03-08T21:25:01Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- 3 labor law and market blog posts (contracts guide, social security 2026, EOOD vs employment)
- 3 platform how-to and practical blog posts (salary calculator, employee directory, freelancer advice)
- All posts in Bulgarian with proper AstroPaper frontmatter
- Files identical between blog/ and www/ directories
- Both blog and www builds pass successfully

## Task Commits

Each task was committed atomically:

1. **Task 1: Write 3 Bulgarian labor law and market blog posts** - `755dc1a` (feat)
2. **Task 2: Write 3 platform how-to and practical blog posts** - `91fb2ed` (feat)

## Files Created/Modified
- `blog/src/blog/bulgarian-labor-contracts-guide.md` - Labor contract types, probation, termination rules
- `blog/src/blog/social-security-bulgaria-2026.md` - 2026 social security rates, ceilings, employer guide
- `blog/src/blog/eood-vs-employment-tax-comparison-2026.md` - EOOD vs employment detailed tax comparison
- `blog/src/blog/salary-calculator-bulgaria-2026.md` - Step-by-step net salary calculation guide
- `blog/src/blog/employee-directory-setup-guide.md` - Platform how-to for employee directory
- `blog/src/blog/when-to-switch-from-freelancer-to-employee.md` - 5 signs to switch from EOOD to employment
- `www/src/content/blog/*.md` - Identical copies of all 6 posts

## Decisions Made
- All posts written in Bulgarian with natural HR/legal terminology (not machine-translated)
- Posts reference platform tools (salary calculator, freelancer comparison) for internal linking and SEO value
- EOOD comparison includes concrete calculations at 3,000, 5,000, and 8,000 BGN income levels
- Social security post uses 2026 rates (employer 18.92%, employee 13.78%, ceiling 3,850 BGN)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 4 plans of Phase 04 are now complete
- Blog content covers Bulgarian labor law, social security, tax comparison, salary calculation, employee management, and career advice
- Content supports SEO for Bulgarian HR search queries

## Self-Check: PASSED

All 12 files verified present. Both commits (755dc1a, 91fb2ed) confirmed in git log.

---
*Phase: 04-content-aligned-with-odoo*
*Completed: 2026-03-08*
