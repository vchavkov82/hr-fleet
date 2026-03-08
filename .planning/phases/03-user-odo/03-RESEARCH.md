# Phase 3: Odoo HR Backend Integration - Research

**Researched:** 2026-03-08
**Domain:** Odoo 18 JSON-RPC integration, Go API proxy, Next.js dashboard UI
**Confidence:** MEDIUM

## Summary

This phase introduces three major new components: (1) Odoo 18 Community Edition running in Docker alongside the existing podman-compose stack, (2) a greenfield Go backend service acting as API proxy between the Next.js frontend and Odoo via JSON-RPC, and (3) authenticated dashboard pages in Next.js for employee directory CRUD.

The Odoo JSON-RPC API is well-documented and stable for Odoo 18 (scheduled deprecation in Odoo 20, fall 2026 -- not a concern for this version). Self-hosted Community Edition has unrestricted API access unlike Odoo Online plans. The `skilld-labs/go-odoo` library exists but its pre-generated models target Odoo 11 -- for Odoo 18 HR models, building a lightweight custom JSON-RPC client is more practical and avoids model generation complexity.

**Primary recommendation:** Build a minimal Go JSON-RPC client from scratch (the protocol is simple), deploy Odoo 18 via official Docker image with separate PostgreSQL, and use TanStack Table for the employee directory UI.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Odoo 18 Community Edition (free, open-source)
- Self-hosted via Docker, added to existing podman-compose.yml
- Separate PostgreSQL instance for Odoo (not shared with app DB)
- Full HR module suite: employees, leave, attendance, recruitment, payroll, expenses, appraisals
- App is auth master — users authenticate via existing JWT system
- Go backend uses service account to call Odoo API; users never interact with Odoo directly
- Auto-provision: on company sign-up, Go creates matching Odoo company + admin user via API
- Employees added to Odoo automatically when created in the app
- Odoo is source of truth for all HR data
- App's PostgreSQL stores only auth, billing, and marketing data
- Go backend caches Odoo data in Redis with TTL (~5 minute for employee lists)
- Cache invalidated on writes
- JSON-RPC protocol for Go -> Odoo communication (/jsonrpc endpoint)
- Clean REST API exposed to frontend: /api/v1/employees, /api/v1/leave-requests, etc.
- Frontend has zero awareness of Odoo
- New Go package: backend/platform/odoo/
- Graceful degradation: return cached data if Odoo unavailable
- Authenticated HR area at /dashboard namespace
- Overview dashboard with metric cards
- Employee directory as first module priority
- Table layout with sortable/filterable columns
- Employee detail page with full profile view and edit capability

### Claude's Discretion
- Exact Odoo module configuration and initialization
- JSON-RPC client implementation details
- Redis cache key structure and invalidation strategy
- Dashboard card component design and metric calculations
- Table component library choice (custom vs. library)
- Employee form field layout and validation
- Responsive dashboard layout breakpoints
- Loading states and skeleton patterns for Odoo data

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EMP-01 | Admin can create employee records (name, email, role, start date, contract type) | Odoo hr.employee model supports all these fields via JSON-RPC create method; Go proxy exposes POST /api/v1/employees |
| EMP-02 | Admin can view employee directory with filtering/search | Odoo search_read on hr.employee with domain filters; Go proxy exposes GET /api/v1/employees with query params; TanStack Table for frontend |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Odoo | 18.0 (Docker: `odoo:18.0`) | HR backend / source of truth | Official Docker image, Community Edition, full HR modules |
| PostgreSQL | 17 (Docker: `postgres:17`) | Odoo database (separate instance) | Odoo requires PostgreSQL; v17 is current stable |
| Go | 1.25 | API proxy server | Already installed on system; chi router is idiomatic |
| go-chi/chi | v5 | HTTP router | Lightweight, stdlib-compatible, middleware-friendly |
| go-chi/jwtauth | v5 | JWT middleware | Pairs with chi, uses lestrrat-go/jwx |
| go-redis/redis | v9 | Redis client for Go | Standard Go Redis client |
| TanStack Table | v8 | Employee directory table | Headless, React 19 compatible, sorting/filtering/pagination |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| encoding/json | stdlib | JSON-RPC request/response | All Odoo communication |
| net/http | stdlib | HTTP client for Odoo calls | JSON-RPC transport |
| zod | v4 | Form validation (frontend) | Employee create/edit forms |
| react-hook-form | v7 | Form state management | Employee CRUD forms |
| @tanstack/react-table | v8 | Table rendering | Employee directory |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom JSON-RPC client | skilld-labs/go-odoo | go-odoo has pre-generated models for Odoo 11; would need to fork and regenerate for Odoo 18 HR models. Custom client is simpler for the 5 RPC methods needed |
| TanStack Table | Custom HTML table | TanStack handles sorting, filtering, pagination out of the box; custom would require reimplementing all of it |
| chi router | Gin/Echo | chi is more idiomatic Go, stdlib-compatible, less magic |

