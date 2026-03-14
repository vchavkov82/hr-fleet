# Phase 6: Core Go REST API - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Build versioned REST API (`/api/v1`) in Go: auth (JWT RS256 + API Key), employee CRUD, payslips, payroll runs (async via Asynq), contracts, leave management, reports, webhooks. Odoo XML-RPC integration with connection pooling, circuit breaker, retry. Swagger/OpenAPI docs auto-generated. Structured logging, Prometheus metrics, OpenTelemetry tracing.

</domain>

<decisions>
## Implementation Decisions

### Auth & Multi-tenancy

**Q: How should tenant isolation work?**
- **Answer: Single-tenant for now** — One company per deployment initially. Add multi-tenancy later when needed.

**Q: For JWT auth — who issues the tokens?**
- **Answer: Self-issued JWT RS256** — API has its own `/auth/login` endpoint, issues RS256 JWTs. We manage keys, refresh tokens, password hashing.

**Q: Should API keys be supported alongside JWT for machine-to-machine access?**
- **Answer: Yes, both JWT + API keys** — JWT for user sessions, API keys for integrations/webhooks. API keys are long-lived, scoped to specific permissions.

**Q: What RBAC model for the API?**
- **Answer: Fixed roles** — Predefined roles (super_admin, admin, hr_manager, hr_officer, accountant, employee, viewer) with hardcoded permissions. Simple, predictable.

### Payroll Run Lifecycle

**Q: What approval flow before a payroll run executes?**
- **Answer: Draft → Approve → Process** — HR creates draft, manager/admin approves, then system processes. Prevents accidental runs.

**Q: When a payroll run fails mid-processing, what should happen?**
- **Answer: Claude's discretion** — Claude picks based on payroll domain best practices.

**Q: Should payroll calculations happen in Go or in Odoo?**
- **Answer: Hybrid** — Go calculates Bulgarian-specific taxes (already have this logic from Phase 2). Odoo handles standard HR data. Best of both but more integration surface.

**Q: Should completed payroll runs be immutable or allow corrections?**
- **Answer: Claude's discretion** — Claude picks based on Bulgarian accounting/compliance requirements.

### API Response Design

**Q: What pagination style for list endpoints?**
- **Answer: Claude's discretion** — Claude picks based on the data patterns in this API.

**Q: What error response format?**
- **Answer: Claude's discretion** — Claude picks a clean, consistent format.

**Q: Should the API support bulk operations?**
- **Answer: Claude's discretion** — Claude decides based on the use cases in scope.

**Q: Should API responses include HATEOAS-style links or keep it flat?**
- **Answer: Claude's discretion** — Claude picks based on who consumes this API (primarily the Admin UI in Phase 7).

### Odoo Integration Boundary

**Q: What's the source of truth for employee data?**
- **Answer: Odoo is master** — Odoo owns employee records. Go API reads from Odoo (cached), writes to Odoo. Local DB only stores app-specific data (users, audit logs, payroll runs).

**Q: When Odoo is down or unreachable, how should the API behave?**
- **Answer: Claude's discretion** — Claude picks based on the existing Phase 3 caching patterns (30-min stale TTL already established).

**Q: Should the API expose Odoo's data model directly, or map to its own domain model?**
- **Answer: Claude's discretion** — Claude picks based on the existing Phase 3 patterns and maintainability.

**Q: For write operations, should the API write synchronously to Odoo or queue it?**
- **Answer: Claude's discretion** — Claude picks based on data consistency requirements.

### Claude's Discretion

Claude has flexibility on the following areas (user explicitly deferred):
- Payroll run failure mode (fail entire batch vs partial success)
- Payroll run immutability model
- Pagination style (cursor vs offset)
- Error response format
- Bulk operations support
- HATEOAS links
- Odoo degradation behavior
- API domain model mapping
- Odoo write path (sync vs async)

</decisions>

<specifics>
## Specific Ideas

- Bulgarian tax calculation logic already exists from Phase 2 — reuse in hybrid payroll engine
- Phase 3 established Odoo JSON-RPC client with Redis caching (30-min stale TTL, singleflight) — extend, don't rebuild
- Phase 3 used Many2One as struct {ID, Name} for type safety — maintain this pattern
- Phase 3 used interface-based mocking for OdooClient — continue for testability

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-core-go-rest-api*
*Context gathered: 2026-03-13*
*Discussion status: Odoo Integration Boundary area was not fully closed — user may want to revisit before planning*
