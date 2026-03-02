---
phase: 01-foundation
plan: "01"
subsystem: infra
tags: [turborepo, pnpm, typescript, zod, nextjs, nestjs, docker, postgres]

# Dependency graph
requires: []
provides:
  - Turborepo pnpm monorepo with apps/web and apps/api workspaces
  - Shared packages/tsconfig with strict base/nextjs/nestjs TypeScript configs
  - Shared packages/types with Zod schemas for Venue, MenuCategory, MenuItem, Order, OrderItem
  - Next.js 15 web app skeleton (App Router, @bite-byte/types dep)
  - NestJS 11 API skeleton with health endpoint, rawBody:true for Stripe
  - docker-compose.yml with postgres:16-alpine and named volume
affects: [02, 03, 04]

# Tech tracking
tech-stack:
  added:
    - turbo@2.8.12
    - typescript@5.9.3
    - zod@^3.0.0
    - next@^15.0.0
    - react@^19.0.0
    - "@nestjs/common@^11.0.0"
    - "@nestjs/core@^11.0.0"
    - "@nestjs/platform-express@^11.0.0"
    - "@nestjs/config@^4.0.0"
    - nestjs-cls@^6.0.0
    - reflect-metadata@^0.2.0
    - "@nestjs/cli@^11.0.0"
  patterns:
    - Turborepo task pipeline with persistent dev and ^build dependency chain
    - Shared tsconfig packages extended by app-level configs (rootDir/outDir in app config, not shared)
    - Zod schemas in packages/types as single source of truth for cross-app type contracts
    - NestJS bootstrap with rawBody:true for future Stripe webhook support

key-files:
  created:
    - package.json
    - pnpm-workspace.yaml
    - turbo.json
    - docker-compose.yml
    - .env.example
    - .gitignore
    - packages/tsconfig/base.json
    - packages/tsconfig/nextjs.json
    - packages/tsconfig/nestjs.json
    - packages/types/src/index.ts
    - packages/types/src/venue.types.ts
    - packages/types/src/menu.types.ts
    - packages/types/src/order.types.ts
    - apps/web/src/app/layout.tsx
    - apps/web/src/app/page.tsx
    - apps/api/src/main.ts
    - apps/api/src/app.module.ts
    - apps/api/src/app.controller.ts
    - apps/api/src/app.service.ts
  modified: []

key-decisions:
  - "@nestjs/config uses own version scheme (4.x), not NestJS framework versioning (11.x)"
  - "rootDir and outDir removed from packages/tsconfig/nestjs.json — must be set in app-level tsconfig to resolve correctly relative to consuming project"
  - "pnpm-workspace.yaml discovers apps/* and packages/* — all workspace packages symlinked on install"
  - "turbo.json dev task: persistent:true + dependsOn:['^build'] ensures packages/types is compiled before dev servers start"

patterns-established:
  - "Pattern 1: Shared tsconfig — base.json holds strictness rules; nextjs.json and nestjs.json add framework-specific options; app tsconfigs set rootDir/outDir"
  - "Pattern 2: Zod schemas in packages/types — exported from index.ts, consumed by both web and api via workspace:* dependency"
  - "Pattern 3: NestJS rawBody — bootstrap must include rawBody:true for Stripe webhook signature verification"

requirements-completed: [INFR-01]

# Metrics
duration: 5min
completed: 2026-03-03
---

# Phase 1 Plan 01: Turborepo Monorepo Foundation Summary

**Compilable pnpm Turborepo monorepo with shared Zod types, Next.js 15 web skeleton, NestJS 11 API skeleton with rawBody:true, and postgres:16-alpine Docker Compose**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-02T17:11:56Z
- **Completed:** 2026-03-03T00:06:54Z (next day, session paused and resumed)
- **Tasks:** 2 of 2
- **Files modified:** 31

## Accomplishments
- Monorepo root with turbo.json pipeline (persistent dev, ^build dependency chain ensuring packages/types compiles before apps start)
- packages/types with Zod v3 schemas for all core domain entities (Venue, MenuCategory, MenuItem, Order, OrderItem with JSONB extensibility hooks)
- apps/web Next.js 15 skeleton with @bite-byte/types workspace dep and App Router layout
- apps/api NestJS 11 skeleton with health endpoint, rawBody:true bootstrap, @nestjs/config
- docker-compose.yml with postgres:16-alpine, healthcheck, and named postgres_data volume
- pnpm type-check passes for all 4 packages (types, tsconfig, web, api)

## Task Commits

Each task was committed atomically:

1. **Task 1: Turborepo root and shared packages scaffold** - `c0e888a` (feat)
2. **Task 2: Next.js web and NestJS API app skeletons** - `8e88fec` (feat)

