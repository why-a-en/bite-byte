---
phase: 03-customer-ordering
plan: 03
subsystem: ui
tags: [nextjs, react, stripe, stripe-payment-element, checkout, localStorage, ordering]

# Dependency graph
requires:
  - phase: 03-customer-ordering
    plan: 01
    provides: POST /api/public/venues/:slug/orders, POST /api/public/venues/:slug/orders/:id/payment-intent
  - phase: 03-customer-ordering
    plan: 02
    provides: useCart hook, fetchPublicApi helper, (menu) route group, PublicVenue type from page.tsx

provides:
  - GET /menu/[slug]/checkout — Server Component checkout page shell
  - CheckoutForm Client Component — customer name, payment mode selection, PAC and Stripe flows
  - StripePaymentForm component — Stripe Elements wrapper with PaymentElement and in-place confirmation
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY env var stub in .env.local

affects:
  - 03-04 (order status page — navigated to from checkout after order placed)
  - 03-05 (end-to-end UAT — tests full ordering loop including checkout)

# Tech tracking
tech-stack:
  added:
    - "@stripe/react-stripe-js 5.6.1 — React components for Stripe Elements"
    - "@stripe/stripe-js 8.9.0 — loadStripe() loader, returns Promise<Stripe>"
  patterns:
    - "loadStripe() at module level (outside component) prevents re-initialization on render (Stripe Pitfall 4)"
    - "redirect: 'if_required' in confirmPayment — cards confirm in-place, redirect-based methods redirect"
    - "Order created before PaymentIntent (INFR-02/Pitfall 1) — PENDING_PAYMENT state first, then PI"
    - "clientSecret gate pattern — checkout form switches to Stripe Elements once clientSecret is set"
    - "lastOrder:[slug] localStorage persistence for order status page recovery (ORDR-10)"

key-files:
  created:
    - apps/web/src/app/(menu)/menu/[slug]/checkout/page.tsx
    - apps/web/src/components/ordering/checkout-form.tsx
    - apps/web/src/components/ordering/stripe-payment-form.tsx
  modified:
    - apps/web/.env.local (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY added)
    - apps/web/package.json (Stripe deps)
    - pnpm-lock.yaml

key-decisions:
  - "loadStripe() called at module level in stripe-payment-form.tsx — never inside a component — prevents re-initialization on every render (Stripe Pitfall 4)"
  - "Order creation before PaymentIntent (INFR-02): order goes to PENDING_PAYMENT first, then PI created with orderId in metadata — webhook is sole trigger for RECEIVED"
  - "clientSecret state gates Stripe Elements render — checkout form stays in pre-payment state until PI created, then switches to StripePaymentForm"
  - "Hydration guard: shows loading skeleton until useCart hydrated from localStorage — prevents flash of empty cart"
  - "BOTH paymentMode defaults to STRIPE choice — pay-now is the encouraged default"

patterns-established:
  - "Stripe Elements wrapper pattern: StripePaymentForm exports Elements + inner PaymentForm split; Elements providers cannot be nested"
  - "Two-phase checkout: phase A (handleCreateOrder) shared by both PAC and Stripe flows; phase B diverges on paymentChoice"
  - "Client-side localStorage persistence: lastOrder:[slug] written after order creation so status page can recover after browser close"

requirements-completed: [ORDR-05, ORDR-06, ORDR-07, ORDR-08]

# Metrics
duration: 2min
completed: 2026-03-03
---

# Phase 3 Plan 03: Checkout + Stripe Summary

**Checkout page with Stripe Payment Element integration: customer name collection, PAC/prepay branching, correct order-before-PaymentIntent sequence, and localStorage order persistence for status page recovery**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-03T20:11:07Z
- **Completed:** 2026-03-03T20:13:55Z
- **Tasks:** 2
- **Files modified:** 6 (3 new, 3 updated)

