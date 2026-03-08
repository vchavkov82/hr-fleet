---
phase: 03
slug: user-odo
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework (frontend)** | Vitest 2.x + Playwright 1.58 |
| **Framework (backend)** | Go testing (stdlib) |
| **Config file (frontend)** | `www/vitest.config.ts`, `www/playwright.config.ts` |
| **Config file (backend)** | None — Wave 0 installs |
| **Quick run command** | `cd backend && go test ./... && cd ../www && bun run test` |
| **Full suite command** | `cd backend && go test ./... && cd www && bun run test && bun run test:e2e` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && go test ./... && cd ../www && bun run test`
- **After every plan wave:** Run full suite including E2E
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 0 | EMP-01, EMP-02 | infra | `cd backend && go test ./...` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | EMP-01, EMP-02 | integration | `cd backend && go test ./platform/odoo/ -v` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 1 | EMP-01 | integration | `cd backend && go test ./internal/handler/ -run TestCreateEmployee -v` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 1 | EMP-02 | integration | `cd backend && go test ./internal/handler/ -run TestListEmployees -v` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 2 | EMP-01 | unit | `cd www && bun run test -- employee-form` | ❌ W0 | ⬜ pending |
| 03-04-02 | 04 | 2 | EMP-02 | unit | `cd www && bun run test -- employee-table` | ❌ W0 | ⬜ pending |
| 03-05-01 | 05 | 2 | EMP-02 | e2e | `cd www && bun run test:e2e -- dashboard` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/go.mod` — Go module initialization
- [ ] `backend/go.sum` — Dependency lock file
- [ ] `backend/platform/odoo/client_test.go` — JSON-RPC client unit tests
- [ ] `backend/internal/handler/employee_test.go` — Handler tests with mocked Odoo client
- [ ] `www/tests/unit/employee-table.test.tsx` — Table component tests
- [ ] `www/tests/unit/employee-form.test.tsx` — Form component tests
- [ ] `www/tests/e2e/dashboard.spec.ts` — Dashboard E2E tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Odoo Docker starts and accepts connections | EMP-01, EMP-02 | Infrastructure startup | Run `podman-compose up odoo odoo-postgres` and verify http://localhost:8069 responds |
| Employee table visual layout matches design | EMP-02 | Visual verification | Navigate to /dashboard/employees, verify table renders with correct columns and styling |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