## Files Created/Modified
- `package.json` - Root monorepo: name bite-byte, pnpm@9, turbo+typescript devDeps
- `pnpm-workspace.yaml` - Workspace discovery for apps/* and packages/*
- `turbo.json` - Task pipeline: build/dev/lint/type-check with persistent dev
- `docker-compose.yml` - postgres:16-alpine with healthcheck and named volume
- `.env.example` - DATABASE_URL, PORT, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- `.gitignore` - node_modules, .env, .next, dist, .turbo, tsbuildinfo
- `packages/tsconfig/base.json` - Strict TypeScript base: ES2022, CommonJS, strict, noUncheckedIndexedAccess
- `packages/tsconfig/nextjs.json` - Next.js config: ESNext module, bundler resolution, jsx:preserve
- `packages/tsconfig/nestjs.json` - NestJS config: emitDecoratorMetadata, experimentalDecorators
- `packages/types/src/venue.types.ts` - PaymentModeSchema, VenueSchema (Zod)
- `packages/types/src/menu.types.ts` - MenuItemMetadataSchema (passthrough), MenuCategorySchema, MenuItemSchema
- `packages/types/src/order.types.ts` - OrderStatusSchema, PaymentMethodSchema, OrderItemSchema, OrderSchema
- `packages/types/src/index.ts` - Re-exports all domain types
- `apps/web/src/app/layout.tsx` - Minimal root layout with html/body
- `apps/web/src/app/page.tsx` - Placeholder home page
- `apps/api/src/main.ts` - NestJS bootstrap with rawBody:true and global /api prefix
- `apps/api/src/app.module.ts` - Root module with ConfigModule.forRoot(isGlobal:true)
- `apps/api/src/app.controller.ts` - GET /health endpoint
- `apps/api/src/app.service.ts` - health() method returning {status:'ok'}

## Decisions Made
- `@nestjs/config` uses its own version scheme (currently 4.x) separate from NestJS framework (11.x). Plan specified ^11.0.0 which does not exist — fixed to ^4.0.0.
- `rootDir` and `outDir` must NOT be set in shared tsconfig packages — TypeScript resolves them relative to the tsconfig file location, not the consuming project. Both were removed from nestjs.json and added to apps/api/tsconfig.json instead.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] @nestjs/config version does not follow NestJS major versioning**
- **Found during:** Task 2 (pnpm install)
- **Issue:** Plan specified `@nestjs/config@^11.0.0` but package's latest is 4.0.3; install failed with ERR_PNPM_NO_MATCHING_VERSION
- **Fix:** Changed version specifier to `^4.0.0` in apps/api/package.json
- **Files modified:** apps/api/package.json
- **Verification:** pnpm install succeeded, all 342 packages resolved
- **Committed in:** 8e88fec (Task 2 commit)

**2. [Rule 1 - Bug] rootDir/outDir in shared nestjs.json resolved relative to packages/tsconfig, not apps/api**
- **Found during:** Task 2 (pnpm type-check)
- **Issue:** `error TS6059: File 'apps/api/src/main.ts' is not under 'rootDir' '/home/alfie/bite-byte/packages/tsconfig/src'`
- **Fix:** Removed `rootDir` and `outDir` from packages/tsconfig/nestjs.json; added them to apps/api/tsconfig.json compilerOptions
- **Files modified:** packages/tsconfig/nestjs.json, apps/api/tsconfig.json
- **Verification:** pnpm type-check passes for all 4 packages with 0 TypeScript errors
- **Committed in:** 8e88fec (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking install error, 1 TypeScript config bug)
**Impact on plan:** Both auto-fixes necessary for the monorepo to compile. No scope creep.

## Issues Encountered
- None beyond the auto-fixed deviations above.

## User Setup Required
None — no external service configuration required for this plan. Docker Compose PostgreSQL starts with `docker compose up -d`.

## Next Phase Readiness
- Monorepo compiles cleanly: `pnpm type-check` passes for all 4 packages
- packages/types Zod schemas ready for use in Plans 02 and 03
- apps/api ready for Prisma schema (Plan 02) and tenant middleware (Plan 03)
- apps/web ready for Auth UI (Plan 04)
- docker-compose.yml ready: `docker compose up -d` starts PostgreSQL 16

---
*Phase: 01-foundation*
*Completed: 2026-03-03*

## Self-Check: PASSED

- SUMMARY.md: FOUND at .planning/phases/01-foundation/01-01-SUMMARY.md
- packages/types/dist/index.js: FOUND
- packages/types/dist/index.d.ts: FOUND
- apps/api/src/main.ts: FOUND (contains rawBody: true)
- docker-compose.yml: FOUND (contains postgres:16-alpine)
- Commit c0e888a: FOUND (Task 1 - turborepo root and shared packages)
- Commit 8e88fec: FOUND (Task 2 - Next.js web and NestJS API skeletons)
- Commit 847949d: FOUND (docs - plan metadata, SUMMARY, STATE, ROADMAP)
