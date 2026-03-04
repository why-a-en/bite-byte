# Phase 4: Real-Time Operations and Analytics - Research

**Researched:** 2026-03-04
**Domain:** NestJS WebSocket Gateway (Socket.IO), Next.js real-time client, Prisma analytics queries, shadcn/ui charts
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Live orders dashboard
- Kanban board layout with columns for each status: Received, Preparing, Ready
- Order cards show: reference code, customer name, item count, time since placed, total amount (minimal — not full item list)
- Clicking an order card expands it inline to show full item list and action buttons (no modal or side panel)
- New orders trigger an audio alert notification sound; owner can mute/unmute from the dashboard
- New order cards animate in with a highlight effect

#### Order status transitions
- Single "Next" button per order card: "Start Preparing" → "Mark Ready" → "Complete"
- No drag-and-drop between columns — button-only for simplicity
- Cancel button on order card with confirmation dialog
- Completed orders auto-hide from the board after 30 seconds; viewable in order history
- No undo — status only moves forward

#### Sales analytics
- Revenue summary: three cards — Today, This Week, This Month
- Order volume bar chart: orders per day for the selected period
- Top 5 selling items by order count
- Order history on a separate dedicated page with date filter

#### WebSocket behavior
- Yellow/red banner at top of dashboard: "Connection lost — reconnecting..." when WebSocket disconnects; auto-hides on reconnect
- On reconnect: re-fetch all active orders via REST API before resuming WebSocket feed — no missed orders
- Customer order status page upgrades to WebSocket push (replaces 5-second polling from Phase 3)
- REST polling fallback: if WebSocket can't connect after 3 attempts, fall back to 5s REST polling silently

### Claude's Discretion
- Exact audio alert sound choice and implementation
- Animation timing for card transitions and auto-hide
- Chart library choice for analytics
- WebSocket reconnection backoff strategy
- Order history table design and search/filter UX

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MGMT-01 | Venue owner sees incoming orders appear in real-time via WebSocket push | NestJS WebSocket Gateway emitting `order:new` to venue-scoped room; socket.io-client in Next.js client component |
| MGMT-02 | Venue owner hears an audio alert when a new order arrives | Web Audio API AudioContext with OscillatorNode; suspend/resume for autoplay policy compliance |
| MGMT-03 | Venue owner can update order status (Received → Preparing → Ready → Completed) | New authenticated REST endpoints PATCH /venues/:id/orders/:orderId/status; gateway emits `order:updated` to rooms |
| MGMT-04 | Order status changes push to the customer's status page in real-time | Gateway emits `order:updated` to order-scoped room; customer socket joins room by orderId |
| MGMT-05 | Venue owner can view order history with date filtering | Prisma query with where createdAt + status filter; paginated REST endpoint |
| ANLY-01 | Venue owner can view revenue summary (today, this week, this month) | Prisma aggregate() with _sum totalAmount + createdAt date range WHERE clauses |
| ANLY-02 | Venue owner can view top-selling items | Prisma orderItem.groupBy() by menuItemId, _sum quantity, orderBy desc, take 5 |
| ANLY-03 | Venue owner can view order volume over time (chart) | Prisma $queryRaw with DATE(created_at) GROUP BY for daily counts; shadcn/ui BarChart |
</phase_requirements>

## Summary

Phase 4 builds two parallel tracks: a real-time operations dashboard for venue owners and a basic analytics view. The core technical challenge is the WebSocket layer — NestJS provides a first-class `@WebSocketGateway()` decorator that runs Socket.IO on the same port as the HTTP API, making Railway deployment straightforward with a single exposed port. Clients connect with `socket.io-client@4.8.3` using a singleton pattern in Next.js client components.

The multi-tenant isolation approach is Socket.IO rooms: each venue owner joins a room named `venue:{venueId}` on connection (authenticated via JWT handshake), and customer status pages join rooms named `order:{orderId}`. When order status changes, the orders service calls a method on the injected gateway, which emits `order:new` or `order:updated` to the appropriate rooms. This keeps all real-time logic in NestJS with no WebSocket code in Next.js API routes (satisfying the Vercel constraint).

For analytics, Prisma's `aggregate()` covers revenue sums with date-range WHERE clauses, `groupBy()` on OrderItem covers top-selling items, and `$queryRaw` handles daily order counts grouped by date (Prisma's native groupBy cannot extract date parts from timestamps). Charts use shadcn/ui's Chart component (built on Recharts 3.x) which is already consistent with the project's shadcn/new-york style.

