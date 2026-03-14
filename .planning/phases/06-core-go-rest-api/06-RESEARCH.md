# Phase 6: Core Go REST API - Research

**Researched:** 2026-03-14
**Domain:** Go REST API, JWT Auth, Odoo Integration, Async Task Processing
**Confidence:** HIGH

## Summary

Phase 6 extends an existing Go Chi-based API scaffold (from Phase 5) into a full-featured REST API. The codebase already has: Chi router with JWT middleware, Odoo JSON-RPC client with session re-auth, Redis caching with stale fallback, sqlc-generated DB layer with pgx/v5, and employee CRUD (handler/service/odoo layers). The current auth uses HS256 symmetric JWT -- this must be migrated to RS256 asymmetric keys per requirements. Config currently uses simple env vars with manual validation.

The scope adds: self-issued JWT RS256 auth with login/refresh + API key auth, RBAC with fixed roles, payroll runs with async processing (Asynq), contracts, leave management, reports, webhooks, circuit breaker, OpenAPI docs, structured logging, metrics, and tracing. Bulgarian tax calculation logic exists in TypeScript (Phase 2) and needs porting to Go for the hybrid payroll engine.

**Primary recommendation:** Extend the existing clean architecture (handler -> service -> odoo/db) incrementally. Add new domain modules following the established pattern. Introduce new dependencies (zerolog, gobreaker, asynq, swaggo, otel, prometheus, ristretto) one concern at a time.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Single-tenant deployment (one company per deployment)
- Self-issued JWT RS256 with `/auth/login` endpoint, own key management, refresh tokens, password hashing
- Both JWT + API keys supported (JWT for user sessions, API keys for integrations/webhooks, long-lived, scoped)
- Fixed RBAC roles: super_admin, admin, hr_manager, hr_officer, accountant, employee, viewer with hardcoded permissions
- Payroll run lifecycle: Draft -> Approve -> Process (prevents accidental runs)
- Hybrid payroll: Go calculates Bulgarian taxes (port Phase 2 TS logic), Odoo handles standard HR data
- Odoo is master for employee data; local DB stores app-specific data (users, audit logs, payroll runs)

### Claude's Discretion
- Payroll run failure mode (fail entire batch vs partial success)
- Payroll run immutability model
- Pagination style (cursor vs offset)
- Error response format
- Bulk operations support
- HATEOAS links
- Odoo degradation behavior
- API domain model mapping
- Odoo write path (sync vs async)

### Deferred Ideas (OUT OF SCOPE)
- Multi-tenancy
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| API-01 | Go 1.22+ REST API with Chi router, versioned under /api/v1 | Chi v5 already in go.mod, router scaffold exists |
| API-02 | Auth: JWT RS256 login/refresh + API Key SHA-256 HMAC | Migrate from HS256 to RS256 using lestrrat-go/jwx (already dep); add bcrypt, API key table |
| API-03 | Employee CRUD with pagination, filtering, soft delete | Handler/service/odoo layers exist; add soft delete, extend filtering |
| API-04 | Payslip endpoints: list, create batch, confirm | New domain module; Odoo hr.payslip model integration |
| API-05 | Payroll run: create, trigger, poll status (async via Asynq) | New domain; Asynq for Redis-based task queue; state machine Draft->Approve->Process |
| API-06 | Contract endpoints: list, create employment contracts | New domain; Odoo hr.contract model |
| API-07 | Leave management: allocations, requests, approve/reject | New domain; Odoo hr.leave and hr.leave.allocation models |
| API-08 | Report endpoints: payroll summary, tax liabilities | New domain; aggregate from payroll runs + BG tax constants |
| API-09 | Webhook registration and management | New domain; local DB stores webhook URLs, events, secrets; HTTP delivery with retry |
| API-10 | Odoo integration: connection pooling (max 20), circuit breaker, retry | Extend existing client; add gobreaker, connection pool, exponential backoff |
| API-11 | Swagger/OpenAPI 3.0 from annotations (swaggo/swag) | Add swag annotations to handlers, serve at /api/docs |
| API-12 | Structured logging (zerolog), Prometheus metrics, OpenTelemetry tracing | Replace log.Printf; add metrics/tracing middleware |
| API-13 | Redis caching (go-redis v9 + ristretto L1), Asynq task queue | go-redis v9 already present; add ristretto L1 cache, Asynq |
</phase_requirements>

