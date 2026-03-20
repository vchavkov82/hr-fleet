# HR Product - Standalone Makefile

COMPOSE := podman-compose --project-name hr -f deploy/podman-compose.yml -f deploy/podman-compose.override.yml

.PHONY: help up down restart logs ps clean clean-all clean-cache clean-webpack clean-www clean-blog clean-docs \
	dev dev-apps infra infra-down infra-logs dev-www dev-blog dev-docs dev-backend odoo-init \
	build build-www build-blog build-docs build-all build-odoo \
	test test-watch test-e2e test-backend lint typecheck \
	check-links check-links-www check-links-blog check-links-docs \
	install bootstrap nuke \
	oca-update oca-init

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Container management ────────────────────────────────────────────────────

up: ## Start all services
	$(COMPOSE) up -d

down: ## Stop all services
	$(COMPOSE) down

restart: ## Restart all services
	$(COMPOSE) restart

logs: ## Follow logs for all services
	$(COMPOSE) logs -f

ps: ## Show running containers
	$(COMPOSE) ps

clean: ## Remove containers and networks (keeps volumes)
	$(COMPOSE) down

clean-all: ## Remove containers, networks, and volumes (WARNING: deletes data)
	$(COMPOSE) down -v

clean-cache: ## Clear all build caches (.next, .astro, dist, .turbo)
	rm -rf apps/web/.next apps/web/.next/cache apps/blog/dist apps/blog/.astro apps/docs/dist apps/docs/.astro .turbo

clean-webpack: ## Clear webpack dev cache only (faster than full clean)
	rm -rf apps/web/.next/cache/webpack

clean-www: ## Clear www build cache and restart container
	rm -rf apps/web/.next
	-podman restart hr-www 2>/dev/null || true

clean-blog: ## Clear blog build cache
	rm -rf apps/blog/dist apps/blog/.astro

clean-docs: ## Clear docs build cache
	rm -rf apps/docs/dist apps/docs/.astro

nuke: ## Full clean: containers, volumes, caches, node_modules
	-$(COMPOSE) down -v 2>/dev/null || true
	-podman pod rm -f --all 2>/dev/null || true
	rm -rf node_modules apps/web/node_modules apps/blog/node_modules apps/docs/node_modules
	rm -rf apps/web/.next apps/blog/dist apps/blog/.astro apps/docs/dist apps/docs/.astro .turbo

# ── Development ─────────────────────────────────────────────────────────────

dev: ## Start everything (infra + check + frontend dev servers in parallel)
	scripts/dev.sh up & \
	node_modules/.bin/turbo run typecheck lint --cache-workers=4 & \
	sleep 2 && \
	scripts/dev-apps.sh
	@echo ""
	@echo "HR site:  https://hr.svc.assistance.bg"
	@echo "HR blog:  https://blog.hr.svc.assistance.bg"
	@echo "HR docs:  https://docs.hr.svc.assistance.bg"
	@echo "HR admin: https://admin.hr.svc.assistance.bg"
	@echo "HR odoo:  https://odoo.hr.svc.assistance.bg"
	@echo "HR API:   https://hr.svc.assistance.bg/api/v1/"

dev-apps: ## Start all frontend dev servers (www, blog, docs)
	scripts/dev-apps.sh

infra: ## Start infrastructure only (PostgreSQL, Redis, Odoo, etc.)
	scripts/dev.sh

infra-down: ## Stop infrastructure
	scripts/dev.sh stop

infra-logs: ## Follow infrastructure logs
	scripts/dev.sh logs

dev-www: ## Start HR site only in dev mode (port 5010)
	cd apps/web && PORT=5010 pnpm dev

dev-blog: ## Start HR blog only in dev mode (port 5013)
	cd apps/blog && pnpm dev

dev-docs: ## Start HR docs only in dev mode (port 5011)
	cd apps/docs && pnpm dev

dev-admin: ## Start HR admin panel only in dev mode (port 5012)
	cd apps/admin && pnpm dev

dev-backend: ## Start Go backend in dev mode (port 5080, API + Asynq worker)
	cd services/api && PORT=5080 go run ./cmd/server/ --mode=both

