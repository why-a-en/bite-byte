# Phase 3: Customer Ordering - Research

**Researched:** 2026-03-04
**Domain:** Public ordering flow — Stripe Payments, localStorage cart, polling, NestJS public routes
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Menu Page Layout
- Stacked list layout (full-width rows), not a card grid
- Each row shows: item name, description preview, price, and a photo thumbnail on the right
- Tapping an item opens a **bottom sheet** showing the full photo, complete description, and an "Add to Cart" button — not an inline + button on the row
- Unavailable items should be visually dimmed/disabled so customers can see them but not add them

#### Cart Experience
- A **floating "View Cart" button** (persistent, not a sticky bar) shows item count and total
- Tapping it opens a **slide-up drawer** with the full cart contents
- Drawer has **full quantity controls**: +/- buttons per item and a remove option
- Cart persists in **localStorage** — survives full page refresh, scoped per venue slug
- Drawer has a "Checkout" CTA at the bottom

#### Checkout Form
- Collect **customer name only** (required) — no table number, no order notes
- For **prepay venues**: Stripe payment form (card, Apple Pay, Google Pay) embedded on the checkout page — no redirect
- For **pay-at-counter venues**: show clear instructions ("Pay when you collect your order") and a "Place Order" button — no payment fields
- Order is created on the server; for prepay, transitions to RECEIVED only after `payment_intent.succeeded` webhook fires

#### Order Tracking Page
- Status displayed as **progress steps**: Pending → Preparing → Ready (→ Completed)
- Each step shows clearly which is active/complete/upcoming
- Order reference number prominently displayed
- Order ID persisted in localStorage so customer can return to the page after closing the browser
- For Phase 3, status updates via **polling** (short interval). WebSocket real-time push is Phase 4.

### Claude's Discretion
- Exact position of floating cart button (bottom-center vs bottom-right)
- Category navigation UX (sticky tabs at top, scroll-based highlighting, or jump links)
- Loading skeleton / shimmer states
- Empty cart state
- Stripe Elements vs Stripe Payment Element choice
- Polling interval for order status page
- Error states for payment failure (card declined, etc.)
- How to handle items removed from menu while in cart

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ORDR-01 | Customer can scan a venue's QR code and see that venue's menu on their phone browser | Public Next.js route `/menu/[slug]` — no auth required; middleware matcher already excludes non-dashboard paths |
| ORDR-02 | Customer can browse menu items organized by category with photos and descriptions | Server Component fetches `/api/public/venues/[slug]/menu` — categories with items, sorted by sortOrder |
| ORDR-03 | Customer can add items to a cart and adjust quantities | Client Component cart state with +/- controls; item sheet opened on row tap |
| ORDR-04 | Customer's cart persists across page refresh (localStorage) | Custom `useLocalStorage` hook scoped by `cart:${venueSlug}` key |
| ORDR-05 | Customer can place an order as a guest (no account required) | POST `/api/public/venues/[slug]/orders` — no JWT guard; customer name in body |
| ORDR-06 | Customer can pay online via Stripe (card, Apple Pay, Google Pay) when venue requires prepay | Stripe Payment Element + `confirmPayment({ redirect: 'if_required' })`; order created in PENDING_PAYMENT state first |
| ORDR-07 | Customer sees "pay at counter" instructions when venue allows deferred payment | Conditional render on checkout page based on venue `paymentMode`; order created immediately in RECEIVED state |
| ORDR-08 | Customer receives an order confirmation with a reference number after placing an order | `referenceCode` generated with `nanoid` (uppercase alphanumeric, 8 chars) stored on Order model; displayed on confirmation page |
| ORDR-09 | Customer can view real-time order status (Pending → Preparing → Ready) via WebSocket | Phase 3 uses polling: `usePolling` hook calls `router.refresh()` every 5s; Server Component re-renders with fresh data |
| ORDR-10 | Customer can return to their order status page after closing the browser (order ID persisted in localStorage) | Store `orderId` in `localStorage` key `lastOrder:${venueSlug}` after order creation; read on page load |
</phase_requirements>

---

## Summary

