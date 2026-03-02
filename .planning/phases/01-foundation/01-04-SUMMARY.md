---
phase: 01-foundation
plan: "04"
subsystem: testing
tags: [vitest, stripe, prisma, rls, nestjs, postgresql, docker, pg, swc]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "01-03: PostgreSQL RLS policies, nestjs-cls tenant extension, stripe_events table, PrismaService"
provides:
  - "Stripe webhook stub at POST /webhooks/stripe with idempotency check (stripeEvent.findUnique + create)"
  - "Vitest integration test suite with SWC/NestJS decorator support"
  - "Cross-tenant isolation proof: Venue A queries cannot return Venue B rows via RLS + Prisma extension"
  - "Docker-based test runner bypassing WSL2 SCRAM-SHA-256 proxy issue"
  - "Non-superuser bitebyte_app role enforcing RLS during tests"
affects:
  - "02-menu-management: relies on RLS isolation being proven"
  - "03-payments: Stripe webhook stub established idempotency pattern for full Phase 3 handler"

# Tech tracking
tech-stack:
  added:
    - "stripe@^17.0.0 — Stripe SDK for webhook signature verification"
    - "@prisma/adapter-pg@^7.0.0 — Prisma 7 Rust-free driver adapter (pg-based)"
    - "pg@^8.0.0 — PostgreSQL Node.js client (underlying adapter for Prisma)"
    - "vitest@^2.1.9 — Test runner replacing Jest for ESM/TypeScript native support"
    - "@swc/core@^1.0.0 — Speedy Web Compiler for Vitest NestJS decorator transforms"
    - "unplugin-swc@^1.0.0 — Vite plugin bridging SWC into Vitest"
    - "@vitest/coverage-v8@^2.0.0 — V8 coverage provider for Vitest"
    - "@nestjs/testing@^11.0.0 — NestJS test module for ClsService bootstrap"
    - "@types/pg@^8.0.0 — TypeScript types for pg client"
  patterns:
    - "Dual-PrismaClient test pattern: adminPrisma (superuser) for setup/teardown, appPrisma (non-superuser) for RLS assertions"
    - "Docker-based integration tests on internal Docker network to bypass WSL2 proxy"
    - "Stripe webhook idempotency: findUnique check before create, unique constraint as atomic guard"
    - "vitest.config.ts dotenv injection: load .env in main process, inject only vars not already set in test workers"

key-files:
  created:
    - "apps/api/src/webhooks/stripe-webhook.stub.ts — NestJS controller with Stripe idempotency pattern"
    - "apps/api/src/webhooks/webhooks.module.ts — NestJS module wrapping webhook controller"
    - "apps/api/src/prisma/__tests__/tenant-isolation.spec.ts — Cross-tenant RLS isolation integration test"
    - "apps/api/vitest.config.ts — Vitest with SWC plugin and dotenv env injection"
    - "apps/api/vitest.setup.ts — Minimal Vitest setup file"
    - "scripts/run-api-tests.sh — Docker-based test runner (bypasses WSL2 SCRAM proxy)"
  modified:
    - "apps/api/src/app.module.ts — Added WebhooksModule to imports"
    - "apps/api/src/prisma/prisma.service.ts — Added PrismaPg adapter (Prisma 7 Rust-free requirement)"
    - "apps/api/prisma.config.ts — Added MIGRATION_DATABASE_URL for admin/migration operations"
    - "apps/api/package.json — Added stripe, @prisma/adapter-pg, pg deps; vitest devDeps; test scripts"
    - "apps/api/.env — Updated DATABASE_URL to bitebyte_app (non-superuser); added MIGRATION_DATABASE_URL"

key-decisions:
  - "Dual-PrismaClient in tests: adminPrisma uses ADMIN_DATABASE_URL (bitebyte superuser) for setup/teardown bypassing RLS; appPrisma uses DATABASE_URL (bitebyte_app non-superuser) for isolation assertions — required because PostgreSQL superusers bypass ALL RLS checks"
  - "Test infrastructure runs inside Docker (scripts/run-api-tests.sh) on bite-byte_default network — WSL2 Docker Desktop proxy blocks SCRAM-SHA-256 auth for Node.js TCP connections to localhost:5433"
  - "bitebyte_app non-superuser role created for application use — superuser bitebyte bypasses all RLS even with FORCE ROW LEVEL SECURITY"
  - "Prisma 7 requires explicit PrismaPg driver adapter — no automatic DATABASE_URL reading without it; constructor fails if adapter is absent"
  - "SWC plugin must NOT set module.type='commonjs' in vitest.config.ts — this causes 'Vitest cannot be imported in CommonJS module' error; leave module transform to Vitest's own pipeline"
  - "Stripe webhook stub uses sk_test_placeholder when STRIPE_SECRET_KEY not set — full verification deferred to Phase 3"

patterns-established:
  - "Dual-PrismaClient test pattern: always use superuser connection for test data setup, non-superuser for RLS assertion tests"
  - "All Node.js-to-PostgreSQL tests must run inside Docker container on internal network (WSL2 SCRAM constraint)"
  - "Prisma 7 adapter initialization: new PrismaPg({ connectionString }) passed to new PrismaClient({ adapter })"
  - "Stripe idempotency: findUnique before create, unique DB constraint as race-condition guard"

