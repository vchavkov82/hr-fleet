# Phase 5: Foundation & Monorepo Setup - Research

**Researched:** 2026-03-13
**Domain:** Monorepo (pnpm + Turborepo), GitHub Actions CI/CD, Design Tokens, Go project scaffold (Chi + sqlc + pgx)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Monorepo structure**
- pnpm workspaces + Turborepo for orchestration and caching
- Existing www/ marketing site moves into apps/web (direct relocation, not fresh project)
- Go services live inside the monorepo with separate go.mod per service (services/api/go.mod, services/worker/go.mod)

**CI/CD pipeline design**
- GitHub Actions as CI/CD platform
- Docker Compose on VPS for deployment (NOT Kubernetes — simplifies infrastructure significantly)
- Two environments only: Dev + Production (no staging)
- Full pipeline gates: lint, unit, integration, and E2E tests must all pass before deploy

**Design system tokens**
- Figma Variables as source of truth, exported via plugin (e.g., Tokens Studio)
- Dual consumption: CSS custom properties as foundation, Tailwind theme references them
- Dark mode support across both marketing site and admin UI

**Go project scaffold**
- Chi router (stdlib-compatible, consistent with Phase 3 patterns)
- sqlc + pgx for database access (type-safe SQL, no ORM)

### Claude's Discretion

- Exact workspace layout (apps/, services/, packages/ split)
- Whether admin shares tokens with marketing or gets separate theme
- Go project layout (flat with internal/ vs domain-driven packages)
- Go config management approach

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

## Summary

The repo already has a partial monorepo structure in place: pnpm workspaces (`pnpm-workspace.yaml`), Turborepo (`turbo.json`), and a `packages/design-system` package with color/typography tokens. The existing workspace config only lists `www`, `blog`, `docs`, and `packages/design-system` — it does not include `services/` or an `apps/` directory. The Go backend (`backend/`) lives alongside the JS apps but is not yet a Turborepo workspace member.

The primary work is: (1) reorganize workspace layout to standard `apps/`, `services/`, `packages/` split; (2) migrate `www/` to `apps/web/` and `backend/` to `services/api/`; (3) add the Go services as pnpm workspace members with thin `package.json` wrappers so Turborepo can orchestrate them; (4) write GitHub Actions workflows; (5) extend the design token system to export CSS custom properties alongside Tailwind config; (6) scaffold `services/worker` and add `sqlc` + `pgx` to `services/api`.

**Primary recommendation:** Reorganize to standard `apps/*/services/*/packages/*` layout, wrap Go services with thin package.json files, extend existing turbo.json task graph to include Go build/test, and write CI workflows using Turborepo's `--affected` flag for performance.

---

## Current Codebase State (Critical Context)

The codebase at `/home/vchavkov/src/hr` already has:

```
hr/
├── www/                    → Next.js 15.2 marketing site (moves to apps/web/)
├── blog/                   → Astro blog (moves to apps/blog/)
├── docs/                   → Astro Starlight docs (moves to apps/docs/)
├── backend/                → Go 1.25 API service (moves to services/api/)
├── packages/
│   └── design-system/      → Tailwind tokens, color/typography (stays, extended)
├── deploy/
│   └── podman-compose.yml  → Docker Compose deployment config (stays)
├── pnpm-workspace.yaml     → Currently lists www, blog, docs, packages/design-system
├── turbo.json              → Has build/lint/typecheck/test/dev tasks
└── package.json            → Root with turbo@2.8.12, pnpm@9.0.0
```

**No `.github/workflows/` directory exists yet** — CI/CD is built from scratch.

**Existing Go module path:** `github.com/vchavkov/hr-backend` (will change to `github.com/vchavkov/hr/services/api` in new layout).

**Existing Go deps:** chi v5.2.5, chi/cors, chi/jwtauth v5, jwx v2, redis/go-redis v9, miniredis (test). No pgx or sqlc yet.

---

## Standard Stack