**Primary recommendation:** Use `@WebSocketGateway({ cors: { origin: CORS_ORIGIN } })` (no explicit port — shares the HTTP port), inject `OrdersGateway` into `OrdersService` for event emission, and use Socket.IO rooms for multi-tenant isolation.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @nestjs/websockets | ^11.1.15 | NestJS WebSocket decorator support | Matches existing NestJS 11.x |
| @nestjs/platform-socket.io | ^11.1.15 | Socket.IO adapter for NestJS | Ships socket.io 4.8.3 as direct dep |
| socket.io | 4.8.3 | WebSocket server (pulled transitively) | Already pinned by @nestjs/platform-socket.io |
| socket.io-client | ^4.8.3 | WebSocket client in Next.js | Matches server version; critical for compatibility |
| recharts | ^3.7.0 | Chart rendering (via shadcn/ui chart) | shadcn/ui chart component wraps Recharts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui chart | (CLI install) | Pre-styled BarChart + ChartContainer | Daily order volume chart (ANLY-03) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Socket.IO (via @nestjs/platform-socket.io) | ws (plain WebSockets via @nestjs/platform-ws) | Socket.IO has built-in rooms, reconnection, fallback — plain ws requires hand-rolling all of these |
| shadcn/ui chart (Recharts) | Chart.js or Victory | Project already uses shadcn/new-york; shadcn charts fit seamlessly with zero new design tokens |
| Web Audio API (programmatic) | .mp3 file via `<audio>` element | Web Audio avoids CDN/hosting complexity; programmatic beep has zero latency; no file to serve |

**Installation (in apps/api):**
```bash
pnpm add @nestjs/websockets @nestjs/platform-socket.io
```

**Installation (in apps/web):**
```bash
pnpm add socket.io-client
# Then add shadcn chart component:
pnpm dlx shadcn@latest add chart
# shadcn CLI installs recharts automatically
```

## Architecture Patterns

### Recommended Project Structure

**NestJS additions:**
```
apps/api/src/
├── orders/
│   ├── orders.controller.ts         # existing — add PATCH status endpoint
│   ├── orders.module.ts             # add OrdersGateway to providers
│   ├── orders.service.ts            # inject OrdersGateway, emit on status change
│   └── orders.gateway.ts            # NEW: @WebSocketGateway, handles WS events
├── analytics/
│   ├── analytics.controller.ts      # NEW: revenue, top-items, daily-volume endpoints
│   ├── analytics.service.ts         # NEW: Prisma aggregate/groupBy/$queryRaw
│   └── analytics.module.ts          # NEW
```

**Next.js additions:**
```
apps/web/src/
├── app/(dashboard)/venues/[venueId]/
│   ├── orders/page.tsx              # NEW: live orders kanban dashboard (Server Component shell)
│   ├── history/page.tsx             # NEW: order history page (Server Component)
│   └── analytics/page.tsx          # NEW: analytics page (Server Component)
├── components/dashboard/
│   ├── orders-board.tsx             # NEW: 'use client' — kanban with Socket.IO
│   ├── order-card.tsx               # NEW: expandable card, status buttons
│   ├── connection-banner.tsx        # NEW: yellow/red disconnect banner
│   ├── order-history-table.tsx      # NEW: date-filtered history table
│   └── analytics/
│       ├── revenue-cards.tsx        # NEW: today/week/month revenue summary
│       ├── order-volume-chart.tsx   # NEW: 'use client' BarChart (shadcn)
│       └── top-items-list.tsx       # NEW: top 5 selling items
├── lib/
│   └── socket.ts                    # NEW: singleton socket.io-client instance
├── actions/
│   └── orders.ts                    # NEW: updateOrderStatus server action (or REST call)
```

### Pattern 1: Socket.IO Gateway (Same Port as HTTP)

**What:** `@WebSocketGateway()` without a port argument runs on the same port as the NestJS HTTP server. Railway exposes one port — this is the correct approach.

**When to use:** Always in this project. Do NOT specify a separate port number.

