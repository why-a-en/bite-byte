# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-02)

**Core value:** Customers can go from scanning a QR code to having their order in the kitchen in under 60 seconds, with zero friction and zero staff interaction.
**Current focus:** Phase 2 — Auth and Venue Setup

## Current Position

**Current Phase:** 2
**Current Phase Name:** Auth and Venue Setup
**Total Phases:** 4
**Current Plan:** 2
**Total Plans in Phase:** 5
**Status:** In progress
**Last Activity:** 2026-03-03
**Last Activity Description:** Phase 2 Plan 01 complete — NestJS auth module with JWT
**Progress:** [██████████] 20%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: 5min
- Total execution time: 5min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 1/7 | 5min | 5min |

**Recent Trend:**
- Last 5 plans: 01-01 (5min)
- Trend: —

*Updated after each plan completion*
| Phase 1 P1 | 5min | 2 tasks | 31 files |
| Phase 01-foundation P02 | 21min | 2 tasks | 8 files |
| Phase 01-foundation P03 | 6min | 2 tasks | 6 files |
| Phase 01-foundation P04 | 90min | 2 tasks | 10 files |
| Phase 02-auth-and-venue-setup P01 | 7min | 2 tasks | 14 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- All WebSocket code lives exclusively in NestJS (Railway) — never in Next.js API routes (Vercel constraint)
- Payment state is webhook-driven only — `payment_intent.succeeded` is the sole trigger for RECEIVED status
- Shared-schema multi-tenancy with Prisma query extension + PostgreSQL RLS as security backstop
- Prisma 7 (Rust-free) chosen over Drizzle for solo-developer DX (Studio, auto-migrations)
- @nestjs/config uses own version scheme (4.x), not NestJS framework versioning (11.x)
- rootDir/outDir must be set in app-level tsconfig, not shared packages/tsconfig/nestjs.json (resolves relative to shared file location)
- [Phase 1]: @nestjs/config uses own version scheme (4.x), separate from NestJS framework versioning (11.x) — plan specs were wrong
- [Phase 1]: rootDir/outDir must be set in app-level tsconfig.json, not shared packages/tsconfig/nestjs.json — TypeScript resolves paths relative to the config file location
- [Phase 01]: Prisma 7 removes datasource url from schema.prisma — URL now in prisma.config.ts only (breaking change vs Prisma 5/6)
- [Phase 01]: Docker postgres mapped to port 5433 (not 5432) — local PostgreSQL 14 occupies 5432 on this WSL2 machine
- [Phase 01]: WSL2 Docker Desktop proxy fails SCRAM-SHA-256 auth through Windows port forwarding — prisma migrate dev must run inside a Docker container on the same network using service hostname (bite-byte-postgres-1)
- [Phase 01-foundation]: Prisma client imported from custom output path (../generated/prisma/client) not @prisma/client — Prisma 7 custom generator output requires direct path import
- [Phase 01-foundation]: RLS migration timestamp must be after init migration — 20260302173901_add_rls ensures correct apply order in fresh deployments (plan specified 20260302000001 which would fail on tables-not-yet-created)
- [Phase 01-foundation]: RLS verification requires pg_class.relforcerowsecurity — pg_tables view does not have forcerowsecurity column in PostgreSQL 16
- [Phase 01-foundation]: [Phase 01-04]: Dual-PrismaClient test pattern — adminPrisma (superuser) for setup/teardown bypassing RLS, appPrisma (bitebyte_app non-superuser) for isolation assertions; PostgreSQL superusers bypass ALL RLS
- [Phase 01-foundation]: [Phase 01-04]: All API tests must run inside Docker on bite-byte_default network — WSL2 Docker Desktop proxy blocks SCRAM-SHA-256 auth for Node.js pg client connecting to localhost:5433
- [Phase 01-foundation]: [Phase 01-04]: Prisma 7 requires PrismaPg adapter — new PrismaClient({ adapter: new PrismaPg({ connectionString }) }); no-args constructor throws in Rust-free mode
- [Phase 01-foundation]: [Phase 01-04]: Stripe webhook idempotency pattern — stripeEvent.findUnique check before stripeEvent.create; unique DB constraint as atomic race-condition guard; full handler deferred to Phase 3
- [Phase 02-01]: JWT_SECRET validated at JwtStrategy startup — throws Error if undefined, preventing silent auth misconfiguration
- [Phase 02-01]: Users table has NO RLS — users are not tenant-scoped; Venue.ownerId enforced at application query layer via WHERE ownerId = req.user.userId
- [Phase 02-01]: Single 7-day JWT for v1 (no refresh tokens) — owner devices trusted, complexity unwarranted at this stage
- [Phase 02-01]: Docker migration pattern requires full node_modules — bare node:22-alpine container can't load prisma.config.ts; fallback to manual SQL + psql + _prisma_migrations INSERT
- [Phase 02-01]: JwtModule.register global: true — downstream modules inject JwtService without re-importing JwtModule

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 2] Image upload CDN: where do images go in v1? Railway volume, Cloudflare R2, or Vercel Blob — resolve during Phase 2 planning
- [Phase 3] nestjs-zod 4.x compatibility with NestJS 11.x and Zod 3.x needs verification before shared types package is built
- [Phase 4] WebSocket reconnect + REST-fallback hybrid pattern needs careful implementation — plan against Socket.IO docs before coding

## Session Continuity

**Paused At:** None
Last session: 2026-03-03
**Stopped At:** Completed 02-auth-and-venue-setup/02-01-PLAN.md
Resume file: None
