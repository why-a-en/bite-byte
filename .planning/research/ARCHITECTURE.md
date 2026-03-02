# Architecture Research

**Domain:** Multi-tenant QR food ordering platform
**Researched:** 2026-03-02
**Confidence:** MEDIUM-HIGH

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                  │
│                                                                       │
│  ┌──────────────────────┐        ┌────────────────────────────────┐   │
│  │   Customer App       │        │    Venue Dashboard (Owner)     │   │
│  │  (Next.js, mobile    │        │    (Next.js, desktop/tablet)   │   │
│  │   browser, no login) │        │    (JWT-authenticated)         │   │
│  └──────────┬───────────┘        └────────────────┬───────────────┘   │
│             │ HTTPS REST                          │ HTTPS REST + WS   │
└─────────────┼──────────────────────────────────── ┼───────────────────┘
              │                                     │
┌─────────────▼─────────────────────────────────────▼───────────────────┐
│                         API LAYER (NestJS)                             │
│                                                                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────────┐ │
│  │  Auth      │  │  Venue /   │  │  Order     │  │  WebSocket       │ │
│  │  Module    │  │  Menu      │  │  Module    │  │  Gateway         │ │
│  │  (JWT)     │  │  Module    │  │  (state    │  │  (Socket.IO      │ │
│  │            │  │            │  │  machine)  │  │   rooms/venue)   │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └────────┬─────────┘ │
│        │               │               │                   │           │
│  ┌─────▼───────────────▼───────────────▼───────────────────▼─────────┐ │
│  │              Tenant Middleware (venueId extraction)                │ │
│  │              Prisma Client Extension (auto-filter by venueId)      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌────────────────────┐   ┌────────────────────────────────────────┐   │
│  │  Payments Module   │   │  Stripe Webhook Handler                │   │
│  │  (PaymentIntent    │   │  (rawBody: true, signature verify,     │   │
│  │   creation)        │   │   idempotency, order status update)    │   │
│  └────────┬───────────┘   └──────────────────┬─────────────────────┘   │
└───────────┼──────────────────────────────────┼────────────────────────┘
            │                                  │
┌───────────▼──────────────────────────────────▼────────────────────────┐
│                         DATA / EXTERNAL LAYER                          │
│                                                                        │
│  ┌──────────────────┐    ┌──────────────┐    ┌────────────────────┐   │
│  │  PostgreSQL       │    │   Stripe     │    │  QR Code           │   │
│  │  (shared schema,  │    │   API        │    │  (URL-encoded      │   │
│  │  venueId RLS)     │    │              │    │  venueId/slug)     │   │
│  └──────────────────┘    └──────────────┘    └────────────────────┘   │
└───────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Customer App | QR scan → menu browse → cart → order → status tracking | Next.js App Router, dynamic `[venueSlug]` route, no auth required |
| Venue Dashboard | Menu management, live order stream, order status updates, analytics | Next.js App Router, JWT-protected routes, WebSocket client |
| Auth Module | Venue owner registration/login, JWT issuance/refresh | NestJS `@nestjs/passport`, JWT strategy, bcrypt |
| Venue/Menu Module | CRUD for venues, menu categories, menu items | NestJS resource module, Prisma ORM, image upload |
| Order Module | Order creation, order state machine transitions, order history | NestJS service with state guard, emits WebSocket events on transitions |
| WebSocket Gateway | Push live order events to venue dashboard | NestJS `@WebSocketGateway`, Socket.IO, rooms keyed by venueId |
| Payments Module | Create Stripe PaymentIntent, return client_secret to frontend | Stripe Node SDK, NestJS service |
| Stripe Webhook Handler | Receive Stripe events, verify signature, update order status, emit WS | NestJS controller with `rawBody: true`, idempotency table |
| Tenant Middleware | Extract venueId/slug from route params or JWT payload on every request | NestJS middleware + Prisma `$extends` query interceptor |

---

## Recommended Project Structure

