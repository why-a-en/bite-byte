# Project Research Summary

**Project:** Bite Byte — Multi-venue QR food ordering platform
**Domain:** Multi-tenant SaaS, mobile web, real-time order management
**Researched:** 2026-03-02
**Confidence:** MEDIUM-HIGH

## Executive Summary

Bite Byte is a multi-tenant QR code food ordering platform targeting food trucks and small venues — a genuinely underserved segment that existing tools (Toast, Sunday) handle poorly because they are designed around fixed-table dine-in. The product's core value is frictionless ordering: scan a QR code, browse a menu, pay, and track status — all in under 60 seconds, no app download, no forced account creation. Research confirms this is a well-understood product category with clear industry standards, which means the table stakes are well-defined and the pitfalls are well-documented.

The recommended approach is a Turborepo monorepo with Next.js 16 on Vercel for the customer and dashboard UI, NestJS 11 on Railway for the API and WebSocket gateway, and PostgreSQL 16 via Prisma 7 for data. The key architectural decision is a shared-schema multi-tenant design where every tenant-scoped table carries a `venueId` column, filtered automatically via a Prisma query extension — with PostgreSQL RLS as a security backstop. Real-time order push uses Socket.IO rooms (one room per venue, one per order), and all WebSocket code lives exclusively in NestJS — not in Next.js API routes, which is a Vercel constraint with silent production failures if violated.

The highest-risk areas are payment integrity and tenant isolation: both have "never" on the acceptable-shortcuts list. Payment flow must be webhook-driven (Stripe `payment_intent.succeeded`) not redirect-driven; order items must snapshot price at order time not reference current price; tenant data queries must be filtered at the infrastructure layer, not scattered through business logic. These are not recoverable after the fact — they must be correct from the first implementation. The remaining pitfalls (WebSocket reconnection, iOS Safari viewport, schema extensibility for future modifiers) are addressable in their respective phases.

---

## Key Findings

### Recommended Stack

The stack is a modern TypeScript-everywhere monorepo. The significant wins come from the shared `@bite-byte/types` package: Zod schemas defined once in `packages/types` are consumed by both NestJS (via `nestjs-zod` for DTOs and OpenAPI) and Next.js (direct Zod parse), eliminating the duplicate-schema problem that plagues split frontend/backend codebases. Prisma 7's Rust-free engine (released November 2025) resolves the prior bundle-size and deployment performance complaints that made some teams prefer Drizzle — Prisma's schema-first DX is the right choice for a solo developer who benefits from Prisma Studio and auto-generated migrations.

See `.planning/research/STACK.md` for full library selections, version compatibility matrix, and installation commands.

**Core technologies:**
- **Turborepo + pnpm**: Monorepo build system with workspace caching; required for `packages/types` shared schema pattern
- **Next.js 16**: Customer-facing menu and venue dashboard UI; App Router, React Server Components, deployed to Vercel
- **NestJS 11**: REST API + WebSocket gateway; modular, decorator-based, deployed to Railway
- **PostgreSQL 16 + Prisma 7**: Primary relational database; Prisma 7 is Rust-free (90% smaller bundle); schema-first migrations
- **Socket.IO (via @nestjs/platform-socket.io)**: Real-time order push; rooms per venue and per order; automatic reconnection
- **Stripe SDK v20**: Payment processing via PaymentIntents API; webhooks are the only authoritative payment confirmation signal
- **Zod + nestjs-zod**: Shared validation schemas; single definition, consumed in both apps
- **Zustand + TanStack Query**: Client-side state (cart, UI) + server state (menus, orders) in Next.js
- **shadcn/ui + Tailwind CSS v4**: Component library (owned code, not an npm dep) + utility-first CSS; mobile-first ordering UI
- **Vitest + Playwright**: Test runner (Vitest with SWC for NestJS decorators) + E2E browser testing

