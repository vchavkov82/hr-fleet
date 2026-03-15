# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Service

HR Go REST API backend. Chi router, PostgreSQL (pgx + sqlc), Redis (asynq workers).

## Commands

```bash
make api              # Build server binary → bin/server
make worker           # Build worker binary → bin/worker
make dev              # Run server in dual mode (API + worker)
make test             # go test ./... -short -count=1
make test-race        # go test with race detector
make lint             # golangci-lint run ./...
make swagger          # Regenerate OpenAPI spec (swag init)
make sqlc             # Regenerate DB query code from SQL
make generate-keys    # Create RS256 JWT keypair (jwt-private.pem, jwt-public.pem)
make docker-build     # Build container image via podman
```

## Architecture

```
cmd/
├── server/main.go    # API server entry point (--mode=api|worker|both)
└── worker/main.go    # Standalone worker binary
internal/
├── auth/             # JWT (RS256), API key hashing, password hashing, RBAC
├── cache/            # Redis + ristretto in-memory cache
├── config/           # Environment config loading
├── db/               # sqlc-generated code (models, queries)
│   └── queries/      # Raw SQL files for sqlc
├── handler/          # HTTP handlers (one file per domain)
├── middleware/       # Logging, metrics, auth, RBAC, tracing
├── service/          # Business logic layer
├── tax/              # Tax calculation logic
└── worker/           # Asynq task handlers (payroll, webhooks)
migrations/           # SQL migration files (001-004)
docs/                 # Generated Swagger/OpenAPI spec
```

## Key Patterns

- **Dependency injection**: Services injected into handlers; DB queries injected into services
- **Handler pattern**: `NewXyzHandler(svc) → handler struct with methods`
- **Dual auth**: RS256 JWT + API key fallback via `APIKeyOrJWT()` middleware
- **Context keys**: `CtxUserID`, `CtxEmail`, `CtxRole` — extract with `GetUserFromContext()`
- **Async processing**: Asynq with 3 priority queues (critical:3, default:6, low:1)
- **Monetary values**: Integer arithmetic (cents), never float
- **Error responses**: Structured `ErrorResponse` with codes
- **Logging**: zerolog with request ID correlation

## API Routes

```
/health                          # Public health check
/metrics                         # Prometheus metrics
/api/docs/*                      # Swagger UI
/api/v1/auth/login               # Public: POST login
/api/v1/auth/refresh             # Public: POST token refresh
/api/v1/* (protected)            # All other routes require APIKeyOrJWT
  /auth/api-keys                 # API key management
  /employees, /contracts         # Employee/contract CRUD
  /leave                         # Allocations, requests, approvals
  /payroll-runs                  # Create, approve, process
  /payslips                      # List, confirm
  /reports                       # Payroll summary, tax liabilities
  /webhooks                      # Registration, deliveries
```

## Environment Variables

Required: `DATABASE_URL`, `REDIS_URL`, `ODOO_URL`, `ODOO_PASSWORD`, and either `JWT_PRIVATE_KEY_FILE`+`JWT_PUBLIC_KEY_FILE` (RS256) or `JWT_SECRET` (HS256 fallback).

## Database

- PostgreSQL via pgx/v5 driver
- Queries: write SQL in `internal/db/queries/*.sql`, run `make sqlc` to regenerate Go code
- Migrations: sequential SQL files in `migrations/` (001-004)
