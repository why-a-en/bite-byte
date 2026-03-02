# Phase 1: Foundation - Research

**Researched:** 2026-03-02
**Domain:** Turborepo monorepo scaffolding, Prisma 7 multi-tenant schema, PostgreSQL RLS, NestJS CLS
**Confidence:** HIGH (core patterns verified via official docs and multiple cross-referenced sources)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

None — user deferred all foundation decisions to Claude's judgment.

### Claude's Discretion

User deferred all foundation decisions to Claude's judgment, informed by research. Claude has full flexibility on:

- **Monorepo structure** — Package names, app organization, shared types package, Turborepo pipeline config
- **Data model design** — Entity relationships, column naming, index strategy, RLS policy design
- **Dev environment** — Docker Compose for PostgreSQL, seed data strategy, dev tooling (ESLint, Prettier, etc.)
- **Code conventions** — Naming style, file organization, import patterns, TypeScript strictness level
- **Testing setup** — Vitest configuration, test file conventions, SWC integration for NestJS decorators

All decisions should follow patterns from research (STACK.md, ARCHITECTURE.md) and prioritize:
1. Correctness of tenant isolation (this is load-bearing)
2. Modifier-extensible schema (avoid future migrations)
3. Developer experience (hot reload, type sharing, minimal config)

Specific ideas to include in implementation:
- Prisma 7.x with `$extends` for tenant scoping
- PostgreSQL RLS as defense-in-depth
- Zod schemas in shared `packages/types` for cross-app validation
- Socket.IO stubs (actual implementation in Phase 4)
- Stripe webhook handler stub with idempotency table

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFR-01 | Multi-tenant data isolation — each venue's data is scoped and inaccessible to other venues | Prisma `$extends` query extension with `$allOperations` + PostgreSQL RLS with `set_config('app.tenant_id', ...)` + nestjs-cls for request-scoped tenantId propagation |
| INFR-02 | Payment state is driven exclusively by Stripe webhooks (never client-side) | Stripe idempotency table (`stripe_events`) with unique constraint on `stripe_event_id`; `payment_intent.succeeded` event as the sole trigger for `RECEIVED` status; webhook handler stub included in this phase |
| INFR-03 | Order records snapshot item prices at time of order (not references to mutable menu prices) | `order_items` schema with `unit_price_at_order Decimal` and `item_name_at_order String` as non-nullable snapshot columns; `menu_item_id` retained as nullable reference for analytics linkage only |
</phase_requirements>

---

## Summary

Phase 1 is purely infrastructure — no features, no UI, no endpoints beyond health checks. Three workstreams run in sequence: (1) monorepo scaffolding, (2) Prisma schema design, (3) multi-tenant isolation. The monorepo must compile and hot-reload before any schema work begins. The schema must exist and be migrated before the tenant isolation layer can be tested.

The highest-risk element is the dual-layer tenant isolation: Prisma `$extends` at the application layer + PostgreSQL RLS at the database layer. Both layers must be in place before any business logic is written in Phase 2. The `$extends` extension intercepts all queries and calls `set_config('app.tenant_id', tenantId, TRUE)` inside a transaction, then RLS policies enforce the same constraint at the database level. The `TRUE` flag in `set_config` scopes the variable to the current transaction (not session), which is safe under connection pooling.

The schema design decisions in this phase are irreversible without painful migrations. Two constraints must be baked in now: (a) price snapshotting on `order_items` (`unit_price_at_order`, `item_name_at_order`) to prevent financial history corruption on menu edits, and (b) JSONB extensibility hooks (`metadata` on `menu_items`, `selected_modifiers` on `order_items`) so modifier support in v2 requires zero schema migration. These cost nothing to add now.