```typescript
// Source: NestJS Docs + verified via npm @nestjs/platform-socket.io 11.1.15
// apps/api/src/orders/orders.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class OrdersGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    // Socket middleware — runs before handleConnection; disconnects unauthorized clients
    server.use(async (socket: Socket, next) => {
      const token = socket.handshake?.auth?.token;
      if (!token) return next(new Error('Unauthorized'));
      try {
        const payload = this.jwtService.verify(token);
        socket.data.userId = payload.sub;
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }

  /** Venue owner joins their venue room — receives all orders for that venue */
  @SubscribeMessage('join:venue')
  handleJoinVenue(
    @MessageBody() venueId: string,
    @ConnectedSocket() client: Socket,
  ) {
    // TODO: verify userId owns this venueId before joining
    client.join(`venue:${venueId}`);
    return { joined: `venue:${venueId}` };
  }

  /** Customer joins an order room — receives status updates for that order */
  @SubscribeMessage('join:order')
  handleJoinOrder(
    @MessageBody() orderId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`order:${orderId}`);
    return { joined: `order:${orderId}` };
  }

  /** Called by OrdersService when a new RECEIVED order is created */
  emitNewOrder(venueId: string, order: object) {
    this.server.to(`venue:${venueId}`).emit('order:new', order);
  }

  /** Called by OrdersService when an order's status changes */
  emitOrderUpdated(venueId: string, orderId: string, update: object) {
    this.server.to(`venue:${venueId}`).emit('order:updated', update);
    this.server.to(`order:${orderId}`).emit('order:updated', update);
  }
}
```

### Pattern 2: Injecting Gateway into Service

**What:** Inject `OrdersGateway` into `OrdersService` so status changes trigger real-time emissions.

**When to use:** Any time business logic needs to emit WebSocket events — do NOT put Prisma calls in the gateway.

```typescript
// apps/api/src/orders/orders.service.ts (additions)
@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: OrdersGateway,  // injected
  ) {}

  async updateStatus(venueId: string, orderId: string, newStatus: OrderStatus) {
    const order = await this.prisma.order.update({
      where: { id: orderId, venueId },
      data: { status: newStatus },
      select: { id: true, status: true, referenceCode: true },
    });
    // Emit to venue room AND order room
    this.gateway.emitOrderUpdated(venueId, orderId, order);
    return order;
  }
}
```

**CRITICAL:** `OrdersGateway` must be added to `OrdersModule.providers` AND exported so `OrdersService` can receive it. No circular dependency here — the gateway doesn't import from the service.

### Pattern 3: Socket.IO Client Singleton in Next.js

**What:** Create socket ONCE at module level in a `'use client'` file. Import the instance into components. Never create inside components.

**When to use:** All WebSocket client code in Next.js.

```typescript
// Source: https://socket.io/how-to/use-with-nextjs
// apps/web/src/lib/socket.ts
'use client';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Singleton — created once, shared across all client components
export const socket = io(API_URL, {
  autoConnect: false,         // Connect manually after auth token is available
  reconnectionAttempts: 3,    // After 3 failures, stop and fall back to polling
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
});
```

```typescript
// apps/web/src/components/dashboard/orders-board.tsx
'use client';
import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';

export function OrdersBoard({ venueId, token, initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect with auth token
    socket.auth = { token };
    socket.connect();

    function onConnect() {
      setConnected(true);
      socket.emit('join:venue', venueId);
    }
    function onDisconnect() { setConnected(false); }
    function onNewOrder(order) { setOrders(prev => [order, ...prev]); }
    function onOrderUpdated(update) {
      setOrders(prev => prev.map(o => o.id === update.id ? { ...o, ...update } : o));
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('order:new', onNewOrder);
    socket.on('order:updated', onOrderUpdated);

    return () => {
      // Remove specific listeners — do NOT call socket.disconnect() here
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('order:new', onNewOrder);
      socket.off('order:updated', onOrderUpdated);
      socket.disconnect();
    };
  }, [venueId, token]);

  // ...
}
```

### Pattern 4: Reconnect + REST Fallback

**What:** After `reconnectionAttempts` (3) are exhausted, the socket emits `connect_error` and stops retrying. Detect this and switch to 5-second polling silently.

```typescript
// In orders-board.tsx useEffect
let pollingInterval: ReturnType<typeof setInterval> | null = null;

function onConnectError() {
  // socket.io stops after reconnectionAttempts=3
  // After 3 failures, activates polling fallback
  if (!socket.active) {
    pollingInterval = setInterval(async () => {
      const fresh = await fetchActiveOrders(venueId);
      setOrders(fresh);
    }, 5000);
  }
}

socket.on('connect_error', onConnectError);
// In cleanup:
socket.off('connect_error', onConnectError);
if (pollingInterval) clearInterval(pollingInterval);
```

