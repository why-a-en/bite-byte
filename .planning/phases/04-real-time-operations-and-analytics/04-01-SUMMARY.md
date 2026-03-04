---
phase: 04-real-time-operations-and-analytics
plan: "01"
subsystem: api
tags: [nestjs, websocket, socket.io, jwt, real-time, orders]

# Dependency graph
requires:
  - phase: 03-customer-ordering
    provides: OrdersModule with create, findPublic, createPaymentIntent, markOrderReceived, cancelOrder

provides:
  - OrdersGateway — WebSocket gateway with two-tier auth and room-based event routing
  - ManagementOrdersController — authenticated PATCH status and GET active orders endpoints
  - OrdersService.updateStatus — forward-only status transitions with WS emission
  - OrdersService.findActiveOrders — non-completed orders for dashboard load/reconnect
  - order:new event emitted on PAC create and Stripe webhook payment received
  - order:updated event emitted on status transitions to both venue and order rooms

affects:
  - 04-03 (live orders dashboard — consumes WS events and REST endpoints)
  - 04-05 (customer WS upgrade — connects to order rooms for real-time status)

# Tech tracking
tech-stack:
  added:
    - "@nestjs/websockets — NestJS WebSocket module"
    - "@nestjs/platform-socket.io — Socket.IO adapter for NestJS"
  patterns:
    - "Two-tier WS auth via server.use() middleware in afterInit — not Guards (Guards don't block initial connections)"
    - "Same-port WS: no port argument in @WebSocketGateway decorator — shares HTTP port for Railway single-port deployment"
    - "Room-based multi-tenancy: venue:{venueId} for authenticated owners, order:{orderId} for anonymous customers"
    - "Forward-only status transitions via VALID_TRANSITIONS map — RECEIVED→PREPARING→READY→COMPLETED, CANCELLED from RECEIVED/PREPARING"
    - "Service→Gateway unidirectional dependency — gateway never imports service, avoiding circular deps"

key-files:
  created:
    - apps/api/src/orders/orders.gateway.ts
  modified:
    - apps/api/src/orders/orders.controller.ts
    - apps/api/src/orders/orders.service.ts
    - apps/api/src/orders/orders.module.ts
    - apps/api/package.json

key-decisions:
  - "Two-tier auth: token provided → JWT verify → authenticated owner; no token → anonymous customer allowed"
  - "join:venue validates venue ownership via Prisma query before room join — prevents cross-venue eavesdropping"
  - "join:order requires no auth — customers track their own order anonymously"
  - "emitOrderUpdated sends to BOTH venue:{venueId} AND order:{orderId} rooms — owner and customer both receive updates"
  - "ManagementOrdersController uses venueId-based routes (/venues/:venueId/orders) not slug — consistent with authenticated venue endpoints"
  - "GET active declared before :orderId to avoid NestJS route collision"
  - "CANCELLED allowed from RECEIVED or PREPARING only — cannot cancel READY or COMPLETED orders"

patterns-established:
  - "Authenticated management endpoints use separate controller class from public endpoints — clean auth boundary"
  - "Forward-only status validation as VALID_TRANSITIONS constant map — extensible and readable"
  - "Gateway emission after Prisma persist — never emit before data is committed"

requirements-completed: [MGMT-01, MGMT-03, MGMT-04]

# Metrics
duration: 5min
completed: 2026-03-04
---

# Phase 4 Plan 01: WebSocket Gateway + Order Management Summary

**NestJS OrdersGateway with Socket.IO two-tier auth (authenticated owners + anonymous customers), room-based event routing (venue and order rooms), ManagementOrdersController with JWT-authenticated PATCH status and GET active orders, forward-only status transitions, and gateway emission wired into PAC create and Stripe webhook paths.**

## Performance

- **Duration:** 5 min
- **Tasks:** 2
- **Files modified:** 5 (1 new, 4 updated)

## Accomplishments

- Created OrdersGateway with two-tier auth middleware, join:venue (ownership-verified), join:order (anonymous), emitNewOrder and emitOrderUpdated methods
- Added ManagementOrdersController with JwtAuthGuard: GET /venues/:venueId/orders/active and PATCH /venues/:venueId/orders/:orderId/status
- Implemented forward-only status transitions (VALID_TRANSITIONS map) with BadRequestException on invalid transitions
- Wired gateway emissions into PAC order creation and markOrderReceived (Stripe webhook path)
- Added findActiveOrders for dashboard initial load and reconnect sync
- Zero TypeScript compilation errors

## Task Commits

1. **Task 1: Install WebSocket deps and create OrdersGateway** - `cbb1c54` (feat)
2. **Task 2: Status endpoint, active orders, gateway wiring** - `9bb5819` (feat)

## Files Created/Modified

- `apps/api/src/orders/orders.gateway.ts` — WebSocket gateway: two-tier auth, room management, event emission
- `apps/api/src/orders/orders.controller.ts` — Added ManagementOrdersController with PATCH status + GET active
- `apps/api/src/orders/orders.service.ts` — Added updateStatus, findActiveOrders, gateway injection, PAC/webhook emissions
- `apps/api/src/orders/orders.module.ts` — Registered OrdersGateway as provider/export, ManagementOrdersController
- `apps/api/package.json` — Added @nestjs/websockets and @nestjs/platform-socket.io

## Decisions Made

- **Two-tier auth via middleware, not Guards** — Socket.IO Guards don't block initial connections; server.use() in afterInit is the correct pattern
- **Same-port WebSocket** — No port argument in @WebSocketGateway decorator; shares HTTP port for Railway single-port constraint
- **Separate ManagementOrdersController** — Public routes use slug-based @Controller('public/venues/:slug'), management routes use venueId-based @Controller('venues/:venueId/orders') with JwtAuthGuard
- **Service→Gateway unidirectional** — OrdersService injects OrdersGateway; gateway never imports service (prevents circular dependency)

## Deviations from Plan

- Stripe webhook stub not updated (emission handled via OrdersService.markOrderReceived which already has gateway injection — cleaner than double-injecting gateway in webhook handler)

## Issues Encountered

None.

## User Setup Required

None — WebSocket shares existing HTTP port; no additional configuration needed.

## Next Phase Readiness

- WebSocket gateway ready for frontend Socket.IO client connections
- GET /venues/:venueId/orders/active provides initial dashboard data
- PATCH status endpoint ready for dashboard order management
- order:new and order:updated events ready for real-time dashboard and customer status page

---
*Phase: 04-real-time-operations-and-analytics*
*Completed: 2026-03-04*

## Self-Check: PASSED

- FOUND: apps/api/src/orders/orders.gateway.ts
- FOUND commit cbb1c54 (feat(04-01): install WebSocket deps and create OrdersGateway)
- FOUND commit 9bb5819 (feat(04-01): ManagementOrdersController, status transitions, active orders, and gateway wiring)
