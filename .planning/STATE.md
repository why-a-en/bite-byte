# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-02)

**Core value:** Customers can go from scanning a QR code to having their order in the kitchen in under 60 seconds, with zero friction and zero staff interaction.
**Current focus:** Phase 3 — Customer Ordering

## Current Position

**Current Phase:** 3 (complete)
**Current Phase Name:** Customer Ordering
**Total Phases:** 4
**Current Plan:** 5/5 (all complete)
**Total Plans in Phase:** 5
**Status:** Phase complete — ready for verification
**Last Activity:** 2026-04-03
**Last Activity Description:** Completed quick task 6: Polish landing page light theme
**Progress:** [█████████░] 89%

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
| Phase 02-auth-and-venue-setup P02 | 5min | 2 tasks | 10 files |
| Phase 02-auth-and-venue-setup P03 | 6min | 2 tasks | 16 files |
| Phase 02-auth-and-venue-setup P04 | 7min | 2 tasks | 18 files |
| Phase 02-auth-and-venue-setup P05 | 5min | 2 tasks | 8 files |
| Phase 03-customer-ordering P01 | 8min | 2 tasks | 11 files |
| Phase 03-customer-ordering P02 | 3min | 2 tasks | 13 files |
| Phase 03-customer-ordering P03 | 2min | 2 tasks | 6 files |
| Phase 03-customer-ordering P04 | 1min | 2 tasks | 3 files |
| Phase 04-real-time-operations-and-analytics P02 | 2min | 1 tasks | 4 files |
| Phase 04-real-time-operations-and-analytics P04 | 2min | 2 tasks | 7 files |

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
- [Phase 02-02]: Venue ownership check inlined in CategoriesService and ItemsService to avoid circular module dependencies
- [Phase 02-02]: Category delete returns 409 if items exist to prevent accidental data loss
- [Phase 02-02]: MenuItem.venueId set on creation as denormalization for Phase 3 RLS customer queries
- [Phase 02-02]: PATCH reorder route declared before PATCH :id route — NestJS matches in declaration order
- [Phase 02-03]: shadcn new-york style initialized from apps/web/ directory; Tailwind v4 CSS-first with @import pattern; jose jwtVerify in middleware for Edge Runtime compatibility
- [Phase 02-03]: useActionState (React 19) primary form state + react-hook-form for client-side validation before server action submission
- [Phase 02-03]: Middleware deletes access_token cookie on invalid JWT before redirecting — prevents stale cookie redirect loops
- [Phase 02-04]: Dashboard Server Component layout fetches venues once and passes to Sidebar Client Component — avoids duplicate API calls per page
- [Phase 02-04]: QR code PNG download uses Route Handler (not server action) — binary responses require Response object, not serializable server action return
- [Phase 02-04]: Vercel Blob upload gracefully degrades when BLOB_READ_WRITE_TOKEN missing — returns descriptive error rather than crashing
- [Phase 02-05]: Stable UUID IDs for SortableContext (category.id not array index) prevents dnd-kit collision on reorder
- [Phase 02-05]: @dnd-kit/modifiers not installed — restrictToVerticalAxis removed; vertical constraint not required for correctness
- [Phase 02-05]: Photo upload silently skipped without BLOB_READ_WRITE_TOKEN — imageUrl stays null in dev, no crash or error
- [Phase 02-05]: Optimistic availability toggle with rollback — fast one-click UX, rollback on API failure
- [Phase 03-customer-ordering]: nanoid customAlphabet for 8-char uppercase alphanumeric referenceCode — human-readable for customers (ORDR-08)
- [Phase 03-customer-ordering]: Public controllers omit @UseGuards entirely (simpler than @Public() decorator since JwtAuthGuard is per-controller not global)
- [Phase 03-customer-ordering]: PAY_AT_COUNTER orders created in RECEIVED directly; STRIPE orders in PENDING_PAYMENT, transition to RECEIVED only via payment_intent.succeeded webhook (INFR-02)
- [Phase 03-customer-ordering]: useCart initialises items as [] then loads from localStorage in useEffect with hydrated guard — SSR-safe, no hydration mismatch
- [Phase 03-customer-ordering]: img tag used instead of Next.js Image for menu item thumbnails — external CDN URLs require remotePatterns config, avoided for v1 simplicity
- [Phase 03-customer-ordering]: PublicVenue/PublicCategory/PublicMenuItem types exported from Server Component page.tsx — single source of truth shared by all ordering Client Components
- [Phase 03-customer-ordering]: loadStripe() called at module level in stripe-payment-form.tsx — never inside a component — prevents Stripe re-initialization on render (Pitfall 4)
- [Phase 03-customer-ordering]: Order created in PENDING_PAYMENT before PaymentIntent (INFR-02): handleCreateOrder() first, then POST payment-intent; clientSecret state gates Stripe Elements render
- [Phase 03-customer-ordering]: BOTH paymentMode defaults to STRIPE paymentChoice — pay-now is the encouraged default, customer can choose PAC via radio
- [Phase 03-customer-ordering]: usePolling deps array contains only [enabled] — router.refresh() reference is stable in Next.js App Router, safe to omit from deps
- [Phase 03-customer-ordering]: notFound() used for all fetchPublicApi errors on order status page — collapses 404 and 403 into single 404 to prevent cross-venue order snooping
- [Phase 04-02]: verifyVenueOwnership raises NotFoundException (404) for missing venue, ForbiddenException (403) for wrong owner
- [Phase 04-02]: getDailyVolume uses $queryRaw with DATE() rather than Prisma groupBy — groupBy groups on full timestamp not date part
- [Phase 04-02]: BigInt from $queryRaw converted to Number before return — prevents JSON.stringify serialization error
- [Phase 04-02]: Analytics result interfaces exported from service to satisfy TS4053 — public controller return types must be named
- [Phase 04-04]: searchParams server-side fetch pattern for order history — history page reads from/to/page from URL, server component re-renders on filter; no client-side API calls needed
- [Phase 04-04]: router.push() with URLSearchParams for pagination and filtering — triggers Next.js server component re-render without client-side API calls

