---
phase: 03-customer-ordering
plan: 04
subsystem: ui
tags: [nextjs, react, polling, order-status, server-component, client-component]

# Dependency graph
requires:
  - phase: 03-customer-ordering
    plan: 01
    provides: GET /api/public/venues/:slug/orders/:orderId endpoint (order status with items)
  - phase: 03-customer-ordering
    plan: 03
    provides: checkout flow that navigates to /menu/[slug]/order/[orderId] after order creation

provides:
  - GET /menu/[slug]/order/[orderId] — Server Component order status page (cache no-store, notFound on any error)
  - OrderStatus Client Component — progress steps (RECEIVED/PREPARING/READY), polling, terminal state detection
  - usePolling hook — router.refresh() on interval, enabled flag stops polling for terminal states
  - PublicOrder type exported from page.tsx for shared use

affects:
  - 03-05 (UAT — end-to-end ordering loop now complete, status page is the final step)
  - 04-kitchen (real-time push will replace polling in Phase 4)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "usePolling(ms, enabled): router.refresh() in setInterval; router stable in App Router — safe to omit from deps; only [enabled] in dependency array"
    - "Terminal state detection with includes() — ['READY', 'COMPLETED', 'CANCELLED'].includes(status) gates polling"
    - "Server Component with cache no-store on fetchPublicApi — every router.refresh() triggers fresh API fetch"
    - "notFound() catches all non-2xx responses (both 404 and 403) — prevents cross-venue order snooping"

key-files:
  created:
    - apps/web/src/lib/use-polling.ts
    - apps/web/src/app/(menu)/menu/[slug]/order/[orderId]/page.tsx
    - apps/web/src/components/ordering/order-status.tsx

key-decisions:
  - "usePolling deps array contains only [enabled] — router.refresh() reference is stable per Next.js App Router docs; omitting router prevents spurious re-registrations"
  - "notFound() used for all fetchPublicApi errors — collapses 404 (order not found) and 403 (wrong venue slug) into a single 404 response, preventing cross-venue snooping (security)"
  - "STATUS_INDEX maps CANCELLED to -2 (distinct from PENDING_PAYMENT=-1) to allow separate conditional rendering for each special state"
  - "COMPLETED status maps to index 3 (past READY=2) so all three steps render as complete/green when order is completed"

patterns-established:
  - "PublicOrder type exported from Server Component page.tsx — single source of truth, imported by OrderStatus Client Component"
  - "Client Component polling pattern: only client behavior (usePolling), receives all data as props from Server Component parent"

requirements-completed: [ORDR-09, ORDR-10]

# Metrics
duration: 1min
completed: 2026-03-03
---

# Phase 3 Plan 04: Order Status Page Summary

**Order status page with router.refresh() polling hook, progress steps (RECEIVED/PREPARING/READY), terminal state detection stopping polls, and Server Component fetching from the public orders API with no-store caching**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-03T20:16:44Z
- **Completed:** 2026-03-03T20:18:14Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- `usePolling` hook uses `router.refresh()` in setInterval — the Next.js App Router native polling approach, no external data library needed; only `[enabled]` in deps (router reference is stable)
- Order status Server Component at `/menu/[slug]/order/[orderId]` fetches fresh data on every render with `cache: 'no-store'`; `notFound()` on any error prevents cross-venue order snooping
- `OrderStatus` Client Component renders 3 progress steps with green/black/gray visual states, reference code prominently displayed, order items list, polling stops automatically on terminal states

## Task Commits

Each task was committed atomically:

1. **Task 1: usePolling hook + order status page Server Component** - `1628c25` (feat)
2. **Task 2: OrderStatus Client Component** - `d1a326c` (feat)

**Plan metadata:** _(pending final commit)_

## Files Created/Modified
- `apps/web/src/lib/use-polling.ts` — `usePolling(ms, enabled)`: calls `router.refresh()` on `setInterval`; router omitted from deps (stable in App Router); only `[enabled]` in dep array
- `apps/web/src/app/(menu)/menu/[slug]/order/[orderId]/page.tsx` — Server Component; awaits params, fetches `/public/venues/${slug}/orders/${orderId}` with `cache: 'no-store'`; `notFound()` on any error; exports `PublicOrder` type
- `apps/web/src/components/ordering/order-status.tsx` — Client Component; reference code banner, PENDING_PAYMENT spinner, CANCELLED red error state, 3-step progress (RECEIVED/PREPARING/READY with green/black/ring indicators), order items list, total, Back to Menu link

## Decisions Made
- `usePolling` dependency array contains only `[enabled]` — `router` from `useRouter()` is stable in Next.js App Router, safe to omit. Including it would not cause bugs but deviates from the canonical pattern and adds unnecessary re-registrations.
- `notFound()` used for all `fetchPublicApi` errors — collapses both 404 (order not found) and 403 (wrong venue slug) into a single 404 response. This prevents cross-venue order snooping: a customer with a valid orderId cannot probe whether that order belongs to a different venue.
- `STATUS_INDEX` maps `CANCELLED` to `-2` (distinct from `PENDING_PAYMENT=-1`) enabling separate conditional rendering; `COMPLETED` maps to `3` (past READY's `2`) so all three progress steps render green when completed.
- Reference code displayed at top with large bold tracking-widest font — most important thing for a customer who needs to quote their order to staff.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Order status page is complete — the customer ordering loop is now end-to-end functional: QR code → menu → cart → checkout → order status with polling
- 03-05 (UAT) can now run the full ordering flow end-to-end including watching status update through all states
- Phase 4 will replace polling with WebSocket push from NestJS — `usePolling` will be removed or disabled in favour of the WebSocket event subscription

## Self-Check: PASSED

- [x] apps/web/src/lib/use-polling.ts — confirmed on disk
- [x] apps/web/src/app/(menu)/menu/[slug]/order/[orderId]/page.tsx — confirmed on disk
- [x] apps/web/src/components/ordering/order-status.tsx — confirmed on disk
- [x] 1628c25 (Task 1 commit) — confirmed in git log
- [x] d1a326c (Task 2 commit) — confirmed in git log
- [x] TypeScript: zero errors (npx tsc --noEmit clean)

---
*Phase: 03-customer-ordering*
*Completed: 2026-03-03*