## Standard Stack

### Core (already in go.mod)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| go-chi/chi/v5 | 5.2.5 | HTTP router | Already in use, idiomatic Go, middleware-friendly |
| go-chi/jwtauth/v5 | 5.4.0 | JWT middleware | Already in use, needs RS256 config change |
| lestrrat-go/jwx/v2 | 2.1.6 | JWT token creation/validation | Already a dep, supports RS256 natively |
| redis/go-redis/v9 | 9.18.0 | Redis client | Already in use for caching |
| jackc/pgx/v5 | 5.8.0 | PostgreSQL driver | Already in use via sqlc |
| golang.org/x/sync | 0.20.0 | Singleflight | Already in use |

### New Dependencies
| Library | Purpose | Why Standard |
|---------|---------|--------------|
| rs/zerolog | Structured JSON logging | Zero-allocation, fastest Go logger, Chi has zerolog middleware |
| sony/gobreaker | Circuit breaker for Odoo calls | Simple, well-maintained, standard Go circuit breaker |
| hibiken/asynq | Async task queue (Redis-backed) | Purpose-built for Go, uses Redis (already have it), reliable |
| swaggo/swag + swaggo/http-swagger | OpenAPI from annotations | De facto standard for Go swagger generation |
| dgraph-io/ristretto | L1 in-process cache | High-performance concurrent cache from Dgraph |
| prometheus/client_golang | Prometheus metrics | Official Go Prometheus client |
| go.opentelemetry.io/otel | Distributed tracing | Official OpenTelemetry Go SDK |
| go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp | HTTP tracing middleware | Official OTel HTTP instrumentation |
| golang.org/x/crypto/bcrypt | Password hashing | Standard Go crypto lib |
| go-playground/validator/v10 | Struct validation | Most popular Go validator |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| zerolog | slog (stdlib) | slog is stdlib but less feature-rich; zerolog already has Chi middleware integration |
| gobreaker | go-resiliency | gobreaker has simpler API, more widely used |
| asynq | machinery | asynq is lighter, Redis-native, better maintained recently |
| ristretto | bigcache | ristretto has better hit ratios with TinyLFU admission |

**Installation:**
```bash
cd services/api
go get github.com/rs/zerolog github.com/sony/gobreaker github.com/hibiken/asynq github.com/swaggo/swag/cmd/swag github.com/swaggo/http-swagger github.com/dgraph-io/ristretto github.com/prometheus/client_golang/prometheus github.com/prometheus/client_golang/prometheus/promhttp go.opentelemetry.io/otel go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp golang.org/x/crypto/bcrypt github.com/go-playground/validator/v10
```

## Architecture Patterns