requirements-completed: [INFR-01, INFR-02]

# Metrics
duration: ~90min
completed: 2026-03-03
---

# Phase 01 Plan 04: Stripe Webhook Stub and Tenant Isolation Test Summary

**Stripe webhook stub with idempotency guard (stripeEvent.findUnique + create) and Vitest integration tests proving PostgreSQL RLS + Prisma extension enforces cross-tenant isolation using a dual-PrismaClient pattern inside Docker**

## Performance

- **Duration:** ~90 min (including significant debugging of WSL2/Docker/RLS/Prisma 7 issues)
- **Started:** 2026-03-03T17:00:00Z (approx)
- **Completed:** 2026-03-03T19:06:11Z
- **Tasks:** 2/2
- **Files modified:** 10

## Accomplishments
- Stripe webhook stub at `POST /webhooks/stripe` with correct idempotency check (findUnique + create on stripeEvent table)
- Vitest integration test suite configured for NestJS with SWC decorator support
- All 3 cross-tenant isolation tests pass: Venue A cannot see Venue B, Venue B cannot see Venue A, no-context pass-through verified
- Established Docker-based test runner pattern to bypass WSL2 Docker Desktop SCRAM-SHA-256 proxy block
- Non-superuser `bitebyte_app` PostgreSQL role confirmed as RLS enforcement mechanism

## Task Commits

Each task was committed atomically:

1. **Task 1: Stripe webhook stub endpoint** - `07ace42` (feat)
2. **Task 2: Vitest setup and cross-tenant isolation test** - `82fea38` (feat)

**Plan metadata:** (docs commit — see final_commit)

## Files Created/Modified
- `apps/api/src/webhooks/stripe-webhook.stub.ts` — Stripe webhook NestJS controller with idempotency pattern
- `apps/api/src/webhooks/webhooks.module.ts` — NestJS module for webhook controller
- `apps/api/src/app.module.ts` — Added WebhooksModule import
- `apps/api/src/prisma/prisma.service.ts` — Updated to use PrismaPg adapter (Prisma 7 requirement)
- `apps/api/src/prisma/__tests__/tenant-isolation.spec.ts` — Cross-tenant RLS isolation integration test (3 tests)
- `apps/api/vitest.config.ts` — Vitest configuration with SWC plugin and dotenv injection
- `apps/api/vitest.setup.ts` — Minimal Vitest setup placeholder
- `apps/api/prisma.config.ts` — Added MIGRATION_DATABASE_URL for admin connection
- `apps/api/package.json` — Added all new dependencies and test scripts
- `scripts/run-api-tests.sh` — Docker-based test runner script

## Decisions Made

1. **Dual-PrismaClient test pattern**: The test uses `adminPrisma` (superuser `bitebyte`, bypasses RLS) for test setup/teardown and `appPrisma` (non-superuser `bitebyte_app`, subject to RLS) for isolation assertions. This is required because PostgreSQL superusers bypass ALL RLS policies even with `FORCE ROW LEVEL SECURITY`.

2. **Tests run inside Docker**: `scripts/run-api-tests.sh` runs tests in a Node.js container on the `bite-byte_default` Docker network. WSL2 Docker Desktop proxy intercepts TCP connections to `localhost:5433` and blocks SCRAM-SHA-256 auth for Node.js `pg` client — the only reliable workaround is running inside Docker.

3. **SWC plugin without `module.type='commonjs'`**: The plan's vitest.config.ts snippet included `module: { type: 'commonjs' }` in SWC options, but this causes "Vitest cannot be imported in a CommonJS module" error. Removed it.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] SWC `module.type='commonjs'` causes Vitest ESM import failure**
- **Found during:** Task 2 (Vitest setup)
- **Issue:** Plan template included `module: { type: 'commonjs' }` in SWC plugin config; this overrides Vitest's ESM pipeline and causes "Vitest cannot be imported in a CommonJS module" crash
- **Fix:** Removed the `module` key from SWC plugin configuration in `vitest.config.ts`
- **Files modified:** `apps/api/vitest.config.ts`
- **Verification:** Tests run successfully in Vitest ESM mode
- **Committed in:** `82fea38` (Task 2 commit)

**2. [Rule 2 - Missing Critical] PrismaService missing PrismaPg adapter (Prisma 7 requirement)**
- **Found during:** Task 2 (PrismaClient instantiation in test)
- **Issue:** Prisma 7 Rust-free mode requires an explicit driver adapter — `new PrismaClient()` with no args throws "PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions". PrismaService was using the old empty-constructor pattern.
- **Fix:** Added `PrismaPg` adapter initialization in `PrismaService` constructor; added `@prisma/adapter-pg` and `pg` to dependencies
- **Files modified:** `apps/api/src/prisma/prisma.service.ts`, `apps/api/package.json`
- **Verification:** TypeScript compiles clean, PrismaClient connects successfully
- **Committed in:** `82fea38` (Task 2 commit)

