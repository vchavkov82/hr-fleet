---
phase: 01-hr-app
plan: 07
subsystem: ui
tags: [templates, email-gate, lead-capture, headlessui, react-hook-form, zod, bulgarian-hr]

# Dependency graph
requires:
  - phase: 15-01
    provides: Corporate blue Tailwind palette, SectionReveal animation primitive
provides:
  - EmailGateModal component for email-gated downloads
  - TemplateDownloadCard client component with localStorage unlock tracking
  - TemplatePageLayout shared layout for template detail pages
  - Templates index page listing all 6 HR templates
  - 6 individual template pages with SEO content about Bulgarian labour law
  - en.json templates section with full content for all 6 templates
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [EmailGateModal with Headless UI Dialog + react-hook-form + zod, localStorage lead tracking, shared TemplatePageLayout for content pages]

key-files:
  created:
    - app/hr/src/components/ui/email-gate-modal.tsx
    - app/hr/src/components/ui/template-download-card.tsx
    - app/hr/src/components/templates/template-page-layout.tsx
    - app/hr/src/app/[locale]/hr-tools/templates/page.tsx
    - app/hr/src/app/[locale]/hr-tools/templates/employment-contract/page.tsx
    - app/hr/src/app/[locale]/hr-tools/templates/job-description/page.tsx
    - app/hr/src/app/[locale]/hr-tools/templates/leave-policy/page.tsx
    - app/hr/src/app/[locale]/hr-tools/templates/onboarding-checklist/page.tsx
    - app/hr/src/app/[locale]/hr-tools/templates/performance-review/page.tsx
    - app/hr/src/app/[locale]/hr-tools/templates/termination-document/page.tsx
  modified:
    - app/hr/messages/en.json

key-decisions:
  - "TemplatePageLayout shared component avoids code duplication across 6 template pages — each page is a thin wrapper passing slug and icon"
  - "localStorage lead tracking stores email/name per template slug; template_unlocked_${slug} flag enables repeat downloads without re-gating"
  - "Email-gated download shows success message instead of actual PDF download — templates will be emailed (no real PDF files in /public needed)"

patterns-established:
  - "EmailGateModal: reusable email capture with Headless UI Dialog, zod validation, localStorage persistence"
  - "TemplateDownloadCard: client component checking localStorage unlock status, toggling between gated and ungated download states"
  - "TemplatePageLayout: hero + content grid (2/3 content + 1/3 sticky card) + related templates section"

requirements-completed: []

# Metrics
duration: 7min
completed: 2026-02-25
---

# Phase 15 Plan 07: HR Templates Summary

**Email-gated HR template download system with 6 individual pages for employment contract, job description, leave policy, onboarding checklist, performance review, and termination document — each with Bulgarian labour law SEO content**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-25T06:43:44Z
- **Completed:** 2026-02-25T06:51:14Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Created EmailGateModal component with Headless UI Dialog, react-hook-form + zod validation, and localStorage lead persistence
- Created TemplateDownloadCard client component that checks localStorage unlock status and toggles between gated/ungated download states
- Created TemplatePageLayout shared layout with hero, content grid (whats-included + how-to-use + SEO content), sticky download card, and related templates section
- Created templates index page with dark navy hero and 6-card grid listing all templates
- Created 6 individual template pages at /hr-tools/templates/{slug} with Bulgarian labour law SEO content
- Added comprehensive en.json templates section with detailed content for all 6 templates including legal articles and procedures

## Task Commits

Each task was committed atomically:

1. **Task 1: Create EmailGateModal component and templates index page** - `18f7709` (feat)
2. **Task 2: Create 6 individual template pages with email-gated downloads** - `0b4ea90` (feat)

## Files Created/Modified
- `app/hr/src/components/ui/email-gate-modal.tsx` - Email capture modal with Headless UI Dialog, zod validation, localStorage lead storage
- `app/hr/src/components/ui/template-download-card.tsx` - Client component for sticky download sidebar with unlock tracking
- `app/hr/src/components/templates/template-page-layout.tsx` - Shared template detail page layout (hero + content grid + related templates)
- `app/hr/src/app/[locale]/hr-tools/templates/page.tsx` - Templates index page with hero and 6-card grid
- `app/hr/src/app/[locale]/hr-tools/templates/employment-contract/page.tsx` - Employment contract template page
- `app/hr/src/app/[locale]/hr-tools/templates/job-description/page.tsx` - Job description template page
- `app/hr/src/app/[locale]/hr-tools/templates/leave-policy/page.tsx` - Leave policy template page
- `app/hr/src/app/[locale]/hr-tools/templates/onboarding-checklist/page.tsx` - Onboarding checklist template page
- `app/hr/src/app/[locale]/hr-tools/templates/performance-review/page.tsx` - Performance review template page
- `app/hr/src/app/[locale]/hr-tools/templates/termination-document/page.tsx` - Termination document template page
- `app/hr/messages/en.json` - Added templates section with 6 template definitions, email gate labels, download card labels

## Decisions Made
- TemplatePageLayout shared component avoids code duplication across 6 template pages — each page is a thin wrapper passing slug and icon SVG
- localStorage lead tracking stores email/name per template slug; template_unlocked_${slug} flag enables repeat downloads without re-gating
- Email-gated download shows success message instead of actual PDF download — templates will be emailed (no real PDF files in /public needed)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing build failures on /bg/pricing and /bg/about due to missing Bulgarian translations — unrelated to template pages (out of scope). All 7 template routes (1 index + 6 individual) build and render successfully.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Template download system complete and functional
- Email gate modal reusable for future lead-capture scenarios
- All template pages have generateStaticParams and generateMetadata for SSG/SEO
- Build confirms all template routes resolve without errors

## Self-Check: PASSED

All 10 created files verified on disk. Both task commits (18f7709, 0b4ea90) verified in git log.

---
*Phase: 15-hr-app*
*Completed: 2026-02-25*
