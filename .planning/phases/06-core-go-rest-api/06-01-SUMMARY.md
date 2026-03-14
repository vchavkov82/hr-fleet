---
phase: 06-core-go-rest-api
plan: 01
subsystem: api
tags: [zerolog, prometheus, otel, gobreaker, ristretto, circuit-breaker, caching, observability]

requires:
  - phase: 05-foundation-monorepo
    provides: Go module structure, Redis cache, Odoo client
provides:
  - Standardized JSON response helpers (RespondJSON, RespondError, RespondList)
  - Zerolog HTTP request logging middleware
  - Prometheus HTTP metrics middleware with /metrics handler
  - OpenTelemetry HTTP tracing middleware
  - Circuit breaker on Odoo client (gobreaker, trips after 5 failures)
  - Connection pool limiting Odoo concurrency to 20
  - L1 ristretto in-process cache in front of Redis L2
affects: [06-02, 06-03, 06-04, 06-05, 06-06, 06-07]

tech-stack:
  added: [zerolog, gobreaker, ristretto, prometheus/client_golang, otelhttp, validator/v10, swag, http-swagger, asynq]
  patterns: [circuit-breaker-wrap, semaphore-pool, two-tier-cache, structured-error-response]

key-files:
  created:
    - services/api/internal/handler/response.go
    - services/api/internal/middleware/logging.go
    - services/api/internal/middleware/metrics.go
    - services/api/internal/middleware/tracing.go
    - services/api/platform/odoo/circuit_breaker_test.go
    - services/api/internal/cache/cache_test.go
  modified:
    - services/api/go.mod
    - services/api/go.sum
    - services/api/platform/odoo/client.go
    - services/api/internal/cache/cache.go

key-decisions:
  - "Ristretto L1 cache with 1-min TTL, Redis L2 with 5-min TTL, stale at 10x"
  - "Circuit breaker trips after 5 consecutive failures, 10s timeout to half-open"
  - "Semaphore channel for connection pooling (cap=20, configurable)"
  - "DeletePattern clears both L1 and L2 to prevent stale reads"

patterns-established:
  - "ErrorResponse: {error: {code, message, details[]}} for all error responses"
  - "RespondList: {data, meta: {total, page, per_page, total_pages}} for paginated lists"
  - "cb.Execute wraps all Odoo HTTP calls for circuit breaking"
  - "L1 check -> L2 fallback -> populate L1 on L2 hit"

requirements-completed: [API-10, API-12, API-13]

duration: 4min
completed: 2026-03-14
---

# Phase 06 Plan 01: Foundation Dependencies and Resilience Summary

**Zerolog/Prometheus/OTel observability middleware, gobreaker circuit breaker on Odoo client, and ristretto L1 cache layer**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-14T00:29:05Z
- **Completed:** 2026-03-14T00:33:01Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Installed all new Go dependencies (zerolog, gobreaker, ristretto, prometheus, otel, validator, swag, asynq)
- Created standardized JSON response helpers with paginated list support
- Added zerolog, Prometheus, and OpenTelemetry HTTP middleware
- Extended Odoo client with circuit breaker (5-failure trip) and semaphore connection pool (max 20)
- Added ristretto L1 in-process cache with automatic L2 Redis fallback and population

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies, add response helpers and observability middleware** - `f586291` (feat)
2. **Task 2: Odoo circuit breaker, connection pool, and ristretto L1 cache**
   - RED: `2a20997` (test) - failing tests for circuit breaker, pool, L1 cache
   - GREEN: `2ba3dab` (feat) - implementation passing all tests

## Files Created/Modified
- `services/api/internal/handler/response.go` - Shared JSON response helpers (RespondJSON, RespondError, RespondList)
- `services/api/internal/middleware/logging.go` - Zerolog HTTP request logging middleware
- `services/api/internal/middleware/metrics.go` - Prometheus HTTP metrics with /metrics handler
- `services/api/internal/middleware/tracing.go` - OpenTelemetry HTTP tracing middleware
- `services/api/platform/odoo/client.go` - Circuit breaker + connection pool on Odoo client
- `services/api/internal/cache/cache.go` - L1 ristretto + L2 Redis two-tier cache
- `services/api/platform/odoo/circuit_breaker_test.go` - Circuit breaker and pool tests
- `services/api/internal/cache/cache_test.go` - L1/L2 cache layering tests

## Decisions Made
- Ristretto L1 with 1-min TTL keeps hot data in-process; Redis L2 at 5-min TTL
- Circuit breaker uses gobreaker with configurable settings via ClientOptions
- Semaphore channel pattern for connection pooling (simple, no external dep)
- DeletePattern must clear both L1 and L2 to prevent stale cache after invalidation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] DeletePattern not clearing L1 cache**
- **Found during:** Task 2 (GREEN phase)
- **Issue:** After adding L1 cache, DeletePattern only cleared Redis L2, causing stale reads in existing service tests
- **Fix:** Added L1 eviction loop in DeletePattern for all scanned keys
- **Files modified:** services/api/internal/cache/cache.go
- **Verification:** TestEmployeeService_Create_InvalidatesCache passes
- **Committed in:** 2ba3dab (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for correctness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All dependencies installed and compiling
- Response helpers, middleware, and resilience patterns ready for subsequent plans
- Circuit breaker and cache tests provide regression safety

---
*Phase: 06-core-go-rest-api*
*Completed: 2026-03-14*
