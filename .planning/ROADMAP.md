# Roadmap: Bite Byte

## Overview

Four phases that build the two-sided QR ordering platform from the ground up. Phase 1 lays load-bearing infrastructure that cannot be safely retrofitted. Phase 2 gives venue owners the tools to configure venues and manage menus. Phase 3 delivers the customer ordering loop end-to-end (including Stripe prepay). Phase 4 closes the loop with real-time WebSocket operations, the live venue dashboard, and basic analytics. After Phase 4, a venue owner can sign up, build a menu, print a QR code, take orders in real-time, manage their queue, and view sales data.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Monorepo scaffolding, database schema, and multi-tenant infrastructure (completed 2026-03-02)
- [ ] **Phase 2: Auth and Venue Setup** - Venue owner accounts, venue configuration, and full menu management
- [ ] **Phase 3: Customer Ordering** - Public menu browsing, cart, guest checkout, Stripe payment, and order tracking
- [ ] **Phase 4: Real-Time Operations and Analytics** - WebSocket gateway, live venue dashboard, order management, and sales analytics

## Phase Details

### Phase 1: Foundation
**Goal**: The project compiles, the database schema is correct and modifier-ready, and every tenant-scoped query is isolated by default
**Depends on**: Nothing (first phase)
**Requirements**: INFR-01, INFR-02, INFR-03
**Success Criteria** (what must be TRUE):
  1. Running `pnpm dev` from the monorepo root starts the Next.js app and NestJS API simultaneously with hot reload
  2. A database query made in the context of Venue A cannot return rows belonging to Venue B — enforced at both the Prisma extension layer and PostgreSQL RLS layer
  3. The `order_items` table stores `unit_price_at_order` and `item_name_at_order` as immutable columns, not foreign key references to the live menu
  4. The `menu_items` table has a JSONB `metadata` column and `order_items` has a JSONB `selected_modifiers` column (empty array for v1), ready for future modifier support without a schema migration
  5. The `payments` idempotency table exists (for webhook deduplication) and is referenced in Stripe webhook handler stub
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — Turborepo monorepo scaffold: root config, shared tsconfig, shared types package, Next.js + NestJS app skeletons, Docker Compose
- [ ] 01-02-PLAN.md — Prisma schema + initial migration: complete entity schema with JSONB hooks and price snapshot columns, Docker PostgreSQL migration
- [ ] 01-03-PLAN.md — Multi-tenant isolation: PrismaModule, ClsModule, Prisma $extends tenant extension, TenantMiddleware, PostgreSQL RLS policies
- [ ] 01-04-PLAN.md — Stripe webhook stub + tenant isolation test: idempotency-guarded webhook handler, Vitest setup, cross-tenant isolation integration test

### Phase 2: Auth and Venue Setup
**Goal**: A venue owner can create an account, log in, configure one or more venues with payment preferences, and build a complete menu with photos
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, VNUE-01, VNUE-02, VNUE-03, VNUE-04, MENU-01, MENU-02, MENU-03, MENU-04, MENU-05, MENU-06
**Success Criteria** (what must be TRUE):
  1. Venue owner can register with email and password, log in, stay logged in across browser refresh, and log out from any dashboard page
  2. Venue owner can create a venue with name, logo, and a URL slug that routes to that venue's public menu page
  3. Venue owner can configure payment mode (prepay required / pay at counter / both) and the ordering flow for that venue respects the setting
  4. Venue owner can generate and download a QR code (PNG) that links to their venue's public menu URL
  5. Venue owner can create, edit, reorder (drag-and-drop), and delete menu categories, and create menu items with name, description, price, and an uploaded photo; can toggle any item as unavailable without deleting it
**Plans**: 5 plans

Plans:
- [ ] 02-01-PLAN.md — User model migration + NestJS AuthModule (register, login, JWT strategies, guards)
- [ ] 02-02-PLAN.md — Venue/Category/Item CRUD API modules with owner-scoped queries and JwtAuthGuard
- [ ] 02-03-PLAN.md — shadcn/ui + Tailwind v4 init, Next.js auth middleware, login/register pages with server actions
- [ ] 02-04-PLAN.md — Dashboard layout with sidebar, venue management UI, Vercel Blob logo upload, QR code generation
- [ ] 02-05-PLAN.md — Menu builder UI with drag-and-drop category reorder, item CRUD with photo upload, availability toggle

### Phase 3: Customer Ordering
**Goal**: A customer can scan a QR code, browse the menu, build a cart, place an order (paying online or at counter depending on the venue), and track their order status in real-time
**Depends on**: Phase 2
**Requirements**: ORDR-01, ORDR-02, ORDR-03, ORDR-04, ORDR-05, ORDR-06, ORDR-07, ORDR-08, ORDR-09, ORDR-10
**Success Criteria** (what must be TRUE):
  1. Customer scans the venue QR code on a mobile browser, sees that venue's menu organized by category with item photos, prices, and descriptions — no app download, no account required
  2. Customer can add items to a cart, adjust quantities, and the cart survives a full page refresh (localStorage persistence)
  3. For prepay venues, customer completes payment via Stripe (card, Apple Pay, or Google Pay) and the order transitions to RECEIVED only after the `payment_intent.succeeded` webhook fires — never via redirect
  4. For pay-at-counter venues, customer sees clear instructions and the order is created immediately in RECEIVED state
  5. Customer receives an order confirmation page with a unique reference number and can return to the order status page after closing the browser (order ID persisted in localStorage); status page updates in real-time (Pending → Preparing → Ready) as the venue acts on the order
**Plans**: TBD

### Phase 4: Real-Time Operations and Analytics
**Goal**: Venue owner has a live dashboard where incoming orders appear instantly with an audio alert, can update order status that propagates to the customer in real-time, can review order history, and can view basic sales analytics
**Depends on**: Phase 3
**Requirements**: MGMT-01, MGMT-02, MGMT-03, MGMT-04, MGMT-05, ANLY-01, ANLY-02, ANLY-03
**Success Criteria** (what must be TRUE):
  1. When a customer places an order, it appears on the venue's live dashboard within 1 second and triggers an audio alert — with no manual refresh required
  2. When the venue owner transitions an order through RECEIVED → PREPARING → READY → COMPLETED, the customer's order status page updates in real-time via WebSocket push
  3. If the venue dashboard loses its WebSocket connection and reconnects, it re-fetches current order state via REST before resuming the live feed — no orders are missed or displayed stale
  4. Venue owner can filter order history by date and see past orders with their items and status
  5. Venue owner can view revenue totals (today, this week, this month), top-selling items by order count, and an order volume chart — all based on completed orders for their venue only

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete    | 2026-03-02 |
| 2. Auth and Venue Setup | 3/5 | In Progress|  |
| 3. Customer Ordering | 0/? | Not started | - |
| 4. Real-Time Operations and Analytics | 0/? | Not started | - |
