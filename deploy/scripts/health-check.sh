#!/usr/bin/env bash
set -euo pipefail

# HR Platform — Health Check Script
# Checks service health with retries.
#
# Usage:
#   ./health-check.sh          # Check all services
#   ./health-check.sh hr-api   # Check single service

MAX_RETRIES=5
RETRY_INTERVAL=3

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILES="-f ${DEPLOY_DIR}/podman-compose.yml -f ${DEPLOY_DIR}/podman-compose.prod.yml"

# Determine which services to check
if [[ $# -gt 0 ]]; then
    SERVICES=("$@")
else
    SERVICES=("hr-db" "hr-redis" "hr-api" "hr" "hr-blog" "hr-docs" "caddy")
fi

check_service() {
    local svc="$1"
    local container

    container=$(podman-compose ${COMPOSE_FILES} ps -q "$svc" 2>/dev/null | head -1)
    if [[ -z "$container" ]]; then
        echo "  Container not found for ${svc}"
        return 1
    fi

    case "$svc" in
        hr-db)
            podman exec "$container" pg_isready -U hr -d hr_platform -q 2>/dev/null
            ;;
        hr-odoo-db)
            podman exec "$container" pg_isready -U odoo -q 2>/dev/null
            ;;
        hr-redis)
            podman exec "$container" redis-cli ping 2>/dev/null | grep -q PONG
            ;;
        hr-api)
            podman exec "$container" wget --no-verbose --tries=1 --spider http://localhost:8080/health 2>/dev/null
            ;;
        hr)
            podman exec "$container" wget --no-verbose --tries=1 --spider http://localhost:3010/ 2>/dev/null
            ;;
        hr-blog)
            podman exec "$container" wget --no-verbose --tries=1 --spider http://localhost:3013/ 2>/dev/null
            ;;
        hr-docs)
            podman exec "$container" wget --no-verbose --tries=1 --spider http://localhost:3011/ 2>/dev/null
            ;;
        caddy)
            podman exec "$container" wget --no-verbose --tries=1 --spider http://localhost:80/ 2>/dev/null || \
            podman exec "$container" wget --no-verbose --tries=1 --spider http://localhost:443/ 2>/dev/null || \
            podman inspect --format '{{.State.Running}}' "$container" 2>/dev/null | grep -q true
            ;;
        *)
            # Generic: just check container is running
            podman inspect --format '{{.State.Running}}' "$container" 2>/dev/null | grep -q true
            ;;
    esac
}

FAILED=()

for svc in "${SERVICES[@]}"; do
    echo "Checking ${svc}..."
    SUCCESS=false

    for attempt in $(seq 1 "$MAX_RETRIES"); do
        if check_service "$svc"; then
            echo "  ${svc}: healthy (attempt ${attempt}/${MAX_RETRIES})"
            SUCCESS=true
            break
        fi

        if [[ "$attempt" -lt "$MAX_RETRIES" ]]; then
            echo "  ${svc}: retry ${attempt}/${MAX_RETRIES}, waiting ${RETRY_INTERVAL}s..."
            sleep "$RETRY_INTERVAL"
        fi
    done

    if [[ "$SUCCESS" != "true" ]]; then
        echo "  ${svc}: UNHEALTHY after ${MAX_RETRIES} attempts"
        FAILED+=("$svc")
    fi
done

if [[ ${#FAILED[@]} -gt 0 ]]; then
    echo ""
    echo "FAILED services: ${FAILED[*]}"
    exit 1
fi

echo ""
echo "All services healthy"
exit 0
