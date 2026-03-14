# Requirements: HR Platform

**Defined:** 2026-02-26
**Core Value:** Bulgarian SMBs can manage their HR operations (employee management, leave tracking, payroll integration, ATS, performance reviews, onboarding) through a single unified platform with Bulgarian tax/legal compliance built-in.

## v1.0 Requirements (MVP)

### HR App Marketing & Launch
- [x] **MKT-01**: Bulgarian-language marketing pages (home, features, pricing, hr-tools, about, contact, etc.)
- [x] **MKT-02**: Free trial sign-up flow with instant account creation
- [x] **MKT-03**: Interactive HR tools (salary calculator, leave calculator, cost calculator) with Bulgarian 2026 tax rates
- [x] **MKT-04**: Email-gated HR document templates (contracts, policies, forms)
- [x] **MKT-05**: Blog integration via Astro subpath proxy
- [x] **MKT-06**: AI Assistant integration via 21st Agents (Claude Sonnet 4.6)

### Salary Calculator — Freelancer vs Payroll Comparison
- [x] **CALC-01**: Side-by-side comparison showing net income: EOOD/OOD freelancer vs employment through payroll service
- [x] **CALC-02**: EOOD calculation includes: corporate tax (10%), dividend tax (10%), self-insurance on minimum (1,077 BGN), monthly accountant fee (~150 EUR), company admin overhead
- [x] **CALC-03**: Employment calculation uses existing salary calculator logic (employee/employer social security, income tax)
- [x] **CALC-04**: Comparison at user-entered gross amount showing: net to person, total cost to client/employer, effective tax rate, money saved/lost
- [x] **CALC-05**: Visual highlight of savings when using payroll service vs EOOD (marketing angle: "save X BGN/month")
- [x] **CALC-06**: Include hidden costs breakdown: accountant fees, admin time, company registration amortized, bank fees, closure risk
- [x] **CALC-07**: Benefits comparison table: paid leave, sick leave, maternity, unemployment insurance, mortgage eligibility, labor code protection
- [x] **CALC-08**: Fully localized in Bulgarian and English
- [x] **CALC-09**: SEO content sections explaining the comparison for organic traffic
- [x] **CALC-10**: Mobile-responsive design consistent with existing calculators

### HR Employee Management
- [x] **EMP-01**: Admin can create employee records (name, email, role, start date, contract type)
- [x] **EMP-02**: Admin can view employee directory with filtering/search
- [ ] **EMP-03**: Admin can manage employee leave balances and requests
- [ ] **EMP-04**: Admin can track time-off and generate absence reports

### ATS (Applicant Tracking)
- [ ] **ATS-01**: Company can post job openings through integrated ATS
- [ ] **ATS-02**: Candidates can apply to jobs and track application status
- [ ] **ATS-03**: Recruiters can manage candidate pipeline with Kanban board
- [ ] **ATS-04**: Interview scheduling and notifications

### Compliance & Integration
- [ ] **COMP-01**: Platform respects Bulgarian labor laws and regulations
- [ ] **COMP-02**: Payroll integration foundation (prepared for module)
- [ ] **COMP-03**: Performance review workflows

## v1.1 Requirements — GSD Payroll Platform Expansion

