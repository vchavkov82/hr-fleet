# Developer Guide

Local development setup and configuration for the HR SaaS platform.

## Prerequisites

- **mise** — runtime version manager ([install](https://mise.run))
- **Podman** — container runtime (not Docker)
- **podman-compose** — Compose file support for Podman

## Quick Start

```bash
# 1. Install mise (one-time)
curl https://mise.run | sh

# 2. Trust and install project tools (Node 22, Go 1.25.7, pnpm 9)
mise trust && mise install

# 3. Install dependencies
pnpm install

# 4. Add local domains to /etc/hosts
echo "127.0.0.1 hr.localhost blog.hr.localhost docs.localhost admin.hr.localhost odoo.hr.localhost" | sudo tee -a /etc/hosts

# 5. Start everything
make dev
```

## Development URLs

| App | Direct Port | Via Caddy |
|-----|-------------|-----------|
| HR Site (Next.js) | http://localhost:5010 | http://hr.localhost:5090 |
| HR Blog (Astro) | http://localhost:5013 | http://blog.hr.localhost:5090 |
| HR Docs (Starlight) | http://localhost:5011 | http://docs.localhost:5090 |
| Admin Panel (Vite) | http://localhost:5012 | http://admin.hr.localhost:5090 |
| Go API | http://localhost:5080 | http://hr.localhost:5090/api/v1 |
| Odoo ERP | http://localhost:8069 | http://odoo.hr.localhost:5090 |

## Integrated Services

### Core Infrastructure

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| Caddy | `hr-caddy` | 5090 (HTTP), 5453 (HTTPS) | Reverse proxy, TLS termination |
| PostgreSQL | `hr-db` | 5433 | API database (hr_platform) |
| Redis | `hr-redis` | 5380 | Cache, Asynq job queue |
| Go API | `hr-api` | 5080 | REST API backend |

### Odoo ERP Stack

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| Odoo | `hr-odoo` | 8069 | ERP backend |
| Odoo DB | `hr-odoo-db` | — | Odoo PostgreSQL (internal) |

Odoo runs with OCA (Odoo Community Association) modules:
- `payroll` — Payroll management
- `hr` — Core HR
- `hr-holidays` — Leave management
- `hr-attendance` — Attendance tracking
- `hr-expense` — Expense management
- `timesheet` — Timesheet tracking
- `project` — Project management
- `fleet` — Vehicle/asset management

## Hardcoded Development Credentials

> **WARNING**: These credentials are for local development only. Never use in production.

### Dev Admin User (HR API / Admin Panel)

| Setting | Value |
|---------|-------|
| Email | `admin@hr.dev` |
| Password | `HrDev2024!` |
| Role | `super_admin` |

This user is automatically created by the seed migration (`services/api/migrations/005_seed_dev_admin.sql`) when the database is initialized.

### PostgreSQL (API Database)

| Setting | Value |
|---------|-------|
| Host | `hr-db` (container) / `localhost:5433` (host) |
| Database | `hr_platform` |
| Username | `hr` |
| Password | `hr_dev_password` |
| Connection String | `postgres://hr:hr_dev_password@localhost:5433/hr_platform?sslmode=disable` |

### Odoo ERP

| Setting | Value |
|---------|-------|
| URL | http://localhost:8069 |
| Database | `odoo` |
| Admin User | `admin` |
| Admin Password | `admin` |
| DB User | `odoo` |
| DB Password | `odoo` |
| Master Password | `$pbkdf2-sha512$25000$changeme` |

### Redis

| Setting | Value |
|---------|-------|
| URL | `redis://localhost:5380` |
| Container URL | `redis://hr-redis:6379` |

### JWT Authentication

| Setting | Value |
|---------|-------|
| Secret | `hr-dev-jwt-secret-change-me-in-production` |
| Algorithm | RS256 |

### Environment Variables

All development credentials are defined in `.env`:

```bash
# Database
DATABASE_URL=postgres://hr:hr_dev_password@hr-db:5432/hr_platform?sslmode=disable

# Redis
REDIS_URL=redis://hr-redis:6379

# Odoo
ODOO_URL=http://hr-odoo:8069
ODOO_DB=odoo
ODOO_USER=admin
ODOO_PASSWORD=admin
ODOO_DB_PASSWORD=odoo

# JWT
JWT_SECRET=hr-dev-jwt-secret-change-me-in-production

# API
API_PORT=8080
VITE_API_URL=http://hr.localhost:5090/api/v1

# Next.js www (`apps/web`) — copy `apps/web/.env.example` to `apps/web/.env.local`
# NEXT_PUBLIC_API_URL=http://localhost:5080
# Use :5090 only if your Caddy gateway on that port is running; otherwise the browser
# shows “CORS request did not succeed” with status (null) (connection refused).
```

## Common Commands

```bash
# Development
make dev              # Start infra + all frontend dev servers
make dev-www          # HR site only (port 5010)
make dev-blog         # Blog only (port 5013)
make dev-docs         # Docs only (port 5011)
make dev-admin        # Admin panel only (port 5012)
make dev-backend      # Go API only (port 5080)

# Infrastructure
make infra            # Start infra only (Postgres, Redis, Caddy, Odoo)
make up               # Start all containers
make down             # Stop all containers
make logs             # Follow container logs
make ps               # Show running containers

# Build
make build            # Build www + blog
make build-all        # Build www + blog + docs
make check            # typecheck + lint

# Test
make test             # Unit tests (Vitest)
make test-e2e         # Playwright e2e tests
make test-backend     # Go tests

# Cleanup
make clean            # Remove containers (keeps volumes)
make clean-all        # Remove containers + volumes (deletes data)
make clean-cache      # Clear build caches
make nuke             # Full reset: containers, volumes, node_modules, caches
```

## Database Access

Connect to PostgreSQL directly:

```bash
# Via psql
psql postgres://hr:hr_dev_password@localhost:5433/hr_platform

# Via container
podman exec -it hr-db psql -U hr -d hr_platform
```

Connect to Redis:

```bash
# Via redis-cli
redis-cli -p 5380

# Via container
podman exec -it hr-redis redis-cli
```

## Odoo Setup

After first start, initialize Odoo modules:

```bash
make odoo-init
```

To rebuild Odoo image with latest OCA modules:

```bash
make oca-update       # Update submodules
make build-odoo       # Rebuild image
```

## Troubleshooting

### Port conflicts

Default ports are offset to avoid conflicts:
- PostgreSQL: 5433 (not 5432)
- Redis: 5380 (not 6379)
- Caddy HTTP: 5090 (not 80)
- Caddy HTTPS: 5453 (not 443)

### Container issues

```bash
# View logs for specific service
podman logs hr-api
podman logs hr-odoo

# Restart a service
podman restart hr-api

# Full reset
make nuke && make bootstrap
```

### DNS issues (subdomains not resolving)

Ensure `/etc/hosts` contains:
```
127.0.0.1 hr.localhost blog.hr.localhost docs.localhost admin.hr.localhost odoo.hr.localhost
```