Phase 3 builds the entire public customer-facing ordering flow as a mobile-first Next.js section, fully separate from the authenticated dashboard. The QR code scans to `/menu/[slug]` — a new public route group in the Next.js App Router that the existing middleware matcher already ignores (matcher only covers `/dashboard/:path*` and `/venues/:path*`). All customer-facing pages are Server Components where possible, with Client Components for interactive islands (cart, checkout, polling).

The most technically significant piece is the Stripe integration. The locked decision requires payment via Stripe Payment Element embedded on-page (no redirect), with orders transitioning to RECEIVED exclusively via the `payment_intent.succeeded` webhook — the stub handler already exists in `apps/api/src/webhooks/stripe-webhook.stub.ts` and needs to be completed. The Payment Element with `redirect: 'if_required'` supports card, Apple Pay, and Google Pay without redirecting for standard card payments, satisfying the "no redirect" requirement. The PaymentIntent metadata must store the `orderId` so the webhook handler can identify which order to update.

The NestJS API needs a new `OrdersModule` with two controller variants: public endpoints (no JWT guard) for creating orders and fetching menu data by slug, and the completed webhook handler. The `@Public()` decorator pattern (SetMetadata + Reflector in JwtAuthGuard) is the standard NestJS approach. The `rawBody: true` flag is already set in `main.ts`. Cart state uses a custom `useLocalStorage` hook keyed by venue slug. Order status polling uses `router.refresh()` in a `useEffect` interval — the Next.js-idiomatic approach that triggers Server Component re-renders without an external data library.

**Primary recommendation:** Use Stripe Payment Element with `automatic_payment_methods: { enabled: true }` and `redirect: 'if_required'`. Create a new `(menu)` route group in Next.js for all public customer pages. Use the `@Public()` decorator in NestJS for all customer-facing API endpoints.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @stripe/react-stripe-js | 5.6.1 (latest) | React components for Stripe Elements | Official Stripe React library; provides Elements, PaymentElement, useStripe, useElements |
| @stripe/stripe-js | 8.9.0 (latest) | Stripe.js loader | loadStripe() — loads Stripe.js from CDN, returns Promise<Stripe> |
| stripe | ^17.0.0 (already installed) | Server-side Stripe SDK | Already in api/package.json; used for PaymentIntent creation and webhook verification |
| nanoid | ^5.x | Short unique ID generation | Generates readable order reference codes (8-char alphanumeric) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vaul (via shadcn Drawer) | 1.1.2 | Bottom sheet/drawer primitive | Cart drawer, item detail bottom sheet — mobile gesture-driven |
| shadcn Sheet | already configured | Side/bottom sliding panel | Alternative to Drawer for non-gesture scenarios |
| lucide-react | already installed | Icons | Back arrow, cart icon, checkmark steps, loading states |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Stripe Payment Element | Stripe Card Element | Payment Element handles 100+ methods including Apple/Google Pay natively; Card Element only handles cards, requires separate PaymentRequestButton for wallets |
| router.refresh() polling | SWR / TanStack Query | router.refresh() is Next.js-native, no extra dependency, re-renders Server Components; external libs add complexity and don't integrate with RSC cache |
| nanoid for referenceCode | uuid | nanoid produces shorter human-readable codes (8 chars vs 36 chars UUID) — better for "reference number displayed to customer" |
| vaul Drawer | Radix Sheet side="bottom" | vaul has gesture/swipe-to-close, snap points, and native mobile feel; Sheet is simpler but no gesture physics |

### Installation

```bash
# In apps/web:
pnpm add @stripe/react-stripe-js @stripe/stripe-js

# In apps/api:
pnpm add nanoid

# shadcn components (from apps/web directory):
pnpm dlx shadcn@latest add drawer
```

Note: `stripe` is already installed in `apps/api/package.json`. `vaul` is installed as a dependency of the shadcn Drawer component automatically.

---

## Architecture Patterns

### Recommended Project Structure

