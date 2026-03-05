#!/bin/bash
# Check for broken links on HR platform (www, blog, docs)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

FAILED_LINKS=()
SITE="all"
TIMEOUT=10

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Check for broken links on the HR platform."
    echo ""
    echo "Options:"
    echo "  --site all|www|blog|docs  Which site(s) to check (default: all)"
    echo "  --timeout SECONDS         Curl timeout in seconds (default: 10)"
    echo "  -h, --help                Show this help"
    echo ""
    echo "Examples:"
    echo "  ./scripts/check-broken-links.sh                # Check all sites"
    echo "  ./scripts/check-broken-links.sh --site www     # Check HR site only"
    echo "  ./scripts/check-broken-links.sh --site docs    # Check docs only"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --site)
            SITE="$2"
            shift 2
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

check_url() {
    local url="$1"
    local base_url="$2"
    local full_url="${base_url}${url}"

    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$full_url" 2>/dev/null || echo "000")

    if [ "$status" = "404" ]; then
        echo "  ❌ 404: $url"
        FAILED_LINKS+=("$url @ $base_url")
    elif [ "$status" = "200" ] || [ "$status" = "301" ] || [ "$status" = "302" ] || [ "$status" = "308" ]; then
        echo "  ✓ $url ($status)"
    elif [ "$status" = "000" ]; then
        echo "  ⚠ TIMEOUT/ERROR: $url (check if server is running)"
    else
        echo "  ⚠ $url ($status)"
    fi
}

check_www() {
    local base_url="http://localhost:3010"
    echo ""
    echo "=== HR Site (localhost:3010) ==="

    check_url "/" "$base_url"
    check_url "/en" "$base_url"
    check_url "/en/hr-tools" "$base_url"
    check_url "/en/hr-tools/salary-calculator" "$base_url"
    check_url "/en/hr-tools/leave-calculator" "$base_url"
    check_url "/en/hr-tools/employment-cost-calculator" "$base_url"
    check_url "/en/hr-tools/ai-assistant" "$base_url"
    check_url "/en/about" "$base_url"
    check_url "/en/privacy" "$base_url"
    check_url "/en/terms" "$base_url"
    check_url "/bg" "$base_url"
    check_url "/bg/hr-tools" "$base_url"
}

check_blog() {
    local base_url="http://localhost:3013"
    echo ""
    echo "=== HR Blog (localhost:3013) ==="

    check_url "/" "$base_url"
    check_url "/blog" "$base_url" 2>/dev/null || true
}

check_docs() {
    local base_url="http://localhost:3011"
    echo ""
    echo "=== HR Docs (localhost:3011) ==="

    check_url "/" "$base_url"
    check_url "/en/introduction" "$base_url" 2>/dev/null || true
}

# Check servers are accessible
echo "Checking HR platform sites..."
echo ""

case "$SITE" in
    www)
        check_www
        ;;
    blog)
        check_blog
        ;;
    docs)
        check_docs
        ;;
    all)
        check_www
        check_blog
        check_docs
        ;;
    *)
        echo "Error: Unknown site '$SITE'. Must be: all, www, blog, or docs"
        exit 1
        ;;
esac

echo ""
echo "=== Summary ==="

if [ ${#FAILED_LINKS[@]} -eq 0 ]; then
    echo "✅ No 404 errors found!"
    exit 0
else
    echo "❌ Found ${#FAILED_LINKS[@]} broken link(s):"
    for failed in "${FAILED_LINKS[@]}"; do
        echo "  $failed"
    done
    exit 1
fi