**Primary recommendation:** Scaffold in order — monorepo structure first, then schema, then tenant layer. Never write business logic before tenant isolation is tested with a cross-tenant access assertion.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| turbo | ^2.x | Monorepo task orchestration | pnpm workspace + caching; persistent dev task support in v2 |
| pnpm | ^9.x | Package manager | Turborepo officially recommends pnpm for workspaces; strict isolation |
| prisma | ^7.x | Schema migrations CLI | Schema-first, Rust-free in v7, 3x faster cold start |
| @prisma/client | ^7.x | Type-safe DB queries | Auto-generated from schema; full TypeScript inference |
| nestjs-cls | ^6.x | Continuation local storage | Request-scoped tenantId without request-scoped providers; NestJS 11 support in v5+, v6.x is current |
| @nestjs/common + @nestjs/core | ^11.x | NestJS framework | Already decided; needed for PrismaService and TenantMiddleware |
| @nestjs/config | ^11.x | Environment config module | DATABASE_URL, Stripe keys, JWT secret |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | ^3.x | Schema validation + type inference | Shared `packages/types` package; avoid Zod 4 until nestjs-zod compatibility confirmed |
| typescript | ^5.x | Language | Strict mode; shared tsconfig in `packages/tsconfig` |
| reflect-metadata | ^0.2.x | Decorator metadata | Required by NestJS DI system |
| @types/node | ^22.x | Node.js types | LTS is Node 22 per STACK.md |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| nestjs-cls | request-scoped providers | Request-scoped providers work but require every service that touches DB to become request-scoped — cascading DI change that forces PrismaService to be request-scoped too. nestjs-cls avoids this entirely via AsyncLocalStorage. |
| Prisma `$extends` $allOperations | Per-service WHERE clause | Per-service is fragile — one missed clause leaks cross-tenant data. Extension is automatic for ALL queries. |
| PostgreSQL RLS | Application-only isolation | App-only: a single missed WHERE clause is a security incident. RLS is defense-in-depth at the DB level. |
| Docker Compose for dev Postgres | Neon / Supabase free tier | Local Docker is self-contained, offline-capable, and mirrors Railway Postgres exactly. Free cloud tiers add network latency and shared resource contention. |

**Installation:**
```bash
# Root
pnpm add -D turbo typescript

# apps/api
pnpm add nestjs-cls @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config reflect-metadata
pnpm add prisma @prisma/client

# packages/types
pnpm add zod
```

---

## Architecture Patterns

### Recommended Project Structure

```
bite-byte/                              # Turborepo root
├── apps/
│   ├── web/                            # Next.js 16 (Vercel)
│   │   ├── src/app/                    # App Router
│   │   ├── package.json                # "name": "@bite-byte/web"
│   │   └── tsconfig.json              # extends ../../packages/tsconfig/nextjs.json
│   │
│   └── api/                            # NestJS 11 (Railway)
│       ├── src/
│       │   ├── app.module.ts
│       │   ├── main.ts
│       │   ├── prisma/
│       │   │   ├── prisma.service.ts   # PrismaClient wrapper
│       │   │   ├── prisma.module.ts    # Global PrismaModule
│       │   │   └── prisma-tenant.extension.ts  # $extends tenant filter
│       │   ├── common/
│       │   │   └── middleware/
│       │   │       └── tenant.middleware.ts
│       │   └── webhooks/
│       │       └── stripe-webhook.stub.ts  # Stub with idempotency check
│       ├── prisma/
│       │   └── schema.prisma           # Single source of truth
│       ├── package.json                # "name": "@bite-byte/api"
│       └── tsconfig.json
│
├── packages/
│   ├── types/                          # Shared Zod schemas + TS types
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── order.types.ts
│   │   │   ├── venue.types.ts
│   │   │   └── menu.types.ts
│   │   └── package.json                # "name": "@bite-byte/types"
│   │
│   ├── tsconfig/                       # Shared TypeScript configs
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   └── nestjs.json
│   │
│   └── eslint-config/                  # Shared ESLint config (optional in Phase 1)
│
├── pnpm-workspace.yaml                 # packages: ["apps/*", "packages/*"]
├── turbo.json                          # Pipeline config
├── package.json                        # Root; engines: { node: ">=22" }
├── .env.example
└── docker-compose.yml                  # PostgreSQL 16 for local dev
```

### Pattern 1: Turborepo turbo.json for Concurrent Dev

**What:** `dev` tasks for both `apps/web` and `apps/api` run simultaneously via `persistent: true`. A `build` task on `packages/types` runs before the apps' dev servers start, ensuring shared types are compiled.

