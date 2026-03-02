---
phase: 01-foundation
plan: "03"
subsystem: multi-tenant-isolation
tags: [prisma, nestjs-cls, rls, postgresql, middleware, tenant-isolation]

# Dependency graph
requires:
  - phase: 01-foundation
    plan: "02"
    provides: Prisma 7 schema with 6 models migrated to Docker PostgreSQL

provides:
  - PrismaService (extends PrismaClient) with NestJS lifecycle hooks in apps/api/src/prisma/
  - PrismaModule (@Global) exposing PrismaService application-wide
  - prisma-tenant.extension.ts: Prisma $extends $allOperations with array-style $transaction([set_config, query]) + TRUE flag
  - TenantMiddleware: request-scoped venueId resolver writing to CLS context (Phase 1 stub)
  - AppModule wired with ClsModule.forRoot({ global: true }), PrismaModule, TenantMiddleware on all routes
  - PostgreSQL RLS policies (ENABLE + FORCE) on all 5 tenant tables via migration 20260302173901_add_rls

affects: [04, 05, 06, 07]

# Tech tracking
tech-stack:
  added:
    - "nestjs-cls@^6.0.0 (already in package.json from Plan 01; wired into AppModule in this plan)"
  patterns:
    - "PrismaService extends PrismaClient + OnModuleInit/OnModuleDestroy lifecycle hooks"
    - "PrismaModule @Global: exposes PrismaService without per-module imports"
    - "Prisma $extends $allOperations: intercepts all queries, wraps in $transaction([set_config, query]) with TRUE flag (transaction-local scope)"
    - "array-style $transaction([...]) ONLY inside $extends to avoid Prisma #23583 interactive transaction deadlock"
    - "ClsModule.forRoot({ global: true, middleware: { mount: true } }): CLS initialized for all routes"
    - "TenantMiddleware: reads req.venueId, sets VENUE_ID in CLS — stub for Phase 1, extended in Phase 2 (JWT) and Phase 3 (slug)"
    - "PostgreSQL RLS with FORCE ROW LEVEL SECURITY: prevents table owner (Prisma DB user) from bypassing RLS"
    - "current_setting('app.tenant_id', true) in RLS policies: returns NULL if missing (safe deny), not error"
    - "order_items RLS scoped via parent orders table (no direct venue_id column)"

key-files:
  created:
    - apps/api/src/prisma/prisma.service.ts
    - apps/api/src/prisma/prisma.module.ts
    - apps/api/src/prisma/prisma-tenant.extension.ts
    - apps/api/src/common/middleware/tenant.middleware.ts
    - apps/api/prisma/migrations/20260302173901_add_rls/migration.sql
  modified:
    - apps/api/src/app.module.ts

key-decisions:
  - "Prisma client imported from ../generated/prisma/client (not @prisma/client) — Prisma 7 custom output path in schema.prisma generator config"
  - "Migration timestamp 20260302173901 (after init 20260302173804) — ensures correct apply order in fresh deployments"
  - "RLS applied via direct psql (docker compose exec postgres psql) + manually inserted into _prisma_migrations — WSL2 Docker proxy auth issue prevents running prisma migrate deploy on host"
  - "pg_class.relforcerowsecurity used for RLS verification (not pg_tables.forcerowsecurity which doesn't exist in PostgreSQL 16)"

# Metrics
duration: 6min
completed: 2026-03-03
---

# Phase 1 Plan 03: PrismaModule, CLS Tenant Isolation, and RLS Policies Summary

**Dual-layer multi-tenant isolation: Prisma $extends extension intercepts all queries with set_config transaction-local scoping + PostgreSQL FORCE ROW LEVEL SECURITY on all 5 tenant tables, wired via NestJS ClsModule and TenantMiddleware**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-02T17:45:23Z
- **Completed:** 2026-03-02T17:51:00Z
- **Tasks:** 2 of 2
- **Files modified:** 6

## Accomplishments

