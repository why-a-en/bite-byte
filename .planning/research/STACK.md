# Stack Research

**Domain:** Multi-venue QR food ordering platform (mobile web, real-time orders, multi-tenant SaaS)
**Researched:** 2026-03-02
**Confidence:** MEDIUM-HIGH (core stack confirmed via official docs; library versions confirmed via npm/search; some minor version pins based on latest stable as of research date)

---

## Core Stack (Pre-decided — No Re-evaluation)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Turborepo | ^2.x | Monorepo build system | Shared types package between Next.js and NestJS with caching; pnpm workspaces for fast installs |
| pnpm | ^9.x | Package manager | Required for Turborepo workspace setup; faster installs, strict dependency resolution |
| Next.js | ^16.x | Customer-facing web app + venue dashboard UI | App Router, React Server Components, Turbopack default — Vercel-native |
| NestJS | ^11.x | REST API + WebSocket gateway | Modular architecture, decorator-based, first-class WebSocket support via @nestjs/websockets |
| PostgreSQL | ^16.x | Primary database | Relational model fits venues/menus/orders perfectly; multi-tenant schema isolation |
| Stripe | SDK v20.x | Payment processing | Existing decision; use Payment Intents API (not deprecated Charges API) |
| Vercel | Latest | Next.js hosting | Vercel-native Next.js deployment; edge functions, CDN, preview deployments |
| Railway | Latest | NestJS + PostgreSQL hosting | Simple container + managed Postgres; official NestJS Railway guide confirms support |

---

## Recommended Stack — Library Selections

### ORM: Prisma 7.x

**Use Prisma over Drizzle and TypeORM.**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| prisma (CLI) | ^7.x | Schema definition, migrations | Schema-first, generates fully typed client; Prisma 7 is Rust-free (90% smaller bundle, 3x faster) |
| @prisma/client | ^7.x | Type-safe database queries in NestJS | Auto-generated client from schema; native PostgreSQL support |

**Rationale:** Prisma 7.0 (Nov 2025) became the default for new projects, with the Rust-free engine enabled by default — removing the prior performance and deployment complaints. For a solo developer on this project, Prisma's schema-first workflow and Prisma Studio are significant DX wins versus Drizzle's code-first approach. TypeORM is eliminated because it's the worst of both worlds: active-record patterns with poor TypeScript inference and known N+1 bugs.

**Do NOT use:** TypeORM (poor TypeScript inference, active-record anti-patterns, widely being abandoned in new projects in 2025).

**NestJS integration pattern:** Create a `PrismaService` extending `PrismaClient` that implements `OnModuleInit`/`OnModuleDestroy`. Share this service via a `PrismaModule` (globally exported). This is the Prisma-recommended pattern per official NestJS guide at prisma.io/docs/guides/nestjs.

---

### Validation: Zod + nestjs-zod (shared schemas)

**The key architectural win for a Turborepo monorepo: one schema, validated everywhere.**

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | ^3.x | Schema definition + type inference | Define in `@bite-byte/types` shared package |
| nestjs-zod | ^4.x | NestJS pipe integration for Zod schemas | Replace class-validator DTOs in NestJS; auto-generates OpenAPI schema |

**Rationale:** `class-validator` and `class-transformer` have not received updates in 2+ years (as of 2025) and require duplication — you write a class DTO in NestJS and a separate Zod schema in Next.js. With a Turborepo shared `packages/types` package, define Zod schemas once and import them in both apps. `nestjs-zod` generates NestJS-compatible DTOs from Zod schemas AND OpenAPI/Swagger docs from the same schema. This is the correct pattern for a monorepo.

**Do NOT use:** `class-validator` + `class-transformer` as the primary validation strategy (maintenance-dead, breaks monorepo type-sharing, requires duplication).

---

