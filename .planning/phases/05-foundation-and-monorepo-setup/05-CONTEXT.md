# Phase 5: Foundation & Monorepo Setup - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Restructure the existing HR platform codebase into a monorepo with pnpm workspaces + Turborepo. Set up CI/CD pipelines, design system tokens from Figma, Odoo provisioning, and Go project scaffold with Chi router. The existing Next.js marketing site migrates into the monorepo as apps/web.

</domain>

<decisions>
## Implementation Decisions

### Monorepo structure
- pnpm workspaces + Turborepo for orchestration and caching
- Existing www/ marketing site moves into apps/web (direct relocation, not fresh project)
- Go services live inside the monorepo with separate go.mod per service (services/api/go.mod, services/worker/go.mod)
- Claude's discretion on exact workspace layout (apps/, services/, packages/ split)

### CI/CD pipeline design
- GitHub Actions as CI/CD platform
- Docker Compose on VPS for deployment (NOT Kubernetes — simplifies infrastructure significantly)
- Two environments only: Dev + Production (no staging)
- Full pipeline gates: lint, unit, integration, and E2E tests must all pass before deploy

### Design system tokens
- Figma Variables as source of truth, exported via plugin (e.g., Tokens Studio)
- Dual consumption: CSS custom properties as foundation, Tailwind theme references them
- Dark mode support across both marketing site and admin UI
- Claude's discretion on whether admin shares tokens with marketing or gets separate theme

### Go project scaffold
- Chi router (stdlib-compatible, consistent with Phase 3 patterns)
- sqlc + pgx for database access (type-safe SQL, no ORM)
- Claude's discretion on project layout (flat with internal/ vs domain-driven packages)
- Claude's discretion on config management approach

</decisions>

<specifics>
## Specific Ideas

- Docker Compose on VPS chosen over K8s — keep deployment simple for a small team targeting Bulgarian SMBs
- Phase 3 already established Chi router patterns and custom JSON-RPC Odoo client — scaffold should build on those foundations
- Existing Go backend at hr-backend/ needs to migrate into services/api within the monorepo

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-foundation-and-monorepo-setup*
*Context gathered: 2026-03-13*