### Pattern 5: Web Audio API Alert (Autoplay-Safe)

**What:** Use AudioContext OscillatorNode for a programmatic beep. AudioContext requires a user gesture before it will play — resume it on first user interaction and gate the mute state in a ref.

**Critical:** Create AudioContext lazily (on first interaction), not at module load — browsers suspend contexts created before user interaction.

```typescript
// apps/web/src/lib/audio-alert.ts
'use client';

let ctx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function playOrderAlert() {
  const context = getContext();
  // Resume if suspended (browser autoplay policy)
  if (context.state === 'suspended') {
    context.resume().then(() => beep(context));
  } else {
    beep(context);
  }
}

function beep(context: AudioContext) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.type = 'sine';
  oscillator.frequency.value = 880; // A5 — clear, not jarring
  gain.gain.setValueAtTime(0.3, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.5);
}
```

In the dashboard component: call `context.resume()` on the first user click (the mute button is a good trigger), then store `isMuted` in state. Check `!isMuted` before calling `playOrderAlert()`.

### Pattern 6: Analytics Queries

**Revenue summary (Prisma aggregate with date ranges):**
```typescript
// Source: Prisma docs - aggregation-grouping-summarizing
async getRevenue(venueId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [today, week, month] = await Promise.all([
    this.prisma.order.aggregate({
      where: { venueId, status: { not: 'CANCELLED' }, createdAt: { gte: startOfDay } },
      _sum: { totalAmount: true },
    }),
    this.prisma.order.aggregate({
      where: { venueId, status: { not: 'CANCELLED' }, createdAt: { gte: startOfWeek } },
      _sum: { totalAmount: true },
    }),
    this.prisma.order.aggregate({
      where: { venueId, status: { not: 'CANCELLED' }, createdAt: { gte: startOfMonth } },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    today: today._sum.totalAmount ?? 0,
    week: week._sum.totalAmount ?? 0,
    month: month._sum.totalAmount ?? 0,
  };
}
```

**Top-selling items (Prisma groupBy on OrderItem):**
```typescript
// Source: Prisma docs - groupBy
async getTopItems(venueId: string, take = 5) {
  const results = await this.prisma.orderItem.groupBy({
    by: ['menuItemId', 'itemNameAtOrder'],
    where: { order: { venueId, status: { not: 'CANCELLED' } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take,
  });
  return results.map(r => ({
    name: r.itemNameAtOrder,
    count: r._sum.quantity ?? 0,
  }));
}
```

**Daily order volume ($queryRaw — Prisma groupBy cannot group by date part):**
```typescript
// Source: Prisma docs - raw-queries + wanago.io analytics article
async getDailyVolume(venueId: string, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await this.prisma.$queryRaw<{ date: string; count: bigint }[]>`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM orders
    WHERE venue_id = ${venueId}::uuid
      AND status != 'CANCELLED'
      AND created_at >= ${since}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  // Convert BigInt to Number for JSON serialization
  return rows.map(r => ({ date: r.date, count: Number(r.count) }));
}
```

**CRITICAL:** `$queryRaw` returns BigInt for COUNT() — must `Number()` convert before JSON.stringify or you will get a serialization error.

### Pattern 7: shadcn/ui BarChart

```typescript
// Source: https://ui.shadcn.com/docs/components/chart
'use client';
import { BarChart, Bar, XAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  count: { label: 'Orders', color: 'hsl(var(--chart-1))' },
};