**Installation:**
```bash
# Go backend (in backend/ directory)
go mod init github.com/hr/backend
go get github.com/go-chi/chi/v5
go get github.com/go-chi/jwtauth/v5
go get github.com/redis/go-redis/v9
go get github.com/lestrrat-go/jwx/v2

# Frontend (in www/)
pnpm add @tanstack/react-table
```

## Architecture Patterns

### Recommended Project Structure
```
backend/
├── cmd/
│   └── server/
│       └── main.go              # Entry point
├── internal/
│   ├── config/
│   │   └── config.go            # Env-based configuration
│   ├── handler/
│   │   ├── employee.go          # REST handlers for /api/v1/employees
│   │   └── dashboard.go         # Dashboard metrics endpoint
│   ├── middleware/
│   │   └── auth.go              # JWT authentication middleware
│   ├── service/
│   │   └── employee.go          # Business logic layer
│   └── cache/
│       └── redis.go             # Redis caching layer
├── platform/
│   └── odoo/
│       ├── client.go            # JSON-RPC client
│       ├── auth.go              # Odoo session management
│       ├── employee.go          # hr.employee model operations
│       └── types.go             # Odoo request/response types
├── go.mod
├── go.sum
└── Makefile

www/src/
├── app/[locale]/
│   └── dashboard/
│       ├── layout.tsx           # Authenticated layout wrapper
│       ├── page.tsx             # Dashboard overview
│       └── employees/
│           ├── page.tsx         # Employee directory
│           └── [id]/
│               └── page.tsx     # Employee detail/edit
├── components/
│   └── dashboard/
│       ├── metric-card.tsx      # Dashboard stat cards
│       ├── employee-table.tsx   # TanStack Table wrapper
│       ├── employee-form.tsx    # Create/edit form
│       └── sidebar-nav.tsx      # Dashboard navigation
└── lib/
    └── api.ts                   # API client for Go backend
```

### Pattern 1: JSON-RPC Client
**What:** Minimal Go client that speaks Odoo's JSON-RPC protocol
**When to use:** All Odoo communication
**Example:**
```go
// Source: Odoo 18.0 External API docs
type JSONRPCRequest struct {
    JSONRPC string      `json:"jsonrpc"`
    Method  string      `json:"method"`
    Params  interface{} `json:"params"`
    ID      int         `json:"id"`
}

type JSONRPCResponse struct {
    JSONRPC string          `json:"jsonrpc"`
    ID      int             `json:"id"`
    Result  json.RawMessage `json:"result,omitempty"`
    Error   *RPCError       `json:"error,omitempty"`
}

// Authentication
func (c *Client) Authenticate(db, user, password string) (int64, error) {
    params := map[string]interface{}{
        "service": "common",
        "method":  "login",
        "args":    []interface{}{db, user, password},
    }
    // POST to /jsonrpc
    resp, err := c.call(params)
    // resp.Result contains uid (int64)
}

// CRUD: search_read
func (c *Client) SearchRead(model string, domain []interface{}, fields []string, limit, offset int) ([]map[string]interface{}, error) {
    params := map[string]interface{}{
        "service": "object",
        "method":  "execute",
        "args":    []interface{}{c.db, c.uid, c.password, model, "search_read", domain, fields},
    }
    // returns array of record maps
}
```

