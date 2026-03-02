# Phase 2: Auth and Venue Setup - Research

**Researched:** 2026-03-03
**Domain:** Authentication (NestJS JWT + Passport), Dashboard UI (Next.js App Router + shadcn/ui), Venue and Menu management, Image upload (Vercel Blob), QR code generation, Drag-and-drop reordering
**Confidence:** HIGH (core stack verified), MEDIUM (image storage decision)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

User deferred all Phase 2 decisions to Claude's judgment. No locked decisions.

### Claude's Discretion

Claude has full flexibility on:

- **Dashboard layout** — Navigation style (sidebar vs top), page structure, information hierarchy, what the owner sees first after login
- **Menu builder UX** — Inline editing vs form-based, category drag-and-drop implementation, item creation flow, photo upload interaction
- **Onboarding flow** — Whether to use a guided wizard or let owners explore the dashboard with empty states that guide them
- **Visual identity** — Color palette, typography, component library choices, overall aesthetic
- **Auth flow** — Login/signup page design, form validation patterns, error messaging
- **QR code presentation** — How the QR is shown, preview, download options (PNG/SVG)
- **Photo handling** — Upload UX, image sizing/cropping, placeholder for items without photos

Design priorities (inferred from project context):
1. Clean and functional — this is a tool for busy restaurant/food truck owners
2. Mobile-responsive — owners may manage their venue from a phone
3. Fast to learn — minimal training needed, obvious next actions
4. Consistent with customer-facing ordering experience (same design system)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | Venue owner can create an account with email and password | NestJS AuthModule with LocalStrategy + bcrypt password hashing; Prisma User model migration |
| AUTH-02 | Venue owner can log in and stay logged in across browser refresh | JWT access token stored in httpOnly cookie; Next.js middleware validates cookie on every request |
| AUTH-03 | Venue owner can log out from any page | Server Action clears httpOnly cookie; middleware redirects to /login |
| VNUE-01 | Venue owner can create a venue with name, logo, and URL slug | NestJS VenueModule CRUD; Prisma Venue already has slug field; Vercel Blob for logo upload |
| VNUE-02 | Venue owner can configure payment preference (prepay required vs. pay at counter vs. both) | Prisma PaymentMode enum already in schema; NestJS PATCH /venues/:id endpoint |
| VNUE-03 | Venue owner can generate and download a QR code linking to their venue's menu | `qrcode` npm package (v1.5.4); Next.js API route returns PNG buffer with Content-Type: image/png |
| VNUE-04 | Venue owner can manage multiple venues under one account | User → Venue one-to-many; JWT payload carries userId; all Venue queries filtered by ownerId |
| MENU-01 | Venue owner can create, edit, and delete menu categories | NestJS CategoriesModule CRUD; Prisma MenuCategory already has venueId + sortOrder |
| MENU-02 | Venue owner can reorder categories via drag-and-drop | @dnd-kit/core + @dnd-kit/sortable; PATCH /categories/reorder endpoint accepts [{id, sortOrder}] array |
| MENU-03 | Venue owner can create menu items with name, description, price, and photo | NestJS ItemsModule CRUD; Prisma MenuItem already has all fields |
| MENU-04 | Venue owner can edit and delete menu items | Same ItemsModule with PUT + DELETE endpoints; RLS ensures venue scoping |
| MENU-05 | Venue owner can upload item photos that are optimized and served via CDN | Vercel Blob `@vercel/blob` put() function; returns CDN URL stored in MenuItem.imageUrl |
| MENU-06 | Venue owner can toggle item availability (86 an item without deleting it) | PATCH /items/:id/availability; updates MenuItem.isAvailable; already in Prisma schema |

</phase_requirements>

---

## Summary

Phase 2 builds the owner-facing half of the platform. It has four distinct technical domains: (1) authentication via JWT stored in an httpOnly cookie with NestJS Passport strategies on the API and Next.js middleware on the frontend, (2) dashboard UI using shadcn/ui with Tailwind CSS v4 and Next.js App Router route groups for layout separation, (3) venue and menu management CRUD wired from Next.js server actions to NestJS REST endpoints, and (4) media handling via Vercel Blob for photo uploads and the `qrcode` npm package for QR generation.