### Authentication: Passport.js + JWT (NestJS) + HTTP-only cookies

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @nestjs/passport | ^11.x | Passport integration module | NestJS guard wiring |
| passport | ^0.7.x | Core Passport middleware | Strategy registration |
| passport-jwt | ^4.x | JWT strategy | Venue owner access token validation |
| passport-local | ^1.x | Username/password strategy | Login endpoint |
| @nestjs/jwt | ^11.x | JWT sign/verify module | Token creation |
| jsonwebtoken | ^9.x | Underlying JWT library | Used internally by @nestjs/jwt |
| cookie-parser | ^1.x | Parse cookies in NestJS | Extract refresh tokens from HTTP-only cookies |

**Pattern:** Access token (15min, Bearer in Authorization header) + Refresh token (30 days, HTTP-only Secure SameSite=Strict cookie). This pattern is well-documented and community-validated for NestJS. Store hashed refresh tokens in PostgreSQL for revocation support.

**Guest ordering:** Customers do NOT require authentication to browse and place orders — only venue owners need accounts. Guest orders are scoped to the venue via a `venueId` from the QR code URL. Customer accounts are optional (for reorder history).

**Do NOT use:** NextAuth/Auth.js on the backend — it's a Next.js-native solution that doesn't compose with NestJS. Keep auth in NestJS only.

---

### WebSocket: Socket.io via @nestjs/platform-socket.io

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @nestjs/websockets | ^11.x | NestJS WebSocket gateway decorator system | Always — needed for Gateway pattern |
| @nestjs/platform-socket.io | ^11.x | Socket.io adapter for NestJS | Default adapter; handles reconnection, broadcasting, namespaces |
| socket.io-client | ^4.x | Client-side WebSocket connection in Next.js | Venue dashboard real-time updates |

**Rationale:** Socket.io is the correct choice over raw `ws` for this use case. Venue dashboards need broadcast semantics (order placed → all connected venue staff see it), automatic reconnection (kitchen display losing WiFi shouldn't lose orders), and room-scoped messaging (venue A's orders don't appear on venue B's dashboard). Socket.io handles all three natively. The `ws` library requires reimplementing these features.

**Room strategy:** Each venue owner connects to a room named `venue:{venueId}`. When an order is placed, NestJS emits `order:created` to that room. This is the standard multi-tenant WebSocket pattern.

**Do NOT use:** Raw `ws` (missing room/broadcast primitives, no reconnection, would require reinventing Socket.io features). Server-Sent Events (SSE) is one-directional — won't work for bidirectional status updates from dashboard back to customer order tracking.

---

### State Management (Next.js): Zustand + TanStack Query

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | ^5.x | Client-side UI state (cart, user session) | Cart items, UI toggles, local state that doesn't touch server |
| @tanstack/react-query | ^5.x | Server state management and caching | All API calls, order status polling, menu data |

**Rationale:** In Next.js 16 with App Router, server state (menus, orders) belongs in React Server Components or TanStack Query — not Zustand. Zustand handles purely client-side state: the shopping cart, whether a modal is open, the current order session. TanStack Query manages server state with caching, background refresh, and stale-while-revalidate semantics — critical for a live order tracking screen. This is the 2025/2026 consensus pattern; Redux is eliminated (overkill), Jotai is eliminated (atomic model adds complexity without benefit for this use case).

**Do NOT use:** Redux (excessive boilerplate for a focused application). Context API alone (no caching, no server state management).

---

### UI Components: shadcn/ui + Tailwind CSS v4

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwindcss | ^4.x | Utility-first CSS | All styling |
| shadcn/ui | Latest (CLI-based) | Accessible, composable UI components | All UI components — owned code, not a dep |
| lucide-react | ^0.4xx | Icon library (used by shadcn) | Icons throughout |
| tw-animate-css | ^1.x | Tailwind v4 animations (replaces tailwindcss-animate) | Animated UI elements |

**Rationale:** shadcn/ui is not installed as a package — it copies component source into your project, giving full ownership and zero "library upgrade" issues. With Tailwind CSS v4 (which Next.js 16 defaults to), this is the dominant 2025/2026 stack for Next.js projects. Components are built on Radix UI primitives (accessible by default). The customer-facing ordering screen and the venue dashboard both benefit from the same component set.