### Pattern 2: Redis Cache with Write-Through Invalidation
**What:** Cache Odoo responses in Redis, invalidate on mutations
**When to use:** All read operations from Odoo
**Example:**
```go
// Cache key structure
// employees:list:{company_id}:{hash_of_filters}
// employees:detail:{company_id}:{employee_id}
// departments:list:{company_id}

func (s *EmployeeService) List(ctx context.Context, companyID int64, filters Filters) ([]Employee, error) {
    key := fmt.Sprintf("employees:list:%d:%s", companyID, filters.Hash())

    // Try cache first
    cached, err := s.cache.Get(ctx, key)
    if err == nil {
        return cached, nil
    }

    // Fetch from Odoo
    employees, err := s.odoo.SearchRead("hr.employee", filters.ToDomain(), employeeFields, filters.Limit, filters.Offset)
    if err != nil {
        return nil, err // graceful degradation handled upstream
    }

    // Cache with 5-minute TTL
    s.cache.Set(ctx, key, employees, 5*time.Minute)
    return employees, nil
}

func (s *EmployeeService) Create(ctx context.Context, companyID int64, emp CreateEmployeeReq) (int64, error) {
    id, err := s.odoo.Create("hr.employee", emp.ToOdooFields())
    if err != nil {
        return 0, err
    }
    // Invalidate list cache
    s.cache.DeletePattern(ctx, fmt.Sprintf("employees:list:%d:*", companyID))
    return id, nil
}
```

### Pattern 3: Next.js Server Component + API Client
**What:** Server components fetch from Go backend, client components handle interaction
**When to use:** All dashboard pages
**Example:**
```typescript
// www/src/lib/api.ts
const API_BASE = process.env.API_URL || 'http://localhost:8080';

export async function fetchEmployees(token: string, params?: EmployeeFilters) {
  const query = new URLSearchParams(params as Record<string, string>);
  const res = await fetch(`${API_BASE}/api/v1/employees?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 }, // 5 min ISR
  });
  if (!res.ok) throw new Error('Failed to fetch employees');
  return res.json() as Promise<EmployeeListResponse>;
}
```

### Anti-Patterns to Avoid
- **Exposing Odoo internals to frontend:** Never send Odoo model names, field names, or domain syntax to the client. Go backend translates everything.
- **Sharing PostgreSQL between Odoo and app:** Odoo manages its own schema aggressively. Separate databases are mandatory.
- **Calling Odoo on every request:** Always check Redis cache first. Odoo JSON-RPC is synchronous and can be slow under load.
- **Storing HR data in app database:** Odoo is source of truth. App DB only stores auth, billing, marketing data.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Data table with sort/filter/page | Custom table component | TanStack Table | Handles column resize, virtual scroll, complex filtering; 100+ edge cases |
| JWT verification in Go | Custom JWT parser | go-chi/jwtauth + jwx | Handles token expiry, algorithm verification, claim extraction |
| Redis connection management | Raw net.Conn to Redis | go-redis/v9 | Connection pooling, pipelining, pub/sub, cluster support |
| Form validation | Manual if/else checks | zod + react-hook-form | Schema-based validation, type inference, error messages |
| HTTP routing with middleware | net/http ServeMux chains | chi router | Middleware stacking, route groups, URL params |

**Key insight:** The Go backend is a translation layer, not a business logic engine. Keep it thin -- Odoo has the HR business logic, Go just proxies and caches.

## Common Pitfalls

### Pitfall 1: Odoo Database Initialization Race
**What goes wrong:** Odoo container starts before PostgreSQL is ready, fails to create database
**Why it happens:** Docker/podman depends_on only waits for container start, not service readiness
**How to avoid:** Use `depends_on` with healthcheck on postgres, or add retry logic in Odoo's entrypoint. Odoo image supports `--db_host` wait.
**Warning signs:** Odoo logs showing "connection refused" to PostgreSQL

### Pitfall 2: Odoo Session Expiry
**What goes wrong:** Go backend's cached Odoo session expires, API calls fail with auth errors
**Why it happens:** Odoo sessions have a default 7-day timeout; server restarts invalidate them
**How to avoid:** Re-authenticate on 401/403 responses from Odoo; implement session refresh in the JSON-RPC client
**Warning signs:** Intermittent "Access Denied" errors from Odoo after period of operation

### Pitfall 3: Odoo Module Installation on First Boot
**What goes wrong:** Odoo starts but HR modules aren't installed; API calls to hr.employee fail
**Why it happens:** Community Edition starts with minimal modules; HR must be explicitly installed
**How to avoid:** Use CLI flag `-i hr,hr_holidays,hr_attendance,hr_recruitment,hr_expense` with `--stop-after-init` on first boot, or create an init script
**Warning signs:** "Model not found: hr.employee" errors from JSON-RPC

### Pitfall 4: Odoo Field Name Mismatches Between Versions
**What goes wrong:** Go code references fields that don't exist in Odoo 18
**Why it happens:** Odoo renames/restructures fields between major versions (e.g., `birthday` vs `birth_date`)
**How to avoid:** Use `fields_get` RPC call on hr.employee to discover actual field names at startup; write a discovery script
**Warning signs:** "Field X does not exist on model hr.employee" errors

### Pitfall 5: CORS and Proxy Configuration
**What goes wrong:** Frontend can't reach Go backend due to CORS or proxy misconfiguration
**Why it happens:** Go backend is a new service that Caddy doesn't know about
**How to avoid:** Add Go backend to Caddy config with proper CORS headers; or proxy through Next.js API routes
**Warning signs:** Browser CORS errors, 502 from Caddy

### Pitfall 6: Redis Cache Stampede
**What goes wrong:** Cache expires, all concurrent requests hit Odoo simultaneously
**Why it happens:** Multiple users requesting same data when TTL expires
**How to avoid:** Implement cache stampede protection with singleflight package (sync/singleflight in Go stdlib)
**Warning signs:** Odoo CPU spikes every 5 minutes

## Code Examples

### Odoo Docker Compose Services
```yaml
# Source: Official Odoo Docker Hub + Odoo 18 docs
# Add to deploy/podman-compose.yml

  odoo:
    image: odoo:18.0
    container_name: hr-odoo
    hostname: hr-odoo
    ports:
      - "127.0.0.1:8069:8069"
    environment:
      - HOST=hr-odoo-db
      - PORT=5432
      - USER=odoo
      - PASSWORD=${ODOO_DB_PASSWORD:-odoo}
    volumes:
      - odoo_data:/var/lib/odoo
      - ./odoo.conf:/etc/odoo/odoo.conf:ro
      - ./odoo-addons:/mnt/extra-addons
    depends_on:
      hr-odoo-db:
        condition: service_healthy
    networks:
      - hr
    restart: unless-stopped

  hr-odoo-db:
    image: postgres:17-alpine
    container_name: hr-odoo-db
    hostname: hr-odoo-db
    environment:
      - POSTGRES_DB=odoo
      - POSTGRES_USER=odoo
      - POSTGRES_PASSWORD=${ODOO_DB_PASSWORD:-odoo}
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - odoo_db_data:/var/lib/postgresql/data/pgdata
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U odoo"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - hr
    restart: unless-stopped

  hr-api:
    build:
      context: ../backend
      dockerfile: Dockerfile
    container_name: hr-api
    hostname: hr-api
    ports:
      - "127.0.0.1:8080:8080"
    environment:
      - ODOO_URL=http://hr-odoo:8069
      - ODOO_DB=odoo
      - ODOO_USER=admin
      - ODOO_PASSWORD=${ODOO_ADMIN_PASSWORD:-admin}
      - REDIS_URL=redis://hr-redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - PORT=8080
    depends_on:
      - odoo
    networks:
      - hr
    restart: unless-stopped

