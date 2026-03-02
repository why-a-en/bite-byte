---
phase: 02-auth-and-venue-setup
plan: "01"
subsystem: auth
tags: [jwt, passport, bcrypt, nestjs, prisma, postgres, users]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: PrismaService, PrismaModule, TenantMiddleware, RLS migration, Docker migration pattern

provides:
  - User model in Prisma schema with email + passwordHash
  - Venue.ownerId FK to User
  - Migration 20260303000001_add_user_and_venue_owner applied
  - POST /auth/register — creates user with bcrypt-hashed password, returns JWT
  - POST /auth/login — validates credentials via LocalStrategy, returns JWT
  - JwtAuthGuard — reusable guard protecting all downstream endpoints
  - JwtStrategy — populates req.user with { userId, email } from Bearer token
  - UsersService — findByEmail, findByEmailWithHash, findById, create
  - AuthService — register (hash+create+sign), validateUser, login (sign)

affects:
  - 02-02-venue-management
  - 02-03-menu-management
  - 02-04-dashboard-ui
  - 02-05-frontend-auth
  - 03-customer-ordering
  - all plans requiring authenticated endpoints

# Tech tracking
tech-stack:
  added:
    - "@nestjs/passport@^11.0.5 — Passport.js NestJS integration"
    - "@nestjs/jwt@^11.0.2 — JWT signing/verification"
    - "passport@^0.7 — core Passport.js"
    - "passport-local@^1.0.0 — email+password strategy"
    - "passport-jwt@^4.0.1 — Bearer token JWT strategy"
    - "bcrypt@^6.0.0 — native bcrypt password hashing (12 rounds)"
    - "@types/bcrypt, @types/passport-local, @types/passport-jwt — dev types"
  patterns:
    - "LocalStrategy: usernameField: 'email' override required (Passport default is 'username')"
    - "JwtStrategy: validates JWT_SECRET at startup (throws if undefined)"
    - "SafeUser type: Omit<User, 'passwordHash'> — passwordHash never returned in responses"
    - "bcrypt 12 rounds for registration, bcrypt.compare for login validation"
    - "JwtModule.register with global: true — all modules can inject JwtService"
    - "JwtAuthGuard exported from AuthModule — imported by downstream venue/menu modules"
    - "Users table has NO RLS — users are not tenant-scoped; they own venues"
    - "Venue ownerId queries use WHERE ownerId = req.user.userId at application layer, not RLS"

key-files:
  created:
    - "apps/api/prisma/migrations/20260303000001_add_user_and_venue_owner/migration.sql"
    - "apps/api/src/auth/auth.module.ts"
    - "apps/api/src/auth/auth.controller.ts"
    - "apps/api/src/auth/auth.service.ts"
    - "apps/api/src/auth/strategies/local.strategy.ts"
    - "apps/api/src/auth/strategies/jwt.strategy.ts"
    - "apps/api/src/auth/guards/local-auth.guard.ts"
    - "apps/api/src/auth/guards/jwt-auth.guard.ts"
    - "apps/api/src/users/users.module.ts"
    - "apps/api/src/users/users.service.ts"
  modified:
    - "apps/api/prisma/schema.prisma — added User model, Venue.ownerId FK"
    - "apps/api/src/app.module.ts — added AuthModule and UsersModule to imports"
    - "apps/api/package.json — added auth dependencies"
    - "apps/api/src/prisma/__tests__/tenant-isolation.spec.ts — updated Venue fixtures to include ownerId"
    - ".env.example — added JWT_SECRET placeholder"

key-decisions:
  - "JWT_SECRET validated at startup in JwtStrategy constructor — fails fast if env var missing"
  - "Users table has no RLS (not tenant-scoped); Venue.ownerId enforced at application layer via WHERE clause"
  - "bcrypt 12 rounds chosen for production-appropriate cost with acceptable latency"
  - "Single 7-day JWT (no refresh tokens) for v1 — owner devices are trusted, complexity not warranted"
  - "Docker migration pattern from Phase 1 not usable directly (prisma.config.ts requires prisma package); used manual SQL + psql fallback"
  - "JwtModule registered as global: true so downstream modules don't need to import JwtModule"

patterns-established:
  - "Pattern: LocalAuthGuard on POST /auth/login; req.user populated by LocalStrategy.validate()"
  - "Pattern: JwtAuthGuard on all protected endpoints; req.user = { userId, email } from JWT payload"
  - "Pattern: SafeUser type from UsersService — always select without passwordHash in find methods"
  - "Pattern: JwtStrategy throws Error if JWT_SECRET undefined — prevents silent auth bypass"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03]

# Metrics
duration: 7min
completed: 2026-03-03
---

# Phase 2 Plan 01: Auth and User Model Summary

**NestJS JWT authentication with bcrypt passwords, Passport strategies (local + JWT), and User/Venue schema migration establishing the owner security model for all Phase 2 endpoints**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-02T20:53:30Z
- **Completed:** 2026-03-02T21:00:11Z
- **Tasks:** 2 of 2
- **Files modified:** 14

## Accomplishments

- User model and Venue.ownerId FK added to Prisma schema, migration applied and Prisma client regenerated
- Complete NestJS AuthModule: POST /auth/register (201 + JWT), POST /auth/login (200 + JWT via LocalAuthGuard)
- JwtAuthGuard and JwtStrategy ready for use by all subsequent plans in Phase 2 and beyond
- passwordHash is never returned in any API response (SafeUser type pattern enforced throughout)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add User model to Prisma schema and run migration** - `026f15b` (feat)
2. **Task 2: Build NestJS AuthModule with register, login, JWT strategies, and guards** - `ab59c68` (feat)

**Plan metadata:** _(this commit)_ (docs: complete plan)