## Accomplishments
- Checkout Server Component at `/menu/[slug]/checkout` fetches venue via `fetchPublicApi` and passes `paymentMode` to CheckoutForm
- `CheckoutForm` reads cart from `useCart(venue.slug)` (browser-only), handles all three paymentMode cases with correct radio button UI for BOTH
- `StripePaymentForm` wraps Stripe Payment Element; `loadStripe()` at module level with `redirect: 'if_required'` for in-place card confirmation
- Correct order sequence (INFR-02): Order created in PENDING_PAYMENT before PaymentIntent — webhook is sole trigger for RECEIVED status transition
- TypeScript compiles with zero errors across all new files

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Stripe libs + checkout page Server Component** - `0e681e4` (feat)
2. **Task 2: CheckoutForm + StripePaymentForm components** - `c210026` (feat)

**Plan metadata:** _(pending final commit)_

## Files Created/Modified
- `apps/web/src/app/(menu)/menu/[slug]/checkout/page.tsx` — Server Component; awaits params, fetches venue, renders CheckoutForm
- `apps/web/src/components/ordering/checkout-form.tsx` — Client Component; customer name input, payment mode radio (BOTH), cart summary, PAC flow, Stripe initiation flow
- `apps/web/src/components/ordering/stripe-payment-form.tsx` — Stripe Elements wrapper; loadStripe at module level; PaymentElement + confirmPayment with redirect:if_required
- `apps/web/.env.local` — Added `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder`
- `apps/web/package.json` + `pnpm-lock.yaml` — @stripe/react-stripe-js 5.6.1, @stripe/stripe-js 8.9.0

## Decisions Made
- `loadStripe()` called at module level in `stripe-payment-form.tsx` — never inside a component. This prevents Stripe.js from being re-initialized on every render (Stripe Pitfall 4: "Stripe not initialized before render").
- Order creation happens BEFORE PaymentIntent (INFR-02 / Pitfall 1): `handleCreateOrder()` sets the order to `PENDING_PAYMENT` and returns `orderId`. Only then does `handleStripeInitiate` POST to `payment-intent`. The webhook `payment_intent.succeeded` is the only mechanism that transitions the order to `RECEIVED`.
- `clientSecret` state acts as a gate: while null, the checkout form shows the submit button. Once set, the form switches to render `<StripePaymentForm>` with the secret. This prevents the Elements from mounting until the PaymentIntent is ready.
- Hydration loading skeleton shown until `useCart`'s `hydrated` flag is true — prevents flash of empty cart or showing checkout button before localStorage is read.
- `BOTH` paymentMode defaults to `STRIPE` as the initial `paymentChoice` — online payment is the encouraged path; customer can choose "Pay at counter" via radio.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

The `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `apps/web/.env.local` is set to `pk_test_placeholder`. The developer must replace this with the actual publishable key from the Stripe Dashboard:

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard -> Developers -> API keys -> Publishable key (starts with `pk_test_` or `pk_live_`) |

This value is browser-visible by design (`NEXT_PUBLIC_` prefix). The test key allows Stripe.js to load without errors during development.

## Next Phase Readiness
- Checkout page at `/menu/[slug]/checkout` is complete and handles all paymentMode cases
- After order creation, navigates to `/menu/[slug]/order/[orderId]` — ready for 03-04 to implement the order status page
- `lastOrder:[slug]` written to localStorage after each order — 03-04 order status page can read this for browser-back recovery
- Stripe environment: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` must be replaced with real test key before Stripe Payment Element will render (placeholder prevents build failure but won't load Stripe.js properly)

## Self-Check: PASSED

All 3 created files confirmed present on disk:
- [x] apps/web/src/app/(menu)/menu/[slug]/checkout/page.tsx
- [x] apps/web/src/components/ordering/checkout-form.tsx
- [x] apps/web/src/components/ordering/stripe-payment-form.tsx

Commits confirmed:
- [x] 0e681e4 (Task 1)
- [x] c210026 (Task 2)

TypeScript: zero errors (`npx tsc --noEmit` clean)

---
*Phase: 03-customer-ordering*
*Completed: 2026-03-03*