The existing Prisma schema already has all the right models (`Venue`, `MenuCategory`, `MenuItem`) and enums (`PaymentMode`). What is missing is: a `User` model (with hashed password), an `ownerId` foreign key on `Venue`, the NestJS auth modules, the NestJS venue/menu CRUD modules, and the entire Next.js dashboard UI. The tenant isolation system built in Phase 1 (RLS + `nestjs-cls`) stays in place; Phase 2 wires JWT `userId` into the `TenantMiddleware` stub for the owner context.

**Primary recommendation:** Use NestJS `@nestjs/passport` + `@nestjs/jwt` with a local strategy (email/password + bcrypt) and JWT strategy (Bearer on API); store the access token in an httpOnly cookie set by a Next.js Server Action login form; protect dashboard routes with Next.js middleware that reads and verifies the cookie. Use Vercel Blob for all uploaded images (logo + item photos) — it is the simplest production-ready CDN option given the project is already targeting Vercel for the Next.js app.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@nestjs/passport` | `^11.0.5` | Passport.js integration for NestJS | Official NestJS auth strategy; used in NestJS docs |
| `@nestjs/jwt` | `^11.0.2` | JWT signing/verification utilities | Official NestJS JWT module; compatible with NestJS 11 |
| `passport` | `^0.7.x` | Core Passport.js | Required peer for @nestjs/passport |
| `passport-local` | `^1.0.0` | Email+password strategy | Standard for username/password auth |
| `passport-jwt` | `^4.0.1` | JWT extraction from Bearer header | Standard for API token auth |
| `bcrypt` | `^6.0.0` | Password hashing (native C, faster) | Industry standard; faster than bcryptjs in production Node.js |
| `@types/bcrypt` | latest | TypeScript types for bcrypt | Dev dependency |
| `@types/passport-local` | latest | TypeScript types | Dev dependency |
| `@types/passport-jwt` | latest | TypeScript types | Dev dependency |
| `tailwindcss` | `^4.2.1` | CSS utility framework | v4 is CSS-first (no config file), faster builds |
| `shadcn/ui` | CLI-installed | Accessible component library | Copies components into project; customizable, zero lock-in |
| `@dnd-kit/core` | `^6.3.1` | Drag-and-drop engine | Accessible, touch-friendly, React 18/19 compatible |
| `@dnd-kit/sortable` | `^10.0.0` | Sortable list preset for dnd-kit | Thin layer over core; arrayMove() helper included |
| `@dnd-kit/utilities` | `^3.2.2` | DnD utilities (CSS transforms etc.) | Required with sortable |
| `qrcode` | `^1.5.4` | QR code generation to PNG buffer | Zero dependency; `toBuffer()` → PNG for download |
| `@types/qrcode` | latest | TypeScript types | Dev dependency |
| `@vercel/blob` | `^2.3.0` | CDN image storage | One-line server upload; CDN URLs; free tier includes 1GB |
| `react-hook-form` | `^7.71.2` | Form state management | Industry standard; minimal re-renders |
| `@hookform/resolvers` | `^5.2.2` | Zod → RHF validation bridge | Connects Zod schemas to RHF |
| `zod` | `^4.3.6` | Schema validation | Already in project via @bite-byte/types; shared schemas |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | latest | Icon library | shadcn/ui uses lucide by default |
| `class-variance-authority` | latest | Component variant util | shadcn/ui dependency |
| `clsx` | latest | Conditional className | shadcn/ui dependency |
| `tailwind-merge` | latest | Merge conflicting Tailwind classes | shadcn/ui dependency |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@vercel/blob` | Cloudflare R2 | R2 is cheaper at scale (~19x cheaper egress), but requires manual CDN wiring, presigned URL setup, separate CORS config — significantly more complex for v1 |
| `@vercel/blob` | Railway volume mount | No CDN; images served from Railway origin — slow global, no optimization |
| `bcrypt` | `bcryptjs` | bcryptjs has zero native build deps (easier cross-platform) but is ~20% slower; bcrypt is fine on Railway Node.js |
| `@dnd-kit/sortable` | `react-beautiful-dnd` | react-beautiful-dnd is unmaintained (last release 2022); dnd-kit is the current standard |
| Custom JWT cookie | NextAuth.js (Auth.js) | NextAuth adds abstraction overhead + config complexity for simple email/password; custom httpOnly cookie is more transparent and controllable |