```
bite-byte/                           # Turborepo root
├── apps/
│   ├── web/                         # Next.js (Vercel)
│   │   └── src/
│   │       └── app/
│   │           ├── (customer)/      # Customer-facing routes (no auth)
│   │           │   └── [venueSlug]/
│   │           │       ├── page.tsx           # Menu page
│   │           │       ├── cart/page.tsx      # Cart
│   │           │       └── order/[orderId]/   # Order status tracking
│   │           ├── (dashboard)/     # Venue owner routes (JWT auth)
│   │           │   ├── login/
│   │           │   └── dashboard/
│   │           │       ├── orders/            # Live order queue
│   │           │       ├── menu/              # Menu management
│   │           │       ├── settings/          # QR code, payments config
│   │           │       └── analytics/
│   │           └── api/             # Next.js API routes (minimal — proxy or Stripe client-only)
│   │
│   └── api/                         # NestJS (Railway)
│       └── src/
│           ├── auth/                # JWT, guards, strategies
│           ├── venues/              # Venue CRUD, QR generation
│           ├── menus/               # Categories + items CRUD
│           ├── orders/              # Order lifecycle, state machine
│           ├── payments/            # Stripe PaymentIntent creation
│           ├── webhooks/            # Stripe webhook endpoint
│           ├── realtime/            # WebSocket gateway
│           ├── common/
│           │   ├── guards/          # JwtAuthGuard, VenueOwnerGuard
│           │   ├── middleware/      # TenantMiddleware
│           │   └── interceptors/   # TenantPrismaInterceptor
│           └── prisma/             # PrismaService, schema.prisma
│
└── packages/
    ├── types/                       # Shared TypeScript types + Zod schemas
    │   └── src/
    │       ├── order.types.ts       # OrderStatus enum, Order DTO
    │       ├── menu.types.ts        # MenuItem, Category DTOs
    │       ├── venue.types.ts       # Venue DTO
    │       └── websocket.types.ts  # WS event payloads
    ├── ui/                          # Shared React components (optional)
    ├── eslint-config/               # Shared ESLint config
    └── tsconfig/                    # Shared TypeScript config
```

### Structure Rationale

- **`apps/web` route groups:** `(customer)` and `(dashboard)` use Next.js App Router route groups to share layouts without polluting URLs. Customer routes are fully public; dashboard routes are protected client-side and server-side.
- **`apps/api` module-per-domain:** One NestJS module per business domain keeps concerns separated. The `common/` folder holds cross-cutting infrastructure (guards, middleware).
- **`packages/types`:** The single source of truth for types shared between NestJS DTOs and Next.js API call responses. Zod schemas here can be used for validation on both sides — NestJS via `nestjs-zod`, Next.js via direct Zod parse.
- **`prisma/schema.prisma` in `apps/api`:** Schema stays with the app that owns the DB connection; `packages/types` derives from it, not the other way around.

---

## Architectural Patterns

### Pattern 1: Row-Level Multi-Tenancy via Prisma Query Extension

**What:** Every table that belongs to a venue has a `venueId` foreign key. A Prisma Client Extension intercepts all `findMany`, `findUnique`, `create`, and `update` calls and automatically injects `{ venueId }` into the where clause and create data. The venueId is stored in NestJS CLS (Continuation Local Storage) — set by middleware on each request — so services never have to pass it manually.

**When to use:** Shared-schema multi-tenancy when you have a small-to-medium number of tenants (hundreds of venues, not thousands of enterprise clients). Simple to implement, low ops overhead, no per-tenant migrations needed.

**Trade-offs:** All tenant data is in the same tables (easier ops, slightly more complex queries at scale). If a bug bypasses the extension, tenant data could leak — mitigate with PostgreSQL RLS as a backstop.

**Example:**

```typescript
// apps/api/src/prisma/prisma-tenant.extension.ts
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

export function createTenantPrismaClient(
  prisma: PrismaClient,
  cls: ClsService
) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          const venueId = cls.get('venueId');
          if (venueId) {
            args.where = { ...args.where, venueId };
          }
          return query(args);
        },
        async create({ args, query }) {
          const venueId = cls.get('venueId');
          if (venueId) {
            args.data = { ...args.data, venueId };
          }
          return query(args);
        },
        // ... findUnique, update, delete similarly
      },
    },
  });
}
```

