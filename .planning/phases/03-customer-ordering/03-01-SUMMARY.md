---
phase: 03-customer-ordering
plan: 01
subsystem: api
tags: [nestjs, stripe, prisma, nanoid, postgresql, orders, webhooks]

# Dependency graph
requires:
  - phase: 02-auth-and-venue-setup
    provides: PrismaService (global), Venue/MenuItem/Order models, stripe already installed

provides:
  - GET /api/public/venues/:slug/menu — unauthenticated venue+categories+items endpoint
  - POST /api/public/venues/:slug/orders — create order (PAC or STRIPE), returns referenceCode
  - GET /api/public/venues/:slug/orders/:orderId — order status for tracking page
  - POST /api/public/venues/:slug/orders/:orderId/payment-intent — create Stripe PaymentIntent, returns clientSecret
  - Stripe webhook: payment_intent.succeeded transitions order to RECEIVED, payment_intent.payment_failed cancels order
  - customerName column on Order model (Neon PostgreSQL migration applied)

affects:
  - 03-02 (menu page UI — fetches GET /menu)
  - 03-03 (checkout UI — creates orders, payment intents)
  - 03-04 (order status UI — polls GET /orders/:id)
  - 04-kitchen (kitchen dashboard — reads orders in RECEIVED/PREPARING/READY)

# Tech tracking
tech-stack:
  added:
    - nanoid 5.1.6 (customAlphabet for 8-char uppercase alphanumeric reference codes)
  patterns:
    - Public NestJS controllers with no @UseGuards (simpler than @Public() decorator for this project)
    - Price snapshot at order creation time (itemNameAtOrder, unitPriceAtOrder from current MenuItem)
    - Stripe webhook idempotency via StripeEvent table (unique constraint + pre-processing record)
    - PAC orders created in RECEIVED status directly; STRIPE orders created in PENDING_PAYMENT, transitioned via webhook only

key-files:
  created:
    - apps/api/src/public-menu/public-menu.service.ts
    - apps/api/src/public-menu/public-menu.controller.ts
    - apps/api/src/public-menu/public-menu.module.ts
    - apps/api/src/orders/orders.service.ts
    - apps/api/src/orders/orders.controller.ts
    - apps/api/src/orders/orders.module.ts
    - apps/api/prisma/migrations/20260303195756_add_customer_name_to_order/migration.sql
  modified:
    - apps/api/prisma/schema.prisma (customerName added to Order)
    - apps/api/src/webhooks/stripe-webhook.stub.ts (full payment_intent handlers)
    - apps/api/src/webhooks/webhooks.module.ts (imports OrdersModule)
    - apps/api/src/app.module.ts (imports PublicMenuModule, OrdersModule)

key-decisions:
  - "nanoid customAlphabet with 8-char uppercase alphanumeric for referenceCode — human-readable order reference"
  - "Public controllers use no @UseGuards at all — simpler than @Public() decorator since JwtAuthGuard is per-controller not global"
  - "price snapshot at order creation: itemNameAtOrder = item.name, unitPriceAtOrder = item.price at time of POST (INFR-03)"
  - "PAY_AT_COUNTER orders created in RECEIVED immediately; STRIPE orders in PENDING_PAYMENT then webhook-only transition to RECEIVED (INFR-02)"
  - "Prisma client regenerated after schema migration to pick up customerName field in generated types"
  - "STRIPE_CURRENCY env var defaults to gbp if not set — UK market default for v1"

patterns-established:
  - "Public NestJS module pattern: no @UseGuards on controller, no auth imports needed"
  - "Order creation validates all menuItemIds belong to the venue and fetches current prices in a single findMany call"
  - "Stripe PaymentIntent created with orderId in metadata, paymentIntentId stored on Order record for reconciliation"
  - "Webhook handler: idempotency check -> record event -> switch(event.type) pattern (already established in Phase 1 stub)"

requirements-completed: [ORDR-01, ORDR-02, ORDR-05, ORDR-06, ORDR-07, ORDR-08]

# Metrics
duration: 8min
completed: 2026-03-03
---

# Phase 3 Plan 01: Customer Ordering API Summary

**NestJS public ordering API: PublicMenuModule, OrdersModule with Stripe PaymentIntent, and completed webhook handler transitioning orders from PENDING_PAYMENT to RECEIVED exclusively via payment_intent.succeeded**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-03T19:57:38Z
- **Completed:** 2026-03-03T20:05:38Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Prisma migration adds `customerName` (NOT NULL) to orders table on Neon PostgreSQL
- PublicMenuModule provides GET /public/venues/:slug/menu returning all items (available + unavailable, sorted) without auth
- OrdersModule provides three public endpoints: create order (PAC->RECEIVED, STRIPE->PENDING_PAYMENT), payment intent, order status
- Completed Stripe webhook handler: payment_intent.succeeded -> markOrderReceived, payment_intent.payment_failed -> cancelOrder
- All public endpoints omit @UseGuards — no auth required for customer-facing routes