**3. [Rule 3 - Blocking] WSL2 Docker Desktop proxy blocks SCRAM-SHA-256 — tests must run inside Docker**
- **Found during:** Task 2 (running tests)
- **Issue:** Node.js `pg` client cannot authenticate through `localhost:5433` — Docker Desktop WSL2 proxy intercepts TCP and breaks SCRAM-SHA-256 handshake. This is a known WSL2 limitation documented in earlier plans but not addressed in the Vitest test setup.
- **Fix:** Created `scripts/run-api-tests.sh` to run vitest inside a Docker container on `bite-byte_default` network where PostgreSQL is reachable by hostname
- **Files modified:** `scripts/run-api-tests.sh`
- **Verification:** Tests pass when run via `bash scripts/run-api-tests.sh`
- **Committed in:** `82fea38` (Task 2 commit)

**4. [Rule 1 - Bug] PostgreSQL superuser (`bitebyte`) bypasses RLS — tests showed no isolation**
- **Found during:** Task 2 (test assertions)
- **Issue:** Initial test run returned all venues regardless of CLS context because `bitebyte` is a SUPERUSER (`rolsuper=t, rolbypassrls=t`) — PostgreSQL superusers bypass ALL RLS policies. The isolation tests were passing vacuously.
- **Fix:** Created `bitebyte_app` non-superuser role; updated `DATABASE_URL` to use `bitebyte_app`; updated test to use dual-PrismaClient pattern (adminPrisma for setup, appPrisma for isolation assertions); updated `run-api-tests.sh` to pass both `DATABASE_URL` and `ADMIN_DATABASE_URL`
- **Files modified:** `apps/api/.env`, `scripts/run-api-tests.sh`, `apps/api/src/prisma/__tests__/tenant-isolation.spec.ts`
- **Verification:** RLS now rejects queries — isolation tests pass correctly
- **Committed in:** `82fea38` (Task 2 commit)

**5. [Rule 2 - Missing Critical] prisma.config.ts needs MIGRATION_DATABASE_URL for admin operations**
- **Found during:** Task 2 (after bitebyte_app switch)
- **Issue:** After switching `DATABASE_URL` to `bitebyte_app` (non-superuser), Prisma migrations would fail because `bitebyte_app` lacks the privilege to create tables/alter schemas. The superuser connection was needed for migration operations.
- **Fix:** Added `MIGRATION_DATABASE_URL` support to `prisma.config.ts` (`datasource.url` falls back gracefully)
- **Files modified:** `apps/api/prisma.config.ts`, `apps/api/.env`
- **Verification:** Migrations continue to use superuser; app uses non-superuser
- **Committed in:** `82fea38` (Task 2 commit)

---

**Total deviations:** 5 auto-fixed (1 bug in plan template, 1 missing critical, 1 blocking infra, 1 bug in test design, 1 missing critical)
**Impact on plan:** All auto-fixes were necessary for correctness and security. The plan template had an incorrect SWC option; the Docker/RLS/superuser issues were environment-specific but fundamental to the security model. No scope creep.

## Issues Encountered

- **dotenv env injection in Vitest workers**: Vitest workers don't inherit the main process environment automatically. Resolved by loading `.env` in `vitest.config.ts` and injecting only non-overridden vars via `test.env`, allowing Docker's `DATABASE_URL` to take precedence over `.env` values.
- **RLS policy for INSERT**: The Venue INSERT policy uses `qual` as `WITH CHECK` when the latter is NULL, so `id::text = current_setting('app.tenant_id', true)` evaluates to NULL when no tenant is set — rejecting the INSERT. This is correct RLS behavior; the dual-PrismaClient pattern (superuser for inserts) is the correct solution.

## User Setup Required

None — the `bitebyte_app` PostgreSQL role was created during execution. The `.env` file is gitignored and must be configured manually in new environments (see existing `.env.example` pattern).

## Next Phase Readiness

- All Phase 1 success criteria satisfied: TypeScript zero errors, 3/3 tenant isolation tests pass, RLS enforced, Stripe webhook stub in place
- Phase 2 (menu management) can proceed — multi-tenant isolation is proven end-to-end
- Phase 3 (payments) can implement the full Stripe webhook handler by extending the stub pattern established here

---
*Phase: 01-foundation*
*Completed: 2026-03-03*

## Self-Check: PASSED

All created files confirmed present on disk:
- `apps/api/src/webhooks/stripe-webhook.stub.ts` - FOUND
- `apps/api/src/webhooks/webhooks.module.ts` - FOUND
- `apps/api/src/prisma/__tests__/tenant-isolation.spec.ts` - FOUND
- `apps/api/vitest.config.ts` - FOUND
- `apps/api/vitest.setup.ts` - FOUND
- `scripts/run-api-tests.sh` - FOUND
- `.planning/phases/01-foundation/01-04-SUMMARY.md` - FOUND

All commits confirmed in git log:
- `07ace42` - feat(01-04): add Stripe webhook stub with idempotency check - FOUND
- `82fea38` - feat(01-04): add Vitest infrastructure and tenant-isolation integration test - FOUND
- `ed1af96` - docs(01-04): complete Stripe webhook stub and tenant isolation plan - FOUND