### Recommended Project Structure
```
services/api/
├── cmd/server/main.go           # Entry point (exists)
├── internal/
│   ├── auth/                    # NEW: JWT RS256, API key, password hashing, RBAC
│   │   ├── jwt.go               # Token issue/verify with RS256
│   │   ├── apikey.go            # API key generation, validation
│   │   ├── password.go          # bcrypt hashing
│   │   └── rbac.go             # Role definitions, permission checks
│   ├── cache/cache.go           # EXISTS: extend with ristretto L1
│   ├── config/config.go         # EXISTS: extend with new fields
│   ├── db/                      # EXISTS: sqlc generated
│   │   └── queries/             # EXISTS: add new query files per domain
│   ├── handler/                 # EXISTS: add new handlers
│   │   ├── employee.go          # EXISTS
│   │   ├── auth.go              # NEW: login, refresh, API key CRUD
│   │   ├── payslip.go           # NEW
│   │   ├── payroll.go           # NEW
│   │   ├── contract.go          # NEW
│   │   ├── leave.go             # NEW
│   │   ├── report.go            # NEW
│   │   ├── webhook.go           # NEW
│   │   └── response.go          # NEW: shared response helpers
│   ├── middleware/               # EXISTS: extend
│   │   ├── auth.go              # EXISTS: refactor for RS256 + API key
│   │   ├── rbac.go              # NEW: role-based access control
│   │   ├── logging.go           # NEW: zerolog middleware
│   │   ├── metrics.go           # NEW: Prometheus middleware
│   │   └── tracing.go           # NEW: OTel middleware
│   ├── service/                 # EXISTS: add new services
│   │   ├── employee.go          # EXISTS
│   │   ├── auth.go              # NEW
│   │   ├── payslip.go           # NEW
│   │   ├── payroll.go           # NEW: payroll run state machine
│   │   ├── contract.go          # NEW
│   │   ├── leave.go             # NEW
│   │   ├── report.go            # NEW
│   │   └── webhook.go           # NEW: webhook delivery with retry
│   ├── worker/                  # NEW: Asynq task handlers
│   │   ├── payroll.go           # Async payroll processing
│   │   └── webhook.go           # Async webhook delivery
│   └── tax/                     # NEW: Bulgarian tax calculation (port from TS)
│       ├── constants.go         # BG_TAX_2026 constants
│       └── calculator.go        # Tax/social security calculation functions
├── platform/odoo/               # EXISTS: extend
│   ├── client.go                # EXISTS: add connection pooling, circuit breaker
│   ├── employee.go              # EXISTS
│   ├── payslip.go               # NEW
│   ├── contract.go              # NEW
│   ├── leave.go                 # NEW
│   └── types.go                 # EXISTS: extend with new Odoo types
├── migrations/                  # EXISTS: add new migrations
│   ├── 001_initial.sql          # EXISTS
│   ├── 002_users_auth.sql       # NEW: users, api_keys, refresh_tokens
│   ├── 003_payroll_runs.sql     # NEW: payroll_runs, payslips
│   ├── 004_webhooks.sql         # NEW: webhook_registrations, webhook_deliveries
│   └── 005_audit_log.sql        # NEW: audit_log
└── docs/                        # NEW: swaggo generated
```

### Pattern 1: Domain Module Pattern (follow existing employee pattern)
**What:** Each domain (payslip, contract, leave, etc.) follows handler -> service -> odoo/db
**When to use:** Every new domain endpoint group
**Example:**
```go
// handler/payroll.go
type PayrollHandler struct {
    svc PayrollServicer
}

// service/payroll.go
type PayrollService struct {
    odoo    OdooPayrollClient
    db      *db.Queries
    cache   *cache.Cache
    worker  *asynq.Client
}

// State machine for payroll runs
type PayrollRunStatus string
const (
    PayrollStatusDraft     PayrollRunStatus = "draft"
    PayrollStatusApproved  PayrollRunStatus = "approved"
    PayrollStatusProcessing PayrollRunStatus = "processing"
    PayrollStatusCompleted PayrollRunStatus = "completed"
    PayrollStatusFailed    PayrollRunStatus = "failed"
)
```

### Pattern 2: RS256 JWT Auth
**What:** Asymmetric JWT with RSA key pair
**Example:**
```go
// internal/auth/jwt.go
import "github.com/lestrrat-go/jwx/v2/jwa"

// Use jwa.RS256 with private key for signing, public key for verification
// jwtauth.New("RS256", privateKey, publicKey)
// Keys loaded from PEM files or env vars
```

### Pattern 3: Odoo Domain Model Mapping
**What:** Map Odoo's raw map[string]any to typed Go structs in the platform/odoo layer
**When to use:** All Odoo data. Already established in Phase 3 with Employee and Many2One types.
**Recommendation:** Continue this pattern. The API exposes its own domain model, not Odoo's raw fields. This decouples the API contract from Odoo schema changes.