**When to use:** Any monorepo where multiple long-running dev servers need to start concurrently.

```jsonc
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

Root `package.json` scripts:
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "type-check": "turbo run type-check"
  }
}
```

**Note on `dependsOn: ["^build"]`:** The `^` means "all upstream workspace dependencies must build first." So `packages/types` builds before `apps/web` and `apps/api` start. This is essential for the shared types package. Persistent dev tasks cannot be depended upon, but they CAN depend on build tasks. [Source: Turborepo configuring tasks docs](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks)

### Pattern 2: PrismaService (NestJS Module)

**What:** Standard Prisma NestJS integration pattern — `PrismaService` extends `PrismaClient`, implements lifecycle hooks. Exposed as a global module so all NestJS modules can inject it without `imports: [PrismaModule]` boilerplate.

```typescript
// apps/api/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// apps/api/src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### Pattern 3: nestjs-cls + Prisma Tenant Extension (Dual-Layer Isolation)

**What:** This is the load-bearing isolation pattern. Two components work together: (a) nestjs-cls stores `venueId` per-request via middleware, (b) a Prisma `$extends` extension intercepts every DB operation and calls `set_config` in a transaction before the query. PostgreSQL RLS policies enforce the same constraint at the DB level.

**Why this approach:** `set_config('app.tenant_id', venantId, TRUE)` uses `TRUE` as the "local" flag — scoping the variable to the current transaction only, not the session. This is safe under connection pooling (PgBouncer, Prisma's internal pool) because the setting cannot bleed to the next query on the same pooled connection. [Source: AWS RLS blog, set_config docs](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/)

**Step 1 — nestjs-cls setup:**
```typescript
// apps/api/src/app.module.ts
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          // venueId is resolved later in TenantMiddleware
          // CLS context is initialized here for all routes
        },
      },
    }),
    PrismaModule,
    // ... other modules
  ],
})
export class AppModule {}
```

**Step 2 — TenantMiddleware resolves venueId:**
```typescript
// apps/api/src/common/middleware/tenant.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // For dashboard routes: venueId from JWT payload (set by JwtStrategy in Phase 2)
    // For customer routes: venueId resolved from venueSlug URL param (Phase 3)
    // For Phase 1: stub — no real resolution yet
    const venueId = (req as any).venueId ?? null;
    if (venueId) {
      this.cls.set('VENUE_ID', venueId);
    }
    next();
  }
}
```

**Step 3 — Prisma extension intercepts all operations:**
```typescript
// apps/api/src/prisma/prisma-tenant.extension.ts
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

export function createTenantPrismaExtension(
  prisma: PrismaClient,
  cls: ClsService,
) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const venueId = cls.get<string>('VENUE_ID');
          if (!venueId) {
            // No tenant context — allow (for admin/system operations)
            // or throw, depending on route type
            return query(args);
          }
          // Use transaction to scope set_config to current operation only
          const [, result] = await prisma.$transaction([
            prisma.$executeRaw`SELECT set_config('app.tenant_id', ${venueId}, TRUE)`,
            query(args) as any,
          ]);
          return result;
        },
      },
    },
  });
}
```

**Step 4 — PostgreSQL RLS policies (applied via Prisma migration raw SQL):**
```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues FORCE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories FORCE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items FORCE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items FORCE ROW LEVEL SECURITY;

-- RLS policy: restrict all access to matching tenant
CREATE POLICY tenant_isolation_policy ON venues
  USING ("id"::text = current_setting('app.tenant_id', TRUE));

CREATE POLICY tenant_isolation_policy ON menu_categories
  USING ("venue_id"::text = current_setting('app.tenant_id', TRUE));