**Note:** Tailwind v4 replaces `tailwindcss-animate` with `tw-animate-css`. Shadcn/ui officially documents this migration.

**Do NOT use:** Material UI or Chakra UI (heavy bundles, opinionated design conflicts with custom mobile ordering UI). Ant Design (not React 19 compatible without issues as of 2025).

---

### QR Code Generation: qrcode

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| qrcode | ^1.5.x | QR code generation to PNG/SVG/Data URL | Venue dashboard: generate venue QR code for printing |

**Rationale:** `qrcode` (soldair/node-qrcode on GitHub) is the most widely-used QR library for Node.js. It outputs to PNG buffer, SVG string, or base64 data URL. Generate in NestJS (backend) to keep the venue URL format server-controlled, return data URL to frontend for display and download. No need for qr-code-styling complexity for v1.

---

### Testing

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | ^3.x | Unit + integration test runner (NestJS) | All NestJS service/controller tests |
| @nestjs/testing | ^11.x | NestJS test module builder | Required for NestJS DI-aware tests |
| @swc/core | ^1.x | SWC transform (required for Vitest + decorators) | NestJS uses decorators; ESBuild breaks metadata |
| unplugin-swc | ^1.x | Vitest plugin to use SWC | Wires SWC into Vitest for decorator support |
| supertest | ^7.x | HTTP integration testing | NestJS controller integration tests |
| @playwright/test | ^1.x | End-to-end browser testing | Critical user flows: scan QR → order → pay |

**Rationale:** NestJS docs default to Jest, but Vitest is faster and works with pnpm/Turborepo caching correctly. The critical caveat: NestJS uses TypeScript decorators for DI, and Vitest's default ESBuild transformer does not emit decorator metadata. You MUST use SWC with `legacyDecorator: true` and `decoratorMetadata: true`. This is a well-documented migration path (ablo.ai blog, multiple GitHub issues). Playwright beats Cypress for E2E: native parallel execution, better multi-browser support, faster in CI.

**Do NOT use:** Jest in a Turborepo (slow, poor workspace caching). Cypress for E2E (serial test execution, no native parallelism, paid dashboard for CI parallelism).

---

### Background Jobs: BullMQ + Redis (defer to Phase 2+)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @nestjs/bullmq | ^11.x | BullMQ integration for NestJS | Email receipts, Stripe webhook processing, async tasks |
| bullmq | ^5.x | Job queue built on Redis | Background processing |
| ioredis | ^5.x | Redis client | Used by BullMQ |

**Rationale:** Not needed for MVP. In v1, Stripe webhook processing can be synchronous (process → update DB → respond). Add BullMQ if webhook processing becomes unreliable or if email receipts need async retry logic. When added, Railway supports Redis as an add-on service. Old `bull` package is maintenance-only — use `@nestjs/bullmq` which targets the maintained `bullmq` package.

**Do NOT use:** The original `bull` package (maintenance-only since 2022, BullMQ is the successor).

---

### API Documentation: @nestjs/swagger

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @nestjs/swagger | ^8.x | OpenAPI spec generation + Swagger UI | Internal API documentation during development |
| swagger-ui-express | ^5.x | Swagger UI renderer | Paired with @nestjs/swagger |

**Note:** `nestjs-zod` auto-generates OpenAPI schemas from Zod schemas, making Swagger docs nearly free once Zod validation is in place.

---

### Shared Package: @bite-byte/types

This is a Turborepo internal package (`packages/types`) — not an npm dependency. It contains:

- Zod schemas for all API request/response shapes
- TypeScript types inferred from Zod schemas (`z.infer<typeof OrderSchema>`)
- Shared constants (order status enum, payment types)

Both `apps/web` (Next.js) and `apps/api` (NestJS) install this as a workspace dependency: `"@bite-byte/types": "workspace:*"`.