**Installation (API):**
```bash
pnpm add --filter @bite-byte/api @nestjs/passport @nestjs/jwt passport passport-local passport-jwt bcrypt
pnpm add --filter @bite-byte/api -D @types/bcrypt @types/passport-local @types/passport-jwt
```

**Installation (Web):**
```bash
pnpm add --filter @bite-byte/web @vercel/blob qrcode react-hook-form @hookform/resolvers zod @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
pnpm add --filter @bite-byte/web -D @types/qrcode
pnpm dlx shadcn@latest init  # (inside apps/web)
```

---

## Architecture Patterns

### Recommended Project Structure

**API (`apps/api/src/`):**
```
auth/
├── auth.module.ts          # imports JwtModule, PassportModule
├── auth.controller.ts      # POST /auth/register, POST /auth/login
├── auth.service.ts         # register (hash+create), login (validate+sign)
├── strategies/
│   ├── local.strategy.ts   # email+password validation
│   └── jwt.strategy.ts     # JWT extraction from Bearer header
└── guards/
    ├── local-auth.guard.ts
    └── jwt-auth.guard.ts

users/
├── users.module.ts
├── users.service.ts        # findByEmail, create, findById
└── (no controller — internal service only)

venues/
├── venues.module.ts
├── venues.controller.ts    # CRUD + /venues/:id/qrcode
└── venues.service.ts       # all queries scoped to req.user.sub (ownerId)

categories/
├── categories.module.ts
├── categories.controller.ts  # CRUD + PATCH /reorder
└── categories.service.ts

items/
├── items.module.ts
├── items.controller.ts       # CRUD + PATCH /:id/availability
└── items.service.ts
```

**Web (`apps/web/src/`):**
```
app/
├── (auth)/                   # route group — no dashboard layout
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/              # route group — shares dashboard layout
│   ├── layout.tsx            # sidebar nav + auth check
│   ├── dashboard/page.tsx    # venue selector / overview
│   ├── venues/
│   │   ├── new/page.tsx
│   │   └── [venueId]/
│   │       ├── page.tsx      # venue settings (name, logo, slug, payment mode)
│   │       ├── menu/page.tsx # menu builder
│   │       └── qrcode/page.tsx
│   └── ...
├── actions/                  # server actions
│   ├── auth.ts               # login, register, logout
│   ├── venues.ts             # createVenue, updateVenue, uploadLogo
│   └── menu.ts               # category/item CRUD, reorder, uploadImage
middleware.ts                 # reads auth cookie, redirects /login if missing
```

### Pattern 1: NestJS JWT Auth (Local + JWT Strategies)

**What:** Two Passport strategies — `LocalStrategy` validates email/password credentials, `JwtStrategy` validates Bearer tokens on protected endpoints.

**When to use:** All API endpoints requiring authentication use `@UseGuards(JwtAuthGuard)`. The login endpoint uses `@UseGuards(LocalAuthGuard)`.