```typescript
// apps/api/src/common/middleware/tenant.middleware.ts
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // For dashboard routes: extract venueId from JWT payload
    // For customer routes: extract venueSlug from URL, resolve to venueId
    const venueId = req.user?.venueId ?? req['resolvedVenueId'];
    if (venueId) this.cls.set('venueId', venueId);
    next();
  }
}
```

---

### Pattern 2: Order State Machine with WebSocket Emission

**What:** Orders have a strict status enum: `PENDING_PAYMENT` → `RECEIVED` → `PREPARING` → `READY` → `COMPLETED` (plus `CANCELLED`). Transitions are validated server-side — you cannot skip states. After each valid transition, the Order service emits a WebSocket event to the venue's Socket.IO room so the kitchen dashboard updates instantly. The same event is also sent to the customer's session.

**When to use:** Any system where order lifecycle must be auditable and UI must reflect changes without polling.

**Trade-offs:** WebSocket connections add server state. For a single NestJS instance (the initial deployment), this is trivial. If scaling to multiple instances, Socket.IO adapter (Redis) is needed to fan out to all nodes.

**Example:**

```typescript
// apps/api/src/orders/order-status.enum.ts
export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT', // online payment not yet confirmed
  RECEIVED        = 'RECEIVED',        // payment confirmed or pay-at-counter order placed
  PREPARING       = 'PREPARING',       // kitchen is working on it
  READY           = 'READY',           // ready for pickup/table service
  COMPLETED       = 'COMPLETED',       // customer received order
  CANCELLED       = 'CANCELLED',
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING_PAYMENT]: [OrderStatus.RECEIVED, OrderStatus.CANCELLED],
  [OrderStatus.RECEIVED]:        [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]:       [OrderStatus.READY],
  [OrderStatus.READY]:           [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]:       [],
  [OrderStatus.CANCELLED]:       [],
};

// In OrdersService.updateStatus():
if (!VALID_TRANSITIONS[current].includes(next)) {
  throw new BadRequestException(`Cannot transition ${current} → ${next}`);
}
const updated = await this.prisma.order.update({ ... });
this.ordersGateway.emitOrderUpdate(updated.venueId, updated);
```

```typescript
// apps/api/src/realtime/orders.gateway.ts
@WebSocketGateway({ namespace: '/orders', cors: { origin: '*' } })
export class OrdersGateway {
  @WebSocketServer() server: Server;

  // Venue dashboard connects and joins its room
  @SubscribeMessage('join-venue')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() venueId: string) {
    client.join(`venue:${venueId}`);
  }

  // Customer connects and joins their order room
  @SubscribeMessage('join-order')
  handleJoinOrder(@ConnectedSocket() client: Socket, @MessageBody() orderId: string) {
    client.join(`order:${orderId}`);
  }

  // Called by OrdersService after any status transition
  emitOrderUpdate(venueId: string, order: Order) {
    this.server.to(`venue:${venueId}`).emit('order:updated', order);
    this.server.to(`order:${order.id}`).emit('order:updated', order);
  }
}
```

---

### Pattern 3: Stripe Payment Flow (PaymentIntent + Webhook)

**What:** The customer-facing app calls the NestJS API to create a Stripe PaymentIntent when they proceed to checkout with online payment selected. NestJS returns the `client_secret` to the browser. The customer completes payment on the frontend using Stripe Elements. Stripe then sends a `payment_intent.succeeded` webhook to NestJS, which confirms the order and transitions it to `RECEIVED`.

**When to use:** Any time you need server-side payment confirmation (required — never trust client-side payment status).

**Trade-offs:** Requires a public NestJS webhook endpoint with `rawBody: true`. The Stripe webhook must be registered with the correct endpoint URL in the Stripe dashboard.