### Core (Locked)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pnpm workspaces | 9.0.0 (already installed) | JS monorepo package management | Already in use; disk-efficient, strict mode |
| Turborepo | 2.8.12 (already installed) | Task orchestration, caching | Already in use; `--affected` reduces CI time |
| chi router | v5.2.5 (already in go.mod) | Go HTTP router | Phase 3 established pattern |
| sqlc | v1.x (latest) | Type-safe SQL codegen from SQL files | No ORM, pgx/v5 compatible |
| pgx/v5 | v5.x | PostgreSQL driver | sqlc native target, high-performance |
| GitHub Actions | - | CI/CD | Locked decision |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pnpm catalogs | pnpm 9+ | Centralized dep version management | Single source of truth for shared deps like React, TS |
| turbo `--affected` | Turborepo 2.x | Only run tasks for changed packages | All CI runs |
| golangci-lint | latest | Go linting | Already in backend Makefile |
| Tokens Studio (Figma plugin) | - | Export Figma Variables to JSON | Figma → JSON → CSS vars + Tailwind |
| Docker Compose (podman-compatible) | v3 | Container orchestration on VPS | Already in deploy/ |

### Alternatives Considered (Locked — Not Exploring)
| Instead of | Could Use | Why We Use Standard |
|------------|-----------|---------------------|
| Turborepo | Nx | Already set up |
| sqlc + pgx | GORM, sqlx | User decision: type-safe, no ORM |
| Chi | Fiber | Phase 3 established Chi |
| GitHub Actions | CircleCI, GitLab CI | User decision |

---

## Architecture Patterns

### Recommended Project Structure (Claude's Discretion Applied)

```
hr/
├── apps/
│   ├── web/               # Next.js marketing site (from www/)
│   ├── blog/              # Astro blog (from blog/)
│   └── docs/              # Astro Starlight docs (from docs/)
├── services/
│   ├── api/               # Go API service (from backend/)
│   │   ├── go.mod         # module github.com/vchavkov/hr/services/api
│   │   ├── cmd/server/
│   │   ├── internal/
│   │   │   ├── handler/
│   │   │   ├── service/
│   │   │   ├── middleware/
│   │   │   ├── cache/
│   │   │   └── config/
│   │   ├── platform/
│   │   │   └── odoo/      # Existing JSON-RPC client
│   │   ├── db/            # sqlc generated code (NEW)
│   │   ├── sqlc.yaml      # sqlc config (NEW)
│   │   ├── migrations/    # SQL migrations (NEW)
│   │   ├── package.json   # Thin wrapper for Turborepo (NEW)
│   │   └── Dockerfile
│   └── worker/            # Background job processor (NEW scaffold)
│       ├── go.mod         # module github.com/vchavkov/hr/services/worker
│       ├── cmd/worker/
│       ├── internal/
│       └── package.json   # Thin wrapper for Turborepo
├── packages/
│   └── design-system/     # Existing — extended with CSS custom properties
│       ├── tokens/
│       │   ├── colors.ts
│       │   ├── typography.ts
│       │   └── css-vars.ts  # NEW: exports CSS custom property strings
│       ├── components/
│       └── tailwind.config.ts
├── deploy/
│   └── podman-compose.yml  # Updated service paths
├── .github/
│   └── workflows/
│       ├── ci.yml          # Test + lint on PR
│       ├── deploy-prod.yml # Deploy on main push
│       └── security.yml    # Dependency + secret scanning
├── pnpm-workspace.yaml    # Updated to include apps/*, services/*, packages/*
├── turbo.json             # Updated task graph including Go tasks
└── package.json
```

**Rationale for layout:**
- `apps/` for deployable user-facing apps (JS ecosystem convention, standard Turborepo)
- `services/` for backend Go services (separates backend concerns from frontend)
- Go services wrapped in `package.json` so Turborepo can call `go build`, `go test`, `golangci-lint`
- `services/worker` scaffolded empty but present from day one (avoids future restructure)

### Pattern 1: Go Service as Turborepo Workspace Member

Turborepo supports non-JavaScript projects by wrapping them in a `package.json`. Turborepo executes the `scripts` entries — it doesn't care that the scripts invoke `go build` instead of `npm run build`.

```json
// services/api/package.json
{
  "name": "@hr/api",
  "private": true,
  "scripts": {
    "build": "go build -o bin/server ./cmd/server",
    "test": "go test ./...",
    "lint": "golangci-lint run ./...",
    "dev": "go run ./cmd/server"
  }
}
```

```yaml
# pnpm-workspace.yaml (updated)
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
```

Source: https://turbo.build/repo/docs/guides/multi-language — verified HIGH confidence.

### Pattern 2: sqlc Configuration for pgx/v5