### Pattern 4: Circuit Breaker on Odoo Client
**What:** Wrap Odoo HTTP calls with gobreaker
**Example:**
```go
import "github.com/sony/gobreaker"

type Client struct {
    // ... existing fields
    cb *gobreaker.CircuitBreaker
}

func NewClient(...) *Client {
    cb := gobreaker.NewCircuitBreaker(gobreaker.Settings{
        Name:        "odoo",
        MaxRequests: 3,           // half-open: allow 3 requests
        Interval:    30 * time.Second,
        Timeout:     10 * time.Second, // open -> half-open after 10s
        ReadyToTrip: func(counts gobreaker.Counts) bool {
            return counts.ConsecutiveFailures > 5
        },
    })
    // ...
}
```

### Pattern 5: Connection Pooling for Odoo
**What:** Limit concurrent Odoo connections using a semaphore
**Example:**
```go
type Client struct {
    sem chan struct{} // buffered channel as semaphore, cap=20
}

func (c *Client) acquireConn() {
    c.sem <- struct{}{}
}

func (c *Client) releaseConn() {
    <-c.sem
}
```

### Anti-Patterns to Avoid
- **Raw map[string]any in handlers:** Always use typed request/response structs. Current HandleUpdate accepts raw map -- this should be typed.
- **Inline route handlers:** The provisioning endpoint in main.go is inline. Move all handlers to handler package.
- **HS256 for user-facing JWT:** Current auth uses symmetric HS256. RS256 is required -- the private key signs, public key verifies, preventing key exposure on the verification side.
- **Blocking payroll processing in HTTP handlers:** Payroll runs MUST be async via Asynq. Handler creates the task, returns 202 Accepted with a poll URL.

## Discretionary Recommendations

### Payroll Run Failure Mode: Fail Entire Batch
**Recommendation:** Fail the entire payroll run if any employee calculation fails. Payroll is an all-or-nothing operation in Bulgarian accounting -- partial runs create reconciliation nightmares. The run moves to "failed" status with detailed error log per employee. HR can fix the issue and re-run.

### Payroll Run Immutability: Immutable with Correction Runs
**Recommendation:** Completed payroll runs are immutable (no edits). Corrections are handled by creating a new "correction" run that references the original. This aligns with Bulgarian accounting requirements where payslip records must be preserved for audit trail.

### Pagination: Offset-based (already implemented)
**Recommendation:** Keep the existing offset-based pagination (page/per_page). The data volumes (employees, payslips) are small enough that offset pagination is fine. Cursor pagination adds complexity with no benefit for this scale. The existing pattern in employee handler is good.