-- Repeat for menu_items, orders, order_items (using venue_id column)
```

**Note on `FORCE ROW LEVEL SECURITY`:** Without this, table owners (the Prisma DB user) bypass RLS. `FORCE` prevents even the table owner from bypassing it. This is critical — the Prisma database user is typically the table owner. [Source: PostgreSQL official docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

**Note on Prisma `$transaction` for set_config:** The Prisma `$extends` `$allOperations` callback wraps each query in a `$transaction([set_config, query])` pair. This is the established pattern for RLS with Prisma — the set_config and query execute together, and the transaction-local scope (TRUE flag) prevents bleed. There is a known GitHub issue (#23583) about interactive transactions blocking with extended clients — avoid interactive transactions in extension callbacks; use array syntax `$transaction([...])` only. [Source: prisma/prisma#23583](https://github.com/prisma/prisma/issues/23583)

### Pattern 4: Prisma Schema with Modifier-Ready JSONB

**What:** The schema includes JSONB extensibility hooks now so v2 modifier support requires zero migration.

```prisma
// apps/api/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Venue {
  id          String   @id @default(uuid()) @db.Uuid
  name        String
  slug        String   @unique
  logoUrl     String?  @map("logo_url")
  paymentMode PaymentMode @default(BOTH) @map("payment_mode")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  categories  MenuCategory[]
  orders      Order[]

  @@map("venues")
}

enum PaymentMode {
  PREPAY_REQUIRED
  PAY_AT_COUNTER
  BOTH
}

model MenuCategory {
  id        String   @id @default(uuid()) @db.Uuid
  venueId   String   @map("venue_id") @db.Uuid
  name      String
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  venue     Venue      @relation(fields: [venueId], references: [id])
  items     MenuItem[]

  @@map("menu_categories")
}

model MenuItem {
  id          String   @id @default(uuid()) @db.Uuid
  venueId     String   @map("venue_id") @db.Uuid
  categoryId  String   @map("category_id") @db.Uuid
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  imageUrl    String?  @map("image_url")
  isAvailable Boolean  @default(true) @map("is_available")
  sortOrder   Int      @default(0) @map("sort_order")
  // JSONB extensibility hook — empty object for v1; v2 modifiers stored here
  metadata    Json     @default("{}") @db.JsonB
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  category    MenuCategory @relation(fields: [categoryId], references: [id])
  orderItems  OrderItem[]

  @@map("menu_items")
}

model Order {
  id            String      @id @default(uuid()) @db.Uuid
  venueId       String      @map("venue_id") @db.Uuid
  status        OrderStatus @default(PENDING_PAYMENT)
  paymentMethod PaymentMethod @map("payment_method")
  // paymentIntentId is null for pay-at-counter orders
  paymentIntentId String?   @map("payment_intent_id")
  totalAmount   Decimal     @db.Decimal(10, 2) @map("total_amount")
  referenceCode String      @unique @map("reference_code")
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")

  venue         Venue       @relation(fields: [venueId], references: [id])
  items         OrderItem[]

  @@map("orders")
}

enum OrderStatus {
  PENDING_PAYMENT
  RECEIVED
  PREPARING
  READY
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  STRIPE
  PAY_AT_COUNTER
}

model OrderItem {
  id                  String   @id @default(uuid()) @db.Uuid
  orderId             String   @map("order_id") @db.Uuid
  // Nullable FK to menu_items — kept for analytics linkage only
  // NULL if item was deleted after order was placed
  menuItemId          String?  @map("menu_item_id") @db.Uuid
  // SNAPSHOT columns — these NEVER change after order creation
  itemNameAtOrder     String   @map("item_name_at_order")
  unitPriceAtOrder    Decimal  @db.Decimal(10, 2) @map("unit_price_at_order")
  quantity            Int
  // JSONB — empty array for v1; v2 modifier selections stored here
  selectedModifiers   Json     @default("[]") @db.JsonB @map("selected_modifiers")
  createdAt           DateTime @default(now()) @map("created_at")

  order               Order    @relation(fields: [orderId], references: [id])
  menuItem            MenuItem? @relation(fields: [menuItemId], references: [id], onDelete: SetNull)

  @@map("order_items")
}

