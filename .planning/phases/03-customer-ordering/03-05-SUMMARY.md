---
phase: 03-customer-ordering
plan: 05
subsystem: verification
tags: [uat, e2e, ordering, stripe, pac, cart]

# Dependency graph
requires:
  - phase: 03-customer-ordering
    plan: 01
    provides: NestJS ordering API (public menu, orders, payment intent, webhook)
  - phase: 03-customer-ordering
    plan: 02
    provides: Menu page + cart UI
  - phase: 03-customer-ordering
    plan: 03
    provides: Checkout + Stripe Payment Element
  - phase: 03-customer-ordering
    plan: 04
    provides: Order status page + polling

provides:
  - Human-verified end-to-end customer ordering flow
  - Phase 3 complete

affects:
  - Phase 4 (venue owner dashboard — order management, WebSocket push)

requirements-completed: [ORDR-01, ORDR-02, ORDR-03, ORDR-04, ORDR-05, ORDR-06, ORDR-07, ORDR-08, ORDR-09, ORDR-10]

# Metrics
duration: manual
completed: 2026-03-04
---

# Phase 3 Plan 05: Human Verification Summary

**End-to-end customer ordering flow verified by human tester on local dev environment**

## Verification Results

### Issues Found During Testing (all resolved)

1. **NestJS startup crash** — `new Stripe('')` throws when `STRIPE_SECRET_KEY` is not set. Fixed with lazy getter pattern in `OrdersService` so API boots without Stripe configured.
2. **Public menu routing confusion** — `/menu/[slug]` (public) vs `/venues/[id]/menu` (owner management) clarified. Both routes work correctly.
3. **Client-side fetch failure** — `fetchPublicApi` used `process.env.API_URL` (server-only) in browser. Fixed by adding `NEXT_PUBLIC_API_URL` with fallback.
4. **CORS blocking** — Browser requests from `:3000` to `:3001` blocked. Fixed by enabling CORS in NestJS `main.ts`.
5. **Stripe Payment Element load error** — `pk_test_placeholder` rejected by Stripe. User replaced with real test publishable key.
6. **Sidebar not updating after venue creation** — `createVenueAction` missing `revalidatePath('/dashboard', 'layout')` before redirect. Fixed.

### Flows Verified

- Stripe prepay flow: menu → cart → checkout → Stripe Payment Element → order status
- Cart localStorage persistence across page refresh
- Order status page with reference code and progress steps
- Sidebar updates after venue creation

## Files Modified During Verification

- `apps/api/src/orders/orders.service.ts` — lazy Stripe getter
- `apps/api/src/main.ts` — CORS enabled
- `apps/web/src/lib/api-public.ts` — NEXT_PUBLIC_API_URL fallback
- `apps/web/.env.local` — added NEXT_PUBLIC_API_URL, real Stripe publishable key
- `apps/web/src/actions/venues.ts` — revalidatePath on venue creation

## Self-Check: PASSED

Phase 3 customer ordering flow verified end-to-end.

---
*Phase: 03-customer-ordering*
*Completed: 2026-03-04*