### Error Response Format
**Recommendation:** Extend existing `{"error": "message"}` to a structured format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [
      {"field": "name", "message": "is required"}
    ]
  }
}
```

### Bulk Operations: No
**Recommendation:** Skip bulk operations. The primary consumer is the Admin UI (Phase 7) which operates on individual records. Payroll batch creation already handles the "bulk" use case via payroll runs.

### HATEOAS Links: No
**Recommendation:** Skip HATEOAS. The Admin UI is the primary consumer and will have hardcoded routes. HATEOAS adds response bloat for no benefit.

### Odoo Degradation: Continue Stale Cache Pattern
**Recommendation:** The existing stale cache fallback (already implemented in service/employee.go) is the right pattern. Reads degrade gracefully to stale cache. Writes fail immediately with clear error (no async queueing for writes -- Odoo must be available for writes to maintain data consistency).

### Odoo Write Path: Synchronous
**Recommendation:** Write operations (create/update employee, approve leave, etc.) go synchronously to Odoo. Queuing writes risks data inconsistency (user thinks action succeeded but Odoo rejects it later). The exception is payroll processing which is already async by design.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT token handling | Custom JWT parsing | lestrrat-go/jwx (already dep) | RS256 key management, token validation, claims extraction |
| Password hashing | Custom bcrypt wrapper | golang.org/x/crypto/bcrypt | Security-critical, well-tested |
| Circuit breaker | Custom failure counter | sony/gobreaker | State machine (closed/open/half-open), thread-safe |
| Task queue | Custom Redis pub/sub | hibiken/asynq | Retry, scheduling, dead letter, monitoring |
| Request validation | Custom if-else chains | go-playground/validator | Struct tags, custom validators, localization |
| OpenAPI docs | Hand-written YAML | swaggo/swag | Auto-generated from code annotations |
| Metrics | Custom counters | prometheus/client_golang | Standard format, Grafana integration |
| L1 cache | sync.Map | dgraph-io/ristretto | TinyLFU admission, bounded memory |

## Common Pitfalls

### Pitfall 1: HS256 to RS256 Migration
**What goes wrong:** jwtauth.New("RS256", ...) requires *rsa.PrivateKey for signing and *rsa.PublicKey for verification, not byte slices.
**How to avoid:** Parse PEM-encoded RSA keys at startup. Generate dev keys in docker-compose. Store prod keys as env vars or mounted secrets.

### Pitfall 2: Asynq Client vs Server Separation
**What goes wrong:** Asynq requires a separate worker process (asynq.Server) to process tasks. The API server only enqueues tasks via asynq.Client.
**How to avoid:** Either run a separate worker binary (cmd/worker/main.go) or add a flag to cmd/server to run worker mode. The worker needs access to the same DB and Odoo client.

### Pitfall 3: Odoo Session Stickiness
**What goes wrong:** With connection pooling, multiple goroutines share Odoo sessions. Odoo sessions are per-user and stateful.
**How to avoid:** Use a single authenticated session with mutex protection (already implemented). The connection pool limits concurrency, not sessions. The existing Client already has `mu sync.Mutex`.

### Pitfall 4: sqlc Migration Ordering
**What goes wrong:** Adding new migration files without regenerating sqlc queries causes compile errors.
**How to avoid:** Always run `sqlc generate` after adding migrations or query files. Add to Makefile.

### Pitfall 5: Swagger Annotation Maintenance
**What goes wrong:** swaggo annotations drift from actual behavior over time.
**How to avoid:** Add `swag init` to CI pipeline. Use typed request/response structs that swaggo can introspect.

### Pitfall 6: Bulgarian Tax Rounding
**What goes wrong:** Bulgarian social security calculations use specific rounding rules (round to second decimal, specific order of operations).
**How to avoid:** Use `math/big.Rat` or fixed-point arithmetic for all monetary calculations. Never use float64 for money. Port the exact calculation order from the TypeScript implementation.

## Code Examples

### RS256 JWT Auth Setup
```go
// internal/auth/jwt.go
package auth

import (
    "crypto/rsa"
    "crypto/x509"
    "encoding/pem"
    "fmt"
    "time"

    "github.com/go-chi/jwtauth/v5"
    "github.com/lestrrat-go/jwx/v2/jwt"
)

func NewJWTAuth(privateKeyPEM, publicKeyPEM []byte) (*jwtauth.JWTAuth, error) {
    block, _ := pem.Decode(privateKeyPEM)
    if block == nil {
        return nil, fmt.Errorf("failed to decode private key PEM")
    }
    privateKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
    if err != nil {
        return nil, fmt.Errorf("parse private key: %w", err)
    }

    return jwtauth.New("RS256", privateKey, &privateKey.PublicKey), nil
}

func GenerateToken(auth *jwtauth.JWTAuth, userID string, email string, role string) (string, error) {
    claims := map[string]interface{}{
        "sub":   userID,
        "email": email,
        "role":  role,
        "iat":   time.Now().Unix(),
        "exp":   time.Now().Add(15 * time.Minute).Unix(),
    }
    _, tokenString, err := auth.Encode(claims)
    return tokenString, err
}
```

### API Key Middleware
```go
// internal/middleware/apikey.go
func APIKeyOrJWT(tokenAuth *jwtauth.JWTAuth, apiKeyValidator func(string) (*auth.APIKeyClaims, error)) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Check for API key header first
            if key := r.Header.Get("X-API-Key"); key != "" {
                claims, err := apiKeyValidator(key)
                if err != nil {
                    http.Error(w, `{"error":"invalid API key"}`, http.StatusUnauthorized)
                    return
                }
                ctx := context.WithValue(r.Context(), authClaimsKey, claims)
                next.ServeHTTP(w, r.WithContext(ctx))
                return
            }
            // Fall through to JWT
            jwtauth.Verifier(tokenAuth)(jwtauth.Authenticator(tokenAuth)(next)).ServeHTTP(w, r)
        })
    }
}
```

### Payroll Run State Machine
```go
// Valid state transitions
var validTransitions = map[PayrollRunStatus][]PayrollRunStatus{
    PayrollStatusDraft:      {PayrollStatusApproved},
    PayrollStatusApproved:   {PayrollStatusProcessing, PayrollStatusDraft},  // can revert to draft
    PayrollStatusProcessing: {PayrollStatusCompleted, PayrollStatusFailed},
    PayrollStatusFailed:     {PayrollStatusDraft},  // re-draft after fixing
    // Completed: no transitions (immutable)
}
```

### Bulgarian Tax Port (Go version of Phase 2 TS)
```go
// internal/tax/constants.go
package tax

