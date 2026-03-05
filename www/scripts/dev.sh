#!/bin/bash
# Development infrastructure manager

set -e

COMPOSE="podman-compose --project-name hr -f deploy/podman-compose.yml -f deploy/podman-compose.override.yml"
COMMAND="${1:-up}"

case "$COMMAND" in
  up)
    echo "Starting infrastructure..."
    echo "Cleaning up existing containers..."
    $COMPOSE down 2>/dev/null || true

    echo "Starting HR development environment..."
    $COMPOSE up -d

    echo ""
    echo "Waiting for services to start..."
    sleep 3

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
    ;;

  stop)
    echo "Stopping infrastructure..."
    $COMPOSE down
    echo "Infrastructure stopped."
    ;;

  restart)
    echo "Restarting infrastructure..."
    $COMPOSE restart
    $COMPOSE ps
    ;;

  logs)
    echo "Following infrastructure logs (Ctrl+C to exit)..."
    $COMPOSE logs -f
    ;;

  ps)
    $COMPOSE ps
    ;;

  *)
    echo "Usage: $0 {up|stop|restart|logs|ps}"
    exit 1
    ;;
esac