# Add to volumes:
  odoo_data:
  odoo_db_data:
```

### Odoo Configuration File
```ini
# deploy/odoo.conf
[options]
addons_path = /usr/lib/python3/dist-packages/odoo/addons,/mnt/extra-addons
admin_passwd = ${ODOO_MASTER_PASSWORD:-admin}
db_host = hr-odoo-db
db_port = 5432
db_user = odoo
db_password = odoo
db_name = odoo
list_db = False
proxy_mode = True
without_demo = all
```

### HR Module Installation Script
```bash
#!/bin/bash
# deploy/odoo-init.sh — Run once after first Odoo boot
# Install core HR modules via CLI
podman exec hr-odoo odoo \
  -c /etc/odoo/odoo.conf \
  -d odoo \
  -i hr,hr_holidays,hr_attendance,hr_recruitment,hr_expense,hr_contract \
  --stop-after-init
```

### Odoo hr.employee Key Fields
```go
// Source: Odoo 18.0 HR Employee documentation
// These are the core fields for the hr.employee model

var employeeFields = []string{
    "id",
    "name",              // Employee name (char)
    "work_email",        // Work email (char)
    "job_title",         // Job title (char)
    "job_id",            // Job Position (many2one -> hr.job)
    "department_id",     // Department (many2one -> hr.department)
    "parent_id",         // Manager (many2one -> hr.employee)
    "work_phone",        // Work phone (char)
    "mobile_phone",      // Work mobile (char)
    "company_id",        // Company (many2one -> res.company)
    "employee_type",     // Employee Type (selection: employee/student/trainee/contractor/freelance)
    "marital",           // Marital Status (selection)
    "birthday",          // Date of Birth (date)
    "contract_id",       // Current Contract (many2one -> hr.contract)
    "create_date",       // Created on (datetime)
    "write_date",        // Last Updated (datetime)
    "active",            // Active (boolean)
    "image_1920",        // Photo (binary, base64)
}
```

### Go Backend Entry Point
```go
// backend/cmd/server/main.go
package main

