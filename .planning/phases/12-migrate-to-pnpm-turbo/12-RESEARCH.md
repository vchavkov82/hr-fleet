# Phase 12: Migrate to pnpm+turbo - Research

**Researched:** 2026-03-13
**Domain:** Package manager migration, monorepo tooling cleanup
**Confidence:** HIGH

## Summary

Phase 5 already established pnpm workspaces + Turborepo as the monorepo foundation. The root `package.json` declares `"packageManager": "pnpm@9.0.0"`, CI uses pnpm exclusively, and turbo.json is properly configured. However, significant bun artifacts remain throughout the codebase: `bun.lock`, `bunfig.toml`, container images using `oven/bun:1-alpine`, dev scripts referencing `bun`, and documentation recommending bun.

This phase is a **cleanup and optimization** phase, not a greenfield migration. The work is straightforward: remove all bun references, replace container base images with Node.js, update documentation, and optimize pnpm/turbo configuration (catalogs, stricter hoisting, remote caching).

**Primary recommendation:** Systematically replace every bun reference with pnpm equivalents, delete bun artifacts, and add pnpm catalog for shared dependency versions.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pnpm | 9.x | Package manager | Already declared in packageManager field |
| turbo | ^2.8.12 | Task runner / build orchestrator | Already installed and configured |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| node | >=20 | Runtime for containers | Replace oven/bun images |
| serve | latest | Static file serving in containers | Replace bunx serve |

## Architecture Patterns

### Bun Artifact Inventory (Complete)

Every location needing changes, organized by category:

#### 1. Lockfile and Config
| File | Issue | Action |
|------|-------|--------|
| `bun.lock` | Stale lockfile | Delete |
| `bunfig.toml` | Bun runtime config | Delete |

#### 2. Container Images (deploy/)
| File | Line | Issue | Action |
|------|------|-------|--------|
| `deploy/podman-compose.yml:55` | `image: oven/bun:1-alpine` (hr) | Bun base image | Change to `node:20-alpine` |
| `deploy/podman-compose.yml:67` | `image: oven/bun:1-alpine` (hr-blog) | Bun base image | Change to `node:20-alpine` |
| `deploy/podman-compose.yml:77` | `image: oven/bun:1-alpine` (hr-docs) | Bun base image | Change to `node:20-alpine` |
| `deploy/podman-compose.override.yml:36` | `bun install && bun run build && bunx serve` | Bun commands | Use `pnpm install && pnpm build && npx serve` |
| `deploy/podman-compose.override.yml:44` | `bun install && cd apps/docs && bun dev` | Bun commands | Use `pnpm install && cd apps/docs && pnpm dev` |

#### 3. Scripts and Makefile
| File | Lines | Issue | Action |
|------|-------|-------|--------|
| `Makefile:82,85,88` | `bun dev` in dev targets | Bun as runner | Change to `pnpm dev` |
| `Makefile:121,124,127` | `bun run test` in test targets | Bun as runner | Change to `pnpm run test` |
| `scripts/dev-apps.sh:49,52,55` | `bun dev` for all apps | Bun as runner | Change to `pnpm dev` |
| `apps/web/package.json:19` | `"test:all": "bun run test"` | Bun reference in script | Change to `pnpm run test` |

#### 4. Documentation
| File | Issue | Action |
|------|-------|--------|
| `CLAUDE.md:54-56` | Commands section shows `bun dev/build/preview` | Update to `pnpm dev/build/preview` |
| `DEVELOPER.md:44,60,284-286,382,453,461,486` | Multiple bun references | Rewrite all to reference pnpm |

### pnpm Catalog (Optimization)

pnpm 9 supports `catalogs` in `pnpm-workspace.yaml` for shared dependency versions across workspaces. This avoids version drift.

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"

catalog:
  react: "^19.0.0"
  react-dom: "^19.0.0"
  typescript: "^5.7.0"
