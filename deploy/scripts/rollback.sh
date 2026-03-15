#!/usr/bin/env bash
set -euo pipefail

# HR Platform — Rollback Script
# Restores containers to their previous image versions.
#
# Usage:
#   ./rollback.sh                 # Rollback all services
#   ./rollback.sh --service hr    # Rollback single service

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILES="-f ${DEPLOY_DIR}/podman-compose.yml -f ${DEPLOY_DIR}/podman-compose.prod.yml"
HEALTH_CHECK="${SCRIPT_DIR}/health-check.sh"

# Parse arguments
SERVICE=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --service) SERVICE="$2"; shift 2 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Logging setup
LOG_DIR="${DEPLOY_DIR}/logs"
mkdir -p "$LOG_DIR"
TIMESTAMP="$(date +%Y-%m-%d-%H%M%S)"
LOG_FILE="${LOG_DIR}/rollback-${TIMESTAMP}.log"

log() {
    local msg="[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $1"
    echo "$msg" | tee -a "$LOG_FILE"
}

log "=== Rollback started ==="
log "Service: ${SERVICE:-all}"

SERVICES=("hr-api" "hr" "hr-blog" "hr-docs" "caddy")

if [[ -n "$SERVICE" ]]; then
    SERVICES=("$SERVICE")
fi

# Restore previous images
for svc in "${SERVICES[@]}"; do
    CURRENT_IMAGE=$(podman-compose ${COMPOSE_FILES} ps -q "$svc" 2>/dev/null | head -1 | xargs -r podman inspect --format '{{.ImageName}}' 2>/dev/null || true)
    PREV_IMAGE="${CURRENT_IMAGE}-previous"

    if podman image exists "$PREV_IMAGE" 2>/dev/null; then
        log "Restoring ${svc} to previous image..."
        podman tag "$PREV_IMAGE" "$CURRENT_IMAGE" 2>/dev/null || true
    else
        log "No previous image for ${svc}, skipping tag restore"
    fi

    log "Restarting ${svc}..."
    podman-compose ${COMPOSE_FILES} stop "$svc" 2>&1 | tee -a "$LOG_FILE"
    podman-compose ${COMPOSE_FILES} up -d "$svc" 2>&1 | tee -a "$LOG_FILE"
done

# Verify health after rollback
log "Running health checks..."
if "$HEALTH_CHECK" 2>&1 | tee -a "$LOG_FILE"; then
    log "=== Rollback completed — all services healthy ==="
    exit 0
else
    log "=== Rollback completed — WARNING: some services unhealthy ==="
    exit 1
fi