```typescript
// Source: NestJS docs https://docs.nestjs.com/recipes/passport
// apps/api/src/auth/strategies/local.strategy.ts
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // override default 'username'
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

// apps/api/src/auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

### Pattern 2: JWT in httpOnly Cookie (Next.js Server Action → Middleware)

**What:** Server Action POSTs credentials to NestJS `/auth/login`, receives `access_token`, stores it as an httpOnly cookie. Next.js middleware reads and verifies the cookie before serving dashboard routes.

**When to use:** All dashboard routes are protected this way.

```typescript
// Source: Next.js docs https://nextjs.org/docs/app/building-your-application/authentication
// apps/web/src/actions/auth.ts
'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const res = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
    }),
  });
  if (!res.ok) return { error: 'Invalid credentials' };

  const { access_token } = await res.json();
  const cookieStore = await cookies();
  cookieStore.set('access_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  redirect('/dashboard');
}

// apps/web/src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/venues/:path*'],
};
```

> **Note:** Use `jose` for JWT verification in middleware (Edge Runtime compatible). `jsonwebtoken` does NOT run on Edge Runtime.

### Pattern 3: Prisma User Model (Migration Required)

**What:** Add a `User` model to the existing schema with email+password, and add `ownerId` to `Venue`.

```prisma
// Source: prisma.io/blog/nestjs-prisma-authentication
// Addition to apps/api/prisma/schema.prisma

model User {
  id           String   @id @default(uuid()) @db.Uuid
  email        String   @unique
  passwordHash String   @map("password_hash")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  venues Venue[]

  @@map("users")
}

// Modify existing Venue model — add ownerId
model Venue {
  // ... existing fields ...
  ownerId String @map("owner_id") @db.Uuid
  owner   User   @relation(fields: [ownerId], references: [id])
}
```

> **CRITICAL:** Run `prisma migrate dev --name add_user_and_venue_owner` via the Docker pattern established in Phase 1 (use MIGRATION_DATABASE_URL / superuser). Do NOT run directly from WSL2 host.

### Pattern 4: Vercel Blob Image Upload

**What:** Next.js Server Action receives a `File`, calls `@vercel/blob` `put()`, stores the returned CDN URL to the DB via NestJS API.

```typescript
// Source: vercel.com/docs/vercel-blob/server-upload
// apps/web/src/actions/venues.ts
'use server'

import { put } from '@vercel/blob';

export async function uploadLogoAction(venueId: string, formData: FormData) {
  const file = formData.get('logo') as File;
  // Server upload — file passes through Next.js Function → Vercel Blob
  // 4.5 MB Vercel Function request body limit applies
  const blob = await put(`venues/${venueId}/logo-${Date.now()}`, file, {
    access: 'public',
  });
  // blob.url is the CDN URL — store in venue.logoUrl via API
  return blob.url;
}
```

**Environment variable required:** `BLOB_READ_WRITE_TOKEN` (set in Vercel dashboard, pull locally with `vercel env pull`)

### Pattern 5: Drag-and-Drop Category Reorder

**What:** `@dnd-kit/sortable` wraps the category list. On drag-end, `arrayMove()` reorders local state optimistically and fires a server action to persist new order.

```typescript
// Source: dndkit.com/presets/sortable
// apps/web/src/components/menu/CategoryList.tsx  (Client Component)
'use client'

import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

export function CategoryList({ initialCategories }) {
  const [categories, setCategories] = useState(initialCategories);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered); // optimistic update
    // Persist: PATCH /categories/reorder [{id, sortOrder}]
    reorderCategoriesAction(reordered.map((c, i) => ({ id: c.id, sortOrder: i })));
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={categories} strategy={verticalListSortingStrategy}>
        {categories.map((cat) => <SortableCategory key={cat.id} category={cat} />)}
      </SortableContext>
    </DndContext>
  );
}
```

### Pattern 6: QR Code PNG Download

**What:** Next.js Route Handler generates a PNG buffer and returns it with the correct headers for browser download.

```typescript
// Source: npmjs.com/package/qrcode
// apps/web/src/app/api/venues/[venueId]/qrcode/route.ts
import QRCode from 'qrcode';

