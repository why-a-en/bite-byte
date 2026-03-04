---
phase: 04-real-time-operations-and-analytics
plan: "04"
subsystem: ui
tags: [recharts, shadcn, analytics, charts, pagination, next-app-router]

# Dependency graph
requires:
  - phase: 04-02
    provides: Analytics API endpoints (revenue, top-items, daily-volume, order history)

provides:
  - Analytics dashboard page at /venues/[venueId]/analytics with revenue cards, bar chart, top items
  - Order history page at /venues/[venueId]/history with date filtering and pagination
  - fetchOrderHistory, fetchRevenue, fetchTopItems, fetchDailyVolume actions
  - RevenueCards, TopItemsList, OrderVolumeChart, OrderHistoryTable components

affects:
  - sidebar navigation (analytics and history links already wired from phase 04-01)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - searchParams-based server component re-render for client filtering (avoid client-side API calls)
    - ChartContainer with min-h-[200px] prevents zero-height Recharts render
    - GBP currency formatting via Intl.NumberFormat en-GB locale
    - Expandable table rows with local state (no additional fetch)

key-files:
  created:
    - apps/web/src/actions/analytics.ts
    - apps/web/src/components/dashboard/analytics/revenue-cards.tsx
    - apps/web/src/components/dashboard/analytics/top-items-list.tsx
    - apps/web/src/components/dashboard/analytics/order-volume-chart.tsx
    - apps/web/src/app/(dashboard)/venues/[venueId]/analytics/page.tsx
    - apps/web/src/app/(dashboard)/venues/[venueId]/history/page.tsx
    - apps/web/src/components/dashboard/order-history-table.tsx
  modified: []

key-decisions:
  - "searchParams server-side fetch pattern — history page reads from/to/page from URL, server component re-renders on filter; no client-side API calls needed"
  - "router.push() for pagination/filter navigation — cleaner than useCallback-based client fetch, works with Next.js cache and RSC streaming"
  - "Expandable rows use local state only — no extra API call, item details already in initialData from history endpoint"
  - "GBP currency via Intl.NumberFormat en-GB — matches UK market default established in plan"

patterns-established:
  - "Analytics actions pattern: thin wrappers around fetchApi, typed return interfaces exported for component consumption"
  - "Client-side filter components use router.push with URLSearchParams to update URL, triggering server component re-render"

requirements-completed: [MGMT-05, ANLY-01, ANLY-02, ANLY-03]

# Metrics
duration: 2min
completed: 2026-03-04
---

# Phase 4 Plan 04: Analytics Dashboard and Order History Summary

**Revenue cards, order volume bar chart (Recharts via shadcn), top-selling items list, and paginated order history table with date filtering using searchParams-based server re-render**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-04T13:15:10Z
- **Completed:** 2026-03-04T13:17:29Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Analytics page server component fetches all 3 analytics endpoints in parallel (Promise.all), rendering revenue cards (today/week/month in GBP), order volume bar chart, and top selling items
- OrderVolumeChart client component uses shadcn ChartContainer wrapping Recharts BarChart with min-h-[200px] to prevent zero-height render
- Order history page uses searchParams pattern — server component reads from/to/page, fetches server-side; client component handles date inputs and calls router.push() to update URL and trigger re-render
- Empty states handled in all components (no order data message)
- Sidebar navigation links (Analytics, History) were already wired from plan 04-01

## Task Commits

Each task was committed atomically:

1. **Task 1: Analytics components and page** - `c59101a` (feat)
2. **Task 2: Order history page with date filtering and pagination** - `1beae20` (feat)

**Plan metadata:** TBD (docs commit)

## Files Created/Modified

- `apps/web/src/actions/analytics.ts` — fetchRevenue, fetchTopItems, fetchDailyVolume, fetchOrderHistory with typed interfaces
- `apps/web/src/components/dashboard/analytics/revenue-cards.tsx` — Three-card grid with GBP currency formatting (Intl.NumberFormat)
- `apps/web/src/components/dashboard/analytics/top-items-list.tsx` — Numbered list with rank badges, empty state
- `apps/web/src/components/dashboard/analytics/order-volume-chart.tsx` — Client component, shadcn ChartContainer + Recharts BarChart
- `apps/web/src/app/(dashboard)/venues/[venueId]/analytics/page.tsx` — Server component, Promise.all fetch
- `apps/web/src/components/dashboard/order-history-table.tsx` — Client component, date inputs + router.push pagination, expandable rows
- `apps/web/src/app/(dashboard)/venues/[venueId]/history/page.tsx` — Server component, reads searchParams for date filtering

## Decisions Made

- **searchParams pattern for filtering/pagination:** History page reads from/to/page from URL as searchParams; server component fetches with these params on re-render. Client component calls router.push() to update URL. This avoids client-side API calls entirely and keeps data fetching server-side.
- **Expandable rows without additional fetch:** Order items are already returned in the history endpoint, so expanding a row just reveals the already-loaded data in local state — no extra API call needed.
- **GBP currency formatting:** Intl.NumberFormat with 'en-GB' locale and 'GBP' currency used consistently across revenue cards and history table totals.

## Deviations from Plan

None — plan executed exactly as written. The searchParams approach was the recommended pattern in the plan and was implemented as specified.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Analytics dashboard and order history complete — venue owners can now view revenue, top items, order volume charts, and browse historical orders
- All Phase 4 plans complete (04-01 WebSocket gateway, 04-02 Analytics API, 04-03 live orders UI, 04-04 analytics dashboard)
- Project is feature-complete for v1 launch

---
*Phase: 04-real-time-operations-and-analytics*
*Completed: 2026-03-04*
