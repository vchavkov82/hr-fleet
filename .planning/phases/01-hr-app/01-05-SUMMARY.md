---
phase: 01-hr-app
plan: 05
subsystem: ui
tags: [pricing, quote-form, react-hook-form, zod, per-module-pricing, faq, feature-comparison]

# Dependency graph
requires:
  - phase: 15-01
    provides: Corporate blue Tailwind palette, utility classes
provides:
  - Per-module pricing page with 6 module cards (no prices)
  - QuoteForm client component with zod validation and localStorage lead capture
  - Feature comparison table with checkmark matrix
  - FAQ accordion section
  - Updated pricingPreview homepage section (modules, not plans)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [zod form validation with react-hook-form, localStorage lead capture, details/summary FAQ accordion]

key-files:
  created:
    - app/hr/src/components/ui/quote-form.tsx
  modified:
    - app/hr/src/app/[locale]/pricing/page.tsx
    - app/hr/messages/en.json
    - app/hr/messages/bg.json
    - app/hr/src/components/sections/pricing-preview.tsx

key-decisions:
  - "Per-module pricing with 'Get a quote' CTA replaces tiered plans with currency values"
  - "QuoteForm stores leads in localStorage (key: quote_requests) as interim lead capture"
  - "Feature comparison table uses static boolean matrix mapping features to modules"
  - "Homepage pricingPreview updated to show 3 module cards instead of plan cards with prices"

patterns-established:
  - "QuoteForm: zod schema + react-hook-form + localStorage for form submission without backend"
  - "FAQ accordion: native details/summary HTML with Tailwind styling and group-open rotate"

requirements-completed: []

# Metrics
duration: 9min
completed: 2026-02-25
---

# Phase 15 Plan 05: Pricing Page Redesign Summary

**Per-module "Get a quote" pricing page with 6 module cards, feature comparison table, QuoteForm with zod validation, and FAQ accordion -- zero currency values on page**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-25T06:43:44Z
- **Completed:** 2026-02-25T06:52:53Z
- **Tasks:** 1
- **Files modified:** 5

## Accomplishments
- Completely replaced tiered pricing cards (Free/Growth/Enterprise with prices) with 6 module cards (Core HR, ATS, Leave Management, Payroll, Performance, Onboarding) -- each with "Get a quote" CTA
- Created QuoteForm client component with zod schema validation, react-hook-form integration, module checkboxes, company size select, and localStorage lead capture
- Added feature comparison table with 18 feature rows across 6 module columns using checkmark/dash matrix
- Added FAQ accordion with 5 common pricing questions using native details/summary
- Updated homepage PricingPreview to show module cards instead of plan cards with prices
- Full bilingual support: both en.json and bg.json updated with new module-based pricing structure

## Task Commits

Each task was committed atomically:

1. **Task 1: Create QuoteForm component and redesign pricing page** - `5fb8db1` (feat)

Note: Task files were committed alongside legal pages changes by a parallel executor. The code changes are verified correct.

## Files Created/Modified
- `app/hr/src/components/ui/quote-form.tsx` - Client component with zod validation, react-hook-form, module checkboxes, localStorage submission
- `app/hr/src/app/[locale]/pricing/page.tsx` - Completely redesigned: hero, 6 module cards, comparison table, quote form, FAQ
- `app/hr/messages/en.json` - New pages.pricing section with modules, comparison, quoteForm, faqItems; new pricingPreview with modules
- `app/hr/messages/bg.json` - Bulgarian translations for all new pricing content
- `app/hr/src/components/sections/pricing-preview.tsx` - Updated to show 3 module cards with "Get a quote" instead of plan cards with prices

## Decisions Made
- Per-module pricing with "Get a quote" CTA replaces tiered plans per user decision (no public prices)
- QuoteForm stores leads in localStorage as interim solution (no backend endpoint for quote requests yet)
- Feature comparison table uses static boolean matrix -- each feature maps to exactly one module (clean separation)
- Homepage pricingPreview updated to show modules instead of plans to maintain consistency (Rule 2 auto-fix)
- FAQ uses native details/summary HTML elements with Tailwind styling (no JS accordion library needed)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Consistency] Updated homepage PricingPreview to match new quote model**
- **Found during:** Task 1
- **Issue:** Homepage PricingPreview section still showed old plan cards with prices (Free, 99/mo, Contact us), inconsistent with new pricing page
- **Fix:** Rewrote PricingPreview to show 3 module cards (Core HR, ATS, Leave) with "Get a quote" CTA, linking to /pricing#quote
- **Files modified:** app/hr/src/components/sections/pricing-preview.tsx, app/hr/messages/en.json (pricingPreview section), app/hr/messages/bg.json (pricingPreview section)
- **Verification:** Build passes, no price strings in preview component
- **Committed in:** 5fb8db1

**2. [Rule 2 - Consistency] Updated Bulgarian translations (bg.json) for pricing**
- **Found during:** Task 1
- **Issue:** Plan only mentioned en.json but bg.json also had old pricing structure with prices, would break bilingual site
- **Fix:** Added complete Bulgarian translations for all new pricing content (modules, comparison, quote form, FAQ)
- **Files modified:** app/hr/messages/bg.json
- **Verification:** Build passes for both /en/pricing and /bg/pricing
- **Committed in:** 5fb8db1

---

**Total deviations:** 2 auto-fixed (2 consistency/missing critical)
**Impact on plan:** Both auto-fixes necessary for site consistency. Without them, homepage would show prices while pricing page would not, and Bulgarian locale would break. No scope creep.

## Issues Encountered
- Parallel executor committed task files under commit 5fb8db1 (labeled as 15-09 legal pages) instead of as a separate 15-05 commit. Code changes are correct; commit attribution is shared.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Pricing page fully redesigned with per-module quote model
- QuoteForm reusable for any page needing lead capture
- All pricing-related translations complete in both languages
- Build verified clean

---
*Phase: 15-hr-app*
*Completed: 2026-02-25*