export async function GET(
  _req: Request,
  { params }: { params: { venueId: string } }
) {
  // Resolve venue slug from venueId (or receive slug directly)
  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL}/menu/${venueSlug}`;
  const png = await QRCode.toBuffer(menuUrl, { type: 'png', width: 512, margin: 2 });
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="qrcode-${venueSlug}.png"`,
    },
  });
}
```

### Pattern 7: Venue-Scoped Queries + TenantMiddleware Integration

**What:** Phase 1 established `TenantMiddleware` with a stub that reads `venueId` from `req.venueId`. Phase 2 extends this: JWT `JwtStrategy.validate()` returns `{ userId }` which is attached to `req.user`. The owner's API calls pass the JWT Bearer token; the `VenueService` queries `WHERE ownerId = req.user.userId`. This is separate from Phase 3's `venueId` slug resolution (customer routes).

The CLS tenant context (`VENUE_ID`) remains for customer-facing routes (Phase 3). Owner dashboard routes use `req.user.userId` for filtering, not the CLS `VENUE_ID`.

### Anti-Patterns to Avoid

- **Storing JWT in localStorage:** XSS-vulnerable; use httpOnly cookies exclusively.
- **Verifying JWT in Next.js middleware with `jsonwebtoken`:** `jsonwebtoken` uses Node.js crypto APIs not available in the Edge Runtime. Use `jose` (`jwtVerify`) instead.
- **Running migrations from WSL2 host:** Known blocker from Phase 1. All `prisma migrate dev` commands must run inside Docker or use the `MIGRATION_DATABASE_URL` pattern.
- **Large images server-uploaded through Next.js Function:** Vercel Functions have a 4.5 MB request body limit. For item photos (usually < 1 MB), server upload is fine. If needed, use `@vercel/blob` client upload with a short-lived token for larger files.
- **Returning `passwordHash` in API responses:** Always use `Omit<User, 'passwordHash'>` in any DTO / response type.
- **Conflating `ownerId` with `venueId` in RLS:** The RLS `app.tenant_id` setting is designed for the *venue* context (Phase 3 customer isolation). Owner queries use `WHERE ownerId = ?` at the application layer, not RLS. Don't set `app.tenant_id` to `userId`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom hash function | `bcrypt` | Salt rounds, timing-safe compare, industry-standard cost factor |
| JWT signing/verification | Custom HMAC | `@nestjs/jwt` / `jose` | Algorithm selection, expiry, edge compatibility |
| Passport strategy wiring | Manual req middleware | `@nestjs/passport` | Strategy lifecycle, guard integration, NestJS DI |
| Drag-and-drop | Raw pointer events | `@dnd-kit/sortable` | Accessibility (keyboard), touch, pointer, collision detection |
| QR code generation | QR spec implementation | `qrcode` npm | Reed-Solomon error correction, version auto-selection |
| File CDN | Railway volume + nginx | `@vercel/blob` | Global CDN, HTTPS, automatic optimization, one `put()` call |
| Form validation | Manual state machine | `react-hook-form` + `zod` | Uncontrolled inputs, performance, schema sharing with API |

**Key insight:** Auth and DnD are both deceptively complex; both have security/accessibility surface areas that take weeks to get right manually.

---

## Common Pitfalls

### Pitfall 1: `jose` vs `jsonwebtoken` in Next.js Middleware

**What goes wrong:** Developer imports `jsonwebtoken` in `middleware.ts` and gets a build error: "The edge runtime does not support Node.js 'crypto' module."
**Why it happens:** Next.js middleware runs on the Edge Runtime (V8, not Node.js). `jsonwebtoken` uses `crypto.createHmac` which is a Node.js built-in.
**How to avoid:** Use `jose` (`jwtVerify`, `SignJWT`) in `middleware.ts` and in any Server Component/Action that runs at the edge. `jose` is a pure-JS JOSE implementation with no Node.js dependencies.
**Warning signs:** Build error mentioning "crypto module" or "not supported in edge runtime."

### Pitfall 2: Missing `usernameField` in LocalStrategy

**What goes wrong:** Passport's `LocalStrategy` expects `username` by default. Submitting `{ email, password }` results in a 401 even with correct credentials.
**Why it happens:** `passport-local` uses `username` + `password` field names by default.
**How to avoid:** Pass `{ usernameField: 'email' }` to the `super()` call in `LocalStrategy`.
**Warning signs:** `validate()` receives `undefined` for the email parameter.

### Pitfall 3: `@dnd-kit/sortable` requires `items` prop to have stable IDs

**What goes wrong:** Dragging items causes wrong elements to move or infinite re-renders.
**Why it happens:** `SortableContext` uses item IDs as keys for internal state. If IDs change between renders (e.g., using array index), DnD state gets corrupted.
**How to avoid:** Always use stable UUIDs (Prisma's `id` field) as the `id` prop on sortable items and in the `items` array passed to `SortableContext`.
**Warning signs:** Items jump to wrong positions on drag end.

### Pitfall 4: Vercel Blob requires `BLOB_READ_WRITE_TOKEN` in local dev

**What goes wrong:** Image upload works in production but `put()` throws "Missing required environment variable: BLOB_READ_WRITE_TOKEN" locally.
**Why it happens:** The token is auto-injected in Vercel deployments but must be pulled manually for local dev.
**How to avoid:** Run `vercel env pull .env.local` after creating the Blob store in the Vercel dashboard. Add `BLOB_READ_WRITE_TOKEN` to the local `.env` file.
**Warning signs:** `put()` throws missing token error at runtime.

### Pitfall 5: Returning `passwordHash` in Auth DTOs

**What goes wrong:** User object returned from `find*` Prisma calls includes `passwordHash`, which gets serialized to the API response.
**Why it happens:** Prisma returns all model fields by default.
**How to avoid:** Use Prisma `select` to explicitly exclude `passwordHash`, or use a response transformer. Define a `SafeUser` type as `Omit<User, 'passwordHash'>` and return that type consistently.
**Warning signs:** API response contains `passwordHash` field.

### Pitfall 6: RLS Blocks INSERT for New User/Venue Records

**What goes wrong:** `prisma.user.create()` fails with RLS policy violation when called by `bitebyte_app` (non-superuser).
**Why it happens:** The INSERT RLS policy on all tables checks `id::text = current_setting('app.tenant_id', true)`. For `users` table, this is wrong (users create their own row, no tenant context yet). For initial venue creation, there's no tenant_id set.
**How to avoid:** The `users` table does NOT need RLS (users are not tenant-scoped data). The existing RLS policies were defined for `venues`, `menu_categories`, `menu_items`, `orders`, `order_items`. Adding a migration that adds RLS only to those tables (not `users`) resolves this. Alternatively, use the `ADMIN_DATABASE_URL` (superuser) for the `AuthService` operations.

**Recommended approach:** Add `users` table without RLS policies. The existing Phase 1 RLS migration only covers venue/order data. The `users` table is new, so no RLS is needed — just application-level security (ownerId checks).

### Pitfall 7: shadcn/ui with pnpm workspace — must run CLI from `apps/web`

**What goes wrong:** Running `pnpm dlx shadcn@latest init` from the monorepo root installs components to the wrong location or fails to find `next.config.ts`.
**Why it happens:** shadcn CLI detects the framework from the local directory's `package.json` and `next.config.*`.
**How to avoid:** Always run shadcn CLI from within `apps/web/`.
**Warning signs:** Components installed to root `components/ui/` instead of `apps/web/src/components/ui/`.

### Pitfall 8: WSL2 Docker migration constraint (inherited from Phase 1)

**What goes wrong:** `prisma migrate dev` fails with SCRAM-SHA-256 authentication error when run from WSL2 host.
**Why it happens:** Docker Desktop WSL2 proxy blocks the PostgreSQL SCRAM handshake for TCP connections to `localhost:5433`.
**How to avoid:** Run migrations inside Docker: `docker run --rm --network bite-byte_default -e MIGRATION_DATABASE_URL=... node:22-alpine sh -c "cd /app && npx prisma migrate dev"` or use the established `scripts/` pattern.

---

## Code Examples

Verified patterns from official sources:

### bcrypt Password Hashing (NestJS AuthService)
```typescript
// Source: prisma.io/blog/nestjs-prisma-authentication
import * as bcrypt from 'bcrypt';

