# Bite Byte

> A full-stack, multi-tenant restaurant ordering platform built as a monorepo with Next.js 15, NestJS 11, and PostgreSQL via Prisma.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Data Model](#data-model)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Running Locally](#running-locally)
- [Database Management](#database-management)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Payment Integration](#payment-integration)

---

## Overview

Bite Byte is a venue-centric ordering system. Each **venue** (restaurant, café, food stall) is an isolated tenant with its own menu, orders, and settings. The platform covers three distinct user surfaces:

| Surface | Description |
|---|---|
| **Venue dashboard** | Owner-facing management UI — menu builder, live order board, analytics |
| **Public menu** | Customer-facing browsing and cart experience at `/menu/:slug` |
| **Checkout flow** | Stripe-powered prepay or pay-at-counter, with real-time order status |

Real-time order status propagation is handled via WebSockets (Socket.io), and payment confirmation is processed through Stripe webhooks with idempotency tracking.

---

## Architecture

```
bite-byte/
├── apps/
│   ├── web/          # Next.js 15 — App Router, React 19, Tailwind CSS 4
│   └── api/          # NestJS 11 — REST API, WebSockets, Stripe webhooks
└── packages/
    ├── types/        # Shared Zod schemas and TypeScript types
    └── tsconfig/     # Shared TypeScript base configuration
```

**Monorepo tooling:** pnpm workspaces + Turborepo for parallel task execution and build caching.

The frontend and API are fully decoupled. The web app communicates with the API over HTTP (server actions and `fetch`) and WebSockets. Authentication uses stateless JWT tokens, with the secret shared between both apps.

---

## Tech Stack

### Frontend — `apps/web`

| Concern | Library |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Styling | Tailwind CSS 4 + `class-variance-authority` + `tailwind-merge` |
| UI primitives | Radix UI + shadcn/ui |
| Animations | Framer Motion + GSAP + Lenis (smooth scroll) |
| 3D graphics | Three.js + React Three Fiber + Drei |
| Drag and drop | dnd-kit (core, sortable, modifiers) |
| Payments | Stripe.js + `@stripe/react-stripe-js` |
| Real-time | Socket.io client |
| File storage | Vercel Blob |
| Schema validation | Zod |
| Auth | `jose` (JWT decode/verify on the edge) |

### Backend — `apps/api`

| Concern | Library |
|---|---|
| Framework | NestJS 11 + Express |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Database | PostgreSQL 16 |
| Auth | Passport.js (local + JWT strategies) + `@nestjs/jwt` |
| Real-time | Socket.io (`@nestjs/platform-socket.io`) |
| Payments | Stripe Node SDK |
| Async context | `nestjs-cls` (per-request tenant context) |
| Password hashing | bcrypt |
| Testing | Vitest + `@nestjs/testing` |

---

## Data Model

```
User
 └── Venue (1 : N)
      ├── MenuCategory (1 : N, ordered by sortOrder)
      │    └── MenuItem (1 : N, ordered by sortOrder)
      └── Order (1 : N)
           └── OrderItem (1 : N) ──→ MenuItem (nullable snapshot FK)
```

**Order lifecycle:**

```
PENDING_PAYMENT → RECEIVED → PREPARING → READY → COMPLETED
                                                └→ CANCELLED
```

**Payment modes per venue:** `PREPAY_REQUIRED` | `PAY_AT_COUNTER` | `BOTH`

Stripe webhook events are recorded in a `StripeEvent` table for idempotent processing.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 22 | Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) |
| pnpm | 9.x | `npm install -g pnpm@9` |
| Docker & Docker Compose | any recent | For the local PostgreSQL instance |
| Stripe CLI | latest | Required only for webhook testing |

---

## Environment Setup

### 1. API environment — `apps/api/.env`

Create the file from the example:

```bash
cp apps/api/.env.example apps/api/.env   # if no example exists, create manually
```

```env
# PostgreSQL — points to the Docker Compose service below
DATABASE_URL="postgresql://bitebyte:bitebyte@localhost:5433/bitebyte_dev"

# Optional: superuser URL used only by Prisma migrations
# MIGRATION_DATABASE_URL="postgresql://bitebyte:bitebyte@localhost:5433/bitebyte_dev"

# API port (default: 7001)
PORT=7001

# JWT — must be at least 32 characters, must match the web app value
JWT_SECRET="change-me-to-a-32-plus-char-random-string"

# Stripe — use test-mode keys from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."        # obtained from `stripe listen` (see below)
```

### 2. Web environment — `apps/web/.env.local`

```env
# URL of the running API (used by server-side fetch and server actions)
API_URL="http://localhost:7001/api"

# Same JWT secret as the API
JWT_SECRET="change-me-to-a-32-plus-char-random-string"

# Public base URL of the web app
NEXT_PUBLIC_APP_URL="http://localhost:7000"

# Optional: Vercel Blob token for image uploads
# BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

> **Important:** `JWT_SECRET` must be identical in both `.env` files. The web app verifies tokens issued by the API.

---

## Running Locally

### Step 1 — Install dependencies

From the repository root:

```bash
pnpm install
```

This installs dependencies for all workspaces in a single pass.

### Step 2 — Start the database

```bash
docker compose up -d
```

This starts a PostgreSQL 16 instance on **port 5433** with database `bitebyte_dev` and credentials `bitebyte / bitebyte`.

Verify it is healthy:

```bash
docker compose ps
```

### Step 3 — Run database migrations

```bash
cd apps/api
npx prisma migrate dev
```

This applies all pending migrations and generates the Prisma client. Run this once on first setup, and again whenever the schema changes.

### Step 4 — (Optional) Seed the database

```bash
# from apps/api/
pnpm seed
```

### Step 5 — Start the development servers

Return to the repository root and run both apps in parallel:

```bash
pnpm dev
```

Turborepo starts both `apps/api` and `apps/web` concurrently with their respective watch modes.

| App | URL |
|---|---|
| Web (Next.js) | http://localhost:7000 |
| API (NestJS) | http://localhost:7001/api |

To run only one app:

```bash
# Web only
pnpm --filter web dev

# API only
pnpm --filter api dev
```

### Step 6 — (Optional) Stripe webhook forwarding

To test the payment flow end-to-end locally, forward Stripe events to the running API:

```bash
stripe listen --forward-to http://localhost:7001/api/webhooks/stripe
```

Copy the `whsec_...` signing secret printed by the CLI and set it as `STRIPE_WEBHOOK_SECRET` in `apps/api/.env`, then restart the API.

---

## Database Management

All Prisma commands must be run from `apps/api/`.

```bash
# Apply migrations (development)
npx prisma migrate dev --name <migration-name>

# Apply migrations (CI / production)
npx prisma migrate deploy

# Open Prisma Studio (visual DB browser)
npx prisma studio

# Regenerate the Prisma client after schema edits
npx prisma generate

# Reset the database (drops and re-migrates — destructive)
npx prisma migrate reset
```

---

## Testing

Unit tests live in `apps/api/` and are run with Vitest.

```bash
# Run tests once
pnpm --filter api test

# Run tests in watch mode
pnpm --filter api test:watch
```

Type checking across all workspaces:

```bash
pnpm type-check
```

Linting:

```bash
pnpm lint
```

---

## Project Structure

```
apps/
  web/
    src/
      app/                  # Next.js App Router pages and layouts
        (auth)/             # Login / register routes
        (dashboard)/        # Owner dashboard — menu, orders, analytics
        (menu)/             # Public customer-facing menu
      actions/              # Next.js server actions (form mutations)
        auth.ts
        menu.ts
        venues.ts
      components/
        dashboard/          # Sidebar, nav, layout
        menu/               # Category list, sortable items, item form
        ordering/           # Public menu, cart, checkout
      lib/
        cart.ts             # SSR-safe cart (localStorage per venue slug)

  api/
    src/
      auth/                 # JWT strategy, login, register
      users/
      venues/
      categories/
      items/
      orders/
      public-menu/          # Unauthenticated menu + ordering endpoints
      analytics/
      webhooks/             # Stripe webhook handler
      prisma/               # PrismaService (singleton)
    prisma/
      schema.prisma
      migrations/
      seed.ts

packages/
  types/                    # Shared Zod schemas consumed by both apps
  tsconfig/                 # Base tsconfig.json extended by each workspace
```

---

## Payment Integration

Bite Byte integrates Stripe for prepay orders. The flow is:

1. Customer submits order — API creates a `PaymentIntent` and returns the `client_secret`.
2. Web app renders the Stripe Elements checkout form.
3. Customer completes payment — Stripe fires a `payment_intent.succeeded` webhook.
4. API webhook handler (`/api/webhooks/stripe`) verifies the signature, checks the `StripeEvent` table for duplicates, and transitions the order from `PENDING_PAYMENT` to `RECEIVED`.
5. WebSocket event is broadcast to the venue's order board in real time.

For venues configured as `PAY_AT_COUNTER`, no Stripe intent is created and the order is placed directly in `RECEIVED` status.