## Task Commits

Each task was committed atomically:

1. **Task 1: Prisma migration + PublicMenuModule** - `03b1d5c` (feat)
2. **Task 2: OrdersModule + complete Stripe webhook** - `00663c1` (feat)

**Plan metadata:** _(pending final commit)_

## Files Created/Modified
- `apps/api/prisma/schema.prisma` - Added customerName field to Order model
- `apps/api/prisma/migrations/20260303195756_add_customer_name_to_order/migration.sql` - Migration SQL
- `apps/api/src/public-menu/public-menu.service.ts` - getMenuBySlug: venue+categories+items with NotFoundException
- `apps/api/src/public-menu/public-menu.controller.ts` - GET /public/venues/:slug/menu (no UseGuards)
- `apps/api/src/public-menu/public-menu.module.ts` - Standard NestJS module
- `apps/api/src/orders/orders.service.ts` - create, createPaymentIntent, markOrderReceived, cancelOrder, findPublic
- `apps/api/src/orders/orders.controller.ts` - Three public order endpoints (no UseGuards)
- `apps/api/src/orders/orders.module.ts` - Exports OrdersService for WebhooksModule injection
- `apps/api/src/webhooks/stripe-webhook.stub.ts` - Full switch/case replacing TODO stub
- `apps/api/src/webhooks/webhooks.module.ts` - Added OrdersModule import
- `apps/api/src/app.module.ts` - Added PublicMenuModule and OrdersModule imports

## Decisions Made
- nanoid `customAlphabet` generates 8-char uppercase alphanumeric reference codes (human-readable for customers)
- Public controllers skip @UseGuards entirely — JwtAuthGuard is applied per-controller (not globally), so omitting it is the simplest public route approach
- Price snapshot at order creation: `itemNameAtOrder` and `unitPriceAtOrder` captured from current MenuItem prices, not references (INFR-03)
- PAY_AT_COUNTER orders go directly to RECEIVED; STRIPE orders go to PENDING_PAYMENT and only transition via `payment_intent.succeeded` webhook (INFR-02)
- `STRIPE_CURRENCY` env var defaults to 'gbp' if not set — matches UK market implied by user constraints
- Prisma client regenerated after migration to pick up customerName in generated TypeScript types (resolved TS2353 error)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Regenerated Prisma client after schema migration**
- **Found during:** Task 2 (TypeScript compilation check)
- **Issue:** After adding customerName to schema.prisma and migrating, the generated Prisma client still lacked the customerName field, causing TS2353 and TS2339 errors in orders.service.ts
- **Fix:** Ran `npx prisma generate` to regenerate the Prisma client, picking up the new field in generated types
- **Files modified:** apps/api/src/generated/prisma/ (gitignored, regenerated at build time)
- **Verification:** `npx tsc --noEmit` returned zero errors after regeneration
- **Committed in:** 00663c1 (Task 2 commit — no additional files since generated dir is gitignored)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required step after schema migration — standard Prisma workflow. No scope creep.

## Issues Encountered
- Prisma generated client not updated automatically after migration — needed explicit `npx prisma generate` before TypeScript compilation

## User Setup Required

The following environment variables must be set in `apps/api/.env` for Stripe to work:

| Variable | Where to get it |
|----------|----------------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard -> Developers -> API keys -> Secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard -> Developers -> Webhooks signing secret (or `stripe listen` output locally) |
| `STRIPE_CURRENCY` | Set to `gbp` (UK), `usd`, `eur`, etc. — no dashboard action |

For local webhook testing: `stripe listen --forward-to localhost:3001/api/webhooks/stripe`

## Next Phase Readiness
- All customer-facing API endpoints are live and compile with zero TypeScript errors
- PublicMenuModule ready for 03-02 (menu page) to fetch GET /menu
- OrdersModule ready for 03-03 (checkout) to POST /orders and POST /payment-intent
- Order status endpoint ready for 03-04 (order tracking) to poll GET /orders/:id
- Stripe webhook completes the PENDING_PAYMENT->RECEIVED flow for prepay orders
- Stripe env vars (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_CURRENCY) must be configured before Stripe flows work

---
*Phase: 03-customer-ordering*
*Completed: 2026-03-03*
