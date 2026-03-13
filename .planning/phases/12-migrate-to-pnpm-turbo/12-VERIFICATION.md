---
phase: 12-migrate-to-pnpm-turbo
verified: 2026-03-13T23:26:18Z
status: gaps_found
score: 5/8 must-haves verified
gaps:
  - truth: "No file in the repository references bun as a package manager or runtime"
    status: failed
    reason: "bun.lock files tracked in git for apps/web, apps/blog, and apps/docs. These are per-workspace lockfiles that conflict with the root pnpm-lock.yaml and signal bun was used as the package manager in those directories."
    artifacts:
      - path: "apps/web/bun.lock"
        issue: "bun.lock tracked in git — should be deleted"
      - path: "apps/blog/bun.lock"
        issue: "bun.lock tracked in git — should be deleted"
      - path: "apps/docs/bun.lock"
        issue: "bun.lock tracked in git — should be deleted"
    missing:
      - "Delete apps/web/bun.lock, apps/blog/bun.lock, apps/docs/bun.lock from git (git rm)"
      - "Add bun.lock to root .gitignore to prevent recurrence"
  - truth: "Documentation only references pnpm for package management"
    status: partial
    reason: "apps/blog/README.md (line 111-112) includes a 'bun create astro' scaffolding command in a multi-package-manager comparison block. This is boilerplate from the upstream AstroPaper template, not an active workflow recommendation."
    artifacts:
      - path: "apps/blog/README.md"
        issue: "Lines 111-112 show 'bun create astro@latest' in scaffolding examples alongside npm/yarn/pnpm"
    missing:
      - "Remove the bun scaffolding block from apps/blog/README.md (lines 111-112), or annotate that pnpm is the project standard"
---

# Phase 12: Migrate to pnpm + Turbo Verification Report

**Phase Goal:** Remove all bun artifacts and references from the codebase, replacing with pnpm equivalents. Update container images, scripts, and documentation to consistently use pnpm as the sole package manager.
**Verified:** 2026-03-13T23:26:18Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | No file in the repository references bun as a package manager or runtime | PARTIAL | bun.lock files in apps/web, apps/blog, apps/docs are tracked in git; blog README has bun scaffolding example |
| 2 | Container images use node:20-alpine instead of oven/bun:1-alpine | VERIFIED | deploy/podman-compose.yml lines 55, 67, 77 all show `image: node:20-alpine` |
| 3 | All dev scripts use pnpm commands | VERIFIED | Makefile lines 82, 85, 88, 121-127, 153 all use pnpm |
| 4 | Docker entrypoint uses pnpm install and pnpm dev | VERIFIED | apps/web/docker-entrypoint.sh uses `pnpm install` and `exec pnpm dev` |
| 5 | Playwright e2e devServer uses pnpm dev | VERIFIED | Playwright config line 29: `command: 'pnpm dev'` |
| 6 | Documentation only references pnpm for package management | PARTIAL | apps/blog/README.md lines 111-112 include a `bun create astro` scaffolding snippet from upstream AstroPaper template |
| 7 | Developer onboarding docs use pnpm commands | VERIFIED | CLAUDE.md project file uses pnpm only; apps/blog/CLAUDE.md uses pnpm only; no bun commands in onboarding material |
| 8 | Agent configuration files use pnpm commands | VERIFIED | .claude/agents/* files contain no bun references |

**Score:** 5/8 truths fully verified (2 partial failures)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `deploy/podman-compose.yml` | node:20-alpine images | VERIFIED | All 3 frontend services (hr, hr-blog, hr-docs) use `node:20-alpine` |
| `apps/web/docker-entrypoint.sh` | pnpm install + pnpm dev | VERIFIED | Both commands present and correct |
| `pnpm-lock.yaml` (root) | Root pnpm lockfile | VERIFIED | 441KB lockfile exists at repo root |
| `package.json` (root) | packageManager: pnpm@9.0.0 | VERIFIED | Field confirmed |
| `apps/web/bun.lock` | Should not exist | FAILED | File tracked in git |
| `apps/blog/bun.lock` | Should not exist | FAILED | File tracked in git |
| `apps/docs/bun.lock` | Should not exist | FAILED | File tracked in git |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| docker-entrypoint.sh | pnpm dev | exec pnpm dev | WIRED | Direct command execution |
| podman-compose.override.yml (hr-blog) | pnpm | `npm i -g pnpm && pnpm install` | WIRED | Installs pnpm into node:20-alpine at runtime |
| podman-compose.override.yml (hr-docs) | pnpm | `npm i -g pnpm && pnpm install` | WIRED | Installs pnpm into node:20-alpine at runtime |
| Playwright config | pnpm dev | command: 'pnpm dev' | WIRED | devServer command confirmed |
| Makefile | pnpm | all dev/test targets | WIRED | All 7 relevant targets use pnpm |

### Requirements Coverage

No requirements frontmatter found in phase plans. Coverage assessed from must-haves directly.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `apps/web/bun.lock` | — | bun lockfile tracked in git | Blocker | Contradicts pnpm-only mandate; confuses tooling |
| `apps/blog/bun.lock` | — | bun lockfile tracked in git | Blocker | Same as above |
| `apps/docs/bun.lock` | — | bun lockfile tracked in git | Blocker | Same as above |
| `apps/blog/README.md` | 111-112 | `bun create astro` example | Warning | Developer may use bun; contradicts project standard |
| `.planning/codebase/TESTING.md` | 22-24 | `bun test` commands | Info | References an `admin/` directory not in this repo; likely copied from a different project — not actionable |
| `.planning/codebase/INTEGRATIONS.md` | 334 | `bun outdated` | Info | Same planning artifact issue as above |

### Human Verification Required

None required — all checks are programmatically verifiable.

### Gaps Summary

Two concrete gaps block full goal achievement:

**Gap 1 — bun.lock files in git (Blocker).** Three per-app bun.lock files (`apps/web/bun.lock`, `apps/blog/bun.lock`, `apps/docs/bun.lock`) are tracked in the repository. These are direct artifacts of bun being used as the package manager in individual app directories. Their presence contradicts the pnpm-only mandate and will cause confusion for any developer or CI system. Fix: `git rm apps/web/bun.lock apps/blog/bun.lock apps/docs/bun.lock` and add `**/bun.lock` to root `.gitignore`.

**Gap 2 — blog README scaffolding snippet (Warning).** `apps/blog/README.md` lines 111-112 show a `bun create astro` command in a multi-package-manager comparison block inherited from the upstream AstroPaper template. While the active workflow instructions in the same file use pnpm, the presence of bun as a listed option conflicts with the project standard. Fix: remove the bun block or add a note directing developers to use pnpm.

The .planning/codebase/ bun references (TESTING.md, INTEGRATIONS.md) reference a non-existent `admin/` directory and appear to be carryover from a different project. These do not affect the active codebase but should be cleaned up in a separate housekeeping task.

---

_Verified: 2026-03-13T23:26:18Z_
_Verifier: Claude (gsd-verifier)_