```

Then in app package.json files: `"react": "catalog:"` instead of hardcoded versions.

**Note:** The root `package.json` already has `overrides` for react/react-dom, which partially serves this purpose. Catalogs are the pnpm-native approach and more explicit.

### Turbo Remote Caching

turbo.json already has `TURBO_TOKEN` and `TURBO_TEAM` in globalEnv, and CI passes these as secrets. Verify remote caching is actually working or set up Vercel remote cache / self-hosted cache.

### Container Image Strategy

The current containers use `oven/bun:1-alpine` as a runtime to serve pre-built static assets. The replacement should be `node:20-alpine` with either:
- `npx serve` for static serving (blog, docs are Astro static output)
- `node server.js` / `next start` for the Next.js app (hr-www)

The hr-www container already has a `docker-entrypoint.sh` so it may already handle this differently. The blog and docs containers just need `npx serve` instead of `bunx serve`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Shared versions | Manual version sync | pnpm catalogs | Automatic version alignment |
| Build caching | Custom cache scripts | turbo cache (already set up) | Handles invalidation automatically |
| Static file serving | Custom server | `serve` npm package | Battle-tested, zero config |

## Common Pitfalls

### Pitfall 1: Missing pnpm in container images
**What goes wrong:** `node:20-alpine` doesn't include pnpm by default.
**How to avoid:** Use `corepack enable && corepack prepare pnpm@9.0.0 --activate` in container entrypoint, or install via `npm i -g pnpm@9`.

### Pitfall 2: Deploy script still uses docker compose without rebuild
**What goes wrong:** `deploy-prod.yml` runs `docker compose up -d --build` which will fail if images reference bun but bun is removed.
**How to avoid:** Update container configs before merging. This is atomic -- all container changes must land together.

### Pitfall 3: dev-apps.sh used by other developers
**What goes wrong:** Changing the script breaks developer workflows if they haven't installed pnpm.
**How to avoid:** Ensure `.node-version` and `packageManager` field are present (they are). pnpm is auto-installable via corepack.

### Pitfall 4: bun.lock deletion may confuse git
**What goes wrong:** Large lockfile deletion creates noisy diff.
**How to avoid:** Delete in its own commit with clear message.

## Code Examples

### Container entrypoint with pnpm (for dev override)
```yaml
# deploy/podman-compose.override.yml - blog service
hr-blog:
  entrypoint: sh
  command: ["-c", "npm i -g pnpm && pnpm install && pnpm build && npx serve -l 5013 dist"]
```

### pnpm catalog usage
```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"

catalog:
  react: "^19.0.0"
  react-dom: "^19.0.0"
```

```json
// apps/web/package.json
{
  "dependencies": {
    "react": "catalog:",
    "react-dom": "catalog:"
  }
}
```

## Open Questions

1. **Remote caching status**
   - What we know: TURBO_TOKEN/TURBO_TEAM env vars configured in CI
   - What's unclear: Whether remote caching is actually provisioned (Vercel or self-hosted)
   - Recommendation: Verify during implementation; skip if not provisioned yet

2. **Production deploy containers**
   - What we know: Dev override uses bun for live-reload; prod compose file references bun images
   - What's unclear: Whether production uses pre-built images or builds in-container
   - Recommendation: Check if production has separate Dockerfiles; the compose file suggests runtime images not build images

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection of all files containing "bun" references
- Existing turbo.json, pnpm-workspace.yaml, package.json configurations
- CI workflow already uses pnpm exclusively

### Secondary (MEDIUM confidence)
- pnpm catalogs feature (stable in pnpm 9.x)

## Metadata

**Confidence breakdown:**
- Bun artifact inventory: HIGH - exhaustive grep of entire codebase
- Container migration: HIGH - straightforward image swap
- pnpm optimization (catalogs): MEDIUM - optional enhancement, not critical path
- Turbo remote caching: LOW - unclear if provisioned

**Research date:** 2026-03-13
**Valid until:** 2026-04-13