### Pending Todos

None yet.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | add proper landing page for the website | 2026-03-14 | e75a0ac | [1-add-proper-landing-page-for-the-website](./quick/1-add-proper-landing-page-for-the-website/) |
| 2 | enhance landing page with GSAP parallax | 2026-03-15 | eec7552 | [2-enhance-landing-page-with-gsap-parallax-](./quick/2-enhance-landing-page-with-gsap-parallax-/) |
| 3 | build award-winning landing page hero | 2026-03-16 | 778f1ad | [3-build-an-award-winning-landing-page-hero](./quick/3-build-an-award-winning-landing-page-hero/) |
| 4 | retheme landing page to light mode | 2026-04-03 | 02f4493 | [4-retheme-landing-page-to-light-mode-with-](./quick/4-retheme-landing-page-to-light-mode-with-/) |
| 5 | UX improvements: loading states, toasts, empty states | 2026-04-03 | 6814c43 | [5-ux-improvements-loading-states-error-fee](./quick/5-ux-improvements-loading-states-error-fee/) |
| 6 | Polish landing page: refine light theme | 2026-04-03 | 34038b6 | [6-polish-landing-page-refine-light-theme-i](./quick/6-polish-landing-page-refine-light-theme-i/) |

### Blockers/Concerns

- [Phase 2] Image upload CDN: where do images go in v1? Railway volume, Cloudflare R2, or Vercel Blob — resolve during Phase 2 planning
- [Phase 3] nestjs-zod 4.x compatibility with NestJS 11.x and Zod 3.x needs verification before shared types package is built
- [Phase 4] WebSocket reconnect + REST-fallback hybrid pattern needs careful implementation — plan against Socket.IO docs before coding

## Session Continuity

**Paused At:** None
Last session: 2026-04-03
**Stopped At:** Completed quick task 6 (Polish Landing Page Light Theme)
Resume file: None
