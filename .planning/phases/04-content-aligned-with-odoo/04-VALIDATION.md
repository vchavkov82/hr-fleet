---
phase: 4
slug: content-aligned-with-odoo
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x with jsdom |
| **Config file** | `www/vitest.config.ts` |
| **Quick run command** | `cd www && bun test` |
| **Full suite command** | `cd www && bun test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd www && bun test`
- **After every plan wave:** Run `make build-www`
- **Before `/gsd:verify-work`:** Full suite must be green + visual review of all updated pages
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | CONTENT-01 | smoke | `cd www && bun test -- --grep "homepage"` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | CONTENT-02 | smoke | `cd www && bun test -- --grep "features"` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | CONTENT-03 | smoke | `cd www && bun test -- --grep "pricing"` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | CONTENT-04 | unit | `cd www && bun test -- --grep "i18n"` | ✅ | ⬜ pending |
| 04-03-01 | 03 | 2 | CONTENT-05 | unit | `cd www && bun test -- --grep "blog"` | ❌ W0 | ⬜ pending |
| 04-04-01 | 04 | 2 | CONTENT-06 | unit | `cd www && bun test -- --grep "content-honesty"` | ❌ W0 | ⬜ pending |
| 04-XX-XX | all | all | CONTENT-07 | build | `make build-www` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Existing `i18n.test.ts` covers translation key parity — verify during planning
- [ ] Build verification via `make build-www` is the primary automated gate
- [ ] Content phases primarily validated through build success and visual review

*Content phases have limited unit test surface — build success + visual review are the primary validation methods.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Homepage looks correct without removed sections | CONTENT-01 | Visual layout | Load homepage in browser, verify no empty gaps or broken layout |
| Features page shows only real features | CONTENT-02 | Copy accuracy | Verify features page shows Employee Management as primary, roadmap section for coming soon |
| Pricing page shows single plan structure | CONTENT-03 | Copy accuracy | Verify pricing shows one plan with coming soon add-ons |
| Blog posts read well in Bulgarian | CONTENT-05 | Language quality | Read each blog post, check grammar and flow in Bulgarian |
| Help center articles are accurate | CONTENT-06 | Content accuracy | Follow step-by-step guides against actual dashboard features |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
