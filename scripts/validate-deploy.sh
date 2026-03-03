#!/usr/bin/env bash
# Pre-deploy validation: build Docker image and verify the app loads (no MODULE_NOT_FOUND / syntax errors).
# Uses only tracked files (like Render). Run before push: npm run validate:deploy
set -e

IMAGE_NAME="${VALIDATE_IMAGE_NAME:-ecommerce-backend}"
# Dummy URL so we don't hit real DB; we only test that Node can require server.js and run a few seconds
export DATABASE_URL="${VALIDATE_DATABASE_URL:-postgresql://u:p@host/db}"
export NODE_ENV=production

echo "[validate:deploy] Building Docker image..."
docker build -t "$IMAGE_NAME" .

echo "[validate:deploy] Running app load test (require server.js, wait 8s, exit 0)..."
docker run --rm \
  -e DATABASE_URL \
  -e NODE_ENV \
  --entrypoint node \
  "$IMAGE_NAME" \
  -e "require('./src/server.js'); setTimeout(() => process.exit(0), 8000)"

echo "[validate:deploy] OK: app loaded and ran successfully."
exit 0