```
apps/web/src/
├── app/
│   ├── (menu)/                    # NEW public route group — no auth required
│   │   ├── menu/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx       # Menu page — Server Component
│   │   │       ├── checkout/
│   │   │       │   └── page.tsx   # Checkout page — Server Component shell
│   │   │       └── order/
│   │   │           └── [orderId]/
│   │   │               └── page.tsx # Order status page — Server Component
│   │   └── layout.tsx             # Minimal layout — no sidebar
│   └── (dashboard)/               # Existing dashboard routes
├── components/
│   └── ordering/                  # NEW — all customer ordering components
│       ├── menu-page.tsx          # Client Component — cart state root
│       ├── category-nav.tsx       # Category tabs/jump links
│       ├── menu-item-row.tsx      # Row with name/price/thumbnail
│       ├── item-detail-sheet.tsx  # Bottom sheet with full photo + Add to Cart
│       ├── cart-drawer.tsx        # Slide-up cart drawer with quantity controls
│       ├── cart-button.tsx        # Floating cart button
│       ├── checkout-form.tsx      # Checkout page Client Component
│       ├── stripe-payment-form.tsx # Stripe Elements wrapper
│       └── order-status.tsx      # Order status steps + polling
└── lib/
    ├── cart.ts                    # Cart types + useLocalStorage cart hook
    └── api-public.ts              # fetchPublicApi — no auth headers

apps/api/src/
└── orders/                        # NEW NestJS module
    ├── orders.module.ts
    ├── orders.controller.ts       # Public routes — no JwtAuthGuard
    └── orders.service.ts

apps/api/src/
└── public-menu/                   # NEW NestJS module for public menu read
    ├── public-menu.module.ts
    ├── public-menu.controller.ts  # GET /public/venues/:slug/menu
    └── public-menu.service.ts

apps/api/src/common/decorators/
└── public.decorator.ts            # @Public() decorator
```

### Pattern 1: Public NestJS Endpoints with @Public() Decorator

**What:** Mark specific endpoints as public using SetMetadata; JwtAuthGuard checks metadata and skips auth check.
**When to use:** Customer-facing endpoints — menu reading, order creation, order status reading.

```typescript
// Source: NestJS official docs - https://docs.nestjs.com/security/authentication
// apps/api/src/common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// apps/api/src/auth/guards/jwt-auth.guard.ts — MODIFY existing guard:
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}

// Usage in controller:
@Controller('public/venues/:slug')
export class PublicMenuController {
  @Public()
  @Get('menu')
  async getMenu(@Param('slug') slug: string) { ... }
}
```

Note: The existing `JwtAuthGuard` in this project does NOT use `Reflector` — it must be modified to support `@Public()`. Currently controllers apply `@UseGuards(JwtAuthGuard)` explicitly; the public routes simply won't use `@UseGuards` at all, which is the simpler approach. Research both options: (a) no `@UseGuards` on public controllers, or (b) global guard + `@Public()` decorator.

**Simpler approach for this project:** Do NOT apply `@UseGuards(JwtAuthGuard)` to the new `PublicMenuController` and `OrdersController`. Since the existing guard is applied per-controller (not globally), public controllers need no change.

### Pattern 2: Stripe PaymentIntent + Payment Element (No Redirect)

**What:** Create PaymentIntent on server with order metadata, pass clientSecret to client, render Payment Element, call confirmPayment with redirect: 'if_required'.
**When to use:** Prepay venues — ORDR-06.