odoo-init: ## Initialize Odoo HR modules (run once after first start)
	bash deploy/odoo-init.sh

build-odoo: ## Build custom Odoo image with OCA modules
	cd deploy && podman build -f Dockerfile.odoo -t hr-odoo:18.0-oca .

oca-update: ## Update all OCA submodules to latest 18.0
	git submodule update --remote deploy/odoo-addons/server-tools
	git submodule update --remote deploy/odoo-addons/payroll
	git submodule update --remote deploy/odoo-addons/hr
	git submodule update --remote deploy/odoo-addons/hr-holidays
	git submodule update --remote deploy/odoo-addons/hr-attendance
	git submodule update --remote deploy/odoo-addons/hr-expense
	git submodule update --remote deploy/odoo-addons/timesheet
	git submodule update --remote deploy/odoo-addons/reporting-engine
	git submodule update --remote deploy/odoo-addons/account-financial-reporting

oca-init: build-odoo odoo-init ## Build Odoo image + install all OCA modules

# ── Build ───────────────────────────────────────────────────────────────────

build: ## Build www + blog via turbo (sequential to avoid OOM, turbo caches each)
	node_modules/.bin/turbo run build --filter=@hr/www --cache-workers=4
	node_modules/.bin/turbo run build --filter=@hr/blog --cache-workers=4

build-www: ## Build HR site only
	node_modules/.bin/turbo run build --filter=@hr/www --cache-workers=4

build-blog: ## Build HR blog only
	node_modules/.bin/turbo run build --filter=@hr/blog --cache-workers=4

build-docs: ## Build HR docs only
	node_modules/.bin/turbo run build --filter=@hr/docs --cache-workers=4

build-all: ## Build all packages (www, blog, docs)
	node_modules/.bin/turbo run build --filter=@hr/www --cache-workers=4
	node_modules/.bin/turbo run build --filter=@hr/blog --filter=@hr/docs --cache-workers=4

check: ## Run typecheck + lint in parallel via turbo
	node_modules/.bin/turbo run typecheck lint --cache-workers=4

# ── Test ──────────────────────────────────────────────────────────────

test: ## Run unit tests (web, admin, api, worker via turbo)
	pnpm run test

test-watch: ## Run unit tests in watch mode
	cd apps/web && pnpm run test:watch

test-e2e: ## Run e2e tests (Playwright, needs running dev server)
	cd apps/web && pnpm run test:e2e

test-backend: ## Run Go backend tests (short mode; omit -short for integration)
	cd services/api && go test ./... -short -count=1

lint: ## Lint all workspaces
	node_modules/.bin/turbo run lint

typecheck: ## Type-check all workspaces
	node_modules/.bin/turbo run typecheck

check-links: ## Check for broken links on all sites (requires servers running)
	scripts/check-broken-links.sh

check-links-www: ## Check broken links on HR site only
	scripts/check-broken-links.sh --site www

check-links-blog: ## Check broken links on blog only
	scripts/check-broken-links.sh --site blog

check-links-docs: ## Check broken links on docs only
	scripts/check-broken-links.sh --site docs

# ── Setup ───────────────────────────────────────────────────────────────────

install: ## Install all HR dependencies
	@if command -v mise >/dev/null 2>&1; then \
		mise trust --quiet 2>/dev/null || true; \
		mise install; \
	else \
		echo "mise not found. Install: curl https://mise.run | sh"; \
		echo "Then run: mise trust && mise install"; \
	fi
	pnpm install

bootstrap: install ## Full setup from scratch
	@echo "Bootstrap complete!"
	@echo ""
	@echo "Services (via remote Caddy gateway):"
	@echo "  HR site      https://hr.svc.assistance.bg"
	@echo "  HR blog      https://blog.hr.svc.assistance.bg"
	@echo "  HR docs      https://docs.hr.svc.assistance.bg"
	@echo "  HR admin     https://admin.hr.svc.assistance.bg"
	@echo "  HR API       https://api.hr.svc.assistance.bg"
	@echo "  HR Odoo      https://odoo.hr.svc.assistance.bg"

.DEFAULT_GOAL := help