**Example flow:**

```
1. Customer clicks "Pay online"
   → POST /api/orders { items, paymentMethod: 'STRIPE' }
   → NestJS: create Order (status=PENDING_PAYMENT) + create Stripe PaymentIntent
   → NestJS: store paymentIntentId on Order, return { orderId, clientSecret }

2. Browser: collect card via Stripe Elements, confirmPayment(clientSecret)
   → Stripe processes payment

3. Stripe: POST /api/webhooks/stripe { event: payment_intent.succeeded }
   → NestJS: verify signature, extract metadata.orderId
   → NestJS: update Order status PENDING_PAYMENT → RECEIVED
   → NestJS: emit WebSocket event to venue room

4. Venue dashboard: receives 'order:updated' event, shows new order
5. Customer status page: receives 'order:updated' event, shows "Order Received"
```

```typescript
// Idempotency — critical for webhooks
// Store processed Stripe event IDs to prevent duplicate transitions
async handleWebhook(rawBody: Buffer, signature: string) {
  const event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);

  const existing = await this.prisma.stripeEvent.findUnique({
    where: { stripeEventId: event.id }
  });
  if (existing) return; // Already processed

  await this.prisma.stripeEvent.create({ data: { stripeEventId: event.id } });
  // ... process event
}
```

---

## Data Flow

### Customer Order Flow

```
Customer scans QR
    ↓
GET /[venueSlug]                 → Next.js fetches venue + menu from NestJS API
    ↓
Customer builds cart             → Local state (React, no server involvement)
    ↓
POST /api/orders                 → NestJS creates Order (PENDING_PAYMENT or RECEIVED)
    ↓ (if Stripe selected)
NestJS creates PaymentIntent     → Returns clientSecret to browser
    ↓
Browser: Stripe Elements confirmPayment()
    ↓
Stripe → POST /api/webhooks/stripe
    ↓
NestJS: Order → RECEIVED         → Emits WebSocket 'order:updated' to venue room
    ↓
Customer polls GET /api/orders/:id  OR subscribes to WebSocket order room
    ↓ (venue owner updates status)
WebSocket 'order:updated' pushed to customer's order room
```

### Venue Dashboard (Kitchen Display) Flow

```
Owner logs in → JWT issued
    ↓
Dashboard loads: GET /api/orders?status=active    (REST, paginated)
    ↓
WebSocket connect → join-venue(venueId)           (persistent connection)
    ↓
New order arrives: 'order:updated' event          (pushed, no polling)
    ↓
Owner taps "Start Preparing"
    → PATCH /api/orders/:id/status { status: 'PREPARING' }
    → NestJS validates transition, updates DB
    → Emits 'order:updated' to venue room AND customer order room
```

### State Management (Frontend)

```
Customer App: Local cart state → React useState / useReducer (no server)
              Order status: WebSocket subscription OR 5s polling fallback

Venue Dashboard: React Query for initial order list
                 WebSocket 'order:updated' events: invalidate / patch cache directly
                 (avoid full refetch on every event — update order in list by ID)
```

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Stripe | REST via `stripe` Node SDK (PaymentIntent creation); webhook POST from Stripe to NestJS | Must set `rawBody: true` on NestJS bootstrap. Stripe event idempotency table required. Metadata: `{ orderId }` on PaymentIntent. |
| QR Code | Generated server-side (NestJS), encode `https://{domain}/{venueSlug}` as URL | Library: `qrcode` npm package. Generated on venue creation/QR refresh. Stored as PNG or data URL. No external service needed. |
| Vercel | Hosts Next.js; environment variables for `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STRIPE_PK` | Server Components call NestJS directly. Client Components call via public URL. |
| Railway | Hosts NestJS + PostgreSQL; environment variables for Stripe secret, JWT secret, DB URL | NestJS `rawBody: true` must be set at app bootstrap. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Next.js → NestJS | HTTPS REST (JSON). Server Components call directly; Client Components call via browser. | No tRPC for v1 — plain fetch with shared TypeScript types is sufficient. |
| NestJS → Customer/Dashboard | Socket.IO over WebSocket (`/orders` namespace, rooms per venue and per order) | One namespace is enough. Use rooms not namespaces for per-tenant isolation. |
| NestJS → Stripe | Stripe Node SDK (server-side only; secret key never leaves NestJS) | |
| Stripe → NestJS | HTTP POST webhook to `/api/webhooks/stripe`. Verify with `stripe.webhooks.constructEvent()`. | |
| `packages/types` → `apps/api` | TypeScript import — NestJS DTOs extend or use Zod inferred types from shared package | |
| `packages/types` → `apps/web` | TypeScript import — Next.js uses same types for API response typing | |

