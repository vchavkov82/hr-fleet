---
phase: 12-migrate-to-pnpm-turbo
plan: 01
subsystem: infra
tags: [pnpm, docker, podman, makefile, playwright]

requires:
  - phase: 05-foundation-monorepo
    provides: monorepo structure with pnpm workspace
provides:
  - "Clean codebase with zero bun references in operational files"
  - "Container images using node:20-alpine with pnpm"
  - "All dev/test scripts using pnpm commands"
affects: [12-02]

tech-stack:
  added: []
  patterns: [pnpm-only package management]

key-files:
  created: []
  modified:
    - deploy/podman-compose.yml
    - deploy/podman-compose.override.yml
    - apps/web/docker-entrypoint.sh
    - Makefile
    - scripts/dev-apps.sh
    - apps/web/scripts/dev-apps.sh
    - apps/web/package.json
    - apps/web/playwright.config.ts

key-decisions:
  - "Also fixed apps/web/scripts/dev-apps.sh which was not in the plan but contained bun references"

patterns-established:
  - "pnpm as sole package manager across all scripts and containers"

duration: 2min
completed: 2026-03-13
---

# Phase 12 Plan 01: Remove Bun Artifacts Summary

**Removed all bun artifacts (bun.lock, bunfig.toml) and replaced bun references with pnpm across containers, scripts, Makefile, and Playwright config**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T23:20:47Z
- **Completed:** 2026-03-13T23:22:18Z
- **Tasks:** 2
- **Files modified:** 10 (2 deleted, 8 modified)

## Accomplishments
- Deleted bun.lock and bunfig.toml from repo root
- Replaced all 3 container images from oven/bun:1-alpine to node:20-alpine
- Updated docker-entrypoint.sh, compose override, Makefile, dev scripts, package.json, and Playwright config to use pnpm

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete bun artifacts, update container images and entrypoint** - `5e917de` (feat)
2. **Task 2: Update Makefile, dev scripts, package.json, and Playwright config** - `9290f6b` (feat)

## Files Created/Modified
- `bun.lock` - Deleted
- `bunfig.toml` - Deleted
- `deploy/podman-compose.yml` - Container images changed to node:20-alpine
- `deploy/podman-compose.override.yml` - Commands changed to pnpm
- `apps/web/docker-entrypoint.sh` - Uses pnpm install and pnpm dev
- `Makefile` - All dev/test targets use pnpm
- `scripts/dev-apps.sh` - Uses pnpm dev for all apps
- `apps/web/scripts/dev-apps.sh` - Uses pnpm dev for blog
- `apps/web/package.json` - test:all uses pnpm run test
- `apps/web/playwright.config.ts` - webServer command uses pnpm dev

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Fixed bun reference in apps/web/scripts/dev-apps.sh**
- **Found during:** Task 2 (final verification)
- **Issue:** apps/web/scripts/dev-apps.sh also contained a bun dev reference not listed in the plan
- **Fix:** Replaced bun dev with pnpm dev
- **Files modified:** apps/web/scripts/dev-apps.sh
- **Verification:** grep confirms zero bun references in operational files
- **Committed in:** 9290f6b (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for completeness - would have left a bun reference in the codebase.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All bun references eliminated from operational files
- Ready for plan 02 (remaining pnpm/turbo migration tasks)

---
*Phase: 12-migrate-to-pnpm-turbo*
*Completed: 2026-03-13*