**Do not use:** TypeORM (poor TypeScript inference, N+1 prone, being abandoned), `class-validator` (unmaintained, breaks monorepo type-sharing), raw `ws` (no rooms/broadcast/reconnect), Auth.js (Next.js-only, doesn't compose with NestJS), `tailwindcss-animate` (deprecated in Tailwind v4, replace with `tw-animate-css`).

---

### Expected Features

The MVP is larger than a typical v1 because the product requires both a customer-facing ordering flow AND a venue owner dashboard to be usable at all — neither side works without the other. All 14 P1 features are required for launch.

See `.planning/research/FEATURES.md` for full prioritization matrix, competitor analysis, and anti-feature analysis.

**Must have (table stakes — P1, all required for launch):**
- QR scan to venue menu (no app, no account) — industry standard since 2020; friction here kills the product
- Browse menu by category with item photos and descriptions
- Cart building with quantity adjustment (persist in localStorage)
- Guest checkout — forced account creation is the #1 abandonment cause; must be the default path
- Stripe payment (card + Apple Pay / Google Pay) for prepay venues
- Pay-at-counter option, configurable per venue
- Order confirmation page with order reference
- Real-time order status tracking (Pending → Preparing → Ready) via WebSocket push
- Venue owner: incoming orders dashboard with WebSocket push and alert on new order
- Venue owner: order status management (transitions propagate to customer)
- Venue owner: menu management (add/edit/delete items, categories, toggle availability)
- Venue owner: QR code generation and download (PNG/SVG)
- Venue owner: venue settings (name, logo, payment mode)
- Multi-venue tenant isolation — first-class from day 1, not a retrofit

**Should have (competitive differentiators — add after core is working):**
- Customer account creation and saved order history — add when repeat customer behavior is observed
- Basic sales analytics (revenue today, top items, order volume) — add once venues are active and asking for data
- Special instructions free-text field on cart — pressure valve when modifier requests come in
- Item photo optimization / CDN pipeline

**Defer (v2+):**
- Menu item modifiers / customization — explodes UI/UX complexity; use free-text special instructions as stopgap
- Table-specific QR codes — not needed for food trucks; defer until full-service dine-in is a growth segment
- Loyalty / rewards program — requires customer accounts and product-market fit first
- SMS order notifications — costs money per message; in-venue customers can watch the screen
- Multi-language support — English-only v1; design for i18n readiness (next-intl) but do not implement
- POS integrations — enterprise tier only; fragile, vendor-specific, certification overhead

**Anti-features to avoid building:**
- AI upselling (premature without purchase history data)
- AR menu visualization (technically immature, venues lack 3D assets)
- Dynamic pricing / happy hour automation (timezone edge cases, customer trust issues)
- Delivery / logistics (different operational model entirely)

---

### Architecture Approach

The system uses a three-tier architecture: Next.js (Vercel) handles both the customer ordering flow and the venue dashboard UI; NestJS (Railway) owns all business logic, authentication, payment orchestration, and WebSocket connections; PostgreSQL holds all persistent state. Tenant isolation uses shared-schema multi-tenancy — every tenant-scoped table has a `venueId` FK, a Prisma query extension auto-filters all queries by venueId (set in NestJS CLS per request), and PostgreSQL RLS provides a database-level backstop. WebSocket rooms are scoped per venue and per order within a single `/orders` Socket.IO namespace — not per-namespace-per-venue, which has limited NestJS support.

See `.planning/research/ARCHITECTURE.md` for full system diagram, project structure, code examples for all key patterns, and data flow diagrams.

**Major components:**
1. **Customer App** (`apps/web/(customer)/[venueSlug]`) — Public, no auth; menu browse → cart → order → status tracking
2. **Venue Dashboard** (`apps/web/(dashboard)/`) — JWT-protected; live order queue, menu management, analytics
3. **Auth Module** — JWT + Passport; venue owner register/login; HTTP-only cookie refresh tokens
4. **Venue/Menu Module** — CRUD for venues, categories, items; image upload; QR code generation
5. **Order Module** — State machine (PENDING_PAYMENT → RECEIVED → PREPARING → READY → COMPLETED); emits WebSocket events on transitions
6. **Payments Module** — Stripe PaymentIntent creation (server-side only); webhook handler with idempotency table
7. **WebSocket Gateway** — Socket.IO; rooms `venue:{venueId}` for dashboard, `order:{orderId}` for customer tracking
8. **Tenant Middleware + Prisma Extension** — Cross-cutting; auto-scopes all queries to current tenant
9. **`packages/types`** — Shared Zod schemas and TypeScript types; single source of truth for API contracts

**Architecture build order (from ARCHITECTURE.md):**
Monorepo scaffolding → Database schema → Auth module → Tenant middleware → Venue/Menu modules → Customer menu page → Order module (pay-at-counter first) → WebSocket gateway → Venue dashboard → Payments module → QR code generation → Analytics

---

### Critical Pitfalls

All 7 critical pitfalls from research — organized by severity and phase relevance:

1. **Payment state driven by client, not webhook** — Create orders in `PENDING_PAYMENT`; only the `payment_intent.succeeded` webhook transitions to `RECEIVED`. Never trust the redirect URL. No exceptions.

2. **Non-idempotent webhook handler** — Store every processed `stripe_event_id` with a unique DB constraint. Return 200 immediately after signature verification; process asynchronously. Stripe retries for 72 hours — duplicate processing is a real production scenario.

3. **Multi-tenant data leak via missing tenant scoping** — Set up PostgreSQL RLS with `FORCE ROW LEVEL SECURITY` before writing any business logic. The Prisma query extension is the application layer; RLS is the backstop. Use `SET LOCAL` (not `SET`) for session variables when PgBouncer is in play.

4. **Order items store reference price, not snapshot price** — `order_items` must have `unit_price_at_order` (decimal) and `item_name_at_order` (text) — both populated at order creation time. Financial records must be immutable snapshots. Retrofit after orders exist is painful.

5. **WebSocket state lost on reconnection** — Kitchen display must re-fetch current order state via REST on every reconnect before trusting the live WebSocket feed. The pattern is: REST is source of truth, WebSocket is update accelerator.

6. **Vercel + WebSockets architectural mismatch** — All Socket.IO code lives exclusively in NestJS (Railway). No WebSocket code in `apps/web/api/` routes. Works locally (Next.js dev server supports it), silently fails on Vercel.

7. **Menu schema too rigid for future modifiers** — Add a JSONB `metadata` column to `menu_items` and a JSONB `selected_modifiers` column (empty array v1) to `order_items` in the initial schema. Zero implementation cost now, avoids a breaking migration later.

---

## Implications for Roadmap

Based on combined research, the feature dependency graph and architectural build order point to 6 phases. The constraint is that the product is a two-sided platform: neither the customer flow nor the venue dashboard is independently shippable without the other side existing.

### Phase 1: Foundation
**Rationale:** Everything depends on this. Monorepo structure, database schema, shared types package, and multi-tenant infrastructure must be correct from day 1. Pitfalls 3 (tenant isolation), 4 (price snapshot), and 7 (schema extensibility) are all schema-level and cannot be cheaply retrofitted.
**Delivers:** Turborepo workspace with pnpm, `packages/types` with initial Zod schemas, Prisma schema covering `Venue`, `MenuCategory`, `MenuItem`, `Order`, `OrderItem`, `User`, PostgreSQL RLS policies, tenant middleware + Prisma query extension, NestJS/Next.js app scaffolding wired together.
**Addresses:** Multi-venue tenant isolation (P1 feature), schema correctness for order items (Pitfall 4), modifier-ready schema (Pitfall 7), RLS backstop for tenant isolation (Pitfall 3).
**Research flag:** Standard patterns — well-documented Turborepo + NestJS + Prisma setup. Skip research-phase.

### Phase 2: Auth and Venue/Menu Management
**Rationale:** Venue owners must exist and have menus before customers can order. Auth module gates all owner-facing APIs. Menu CRUD is the prerequisite for the customer ordering flow.
**Delivers:** Venue owner registration and login (JWT + refresh token in HTTP-only cookie), venue settings (name, logo, payment mode, slug), menu category and item CRUD, item availability toggle (86'ing), image upload for item photos.
**Addresses:** Venue settings (P1), menu management (P1), item availability toggle (P1). Avoids Auth.js anti-pattern (use Passport + JWT in NestJS only).
**Research flag:** Standard patterns — NestJS Passport + JWT is well-documented. Skip research-phase.

### Phase 3: Customer Ordering Flow (Pay-at-Counter)
**Rationale:** Ship the ordering loop without payments first to validate the core product. Pay-at-counter orders require no Stripe integration, so this phase delivers a working end-to-end flow faster. Architecture.md explicitly recommends this ordering.
**Delivers:** Customer-facing `[venueSlug]` menu page (SSR/ISR, public, mobile-first), category navigation with item photos, cart (local state + localStorage persistence), guest checkout flow, order creation API (pay-at-counter path), order confirmation page with order reference, order status page.
**Addresses:** QR scan to menu (P1), browse by category (P1), cart + guest checkout (P1), pay-at-counter option (P1), order confirmation (P1). Avoids forced account creation anti-pattern.
**Research flag:** Standard patterns for Next.js App Router dynamic routes and cart state. Skip research-phase.

### Phase 4: Real-Time Order Management
**Rationale:** The venue dashboard and real-time status updates are the two-sided platform's operational core. WebSocket infrastructure must be built before the dashboard is useful. This phase completes the MVP loop: customer orders → venue sees order → venue updates status → customer sees update.
**Delivers:** WebSocket gateway with Socket.IO (rooms per venue and per order), venue owner incoming orders dashboard with WebSocket push and sound/visual alert on new order, order status management (RECEIVED → PREPARING → READY → COMPLETED transitions), real-time status propagation to customer order tracking page, QR code generation and download (PNG/SVG via `qrcode` library).
**Addresses:** Venue incoming orders dashboard (P1), order status management (P1), real-time order status for customer (P1), QR code generation (P1). Must address Pitfall 5 (WebSocket state lost on reconnect) and Pitfall 6 (Vercel WebSocket mismatch) from first implementation.
**Research flag:** Needs attention during planning. Reconnect+REST-fallback hybrid pattern requires careful implementation. WebSocket room strategy must be confirmed correct before building.

### Phase 5: Stripe Payment Integration
**Rationale:** Payment integration is a discrete, high-risk phase with specific patterns that must be followed exactly. Isolating it reduces the blast radius of getting it wrong. The pay-at-counter path from Phase 3 means there's a working product while payments are being built and tested.
**Delivers:** Stripe PaymentIntent creation (NestJS PaymentsModule only, never frontend), Stripe Elements payment UI in Next.js, `payment_intent.succeeded` webhook handler with idempotency table, `PENDING_PAYMENT` → `RECEIVED` transition via webhook only, Apple Pay / Google Pay via Stripe Payment Request API.
**Addresses:** Stripe payment (P1). Must address Pitfall 1 (client-side payment state) and Pitfall 2 (non-idempotent webhook) from day 1 of this phase. Requires thorough webhook testing including retry simulation.
**Research flag:** Needs attention during planning. Stripe PaymentIntent + NestJS webhook handling has specific requirements (rawBody, signature verification, idempotency). Plan implementation carefully against Stripe official docs before coding.

### Phase 6: Analytics and Customer Accounts
**Rationale:** These features add value but are not required for the core ordering loop. Add after validating the two-sided platform with real venues.
**Delivers:** Basic sales analytics (revenue today/week, top-selling items, order volume over time — aggregate queries on orders table), customer account creation (optional, post-order "save your details?"), saved order history, reorder in one tap.
**Addresses:** Basic sales analytics (P2), customer account / reorder (P2). Enables future loyalty program (v2+) by establishing the account model.
**Research flag:** Standard patterns for aggregate PostgreSQL queries and optional auth flows. Skip research-phase.

---

### Phase Ordering Rationale

- **Foundation must be first** because the Prisma schema, tenant middleware, and RLS policies are load-bearing infrastructure that every subsequent phase builds on. Retrofitting tenant isolation or price snapshots after orders exist in production is a high-cost, high-risk operation.
- **Auth before menu before customer flow** because the feature dependency graph is linear: venue owner must exist to create a venue, venue must exist to have a menu, menu must exist before customers can browse.
- **Pay-at-counter before Stripe** because it validates the entire ordering state machine without payment complexity. A working order flow with a deferred payment step is shippable and validates the core UX.
- **WebSocket in Phase 4 (not later)** because the venue dashboard is not operationally useful without real-time order push. Grouping WebSocket gateway + venue dashboard + QR code generation in one phase delivers a complete, usable two-sided platform.
- **Stripe isolated in Phase 5** because payment integration has specific, non-negotiable implementation patterns. Isolating it reduces risk and allows thorough testing. The product is already working (pay-at-counter) when this phase begins.
- **Analytics and accounts last** because they require order data to exist and are validated by real venue behavior, not assumptions.

---

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 4 (Real-Time Order Management):** WebSocket reconnect+REST-fallback hybrid pattern requires a specific implementation sequence. The reconnect handler must fetch current state before re-subscribing to live events. Confirm Socket.IO room join strategy and reconnection hook placement before implementation.
- **Phase 5 (Stripe Payment Integration):** Stripe PaymentIntent lifecycle + NestJS webhook handler has specific technical requirements: `rawBody: true` in NestJS bootstrap, `constructEvent()` signature verification, idempotency table schema, async processing pattern. Plan this phase against Stripe official docs before writing code.

**Phases with standard, well-documented patterns (skip research-phase):**
- **Phase 1 (Foundation):** Turborepo + NestJS + Prisma monorepo setup is extensively documented. Follow ARCHITECTURE.md project structure directly.
- **Phase 2 (Auth and Venue/Menu):** NestJS Passport + JWT is the official NestJS pattern. Follow STACK.md library selections directly.
- **Phase 3 (Customer Ordering Flow):** Next.js App Router dynamic routes, localStorage cart, SSR menu pages are standard patterns.
- **Phase 6 (Analytics and Accounts):** PostgreSQL aggregate queries and optional auth flows are standard.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core stack is pre-decided; library selections verified against official docs, npm, and multiple independent sources; version compatibility matrix is explicit |
| Features | MEDIUM | Competitor feature sets cross-confirmed across multiple sources; industry research from multiple operators; some sources are vendor-produced (lower weight given) |
| Architecture | MEDIUM-HIGH | Core patterns (tenant middleware, state machine, Stripe webhook flow) confirmed via official docs and production post-mortems; code examples in ARCHITECTURE.md are realistic and consistent with NestJS docs |
| Pitfalls | HIGH | Payment and tenant pitfalls verified against official Stripe docs, AWS RDS blog, and Wolt engineering post-mortem; highly consistent across sources |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **nestjs-zod 4.x compatibility:** MEDIUM confidence on this library specifically. Verify `nestjs-zod` 4.x peer dependency compatibility with NestJS 11.x and Zod 3.x before building shared types package. If incompatible, fall back to class-validator with manual Zod schemas in Next.js (less ideal but functional).
- **Vitest + NestJS decorators:** The SWC requirement for NestJS decorator metadata with Vitest is documented in a blog post, not official docs. Confirm `unplugin-swc` + `@swc/core` wiring works correctly in the Turborepo workspace before committing to the testing setup.
- **Image upload / CDN:** Image upload for menu item photos is listed as P1 (menu management requires it) but the CDN pipeline is P2. The gap: where do images go in v1? Options are Railway volume (simple, not CDN), Cloudflare R2 (S3-compatible, free tier), or Vercel Blob. Resolve during Phase 2 planning.
- **Connection pooling timing:** Pitfalls research flags PgBouncer as needed before production under load. Railway's managed Postgres includes connection pooling options. Confirm Railway's pooling configuration before Phase 5 (when real payment load begins).
- **Stripe test key separation:** Confirm `.env` structure for separate test and live Stripe keys across Railway environments before Phase 5. Key prefix validation (`sk_test_` vs `sk_live_`) at NestJS startup is recommended.

---

## Sources

### Primary (HIGH confidence)
- [Prisma 7.0.0 release announcement](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0) — Rust-free engine, bundle size improvements
- [Prisma NestJS integration guide](https://www.prisma.io/docs/guides/nestjs) — PrismaService pattern
- [NestJS WebSocket Gateways docs](https://docs.nestjs.com/websockets/gateways) — Socket.IO adapter, Gateway pattern
- [Next.js 16 installation docs](https://nextjs.org/docs/app/getting-started/installation) — App Router, Turbopack, React 19
- [Stripe Webhooks official docs](https://docs.stripe.com/webhooks) — Webhook handling, idempotency requirements
- [Stripe PaymentIntents lifecycle](https://docs.stripe.com/payments/paymentintents/lifecycle) — Payment state machine
- [Stripe: Nobody Likes Being Charged Twice](https://stripe.dev/blog/because-nobody-likes-being-charged-twice) — Idempotency patterns
- [Multi-Tenant Data Isolation with PostgreSQL RLS (AWS)](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/) — RLS architecture
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — tw-animate-css migration
- [Railway NestJS deployment guide](https://docs.railway.com/guides/nest) — Railway deployment patterns
- [Vercel Serverless Functions and WebSockets](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections) — WebSocket constraint confirmed
- [TanStack Query + Next.js App Router](https://tanstack.com/query/latest/docs/framework/react/guides/ssr) — SSR hydration patterns
- [Wolt Engineering: From Polling to WebSockets](https://careers.wolt.com/en/blog/engineering/from-polling-to-websockets-improving-order-tracking-user-experience) — Production food delivery post-mortem
- [Railway Database Connection Pooling](https://blog.railway.com/p/database-connection-pooling) — PgBouncer configuration

### Secondary (MEDIUM confidence)
- [NestJS 11 release (Trilon)](https://trilon.io/blog/announcing-nestjs-11-whats-new) — NestJS 11 features
- [NestJS multi-tenant Prisma extension (DEV Community)](https://dev.to/murilogervasio/how-to-make-multi-tenant-applications-with-nestjs-and-a-prisma-proxy-to-automatically-filter-tenant-queries--4kl2) — Tenant middleware pattern
- [Stripe PaymentIntent with NestJS webhooks (DEV Community)](https://dev.to/imzihad21/integrating-stripe-payment-intent-in-nestjs-with-webhook-handling-1n65) — Webhook handler pattern
- [Vitest + NestJS SWC pattern (ablo.ai)](https://blog.ablo.ai/jest-to-vitest-in-nestjs) — SWC decorator metadata requirement
- [MenuTiger features page](https://www.menutiger.com/features) — Competitor feature set
- [Toast QR Code Menu Insights](https://pos.toasttab.com/blog/on-the-line/qr-code-menu-insights) — Consumer behavior research
- [Sunday: QR Code Ordering trends](https://sundayapp.com/qr-code-ordering-from-trend-to-standard-in-2025/) — Industry adoption data
- [NestJS WebSockets at Scale (Medium)](https://medium.com/@hadiyolworld007/nestjs-websockets-at-scale-real-time-without-the-chaos-01547e01f124) — WebSocket scaling patterns

### Tertiary (LOW confidence)
- [QR Code Menu Ordering Trends (Orders.co)](https://orders.co/blog/the-future-of-qr-menus-emerging-trends-to-watch/) — Market trend claims; single source
- [Restaurant Management Software (MenuTiger blog)](https://www.menutiger.com/blog/restaurant-management-software) — Vendor-produced content

---
*Research completed: 2026-03-02*
*Ready for roadmap: yes*
