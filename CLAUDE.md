# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product

HR SaaS platform — monorepo with frontend apps, a Go REST API backend, shared packages, and container-based infrastructure.

## Architecture

**Monorepo** managed with pnpm workspaces + Turborepo. Container orchestration via Podman Compose.

### Workspace layout

- `apps/web` — Main HR site (`@hr/www`), Next.js, port 5010
- `apps/blog` — HR blog (`@hr/blog`), Astro 5, port 5013
- `apps/docs` — HR docs (`@hr/docs`), Astro 5 Starlight, port 5011
- `apps/admin` — Admin panel (`@hr/admin`), not yet implemented
- `packages/design-system` — Shared design tokens and components (`@hr/design-system`)
- `services/api` — Go REST API backend, port 5080 (Chi router, sqlc, Asynq workers)
- `services/worker` — Background worker service
- `agents/` — AI agent definitions (uses `@an-sdk/agent`)
- `deploy/` — Podman Compose files, Caddyfile, Odoo config

### Infrastructure (Podman Compose)

Caddy reverse proxy → Go API, Next.js, Astro blog, Astro docs. Backend depends on PostgreSQL, Redis, and Odoo.

- `deploy/podman-compose.yml` + `deploy/podman-compose.override.yml`
- Caddy routes subdomains: `hr.localhost`, `blog.hr.localhost`, `docs.localhost`

### Go API (`services/api/`)

- Router: Chi with middleware (JWT RS256 auth, API key auth, RBAC)
- Database: PostgreSQL via sqlc-generated queries
- Workers: Asynq (Redis-backed async task processing)
- Docs: Swagger/OpenAPI via swag annotations
- Build: `make api` (server), `make worker` (worker binary)

## Commands

```bash
# Root-level (most common)
make dev              # Start infra + all frontend dev servers
make dev-www          # HR site only (port 5010)
make dev-blog         # Blog only (port 5013)
make dev-docs         # Docs only (port 5011)
make dev-backend      # Go API (port 5080)
make build            # Build www + blog via turbo
make build-all        # Build www + blog + docs
make check            # typecheck + lint in parallel
make test             # Unit tests (apps/web vitest)
make test-watch       # Vitest watch mode
make test-e2e         # Playwright e2e (needs running dev server)
make test-backend     # Go tests: go test ./...
make lint             # Lint all workspaces
make typecheck        # Type-check all workspaces

# Go API (from services/api/)
make api              # Build server binary
make worker           # Build worker binary
make dev              # Run server in both mode (API + worker)
make swagger          # Regenerate OpenAPI spec
make sqlc             # Regenerate sqlc queries
make test             # Go tests with -short -count=1
make test-race        # Go tests with race detector
make lint             # golangci-lint

# Infrastructure
make up / down / restart / logs / ps
make infra            # Start infra only
make clean-all        # Remove containers + volumes (deletes data)
make nuke             # Full reset: containers + volumes + node_modules + caches
make bootstrap        # Fresh setup from scratch
```

## Tech Stack Details

- **Package manager**: pnpm (v9). Never use npm/yarn/bun.
- **Build orchestrator**: Turborepo with `--cache-workers=4`
- **Node**: >=20
- **React**: 19 (enforced via overrides)
- **Testing**: Vitest (unit), Playwright (e2e, firefox project)
- **Linting**: ESLint + Prettier, enforced via husky + lint-staged pre-commit hooks
- **Containers**: Podman (not Docker), accessed via `podman-compose`

## Docs App Conventions (`apps/docs/`)

- Content in `src/content/docs/` as `.mdx` or `.mdoc` files
- Frontmatter must include `title` and `description`
- Starlight auto-generates `h1` from title — start content at `h2`
- Use `:::note` / `:::caution` / `:::tip` for asides

## Decision Documentation

When making non-obvious architectural, tooling, or design decisions, document them as a brief ADR (Architecture Decision Record) in the relevant code or commit message. Include: what was decided, why, and what alternatives were considered. This applies to choices like library selection, schema design, API contract changes, and infrastructure tradeoffs.

## Review Protocol

After modifying documentation pages, invoke these skills before committing:
- `frontend-design` — check custom components, theme consistency
- `seo-audit` — verify frontmatter, heading hierarchy, sitemap, cross-links
- `schema-markup` — add `TechArticle` or `HowTo` JSON-LD as appropriate