```typescript
// Source: https://docs.stripe.com/payments/quickstart

// === SERVER: NestJS OrdersService ===
// 1. Create Order in DB with status PENDING_PAYMENT
// 2. Create Stripe PaymentIntent with orderId in metadata
async createPaymentIntent(orderId: string, amountCents: number, currency: string) {
  const paymentIntent = await this.stripe.paymentIntents.create({
    amount: amountCents,          // amount in smallest currency unit (cents)
    currency,                     // 'gbp', 'usd', etc.
    automatic_payment_methods: { enabled: true }, // enables Apple Pay, Google Pay, cards
    metadata: { orderId },        // CRITICAL: lets webhook identify the order
  });
  // Store paymentIntentId on Order record
  return paymentIntent.client_secret;
}

// === CLIENT: React ===
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Wrapper component — receives clientSecret from server
export function StripePaymentForm({ clientSecret, onSuccess }: Props) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm onSuccess={onSuccess} />
    </Elements>
  );
}

function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/menu/${slug}/order/${orderId}`,
      },
      redirect: 'if_required', // Only redirects for redirect-based payment methods
    });

    if (error) {
      // error.type === 'card_error' → show error.message to user
      setError(error.message ?? 'Payment failed');
    } else if (paymentIntent?.status === 'succeeded') {
      // Card paid without redirect — navigate to order status
      // NOTE: Order status won't be RECEIVED yet — webhook fires async
      // Show "Payment submitted — checking order..." and poll
      onSuccess();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <button type="submit" disabled={loading || !stripe}>
        {loading ? 'Processing...' : 'Pay'}
      </button>
    </form>
  );
}
```

### Pattern 3: localStorage Cart with Venue Scoping

**What:** Custom hook that reads/writes cart state to localStorage, keyed by venue slug.
**When to use:** ORDR-03, ORDR-04.

```typescript
// apps/web/src/lib/cart.ts

export interface CartItem {
  menuItemId: string;
  name: string;
  price: string;       // Decimal string matching MenuItem.price format
  imageUrl: string | null;
  quantity: number;
}

export interface Cart {
  venueSlug: string;
  items: CartItem[];
}

// Custom hook — SSR-safe (localStorage is undefined on server)
export function useCart(venueSlug: string) {
  const key = `cart:${venueSlug}`;

  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist every change
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // localStorage full or disabled — silent fail
    }
  }, [items, key]);

  function addItem(item: Omit<CartItem, 'quantity'>) {
    setItems(prev => {
      const existing = prev.find(i => i.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map(i =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function updateQuantity(menuItemId: string, quantity: number) {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.menuItemId !== menuItemId));
    } else {
      setItems(prev =>
        prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i)
      );
    }
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, addItem, updateQuantity, clearCart, total, itemCount };
}
```

### Pattern 4: Order Status Polling with router.refresh()

**What:** Client component runs `router.refresh()` on an interval, causing the Server Component to re-fetch fresh order status from the API.
**When to use:** ORDR-09 — Phase 3 polling approach before WebSocket in Phase 4.

```typescript
// Source: https://www.davegray.codes/posts/usepolling-custom-hook-for-auto-fetching-in-nextjs
// apps/web/src/lib/use-polling.ts

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function usePolling(ms: number, enabled = true) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => router.refresh(), ms);
    return () => clearInterval(id);
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps
  // NOTE: router is stable per Next.js docs; ms changes rarely — omit from deps
}

// Usage in order status page:
'use client';
export function OrderStatusPoller({ status }: { status: OrderStatus }) {
  // Stop polling once order is terminal
  const isTerminal = status === 'READY' || status === 'COMPLETED' || status === 'CANCELLED';
  usePolling(5000, !isTerminal); // Poll every 5 seconds until done
  return null; // Render nothing — just the side effect
}
```

### Pattern 5: Stripe Webhook Handler (Complete Phase 3 Implementation)

**What:** Replace the Phase 1 stub with full `payment_intent.succeeded` handling.
**When to use:** ORDR-06 — webhook is the SOLE trigger for RECEIVED status (INFR-02).

```typescript
// Source: https://dev.to/imzihad21/integrating-stripe-payment-intent-in-nestjs-with-webhook-handling-1n65
// apps/api/src/webhooks/stripe-webhook.controller.ts (replace stub)

switch (event.type) {
  case 'payment_intent.succeeded': {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) {
      this.logger.warn(`payment_intent.succeeded missing orderId metadata: ${paymentIntent.id}`);
      break;
    }
    await this.ordersService.markOrderReceived(orderId, paymentIntent.id);
    break;
  }
  case 'payment_intent.payment_failed': {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata?.orderId;
    if (orderId) {
      await this.ordersService.cancelOrder(orderId, 'payment_failed');
    }
    break;
  }
  default:
    this.logger.log(`Unhandled Stripe event: ${event.type}`);
}
```

### Pattern 6: Order Reference Code Generation

**What:** Short human-readable reference code using nanoid with uppercase alphanumeric alphabet.
**When to use:** ORDR-08 — every order gets a reference code at creation time.

```typescript
// apps/api/src/orders/orders.service.ts
import { customAlphabet } from 'nanoid';

