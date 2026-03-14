# Roadmap: HR Platform

## Milestones

- [x] **v1.0 MVP** - Phases 1–4 (Marketing site, calculators, Odoo integration, content — completed 2026-03-08)
- [ ] **v1.1 GSD Payroll Platform** - Phases 5–12 (Monorepo, Core API, Admin UI, Marketing enhancement, Docs/Blog, QA, Launch, pnpm+turbo migration)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (1.1, 1.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

## Current Phase

### Phase 1: HR App Marketing Site and MVP Features
**Goal**: Bulgarian-language marketing pages and core HR SaaS features for the HR platform
**Depends on**: Nothing (first phase)
**Status**: In Progress
**Plans**: 10 plans

Plans:
- [x] 15-01-PLAN.md through 15-10-PLAN.md

### Phase 2: Salary Calculator — Freelancer vs Payroll Comparison
**Goal**: Add comparison tool showing freelancers how much money they lose running an EOOD vs using our payroll service. Marketing-driven feature to convert freelancers into customers.
**Depends on**: Phase 1 (existing salary calculator infrastructure)
**Status**: Planning
**Requirements**: CALC-01 through CALC-10
**Plans**: 4 plans

**Scope:**
- New comparison calculator page at `/hr-tools/freelancer-comparison`
- EOOD tax model: corporate tax 10%, dividend tax 10%, self-insurance on minimum (1,077 BGN), accountant fees
- Employment model: reuse existing `BG_TAX_2026` constants and calculation logic
- Side-by-side results: net income, total cost, effective tax rate, monthly/annual savings
- Hidden costs breakdown (accountant, admin time, bank fees, registration, closure costs)
- Benefits comparison table (leave, sick pay, maternity, unemployment, mortgage eligibility)
- Visual "you save X BGN/month" highlight for marketing conversion
- SEO content for "ЕООД vs трудов договор" / "freelancer vs employment Bulgaria"
- Full BG/EN localization
- Unit and E2E tests

**Key Tax Data (2026):**
- EOOD: 10% corporate + 10% dividend = ~19% effective on profit
- Self-insurance minimum: 1,077 BGN → ~337 BGN/month contributions
- Accountant: ~150 EUR/month (~294 BGN)
- Employment: ~13.78% employee + ~18.92% employer social security + 10% income tax
- Social security ceiling: 3,850 BGN (employment) / 4,130 BGN (self-insured)

Plans:
- [ ] 02-01-PLAN.md — Extract shared calculation logic + EOOD computation (TDD)
- [ ] 02-02-PLAN.md — Build FreelancerComparison client component (UI)
- [ ] 02-03-PLAN.md — Server page, translations (BG/EN), SEO content, navigation
- [ ] 02-04-PLAN.md — Unit tests, E2E tests, visual verification

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. HR App MVP | v1.0 | 10/10 | Complete | 2026-02-26 |
| 2. Freelancer vs Payroll Comparison | v1.0 | 4/4 | Complete | 2026-03-05 |
| 3. Odoo HR Backend Integration | v1.0 | 5/5 | Complete | 2026-03-07 |
| 4. Content Aligned with Odoo | v1.0 | 4/4 | Complete | 2026-03-08 |
| 5. Foundation & Monorepo | v1.1 | 4/4 | Complete | 2026-03-13 |
| 6. Core Go REST API | v1.1 | 7/7 | Complete | 2026-03-14 |
| 7. Admin UI with RBAC | v1.1 | 0/TBD | Not Started | - |
| 8. Marketing Site Enhancement | v1.1 | 0/TBD | Not Started | - |
| 9. Documentation Hub & Blog | v1.1 | 0/TBD | Not Started | - |
| 10. Integration QA & Security | v1.1 | 0/TBD | Not Started | - |
| 11. Launch | v1.1 | 0/TBD | Not Started | - |
| 12. Migrate to pnpm+turbo | v1.1 | 2/2 | Complete | 2026-03-13 |

### Phase 3: Odoo HR Backend Integration

**Goal:** Integrate self-hosted Odoo 18 Community as HR backend with Go API proxy. Deploy Odoo in podman-compose, build JSON-RPC client in Go, expose clean REST API. Frontend: authenticated /dashboard with employee directory (table view, CRUD).
**Requirements**: EMP-01, EMP-02
**Depends on:** Phase 2
**Plans:** 4/5 plans executed

Plans:
- [ ] 03-01-PLAN.md — Infrastructure: Odoo + PostgreSQL + Redis in podman-compose, Go project scaffold
- [ ] 03-02-PLAN.md — Go JSON-RPC client for Odoo with hr.employee CRUD (TDD)
- [ ] 03-03-PLAN.md — Go REST API handlers, Redis caching, JWT middleware
- [ ] 03-04-PLAN.md — Next.js dashboard UI: layout, employee table, forms, translations
- [ ] 03-05-PLAN.md — Integration wiring, tests, and visual verification

### Phase 4: Content aligned with Odoo

**Goal:** Align all marketing content with real platform capabilities. Strip fabricated statistics and fake social proof. Rewrite homepage, features, pricing, and help center to reflect what actually works (employee management, HR calculators, Bulgarian compliance). Add roadmap sections for planned modules. Write 6 new targeted blog posts for Bulgarian HR market SEO.
**Requirements**: CONTENT-01 through CONTENT-07
**Depends on:** Phase 3
**Plans:** 4/4 plans complete

Plans:
- [x] 04-01-PLAN.md — Homepage cleanup: strip fake sections, rewrite hero/CTA/features for honest copy
- [x] 04-02-PLAN.md — Features page restructure (active + roadmap) and pricing page (single plan)
- [x] 04-03-PLAN.md — Help center content rewrite for real features
- [x] 04-04-PLAN.md — 6 new Bulgarian blog posts (labor law, platform how-tos, EOOD/freelancer)

---

## v1.1 — GSD Payroll Platform Expansion

### Phase 5: Foundation & Monorepo Setup
**Goal**: Restructure into monorepo (pnpm workspaces + Turborepo). Set up CI/CD pipelines, design system tokens with CSS custom properties and dark mode, Odoo 18 provisioning, Go project scaffold with Chi + sqlc + pgx.
**Requirements**: FND-01 through FND-05
**Depends on**: Phase 4 (existing codebase)
**Status**: Complete
**Plans**: 4 plans

Plans:
- [x] 05-01-PLAN.md — Monorepo restructure: relocate apps, update workspace and Turborepo configs
- [x] 05-02-PLAN.md — Design system tokens: CSS custom properties, dark mode, Tailwind integration
- [x] 05-03-PLAN.md — Go API scaffold: sqlc + pgx/v5, initial migration, Docker Compose update
- [x] 05-04-PLAN.md — CI/CD pipelines: GitHub Actions for test, build, deploy, security scan

### Phase 6: Core Go REST API
**Goal**: Build versioned REST API (/api/v1) in Go: auth (JWT RS256 + API Key), employee CRUD, payslips, payroll runs (async via Asynq), contracts, leave management, reports, webhooks. Odoo XML-RPC integration with connection pooling, circuit breaker, retry. Swagger/OpenAPI docs auto-generated. Structured logging, Prometheus metrics, OpenTelemetry tracing.
**Requirements**: API-01 through API-13
**Depends on**: Phase 5 (monorepo + Go scaffold)
**Status**: Complete
**Plans**: 7 plans

Plans:
- [x] 06-01-PLAN.md — Foundation: deps, response helpers, observability middleware, Odoo resilience, L1 cache
- [x] 06-02-PLAN.md — Database migrations and sqlc query generation
- [x] 06-03-PLAN.md — JWT RS256 auth, API keys, RBAC, auth endpoints
- [x] 06-04-PLAN.md — Employee CRUD enhancement, contracts, leave management
- [x] 06-05-PLAN.md — Bulgarian tax calculator, payroll runs, payslips, Asynq worker
- [x] 06-06-PLAN.md — Reports and webhook management
- [x] 06-07-PLAN.md — Swagger/OpenAPI docs, route wiring, worker binary, Makefile

### Phase 7: Admin UI with RBAC
**Goal**: React 18 + Vite 5 SPA for platform operators. Login, dashboard (KPI cards), employee CRUD (TanStack Table), payroll run flow, payslip viewer, contract management, leave approval, reports (Recharts), users & roles, audit log, settings. RBAC enforced at API and UI layers with 7 role types. Type-safe API client from OpenAPI spec.
**Requirements**: ADM-01 through ADM-14
**Depends on**: Phase 6 (REST API)
**Status**: Not Started
**Plans**: TBD

### Phase 8: Marketing Site Enhancement
**Goal**: Upgrade Next.js marketing site to full page inventory with SSG+ISR. Achieve Lighthouse Performance ≥ 90, SEO ≥ 95. Add JSON-LD structured data, dynamic sitemap, Core Web Vitals optimization, semantic HTML5, hreflang tags. Industry solutions pages, integrations hub, security page.
**Requirements**: MKT-10 through MKT-18
**Depends on**: Phase 5 (monorepo)
**Status**: Not Started
**Plans**: TBD

### Phase 9: Documentation Hub & Blog
**Goal**: Nuxt.js 3 documentation hub with @nuxt/content, Algolia DocSearch, all content sections (Getting Started through FAQ). Blog with article schema, OG images, RSS feed, category/tag pages, author profiles. Git-based doc versioning.
**Requirements**: DOC-01 through DOC-05, BLOG-01 through BLOG-06
**Depends on**: Phase 6 (API for API Reference docs)
**Status**: Not Started
**Plans**: TBD

### Phase 10: Integration QA & Security
**Goal**: E2E test suite, penetration testing, performance profiling, load testing (10k req/min target). Security hardening: TLS 1.3, HSTS, CSP, dependency scanning (Dependabot + govulncheck).
**Requirements**: QA-01 through QA-04, NFR-01 through NFR-06
**Depends on**: Phases 6–9 (all components built)
**Status**: Not Started
**Plans**: TBD

### Phase 11: Launch
**Goal**: DNS cutover, production deployment, monitoring (Prometheus + Grafana + Sentry + uptime), runbook, on-call rotation. SLA 99.9%, zero-downtime deployments via K8s rolling updates.
**Requirements**: LAUNCH-01 through LAUNCH-04
**Depends on**: Phase 10 (QA passed)
**Status**: Not Started
**Plans**: TBD

### Phase 12: Migrate to pnpm+turbo
**Goal**: Remove all bun artifacts and references from the codebase, replacing with pnpm equivalents. Update container images, scripts, and documentation to consistently use pnpm as the sole package manager.
**Depends on**: Phase 11
**Status**: Complete
**Plans**: 2 plans

Plans:
- [x] 12-01-PLAN.md — Remove bun artifacts, update containers and scripts to pnpm
- [x] 12-02-PLAN.md — Update documentation and agent configs to pnpm
