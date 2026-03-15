#!/usr/bin/env bash
# uptime-check.sh — Check all HR platform endpoints and log results.
# Cron-ready: exits 0 if all checks pass, 1 if any fail.
# Usage: */5 * * * * /path/to/deploy/scripts/uptime-check.sh >> /var/log/hr-uptime.log 2>&1

set -euo pipefail

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TIMEOUT=10
FAILED=0
TOTAL=0

# Default base URLs (override via environment variables)
API_URL="${API_URL:-http://localhost:5080}"
WEB_URL="${WEB_URL:-http://localhost:5010}"
BLOG_URL="${BLOG_URL:-http://localhost:5013}"
DOCS_URL="${DOCS_URL:-http://localhost:5011}"

check_endpoint() {
  local name="$1"
  local url="$2"
  local expected_code="${3:-200}"

  TOTAL=$((TOTAL + 1))
  local start_ms
  start_ms=$(date +%s%N)

  local http_code
  http_code=$(curl -sf -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null || echo "000")

  local end_ms
  end_ms=$(date +%s%N)
  local duration_ms=$(( (end_ms - start_ms) / 1000000 ))

  if [ "$http_code" = "$expected_code" ]; then
    echo "${TIMESTAMP} OK   ${name} ${url} ${http_code} ${duration_ms}ms"
  else
    echo "${TIMESTAMP} FAIL ${name} ${url} expected=${expected_code} got=${http_code} ${duration_ms}ms"
    FAILED=$((FAILED + 1))
  fi
}

echo "--- Uptime Check ${TIMESTAMP} ---"

# Core services
check_endpoint "api-health"  "${API_URL}/health"
check_endpoint "web-app"     "${WEB_URL}/"
check_endpoint "blog"        "${BLOG_URL}/"
check_endpoint "docs"        "${DOCS_URL}/"

# API endpoints
check_endpoint "api-swagger"  "${API_URL}/swagger/index.html"

echo "--- Results: ${TOTAL} checked, $((TOTAL - FAILED)) passed, ${FAILED} failed ---"

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi

exit 0
