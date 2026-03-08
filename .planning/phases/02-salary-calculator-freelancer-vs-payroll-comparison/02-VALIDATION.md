---
phase: 02
slug: salary-calculator-freelancer-vs-payroll-comparison
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (unit) + Playwright with Firefox (E2E) |
| **Config file** | `www/vitest.config.ts` + `www/playwright.config.ts` |
| **Quick run command** | `cd www && bun run test` |
| **Full suite command** | `cd www && bun run test && bun run test:e2e -- --project=firefox` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd www && bun run test`
- **After every plan wave:** Run `cd www && bun run test && npx playwright test tests/e2e/calculators.spec.ts --project=firefox`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | CALC-02, CALC-03 | unit | `cd www && vitest run tests/unit/calculations.test.ts` | No — Wave 0 | ⬜ pending |
| 02-01-02 | 01 | 1 | CALC-04 | unit | `cd www && vitest run tests/unit/calculations.test.ts` | No — Wave 0 | ⬜ pending |
| 02-02-01 | 02 | 1 | CALC-01, CALC-05 | unit + e2e | `cd www && vitest run tests/unit/freelancer-comparison.test.tsx` | No — Wave 0 | ⬜ pending |
| 02-02-02 | 02 | 1 | CALC-06 | unit + e2e | `cd www && vitest run tests/unit/freelancer-comparison.test.tsx` | No — Wave 0 | ⬜ pending |
| 02-02-03 | 02 | 1 | CALC-07 | e2e | `cd www && npx playwright test tests/e2e/calculators.spec.ts` | Partially | ⬜ pending |
| 02-03-01 | 03 | 2 | CALC-08 | e2e | `cd www && npx playwright test tests/e2e/basic.spec.ts` | Partially | ⬜ pending |
| 02-03-02 | 03 | 2 | CALC-09 | e2e | `cd www && npx playwright test tests/e2e/calculators.spec.ts` | Partially | ⬜ pending |
| 02-04-01 | 04 | 2 | CALC-10 | manual | N/A | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `www/tests/unit/calculations.test.ts` — pure function tests for `computeEoodNet()`, `computeNetFromGross()`, `computeSavings()`
- [ ] `www/tests/unit/freelancer-comparison.test.tsx` — component render tests for FreelancerComparison
- [ ] E2E tests in `www/tests/e2e/calculators.spec.ts` — add `Freelancer Comparison` describe block stubs

*Existing infrastructure covers framework setup (Vitest + Playwright already configured).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mobile-responsive design | CALC-10 | Visual inspection of stacked columns, sticky CTA, readable text | Resize browser to 375px width, verify columns stack, savings banner visible, CTA sticky at bottom |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