const generateRef = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

// Usage at order creation:
const referenceCode = generateRef(); // e.g. "A7K2X9B4"
```

The `referenceCode` field already exists on the `Order` model with `@unique` constraint.

### Anti-Patterns to Avoid

- **Creating orders from client-side after confirmPayment:** The order in PENDING_PAYMENT state must be created BEFORE the PaymentIntent. The PaymentIntent stores the orderId in metadata. The webhook then updates the pre-created order to RECEIVED. Never create the order in the webhook — idempotency would be lost.
- **Using the `return_url` redirect as the fulfillment signal:** The CONTEXT and REQUIREMENTS explicitly prohibit this (INFR-02). The client may navigate away; use `payment_intent.succeeded` webhook exclusively.
- **Not scoping localStorage keys per venue:** `cart` as a key conflicts across venues. Always use `cart:${venueSlug}`.
- **Reading localStorage in Server Components:** localStorage is browser-only. All cart logic must be in Client Components or custom hooks with `typeof window !== 'undefined'` guards.
- **Polling on terminal order states:** Stop polling when status is READY/COMPLETED/CANCELLED to avoid unnecessary API calls.
- **Using `router` in useEffect deps for polling:** `useRouter` returns a stable reference in Next.js App Router — including it in deps causes no harm but is unnecessary; the pattern above omits it to match the canonical usePolling hook.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Payment UI with Apple Pay/Google Pay | Custom payment form | Stripe Payment Element | Stripe handles PCI compliance, wallet detection, 3DS authentication, card brand icons, error messages — hundreds of edge cases |
| Unique order reference codes | Custom random string | `nanoid` with `customAlphabet` | Cryptographically secure random; guaranteed URL-safe; proven collision resistance |
| Bottom sheet / drawer with swipe-to-close | Custom CSS drawer | shadcn Drawer (vaul) | Gesture physics, snap points, focus trap, accessibility — weeks of work |
| Webhook signature verification | Manual HMAC check | `stripe.webhooks.constructEvent()` | Stripe's implementation handles timing attacks, encoding edge cases |
| Cart persistence | Custom localStorage sync | `useLocalStorage` custom hook pattern | SSR hydration safety (window undefined guard), JSON parse errors, storage quota errors |

**Key insight:** The Stripe Payment Element eliminates the need to handle Apple Pay domain verification, Google Pay merchant registration, 3DS redirects, card validation, and PCI DSS requirements. It is not a nice-to-have — it is the only reasonable implementation path.

---

## Common Pitfalls

### Pitfall 1: Order Created After Payment (Wrong Sequence)

**What goes wrong:** Creating the order only after `payment_intent.succeeded` fires. If the webhook fails, retries, or arrives late, the customer sees a payment charge but no order in the system.
**Why it happens:** Intuitive but incorrect — "create order when we know payment succeeded."
**How to avoid:** Always create the Order record in `PENDING_PAYMENT` state BEFORE creating the PaymentIntent. Store `orderId` in PaymentIntent metadata. Webhook updates the existing record to `RECEIVED`.
**Warning signs:** Orders that show as paid in Stripe but don't exist in the DB.

### Pitfall 2: `payment_intent.id` vs `paymentIntentId` Mismatch

**What goes wrong:** The PaymentIntent ID returned by `confirmPayment` on the client (`pi_xxx`) is not stored on the order, so the webhook handler can't match `event.data.object.id` to an order.
**Why it happens:** Relying only on metadata `orderId` without also storing `paymentIntentId` on the Order record for backup reconciliation.
**How to avoid:** When creating the PaymentIntent, immediately update the Order record to store `paymentIntentId`. The `Order` model already has `paymentIntentId String? @map("payment_intent_id")` — populate it.
**Warning signs:** Webhook handler logs "found event but no matching order."

### Pitfall 3: localStorage Hydration Mismatch

**What goes wrong:** Server renders empty cart, client reads localStorage and shows items — React hydration mismatch error.
**Why it happens:** `useState` initializer reads localStorage, but server and client initial states differ.
**How to avoid:** Use `useEffect` to load cart from localStorage after mount, not in the `useState` initializer. Alternatively, initialize with `[]` and load in `useEffect`.

```typescript
// Safe pattern:
const [items, setItems] = useState<CartItem[]>([]); // Server-safe initial value
useEffect(() => {
  const stored = localStorage.getItem(key);
  if (stored) setItems(JSON.parse(stored));
}, [key]); // Load after mount
```

**Warning signs:** "Hydration failed" errors in browser console on the menu page.

### Pitfall 4: Stripe Not Initialized Before Render

**What goes wrong:** `useStripe()` returns `null` and calling `stripe.confirmPayment` throws.
**Why it happens:** The `Elements` provider hasn't loaded yet, or `loadStripe` is called inside a render cycle.
**How to avoid:** Call `loadStripe(publishableKey)` OUTSIDE the component (module level). Disable the Pay button while `!stripe || !elements`.

```typescript
// CORRECT — module level, not inside component:
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