// Stripe webhook idempotency table — prevents duplicate order processing
// on Stripe retry (up to 72h retry window)
model StripeEvent {
  id            String   @id @default(uuid()) @db.Uuid
  stripeEventId String   @unique @map("stripe_event_id")
  processedAt   DateTime @default(now()) @map("processed_at")
  eventType     String   @map("event_type")

  @@map("stripe_events")
}
```

**Key schema decisions:**
- `unit_price_at_order` and `item_name_at_order` are non-nullable snapshots (INFR-03)
- `metadata Json @db.JsonB` on `MenuItem` and `selectedModifiers Json @db.JsonB` on `OrderItem` add extensibility with zero cost
- `menuItemId` is nullable (`String?`) with `onDelete: SetNull` — analytics linkage survives item deletion
- `StripeEvent` table with unique `stripeEventId` enforces idempotency at DB level (INFR-02)
- `referenceCode` on `Order` is `@unique` — human-readable order reference for customers
- All IDs use UUIDs (`@db.Uuid`) — non-sequential, prevents enumeration attacks

### Pattern 5: Docker Compose for Local Development

```yaml
# docker-compose.yml (root)
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: bitebyte
      POSTGRES_PASSWORD: bitebyte
      POSTGRES_DB: bitebyte_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bitebyte"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Root `.env` for local dev:
```bash
DATABASE_URL="postgresql://bitebyte:bitebyte@localhost:5432/bitebyte_dev"
```

Prisma migration workflow:
```bash
# First time
docker compose up -d postgres
cd apps/api && pnpm prisma migrate dev --name init

# After schema changes
pnpm prisma migrate dev --name <migration_name>

# Generate client after schema change
pnpm prisma generate
```

### Pattern 6: Stripe Webhook Handler Stub

This satisfies success criterion 5 (idempotency table referenced in webhook handler stub). The stub acknowledges the event, checks for duplicates, and returns 200 — no business logic yet.

```typescript
// apps/api/src/webhooks/stripe-webhook.stub.ts
import { Controller, Post, Headers, RawBody, HttpCode } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Controller('webhooks')
export class StripeWebhookStub {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  constructor(private readonly prisma: PrismaService) {}

  @Post('stripe')
  @HttpCode(200)
  async handleStripeWebhook(
    @RawBody() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    // Idempotency check — prevents duplicate processing on Stripe retry
    const existing = await this.prisma.stripeEvent.findUnique({
      where: { stripeEventId: event.id },
    });
    if (existing) {
      return { received: true, status: 'already_processed' };
    }

    // Record event before processing (prevents race conditions)
    await this.prisma.stripeEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
      },
    });

    // TODO Phase 3: switch(event.type) handler for payment_intent.succeeded
    return { received: true };
  }
}
```

**Note:** NestJS must be bootstrapped with `rawBody: true` in `main.ts` for this to work:
```typescript
// apps/api/src/main.ts
const app = await NestFactory.create(AppModule, { rawBody: true });
```

### Anti-Patterns to Avoid

- **Tenant context in services, not middleware:** If venueId is passed as a service parameter instead of CLS, every future service that touches the DB must accept and thread it manually. CLS is request-scoped by default and invisible to service signatures.
- **`SET` instead of `SET LOCAL` / `set_config(..., FALSE)`:** Session-scoped settings persist for the lifetime of a pooled connection, leaking tenant context to the next request that gets the same connection. Always use `set_config('app.tenant_id', id, TRUE)` (transaction-local).
- **RLS disabled on new tables:** When adding a table in Phase 2+, forgetting to `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` means that table has no DB-level protection. Document this in a CLAUDE.md note after Phase 1.
- **PrismaService as request-scoped:** Making PrismaService request-scoped to hold tenantId (an anti-pattern that tempts developers) forces every module that imports PrismaModule to be request-scoped. NestJS DI makes this viral. Use CLS instead.
- **Bypassing the extension for "admin" queries:** Creating a raw PrismaClient instance for "admin" queries bypasses the tenant extension. This is fine only for migrations and seeding — never in request handlers.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Request-scoped storage | Manual thread-local via WeakMap or node cls-hooked | `nestjs-cls` ^6.x | nestjs-cls uses Node.js native AsyncLocalStorage (no monkey-patching), has NestJS DI integration, works with guards/interceptors/pipes, supports NestJS 11. The manual approaches break on async boundaries or require patching Node internals. |
| Tenant query filtering | Per-service `WHERE venueId = X` logic | Prisma `$extends $allOperations` | Per-service requires every developer to remember the filter on every new query. The extension is automatic for all models, including ones added in future phases. |
| DB transaction scope | Manual `SET SESSION` then hoping it's cleared | `set_config(key, val, TRUE)` in `$transaction` | Transaction-local scope is the only safe approach under connection pooling. Any other approach risks tenant bleed under concurrent load. |
| Webhook idempotency | Custom event log table with manual deduplication | `StripeEvent` model with `@unique stripeEventId` | The unique constraint is the atomic guard — even under concurrent webhook delivery, the DB constraint prevents duplicate records. Application-layer checks are a race condition. |
| UUID generation | `Math.random()` or sequential IDs | `@id @default(uuid())` in Prisma schema | Sequential IDs enable enumeration attacks (customer guesses orderId + 1 to see another order). UUIDs are non-sequential by default. PostgreSQL generates them server-side. |

