---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 03-03-PLAN.md
last_updated: "2026-03-08T17:33:43.510Z"
last_activity: 2026-03-08 -- Go REST API with Redis caching, JWT auth, graceful Odoo degradation, and company provisioning
progress:
  total_phases: 3
  completed_phases: 1
  total_plans: 19
  completed_plans: 17
  percent: 89
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-05)

**Core value:** Bulgarian SMBs can manage all their HR operations in one unified platform with built-in Bulgarian compliance.
**Current focus:** Phase 3 - User Odoo Infrastructure

## Current Position

Phase: 3 of 3 (User Odoo)
Plan: 4 of 5 (Plan 03 complete, starting Plan 04)
Status: Executing
Last activity: 2026-03-08 -- Go REST API with Redis caching, JWT auth, graceful Odoo degradation, and company provisioning

Progress: [█████████░] 89% (17/19 plans complete)

## Performance Metrics

**Phase 1 Completion:**
- All 10 plans completed
- Marketing site: 100% (homepage, features, pricing, hr-tools, blog integration, auth flows)
- AI Assistant: Integrated (Claude Sonnet 4.6 via 21st Agents)
- Design system: Corporate blue palette (BambooHR/Personio inspired)

## Accumulated Context

### Completed Features (Phase 1)

- ✓ Marketing homepage with product hero and social proof
- ✓ Features page with alternating screenshot rows
- ✓ Pricing page with module-based "Get a quote" model
- ✓ HR Tools section with Bulgarian tax calculators
- ✓ Email-gated document templates (contracts, policies, forms)
- ✓ Blog integration via Astro subpath proxy
- ✓ Free trial sign-up flow
- ✓ AI Assistant (Claude Sonnet 4.6) integrated into HR Tools page
- ✓ All supporting pages (about, contact, partners, careers, api-docs, help-center, legal)
- ✓ Framer Motion scroll animations

### Architecture

- **Frontend**: Next.js 15.2, React 19, Tailwind CSS
- **Backend**: Go 1.25 (shared with Jobs platform initially, can be separated)
- **AI**: Claude Sonnet 4.6 via @an-sdk (21st Agents)
- **Authentication**: JWT-based
- **Design**: Corporate blue palette (#1e3a8a primary, enterprise-feeling)

### Roadmap Evolution

- Phase 3 added: User odo

### Decisions

- Separated HR platform from Jobs platform (independent repository)
- Module-based pricing (base + add-on modules)
- Free trial with instant sign-up (no credit card required)
- Bulgarian-first design (English secondary)
- AI assistant for HR policy/calculation queries
- Email-gated templates for lead capture
- Extracted computeNetFromGross to shared lib/calculations.ts (single source of truth)
- EOOD self-insurance calculated on minimum base (1077 BGN) not revenue
- TDD workflow for calculation functions (red-green-refactor)
- [Phase 02]: Extracted computeNetFromGross to shared lib/calculations.ts for single source of truth
- [Phase 02]: Used dot-notation label keys for grouped translation namespaces in freelancer comparison
- [Phase 02]: max-w-5xl for freelancer comparison layout (wider than salary calculator max-w-2xl)
- [Phase 02]: VAT toggle is UI-only display; VAT is pass-through and does not affect net income calculation
- [Phase 02]: Employment column highlighted green with recommended badge; EOOD column muted gray
- [Phase 03]: Go module path github.com/vchavkov/hr-backend for backend service
- [Phase 03]: Deferred unused Go deps (jwtauth, go-redis, jwx) until code imports them
- [Phase 03]: Dedicated PostgreSQL instance for Odoo (separate from future app DB)
- [Phase 03]: Custom JSON-RPC client over skilld-labs/go-odoo for Odoo 18 field compatibility
- [Phase 03]: Many2One as struct {ID, Name} for type safety over raw interface arrays
- [Phase 03]: Session re-auth on AccessDenied with single retry (no infinite loops)
- [Phase 03]: Interface-based mocking for OdooClient and EmployeeServicer enables testing without real Redis/Odoo
- [Phase 03]: Stale cache with 30-min TTL (6x primary) for graceful degradation when Odoo is unavailable
- [Phase 03]: Singleflight on cache Get prevents stampede on concurrent requests

### Setup Requirements (User Responsibilities)

1. Get API key from https://21st.dev
2. Add to `.env`: `AN_API_KEY=<key>`
3. Deploy agent: `cd www && npx @an-sdk/cli login && npx @an-sdk/cli deploy`
4. Update agent name in page.tsx if different from 'hr-assistant'
5. Run `bun run dev` and test at http://localhost:3010/en/hr-tools

## Next Phases (To Be Planned)

- Phase 2: Employee Management (CRUD, directory, onboarding)
- Phase 3: Leave Management (tracking, approval workflows)
- Phase 4: ATS (job posting, applications, candidate pipeline)
- Phase 5: Performance Reviews & Workflows
- Phase 6: Payroll Integration Foundation

## Session Continuity

Last session: 2026-03-08T17:33:43.504Z
Stopped at: Completed 03-03-PLAN.md
Resume file: None
Next up: Execute Plan 03-03 (service layer)