## Files Created/Modified

- `apps/api/prisma/schema.prisma` - Added User model and Venue.ownerId FK with owner relation
- `apps/api/prisma/migrations/20260303000001_add_user_and_venue_owner/migration.sql` - Creates users table, adds owner_id to venues
- `apps/api/src/users/users.service.ts` - findByEmail, findByEmailWithHash, findById, create; SafeUser type
- `apps/api/src/users/users.module.ts` - Exports UsersService; imports PrismaModule
- `apps/api/src/auth/auth.service.ts` - register (bcrypt hash + create + sign), validateUser, login (sign JWT)
- `apps/api/src/auth/auth.controller.ts` - POST /auth/register, POST /auth/login with LocalAuthGuard
- `apps/api/src/auth/strategies/local.strategy.ts` - PassportStrategy(Strategy) with usernameField: 'email'
- `apps/api/src/auth/strategies/jwt.strategy.ts` - Bearer token extraction, JWT_SECRET validation, req.user population
- `apps/api/src/auth/guards/local-auth.guard.ts` - AuthGuard('local') wrapper
- `apps/api/src/auth/guards/jwt-auth.guard.ts` - AuthGuard('jwt') wrapper; exported for downstream use
- `apps/api/src/auth/auth.module.ts` - Imports UsersModule, PassportModule, JwtModule (global, 7d expiry)
- `apps/api/src/app.module.ts` - Added AuthModule and UsersModule imports
- `apps/api/package.json` - Added @nestjs/passport, @nestjs/jwt, passport, passport-local, passport-jwt, bcrypt
- `apps/api/src/prisma/__tests__/tenant-isolation.spec.ts` - Updated Venue fixtures to include ownerId FK
- `.env.example` - Added JWT_SECRET placeholder

## Decisions Made

- **JWT_SECRET startup validation**: JwtStrategy constructor throws `Error` if `JWT_SECRET` is undefined — prevents silent auth bypass where all tokens would fail validation at runtime.
- **Single 7-day JWT, no refresh tokens**: v1 tradeoff. Owner devices are trusted, refresh token complexity adds significant implementation overhead. Documented as a future upgrade path.
- **bcrypt 12 rounds**: Industry-recommended cost factor. Adds ~300ms on registration (acceptable), not measurable on page loads.
- **Users table has no RLS**: Users are cross-tenant; the RLS app.tenant_id pattern from Phase 1 is for venue-scoped data only. Owner context enforced at the application query layer via `WHERE ownerId = req.user.userId`.
- **JwtModule.register global: true**: Downstream modules (VenueModule, etc.) can inject JwtService without importing JwtModule themselves.
- **Manual SQL migration fallback**: Docker migration pattern failed because prisma.config.ts requires the `prisma` npm package which isn't installed in the bare node:22-alpine container. Created migration SQL manually and applied via `docker compose exec postgres psql`, then registered in `_prisma_migrations` table.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed JwtStrategy TypeScript type error: `process.env['JWT_SECRET']` can be `undefined`**
- **Found during:** Task 2 (TypeScript compile check)
- **Issue:** `secretOrKey` requires `string | Buffer`, but `process.env[...]` returns `string | undefined`. TypeScript rejected the call.
- **Fix:** Added explicit check — if `JWT_SECRET` is not set, throw `Error` at startup. This converts `string | undefined` to `string` and adds a security invariant (app crashes instead of silently misconfiguring auth).
- **Files modified:** `apps/api/src/auth/strategies/jwt.strategy.ts`
- **Verification:** `npx tsc --noEmit` passes with 0 errors
- **Committed in:** `ab59c68` (Task 2 commit)

**2. [Rule 1 - Bug] Updated tenant-isolation test Venue fixtures to include ownerId**
- **Found during:** Task 2 (TypeScript compile check)
- **Issue:** `adminPrisma.venue.create({ data: { name, slug, paymentMode } })` missing required `ownerId` field after schema change in Task 1.
- **Fix:** Added `adminPrisma.user.create(...)` in `beforeAll` to create a test owner, then passed `ownerId: testOwnerId` to each Venue fixture. Added cleanup in `afterAll` to delete the test user.
- **Files modified:** `apps/api/src/prisma/__tests__/tenant-isolation.spec.ts`
- **Verification:** `npx tsc --noEmit` passes; test fixtures correctly satisfy new schema constraint
- **Committed in:** `ab59c68` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs from TypeScript compile check)
**Impact on plan:** Both fixes necessary for type correctness and security. No scope creep.

## Issues Encountered

- **Docker migration pattern failed**: The `docker run --rm --network bite-byte_default node:22-alpine` approach requires `prisma/config` module to be available, but the bare Alpine container has no `node_modules`. The Phase 1 migration pattern mounted only the `prisma/` directory, not the full project with `node_modules`. Fell back to: create migration SQL manually, apply via `docker compose exec postgres psql`, register in `_prisma_migrations` table with computed SHA-256 checksum.

## User Setup Required

None - JWT_SECRET is set in `apps/api/.env` (gitignored). For production deployment, `JWT_SECRET` must be set as an environment variable (Railway/Vercel). See `.env.example` for the variable name.

## Next Phase Readiness

- JwtAuthGuard is exported from AuthModule — Plan 02 can add `@UseGuards(JwtAuthGuard)` to VenueModule endpoints immediately
- req.user.userId is populated after JwtAuthGuard — VenueService can filter by `WHERE ownerId = req.user.userId`
- No blockers for Plan 02 (venue CRUD)

---
*Phase: 02-auth-and-venue-setup*
*Completed: 2026-03-03*

## Self-Check: PASSED

All files confirmed on disk. All commits verified in git history.