import (
    "log"
    "net/http"
    "os"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
    "github.com/go-chi/jwtauth/v5"
)

func main() {
    tokenAuth := jwtauth.New("HS256", []byte(os.Getenv("JWT_SECRET")), nil)

    r := chi.NewRouter()
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    r.Use(middleware.RealIP)

    // Public routes
    r.Get("/health", handleHealth)

    // Protected API routes
    r.Route("/api/v1", func(r chi.Router) {
        r.Use(jwtauth.Verifier(tokenAuth))
        r.Use(jwtauth.Authenticator(tokenAuth))

        r.Route("/employees", func(r chi.Router) {
            r.Get("/", handleListEmployees)      // GET /api/v1/employees
            r.Post("/", handleCreateEmployee)     // POST /api/v1/employees
            r.Get("/{id}", handleGetEmployee)     // GET /api/v1/employees/123
            r.Put("/{id}", handleUpdateEmployee)  // PUT /api/v1/employees/123
            r.Delete("/{id}", handleDeleteEmployee) // DELETE /api/v1/employees/123
        })
    })

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    log.Printf("Starting HR API on :%s", port)
    log.Fatal(http.ListenAndServe(":"+port, r))
}
```

### TanStack Table Employee Directory
```typescript
// www/src/components/dashboard/employee-table.tsx
'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';

interface Employee {
  id: number;
  name: string;
  work_email: string;
  job_title: string;
  department: string;
  start_date: string;
  status: 'active' | 'inactive';
}

const columns: ColumnDef<Employee>[] = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'work_email', header: 'Email' },
  { accessorKey: 'department', header: 'Department', enableSorting: true },
  { accessorKey: 'job_title', header: 'Position' },
  { accessorKey: 'start_date', header: 'Start Date', enableSorting: true },
  { accessorKey: 'status', header: 'Status' },
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| XML-RPC for Odoo API | JSON-RPC (same era, but preferred) | Odoo 14+ | Simpler payloads, better JS/Go interop |
| XML-RPC + JSON-RPC endpoints | New JSON-2 API (Odoo 19+) | Fall 2025 | `/jsonrpc` deprecated in Odoo 20 (fall 2026); safe for Odoo 18 |
| skilld-labs/go-odoo with generated models | Custom thin client | Ongoing | Generated models lock to Odoo version; thin client is version-agnostic |

**Deprecated/outdated:**
- XML-RPC (`/xmlrpc/2`): Still works but JSON-RPC is preferred for new projects
- Odoo JSON-RPC at `/jsonrpc`: Scheduled for removal in Odoo 20 (fall 2026). Safe for Odoo 18.

## Open Questions

1. **Redis service in compose**
   - What we know: CONTEXT.md says "existing Redis infrastructure" but the current podman-compose.yml has no Redis service
   - What's unclear: Is Redis running separately or needs to be added to compose?
   - Recommendation: Add Redis service to podman-compose.yml as part of this phase

2. **JWT token format**
   - What we know: Auth page exists at `/auth/login` and `/auth/sign-up` but no actual JWT implementation exists yet
   - What's unclear: Full JWT flow needs to be built from scratch (Go issues tokens, Next.js middleware validates)
   - Recommendation: Build JWT auth as part of this phase; Go backend handles login/signup, issues JWT, Next.js stores in httpOnly cookie

