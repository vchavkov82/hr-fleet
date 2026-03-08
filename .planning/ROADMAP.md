# Roadmap: HR Platform

## Milestones

- [x] **v1.0 MVP** - Phase 1 (HR App MVP - shipped 2026-02-26)
- [ ] **v1.1 Enhanced Features** - Phases 2+ (in progress)

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
| 1. HR App MVP | v1.0 | All | In Progress | - |
| 2. Freelancer vs Payroll Comparison | 3/4 | In Progress|  | - |

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
**Plans:** 3/4 plans executed

Plans:
- [x] 04-01-PLAN.md — Homepage cleanup: strip fake sections, rewrite hero/CTA/features for honest copy
- [ ] 04-02-PLAN.md — Features page restructure (active + roadmap) and pricing page (single plan)
- [ ] 04-03-PLAN.md — Help center content rewrite for real features
- [ ] 04-04-PLAN.md — 6 new Bulgarian blog posts (labor law, platform how-tos, EOOD/freelancer)