export function OrderVolumeChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
```

### Anti-Patterns to Avoid

- **Creating socket in a Server Component:** Next.js Server Components run on the server — `socket.io-client` uses browser APIs. All socket code must be in `'use client'` files.
- **Creating socket inside a component function:** Creates a new connection every render. Always use a module-level singleton.
- **Specifying a port in @WebSocketGateway(PORT):** Railway exposes one port. The gateway must share the HTTP port by using `@WebSocketGateway({ cors: ... })` with no port argument.
- **Using Guards instead of middleware for WS auth:** Guards don't block unauthorized clients on initial connection in Socket.IO — use `server.use()` middleware in `afterInit()` instead.
- **Calling socket.off() without the specific listener function:** `socket.off('event')` removes ALL listeners for that event including ones from other components. Always pass the named function.
- **JSON.stringify BigInt from $queryRaw:** COUNT() returns BigInt in Prisma raw queries. Always `Number()` convert before returning from controller.
- **AudioContext created at module load:** Browsers block autoplay of audio contexts created before user interaction. Create lazily on first user gesture.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WebSocket rooms / namespaces | Custom venue channel routing | Socket.IO rooms (`server.to('venue:id').emit()`) | Socket.IO rooms are O(1) membership lookup, handle disconnect cleanup automatically |
| Reconnection with backoff | Custom retry loop with setTimeout | Socket.IO built-in (`reconnectionAttempts`, `reconnectionDelay`, `reconnectionDelayMax`) | Edge cases: thundering herd, jitter, proper event emission on give-up |
| Bar chart rendering | SVG/Canvas chart from scratch | shadcn/ui Chart + Recharts BarChart | Responsive, accessible, consistent with existing shadcn design system |
| Daily grouping by date | JavaScript date-bucketing in application code | PostgreSQL `DATE(created_at) GROUP BY` via `$queryRaw` | Correct timezone handling at DB level; vastly more efficient |
| Audio notification sound files | Hosting/serving .mp3 or .wav files | Web Audio API OscillatorNode | Zero file to serve; works offline; no CDN dependency |

**Key insight:** Socket.IO's room system is the correct abstraction for multi-tenant real-time isolation — one room per venue for the owner, one room per order for customers. Any hand-rolled pub/sub layer duplicates what Socket.IO already provides.

## Common Pitfalls

### Pitfall 1: WebSocket CORS Blocking Connection
**What goes wrong:** Browser refuses WebSocket upgrade with CORS error; connection never establishes.
**Why it happens:** Socket.IO's CORS options in `@WebSocketGateway()` are separate from NestJS's `app.enableCors()`. HTTP CORS and WebSocket CORS are configured independently.
**How to avoid:** Set `cors` options directly in `@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN, credentials: true } })`. The `app.enableCors()` in main.ts does NOT cover WebSocket upgrades.
**Warning signs:** Chrome DevTools shows WS handshake blocked with CORS error, but REST calls work fine.

### Pitfall 2: Venue Ownership Not Verified Before Room Join
**What goes wrong:** Any authenticated user can call `socket.emit('join:venue', anyVenueId)` and receive another venue's orders.
**Why it happens:** The gateway joins the client to the requested room without checking if the JWT user owns that venue.
**How to avoid:** In `handleJoinVenue`, query Prisma (or inject VenuesService) to verify `venue.ownerId === socket.data.userId` before calling `client.join()`. Disconnect the socket if the check fails.
**Warning signs:** Cross-tenant order leakage in multi-venue scenarios.

### Pitfall 3: Missed Orders on WebSocket Reconnect
**What goes wrong:** WebSocket drops briefly; owner doesn't see orders that arrived during the gap.
**Why it happens:** Socket.IO reconnection re-establishes the connection but does not replay missed server emissions.
**How to avoid:** On the `connect` event (which fires on both initial connection AND reconnections), immediately call a REST endpoint to fetch all active orders and replace local state. This is confirmed in CONTEXT.md as the required pattern.
**Warning signs:** Kanban board missing orders after a network blip.

### Pitfall 4: BigInt Serialization Error from $queryRaw COUNT()
**What goes wrong:** `TypeError: Do not know how to serialize a BigInt` when the analytics controller returns daily volume data.
**Why it happens:** PostgreSQL `COUNT(*)` returns a BigInt in Prisma's `$queryRaw`, and `JSON.stringify` cannot serialize BigInt.
**How to avoid:** Map results: `rows.map(r => ({ date: r.date, count: Number(r.count) }))` before returning.
**Warning signs:** 500 error from the analytics endpoint with BigInt serialization error in logs.

### Pitfall 5: Socket.IO Client/Server Version Mismatch
**What goes wrong:** Connection silently fails or uses long-polling fallback instead of WebSocket upgrade.
**Why it happens:** Socket.IO v3 client cannot connect to v4 server (protocol incompatibility).
**How to avoid:** `@nestjs/platform-socket.io@11.1.15` ships `socket.io@4.8.3` as a direct dependency. Install `socket.io-client@^4.8.3` in apps/web to match. Never use socket.io-client v2 or v3.
**Warning signs:** Connection falls back to HTTP long-polling; `socket.connected` is always false.

### Pitfall 6: OrdersGateway Circular Dependency
**What goes wrong:** `Error: A circular dependency has been detected` at startup when injecting OrdersService into OrdersGateway AND OrdersGateway into OrdersService.
**Why it happens:** Mutual injection in the same module creates a DI cycle.
**How to avoid:** The gateway NEVER imports OrdersService. Data flows one direction: OrdersService calls `this.gateway.emitNewOrder(...)`. The gateway only handles socket events (room joins) and emits on behalf of the service.
**Warning signs:** NestJS startup crash with circular dependency error mentioning OrdersGateway/OrdersService.

### Pitfall 7: AudioContext Autoplay Blocked
**What goes wrong:** First order arrives, no sound plays; browser console shows "AudioContext was not allowed to start".
**Why it happens:** Browsers block AudioContext that starts before a user gesture (Chrome autoplay policy).
**How to avoid:** Create AudioContext lazily inside a function called after the first user interaction. The mute/unmute button is a natural first interaction — use its click handler to call `context.resume()`. After that, subsequent calls work without a gesture.
**Warning signs:** No sound on first page load; console autoplay policy warning.

### Pitfall 8: Prisma groupBy Cannot Group by Computed Date Fields
**What goes wrong:** TypeScript error or runtime error trying to use `groupBy({ by: ['createdAt'] })` expecting to get one row per day — instead gets one row per exact timestamp.
**Why it happens:** Prisma `groupBy` groups by the full timestamp value, not date part extraction. No EXTRACT or DATE() function available in groupBy.
**How to avoid:** Use `$queryRaw` with `DATE(created_at) GROUP BY` for daily aggregations. Only use `groupBy` for fields that are already discrete (e.g., venueId, menuItemId).
**Warning signs:** Daily chart has hundreds of rows instead of N distinct dates.

## Code Examples

### NestJS Gateway Module Registration
```typescript
// apps/api/src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { JwtModule } from '@nestjs/jwt'; // already global — no re-import needed if global

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService],
})
export class OrdersModule {}
```

### Status Update REST Endpoint (MGMT-03)
```typescript
// apps/api/src/orders/orders.controller.ts (addition)
@Patch(':orderId/status')
@UseGuards(JwtAuthGuard)
async updateOrderStatus(
  @Param('venueId') venueId: string,
  @Param('orderId') orderId: string,
  @Body() body: { status: 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' },
) {
  return this.ordersService.updateStatus(venueId, orderId, body.status);
}
```

This endpoint needs a controller routed under `/api/venues/:venueId/orders/:orderId/status` — different from the current public orders controller. A new authenticated `ManagementOrdersController` (or addition to VenuesController) is needed.

### Customer Status Page — WebSocket Upgrade
```typescript
// Replaces usePolling in OrderStatus component
useEffect(() => {
  socket.auth = { token: undefined }; // public — no auth
  socket.connect();

  function onConnect() {
    socket.emit('join:order', orderId);
  }
  function onOrderUpdated(update: { id: string; status: string }) {
    if (update.id === orderId) setStatus(update.status);
  }

  socket.on('connect', onConnect);
  socket.on('order:updated', onOrderUpdated);

  return () => {
    socket.off('connect', onConnect);
    socket.off('order:updated', onOrderUpdated);
    socket.disconnect();
  };
}, [orderId]);
```

**Note:** The customer order status page joins an order room WITHOUT auth token. The `afterInit` middleware should only reject connections that present an INVALID token, not connections that present NO token. Public pages (customer status) connect without auth; the gateway allows anonymous connections but only authenticated users can join venue rooms.

This requires a two-tier auth strategy: middleware allows connections with no token through; the `join:venue` handler checks `socket.data.userId` before joining the venue room.

### Order History Query (MGMT-05)
```typescript
async getHistory(venueId: string, from?: Date, to?: Date, page = 1, pageSize = 20) {
  const where = {
    venueId,
    ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    status: { in: ['COMPLETED', 'CANCELLED'] as const },
  };
  const [orders, total] = await Promise.all([
    this.prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    this.prisma.order.count({ where }),
  ]);
  return { orders, total, page, pageSize };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| usePolling for order status | Socket.IO WebSocket push | Phase 4 | Eliminates 5s latency; removes server polling load |
| REST polling for live dashboard | Socket.IO rooms with venue-scoped emissions | Phase 4 | Owner sees orders instantly; no polling overhead |
| Separate WebSocket port | Same port as HTTP (`@WebSocketGateway()` no port arg) | Always correct for Railway | Single Railway port; no infra changes needed |

**Current versions in use:**
- socket.io (server): 4.8.3 (shipped by @nestjs/platform-socket.io 11.1.15)
- socket.io-client: 4.8.3
- recharts: 3.7.0

## Open Questions

1. **Customer order status page — anonymous vs authenticated WebSocket**
   - What we know: Customers have no JWT. The gateway middleware currently blocks unauthenticated connections.
   - What's unclear: Should the gateway allow no-token connections (customer pages), or should customer WS go through a separate unauthenticated gateway?
   - Recommendation: Two-tier auth — middleware passes through connections with no token but marks `socket.data.isAuthenticated = false`; `join:order` handler allows anyone; `join:venue` handler requires `socket.data.userId`. A single gateway handles both use cases cleanly.

2. **Active orders definition for the Kanban board**
   - What we know: Orders in RECEIVED, PREPARING, READY should appear on the board. COMPLETED auto-hides after 30s.
   - What's unclear: Should PENDING_PAYMENT orders appear on the board (they are not yet confirmed)?
   - Recommendation: Exclude PENDING_PAYMENT from the board. These orders only transition to RECEIVED via Stripe webhook — the owner would see them appear naturally when payment completes. This keeps the board clean.

3. **WebSocket emission on Stripe webhook order creation**
   - What we know: PAY_AT_COUNTER orders transition to RECEIVED immediately in `OrdersService.create()`. STRIPE orders transition to RECEIVED in `WebhooksService.handlePaymentSucceeded()`.
   - What's unclear: WebhooksService currently doesn't have OrdersGateway injected.
   - Recommendation: Inject OrdersGateway into WebhooksModule/WebhooksService and emit `order:new` from `markOrderReceived()`. Confirm in OrdersService.create() for PAY_AT_COUNTER path as well.

## Sources

### Primary (HIGH confidence)
- @nestjs/platform-socket.io@11.1.15 npm — ships socket.io@4.8.3 as direct dep; peer deps verified via `pnpm info`
- @nestjs/websockets@11.1.15 npm — confirmed via `pnpm info`
- socket.io@4.8.3 — latest stable, verified via `pnpm info socket.io`
- socket.io-client@4.8.3 — verified via `pnpm info socket.io-client`
- recharts@3.7.0 — verified via `pnpm info recharts`
- https://socket.io/how-to/use-with-react — official Socket.IO React pattern: singleton, useEffect cleanup, named functions for socket.off
- https://socket.io/how-to/use-with-nextjs — official Socket.IO Next.js pattern: 'use client' singleton file
- https://socket.io/docs/v4/client-options/ — reconnection options: defaults and behavior
- https://ui.shadcn.com/docs/components/chart — shadcn Chart component: ChartContainer, BarChart pattern, min-h requirement
- Prisma aggregation docs (fetched from wanago.io analytics article cross-referencing Prisma docs) — aggregate(), groupBy(), $queryRaw patterns with BigInt caveat

### Secondary (MEDIUM confidence)
- https://preetmishra.com/blog/the-best-way-to-authenticate-websockets-in-nestjs — middleware auth pattern in `afterInit()` (confirms Guards don't block initial WS connections)
- https://oneuptime.com/blog/post/2026-02-02-nestjs-websockets/view — room join/emit patterns, same-port vs separate-port behavior
- https://www.lorenstew.art/blog/nestjs-websockets-real-time — gateway injection into service pattern
- MDN Web Audio API — AudioContext autoplay policy, suspended state, resume() pattern

### Tertiary (LOW confidence)
- General WebSearch on NestJS WebSocket multi-tenant room patterns — no single authoritative source; multiple consistent community sources corroborate the `venue:{venueId}` room naming convention

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified via `pnpm info` against live npm registry
- Architecture: HIGH — patterns verified against official Socket.IO docs and NestJS docs
- Pitfalls: HIGH — pitfalls 1/3/4/5/6/7/8 verified with official sources; pitfall 2 is architectural common sense verified by security principle
- Analytics queries: MEDIUM — Prisma aggregate/groupBy verified against docs; $queryRaw BigInt issue confirmed by multiple community sources; exact SQL syntax for Neon PostgreSQL assumed standard PostgreSQL

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (socket.io and NestJS are stable; shadcn chart API is stable; Recharts v3 recently released — watch for breaking changes if upgrading)
