# GSD Payroll Platform
## Project Requirements Document

**Version:** 1.0.0 | **Status:** Draft | **Date:** March 2026 | **Classification:** Confidential

---


# 1. Executive Summary


GSD Payroll Platform is a modern, cloud-native payroll and HR management system built on top of the Odoo open-source ERP framework. It delivers a full-stack solution spanning a consumer-grade marketing website, an API-first backend, an embeddable documentation hub, a company blog, and a secure admin portal — all designed for enterprise scale from day one.

The platform is designed around five primary pillars:
- Public-facing marketing site (Next.js) optimized for SEO and conversion
- Odoo-integrated Go middleware providing a clean REST API layer
- Interactive API documentation via Swagger/OpenAPI
- Nuxt.js documentation & blog hub for developer and end-user content
- Role-based Admin UI for operators, support staff, and platform administrators


---

## Strategic Objective
Deliver a white-label, scalable payroll SaaS platform that rivals Gusto, Rippling, and Deel in UX quality — while leveraging Odoo's battle-tested HR and accounting modules as the computation backbone.


# 2. System Architecture Overview


The system is composed of six loosely-coupled services, each independently deployable and scalable. Communication between layers follows API-first principles: the Go middleware is the sole consumer of the Odoo XML-RPC / JSON-RPC interface; all other layers consume only the REST API exposed by the Go backend.


## 2.1 High-Level Component Map


| Component | Technology | Hosting | SEO Priority | Auth |
| --- | --- | --- | --- | --- |
| Marketing Site | Next.js 14 (App Router) | Vercel / CDN | CRITICAL | Public |
| Documentation Hub | Nuxt.js 3 | Vercel / Netlify | HIGH | Public + Gate |
| Company Blog | Nuxt.js 3 (content module) | Vercel / Netlify | HIGH | Public |
| Admin UI | React + Vite (SPA) | Private CDN / VPC | NONE | RBAC (JWT) |
| Go API Middleware | Go 1.22 + Chi/Fiber | Kubernetes / ECS | N/A | JWT + API Key |
| Odoo Backend | Odoo 17 Community/Enterprise | Managed / Self-hosted | N/A | Internal only |


Table 1 — Platform component map


## 2.2 Data Flow

All external traffic follows a strict unidirectional flow:
- Browser / Mobile → Next.js / Nuxt.js (SSR/SSG) → Go REST API
- Admin Browser → Admin SPA → Go REST API
- Go REST API → Odoo XML-RPC / JSON-RPC (internal network only)
- Go REST API → PostgreSQL (session state, audit log, rate limiting)
- Odoo → PostgreSQL (its own managed database — never directly accessed by external services)


## 2.3 Deployment Topology


| Layer | Target Infrastructure |
| --- | --- |
| Marketing / Docs / Blog | Vercel Edge Network (zero-config, global CDN) |
| Go API | Docker → Kubernetes (GKE / EKS) or AWS ECS Fargate |
| Odoo | Managed Odoo.sh or self-hosted on GCP/AWS VM |
| PostgreSQL (audit) | Cloud SQL (managed) or RDS |
| Redis | Upstash or ElastiCache (session, rate-limit, cache) |
| Secrets | HashiCorp Vault or AWS Secrets Manager |


Table 2 — Deployment topology


# 3. Marketing Site (Next.js)


## 3.1 Purpose & Goals

The marketing site is the public face of the platform and the primary driver of organic acquisition. It must achieve high Core Web Vitals scores, rank for competitive payroll-related keywords, and convert visitors into trial sign-ups.

## 3.2 Technology Stack


| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 with App Router |
| Rendering | Static Site Generation (SSG) + Incremental Static Regeneration (ISR) |
| Styling | Tailwind CSS v4 + shadcn/ui component library |
| Animations | Framer Motion |
| CMS (optional) | Contentful / Sanity.io headless CMS for landing page copy |
| Analytics | Google Analytics 4 + Plausible (privacy-first fallback) |
| A/B Testing | Vercel Edge Config + feature flags |
| Image Optimization | Next.js Image (automatic WebP/AVIF, lazy load) |
| Design Source | Figma MCP — frames generated and synced via Figma token |