**Do NOT duplicate:** Never define the same DTO/schema in both apps. If something is shared, it belongs in `packages/types`.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| ORM | Prisma 7 | Drizzle ORM | Drizzle's code-first approach is better for teams obsessed with SQL control; Prisma's schema-first DX is faster for solo builders; Prisma 7 fixed the bundle size and performance complaints |
| ORM | Prisma 7 | TypeORM | TypeORM's active-record pattern promotes N+1 queries; poor TypeScript inference; being abandoned for Prisma/Drizzle in new NestJS projects |
| Validation | Zod + nestjs-zod | class-validator + class-transformer | class-validator hasn't been updated in 2+ years; breaks type-sharing in monorepos; duplicate schema definitions |
| WebSocket | Socket.io | ws (native) | ws lacks rooms, broadcast semantics, and auto-reconnection — all needed for venue dashboards |
| WebSocket | Socket.io | Server-Sent Events | SSE is one-directional; venue dashboard needs to send status updates back to customers |
| State Mgmt | Zustand + TanStack Query | Redux Toolkit | Redux is overkill for this scope; no meaningful benefit over Zustand for client state |
| State Mgmt | Zustand + TanStack Query | Jotai | Atomic model adds complexity without clear benefit for cart + server state pattern |
| UI | shadcn/ui + Tailwind v4 | Material UI | Heavy bundle, opinionated design clashes with custom mobile ordering UI |
| Testing runner | Vitest | Jest | Jest is slow in Turborepo; doesn't integrate with pnpm caching well |
| E2E Testing | Playwright | Cypress | Playwright has native parallelism; Cypress requires paid plan for parallel CI runs |
| Auth | Passport + JWT | Auth.js (NextAuth) | Auth.js is Next.js-centric; doesn't compose with NestJS backend auth |
| Queue | BullMQ | pg-boss (Postgres-native) | BullMQ has better NestJS integration and more features; pg-boss avoids Redis but adds DB load |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| TypeORM | Active-record anti-patterns, poor TypeScript inference, N+1 prone, being abandoned in 2025 | Prisma 7 |
| `class-validator` + `class-transformer` | Unmaintained (2+ years no updates); forces duplicate schemas in monorepo | `zod` + `nestjs-zod` |
| Raw `ws` library for WebSocket | Missing rooms, broadcast, reconnect — requires reimplementing Socket.io | `@nestjs/platform-socket.io` |
| `bull` (original) | Maintenance-only since 2022 | `@nestjs/bullmq` + `bullmq` |
| Server-Sent Events for real-time | One-directional only | Socket.io (bidirectional) |
| `tailwindcss-animate` | Deprecated in Tailwind v4 | `tw-animate-css` |
| Redux / Redux Toolkit | Excessive boilerplate for this project scope | Zustand + TanStack Query |
| Auth.js / NextAuth on backend | Next.js-only; cannot serve NestJS auth flows | @nestjs/passport + JWT |
| Sequelize | Legacy, poor TypeScript support | Prisma 7 |
| Pages Router (Next.js) | Legacy routing; App Router is default in Next.js 16 | App Router (default) |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| NestJS 11.x | Node.js 20+ | Node 20 is minimum; LTS is 22.x — use Node 22 |
| Next.js 16.x | React 19.x | React 19 is bundled; declare in package.json for tooling |
| Prisma 7.x | PostgreSQL 14+ | Use PostgreSQL 16 on Railway |
| nestjs-zod 4.x | NestJS 11.x, Zod 3.x | Check compatibility before upgrading Zod to v4 (not stable as of research date) |
| Vitest + NestJS | Must use SWC, not ESBuild | ESBuild breaks decorator metadata; use unplugin-swc |
| Tailwind CSS v4 | Next.js 16, shadcn/ui latest | shadcn/ui officially supports Tailwind v4; use tw-animate-css not tailwindcss-animate |
| Socket.io 4.x | @nestjs/platform-socket.io 11.x | Check peer deps on @nestjs/platform-socket.io npm page |
| Stripe SDK v20.x | Node.js 16+ | Use Payment Intents API; Charges API is deprecated |

---

## Installation

