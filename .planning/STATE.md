---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 02-01-PLAN.md
last_updated: "2026-03-08T12:10:01.300Z"
last_activity: 2026-03-08 -- Extracted pure calculation functions for freelancer vs employment comparison (TDD)
progress:
  total_phases: 2
  completed_phases: 1
  total_plans: 14
  completed_plans: 11
  percent: 79
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-05)

**Core value:** Bulgarian SMBs can manage all their HR operations in one unified platform with built-in Bulgarian compliance.
**Current focus:** Phase 2 - Salary Calculator Freelancer vs Payroll Comparison

## Current Position

Phase: 2 of 2 (Salary Calculator Freelancer vs Payroll Comparison)
Plan: 2 of 4 (Plan 01 complete, starting Plan 02)
Status: Executing
Last activity: 2026-03-08 -- Extracted pure calculation functions for freelancer vs employment comparison (TDD)

Progress: [████████░░] 79% (11/14 plans complete)

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

Last session: 2026-03-08T12:10:01.296Z
Stopped at: Completed 02-01-PLAN.md
Resume file: None
Next up: Execute Plan 02-02 (freelancer comparison UI component)