// Register
const hash = await bcrypt.hash(dto.password, 12); // 12 rounds
await this.prisma.user.create({
  data: { email: dto.email, passwordHash: hash },
});

// Login validation
const match = await bcrypt.compare(password, user.passwordHash);
if (!match) throw new UnauthorizedException('Invalid credentials');
```

### JWT Token Issuance
```typescript
// Source: NestJS docs recipes/passport
// apps/api/src/auth/auth.service.ts
async login(user: SafeUser): Promise<{ access_token: string }> {
  const payload = { sub: user.id, email: user.email };
  return {
    access_token: await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    }),
  };
}
```

### AuthModule Setup
```typescript
// apps/api/src/auth/auth.module.ts
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

### Venue Query Scoped by Owner
```typescript
// apps/api/src/venues/venues.service.ts
// req.user.userId comes from JwtStrategy.validate() → @UseGuards(JwtAuthGuard)
async findAllForOwner(ownerId: string) {
  return this.prisma.venue.findMany({
    where: { ownerId },
    include: { categories: { include: { items: true } } },
    orderBy: { createdAt: 'asc' },
  });
}
```

### QR Code PNG Buffer
```typescript
// Source: npmjs.com/package/qrcode
import QRCode from 'qrcode';

const png: Buffer = await QRCode.toBuffer(url, {
  type: 'png',
  width: 512,
  margin: 2,
  color: { dark: '#000000', light: '#FFFFFF' },
});
```