// BG2026 holds Bulgarian tax and social security rates for 2026
var BG2026 = struct {
    IncomeTaxRate         float64
    PensionEmployer       float64
    PensionEmployee       float64
    IllnessEmployer       float64
    IllnessEmployee       float64
    UnemploymentEmployer  float64
    UnemploymentEmployee  float64
    AccidentEmployer      float64
    HealthEmployer        float64
    HealthEmployee        float64
    UniversalPensionEmployer float64
    UniversalPensionEmployee float64
    MinInsurableIncome    int64  // BGN cents
    MaxInsurableIncome    int64  // BGN cents
    TotalEmployerRate     float64
    TotalEmployeeRate     float64
}{
    IncomeTaxRate:         0.10,
    PensionEmployer:      0.0888,
    PensionEmployee:      0.0592,
    IllnessEmployer:      0.021,
    IllnessEmployee:      0.014,
    UnemploymentEmployer: 0.006,
    UnemploymentEmployee: 0.004,
    AccidentEmployer:     0.005,
    HealthEmployer:       0.048,
    HealthEmployee:       0.032,
    UniversalPensionEmployer: 0.028,
    UniversalPensionEmployee: 0.022,
    MinInsurableIncome:   121300, // 1213 BGN in stotinki
    MaxInsurableIncome:   385000, // 3850 BGN in stotinki
    TotalEmployerRate:    0.1892,
    TotalEmployeeRate:    0.1378,
}
```

## Database Schema Additions

### Migration 002: Users & Auth
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin','admin','hr_manager','hr_officer','accountant','employee','viewer')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,  -- first 8 chars for identification
    scopes TEXT[] NOT NULL DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Migration 003: Payroll Runs
```sql
CREATE TABLE payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','processing','completed','failed')),
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    error_details JSONB,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id),
    employee_odoo_id INTEGER NOT NULL,
    gross_salary_stotinki BIGINT NOT NULL,
    employer_social BIGINT NOT NULL,
    employee_social BIGINT NOT NULL,
    employer_health BIGINT NOT NULL,
    employee_health BIGINT NOT NULL,
    income_tax BIGINT NOT NULL,
    net_salary_stotinki BIGINT NOT NULL,
    calculation_details JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Migration 004: Webhooks
