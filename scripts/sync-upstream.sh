#!/usr/bin/env bash
# Fetch OCA upstream 18.0 branch for all submodules and merge into origin 18.0
#
# Usage: ./scripts/sync-upstream.sh [submodule-name]
#   No args  → sync all submodules
#   With arg → sync only that submodule (e.g. "payroll")

set -euo pipefail

ADDONS_DIR="deploy/odoo-addons"
BRANCH="18.0"
cd "$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)"

submodules=(
  server-tools payroll hr hr-holidays hr-attendance hr-expense
  timesheet reporting-engine account-financial-reporting web
  project fleet rest-framework queue contract partner-contact
  data-protection survey server-ux
)

# Filter to single submodule if argument provided
if [[ ${1:-} ]]; then
  submodules=("$1")
fi

ok=0
fail=0

for name in "${submodules[@]}"; do
  dir="$ADDONS_DIR/$name"
  if [[ ! -d "$dir/.git" && ! -f "$dir/.git" ]]; then
    echo "SKIP $name (not initialized)"
    continue
  fi

  echo "── $name ──"
  if (
    cd "$dir"
    git fetch upstream "$BRANCH" --quiet
    git merge upstream/"$BRANCH" --ff-only --quiet
    git push origin "$BRANCH" --quiet
  ); then
    echo "   ✓ synced"
    ok=$((ok + 1))
  else
    echo "   ✗ FAILED (non-fast-forward? resolve manually)"
    fail=$((fail + 1))
  fi
done

echo ""
echo "Done: $ok synced, $fail failed"
[[ $fail -eq 0 ]]
