---
phase: 04-content-aligned-with-odoo
plan: 03
subsystem: ui
tags: [next-intl, i18n, help-center, bulgarian]

# Dependency graph
requires:
  - phase: 01-marketing-site
    provides: Help center pages and translation infrastructure
provides:
  - Help center articles documenting real features only (employee directory, salary calculator, freelancer comparison)
  - Bilingual help center content (EN + BG) aligned with actual product capabilities
  - Updated help center categories reflecting real product areas
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [real-feature-only content, category-aligned help articles]

key-files:
  created: []
  modified:
    - www/messages/en/helpCenter.json
    - www/messages/bg/helpCenter.json
    - www/src/app/[locale]/help-center/page.tsx
    - www/src/app/[locale]/help-center/categories/[category]/page.tsx
    - www/src/app/[locale]/help-center/articles/[article]/page.tsx

key-decisions:
  - "Replaced Leave/Payroll/Integrations categories with HR Tools/Compliance/Account to match real product"
  - "Removed all references to ATS, AI screening, payroll processing from help center"

patterns-established:
  - "Help center content must only reference working features"

requirements-completed: [CONTENT-04]

# Metrics
duration: 12min
completed: 2026-03-08
---

# Phase 04 Plan 03: Help Center Content Rewrite Summary

**Help center rewritten with 6 real-feature articles (employee directory, salary calculator, freelancer comparison, dashboard, compliance) replacing ATS/payroll/AI screening placeholders, bilingual EN+BG**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-08T21:00:38Z
- **Completed:** 2026-03-08T21:12:16Z
- **Tasks:** 1
- **Files modified:** 5

## Accomplishments
- Replaced all 6 popular articles with real-feature content (employee directory, salary calculator, freelancer comparison, dashboard overview, tax guide)
- Updated categories from Leave/Payroll/Integrations to HR Tools & Calculators/Bulgarian Compliance/Account & Settings
- Complete bilingual content in both English and Bulgarian with professional HR terminology
- Updated category page with real-feature article data and new translation keys
- Updated article page static params and related articles for new content slugs

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite help center content for real features** - `c9cbda8` (feat)

## Files Created/Modified
- `www/messages/en/helpCenter.json` - Updated meta, articles, categories, quickLinks for real features
- `www/messages/bg/helpCenter.json` - Bulgarian translations matching EN structure
- `www/src/app/[locale]/help-center/page.tsx` - Updated CATEGORIES and POPULAR_ARTICLES arrays
- `www/src/app/[locale]/help-center/categories/[category]/page.tsx` - Updated CATEGORY_SLUGS, categoryTitles, MOCK_ARTICLES, categoryMap
- `www/src/app/[locale]/help-center/articles/[article]/page.tsx` - Updated generateStaticParams and relatedArticles

## Decisions Made
- Replaced Leave & Absence, Payroll, Integrations categories with HR Tools & Calculators, Bulgarian Compliance, Account & Settings
- Removed all references to ATS pipeline, AI CV screening, payroll processing, and integrations (Slack, Google, etc.)
- Added compliance category for Bulgarian tax/social security content since platform has built-in calculators

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated category page to match new translation keys**
- **Found during:** Task 1 (Help center content rewrite)
- **Issue:** Category page at `/help-center/categories/[category]/page.tsx` referenced old translation keys (leave, payroll, integrations, security) that no longer existed in helpCenter.json, causing build failure
- **Fix:** Updated CATEGORY_SLUGS, categoryTitles, MOCK_ARTICLES, and categoryMap to use new keys (hr-tools, compliance, account)
- **Files modified:** www/src/app/[locale]/help-center/categories/[category]/page.tsx
- **Verification:** `make build-www` passes
- **Committed in:** c9cbda8 (Task 1 commit)

**2. [Rule 3 - Blocking] Updated article page static params for new slugs**
- **Found during:** Task 1 (Help center content rewrite)
- **Issue:** Article page generateStaticParams listed old article slugs; relatedArticles function referenced old slugs
- **Fix:** Updated both to use new article slugs matching real features
- **Files modified:** www/src/app/[locale]/help-center/articles/[article]/page.tsx
- **Verification:** `make build-www` passes
- **Committed in:** c9cbda8 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary to prevent build failures. Category and article pages had hardcoded references to old translation keys that needed updating alongside the JSON content changes.

## Issues Encountered
- Next.js middleware-manifest.json error on first build attempt due to stale .next cache; resolved by cleaning .next directory

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Help center content aligned with actual product features
- Categories match real product areas
- Ready for any future feature additions to be reflected in help content

---
*Phase: 04-content-aligned-with-odoo*
*Completed: 2026-03-08*