```yaml
# services/api/sqlc.yaml
version: "2"
sql:
  - engine: "postgresql"
    queries: "internal/db/queries/"
    schema: "migrations/"
    gen:
      go:
        package: "db"
        out: "internal/db"
        sql_package: "pgx/v5"
```

Source: https://docs.sqlc.dev/en/latest — verified HIGH confidence.

### Pattern 3: Design Tokens — CSS Custom Properties + Tailwind Dual Consumption

Current state: `packages/design-system` only exports Tailwind config. Needs CSS custom property output.

**Approach (Claude's discretion — shared tokens, dark mode via CSS vars):**

```typescript
// packages/design-system/tokens/css-vars.ts
// Generates CSS custom properties string from token values
export const cssVarsLight = `
  --color-primary: #1B4DDB;
  --color-primary-light: #3B6EF0;
  --color-navy: #0F172A;
  /* ... */
`
export const cssVarsDark = `
  --color-primary: #3B6EF0;
  /* adjusted for dark mode */
`
```

```typescript
// tailwind.config.ts — reference CSS vars
colors: {
  primary: {
    DEFAULT: 'var(--color-primary)',
    light: 'var(--color-primary-light)',
  }
}
```

**Token Studio export format (Figma Variables → JSON):**
Tokens Studio exports to `tokens.json` in Style Dictionary format. Consume via `style-dictionary` or manual script to generate CSS custom property files. Both marketing (apps/web) and admin UI consume from `@hr/design-system`.

**Admin UI shares tokens with marketing** — same CSS custom property layer, potentially different color scale values for dark/light mode. One design system package, one source of truth. Admin-specific component overrides can live in `packages/design-system/components/admin/`.

### Pattern 4: GitHub Actions CI with Turborepo Caching

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    env:
      TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
      TURBO_TEAM: ${{ vars.TURBO_TEAM }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - uses: actions/setup-go@v5
        with:
          go-version: '1.25'
          cache-dependency-path: services/api/go.sum
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run lint --affected
      - run: pnpm turbo run typecheck --affected
      - run: pnpm turbo run test --affected
      - run: pnpm turbo run build --affected
```

Source: https://turbo.build/repo/docs/guides/ci-vendors/github-actions — verified HIGH confidence.

### Pattern 5: Go Config Management (Claude's Discretion)

Keep the existing pattern: stdlib `os.Getenv` with `Load()` function. It's simple, already working, and appropriate for a small team. Do NOT introduce `viper` or similar — it's over-engineering for 6-8 env vars.

```go
// Existing pattern in backend/internal/config/config.go — keep as-is
// Extend with DATABASE_URL when pgx is added
```

### Pattern 6: Go Internal Layout (Claude's Discretion)

Use the existing flat-with-`internal/` layout (already established in backend/). Do NOT switch to DDD with bounded contexts — premature for this phase.

```
services/api/
├── cmd/server/main.go       # Entry point
├── internal/
│   ├── handler/             # HTTP handlers (Chi routes)
│   ├── service/             # Business logic
│   ├── middleware/          # Chi middleware
│   ├── cache/               # Redis
│   ├── config/              # os.Getenv config
│   └── db/                  # sqlc generated (new)
├── platform/
│   └── odoo/                # JSON-RPC client (existing, preserve)
├── migrations/              # .sql migration files (new)
└── sqlc.yaml                # sqlc config (new)
```

### Anti-Patterns to Avoid

- **Mixing apps/ and services/ in the same directory:** Keep JS apps under `apps/`, Go services under `services/`. Don't put Go code in `apps/`.
- **Single go.mod at root:** User decided separate go.mod per service. Don't consolidate.
- **Storing Go binaries in git:** The `bin/` output dir must be in `.gitignore`.
- **Running all tests on every PR:** Use `turbo run test --affected` — only test packages that changed.
- **Hardcoding Turbo remote cache:** TURBO_TOKEN is optional; CI works without it (just slower). Don't block CI setup on Vercel account creation.
- **Design tokens as raw hex values in Tailwind:** Use CSS custom properties as the canonical layer; Tailwind references vars. This enables runtime dark mode without JS class toggling on each property.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SQL query type safety | Custom query builder | sqlc + pgx/v5 | Edge cases around nullability, array types, custom pg types |
| Design token export pipeline | Custom Figma API integration | Tokens Studio Figma plugin | Token Studio handles Figma Variables sync, JSON export, and Style Dictionary integration |
| Remote build caching | Custom artifact store | Turborepo remote cache (Vercel or self-hosted) | Cache invalidation is complex; Turborepo's content-hash approach is proven |
| Go workspace dependency tracking | Manual Makefile ordering | Turborepo `dependsOn` with package.json wrappers | Gets complex across 2+ services |

**Key insight:** sqlc generates the entire DB layer from SQL files — never write `db.QueryRow(...)` boilerplate manually.

---

## Common Pitfalls

### Pitfall 1: Moving www/ to apps/web/ Breaks Relative Imports
**What goes wrong:** The existing `packages/design-system/tailwind.config.ts` has hardcoded content paths: `../../www/src/**/*.{js,ts,jsx,tsx,mdx}`. After relocation to `apps/web/`, these paths break silently (Tailwind just stops purging).
**Why it happens:** Relative paths were written for old layout.
**How to avoid:** Update content paths in `packages/design-system/tailwind.config.ts` after relocation.
**Warning signs:** CSS bundle grows unexpectedly after migration (unused classes not purged).

### Pitfall 2: Go Module Path After Relocation
**What goes wrong:** `backend/` has `module github.com/vchavkov/hr-backend`. After moving to `services/api/`, all internal imports break if go.mod isn't updated.
**Why it happens:** Go imports are absolute module paths, not relative file paths.
**How to avoid:** Update go.mod to `module github.com/vchavkov/hr/services/api`, then do a global find-replace of the import path across all `.go` files in the service.
**Warning signs:** `go build` fails with "cannot find module" after relocation.

### Pitfall 3: pnpm install Fails for Go Services
**What goes wrong:** Adding `services/*` to pnpm-workspace.yaml causes `pnpm install` to try managing the Go service's `package.json`, which may have no `node_modules` needs. If the `package.json` is malformed or missing fields, pnpm warns or errors.
**Why it happens:** pnpm workspace discovery runs `pnpm install` across all workspace members.
**How to avoid:** Ensure Go service `package.json` files are valid JSON with `"private": true` and no JS dependencies.

### Pitfall 4: Turborepo Cache Miss on Go Outputs
**What goes wrong:** `turbo run build` for the Go service always re-runs because `outputs` in turbo.json doesn't include the Go binary path.
**Why it happens:** Turborepo caches based on declared `outputs`. If `bin/server` isn't listed, the cache is never warm.
**How to avoid:** Add `"outputs": ["bin/**"]` to the Go service's build task in turbo.json.

### Pitfall 5: GitHub Actions Go Cache Without go.sum
**What goes wrong:** `actions/setup-go` cache-dependency-path points to a go.sum that doesn't exist yet or is in the wrong location after migration.
**How to avoid:** Verify Go cache path is `services/api/go.sum` after relocation.

### Pitfall 6: CSS Custom Properties with Tailwind JIT
**What goes wrong:** Tailwind v4 (if upgrading) handles CSS vars differently than v3. The existing stack uses Tailwind v4 (`tailwindcss: ^4.1.18` in design-system).
**Why it matters:** Tailwind v4 uses a CSS-first config approach and may handle `var()` references differently in its JIT engine.
**How to avoid:** Test CSS variable references in Tailwind v4 config context before assuming v3 patterns work.

---

## Code Examples

### turbo.json with Go service tasks

```json
// Source: https://turbo.build/repo/docs/guides/multi-language
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", ".astro/**", "bin/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": { "outputs": [], "cache": true },
    "typecheck": { "outputs": ["*.tsbuildinfo"], "cache": true },
    "dev": { "cache": false, "persistent": true }
  }
}
```

### pnpm-workspace.yaml (updated)

```yaml
# Source: pnpm.io docs — verified
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"

catalog:
  react: ^19.0.0
  typescript: ^5.0.0
```

### sqlc.yaml for services/api

```yaml
# Source: https://docs.sqlc.dev/en/latest
version: "2"
sql:
  - engine: "postgresql"
    queries: "internal/db/queries/"
    schema: "migrations/"
    gen:
      go:
        package: "db"
        out: "internal/db"
        sql_package: "pgx/v5"
```

### services/api/package.json (thin wrapper)

```json
{
  "name": "@hr/api",
  "private": true,
  "scripts": {
    "build": "go build -o bin/server ./cmd/server",
    "test": "go test ./...",
    "lint": "golangci-lint run ./...",
    "dev": "go run ./cmd/server"
  }
}
```

### Deploy workflow (Docker Compose on VPS)

```yaml
# .github/workflows/deploy-prod.yml
name: Deploy Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: [ci]  # requires CI job to pass first
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/hr
            git pull origin main
            docker compose -f deploy/podman-compose.yml pull
            docker compose -f deploy/podman-compose.yml up -d --build
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Separate go.mod per app, manual Makefile | Turborepo wraps Go with package.json | Unified task graph, caching across JS+Go |
| Raw hex values in Tailwind config | CSS custom properties + Tailwind references vars | Dark mode, runtime theming, Figma sync |
| Manual SQL queries (sqlx/database/sql) | sqlc generates type-safe code | Eliminates query boilerplate, null handling |
| pnpm workspaces without catalogs | pnpm catalogs for dep versioning | Single version source of truth across all packages |

**Deprecated/outdated:**
- `lerna`: Replaced by Turborepo for JS monorepos
- `yarn workspaces` + `yarn berry`: pnpm is faster and disk-efficient; project already uses pnpm
- GORM: Phase 3 decision was sqlc + pgx; no ORM

---

## Open Questions

1. **Odoo 17 vs 18 provisioning (FND-05)**
   - What we know: Current deploy/podman-compose.yml uses `odoo:18.0`. Phase 3 built a custom JSON-RPC client for Odoo 18 field compatibility.
   - What's unclear: Requirement says "Odoo 17 provisioning" but codebase uses Odoo 18. Decision pending per requirements.
   - Recommendation: Confirm whether FND-05 means Odoo 17 or 18. Given Phase 3 already established Odoo 18 compatibility, assume 18 unless explicitly changed.

2. **Turborepo Remote Cache setup**
   - What we know: Turborepo remote cache requires TURBO_TOKEN (Vercel account or self-hosted).
   - What's unclear: Whether a Vercel account exists or if self-hosted cache (e.g., `ducktape` or `turborepo-remote-cache` OSS) is preferred.
   - Recommendation: Design CI to work without remote cache initially (just slower). Add remote cache as optional enhancement.

3. **Figma Variables export timing**
   - What we know: Tokens Studio is the standard plugin for exporting Figma Variables.
   - What's unclear: Whether a Figma file with Variables already exists or needs to be created.
   - Recommendation: The planning phase should include a task to create Figma Variables from existing `packages/design-system/tokens/colors.ts` values as source, then establish the export pipeline. Don't block on Figma-first if no design file exists yet.

4. **apps/admin location**
   - What we know: FND-01 mentions `apps/admin` in the required structure.
   - What's unclear: Phase 5 scope says scaffold only, but admin UI is built in later phases. Should apps/admin be an empty scaffold in this phase?
   - Recommendation: Create `apps/admin/` with minimal Next.js 15 scaffold + package.json so the workspace structure is complete. Full implementation deferred.

---

## Sources

### Primary (HIGH confidence)
- `/vercel/turborepo` (Context7) — multi-language support, CI patterns, pnpm workspace config, task configuration
- `/websites/sqlc_dev_en` (Context7) — sqlc configuration, pgx/v5 integration
- `/pnpm/pnpm.io` (Context7) — workspace configuration, catalog protocol
- Direct codebase inspection: `/home/vchavkov/src/hr/` — current structure, existing configs, Go module setup

### Secondary (MEDIUM confidence)
- Turborepo official docs (https://turbo.build/repo/docs/guides/multi-language) — Go-in-monorepo pattern
- sqlc official docs (https://docs.sqlc.dev) — pgx/v5 configuration

### Tertiary (LOW confidence)
- Tokens Studio / Style Dictionary integration — not verified against official Tokens Studio docs; verify export format before committing to pipeline design

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tools already in use or verified via Context7
- Architecture: HIGH — standard Turborepo patterns + existing codebase inventory
- Go patterns: HIGH — existing codebase establishes patterns; sqlc verified via Context7
- Design tokens: MEDIUM — CSS custom properties pattern is standard, Tokens Studio export format not directly verified
- Pitfalls: HIGH — derived from direct codebase inspection (hardcoded paths, module path changes)

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable tooling; Turborepo releases frequently but patterns stable)
