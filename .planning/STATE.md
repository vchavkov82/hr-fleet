---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: — GSD Payroll Platform Expansion
status: executing
stopped_at: Completed 05-03-PLAN.md
last_updated: "2026-03-13T22:08:15.679Z"
last_activity: 2026-03-13 -- Completed 05-04 CI/CD pipelines
progress:
  total_phases: 12
  completed_phases: 3
  total_plans: 27
  completed_plans: 25
  percent: 36
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-13)

**Core value:** Cloud-native payroll and HR management platform rivaling Gusto/Rippling/Deel, leveraging Odoo backend, targeting Bulgarian SMBs.
**Current focus:** v1.1 Planning — Phase 5 (Foundation & Monorepo) is next

## Current Position

Phase: 5 of 11 (Foundation & Monorepo Setup)
Plan: 04 of 04 complete (01 + 02 + 03 + 04 done)
Status: Executing
Last activity: 2026-03-13 -- Completed 05-04 CI/CD pipelines

Progress: [████░░░░░░] 36% (4/11 phases complete, 23/23 v1.0 plans complete)

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
- Phase 4 added: Content aligned with Odoo
- Phase 12 added: Migrate to pnpm+turbo

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
- [Phase 03]: TanStack Table for employee directory (sorting, filtering, pagination built-in)
- [Phase 03]: Controlled inputs without form library for employee CRUD (6 fields)
- [Phase 03]: Mock data for UI-first approach, API wiring deferred to Plan 05
- [Phase 03]: OdooEmployeeType union type for Odoo employee_type field values
- [Phase 04]: Removed fake social proof (TrustedCompanies, StatsCounters, Testimonials) from homepage
- [Phase 04]: FEATURE_KEYS pattern: TSX array keys must match featuresOverview.json item keys exactly
- [Phase 04]: Content honesty principle: every text claim must map to a working feature
- [Phase 04]: Replaced Leave/Payroll/Integrations help categories with HR Tools/Compliance/Account to match real product
- [Phase 04]: Removed all ATS, AI screening, payroll processing references from help center
- [Phase 04]: ACTIVE_FEATURES vs ROADMAP_FEATURES split pattern for showing real vs planned capabilities
- [Phase 04]: Single-column feature checklist instead of multi-module comparison table on pricing page
- [Phase 04]: All blog posts written in Bulgarian with natural HR/legal terminology, referencing platform tools for internal linking
- [Phase 05]: Tokens Studio JSON format as canonical source for all 7 design token categories
- [Phase 05]: Dark mode via both prefers-color-scheme media query AND .dark CSS class
- [Phase 05]: Tailwind colors reference CSS custom properties instead of hardcoded hex values
- [Phase 05]: Component tokens (button, input, card, modal) included in token pipeline
- [Phase 05]: Monorepo layout: apps/* for frontends, services/* for backends, packages/* for shared
- [Phase 05]: Go services integrated into Turborepo via thin package.json with go build/test/lint scripts
- [Phase 05]: Go module path changed from github.com/vchavkov/hr-backend to github.com/vchavkov/hr/services/api
- [Phase 05]: Reusable CI workflow (workflow_call) so deploy-prod can call it as a job
- [Phase 05]: postgres:16-alpine for API database separate from Odoo postgres:17
- [Phase 05]: Odoo 18 confirmed (FND-05 Odoo 17 reference outdated)
- [Phase 05]: sqlc generates type-safe Go from SQL into internal/db/ via pgx/v5

### Setup Requirements (User Responsibilities)

1. Get API key from https://21st.dev
2. Add to `.env`: `AN_API_KEY=<key>`
3. Deploy agent: `cd www && npx @an-sdk/cli login && npx @an-sdk/cli deploy`
4. Update agent name in page.tsx if different from 'hr-assistant'
5. Run `bun run dev` and test at http://localhost:3010/en/hr-tools

## Next Phases (v1.1 GSD Payroll Platform)

- **Phase 5**: Foundation & Monorepo Setup (FND-01–05)
- **Phase 6**: Core Go REST API (API-01–13)
- **Phase 7**: Admin UI with RBAC (ADM-01–14)
- **Phase 8**: Marketing Site Enhancement (MKT-10–18)
- **Phase 9**: Documentation Hub & Blog (DOC-01–05, BLOG-01–06)
- **Phase 10**: Integration QA & Security (QA-01–04, NFR-01–06)
- **Phase 11**: Launch (LAUNCH-01–04)
- **Phase 12**: Migrate to pnpm+turbo

## Session Continuity

Last session: 2026-03-13T22:08:15.675Z
Stopped at: Completed 05-03-PLAN.md
Resume file: None
Next up: 05-03-PLAN.md or 05-04-PLAN.md (wave 2)