```sql
CREATE TABLE webhook_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES webhook_registrations(id),
    event TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    attempts INTEGER NOT NULL DEFAULT 0,
    last_response_code INTEGER,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HS256 JWT | RS256 JWT | Phase 6 requirement | Asymmetric keys, better security |
| log.Printf | zerolog structured JSON | Phase 6 requirement | Machine-parseable logs |
| No metrics | Prometheus + OTel | Phase 6 requirement | Observability |
| Direct Odoo calls | Circuit breaker + pool | Phase 6 requirement | Resilience |

## Open Questions

1. **RSA Key Management in Development**
   - What we know: RS256 requires key pair. Dev needs easy setup.
   - Recommendation: Generate dev keys via `openssl` in a Makefile target; mount into Docker. For prod, use env var or mounted secret.

2. **Worker Process Deployment**
   - What we know: Asynq needs a server process to consume tasks.
   - Recommendation: Single binary with `--mode=api|worker|both` flag. In dev, run `both`. In prod, separate deployments.

3. **Odoo Models for Contracts/Leave**
   - What we know: Odoo 18 has hr.contract, hr.leave, hr.leave.allocation models.
   - What's unclear: Exact field names may differ in Odoo 18 vs earlier versions.
   - Recommendation: Discover fields at runtime via Odoo's `fields_get` RPC call during development.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Go testing + testify (standard) |
| Config file | None needed (Go convention) |
| Quick run command | `go test ./... -short -count=1` |
| Full suite command | `go test ./... -count=1 -race` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| API-01 | Chi router serves /api/v1 | integration | `go test ./cmd/server/... -run TestRoutes -count=1` | No - Wave 0 |
| API-02 | JWT RS256 + API key auth | unit | `go test ./internal/auth/... -count=1` | No - Wave 0 |
| API-03 | Employee CRUD | unit | `go test ./internal/handler/ -run TestEmployee -count=1` | Yes (exists) |
| API-04 | Payslip endpoints | unit | `go test ./internal/handler/ -run TestPayslip -count=1` | No - Wave 0 |
| API-05 | Payroll run async | unit+integration | `go test ./internal/service/ -run TestPayroll -count=1` | No - Wave 0 |
| API-06 | Contract endpoints | unit | `go test ./internal/handler/ -run TestContract -count=1` | No - Wave 0 |
| API-07 | Leave management | unit | `go test ./internal/handler/ -run TestLeave -count=1` | No - Wave 0 |
| API-08 | Report endpoints | unit | `go test ./internal/handler/ -run TestReport -count=1` | No - Wave 0 |
| API-09 | Webhook management | unit | `go test ./internal/handler/ -run TestWebhook -count=1` | No - Wave 0 |
| API-10 | Circuit breaker + pool | unit | `go test ./platform/odoo/ -run TestCircuitBreaker -count=1` | No - Wave 0 |
| API-11 | Swagger docs served | smoke | `go test ./cmd/server/ -run TestSwaggerEndpoint -count=1` | No - Wave 0 |
| API-12 | Logging/metrics/tracing | unit | `go test ./internal/middleware/ -count=1` | No - Wave 0 |
| API-13 | L1+L2 cache, Asynq | unit | `go test ./internal/cache/ -count=1` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `go test ./... -short -count=1`
- **Per wave merge:** `go test ./... -count=1 -race`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `internal/auth/*_test.go` -- covers API-02
- [ ] `internal/handler/payslip_test.go` -- covers API-04
- [ ] `internal/handler/payroll_test.go` -- covers API-05
- [ ] `internal/service/payroll_test.go` -- covers API-05
- [ ] `internal/handler/contract_test.go` -- covers API-06
- [ ] `internal/handler/leave_test.go` -- covers API-07
- [ ] `internal/handler/report_test.go` -- covers API-08
- [ ] `internal/handler/webhook_test.go` -- covers API-09
- [ ] `platform/odoo/circuit_breaker_test.go` -- covers API-10
- [ ] `internal/tax/calculator_test.go` -- covers payroll calculations
- [ ] Test helpers: mock Odoo client, test DB setup (extend existing patterns from employee_test.go)

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: services/api/ directory (all files read directly)
- Phase 2 Bulgarian tax constants: apps/web/src/lib/bulgarian-tax.ts (read directly)
- go.mod dependencies verified from file

### Secondary (MEDIUM confidence)
- Library recommendations based on Go ecosystem knowledge (chi, zerolog, gobreaker, asynq, swaggo all well-established)
- Bulgarian tax/accounting compliance patterns

### Tertiary (LOW confidence)
- Odoo 18 hr.contract and hr.leave field names (need runtime verification)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - existing codebase provides clear direction, all core deps already in go.mod
- Architecture: HIGH - extending proven patterns already in the codebase
- Pitfalls: HIGH - based on direct code analysis of existing implementation
- Bulgarian tax: HIGH - exact constants available from Phase 2 TypeScript implementation
- Odoo domain models (contract/leave): MEDIUM - Odoo 18 field names may need runtime discovery

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable domain, existing patterns well-established)
