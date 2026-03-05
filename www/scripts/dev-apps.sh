#!/bin/bash
# Start frontend development servers in parallel

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
  echo -e "\n${RED}Stopping all dev servers...${NC}"
  jobs -p | xargs -r kill 2>/dev/null || true
  echo "Done."
}

trap cleanup EXIT

# Check if port 3010 is in use and kill if necessary
PORT=3010
echo "Checking port $PORT..."
pids=$(ss -ltnp "sport = :$PORT" 2>/dev/null | sed -n "s/.*pid=\([0-9]\+\).*/\1/p" | sort -u) || pids=""
if [ -n "$pids" ]; then
  echo "Port $PORT is in use (pids: $pids), attempting to free it..."
  for i in 1 2 3; do
    echo "Attempt $i..."
    kill -9 $pids 2>/dev/null || true
    sleep 1
    pids=$(ss -ltnp "sport = :$PORT" 2>/dev/null | sed -n "s/.*pid=\([0-9]\+\).*/\1/p" | sort -u) || pids=""
    [ -z "$pids" ] && break
  done
  
  if ss -ltn "sport = :$PORT" 2>/dev/null | grep -q ":$PORT"; then
    echo "Error: Port $PORT is still in use"
    ss -ltnp "sport = :$PORT" 2>/dev/null || true
    exit 1
  fi
fi

echo -e "${BLUE}Starting HR frontend dev servers...${NC}\n"

# Start dev servers in parallel with named output
(cd www && NEXT_DISABLE_FAST_REFRESH=1 next dev -H 0.0.0.0 -p 3010 2>&1 | while IFS= read -r line; do echo -e "${PURPLE}[hr        ]${NC} $line"; done) &
WWW_PID=$!

sleep 2

(cd blog && bun dev 2>&1 | while IFS= read -r line; do echo -e "${GREEN}[hr-blog   ]${NC} $line"; done) &
BLOG_PID=$!

(cd docs && astro dev --host 2>&1 | while IFS= read -r line; do echo -e "${CYAN}[hr-docs   ]${NC} $line"; done) &
DOCS_PID=$!

echo ""
echo -e "${BLUE}Dev servers started. Access URLs:${NC}\n"
echo -e "  ${PURPLE}HR site${NC}          http://localhost:3010"
echo -e "  ${GREEN}HR blog${NC}          http://localhost:3013"
echo -e "  ${CYAN}HR docs${NC}          http://localhost:3011"
echo ""
echo "Press ${BLUE}Ctrl+C${NC} to stop all servers."
echo ""

# Wait for any process to fail
wait -n