**Warning signs:** "stripe is null" error in payment form handler.

### Pitfall 5: `rawBody` Stripe Webhook in NestJS

**What goes wrong:** Webhook signature verification fails with "No signatures found matching the expected signature for payload."
**Why it happens:** NestJS JSON body parser consumes the raw body before it reaches the controller, changing the byte stream Stripe signed.
**How to avoid:** `rawBody: true` is already set in `main.ts`. The controller uses `@Req() req: RawBodyRequest<Request>` and reads `req.rawBody`. Do NOT add `express.json()` middleware manually — it will disable rawBody.
**Warning signs:** Stripe webhook returns 400 "signature verification failed" on every call.

### Pitfall 6: Cart Items Not Matching DB MenuItem After Menu Changes

**What goes wrong:** Customer adds items to cart, venue owner deletes/edits those items, customer checks out with stale cart data.
**Why it happens:** Cart stores MenuItem snapshots (by ID) but the menu may change between add-to-cart and checkout.
**How to avoid (Claude's Discretion):** On checkout page load, validate cart items against the current menu API response. Filter out deleted items and show a warning. Prices in `OrderItem` are snapshotted at order creation (INFR-03) — use the current price at time of order, not the cart-cached price.
**Warning signs:** Customer pays for item that no longer exists; 404 on order item foreign key.

### Pitfall 7: Polling Continues After Order Reaches Terminal State

**What goes wrong:** `router.refresh()` called every 5 seconds even when order is COMPLETED/CANCELLED.
**Why it happens:** The `enabled` condition isn't checked against the current status.
**How to avoid:** Pass current `status` prop to the polling component; disable polling when status is terminal.
**Warning signs:** Network tab shows repeated API calls to order status endpoint after order completes.

### Pitfall 8: BOTH payment mode — choosing which flow to show

**What goes wrong:** Venue has `paymentMode: BOTH` and checkout page doesn't know which flow to show.
**How to avoid:** Show a payment method choice to the customer: "Pay now" (Stripe flow) vs "Pay at counter" (PAC flow). This is a Claude's Discretion item — implement as two radio buttons on the checkout page.

---

## Code Examples

### Create Order API Endpoint (NestJS)

```typescript
// Source: pattern derived from existing venues.controller.ts structure
// apps/api/src/orders/orders.controller.ts

@Controller('public/venues/:slug')
export class OrdersController {
  // No @UseGuards — this is a public controller

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Param('slug') slug: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(slug, dto);
  }

  @Get('orders/:orderId')
  async getOrderStatus(
    @Param('slug') slug: string,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.findPublic(orderId, slug);
  }

  @Post('orders/:orderId/payment-intent')
  async createPaymentIntent(
    @Param('orderId') orderId: string,
  ) {
    // Returns { clientSecret: string }
    return this.ordersService.createPaymentIntent(orderId);
  }
}
```

### Create Order DTO (NestJS)

```typescript
// CreateOrderDto — validated in service layer
export interface CreateOrderDto {
  customerName: string;            // Required — customer's name
  paymentMethod: 'STRIPE' | 'PAY_AT_COUNTER';
  items: Array<{
    menuItemId: string;            // UUID
    quantity: number;              // Positive integer
  }>;
}
```

### Public Menu API Endpoint (NestJS)

```typescript
// GET /api/public/venues/:slug/menu
// Returns venue info + categories + items (sorted, available only for customer display)
@Get('menu')
async getMenu(@Param('slug') slug: string) {
  return this.publicMenuService.getMenuBySlug(slug);
}

// Service fetches:
// venue (by slug, include paymentMode)
// categories (sorted by sortOrder, include items sorted by sortOrder)
// Note: include ALL items; client dims unavailable ones (locked decision)
```

### floatingCartButton Component (Next.js Client Component)

```tsx
// apps/web/src/components/ordering/cart-button.tsx
'use client';
export function CartButton({ itemCount, total, onClick }: Props) {
  if (itemCount === 0) return null; // Hidden when empty — Claude's discretion choice

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                 bg-black text-white rounded-full px-6 py-3
                 shadow-xl flex items-center gap-3"
    >
      <span className="bg-white text-black rounded-full w-6 h-6
                       flex items-center justify-center text-sm font-bold">
        {itemCount}
      </span>
      <span>View Cart</span>
      <span className="font-semibold">£{total.toFixed(2)}</span>
    </button>
  );
}
```

### Order Status Progress Steps (Next.js Server Component)

```tsx
// apps/web/src/components/ordering/order-status.tsx
// Server Component portion — receives status from server fetch
const STEPS: Array<{ status: OrderStatus; label: string }> = [
  { status: 'RECEIVED',  label: 'Order Received' },
  { status: 'PREPARING', label: 'Preparing' },
  { status: 'READY',     label: 'Ready for Collection' },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  PENDING_PAYMENT: -1,
  RECEIVED: 0,
  PREPARING: 1,
  READY: 2,
  COMPLETED: 3,
  CANCELLED: -1,
};
```

### Next.js Middleware (Update for Public Routes)

The existing middleware matcher only covers `/dashboard/:path*` and `/venues/:path*`. New `/menu/:path*` routes are already excluded by the matcher — no middleware change needed.

```typescript
// apps/web/src/middleware.ts — current matcher (NO CHANGE NEEDED):
export const config = {
  matcher: ['/dashboard/:path*', '/venues/:path*'],
};
// /menu/[slug]/... is NOT in the matcher — middleware never runs for public routes
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Stripe Card Element (single card field) | Stripe Payment Element (unified multi-method) | 2021, stable since | One component handles cards, Apple Pay, Google Pay, Link |
| Separate PaymentRequestButton for wallets | Automatic via Payment Element with `automatic_payment_methods` | 2022 | No separate wallet integration needed |
| Redirect-based payment confirmation | `redirect: 'if_required'` in confirmPayment | 2022 | Cards confirm in-place; only redirect-based methods redirect |
| Polling with external fetch in useEffect | `router.refresh()` in interval | Next.js 13+ App Router | Server Component re-renders without external data library |
| `localStorage` read in `useState` initializer | `useEffect` load after mount | React 18 SSR hydration rules | Avoids hydration mismatch |

**Deprecated/outdated:**
- `stripe.confirmCardPayment()`: Use `stripe.confirmPayment()` with PaymentElement instead — handles all payment types
- Stripe Checkout redirect: For embedded checkout, use Stripe Payment Element with `ui_mode: 'custom'` or PaymentIntents
- Next.js `getServerSideProps` for polling: Use `router.refresh()` with App Router Server Components

---

## Open Questions

1. **Currency for Stripe PaymentIntents**
   - What we know: The `Order.totalAmount` is stored as Decimal. Stripe requires amount in smallest unit (cents/pence). No currency field on Venue model yet.
   - What's unclear: What currency should the app use? The Venue model has no currency field.
   - Recommendation: Default to GBP for v1 (UK market implied by "Pay when you collect" style). Add `NEXT_PUBLIC_STRIPE_CURRENCY=gbp` to env. Planner should create a task to add currency env var.

2. **PaymentMode: BOTH — Checkout Page UX**
   - What we know: Venue `paymentMode` can be `PREPAY_REQUIRED`, `PAY_AT_COUNTER`, or `BOTH`. The locked decisions only describe the prepay and PAC flows.
   - What's unclear: When `BOTH`, should the customer choose? Or should the venue choose a default?
   - Recommendation (Claude's Discretion): Show a simple choice on checkout page — "Pay now (card/Apple Pay/Google Pay)" vs "Pay at counter". Default selection can be `PREPAY_REQUIRED`.

3. **Stripe Environment Variables in Next.js**
   - What we know: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` needed on client (exposed via `NEXT_PUBLIC_` prefix). `STRIPE_SECRET_KEY` already in `apps/api/.env`.
   - What's unclear: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` needs to be in `apps/web/.env.local` — planner should note this as env setup task.
   - Recommendation: Document required env vars clearly in Wave 0.

4. **Stripe Webhook Endpoint URL in Production**
   - What we know: The webhook handler lives in NestJS (Railway). Stripe dashboard must be configured to send events to `https://[railway-url]/api/webhooks/stripe`.
   - What's unclear: Local development testing needs `stripe listen --forward-to localhost:3001/api/webhooks/stripe` (Stripe CLI).
   - Recommendation: Planner should include a task for Stripe CLI local dev setup instructions.

---

## Sources

### Primary (HIGH confidence)
- Stripe official docs: https://docs.stripe.com/payments/quickstart — PaymentIntent + Payment Element + React integration pattern
- Stripe official docs: https://docs.stripe.com/elements/express-checkout-element — Express Checkout Element for wallets
- Stripe official docs: https://docs.stripe.com/payments/payment-element — Payment Element overview and wallet support
- shadcn/ui Drawer docs: https://ui.shadcn.com/docs/components/radix/drawer — Drawer installation and usage
- shadcn/ui Sheet docs: https://ui.shadcn.com/docs/components/radix/sheet — Sheet side prop
- NestJS Guards docs: https://docs.nestjs.com/guards — @Public() decorator pattern
- Dave Gray usePolling: https://www.davegray.codes/posts/usepolling-custom-hook-for-auto-fetching-in-nextjs — router.refresh() polling hook
- Existing project: `apps/api/src/main.ts` — rawBody: true already enabled
- Existing project: `apps/api/src/webhooks/stripe-webhook.stub.ts` — stub to complete
- Existing project: `apps/web/src/middleware.ts` — matcher already excludes public routes
- Existing project: `apps/api/prisma/schema.prisma` — Order/OrderItem models already defined

### Secondary (MEDIUM confidence)
- DEV Community (imzihad21): https://dev.to/imzihad21/integrating-stripe-payment-intent-in-nestjs-with-webhook-handling-1n65 — NestJS + Stripe webhook switch/case pattern, confirmed against Stripe docs
- Stripe webhook handling events: https://docs.stripe.com/webhooks/handling-payment-events — payment_intent.succeeded webhook pattern

### Tertiary (LOW confidence)
- nanoid customAlphabet for referenceCode — derived from nanoid README pattern; verified sufficient for 8-char codes at food ordering scale
- Polling interval 5 seconds — no authoritative source; reasonable default for order tracking UX

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Stripe npm package versions verified from npm registry; shadcn docs confirmed
- Architecture: HIGH — Based on existing project patterns + official NestJS/Next.js docs
- Stripe integration: HIGH — Official Stripe quickstart docs consulted; webhook stub already in codebase
- Pitfalls: HIGH — Several derived from existing project decisions (rawBody, INFR-02, INFR-03)
- Polling: MEDIUM — router.refresh() pattern confirmed from Next.js docs and usePolling blog post; router.refresh() issue in Next.js 15 mentioned in one issue but not confirmed as blocking

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (Stripe API versions are stable; Next.js 15 App Router patterns stable)
