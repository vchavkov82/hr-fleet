# HR Product - Standalone Makefile

COMPOSE := podman-compose --project-name hr -f deploy/podman-compose.yml -f deploy/podman-compose.override.yml

.PHONY: help up down restart logs ps clean clean-all clean-cache clean-webpack clean-www clean-blog clean-docs \
	dev dev-apps infra infra-down infra-logs dev-www dev-blog dev-docs dev-backend odoo-init \
	build build-www build-blog build-docs build-all \
	test test-watch test-e2e test-backend lint typecheck \
	check-links check-links-www check-links-blog check-links-docs \
	install bootstrap nuke

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
	rm -rf www/.next www/.next/cache blog/dist blog/.astro docs/dist docs/.astro .turbo

clean-webpack: ## Clear webpack dev cache only (faster than full clean)
	rm -rf www/.next/cache/webpack

clean-www: ## Clear www build cache and restart container
	rm -rf www/.next
	-podman restart hr-www 2>/dev/null || true

clean-blog: ## Clear blog build cache
	rm -rf blog/dist blog/.astro

clean-docs: ## Clear docs build cache
	rm -rf docs/dist docs/.astro

nuke: ## Full clean: containers, volumes, caches, node_modules
	-$(COMPOSE) down -v 2>/dev/null || true
	-podman pod rm -f --all 2>/dev/null || true
	rm -rf node_modules www/node_modules blog/node_modules docs/node_modules
	rm -rf www/.next blog/dist blog/.astro docs/dist docs/.astro .turbo

# ── Development ─────────────────────────────────────────────────────────────

dev: ## Start everything (infra + frontend dev servers in parallel)
	scripts/dev.sh up & \
	sleep 2 && \
	scripts/dev-apps.sh

dev-apps: ## Start all frontend dev servers (www, blog, docs)
	scripts/dev-apps.sh

infra: ## Start infrastructure only (PostgreSQL, Redis, Caddy, etc.)
	scripts/dev.sh

infra-down: ## Stop infrastructure
	scripts/dev.sh stop

infra-logs: ## Follow infrastructure logs
	scripts/dev.sh logs

dev-www: ## Start HR site only in dev mode (port 3010)
	cd www && PORT=3010 bun dev

dev-blog: ## Start HR blog only in dev mode (port 3013)
	cd blog && bun dev

dev-docs: ## Start HR docs only in dev mode (port 3011)
	cd docs && bun dev

dev-backend: ## Start Go backend in dev mode (port 8080)
	cd backend && go run ./cmd/server/

odoo-init: ## Initialize Odoo HR modules (run once after first start)
	bash deploy/odoo-init.sh

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

test: ## Run unit tests
	cd www && bun run test

test-watch: ## Run unit tests in watch mode
	cd www && bun run test:watch

test-e2e: ## Run e2e tests (Playwright, needs running dev server)
	cd www && bun run test:e2e

test-backend: ## Run Go backend tests
	cd backend && go test ./...

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
	bun install

bootstrap: install ## Full setup from scratch
	@echo "Bootstrap complete!"
	@echo ""
	@echo "Via Caddy (add subdomains to /etc/hosts -> 127.0.0.1):"
	@echo "  HR site      http://hr.localhost       -> hr:3010"
	@echo "  HR blog      http://blog.hr.localhost  -> hr-blog:3013"
	@echo "  HR docs      http://docs.localhost     -> hr-docs:3011"
	@echo ""
	@echo "Direct ports (dev only):"
	@echo "  HR site      http://localhost:3010"
	@echo "  HR blog      http://localhost:3013"
	@echo "  HR docs      http://localhost:3011"

.DEFAULT_GOAL := help