Table 3 — Marketing site stack

## 3.3 Page Inventory


| Route | Page Name | Rendering | Priority |
| --- | --- | --- | --- |
| / | Home / Hero | SSG | P0 |
| /pricing | Pricing Plans | SSG + ISR | P0 |
| /features | Feature Overview | SSG | P0 |
| /features/[slug] | Feature Detail | SSG | P1 |
| /solutions/[industry] | Industry Solutions | SSG | P1 |
| /about | About Us | SSG | P1 |
| /contact | Contact / Demo Request | SSG | P0 |
| /security | Security & Compliance | SSG | P1 |
| /integrations | Integrations Hub | SSG + ISR | P1 |
| /partners | Partner Program | SSG | P2 |
| /legal/privacy | Privacy Policy | SSG | P2 |
| /legal/terms | Terms of Service | SSG | P2 |


Table 4 — Marketing site page inventory

## 3.4 SEO Requirements (CRITICAL)


---

## SEO is the #1 Non-Functional Requirement for the Marketing Site
Every page must pass Google Lighthouse SEO audit with a score ≥ 95.
Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1 on all pages.
All pages must have canonical URLs, Open Graph meta, Twitter Card meta, and JSON-LD structured data.


- Server-side rendering or static generation for all public pages (no client-only rendering)
- Dynamic sitemap.xml generated at build time via next-sitemap
- robots.txt excluding admin paths and internal API routes
- Structured data (JSON-LD): Organization, SoftwareApplication, FAQPage, BreadcrumbList
- Semantic HTML5 landmarks on every page (header, main, nav, footer, article)
- Image alt attributes on all images; lazy loading for below-fold images
- Internationalization-ready (hreflang tags) for future i18n expansion
- 301 redirect map managed via next.config.js redirects


# 4. Documentation Hub (Nuxt.js)


## 4.1 Overview

The documentation hub serves both end-users (HR managers, employees) and developers integrating with the GSD REST API. It is built with Nuxt.js 3 and the @nuxt/content module, enabling Markdown-based authoring with MDX-like component embedding.

## 4.2 Technology Stack


| Concern | Choice |
| --- | --- |
| Framework | Nuxt.js 3 (Nitro engine) |
| Content Engine | @nuxt/content v2 (Markdown + MDX) |
| Search | Algolia DocSearch (free tier for open-source) |
| Versioning | Git-based via branches (docs/v1, docs/v2 …) |
| Syntax Highlighting | Shiki (VS Code themes) |
| Component Library | Nuxt UI Pro (Docus theme or custom) |
| Deployment | Vercel static output (nuxi generate) |


## 4.3 Content Sections

- Getting Started — account setup, first payroll run, onboarding checklist
- Core Concepts — payroll cycles, tax compliance, leave management, benefits
- API Reference — auto-generated from Swagger/OpenAPI spec (redoc embed or custom)
- SDK Guides — Go, TypeScript, Python client library usage
- Odoo Module Guide — configuring HR, Payroll, and Accounting modules
- Integrations — connecting third-party HRIS, accounting, and banking tools
- Security & Compliance — SOC 2, GDPR, data residency
- Release Notes — per-version changelog with migration guides
- FAQ & Troubleshooting — searchable knowledge base

## 4.4 SEO for Docs