### Foundation & Monorepo (Phase 0 from gsd-requirements)
- [x] **FND-01**: Monorepo setup with pnpm workspaces + Turborepo (apps/web, apps/docs, apps/admin, services/api, services/worker, packages/*)
- [x] **FND-02**: CI/CD pipelines (.github/workflows): test, build, deploy, security scan
- [ ] **FND-03**: Figma design system: color tokens, typography, spacing, component library (7 categories)
- [ ] **FND-04**: Design tokens JSON export consumed by Tailwind config
- [x] **FND-05**: Odoo 17 provisioning (Community or Enterprise — decision pending)

### Core Go REST API (Phase 1 from gsd-requirements)
- [x] **API-01**: Go 1.22+ REST API with Chi/Fiber router, versioned under /api/v1
- [x] **API-02**: Auth endpoints: JWT (RS256) login, refresh; API Key (SHA-256 HMAC) support
- [x] **API-03**: Employee CRUD endpoints with pagination, filtering, soft delete
- [x] **API-04**: Payslip endpoints: list, create batch, confirm
- [x] **API-05**: Payroll run endpoints: create, trigger, poll status (async via Asynq)
- [x] **API-06**: Contract endpoints: list, create employment contracts
- [x] **API-07**: Leave management endpoints: allocations, requests, approve/reject
- [x] **API-08**: Report endpoints: payroll summary, tax liabilities
- [x] **API-09**: Webhook registration and management endpoints
- [x] **API-10**: Odoo XML-RPC integration layer: connection pooling (max 20), circuit breaker (gobreaker), exponential backoff retry
- [x] **API-11**: Swagger/OpenAPI 3.0 auto-generated from Go annotations (swaggo/swag), served at /api/docs
- [x] **API-12**: Structured JSON logging (zerolog), Prometheus metrics, OpenTelemetry tracing
- [x] **API-13**: Redis caching (go-redis v9 + ristretto L1), Asynq task queue for async payroll

### Admin UI with RBAC (Phase 2 from gsd-requirements)
- [ ] **ADM-01**: React 18 + Vite 5 SPA with shadcn/ui + Radix UI
- [ ] **ADM-02**: RBAC with 7 roles: super_admin, org_admin, payroll_manager, hr_manager, accountant, support_agent, employee
- [ ] **ADM-03**: Dashboard with KPI cards (active employees, payroll status, deadlines)
- [ ] **ADM-04**: Employee management: paginated table (TanStack Table v8), search, filter, inline edit
- [ ] **ADM-05**: Payroll run flow: create, monitor, confirm/cancel with status breakdown
- [ ] **ADM-06**: Payslip viewer: per-employee history, PDF download
- [ ] **ADM-07**: Contract CRUD with expiry alerts
- [ ] **ADM-08**: Leave management: request queue, approval workflow
- [ ] **ADM-09**: Reports: payroll summary, tax liabilities, custom date range export (Recharts)
- [ ] **ADM-10**: Users & Roles management: invite, assign roles, revoke access
- [ ] **ADM-11**: Audit log: immutable log of all data mutations (actor, timestamp, diff)
- [ ] **ADM-12**: Settings: org config, Odoo connection status, webhook management, API key generation
- [ ] **ADM-13**: JWT auth: access token in memory + refresh token in HttpOnly cookie
- [ ] **ADM-14**: Type-safe API client generated from OpenAPI spec (openapi-fetch)

### Marketing Site Enhancement (Phase 3 from gsd-requirements)
- [ ] **MKT-10**: Next.js 14 App Router with SSG + ISR for all public pages
- [ ] **MKT-11**: Full page inventory: home, pricing, features, feature detail, industry solutions, about, contact, security, integrations, partners, legal
- [ ] **MKT-12**: Lighthouse Performance ≥ 90, SEO ≥ 95 on all pages
- [ ] **MKT-13**: Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] **MKT-14**: JSON-LD structured data: Organization, SoftwareApplication, FAQPage, BreadcrumbList
- [ ] **MKT-15**: Dynamic sitemap.xml via next-sitemap, robots.txt, canonical URLs, OG/Twitter meta
- [ ] **MKT-16**: Semantic HTML5 landmarks, image alt attributes, lazy loading
- [ ] **MKT-17**: 301 redirect map, hreflang tags (i18n-ready)
- [ ] **MKT-18**: Framer Motion animations, Next.js Image optimization (WebP/AVIF)

### Documentation Hub & Blog (Phase 4 from gsd-requirements)
- [ ] **DOC-01**: Nuxt.js 3 documentation hub with @nuxt/content v2 (Markdown + MDX)
- [ ] **DOC-02**: Algolia DocSearch integration
- [ ] **DOC-03**: Content sections: Getting Started, Core Concepts, API Reference, SDK Guides, Odoo Module Guide, Integrations, Security, Release Notes, FAQ
- [ ] **DOC-04**: Auto-generated meta descriptions, BreadcrumbList JSON-LD, scoped sitemap
- [ ] **DOC-05**: Git-based versioning (docs/v1, docs/v2 branches)
- [ ] **BLOG-01**: Nuxt.js 3 blog (content module) at /blog or blog subdomain (decision pending)
- [ ] **BLOG-02**: Content types: product updates, compliance guides, payroll best practices, customer stories, engineering blog, HR news
- [ ] **BLOG-03**: Article JSON-LD schema, auto-generated OG images (@vercel/og or Satori)
- [ ] **BLOG-04**: RSS/Atom feed at /blog/feed.xml
- [ ] **BLOG-05**: Category/tag pages with pagination (SSG), author profile pages
- [ ] **BLOG-06**: Related posts via tag-based similarity, reading time in frontmatter

### Integration QA (Phase 5 from gsd-requirements)
- [ ] **QA-01**: E2E test suite covering all critical user flows
- [ ] **QA-02**: Penetration testing before production launch
- [ ] **QA-03**: Performance profiling and load testing (10,000 req/min API target)
- [ ] **QA-04**: Security: TLS 1.3, HSTS, CSP headers, dependency vulnerability scanning

### Launch (Phase 6 from gsd-requirements)
- [ ] **LAUNCH-01**: DNS cutover and production deployment
- [ ] **LAUNCH-02**: Monitoring live: Prometheus + Grafana, Sentry error tracking, uptime monitoring
- [ ] **LAUNCH-03**: Runbook finalized, on-call rotation established
- [ ] **LAUNCH-04**: SLA target: 99.9% uptime, zero-downtime deployments

### Non-Functional Requirements
- [ ] **NFR-01**: API response time p50 < 100ms, p95 < 500ms, p99 < 2s
- [ ] **NFR-02**: PII encryption at rest (AES-256) in Odoo and audit database
- [ ] **NFR-03**: API rate limiting: 1000 req/min public, 10,000 req/min per authenticated org
- [ ] **NFR-04**: Go API: min 2 replicas, HPA scales to 10 (CPU/RPS)
- [ ] **NFR-05**: Database: automated daily backups, 30-day retention, point-in-time recovery
- [ ] **NFR-06**: Multi-tenancy model (one Odoo instance per tenant or shared — decision pending)

### Open Decisions
- [ ] **DEC-01**: Odoo Community vs Enterprise (enterprise needed for advanced payroll localization)
- [ ] **DEC-02**: Blog on same domain (/blog) or subdomain (blog.gsd.com)
- [ ] **DEC-03**: Multi-tenancy: one Odoo per tenant vs shared multi-company
- [ ] **DEC-04**: Payment/banking integration scope for MVP (Stripe, ACH, SEPA)
- [ ] **DEC-05**: Mobile app (React Native) scope: v1 or post-launch
- [ ] **DEC-06**: Compliance jurisdictions at launch (US, EU, BG only)
- [ ] **DEC-07**: SOC 2 Type II in year-1 roadmap

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MKT-01 | Phase 1 | Complete |
| MKT-02 | Phase 1 | Complete |
| MKT-03 | Phase 1 | Complete |
| MKT-04 | Phase 1 | Complete |
| MKT-05 | Phase 1 | Complete |
| MKT-06 | Phase 1 | Complete |

| CALC-01 | Phase 2 | Complete |
| CALC-02 | Phase 2 | Complete |
| CALC-03 | Phase 2 | Complete |
| CALC-04 | Phase 2 | Complete |
| CALC-05 | Phase 2 | Complete |
| CALC-06 | Phase 2 | Complete |
| CALC-07 | Phase 2 | Complete |
| CALC-08 | Phase 2 | Complete |
| CALC-09 | Phase 2 | Complete |
| CALC-10 | Phase 2 | Complete |

| EMP-01 | Phase 3 | Complete |
| EMP-02 | Phase 3 | Complete |
| EMP-03 | Phase 5+ | Pending |
| EMP-04 | Phase 5+ | Pending |
| ATS-01–04 | Phase 7+ | Pending |
| COMP-01–03 | Phase 7+ | Pending |
| FND-01–05 | Phase 5 | Complete |
| API-01–13 | Phase 6 | Pending |
| ADM-01–14 | Phase 7 | Pending |
| MKT-10–18 | Phase 8 | Pending |
| DOC-01–05, BLOG-01–06 | Phase 9 | Pending |
| QA-01–04 | Phase 10 | Pending |
| LAUNCH-01–04 | Phase 11 | Pending |
| NFR-01–06 | Phases 6–11 | Cross-cutting |

**Coverage:**
- v1.0 requirements: 16 marketing+calculator (complete), 4 HR employee (2 complete, 2 pending), 4 ATS (pending), 3 compliance (pending)
- v1.1 requirements: 5 foundation, 13 API, 14 admin, 9 marketing enhancement, 11 docs/blog, 4 QA, 4 launch, 6 NFR, 7 open decisions
- Total: 95 requirements tracked

---
*Requirements defined: 2026-02-26*
*Last updated: 2026-03-13 — expanded with GSD Payroll Platform requirements*
