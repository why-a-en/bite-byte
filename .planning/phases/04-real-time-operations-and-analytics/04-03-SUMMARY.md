---
phase: 04-real-time-operations-and-analytics
plan: "03"
subsystem: web
tags: [nextjs, socket.io, websocket, real-time, kanban, audio, tailwind]

# Dependency graph
requires:
  - phase: 04-real-time-operations-and-analytics/04-01
    provides: OrdersGateway (WS), ManagementOrdersController (REST), join:venue, order:new, order:updated events

provides:
  - Live orders kanban dashboard at /venues/[venueId]/orders
  - Socket.IO client singleton with autoConnect:false and 3 reconnection attempts
  - Web Audio API alert sound with lazy AudioContext
  - ConnectionBanner component for disconnect/reconnect visual feedback
  - OrderCard with inline expand, Next button, Cancel with AlertDialog confirmation
  - REST polling fallback after 3 WS failures
  - Completed orders auto-hide after 30 seconds
  - Sidebar Orders/History/Analytics nav links per venue

affects:
  - 04-05 (customer WS upgrade — Socket.IO singleton reused)

# Tech tracking
tech-stack:
  added:
    - "socket.io-client 4.8.3 — Socket.IO client for real-time WebSocket communication"
  patterns:
    - "Socket.IO singleton module (socket.ts) with autoConnect:false — connect manually after setting auth token"
    - "Lazy AudioContext in audio-alert.ts — avoids browser autoplay policy block"
    - "isMutedRef callback ref pattern — prevents stale closure in socket event handlers"
    - "Named socket handler functions — enables precise socket.off(event, handler) cleanup"
    - "Optimistic status updates with REST re-fetch revert on failure"
    - "REST polling fallback when socket.active is false (after 3 reconnection attempts)"

key-files:
  created:
    - apps/web/src/lib/socket.ts
    - apps/web/src/lib/audio-alert.ts
    - apps/web/src/actions/orders.ts
    - apps/web/src/components/dashboard/orders-board.tsx
    - apps/web/src/components/dashboard/order-card.tsx
    - apps/web/src/components/dashboard/connection-banner.tsx
    - apps/web/src/app/(dashboard)/venues/[venueId]/orders/page.tsx
  modified:
    - apps/web/src/components/dashboard/sidebar.tsx
    - apps/web/package.json

key-decisions:
  - "Socket singleton at module level — avoids creating new connections per component render"
  - "autoConnect:false — connect manually after setting auth token in component"
  - "Named handler functions for socket events — enables precise cleanup without removing all listeners"
  - "isMutedRef pattern — reads mute state from ref inside socket handler to prevent stale closure"
  - "Optimistic status update with revert — PATCH fires in background, re-fetches on failure"
  - "REST polling every 5s as silent fallback — no user intervention needed"
  - "Auto-hide completed orders after 30s via setTimeout map — cleared on unmount"
  - "Server Component page passes JWT token to client OrdersBoard for WS auth"

patterns-established:
  - "WebSocket singleton + manual connect pattern for authenticated connections"
  - "REST fallback triggered by socket.active check after connect_error"
  - "Kanban board with status-filtered columns from single orders array"

requirements-completed: [MGMT-01, MGMT-02, MGMT-03, MGMT-04]

# Metrics
duration: 5min
completed: 2026-03-04
---

# Phase 4 Plan 03: Live Orders Dashboard Summary

**Live orders kanban dashboard with Socket.IO real-time updates, Web Audio API alerts with mute toggle, three-column board (Received/Preparing/Ready), inline-expandable order cards with Next/Cancel buttons, connection banner on disconnect, REST polling fallback, and completed order auto-hide.**

## Performance

- **Duration:** 5 min
- **Tasks:** 2
- **Files modified:** 9 (7 new, 2 updated)

## Accomplishments

- Created Socket.IO client singleton with autoConnect:false and 3 reconnection attempts
- Created Web Audio API beep alert with lazy AudioContext (880Hz sine wave)
- Updated sidebar with Orders, History, Analytics nav links for each venue
- Built OrdersBoard client component with WS connection, auth, room join, event handlers, polling fallback, mute toggle, auto-hide timers
- Built OrderCard with inline expand, relative time, status-colored borders, Next button (Start Preparing/Mark Ready/Complete), Cancel with AlertDialog
- Built ConnectionBanner for disconnect/reconnect visual feedback
- Created orders page Server Component that fetches initial orders and passes JWT token
- Zero TypeScript errors

## Task Commits

1. **Task 1: Socket singleton, audio alert, sidebar nav** - `526e9c1` (feat)
2. **Task 2: Live orders kanban board** - `1691f34` (feat)

## Files Created/Modified

- `apps/web/src/lib/socket.ts` — Socket.IO singleton, autoConnect:false, 3 reconnection attempts
- `apps/web/src/lib/audio-alert.ts` — Web Audio API beep with lazy AudioContext
- `apps/web/src/actions/orders.ts` — fetchActiveOrders and updateOrderStatus server actions
- `apps/web/src/components/dashboard/orders-board.tsx` — Kanban board with WS, polling fallback, mute, auto-hide
- `apps/web/src/components/dashboard/order-card.tsx` — Expandable card with Next/Cancel buttons
- `apps/web/src/components/dashboard/connection-banner.tsx` — Yellow disconnect banner
- `apps/web/src/app/(dashboard)/venues/[venueId]/orders/page.tsx` — Server Component shell
- `apps/web/src/components/dashboard/sidebar.tsx` — Added Orders/History/Analytics SubNavItems
- `apps/web/package.json` — Added socket.io-client

## Deviations from Plan

None.

## Issues Encountered

None.

## User Setup Required

None — WebSocket connects to the same API URL already configured.

---
*Phase: 04-real-time-operations-and-analytics*
*Completed: 2026-03-04*

## Self-Check: PASSED

- FOUND: apps/web/src/lib/socket.ts
- FOUND: apps/web/src/components/dashboard/orders-board.tsx
- FOUND: apps/web/src/components/dashboard/order-card.tsx
- FOUND commit 526e9c1 (feat(04-03))
- FOUND commit 1691f34 (feat(04-03))