**Key insight:** Tenant isolation and idempotency are cross-cutting concerns. Any implementation that scatters the logic across services will inevitably have gaps.

---

## Common Pitfalls

### Pitfall 1: `$allOperations` Performance — Every Query Runs a Transaction

**What goes wrong:** Wrapping every query in `$transaction([set_config, query])` adds ~1 SQL round-trip per query. Under high load, this doubles DB calls for all Prisma operations.

**Why it happens:** The set_config-in-transaction pattern is necessary for connection-pool safety but adds overhead.

**How to avoid:** For Phase 1 (dev/testing only), this overhead is irrelevant. For production Phase 1+, the alternative is to use Prisma middleware (deprecated) or accept the overhead. A more efficient pattern (advanced): use `$connect` with a custom `beforeQuery` hook via Prisma driver adapters when they stabilize. For v1, the transaction approach is correct and acceptable. Profile before optimizing.

**Warning signs:** If query counts in PgAdmin double unexpectedly — this is the extension working as designed.

---

### Pitfall 2: `packages/types` Not Built Before Apps Dev Start

**What goes wrong:** `turbo run dev` starts both apps simultaneously. If `packages/types` hasn't been compiled to `dist/`, the TypeScript import `from '@bite-byte/types'` in `apps/api` fails at startup.

**Why it happens:** Turborepo's persistent dev tasks cannot depend on other dev tasks. The solution is `dependsOn: ["^build"]` in the dev task config — this runs build tasks for all workspace dependencies before starting dev servers.

**How to avoid:** Configure `turbo.json` with `"dev": { "dependsOn": ["^build"], "persistent": true, "cache": false }`. The `packages/types/package.json` must have a `"build"` script (`tsc -p tsconfig.json`). Run `pnpm build` once before the first `pnpm dev`.

**Warning signs:** TypeScript errors on import from `@bite-byte/types` at dev server startup.

---

### Pitfall 3: Prisma Client Not Regenerated After Schema Change

**What goes wrong:** Developer edits `schema.prisma`, runs `prisma migrate dev`, but forgets `prisma generate`. The TypeScript client still reflects the old schema. The new column compiles as `undefined`. Runtime errors when trying to access the new field.

**Why it happens:** `prisma migrate dev` does NOT automatically regenerate the client in all contexts. In Turborepo with pnpm, the client is in `node_modules/@prisma/client` inside `apps/api/node_modules`.

**How to avoid:** Add a `postmigrate` script or always chain: `prisma migrate dev --name X && prisma generate`. Better: add `"generate": "prisma generate"` to `apps/api/package.json` and call it in the Turborepo `build` pipeline.

**Warning signs:** TypeScript shows correct types in IDE but runtime throws `undefined` on a field that exists in the schema.

---

### Pitfall 4: RLS With No `FORCE ROW LEVEL SECURITY`

**What goes wrong:** RLS is enabled but the table owner (the Prisma DB user) bypasses it automatically. All RLS policies are silently skipped. Cross-tenant access tests pass because the test user IS the table owner.

**Why it happens:** PostgreSQL's default behavior exempts table owners from RLS. `ENABLE ROW LEVEL SECURITY` alone is not enough.

