---
phase: 05-foundation-and-monorepo-setup
plan: 01
subsystem: infra
tags: [pnpm, turborepo, monorepo, go, workspace]

requires: []
provides:
  - Monorepo layout with apps/web, apps/blog, apps/docs, apps/admin, services/api, services/worker
  - pnpm workspace config covering apps/*, services/*, packages/*
  - Turborepo task graph with Go binary outputs
  - Go API service with updated module path
  - Worker service scaffold with graceful shutdown
affects: [05-02, 05-03, 05-04, 06, 07, 08, 09, 10, 11]

tech-stack:
  added: []
  patterns: [monorepo-layout, go-service-as-turbo-member]

key-files:
  created:
    - services/api/package.json
    - services/worker/package.json
    - services/worker/go.mod
    - services/worker/cmd/worker/main.go
    - apps/admin/package.json
    - services/api/internal/cache/cache.go
  modified:
    - pnpm-workspace.yaml
    - turbo.json
    - package.json
    - Makefile
    - .gitignore
    - deploy/podman-compose.yml
    - deploy/podman-compose.override.yml
    - scripts/dev-apps.sh
    - packages/design-system/tailwind.config.ts
    - bunfig.toml

key-decisions:
  - "Go module path: github.com/vchavkov/hr/services/api (matches repo + directory)"
  - "Worker scaffold uses context-based graceful shutdown pattern"
  - "Restored missing cache package inline rather than deferring (Rule 3)"

patterns-established:
  - "Go services as Turborepo members via thin package.json with go build/test/lint scripts"
  - "Monorepo layout: apps/* for frontends, services/* for backends, packages/* for shared"

requirements-completed: [FND-01]

duration: 7min
completed: 2026-03-13
---

# Phase 05 Plan 01: Monorepo Restructure Summary

**pnpm workspaces + Turborepo monorepo with relocated apps (www, blog, docs, backend) and new scaffolds (worker, admin)**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-13T21:54:58Z
- **Completed:** 2026-03-13T22:02:23Z
- **Tasks:** 2
- **Files modified:** 18

## Accomplishments
- Relocated 4 existing directories into monorepo layout via git mv
- All 7 workspace members visible in Turborepo task graph
- Go API builds and tests pass with updated module path
- Worker scaffold builds with graceful shutdown

## Task Commits

Each task was committed atomically:

1. **Task 1: Relocate existing apps and backend into monorepo layout** - `7b4c2a6` (feat)
2. **Task 2: Create scaffolds and update Turborepo config** - `d1ff284` (feat)

## Files Created/Modified
- `pnpm-workspace.yaml` - Updated workspace globs: apps/*, services/*, packages/*
- `turbo.json` - Added bin/** to build outputs for Go services
- `package.json` - Updated all script paths from www/ to apps/web/ etc.
- `Makefile` - Updated all paths to new monorepo layout
- `.gitignore` - Updated paths, added services/*/bin/
- `services/api/package.json` - Thin wrapper for Turborepo integration
- `services/worker/` - Go worker scaffold with graceful shutdown
- `apps/admin/` - Placeholder admin scaffold
- `services/api/internal/cache/cache.go` - Restored missing Redis cache package
- `deploy/podman-compose.yml` - Updated backend context path
- `deploy/podman-compose.override.yml` - Updated volume mount paths
- `scripts/dev-apps.sh` - Updated cd paths
- `packages/design-system/tailwind.config.ts` - Updated content paths
- `bunfig.toml` - Updated root paths

## Decisions Made
- Go module path set to `github.com/vchavkov/hr/services/api` to match repo structure
- Worker scaffold uses `signal.NotifyContext` for clean shutdown
- Restored missing cache package (never committed to git) to unblock Go API build

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Restored missing internal/cache package**
- **Found during:** Task 2 (Go API build verification)
- **Issue:** `services/api/internal/cache/` directory existed but had no .go files -- the cache package was never committed to git
- **Fix:** Created `cache.go` implementing Cache struct with Get, GetStale, Set, DeletePattern methods backed by Redis
- **Files modified:** services/api/internal/cache/cache.go
- **Verification:** `go build ./cmd/server` and `go test ./...` both pass
- **Committed in:** d1ff284

**2. [Rule 3 - Blocking] Updated bunfig.toml paths**
- **Found during:** Task 1 (path reference audit)
- **Issue:** bunfig.toml referenced `www` root paths that no longer existed
- **Fix:** Updated root and preload paths to `apps/web`
- **Files modified:** bunfig.toml
- **Committed in:** 7b4c2a6

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary for builds to succeed. No scope creep.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Monorepo structure in place for all subsequent phases
- Shared packages directory ready for new packages (05-02)
- Services directory ready for additional microservices

---
*Phase: 05-foundation-and-monorepo-setup*
*Completed: 2026-03-13*
