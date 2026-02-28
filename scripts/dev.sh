#!/bin/bash
# Start HR development environment with all services
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

COMPOSE="podman-compose -f deploy/podman-compose.yml -f deploy/podman-compose.override.yml"

# Handle subcommands before doing anything else
CMD="${1:-up}"

case "$CMD" in
  stop|down)
    echo "Stopping all services..."
    $COMPOSE down
    echo "Services stopped."
    exit 0
    ;;
  restart)
    echo "Restarting all services..."
    $COMPOSE down
    $COMPOSE up -d
    echo "Services restarted."
    exit 0
    ;;
  logs)
    $COMPOSE logs -f ${2:-}
    exit 0
    ;;
  ps|status)
    $COMPOSE ps
    exit 0
    ;;
  up|start)
    ;; # fall through to startup logic below
  *)
    echo "Usage: scripts/dev.sh [up|stop|restart|logs|ps]"
    exit 1
    ;;
esac

# --- Startup ---

# Check if .env exists
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

# Tear down existing containers/pods to avoid name conflicts
echo "Cleaning up existing containers..."
$COMPOSE down 2>/dev/null || true

echo ""
echo "Starting HR development environment..."
echo ""

# Start all services
$COMPOSE up -d

echo ""
echo "Waiting for services to start..."
sleep 3

# Show status
$COMPOSE ps

echo ""
echo "Development environment is ready!"
echo ""
echo "Via Caddy (add subdomains to /etc/hosts -> 127.0.0.1):"
echo "  HR site      http://hr.localhost       -> hr:3010"
echo "  HR blog      http://blog.hr.localhost  -> hr-blog:3013"
echo "  HR docs      http://docs.localhost     -> hr-docs:3011"
echo ""
echo "Direct ports (no Caddy):"
echo "  HR site      http://localhost:3010"
echo "  HR blog      http://localhost:3013"
echo "  HR docs      http://localhost:3011"
echo ""
echo "Run 'make dev-apps' to start frontend dev servers."
echo ""
echo "Commands:"
echo "  scripts/dev.sh stop      Stop all services"
echo "  scripts/dev.sh restart   Restart all services"
echo "  scripts/dev.sh logs      Follow all logs"
echo "  scripts/dev.sh ps        Show service status"