- PrismaService, PrismaModule (@Global), and prisma-tenant.extension.ts created — application-layer tenant isolation via Prisma $extends using array-style $transaction([set_config, query]) with TRUE flag (transaction-local, safe under connection pooling)
- TenantMiddleware stub created — reads venueId from request, stores in CLS context; ready for Phase 2 JWT extension and Phase 3 slug resolution
- AppModule fully wired: ClsModule.forRoot({ global: true }), PrismaModule, TenantMiddleware applied to all routes via configure()
- PostgreSQL RLS migration applied: ENABLE + FORCE ROW LEVEL SECURITY on venues, menu_categories, menu_items, orders, order_items; tenant_isolation_policy on all 5 tables; stripe_events correctly excluded
- TypeScript compiles with 0 errors

## Task Commits

Each task was committed atomically:

1. **Task 1: PrismaModule, ClsModule, and tenant extension** - `a35d75a` (feat)
2. **Task 2: PostgreSQL RLS policies migration** - `2192e9b` (feat)

## Files Created/Modified

- `apps/api/src/prisma/prisma.service.ts` - PrismaService extends PrismaClient with OnModuleInit ($connect) and OnModuleDestroy ($disconnect) lifecycle hooks
- `apps/api/src/prisma/prisma.module.ts` - @Global() @Module exposing PrismaService; no per-module imports needed in any future NestJS module
- `apps/api/src/prisma/prisma-tenant.extension.ts` - createTenantPrismaExtension(prisma, cls): wraps every query in $transaction([set_config TRUE, query]); passthrough when no venueId (system ops, health checks)
- `apps/api/src/common/middleware/tenant.middleware.ts` - TenantMiddleware: reads req.venueId, sets CLS 'VENUE_ID'; Phase 1 stub, Phase 2 will extend with JWT payload, Phase 3 with venueSlug param
- `apps/api/src/app.module.ts` - Updated AppModule: ClsModule.forRoot({ global: true, middleware: { mount: true } }), PrismaModule, TenantMiddleware.forRoutes('*')
- `apps/api/prisma/migrations/20260302173901_add_rls/migration.sql` - RLS SQL: 5x ALTER TABLE ENABLE/FORCE, 5x CREATE POLICY tenant_isolation_policy

## Decisions Made

