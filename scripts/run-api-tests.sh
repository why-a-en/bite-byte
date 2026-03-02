#!/usr/bin/env bash
# Run API integration tests inside Docker to bypass WSL2 Docker Desktop proxy SCRAM issue.
# Mounts the project source and runs vitest in a Node.js container on the Docker network.
# Uses bitebyte_app (non-superuser) so PostgreSQL RLS policies are enforced during tests.
# Uses bitebyte (superuser) as ADMIN_DATABASE_URL for test setup/teardown (bypasses RLS).

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

docker run --rm \
  --network bite-byte_default \
  -e DATABASE_URL="postgresql://bitebyte_app:bitebyte_app@postgres:5432/bitebyte_dev" \
  -e ADMIN_DATABASE_URL="postgresql://bitebyte:bitebyte@postgres:5432/bitebyte_dev" \
  -e NODE_ENV=test \
  -v "${PROJECT_ROOT}:/app" \
  -w /app \
  node:22-alpine \
  sh -c "
    cd /app &&
    corepack enable pnpm &&
    pnpm --filter @bite-byte/api test 2>&1
  "
