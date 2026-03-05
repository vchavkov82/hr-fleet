---
phase: 01-hr-app
plan: 10
subsystem: i18n, routing
tags: [next-intl, next.js-rewrites, astro, blog-proxy, bulgarian-translations]

# Dependency graph
requires:
  - phase: 15-02 through 15-09
    provides: All page content that needs Bulgarian translations
provides:
  - Blog proxy rewrite configuration for Astro hr-blog integration
  - Complete Bulgarian translations matching en.json structure (1351 leaf keys)
  - Middleware exclusion of /blog paths from next-intl locale injection
affects: [app/hr deployment, app/hr-blog integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [next.js beforeFiles rewrites for cross-app proxying, middleware path exclusion for blog routes]

key-files:
  created: []
  modified:
    - app/hr/next.config.mjs
    - app/hr/src/middleware.ts
    - app/hr/src/app/[locale]/blog/page.tsx
    - app/hr/messages/bg.json

key-decisions:
  - "Blog proxy uses beforeFiles rewrites to HR_BLOG_URL env var (default localhost:3013)"
  - "Middleware wraps next-intl createMiddleware with path check — returns NextResponse.next() for /blog paths"
  - "Blog page.tsx kept as fallback when Astro blog is unavailable"

patterns-established:
  - "Cross-app proxy: Next.js beforeFiles rewrites proxy entire path prefix to separate Astro app"
  - "Middleware exclusion: Wrap next-intl middleware to skip paths served by external apps"

requirements-completed: []

# Metrics
duration: 17min
completed: 2026-02-25
---

# Phase 15 Plan 10: Blog Integration & Bulgarian Translations Summary

**Blog proxy via Next.js beforeFiles rewrites to Astro hr-blog, plus complete bg.json with all 1351 leaf keys matching en.json**

## Performance

- **Duration:** 17 min
- **Started:** 2026-02-25T07:00:08Z
- **Completed:** 2026-02-25T07:17:36Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Blog proxy configured in next.config.mjs with beforeFiles rewrites proxying /blog/* to Astro hr-blog
- next-intl middleware updated to skip locale injection for /blog paths
- Bulgarian translations completed from 422 to 1351 leaf keys (929 keys added)
- All 11 missing page sections translated: about, careers, contact, partners, helpCenter, apiDocs, systemStatus, terms, privacy, cookies, gdpr
- Auth panel translations added for login/sign-up split-screen layout
- Build passes successfully with all pages in both en and bg locales

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure blog proxy rewrite and update middleware** - `0d91291` (feat)
2. **Task 2: Complete Bulgarian translations in bg.json** - `8b62ebf` (feat)

## Files Created/Modified
- `app/hr/next.config.mjs` - Added async rewrites() with beforeFiles rules for /blog proxy
- `app/hr/src/middleware.ts` - Wrapped next-intl middleware to exclude /blog paths
- `app/hr/src/app/[locale]/blog/page.tsx` - Added fallback comment, preserved existing blog card layout
- `app/hr/messages/bg.json` - Complete Bulgarian translations (2540 lines, 1351 leaf keys)

## Decisions Made
- Blog proxy uses HR_BLOG_URL env var with localhost:3013 fallback for dev
- Middleware wraps next-intl's createMiddleware rather than modifying matcher config -- more explicit path exclusion
- Blog page.tsx preserved as visual fallback (blog card grid) when Astro blog is not running
- Bulgarian translations use natural HR terminology: КЗЛД, НАП, Кодекс на труда, ДЛЗД, ЕИК

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 15 (HR App) is now complete (all 10 plans executed)
- All pages build successfully in both locales
- Blog proxy ready for production (set HR_BLOG_URL env var to Astro blog URL)

## Self-Check: PASSED

All files exist. All commits verified.

---
*Phase: 15-hr-app*
*Completed: 2026-02-25*