**How to avoid:** Always pair with `FORCE ROW LEVEL SECURITY`:
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
```

**Warning signs:** Cross-tenant access test passes when it should fail. If you skip `FORCE`, RLS appears to work in testing (using a superuser) but the application user (table owner) bypasses it silently.

---

### Pitfall 5: Interactive Transactions in Prisma `$extends` Callback

**What goes wrong:** Using `prisma.$transaction(async (tx) => { ... })` (interactive/callback-style transaction) inside the `$allOperations` extension causes blocking queries. This is a known Prisma bug ([#23583](https://github.com/prisma/prisma/issues/23583)).

**Why it happens:** Interactive transactions hold a connection from the pool until the callback resolves. Inside `$extends`, this can deadlock if another query is needed within the same transaction.

**How to avoid:** Use array-style (sequential) transactions only: `$transaction([operation1, operation2])`. Never use callback-style transactions inside the tenant extension.

**Warning signs:** Queries hang indefinitely under load; PostgreSQL shows idle-in-transaction connections.

---

### Pitfall 6: `metadata` and `selectedModifiers` Typed as `any` / `unknown`

**What goes wrong:** Prisma's `Json` type returns `Prisma.JsonValue` which is `string | number | boolean | null | JsonObject | JsonArray`. Accessing nested properties requires casting, and TypeScript provides no inference.

**Why it happens:** Prisma doesn't know the shape of JSONB columns at compile time.

**How to avoid:** For v1, these columns are always `{}` and `[]` so this is cosmetic. For v2, use `prisma-json-types-generator` to add typed declarations. In the interim, define Zod schemas in `packages/types` for parsing:
```typescript
// packages/types/src/menu.types.ts
export const MenuItemMetadataSchema = z.object({}).passthrough(); // v1: empty, extensible
export const OrderItemModifiersSchema = z.array(z.unknown()); // v1: empty array
```

---

## Code Examples

Verified patterns from official sources:

### pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml (root)
packages:
  - 'apps/*'
  - 'packages/*'
```

### packages/tsconfig/base.json

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "incremental": false,
    "isolatedModules": true,
    "lib": ["es2022"],
    "module": "CommonJS",
    "moduleResolution": "node",
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2022"
  }
}
```

### packages/types/package.json

```json
{
  "name": "@bite-byte/types",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsc -p tsconfig.json --watch"
  },
  "dependencies": {
    "zod": "^3.0.0"
  }
}
```

### apps/api — NestJS main.ts with rawBody

```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true required for Stripe webhook signature verification
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
```

### Cross-Tenant Test (Success Criterion Verification)

```typescript
// apps/api/src/prisma/__tests__/tenant-isolation.spec.ts
// Verifies that Venue A cannot access Venue B's data
// This is the critical test for success criterion 2

