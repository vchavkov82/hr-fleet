#!/bin/sh
# Docker entrypoint for HR site - installs dependencies and starts Next.js

set -e

cd /app

echo "Installing pnpm..."
npm install -g pnpm

echo "Installing dependencies..."
pnpm install

# Patch @swc/core binding to not throw on Alpine (musl) where the native binary
# isn't installed by the optional dep resolution. next-intl depends on @swc/core
# for its extraction compiler, but we don't use that feature.
SWC_BINDING="/app/node_modules/@swc/core/binding.js"
if [ -f "$SWC_BINDING" ] && grep -q "throw new Error.*Failed to load native binding" "$SWC_BINDING"; then
    sed -i "s/throw new Error.*Failed to load native binding.*/nativeBinding = {}/" "$SWC_BINDING"
fi

echo "Starting Next.js dev server..."
exec pnpm dev
