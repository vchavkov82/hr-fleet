# Phase 3: Odoo HR Backend Integration - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Integrate self-hosted Odoo 18 Community Edition as the backend for the full HR suite (employees, leave, attendance, recruitment, payroll, expenses, appraisals). Odoo runs as a Docker service in the existing podman-compose stack with its own PostgreSQL. Go backend acts as API proxy between Next.js frontend and Odoo via JSON-RPC. Frontend delivers an authenticated HR dashboard at /dashboard with employee directory as the first module priority.

</domain>

<decisions>
## Implementation Decisions

### Odoo Deployment
- Odoo 18 Community Edition (free, open-source)
- Self-hosted via Docker, added to existing podman-compose.yml
- Separate PostgreSQL instance for Odoo (not shared with app DB)
- Full HR module suite: employees, leave, attendance, recruitment, payroll, expenses, appraisals

### Authentication & Data Sync
- Your app is auth master — users authenticate via existing JWT system
- Go backend uses a service account to call Odoo API; users never interact with Odoo directly
- Auto-provision: on company sign-up, Go creates matching Odoo company + admin user via API
- Employees added to Odoo automatically when created in the app
- Odoo is the source of truth for all HR data (employees, leave, contracts, etc.)
- App's PostgreSQL stores only auth, billing, and marketing data

### Caching Strategy
- Go backend caches Odoo data in Redis with TTL (existing Redis infrastructure)
- ~5 minute TTL for employee lists, department structure
- Cache invalidated on writes (create/update/delete operations)

### Go Proxy API Design
- JSON-RPC protocol for Go → Odoo communication (/jsonrpc endpoint)
- Clean REST API exposed to frontend: /api/v1/employees, /api/v1/leave-requests, etc.
- Frontend has zero awareness of Odoo — Go abstracts all Odoo internals
- New Go package: backend/platform/odoo/ (client, models, helpers)
- Graceful degradation: return cached data if Odoo unavailable, show service unavailable message if no cache

### Frontend HR Pages
- Authenticated HR area at /dashboard namespace (/dashboard, /dashboard/employees, /dashboard/leave, etc.)
- Overview dashboard with metric cards: total employees, pending leave requests, upcoming birthdays, recent hires, quick links
- Employee directory as first module priority (foundation for all other modules)
- Table layout for employee directory: sortable/filterable columns (name, department, position, start date, status)
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

</decisions>

<specifics>
## Specific Ideas

- Odoo is the backend brain — the Next.js frontend is a custom UI skin over Odoo's HR capabilities
- Users should never know Odoo exists — the app feels like a native HR platform
- Marketing site (/hr-tools, calculators, templates) stays independent of Odoo — no regression
- Employee directory is the MVP — prove the Odoo integration works end-to-end before expanding to leave, recruitment, etc.
- Auto-provisioning on sign-up reduces onboarding friction for new companies

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `podman-compose.yml`: Add Odoo + odoo-postgres services alongside existing Redis, Caddy, Meilisearch
- JWT auth middleware in Go backend: Reuse for authenticating dashboard API routes
- `cn()` utility, Tailwind design system, corporate blue palette: Apply to dashboard UI
- `next-intl` i18n: Extend for dashboard labels (BG/EN)
- Existing Chi router setup: Add /api/v1/employees, /api/v1/leave-requests route groups

### Established Patterns
- Server/client component split: Server component for layout + data fetching, client for interactivity
- Go handler pattern: `handle{Action}` naming, `response.JSON()` / `response.Error()` helpers
- Redis already in infrastructure: Can be used for Odoo data caching

### Integration Points
- `podman-compose.yml`: New services (odoo, odoo-postgres)
- Go `server.go` `setupRoutes()`: New route groups for HR API endpoints
- Go `platform/odoo/`: New package for Odoo JSON-RPC client
- `www/src/app/[locale]/dashboard/`: New authenticated route group
- `www/src/components/dashboard/`: New component directory for HR UI
- Navigation: Add "Dashboard" link for authenticated users (separate from marketing nav)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-user-odo*
*Context gathered: 2026-03-08*
