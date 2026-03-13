# Developer Guide - Make Commands & Workflow

This guide explains how to use the `make` commands for development, building, and maintenance of the HR platform.

## Quick Reference

```bash
# Development
make dev              # Start infrastructure (podman services)
make dev-apps        # Start all 3 frontend dev servers in parallel
make dev-www         # Start HR site only (port 3010)
make dev-blog        # Start HR blog only (port 3013)
make dev-docs        # Start HR docs only (port 3011)

# Building
make build           # Build all apps with optimized caching
make build-www       # Build HR site only
make build-blog      # Build HR blog only
make build-docs      # Build HR docs only

# Testing
make test            # Run unit tests
make test-watch      # Run tests in watch mode
make test-e2e        # Run Playwright e2e tests
make lint            # Lint all workspaces
make typecheck       # Type-check all workspaces

# Cleaning
make clean           # Remove containers and networks
make clean-all       # Remove containers, networks, AND volumes
make clean-cache     # Clear all build caches (.next, .astro, .turbo)
make clean-webpack   # Clear webpack dev cache only (fastest)
make clean-www       # Clear www cache and restart container
make clean-blog      # Clear blog cache
make clean-docs      # Clear docs cache

# Management
make up              # Start all podman services
make down            # Stop all podman services
make restart         # Restart all services
make logs            # Follow all service logs
make ps              # Show running containers
make bootstrap       # Full fresh setup
make install         # Install dependencies with pnpm
make nuke            # Full nuclear reset (containers + volumes + node_modules + cache)

# Help
make help            # Show all available commands with descriptions
```

## Development Workflow

### Initial Setup (One Time)

```bash
# Full fresh setup
make bootstrap

# This will:
# 1. Install all dependencies with pnpm
# 2. Display connection URLs and available ports
# 3. Show instructions for next steps
```

### Daily Development (Two Terminals)

**Terminal 1 - Infrastructure:**
```bash
make dev

# This starts all podman services (database, cache, etc.)
# Services available at:
# - HR site:  http://hr.localhost (via Caddy) or http://localhost:3010 (direct)
# - HR blog:  http://blog.hr.localhost or http://localhost:3013
# - HR docs:  http://docs.localhost or http://localhost:3011
```

**Terminal 2 - Frontend Servers:**
```bash
make dev-apps

# This starts all 3 dev servers in parallel with colored output:
# - [hr]        - HR site at http://localhost:3010
# - [hr-blog]   - Blog at http://localhost:3013
# - [hr-docs]   - Docs at http://localhost:3011

# Press Ctrl+C to stop all servers
```

### Individual Development

If you only need one app:

```bash
# Terminal 1 - Infrastructure
make dev

# Terminal 2 - Just the site you're working on
make dev-www     # OR
make dev-blog    # OR
make dev-docs
```

## Build Optimization

The build system uses **Turbo** with optimized caching for fast builds:

### How It Works

1. **Webpack Cache** - Dev file changes rebuild in 1-2 seconds (was 3-5 sec)
2. **Turbo Cache** - Task results cached, parallel workers for efficiency
3. **pnpm Cache** - Content-addressable store for faster dependency resolution
4. **Environment Aware** - Cache invalidates when .env changes

### Build Commands

```bash
# Full build with caching (4 parallel workers)
make build

# Build specific app
make build-www       # ~2-5 seconds
make build-blog      # ~2-5 seconds
make build-docs      # ~2-5 seconds

# Output includes:
# ✓ Tasks cached
# ✓ Turbo cache hit rate (usually 80%+ on CI)
# ✓ Build time
# ✓ Task graph visualization
```

### Clearing Caches (When Needed)

```bash
# Option 1: Clear only webpack dev cache (fastest, ~10 seconds)
make clean-webpack

# Option 2: Clear all build caches (slower, ~30 seconds)
make clean-cache

# Option 3: Full nuclear reset (slowest, cleans everything)
make nuke
# Then: make bootstrap
```

## Common Development Tasks

### Task: Fix a Bug in the HR Site

```bash
# Terminal 1
make dev

# Terminal 2
make dev-www

# Make changes to www/ directory
# Hot reload happens automatically

# If webpack cache gets corrupted:
make clean-webpack
# Restart dev-www and changes will rebuild
```

### Task: Work on Blog Styling

```bash
make dev
make dev-blog

# Edit blog/ components
# Hot reload in browser
```

### Task: Test All Apps Before Commit

```bash
make lint      # Check code style
make typecheck # Check TypeScript
make test      # Run unit tests

# If everything passes, you're safe to commit
```

### Task: Build for Production

```bash
# First ensure everything type-checks
make typecheck

# Build all apps (with turbo caching)
make build

# Output appears in:
# - www/.next/    (Next.js standalone)
# - blog/dist/    (Astro static)
# - docs/dist/    (Astro Starlight static)
```

### Task: Debug a Failing Test

```bash
make test:watch    # Runs vitest with file watching
# Edit code and tests re-run automatically

# Or open UI for visual debugging
make test:ui
```

### Task: Run E2E Tests

```bash
# Prerequisites: make dev-apps must be running

# Terminal 1
make dev && sleep 3 && make dev-apps

# Terminal 2
make test-e2e

# Or debug with UI
make test-e2e:ui
```

## Makefile Structure

The `Makefile` is organized by category:

### Container Management (podman)
- `make up` / `make down` / `make restart` - Service lifecycle
- `make logs` / `make ps` - Service introspection
- `make clean` / `make clean-all` - Cleanup

### Development
- `make dev*` - Start dev servers and infrastructure
- Supports individual apps or all together

### Building
- `make build*` - Turbo-based builds with caching
- Uses 4 parallel cache workers
- Includes `--cache-workers=4` flag

### Testing
- `make test*` - Unit, watch, and e2e testing
- `make lint` / `make typecheck` - Code quality

### Cleanup
- `make clean*` - Various cache/container cleanup levels
- `make nuke` - Full reset

## Performance Tips

### Faster Development

1. **Use `make dev-apps` not `pnpm dev`**
   - Parallel startup (all 3 servers at once)
   - Colored output for easier debugging
   - Proper process management

2. **Only start what you need**
   - Working on HR site? Use `make dev-www`
   - Don't run all 3 servers if you don't need them

3. **Clear webpack cache strategically**
   - Use `make clean-webpack` instead of full `clean-cache`
   - Only do full clean if webpack gets corrupted

### Faster Builds

1. **Rebuild locally (before commit)**
   ```bash
   make build        # Uses turbo cache
   ```

2. **On CI/CD (remote cache enabled)**
   ```bash
   # CI automatically benefits from turbo remote cache
   # Your local builds contribute to shared cache
   ```

### Faster Installs

1. **Use pnpm instead of npm/yarn**
   ```bash
   pnpm install       # Faster than npm with content-addressable store
   ```

2. **First install does full install**
   - Subsequent installs are cached
   - Dependencies in `package.json` only updated when changed

## Troubleshooting

### Port Already in Use

```bash
# Port 3010 occupied?
make dev-www      # Shows "Port 3010 is still in use"

# Solution: Kill the process on that port
make dev-www stop  # If using the port cleanup script
# OR
lsof -i :3010     # Find the process
kill -9 <pid>     # Kill it

# Then try again
make dev-www
```

### Webpack Cache Corrupted (Strange Errors on Hot Reload)

```bash
make clean-webpack

# Then restart the dev server:
make dev-www       # (in its terminal, press Ctrl+C and restart)
```

### Build Fails but Local Dev Works

```bash
# Clear everything and rebuild
make clean-cache
make build

# If still fails, try full reset
make nuke
make bootstrap
make build
```

### Services Won't Start

```bash
# Check what's running
make ps

# Stop everything
make clean-all

# Restart
make dev
```

### File Changes Not Showing

```bash
# Hot reload might be disabled, check:
# 1. Is dev server still running?
#    (check terminal for errors)

# 2. Clear webpack cache
make clean-webpack

# 3. Reload in browser (Cmd+Shift+R or Ctrl+Shift+R)

# 4. Restart dev server if needed
```

## Git Workflow with Make

### Before Committing

```bash
make lint           # Check formatting
make typecheck      # Check types
make test           # Run unit tests

# If all pass:
git commit -m "Your message"

# Before pushing to main:
make build          # Final check that prod build works
```

### After Merging

If you pull changes from main:

```bash
pnpm install         # Update dependencies if needed
make clean-webpack  # Clear old webpack cache
make dev-apps       # Start fresh dev servers
```

## Environment Variables

### Key Variables

```bash
# In .env or .env.local:
NODE_ENV=development         # Automatically set for dev
NEXT_PUBLIC_*               # Public variables for Next.js
AN_API_KEY=                 # 21st Agents API key

# Development with overrides:
NODE_ENV=development make build    # Force dev build
ANALYZE=true make build            # Enable bundle analysis
```

### Using with Make

```bash
# These are automatically passed through:
make build          # NODE_ENV=development

# Override if needed:
NODE_ENV=production make build     # Forces prod build
```

## Advanced Usage

### Build Specific Apps (Monorepo Filtering)

```bash
# Build only www and its dependencies
make build-www

# Build only blog
make build-blog

# Build only docs
make build-docs

# Build all
make build
```

### Parallel Development

```bash
# Terminal 1: Infrastructure
make dev

# Terminal 2: All frontend servers (parallel, colored)
make dev-apps

# Terminal 3: Tests in watch mode
make test-watch

# Terminal 4: Type checker (if needed)
watch -n 3 'make typecheck'
```

### Debug Individual Processes

```bash
# Terminal 1: Infrastructure
make dev

# Terminal 2: HR site with debugging
cd www && PORT=3010 NODE_OPTIONS=--inspect pnpm dev

# Then open chrome://inspect in Chrome DevTools
```

## Reference

- **Makefile** - Source of truth for all commands
- **package.json** - NPM/pnpm scripts (usually called via make)
- **.docs/QUICK_START.md** - High-level overview
- **.docs/AGENT_SETUP.md** - AI Assistant configuration
- **.docs/DESIGN_SYSTEM.md** - Design tokens and components

## Getting Help

```bash
# Show all available commands
make help

# See what a command does
grep "^<command>:" Makefile

# Check a specific script
cat scripts/dev.sh        # Infrastructure startup
cat scripts/dev-apps.sh   # Frontend servers startup
```

---

**Happy developing!** 🚀

For questions about specific build configurations, see:
- `turbo.json` - Turbo caching configuration
- `.npmrc` - pnpm configuration
- `www/next.config.mjs` - Next.js webpack configuration
