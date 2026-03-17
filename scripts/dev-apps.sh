#!/bin/bash
# Start all HR frontend dev servers in parallel with colored output
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

# Colors
C_RESET='\033[0m'
C_BOLD='\033[1m'
C_HR='\033[35m'        # magenta
C_HR_BLOG='\033[32m'   # green
C_HR_DOCS='\033[37m'   # white
C_HR_ADMIN='\033[36m'  # cyan

prefix() {
  local color="$1"
  local label="$2"
  while IFS= read -r line; do
    printf "${color}[%-10s]${C_RESET} %s\n" "$label" "$line"
  done
}

# Kill previous dev server processes on HR ports
echo "Killing previous dev servers (if any)..."
"$SCRIPT_DIR/kill-ports.sh" || echo "No conflicting ports found"
echo ""

PIDS=()

cleanup() {
  echo ""
  echo "Stopping all dev servers..."
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  wait 2>/dev/null || true
  echo "Done."
}
trap cleanup INT TERM EXIT

echo ""
echo -e "${C_BOLD}Starting HR frontend dev servers...${C_RESET}"
echo ""

(cd apps/web  && PORT=5010 pnpm dev  2>&1 | prefix "$C_HR"        "hr"       ) &
PIDS+=($!)

(cd apps/blog && pnpm dev            2>&1 | prefix "$C_HR_BLOG"   "hr-blog"  ) &
PIDS+=($!)

(cd apps/docs && pnpm dev            2>&1 | prefix "$C_HR_DOCS"   "hr-docs"  ) &
PIDS+=($!)

(cd apps/admin && pnpm dev           2>&1 | prefix "$C_HR_ADMIN"  "hr-admin" ) &
PIDS+=($!)

sleep 2

echo ""
echo -e "${C_BOLD}Dev servers started. Access URLs:${C_RESET}"
echo ""
echo -e "  ${C_HR}HR site${C_RESET}          http://localhost:5010"
echo -e "  ${C_HR_BLOG}HR blog${C_RESET}          http://localhost:5013"
echo -e "  ${C_HR_DOCS}HR docs${C_RESET}          http://localhost:5011"
echo ""
echo -e "Press ${C_BOLD}Ctrl+C${C_RESET} to stop all servers."
echo ""

wait
