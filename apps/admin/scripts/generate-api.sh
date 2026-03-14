#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADMIN_DIR="$(dirname "$SCRIPT_DIR")"
SWAGGER_SRC="$ADMIN_DIR/../../services/api/docs/swagger.json"
GENERATED_DIR="$ADMIN_DIR/src/api/generated"

mkdir -p "$GENERATED_DIR"

echo "Converting Swagger 2.0 to OpenAPI 3.0..."
npx swagger2openapi "$SWAGGER_SRC" -o "$GENERATED_DIR/openapi.json"

echo "Generating TypeScript types..."
npx openapi-typescript "$GENERATED_DIR/openapi.json" -o "$GENERATED_DIR/api.d.ts"

echo "Done! Types generated at $GENERATED_DIR/api.d.ts"