```bash
# Root monorepo setup
pnpm init
pnpm add -D turbo typescript

# NestJS app (apps/api)
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config
pnpm add @nestjs/websockets @nestjs/platform-socket.io
pnpm add @nestjs/passport @nestjs/jwt passport passport-jwt passport-local cookie-parser
pnpm add @nestjs/swagger swagger-ui-express
pnpm add prisma @prisma/client
pnpm add nestjs-zod zod
pnpm add stripe
pnpm add qrcode

# NestJS dev deps (apps/api)
pnpm add -D vitest @vitest/coverage-v8 unplugin-swc @swc/core supertest @types/supertest
pnpm add -D @types/passport-jwt @types/passport-local @types/cookie-parser @types/qrcode

# Next.js app (apps/web)
pnpm add next react react-dom
pnpm add zustand @tanstack/react-query
pnpm add socket.io-client
pnpm add zod
pnpm add @stripe/stripe-js @stripe/react-stripe-js

# Next.js dev deps (apps/web)
pnpm add -D tailwindcss @tailwindcss/postcss tw-animate-css
pnpm add -D @playwright/test

# Shared types package (packages/types) — no runtime npm deps needed
# Add workspace reference in apps: "@bite-byte/types": "workspace:*"
```

---

## Stack Patterns by Variant

**If QR codes need custom styling/logos (Phase 2+):**
- Replace `qrcode` with `qr-code-styling` for branded QR codes with venue logo embedded
- `qrcode` is sufficient for v1 functional QR codes

**If email receipts/notifications are needed (Phase 2+):**
- Add `@nestjs/bullmq` + `bullmq` for async job queuing
- Add `resend` or `@sendgrid/mail` for email delivery
- Railway provides Redis as an add-on

**If Stripe webhook volume becomes unreliable (Phase 2+):**
- Move webhook processing to BullMQ queue to decouple Stripe's 5-second response window from DB writes

**If venue owner needs Google OAuth login:**
- Add `passport-google-oauth20` strategy — Passport's pluggable strategy system makes this additive with no architectural changes

---

## Sources

- [Prisma 7.0.0 release announcement](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0) — Rust-free engine, bundle size improvements (HIGH confidence — official Prisma blog)
- [Prisma NestJS integration guide](https://www.prisma.io/docs/guides/nestjs) — Official PrismaService pattern (HIGH confidence — official docs)
- [NestJS 11 release features](https://trilon.io/blog/announcing-nestjs-11-whats-new) — Trilon Consulting official NestJS blog (HIGH confidence)
- [NestJS WebSocket Gateways docs](https://docs.nestjs.com/websockets/gateways) — Socket.io as default adapter (HIGH confidence — official docs)
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — Official tw-animate-css migration (HIGH confidence — official shadcn docs)
- [Next.js 16 installation docs](https://nextjs.org/docs/app/getting-started/installation) — Turbopack default, React 19, TypeScript 5.1 minimum (HIGH confidence — official Next.js docs)
- [nestjs-zod npm](https://www.npmjs.com/package/nestjs-zod) — Zod-to-NestJS DTO bridge (MEDIUM confidence — library docs + community usage)
- [Stripe SDK v20.x](https://github.com/stripe/stripe-node) — Latest major version (MEDIUM confidence — GitHub releases)
- [Railway NestJS deployment guide](https://docs.railway.com/guides/nest) — Official Railway NestJS guide (HIGH confidence — official Railway docs)
- [Vitest + NestJS SWC pattern](https://blog.ablo.ai/jest-to-vitest-in-nestjs) — SWC requirement for decorator metadata (MEDIUM confidence — blog post + GitHub issues corroborate)
- [TanStack Query + Next.js App Router](https://tanstack.com/query/latest/docs/framework/react/guides/ssr) — Official hydration guide (HIGH confidence — official TanStack docs)
- WebSearch results for: ORM comparison (Drizzle vs Prisma 2025), state management patterns 2025/2026, Playwright vs Cypress 2025, BullMQ NestJS patterns — (MEDIUM confidence — multiple independent sources in agreement)

---

*Stack research for: Bite Byte — Multi-venue QR food ordering platform*
*Researched: 2026-03-02*
