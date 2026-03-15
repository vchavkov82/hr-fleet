#!/usr/bin/env bash
set -euo pipefail

# HR Platform — Production Deploy Script
# Rolling restart with automatic rollback on health failure.
#
# Usage:
#   ./deploy.sh                 # Deploy all services
#   ./deploy.sh --service hr    # Deploy single service

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$DEPLOY_DIR")"
COMPOSE_FILES="-f ${DEPLOY_DIR}/podman-compose.yml -f ${DEPLOY_DIR}/podman-compose.prod.yml"
HEALTH_CHECK="${SCRIPT_DIR}/health-check.sh"
ROLLBACK="${SCRIPT_DIR}/rollback.sh"

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
LOG_FILE="${LOG_DIR}/deploy-${TIMESTAMP}.log"

log() {
    local msg="[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $1"
    echo "$msg" | tee -a "$LOG_FILE"
}

log "=== Deploy started ==="
log "Service: ${SERVICE:-all}"
log "Compose files: ${COMPOSE_FILES}"

# Service restart order (databases excluded — they stay running)
DEPLOY_ORDER=("hr-api" "hr" "hr-blog" "hr-docs" "caddy")

if [[ -n "$SERVICE" ]]; then
    DEPLOY_ORDER=("$SERVICE")
fi

# Tag current images as "previous" for rollback
log "Tagging current images for rollback..."
for svc in "${DEPLOY_ORDER[@]}"; do
    CURRENT_IMAGE=$(podman-compose ${COMPOSE_FILES} ps -q "$svc" 2>/dev/null | head -1 | xargs -r podman inspect --format '{{.ImageName}}' 2>/dev/null || true)
    if [[ -n "$CURRENT_IMAGE" ]]; then
        podman tag "$CURRENT_IMAGE" "${CURRENT_IMAGE}-previous" 2>/dev/null || true
        log "Tagged ${CURRENT_IMAGE} as previous"
    fi
done

# Build images
log "Building images..."
if ! podman-compose ${COMPOSE_FILES} build ${SERVICE:+$SERVICE} 2>&1 | tee -a "$LOG_FILE"; then
    log "ERROR: Build failed"
    exit 1
fi
log "Build completed"

# Rolling restart
FAILED_SERVICE=""
for svc in "${DEPLOY_ORDER[@]}"; do
    log "Restarting ${svc}..."

    podman-compose ${COMPOSE_FILES} stop "$svc" 2>&1 | tee -a "$LOG_FILE"
    podman-compose ${COMPOSE_FILES} up -d "$svc" 2>&1 | tee -a "$LOG_FILE"

    log "Checking health of ${svc}..."
    if ! "$HEALTH_CHECK" "$svc" 2>&1 | tee -a "$LOG_FILE"; then
        log "ERROR: Health check failed for ${svc}"
        FAILED_SERVICE="$svc"
        break
    fi

    log "${svc} is healthy"
done

# Auto-rollback on failure
if [[ -n "$FAILED_SERVICE" ]]; then
    log "Triggering rollback for ${FAILED_SERVICE}..."
    "$ROLLBACK" --service "$FAILED_SERVICE" 2>&1 | tee -a "$LOG_FILE"
    log "=== Deploy FAILED — rolled back ${FAILED_SERVICE} ==="
    exit 2
fi

log "=== Deploy completed successfully ==="
exit 0