- **Prisma client import path:** Imported from `../generated/prisma/client` (the custom output path configured in schema.prisma generator), not from `@prisma/client`. In Prisma 7 with a custom output path, `@prisma/client` redirects to `.prisma/client/default` in the pnpm store — not the custom generated location. Direct path is correct.
- **Migration timestamp ordering:** Used `20260302173901` (after init `20260302173804`) to guarantee correct application order in fresh deployments. The plan specified `20260302000001_add_rls` which would sort before init and fail on fresh deploy (tables don't exist yet).
- **RLS applied via direct psql:** WSL2 Docker Desktop proxy auth issue (documented in Plan 02) prevents running `prisma migrate deploy` on the host. Applied SQL directly via `docker compose exec postgres psql` then manually inserted migration record into `_prisma_migrations`. This is the same workaround established in Plan 02.
- **RLS verification via pg_class:** Plan specified `pg_tables.forcerowsecurity` which doesn't exist in PostgreSQL 16. Used `pg_class.relforcerowsecurity` (and `relrowsecurity`) instead — both show `t` for all 5 tables.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Prisma client import path corrected from @prisma/client to custom output path**
- **Found during:** Task 1 (writing prisma.service.ts)
- **Issue:** Plan specified `import { PrismaClient } from '@prisma/client'` — but with Prisma 7's custom generator output (`../src/generated/prisma`), the generated client is at that path, not at the default @prisma/client location.
- **Fix:** Changed import to `import { PrismaClient } from '../generated/prisma/client'` in both prisma.service.ts and prisma-tenant.extension.ts
- **Files modified:** apps/api/src/prisma/prisma.service.ts, apps/api/src/prisma/prisma-tenant.extension.ts
- **Commit:** a35d75a (Task 1 commit)

**2. [Rule 1 - Bug] Migration timestamp reordered to ensure correct apply sequence**
- **Found during:** Task 2 (creating migration directory)
- **Issue:** Plan specified directory name `20260302000001_add_rls` which sorts before `20260302173804_init`. In a fresh deployment, Prisma would attempt to apply RLS policies before tables exist — guaranteed failure.
- **Fix:** Renamed to `20260302173901_add_rls` (1 minute after init) to guarantee correct apply order.
- **Files modified:** apps/api/prisma/migrations/20260302173901_add_rls/migration.sql
- **Commit:** 2192e9b (Task 2 commit)

**3. [Rule 3 - Blocking] WSL2 Docker proxy auth issue prevents prisma migrate deploy on host**
- **Found during:** Task 2 (attempting to apply migration)
- **Issue:** Same networking constraint documented in Plan 02 — WSL2 Docker Desktop proxy intercepts SCRAM-SHA-256 auth. `prisma migrate deploy` inside Docker container also failed because pnpm symlinks in the mounted api directory don't resolve (pnpm store not mounted). Mounting only prisma files fails because prisma.config.ts needs the prisma package.
- **Fix:** Applied migration SQL directly via `docker compose exec postgres psql` (direct container exec, no network proxy), then manually inserted migration record into `_prisma_migrations` with correct checksum.
- **Files modified:** None (database-only operation)
- **Commit:** 2192e9b (Task 2 commit)

**4. [Rule 1 - Bug] RLS verification query corrected for PostgreSQL 16**
- **Found during:** Task 2 (verifying RLS)
- **Issue:** Plan's verify command used `pg_tables.forcerowsecurity` which doesn't exist in PostgreSQL 16. `pg_tables` view lacks the `forcerowsecurity` column.
- **Fix:** Used `pg_class.relrowsecurity` and `pg_class.relforcerowsecurity` instead — the system catalog table that actually contains these flags.
- **Verification result:** All 5 tables show rowsecurity=t, forcerowsecurity=t

---

**Total deviations:** 4 auto-fixed (Rules 1 and 3)
**Impact on plan:** All fixes were necessary for correctness. The security outcome (dual-layer isolation) is exactly as planned. The WSL2 workaround is consistent with the approach documented in Plan 02.

## Next Phase Readiness

- INFR-01 satisfied: Application-layer (Prisma $extends $allOperations) + Database-layer (PostgreSQL FORCE RLS) dual isolation in place
- PrismaModule @Global: all future NestJS modules can inject PrismaService without additional imports
- ClsModule @Global: all future guards, interceptors, and middleware can read/write CLS context
- TenantMiddleware stub: ready for Phase 2 JWT extension and Phase 3 slug resolution
- RLS policies: all 5 tenant tables protected at DB level; every new table added in future phases must be added here too (documented anti-pattern from RESEARCH.md)
- Plans 04-07 can proceed — the isolation layer is the foundation all business logic depends on

---
*Phase: 01-foundation*
*Completed: 2026-03-03*

## Self-Check: PASSED

- apps/api/src/prisma/prisma.service.ts: FOUND
- apps/api/src/prisma/prisma.module.ts: FOUND
- apps/api/src/prisma/prisma-tenant.extension.ts: FOUND
- apps/api/src/common/middleware/tenant.middleware.ts: FOUND
- apps/api/src/app.module.ts: FOUND (updated with ClsModule, PrismaModule, TenantMiddleware)
- apps/api/prisma/migrations/20260302173901_add_rls/migration.sql: FOUND
- .planning/phases/01-foundation/01-03-SUMMARY.md: FOUND
- Commit a35d75a: FOUND (Task 1 - PrismaModule, ClsModule, tenant extension)
- Commit 2192e9b: FOUND (Task 2 - RLS migration)
- RLS verification: all 5 tables show rowsecurity=t, forcerowsecurity=t; stripe_events has no RLS
- TypeScript: 0 errors (npx tsc --noEmit)