3. **Auto-provisioning timing**
   - What we know: Decision says "on company sign-up, Go creates matching Odoo company + admin user"
   - What's unclear: Whether to implement auto-provisioning in this phase or defer to a later phase
   - Recommendation: Implement basic provisioning (single company/tenant) in this phase; multi-tenant auto-provisioning can be enhanced later

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework (frontend) | Vitest 2.x + Playwright 1.58 |
| Framework (backend) | Go testing (stdlib) |
| Config file (frontend) | `www/vitest.config.ts`, `www/playwright.config.ts` |
| Config file (backend) | None -- Wave 0 |
| Quick run command | `cd www && bun run test` / `cd backend && go test ./...` |
| Full suite command | `cd www && bun run test && bun run test:e2e` + `cd backend && go test ./...` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EMP-01 | Create employee via POST /api/v1/employees -> Odoo | integration | `cd backend && go test ./internal/handler/ -run TestCreateEmployee -v` | No -- Wave 0 |
| EMP-01 | Employee form validates required fields | unit | `cd www && bun run test -- employee-form` | No -- Wave 0 |
| EMP-02 | List employees via GET /api/v1/employees with filters | integration | `cd backend && go test ./internal/handler/ -run TestListEmployees -v` | No -- Wave 0 |
| EMP-02 | Employee table renders, sorts, filters | unit | `cd www && bun run test -- employee-table` | No -- Wave 0 |
| EMP-02 | Dashboard shows employee directory E2E | e2e | `cd www && bun run test:e2e -- dashboard` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `cd backend && go test ./... && cd ../www && bun run test`
- **Per wave merge:** Full suite including E2E
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `backend/` directory -- entire Go project needs scaffolding
- [ ] `backend/internal/handler/employee_test.go` -- handler tests with mocked Odoo client
- [ ] `backend/platform/odoo/client_test.go` -- JSON-RPC client tests
- [ ] `www/tests/unit/employee-table.test.tsx` -- table component tests
- [ ] `www/tests/unit/employee-form.test.tsx` -- form component tests
- [ ] `www/tests/e2e/dashboard.spec.ts` -- dashboard E2E tests
- [ ] Go test infrastructure: `go.mod`, test helpers, mock fixtures

## Sources

### Primary (HIGH confidence)
- [Odoo 18.0 External API docs](https://www.odoo.com/documentation/18.0/developer/reference/external_api.html) - JSON-RPC protocol, authentication, CRUD operations
- [Odoo 18.0 CLI docs](https://www.odoo.com/documentation/18.0/developer/reference/cli.html) - Module installation via command line
- [Odoo 18.0 HR Employee docs](https://www.odoo.com/documentation/18.0/applications/hr/employees/new_employee.html) - Employee model fields
- [Odoo Docker Hub](https://hub.docker.com/_/odoo) - Official Docker image configuration
- [Cybrosys Odoo 18 JSON-RPC Book](https://www.cybrosys.com/odoo/odoo-books/odoo-18-development/remote-procedure-calls-rpc/using-json-rpc/) - JSON-RPC request/response format
- [go-chi/chi GitHub](https://github.com/go-chi/chi) - Router documentation
- [go-chi/jwtauth GitHub](https://github.com/go-chi/jwtauth) - JWT middleware

### Secondary (MEDIUM confidence)
- [skilld-labs/go-odoo](https://github.com/skilld-labs/go-odoo) - Go Odoo client library (models for Odoo 11, client core reusable)
- [minhng92/odoo-18-docker-compose](https://github.com/minhng92/odoo-18-docker-compose) - Docker Compose reference setup
- [TanStack Table docs](https://tanstack.com/table/latest) - Table library for React
- [Odoo Forum - JSON-RPC API access](https://www.odoo.com/forum/help-1/external-api-documentation-json-rpc-236874) - Community Edition API access confirmation

### Tertiary (LOW confidence)
- [Odoo 19 JSON-2 API docs](https://www.odoo.com/documentation/19.0/developer/reference/external_api.html) - Future API direction (deprecation timeline)

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - Odoo Docker + JSON-RPC well-documented; Go backend is greenfield with standard patterns
- Architecture: MEDIUM - Pattern is well-established (API proxy) but specific Odoo 18 field names need runtime verification
- Pitfalls: HIGH - Well-known issues from community forums and Docker deployment experience

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (30 days -- Odoo 18 is stable LTS)
