#!/bin/bash
# Thin wrapper around podman-compose for the HR stack.
# Usage: scripts/dev.sh [up|down|restart|logs|ps]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

COMPOSE="podman-compose --project-name hr -f deploy/podman-compose.yml -f deploy/podman-compose.override.yml"

CMD="${1:-up}"
shift 2>/dev/null || true

case "$CMD" in
  up|start)
    # Check if .env exists
    if [ ! -f .env ]; then
      echo "Creating .env from .env.example..."
      cp .env.example .env
    fi

    # Kill processes on HR ports (if any)
    "$SCRIPT_DIR/kill-ports.sh" 2>/dev/null || true

    # Clean up existing containers to avoid name conflicts
    $COMPOSE down --remove-orphans 2>/dev/null || true
    for c in hr-www hr-blog hr-docs hr-admin; do
      podman rm -f "$c" 2>/dev/null || true
    done

    $COMPOSE up -d
    sleep 3
    $COMPOSE ps

    echo ""
    echo "Services (via remote Caddy gateway):"
    echo "  HR site      https://www.hr.svc.assistance.bg     -> localhost:5020"
    echo "  HR blog      https://blog.hr.svc.assistance.bg    -> localhost:5023"
    echo "  HR docs      https://docs.hr.svc.assistance.bg    -> localhost:5021"
    echo "  HR admin     https://admin.hr.svc.assistance.bg   -> localhost:5014"
    echo "  HR API       https://api.hr.svc.assistance.bg     -> localhost:5080"
    echo "  HR Odoo      https://odoo.hr.svc.assistance.bg    -> localhost:8069"
    ;;
  stop|down)
    $COMPOSE down "$@"
    ;;
  restart)
    "$SCRIPT_DIR/kill-ports.sh" 2>/dev/null || true
    $COMPOSE down
    $COMPOSE up -d
    ;;
  logs)
    $COMPOSE logs -f "$@"
    ;;
  ps|status)
    $COMPOSE ps
    ;;
  *)
    # Pass anything else straight through to podman-compose
    $COMPOSE "$CMD" "$@"
    ;;
esac