---

## Suggested Build Order

Components have hard dependencies. Build in this order:

1. **Monorepo scaffolding** — Turborepo + pnpm workspaces, `apps/web`, `apps/api`, `packages/types`. Get builds wiring correctly before any logic.

2. **Database schema** — Prisma schema covering `Venue`, `MenuCategory`, `MenuItem`, `Order`, `OrderItem`, `User` (venue owner). Migrations. This unblocks everything else.

3. **Auth module** — JWT login/register for venue owners. Required before any protected API route.

4. **Multi-tenant middleware** — CLS + Prisma extension for venueId injection. Build this early so every subsequent module is automatically tenant-scoped.

5. **Venue + Menu modules** — CRUD APIs behind auth. Let owners create their venue and menu. Unlocks customer-facing routes.

6. **Customer-facing menu page** — `[venueSlug]` Next.js route. Public. Reads menu from API. Cart state is local.

7. **Order module (pay-at-counter path)** — Create orders, basic status state machine, no payment. Ship this before payments to validate the order flow end-to-end.

8. **WebSocket Gateway** — Live order push to venue dashboard. Needed before dashboard is useful.

9. **Venue dashboard** — Order queue view, status update buttons. Depends on WebSocket.

10. **Payments module** — Stripe PaymentIntent creation + webhook handler. Plug into the already-working order flow.

11. **QR code generation** — Simple addition once venue CRUD exists. Encode slug URL.

12. **Analytics** — Aggregate queries on orders table. Defer to late phases.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–100 venues | Single NestJS instance + single PostgreSQL. Vercel + Railway. No caching needed. This is v1. |
| 100–1K venues | Add Redis for Socket.IO adapter (fan-out across multiple NestJS instances). Add connection pooling (PgBouncer). Read replicas if analytics queries slow down order queries. |
| 1K+ venues | Consider CDN-cached menu pages (Next.js ISR with on-demand revalidation on menu update). Database sharding or schema-per-tenant if row counts become a problem. Redis caching for menu reads (hot path). |

### Scaling Priorities

1. **First bottleneck:** WebSocket connections per NestJS process. A single Node process handles ~10K concurrent connections comfortably. Redis adapter when running >1 instance.

2. **Second bottleneck:** Menu reads. Every customer scanning a QR hits the menu endpoint. Cache menu JSON in Redis (invalidate on menu save) or use Next.js ISR to serve statically.

---

## Anti-Patterns

### Anti-Pattern 1: Polling for Order Status Instead of WebSocket

**What people do:** Customer order status page polls `GET /api/orders/:id` every 2–5 seconds.
**Why it's wrong:** Multiplied by hundreds of concurrent customers across venues, polling hammers the API and database with reads that return the same data 95% of the time.
**Do this instead:** Customer joins a Socket.IO order room on page load. NestJS emits exactly when status changes. Fall back to polling only if WebSocket connection fails (progressive enhancement).

### Anti-Pattern 2: Missing Tenant Filter on Public Routes

**What people do:** Customer-facing API routes don't apply tenant filtering because they don't have a JWT. Developer manually adds `where: { venueId }` in some places but forgets others.
**Why it's wrong:** Any query without a venueId filter leaks data across tenants. In a shared-schema DB, this means customer A could theoretically see customer B's orders.
**Do this instead:** The TenantMiddleware resolves venueId from the URL slug (not JWT) for public routes and stores it in CLS. The Prisma extension auto-filters all queries. Tenant isolation is at the infrastructure layer, not scattered through business logic.