describe('Tenant isolation', () => {
  it('query in context of Venue A cannot return Venue B rows', async () => {
    // Set CLS context to venueA
    clsService.set('VENUE_ID', venueA.id);
    const orders = await tenantPrisma.order.findMany();
    // Must return ONLY Venue A orders
    expect(orders.every((o) => o.venueId === venueA.id)).toBe(true);
    expect(orders.some((o) => o.venueId === venueB.id)).toBe(false);
  });
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prisma Middleware (`$use`) | Prisma `$extends` query extensions | Prisma 4.16+ (stable in v5) | `$use` is deprecated; `$extends` is the supported API for query interception |
| Jest for NestJS testing | Vitest + unplugin-swc + @swc/core | 2024 onwards | Jest in Turborepo doesn't cache well; Vitest is 3-10x faster |
| `cls-hooked` / `continuation-local-storage` npm | `nestjs-cls` (uses Node AsyncLocalStorage) | Node 12+ / 2022 | Native AsyncLocalStorage requires no monkey-patching; safe with async/await |
| Prisma with Rust binary engine | Prisma 7 Rust-free engine | Prisma 7.0 (Nov 2025) | 90% smaller bundle, 3x faster cold start — default for new projects |
| `tailwindcss-animate` | `tw-animate-css` | Tailwind CSS v4 release | `tailwindcss-animate` not compatible with Tailwind v4 |

**Deprecated/outdated:**
- `prisma.$use()` middleware: Replaced by `$extends`. Do not use `$use` — it's deprecated in Prisma 5+ and absent from Prisma 7 docs.
- `cls-hooked`: Uses deprecated `async_hooks` monkey-patching. `nestjs-cls` uses Node's stable `AsyncLocalStorage` API instead.

---

## Open Questions

1. **nestjs-cls version for NestJS 11**
   - What we know: nestjs-cls v5+ supports NestJS 11 (per search results). Current latest is v6.2.0.
   - What's unclear: Whether v6 has breaking changes from v5 that affect the `ClsModule.forRoot` API.
   - Recommendation: Install `nestjs-cls@latest`, check CHANGELOG on install. The documented API (`ClsModule.forRoot({ global: true, middleware: { mount: true } })`) is stable across v5-v6.

2. **Prisma `$transaction` overhead vs. `set_config` approach**
   - What we know: Each query wraps in a 2-operation transaction `[set_config, query]`. This is the established safe pattern for RLS under connection pooling.
   - What's unclear: Whether Prisma 7's Rust-free engine changes the performance profile of `$transaction` calls vs. Prisma 5/6.
   - Recommendation: Use the transaction approach for correctness. Profile in Phase 2 if query counts in dev tools look unexpectedly high.

3. **Turborepo `dependsOn: ["^build"]` with `packages/types` watch mode**
   - What we know: `pnpm dev` triggers `turbo run dev` which runs `packages/types#build` first (from `^build` dep), then starts both dev servers.
   - What's unclear: Whether the `packages/types` TypeScript watch mode (`tsc --watch`) should be a separate persistent task or whether the initial build is sufficient for dev.
   - Recommendation: For Phase 1, one-time build before dev is sufficient. If type changes during development cause stale types, add `"dev": "tsc --watch"` to `packages/types` and configure it as a persistent task without `dependsOn`.

---

## Sources

### Primary (HIGH confidence)
- [Turborepo configuring-tasks docs](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks) — persistent task setup, dependsOn patterns
- [Prisma Client extensions: query](https://www.prisma.io/docs/orm/prisma-client/client-extensions/query) — `$allModels.$allOperations` pattern, args.where modification
- [NestJS CLS Quick Start](https://papooch.github.io/nestjs-cls/introduction/quick-start) — ClsModule.forRoot, ClsService.set/get
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) — FORCE ROW LEVEL SECURITY syntax
- [Prisma NestJS integration guide](https://www.prisma.io/docs/guides/nestjs) — PrismaService pattern

### Secondary (MEDIUM confidence)
- [NestJS + Prisma + PostgreSQL RLS multi-tenancy (DEV Community)](https://dev.to/moofoo/nestjspostgresprisma-multi-tenancy-using-nestjs-prisma-nestjs-cls-and-prisma-client-extensions-ok7) — $allOperations + set_config in transaction pattern
- [AWS multi-tenant data isolation with PostgreSQL RLS](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/) — set_config TRUE (transaction-local) vs FALSE (session)
- [Prisma interactive transactions blocking bug #23583](https://github.com/prisma/prisma/issues/23583) — avoid callback-style transactions in $extends

### Tertiary (LOW confidence)
- Various DEV Community / Medium articles on NestJS + Prisma monorepo structure — corroborate architectural patterns but not individually authoritative

---

## Metadata

**Confidence breakdown:**
- Monorepo/Turborepo setup: HIGH — official Turborepo docs consulted directly
- Prisma schema design: HIGH — Prisma docs + schema patterns well-established
- nestjs-cls tenant middleware: HIGH — official nestjs-cls docs + cross-referenced with DEV post
- PostgreSQL RLS setup: MEDIUM-HIGH — PostgreSQL official docs + AWS blog (FORCE RLS confirmed by official docs)
- Prisma $extends $allOperations: HIGH — official Prisma docs + verified in DEV post

**Research date:** 2026-03-02
**Valid until:** 2026-06-01 (Prisma 7, nestjs-cls 6, Turborepo 2 are all stable; unlikely to have breaking changes in 90 days)
