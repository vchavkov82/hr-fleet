#!/bin/bash
# Start HR development environment with all services
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

COMPOSE="podman-compose --project-name hr -f deploy/podman-compose.yml -f deploy/podman-compose.override.yml"

# Cleanup on interrupt
cleanup() {
  trap - INT TERM EXIT
  echo ""
  echo "Shutting down services..."
  $COMPOSE down 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM EXIT

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
    echo "Killing processes on ports (if any)..."
    "$SCRIPT_DIR/kill-ports.sh" || echo "No conflicting ports found"
    $COMPOSE down
    $COMPOSE up -d
    echo "Services restarted."
    exit 0
    ;;
  logs)
    if [ -n "${2:-}" ]; then
      $COMPOSE logs -f "$2"
    else
      $COMPOSE logs -f
    fi
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

# Kill processes on HR ports (if any)
echo "Killing processes on ports (if any)..."
"$SCRIPT_DIR/kill-ports.sh" || echo "No conflicting ports found"

# Tear down existing containers/pods to avoid name conflicts
echo "Cleaning up existing containers..."
$COMPOSE down -v --remove-orphans 2>/dev/null || true

# Fallback cleanup for stubborn containers (by name pattern)
sleep 1
for container in hr-www hr-blog hr-docs hr-admin; do
  podman rm -f "$container" 2>/dev/null || true
done
podman pod rm -f pod_deploy 2>/dev/null || true

echo ""
echo "Starting HR development environment..."
echo ""

# Start all services
if ! $COMPOSE up -d; then
  echo "Error: Failed to start services" >&2
  exit 1
fi

echo ""
echo "Waiting for services to start..."
sleep 3

# Verify services started
echo ""
if ! $COMPOSE ps; then
  echo "Warning: Could not verify service status" >&2
fi

echo ""
echo "Development environment is ready!"
echo ""
echo "Via Caddy (add subdomains to /etc/hosts -> 127.0.0.1):"
echo "  HR site      http://hr.localhost       -> hr:5010"
echo "  HR blog      http://blog.hr.localhost  -> hr-blog:5013"
echo "  HR docs      http://docs.localhost     -> hr-docs:5011"
echo ""
echo "Direct container ports (or use dev-apps on 5010/5011/5013):"
echo "  HR site      http://localhost:5020"
echo "  HR blog      http://localhost:5023"
echo "  HR docs      http://localhost:5021"
echo ""
echo "Run 'make dev-apps' to start frontend dev servers."
echo ""
echo "Commands:"
echo "  make infra-down  Stop all services"
echo "  make infra       Restart all services"
echo "  make infra-logs  Follow all logs"
echo "  make ps          Show service status"
