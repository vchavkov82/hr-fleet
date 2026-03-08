---
phase: 03-user-odo
plan: 03
subsystem: api
tags: [go, chi, redis, jwt, rest-api, caching, graceful-degradation, odoo]

requires:
  - phase: 03-01
    provides: Go project scaffold with chi router, config, and health endpoint
  - phase: 03-02
    provides: Odoo JSON-RPC client with employee CRUD operations
provides:
  - REST API at /api/v1/employees with GET (list+detail), POST, PUT
  - Redis cache layer with stale-copy fallback for graceful degradation
  - EmployeeService with 5-min cache TTL and write-through invalidation
  - JWT authentication middleware on all /api/v1 routes
  - ProvisioningService for Odoo company+user auto-provisioning
  - CORS configuration for frontend integration
affects: [03-04, 03-05, frontend-integration]

tech-stack:
  added: [go-redis/v9, golang.org/x/sync/singleflight, go-chi/jwtauth/v5, lestrrat-go/jwx/v2, go-chi/cors, alicebob/miniredis/v2]
  patterns: [service-interface-mock-testing, stale-cache-degradation, singleflight-dedup, tdd-red-green]

key-files:
  created:
    - backend/internal/cache/redis.go
    - backend/internal/service/employee.go
    - backend/internal/service/provisioning.go
    - backend/internal/handler/employee.go
    - backend/internal/middleware/auth.go
    - backend/internal/cache/redis_test.go
    - backend/internal/service/employee_test.go
    - backend/internal/service/provisioning_test.go
    - backend/internal/handler/employee_test.go
  modified:
    - backend/cmd/server/main.go
    - backend/go.mod
    - backend/go.sum

key-decisions:
  - "Interface-based mocking for OdooClient and EmployeeServicer enables testing without real Redis/Odoo"
  - "Stale cache with 30-min TTL (6x primary) for graceful degradation when Odoo is unavailable"
  - "Singleflight on cache Get prevents stampede on concurrent requests"
  - "No graceful degradation for writes -- errors returned directly to caller"
  - "Provisioning logs failed user creation for manual cleanup (company already created)"

patterns-established:
  - "Service layer pattern: interface for Odoo client, struct with cache, method per operation"
  - "Graceful degradation: primary cache -> Odoo call -> stale cache -> ErrServiceUnavailable"
  - "Handler pattern: parse params, call service, handle errors with typed checks, respond JSON"
  - "TDD with miniredis: real Redis behavior without external dependency"

requirements-completed: [EMP-01, EMP-02]

duration: 5min
completed: 2026-03-08
---

# Phase 03 Plan 03: REST API Layer Summary

**Go REST API with Redis caching, JWT auth, graceful Odoo degradation, and company provisioning via chi router**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-08T17:26:45Z
- **Completed:** 2026-03-08T17:32:11Z
- **Tasks:** 2 (TDD, 4 commits total: 2 RED + 2 GREEN)
- **Files modified:** 12

## Accomplishments
- Redis cache wrapper with Get/Set/GetStale/DeletePattern plus singleflight dedup
- Employee service with 5-min cache, stale fallback on Odoo failure, write-through invalidation
- REST handlers for employee CRUD with pagination, validation, and 503 degradation
- JWT middleware protecting all /api/v1 routes
- Provisioning service for Odoo company + admin user creation on sign-up
- Full route wiring in main.go with CORS support
- 18 tests passing (5 cache + 6 service + 3 provisioning + 9 handler) -- zero external dependencies needed

## Task Commits

Each task was committed atomically (TDD: test then implementation):

1. **Task 1 RED: Cache + service tests** - `7a45428` (test)
2. **Task 1 GREEN: Cache + service implementation** - `9e97f2d` (feat)
3. **Task 2 RED: Handler + provisioning tests** - `a2381ea` (test)
4. **Task 2 GREEN: Handler + provisioning + main.go wiring** - `8f56564` (feat)

## Files Created/Modified
- `backend/internal/cache/redis.go` - Redis cache with stale copy, singleflight, pattern delete
- `backend/internal/cache/redis_test.go` - 5 cache tests with miniredis
- `backend/internal/service/employee.go` - Employee service with OdooClient interface, caching, degradation
- `backend/internal/service/employee_test.go` - 6 service tests with mock Odoo client
- `backend/internal/service/provisioning.go` - Company + user provisioning via Odoo Create
- `backend/internal/service/provisioning_test.go` - 3 provisioning tests
- `backend/internal/handler/employee.go` - REST handlers with validation, pagination, error handling
- `backend/internal/handler/employee_test.go` - 9 handler tests with httptest
- `backend/internal/middleware/auth.go` - JWT auth helper wrapping go-chi/jwtauth
- `backend/cmd/server/main.go` - Full wiring: Odoo client, cache, services, handlers, JWT, CORS, routes

## Decisions Made
- Interface-based mocking (OdooClient, EmployeeServicer) for testing without external services
- Stale cache TTL at 6x primary (30 min stale vs 5 min primary) for degradation window
- Singleflight prevents cache stampede on high-concurrency cache misses
- Write operations (Create/Update) never degrade -- errors surface immediately
- Provisioning logs failed user creation but returns error (company needs manual cleanup)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- miniredis v2 `Keys()` returns single value (not tuple) -- fixed in test code
- jwx/v2 required explicit `go get` for missing transitive dependency

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- REST API ready for frontend integration at /api/v1/employees
- JWT auth in place -- frontend needs token generation (login flow in future plan)
- Provisioning service ready to be called from sign-up flow
- CORS configured for localhost:3010 (dev) and production domain

## Self-Check: PASSED

All 10 created files verified on disk. All 4 commits (7a45428, 9e97f2d, a2381ea, 8f56564) verified in git log.

---
*Phase: 03-user-odo*
*Completed: 2026-03-08*
