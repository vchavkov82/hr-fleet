# HR Product - Standalone Makefile

COMPOSE := podman-compose -f deploy/podman-compose.yml -f deploy/podman-compose.override.yml

.PHONY: help up down restart logs ps clean clean-all \
	dev dev-all dev-apps dev-www dev-blog dev-docs \
	build build-www build-blog build-docs build-all \
	install bootstrap

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

# ── Development ─────────────────────────────────────────────────────────────

dev: ## Start full dev environment (infra via podman)
	scripts/dev.sh

dev-apps: ## Start all frontend dev servers in parallel (colored output)
	scripts/dev-apps.sh

dev-all: ## Start infra (podman) + all frontend dev servers
	scripts/dev.sh up
	scripts/dev-apps.sh

dev-www: ## Start HR site in dev mode (port 3010)
	cd www && PORT=3010 bun dev

dev-blog: ## Start HR blog in dev mode (port 3013)
	cd blog && bun dev

dev-docs: ## Start HR docs in dev mode (port 3011)
	cd docs && bun dev

# ── Build ───────────────────────────────────────────────────────────────────

build: ## Build all HR apps via turbo
	node_modules/.bin/turbo run build

build-www: ## Build HR site only
	node_modules/.bin/turbo run build --filter=@hr/www

build-blog: ## Build HR blog only
	node_modules/.bin/turbo run build --filter=@hr/blog

build-docs: ## Build HR docs only
	node_modules/.bin/turbo run build --filter=@hr/docs

build-all: build ## Build everything (alias for build)

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
