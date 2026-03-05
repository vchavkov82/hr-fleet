# HR Platform

## What This Is

A Bulgarian HR SaaS platform where companies manage their entire HR operations including employee management, leave tracking, payroll integration, ATS (Applicant Tracking System), performance reviews, and onboarding. The platform is built with Bulgarian labor law compliance and real tax/salary calculations built-in.

## Core Value

Bulgarian SMBs (10-200 employees) can manage all their HR operations in one unified platform with built-in Bulgarian compliance, eliminating the need for multiple disconnected tools.

## Requirements

### Validated (v1.0 Marketing & MVP Setup)

- ✓ Bulgarian-language marketing website with corporate design (BambooHR/Personio aesthetic)
- ✓ Free trial sign-up flow with instant account creation
- ✓ Interactive HR calculators: salary (net/gross), leave calculations, employment cost with 2026 Bulgarian tax rates
- ✓ Email-gated HR document templates (contracts, policies, forms)
- ✓ Blog integration via Astro subpath proxy
- ✓ AI Assistant (Claude Sonnet 4.6 via 21st Agents) integrated into HR Tools

### In Progress (v1.0 Core Features)

- [ ] Employee management: create, edit, view employee directory
- [ ] Leave management: track leave balances, process leave requests, generate reports
- [ ] ATS: job posting, application management, candidate tracking
- [ ] Performance reviews and workflows
- [ ] Payroll integration foundation (prepared for v1.1+)

### Out of Scope (v1)

- Mobile apps — web-first, defer to future milestone
- Multi-country support — Bulgaria only for v1
- Real-time messaging — not core to HR operations
- Advanced analytics (v2 feature)
- Custom ATS pipeline stages (v2 feature)
- OAuth login — email/password sufficient for v1

## Current Milestone: v1.0 Marketing & MVP

**Goal:** Launch marketing website and establish core HR SaaS features foundation with AI assistant integration.

**Completed:**
- Phase 1: HR App Marketing Site (all plans complete, AI assistant integrated)

**Next phases:**
- Employee management system
- Leave tracking and approval workflows
- ATS with hiring pipeline
- Performance review module

## Context

- **Stack**: Go 1.25 backend, Next.js 15.2 App Router, React 19, PostgreSQL, Tailwind CSS
- **Deployment**: Separated from Jobs platform (separate repository)
- **Authentication**: JWT-based with role-based access control
- **AI Integration**: Claude Sonnet 4.6 via 21st Agents SDK
- **Design System**: Corporate blue palette (BambooHR/Personio inspired)

## Constraints

- **Tech Stack**: Go + Next.js + PostgreSQL — no stack changes for v1
- **Target Market**: Bulgarian SMBs, Bulgarian-language primary
- **Compliance**: Must follow Bulgarian labor law requirements
- **Deployment**: Separate from Jobs platform, independent infrastructure

## Key Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| Separate from Jobs platform | Clear product focus, independent scaling | ✓ Implemented |
| Bulgarian-first design | Target market (SMBs, compliance) | ✓ Implemented |
| Free trial model | SaaS standard for HR market | ✓ Implemented |
| Claude AI assistant | Powerful, reliable for HR queries | ✓ Integrated |
| Module-based pricing | Flexibility for SMBs of different sizes | ✓ Designed |

---
*Last updated: 2026-03-05 after job/HR project separation*