### Anti-Pattern 3: Confirming Payment Client-Side

**What people do:** Frontend calls Stripe, gets `payment_succeeded` response, immediately calls `POST /api/orders` to mark order as paid.
**Why it's wrong:** Client can be manipulated. Network can fail between payment and API call. User can close the browser.
**Do this instead:** Order is created as `PENDING_PAYMENT` before Stripe. The Stripe webhook (server → server) is the only thing that transitions to `RECEIVED`. Frontend only reads the resulting status — it never writes it.

### Anti-Pattern 4: One Socket.IO Namespace Per Venue

**What people do:** Create a dynamic namespace like `/venue-abc123` per tenant for isolation.
**Why it's wrong:** NestJS dynamic namespace support is limited and requires workarounds. Each namespace spawns separate event emitter overhead. Rooms within a single namespace achieve the same isolation with less complexity.
**Do this instead:** Single `/orders` namespace. Each venue dashboard joins `venue:{venueId}` room on connect. Each customer order page joins `order:{orderId}` room. Emit to rooms, not namespaces.

### Anti-Pattern 5: Shared Stripe Secret Key in Frontend

**What people do:** Put `STRIPE_SECRET_KEY` in Next.js environment and call Stripe from Server Components to create PaymentIntents.
**Why it's wrong:** Server Components technically have access to secrets, but mixing payment initiation into the frontend blurs the boundary. If the architecture ever adds a mobile client or third-party integration, there's no clean backend payment API to call.
**Do this instead:** PaymentIntent creation lives exclusively in the NestJS `PaymentsModule`. The Next.js frontend only ever holds the `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (safe to expose) and the `client_secret` returned by the API for a specific order.

---

## Sources

- [NestJS WebSocket Gateways — Official Docs](https://docs.nestjs.com/websockets/gateways) — HIGH confidence
- [Socket.IO Rooms documentation](https://socket.io/docs/v3/rooms/) — HIGH confidence
- [Prisma $extends query interception for multi-tenancy (DEV Community, 2024)](https://dev.to/murilogervasio/how-to-make-multi-tenant-applications-with-nestjs-and-a-prisma-proxy-to-automatically-filter-tenant-queries--4kl2) — MEDIUM confidence
- [Multi-Tenant SaaS with NestJS, Prisma, and Row-Level Security](https://js.elitedev.in/js/complete-guide-build-multi-tenant-saas-with-nestjs-prisma-and-row-level-security-96c123c5/) — MEDIUM confidence
- [Stripe PaymentIntent with NestJS Webhook Handling (DEV Community)](https://dev.to/imzihad21/integrating-stripe-payment-intent-in-nestjs-with-webhook-handling-1n65) — MEDIUM confidence
- [Stripe Webhook Best Practices — Handle Payment Events](https://docs.stripe.com/webhooks/handling-payment-events) — HIGH confidence
- [Turborepo Next.js + NestJS + ShadCN PR example (Vercel/Turborepo)](https://github.com/vercel/turborepo/pull/10792) — MEDIUM confidence
- [2025 NestJS + React 19 + Drizzle ORM + Turborepo Architecture Decision Record](https://dev.to/xiunotes/2025-nestjs-react-19-drizzle-orm-turborepo-architecture-decision-record-3o1k) — MEDIUM confidence
- [Next.js Dynamic Routes — Official Docs](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) — HIGH confidence
- [NestJS Multi-Tenant Auth (DEV Community)](https://dev.to/ismaeil_shajar/create-a-multi-tenancy-application-in-nestjs-part-4-authentication-and-authorization-setup-2c47) — MEDIUM confidence

---

*Architecture research for: Multi-tenant QR food ordering platform (Bite Byte)*
*Researched: 2026-03-02*