Documentation pages contribute meaningfully to organic search. Requirements:
- Auto-generated meta descriptions from first paragraph of each doc
- BreadcrumbList JSON-LD on every doc page
- Sitemap scoped to /docs/* path
- Link canonical to marketing site domain when duplicated content exists


# 5. Company Blog


## 5.1 Overview

The blog is a high-SEO-value content channel for thought leadership, product updates, HR compliance guides, and payroll best practices. It runs as a sub-path of the documentation hub (/blog) or as a standalone Nuxt content site, with a shared component library.

## 5.2 Content Types


| Content Type | Description & Frequency |
| --- | --- |
| Product Updates | Release announcements, new features — monthly |
| Compliance Guides | Tax law changes, regulatory updates — as needed |
| Payroll Best Practices | Long-form SEO articles — 2x/month |
| Customer Stories | Case studies / success stories — monthly |
| Engineering Blog | Technical deep-dives for developer audience — 2x/month |
| HR Industry News | Curated commentary on HR trends — weekly |


## 5.3 Blog SEO Requirements

- Article schema (JSON-LD) on every post: author, datePublished, dateModified, image
- Auto-generated OG images using @vercel/og or Satori per post
- Reading time estimate in frontmatter
- Related posts section using tag-based similarity
- RSS / Atom feed at /blog/feed.xml
- Category and tag pages with pagination (SSG)
- Author profile pages linking to all posts


# 6. Go Backend & Odoo Middleware


## 6.1 Role in the Architecture

The Go service is the sole interface between all frontend applications and the Odoo backend. It exposes a versioned REST API, enforces authentication and authorization, handles caching, rate limiting, webhook dispatch, and translates REST semantics into Odoo XML-RPC/JSON-RPC calls.

## 6.2 Technology Choices


| Concern | Choice / Rationale |
| --- | --- |
| Language | Go 1.22+ — performance, concurrency, strong typing |
| HTTP Router | Chi v5 or Fiber v3 (benchmark-driven choice) |
| ORM / DB | sqlc (type-safe SQL) + pgx v5 for PostgreSQL |
| Odoo Client | Custom Go XML-RPC client (odoo-go library or internal) |
| Auth | JWT (RS256) + API Key (SHA-256 HMAC) |
| Validation | go-playground/validator v10 |
| Config | Viper + environment variables + Vault integration |
| Logging | zerolog (structured JSON logs) |
| Metrics | Prometheus metrics + Grafana dashboard |
| Tracing | OpenTelemetry (OTLP → Jaeger / Tempo) |
| Testing | testify + httptest + testcontainers-go |
| API Docs | swaggo/swag (generate Swagger 2.0 / OpenAPI 3.0 from annotations) |
| Task Queue | Asynq (Redis-backed) for async payroll processing |
| Cache | go-redis v9 + in-process ristretto L1 cache |


Table 5 — Go middleware technology choices

## 6.3 REST API Design

The API follows REST conventions with JSON request/response bodies. All endpoints are versioned under /api/v1.


| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | /api/v1/health | Service health check | Public |
| POST | /api/v1/auth/login | Obtain JWT token | API Key |
| POST | /api/v1/auth/refresh | Refresh JWT token | JWT (refresh) |
| GET | /api/v1/employees | List employees (paginated) | JWT + RBAC |
| POST | /api/v1/employees | Create employee | JWT + RBAC |
| GET | /api/v1/employees/:id | Get employee detail | JWT + RBAC |
| PATCH | /api/v1/employees/:id | Update employee | JWT + RBAC |
| DELETE | /api/v1/employees/:id | Archive employee (soft delete) | JWT + RBAC |
| GET | /api/v1/payslips | List payslips | JWT + RBAC |
| POST | /api/v1/payslips | Create payslip batch | JWT + RBAC |
| POST | /api/v1/payslips/:id/confirm | Confirm payslip | JWT + RBAC |
| GET | /api/v1/payroll-runs | List payroll runs | JWT + RBAC |
| POST | /api/v1/payroll-runs | Create and trigger payroll run | JWT + RBAC |
| GET | /api/v1/payroll-runs/:id/status | Poll payroll run status (async) | JWT |
| GET | /api/v1/contracts | List employment contracts | JWT + RBAC |
| POST | /api/v1/contracts | Create contract | JWT + RBAC |
| GET | /api/v1/leave-allocations | List leave allocations | JWT + RBAC |
| POST | /api/v1/leave-requests | Submit leave request | JWT |
| PATCH | /api/v1/leave-requests/:id | Approve / reject leave | JWT + RBAC |
| GET | /api/v1/reports/payroll-summary | Payroll summary report | JWT + RBAC |
| GET | /api/v1/reports/tax-liabilities | Tax liability report | JWT + RBAC |
| POST | /api/v1/webhooks | Register webhook endpoint | JWT + RBAC |
| GET | /api/v1/webhooks | List registered webhooks | JWT + RBAC |


Table 6 — REST API endpoint inventory (partial — full spec in Swagger)

## 6.4 Odoo Integration Layer

The Go service connects to Odoo via XML-RPC on an internal VPC network. All Odoo calls are wrapped in a repository pattern to allow mock substitution in tests.
- Connection pooling: max 20 concurrent Odoo XML-RPC connections
- Circuit breaker pattern (sony/gobreaker) protecting all Odoo calls
- Automatic retry with exponential backoff (3 attempts, 100ms base)
- All Odoo responses normalized into canonical Go structs before returning to callers
- Odoo module prerequisites: hr, hr_payroll, hr_contract, hr_holidays, account, account_accountant

## 6.5 Swagger / OpenAPI Documentation

API documentation is auto-generated from Go code annotations using swaggo/swag and served at /api/docs.
- OpenAPI 3.0 spec generated at build time (make swagger)
- Swagger UI embedded at /api/docs (swagger-ui-dist)
- Redoc alternative at /api/redoc for documentation-site embedding
- Spec file committed to repo: docs/openapi.yaml
- Spec also published to the Nuxt documentation hub under /docs/api
- Request/response examples included in all endpoint annotations
- Error response schemas standardized: { error: string, code: string, details?: object }


# 7. Admin UI with RBAC


## 7.1 Overview

The Admin UI is an internal single-page application for platform operators, support agents, and super-admins. SEO is explicitly out of scope — it sits behind authentication and is never indexed. The focus is on developer-speed tooling: fast data tables, inline editing, audit trails, and role management.

## 7.2 Technology Stack


| Concern | Choice |
| --- | --- |
| Framework | React 18 + Vite 5 (SPA — no SSR needed) |
| State Management | Zustand (lightweight) + TanStack Query v5 |
| UI Library | shadcn/ui + Radix UI primitives |
| Data Tables | TanStack Table v8 (virtual scrolling for 10k+ rows) |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts (payroll dashboards) |
| Auth | JWT stored in memory + refresh token in HttpOnly cookie |
| Routing | React Router v6 (lazy-loaded route chunks) |
| API Client | openapi-fetch (type-safe, generated from OpenAPI spec) |
| Testing | Vitest + Testing Library + Playwright (E2E) |
| Deployment | Private S3 / GCS bucket + CloudFront (no public CDN) |


## 7.3 RBAC — Role Definitions


| Role | Display Name | Permissions Summary |
| --- | --- | --- |
| super_admin | Super Administrator | Full access to all resources including system config, billing, and role assignment |
| org_admin | Organization Admin | Full access within their organization: employees, payroll, contracts, reports |
| payroll_manager | Payroll Manager | Create and confirm payroll runs; view all employee payslips within org |
| hr_manager | HR Manager | Manage employees, contracts, leave; no payroll confirmation rights |
| accountant | Accountant | Read payslips, export reports, view tax liabilities; no write access |
| support_agent | Support Agent | Read-only across all orgs; can submit internal notes; no PII export |
| employee | Employee (self-service) | View own payslips, submit leave requests, update personal info |


Table 7 — RBAC role definitions

## 7.4 Admin UI Page Inventory

- Dashboard — KPI cards: active employees, payroll run status, upcoming deadlines
- Organizations — multi-tenant org management (super_admin only)
- Employees — paginated table, search, filter by department/status, inline edit
- Payroll Runs — create, monitor status, view breakdown, confirm/cancel
- Payslips — per-employee payslip history, PDF download
- Contracts — contract CRUD, expiry alerts
- Leave Management — leave requests queue, approval workflow
- Reports — payroll summary, tax liabilities, custom date range export
- Users & Roles — invite users, assign roles, revoke access
- Audit Log — immutable log of all data mutations with actor, timestamp, diff
- Settings — org config, Odoo connection status, webhook management
- API Keys — generate and revoke API keys per integration

## 7.5 RBAC Implementation

RBAC is enforced at two layers: the Go API (authoritative) and the Admin UI (UX only, never a security boundary).
- Go API: every route handler checks JWT claims against a permission matrix before processing
- Admin UI: route guards redirect unauthorized users; menu items hidden based on role
- Permissions are encoded in the JWT access token as a string array (e.g., ["payslip:read", "employee:write"])
- Token refresh preserves permissions; role changes take effect on next token refresh
- Audit log records every permission check failure (for anomaly detection)


# 8. Design System & Figma


## 8.1 Figma MCP Integration

Design frames are created and maintained in Figma using the Figma MCP server with the provided design token. This enables Claude to programmatically generate, update, and inspect design frames directly, ensuring design-code consistency throughout development.

## 8.2 Design Token Architecture

- Color tokens: brand, accent, semantic (success/warning/error/info), neutral scale
- Typography tokens: font families, size scale (12–72px), weight, line-height
- Spacing tokens: 4px base grid (4, 8, 12, 16, 24, 32, 48, 64, 96, 128)
- Border radius tokens: none, sm (4px), md (8px), lg (16px), full
- Shadow tokens: sm, md, lg, xl (elevation system)
- Tokens exported as JSON and consumed by both Tailwind config and Figma via Token Studio

## 8.3 Figma File Structure

- Page 1: Design System — color palette, typography, component library
- Page 2: Marketing Site — wireframes and hi-fi for all P0/P1 pages
- Page 3: Admin UI — dashboard, data tables, forms, modals
- Page 4: Documentation Hub — doc layout, nav, code blocks
- Page 5: Blog — article layout, listing page, author profile
- Page 6: Mobile — responsive breakpoints for marketing site (375px, 768px)

## 8.4 Component Library Scope

The following component categories must be designed in Figma before frontend implementation begins:
- Navigation: top nav (marketing), sidebar nav (admin), breadcrumbs, mobile hamburger
- Buttons: primary, secondary, ghost, destructive — all sizes and states
- Forms: inputs, selects, checkboxes, radios, toggles, date pickers — all states
- Data Display: tables, cards, stat blocks, badges, avatars, timelines
- Feedback: toasts, alerts, empty states, loading skeletons, progress indicators
- Overlays: modals, drawers, tooltips, popovers, confirmation dialogs
- Marketing: hero sections, feature grids, pricing tables, testimonials, CTA blocks


# 9. Non-Functional Requirements


## 9.1 Performance


| Metric | Marketing | Admin UI | Go API |
| --- | --- | --- | --- |
| Lighthouse Performance Score | ≥ 90 | ≥ 80 | N/A |
| First Contentful Paint (FCP) | < 1.5s | < 2s | N/A |
| Time to First Byte (TTFB) | < 200ms | < 500ms | < 50ms (p95) |
| API response time (p50) | N/A | N/A | < 100ms |
| API response time (p95) | N/A | N/A | < 500ms |
| API response time (p99) | N/A | N/A | < 2s |
| Concurrent users supported | Unlimited (CDN) | 500 active | 10,000 req/min |


Table 8 — Performance targets by layer

## 9.2 Security

- TLS 1.3 enforced on all external endpoints
- HSTS header with 1-year max-age and includeSubDomains
- CSP headers on all pages; no unsafe-inline scripts (nonce-based where required)
- OAuth 2.0 / OIDC ready for enterprise SSO (Okta, Azure AD) — not required in MVP
- All PII fields encrypted at rest (AES-256) in Odoo and audit database
- API rate limiting: 1000 req/min per IP (public), 10,000 req/min per authenticated org
- SQL injection prevention: parameterized queries only (enforced by sqlc)
- Dependency vulnerability scanning: Dependabot + govulncheck in CI
- Penetration test required before production launch

## 9.3 Observability

- Structured JSON logging in all Go services (zerolog)
- Prometheus metrics exposed at /metrics (scraped by Grafana Cloud or self-hosted)
- Distributed tracing via OpenTelemetry → Jaeger
- Error tracking: Sentry (Go SDK + Next.js SDK + Nuxt module)
- Uptime monitoring: Checkly or Better Uptime (synthetic checks every 60s)
- Alerting: PagerDuty integration for P0/P1 incidents

## 9.4 Availability & Resilience

- SLA target: 99.9% uptime (< 8.7 hours downtime/year) for API and marketing site
- Go API: minimum 2 replicas; HPA scales to 10 based on CPU/RPS
- Zero-downtime deployments via rolling update strategy in Kubernetes
- Database: automated daily backups with 30-day retention; point-in-time recovery
- Odoo: nightly snapshot; failover VM in standby for < 1 hour RTO


# 10. Repository & Monorepo Structure


The project lives in a single Git monorepo managed with pnpm workspaces (for JS/TS projects) and Go modules. The root contains a Turborepo configuration for parallel builds and caching.


| Path | Contents |
| --- | --- |
| apps/web | Next.js marketing site |
| apps/docs | Nuxt.js documentation hub + blog |
| apps/admin | React + Vite admin UI |
| services/api | Go REST API middleware + Odoo client |
| services/worker | Go async task worker (Asynq) |
| packages/ui | Shared React component library (shadcn + custom) |
| packages/types | Shared TypeScript types (generated from OpenAPI spec) |
| packages/config | Shared ESLint, Prettier, Tailwind configs |
| packages/design-tokens | Design tokens JSON (synced from Figma) |
| infra/ | Terraform modules: GKE, Cloud SQL, Redis, IAM |
| infra/k8s/ | Kubernetes manifests (Helm charts) |
| docs/openapi.yaml | Auto-generated OpenAPI 3.0 specification |
| docs/architecture/ | ADRs (Architecture Decision Records) |
| .github/workflows/ | CI/CD pipelines: test, build, deploy, security scan |
| Makefile | Top-level developer commands: make dev, make test, make swagger |


Table 9 — Monorepo directory structure


# 11. Development Phases & Milestones


| Phase | Name | Duration | Key Deliverables |
| --- | --- | --- | --- |
| 0 | Foundation | 2 weeks | Monorepo setup, CI/CD, Figma design system, Odoo provisioning, Go project scaffold |
| 1 | Core API | 4 weeks | Go REST API: auth, employees, contracts, payroll runs; Swagger docs; Odoo XML-RPC integration |
| 2 | Admin UI MVP | 4 weeks | Admin UI: login, dashboard, employee CRUD, payroll run flow, RBAC enforcement |
| 3 | Marketing Site | 3 weeks | Next.js: home, pricing, features, contact, SEO meta, sitemap, Lighthouse ≥ 90 |
| 4 | Docs & Blog | 3 weeks | Nuxt.js: doc structure, API reference embed, blog with RSS, Algolia search |
| 5 | Integration QA | 2 weeks | E2E tests, penetration test, performance profiling, load testing |
| 6 | Launch | 1 week | DNS cutover, monitoring live, runbook finalized, on-call rotation established |


Table 10 — Development phases (total estimate: ~19 weeks)


# 12. Open Questions & Decisions Pending


| # | Question | Owner | Target Date |
| --- | --- | --- | --- |
| 1 | Odoo Community vs Enterprise? Enterprise required for advanced payroll localization. | Architecture | Week 1 |
| 2 | Blog on same domain (/blog) or subdomain (blog.gsd.com)? Affects SEO strategy. | SEO Lead | Week 1 |
| 3 | Multi-tenancy model: one Odoo instance per tenant, or shared Odoo with multi-company? | Architecture | Week 1 |
| 4 | Which payment/banking integration is in scope for MVP? (e.g., Stripe, ACH, SEPA) | Product | Week 2 |
| 5 | Is mobile app (React Native) in scope for v1 or post-launch? | Product | Week 2 |
| 6 | Which compliance jurisdictions must be supported at launch? (US federal, state, EU?) | Legal/Product | Week 1 |
| 7 | SOC 2 Type II certification: in-scope for year-1 roadmap? | Engineering/Legal | Week 3 |


Table 11 — Open questions requiring stakeholder decisions


# 13. Glossary


| Term | Definition |
| --- | --- |
| ADR | Architecture Decision Record — a short document capturing an architectural decision |
| HMAC | Hash-based Message Authentication Code — used for API key signing |
| ISR | Incremental Static Regeneration — Next.js feature to rebuild static pages on demand |
| OTLP | OpenTelemetry Protocol — standard for exporting traces, metrics, and logs |
| RBAC | Role-Based Access Control — permission model based on assigned roles |
| SSG | Static Site Generation — HTML generated at build time |
| SSR | Server-Side Rendering — HTML generated on each request |
| VPC | Virtual Private Cloud — isolated cloud network for internal service communication |
| XML-RPC | Odoo's external API protocol for model CRUD and method calls |