### Tailwind v4 Setup (apps/web)
```css
/* apps/web/src/app/globals.css */
@import "tailwindcss";

/* CSS-first config in v4 — no tailwind.config.js needed */
@theme {
  --color-brand: #f97316; /* orange-500 — food/energy feel */
}
```

```typescript
// apps/web/next.config.ts — no changes needed for Tailwind v4
// PostCSS is handled automatically by Next.js 15 with @tailwindcss/postcss
```

### Next.js Route Groups for Auth vs Dashboard Layout
```
app/
├── (auth)/           # No layout wrapper
│   └── login/
│       └── page.tsx
├── (dashboard)/      # Wraps all owner pages with sidebar layout
│   ├── layout.tsx    # <Sidebar /> + <main>{children}</main>
│   └── dashboard/
│       └── page.tsx
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-beautiful-dnd` | `@dnd-kit/sortable` | 2022 (rbd unmaintained) | dnd-kit is the maintained standard |
| `tailwind.config.js` | CSS `@theme {}` (v4) | Tailwind v4.0 (Jan 2025) | No JS config file needed |
| `@tailwind base/components/utilities` directives | `@import "tailwindcss"` | Tailwind v4.0 | Single import line |
| `NextAuth.js` for credentials | Custom httpOnly cookie | Ongoing (2024–2025) | NextAuth v5 still beta; custom cookie simpler for email/password only |
| `jsonwebtoken` in middleware | `jose` | Next.js App Router (2023) | Edge Runtime incompatibility; jose is the correct choice |
| `@prisma/client` default import | Custom output path import | Prisma 7 (Phase 1 decision) | Import from `../generated/prisma/client` not `@prisma/client` |

**Deprecated/outdated:**
- `react-beautiful-dnd`: Last meaningful release 2022; unmaintained; known issues with React 18 concurrent mode
- `tailwind.config.js` for new projects: Still works (backward compat in v4) but not needed for new setups
- `passport-cookie` strategy: Non-standard; use middleware cookie check instead

---

## Open Questions

