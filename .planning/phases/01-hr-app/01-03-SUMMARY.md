---
phase: 01-hr-app
plan: 03
subsystem: ui
tags: [next-intl, framer-motion, section-reveal, counter, tailwind, homepage-sections]

# Dependency graph
requires:
  - phase: 15-01
    provides: SectionReveal, Counter, corporate blue palette, globals.css utilities
provides:
  - Complete homepage with 8 sections (Hero, TrustedCompanies, Features, Stats, HowItWorks, Testimonials, BlogPosts, CTA)
  - TrustedCompanies placeholder logo strip component
  - BlogPosts 3-card grid component
  - StatsCounters client wrapper for animated number counters
  - Updated Testimonials with quote icon, star rating, larger avatars
  - Updated Features to 3 highlight cards with SVG icons
  - Updated HowItWorks to 3-step process
  - Updated CTA with "Start free trial" + "Contact us"
affects: [15-04, 15-05]

# Tech tracking
tech-stack:
  added: []
  patterns: [SectionReveal wrapping server component children at page level, StatsCounters client wrapper for Counter in server page]

key-files:
  created:
    - app/hr/src/components/sections/trusted-companies.tsx
    - app/hr/src/components/sections/blog-posts.tsx
    - app/hr/src/components/sections/stats-counters.tsx
  modified:
    - app/hr/src/app/[locale]/page.tsx
    - app/hr/src/components/sections/features.tsx
    - app/hr/src/components/sections/how-it-works.tsx
    - app/hr/src/components/sections/testimonials.tsx
    - app/hr/src/components/sections/cta.tsx
    - app/hr/messages/en.json
    - app/hr/messages/bg.json

key-decisions:
  - "StatsCounters client wrapper created for Counter import in server page.tsx"
  - "Features reduced to 3 highlights (ATS, Employees, Leave) with SVG icons and Learn more links"
  - "HowItWorks simplified to 3 steps (signup, import, manage) matching general HR product flow"
  - "CTA secondary button changed from pricing to /contact to match Get a quote pricing model"
  - "PricingPreview removed from homepage per plan (pricing has dedicated /pricing page)"

patterns-established:
  - "SectionReveal wrapping: server component page wraps each imported section in SectionReveal client component"
  - "StatsCounters: client wrapper pattern for passing server-fetched translation data to Counter client components"
  - "BlogPosts: placeholder card grid pattern ready to swap to Astro RSS fetch when blog exists"

requirements-completed: []

# Metrics
duration: 7min
completed: 2026-02-25
---

# Phase 15 Plan 03: Homepage Sections Summary

**Complete homepage with 8 sections: hero, trusted companies strip, 3-card features, animated stats counters, 3-step how-it-works, testimonials with stars, blog posts grid, and CTA**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-25T06:43:31Z
- **Completed:** 2026-02-25T06:50:45Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Built TrustedCompanies strip with 8 placeholder company logos in grayscale badges
- Created BlogPosts grid showing 3 cards with gradient image placeholders, category badges, and read-more links
- Updated Testimonials with quote icon SVG, 5-star rating, larger avatar circles with initials
- Created StatsCounters client wrapper for Counter components (bg-navy-deep section with 4 animated counters)
- Updated Features from 6 emoji cards to 3 SVG-icon highlight cards (ATS, Employees, Leave) with Learn more links
- Simplified HowItWorks from 4 steps to 3 (signup, import, manage) with connecting line
- Updated CTA to "Start free trial" primary + "Contact us" secondary, solid bg-primary background
- Wrapped all 7 below-hero sections in SectionReveal for scroll-triggered fade-up animations
- Removed PricingPreview from homepage (pricing has its own dedicated page)
- Added all new translations to both en.json and bg.json

## Task Commits

Each task was committed atomically:

1. **Task 1: Create TrustedCompanies strip, BlogPosts grid, update Testimonials** - `b8e30ac` (feat)
2. **Task 2: Update homepage page.tsx with all sections, stats counters, SectionReveal** - `a4c84ba` (feat)

## Files Created/Modified
- `app/hr/src/components/sections/trusted-companies.tsx` - 8-company placeholder logo strip
- `app/hr/src/components/sections/blog-posts.tsx` - 3-card blog post grid with gradient placeholders
- `app/hr/src/components/sections/stats-counters.tsx` - Client wrapper for Counter animated numbers
- `app/hr/src/app/[locale]/page.tsx` - Homepage with all 8 sections + SectionReveal wrappers
- `app/hr/src/components/sections/features.tsx` - 3 highlight cards with SVG icons
- `app/hr/src/components/sections/how-it-works.tsx` - 3-step process with connecting line
- `app/hr/src/components/sections/testimonials.tsx` - Updated with quote icon, stars, larger avatars
- `app/hr/src/components/sections/cta.tsx` - "Start free trial" + "Contact us" CTA
- `app/hr/messages/en.json` - Added trustedCompanies, blogPosts, stats, featuresOverview; updated howItWorks, cta
- `app/hr/messages/bg.json` - Added all corresponding Bulgarian translations

## Decisions Made
- StatsCounters client wrapper created because page.tsx is a server component and Counter is a client component
- Features reduced from 6 generic cards to 3 focused highlights matching the top product modules (ATS, Employee Management, Leave & Payroll)
- HowItWorks simplified to 3 steps (signup, import, manage) to match general HR product onboarding flow
- CTA secondary button changed from /pricing to /contact to align with the "Get a quote" pricing model from plan 02
- PricingPreview removed from homepage since pricing now has a dedicated page with module-based quoting

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added Bulgarian translations for new homepage sections to bg.json**
- **Found during:** Task 2 (build verification)
- **Issue:** New translation keys (trustedCompanies, blogPosts, stats, featuresOverview, updated howItWorks steps, cta.ctaContact) missing from bg.json caused build failure for /bg locale
- **Fix:** Added all corresponding Bulgarian translations to bg.json
- **Files modified:** app/hr/messages/bg.json
- **Verification:** Homepage `/bg` locale builds successfully (no longer in error list)
- **Committed in:** b8e30ac (Task 1 commit, bg.json included)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for Bulgarian locale build. No scope creep.

## Issues Encountered
- Pre-existing build errors on other pages (about, partners, careers, cookies, features, pricing, etc.) from missing bg.json translations — these are out of scope for this plan and exist from prior plan executions.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 8 homepage sections in place with scroll animations and animated counters
- Blog posts section uses placeholder data, ready to swap to Astro RSS fetch
- Features section links to /features page (plan 04 target)
- CTA links to /auth/sign-up and /contact for conversion flow

---
*Phase: 15-hr-app*
*Completed: 2026-02-25*