1. **Image CDN: `@vercel/blob` free tier limits**
   - What we know: Free plan includes 1 GB storage, 1 GB bandwidth/month ([Vercel pricing](https://vercel.com/pricing)). `put()` API is straightforward.
   - What's unclear: Whether the Vercel project is on a paid plan. If the project is on the Hobby (free) plan, blob storage requires upgrade.
   - Recommendation: Use `@vercel/blob` for v1 (simplest path). If cost becomes an issue at scale, migrate to Cloudflare R2 — the abstraction is a single `put()` call easy to swap. Document this as a known future migration.

2. **JWT expiry: 7 days vs access+refresh token pair**
   - What we know: Access+refresh rotation is more secure (short-lived access token, rotated refresh). But it adds complexity: two tokens, rotation logic, refresh endpoint.
   - What's unclear: What the right tradeoff is for a v1 food-ordering dashboard.
   - Recommendation: Use a single 7-day JWT for v1. Owners log in from a few trusted devices. The additional complexity of refresh tokens is not worth it at this stage. Document the upgrade path.

3. **shadcn/ui component theme: consistent with customer-facing Phase 3 UI**
   - What we know: shadcn/ui will be initialized in `apps/web`. Phase 3 builds customer-facing menu pages in the same `apps/web` app.
   - What's unclear: Whether to use the same theme for owner dashboard and customer ordering pages, or separate themes.
   - Recommendation: Initialize shadcn/ui once with a neutral base theme. Customer pages (Phase 3) can use venue-specific colors via CSS variables scoped to the `[data-venue]` layout. This keeps one design system for both.

---

## Validation Architecture

> `workflow.nyquist_validation` is not present in `.planning/config.json` (not set to `true`). Skipping Validation Architecture section.

---

## Sources

### Primary (HIGH confidence)
- NestJS official docs `docs.nestjs.com/recipes/passport` — LocalStrategy, JwtStrategy, AuthModule patterns
- NestJS official docs `docs.nestjs.com/security/authentication` — Guard setup, JWT configuration
- Vercel official docs `vercel.com/docs/vercel-blob/server-upload` — Server upload pattern, env var, 4.5 MB limit
- dndkit.com/presets/sortable — SortableContext, useSortable, arrayMove() API
- shadcn/ui official docs `ui.shadcn.com/docs/installation/next` — pnpm init command
- npm registry (live queries 2026-03-03): package versions confirmed for @nestjs/jwt (11.0.2), @nestjs/passport (11.0.5), @dnd-kit/sortable (10.0.0), @dnd-kit/core (6.3.1), qrcode (1.5.4), @vercel/blob (2.3.0), bcrypt (6.0.0), tailwindcss (4.2.1), react-hook-form (7.71.2), zod (4.3.6)

### Secondary (MEDIUM confidence)
- prisma.io/blog/nestjs-prisma-authentication — User model schema pattern, bcrypt hash pattern (2023, still applicable)
- WebSearch cross-referenced with NestJS docs: bcrypt vs bcryptjs performance tradeoff
- WebSearch cross-referenced with Vercel docs: R2 vs Vercel Blob pricing tradeoff
- tailwindcss.com/blog/tailwindcss-v4 — v4 CSS-first config pattern confirmed

### Tertiary (LOW confidence)
- WebSearch only: @dnd-kit/react (new package, v0.3.2) — unclear if this replaces @dnd-kit/sortable or is experimental. Recommendation: stick with stable @dnd-kit/sortable v10.0.0.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified via npm registry live queries 2026-03-03; peer dependencies confirmed compatible
- Architecture: HIGH — NestJS Passport/JWT pattern is the official documented approach; Next.js httpOnly cookie pattern is well-established
- Pitfalls: HIGH — Edge runtime/jose, LocalStrategy usernameField, RLS INSERT for users, WSL2 migration all confirmed from Phase 1 experience or official docs
- Image CDN: MEDIUM — Vercel Blob verified from official docs; free tier limit is a real uncertainty depending on project plan

**Research date:** 2026-03-03
**Valid until:** 2026-06-03 (stable ecosystem; NestJS/Next.js major version changes could affect some details)
