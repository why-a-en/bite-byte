# Pitfalls Research

**Domain:** QR code food ordering platform (multi-tenant, real-time, Stripe payments)
**Researched:** 2026-03-02
**Confidence:** MEDIUM-HIGH (multiple sources; payment and WebSocket pitfalls verified against official docs and post-mortems)

---

## Critical Pitfalls

### Pitfall 1: Payment State Driven by Client, Not Webhook

**What goes wrong:**
The frontend or backend trusts the payment result returned from Stripe's client-side redirect or the `confirmPayment` response to mark an order as paid. This works in the happy path but silently fails when the network drops, the browser tab is closed, or a race condition occurs between the redirect and the database write.

**Why it happens:**
Developers build the "it worked!" flow first — the redirect URL returns `payment_intent_status=succeeded`, so they mark the order paid. Webhooks feel like an edge case. In reality, webhooks are the only reliable signal.

**How to avoid:**
Never mark an order as paid until the `payment_intent.succeeded` webhook is received and verified. The checkout flow should create the order in `pending_payment` state. Only the webhook handler promotes it to `paid`. The customer-facing order tracking page polls or subscribes to real-time status — it does not trust the redirect URL as confirmation.

**Warning signs:**
- Order confirmation logic lives in a redirect handler, not a webhook handler
- No `stripe_event_id` column exists for idempotency tracking
- The happy-path works but test cases for failed redirects are absent

**Phase to address:**
Payment integration phase — model the `pending_payment` → `paid` transition in the order state machine before writing a single line of Stripe SDK code.

---

### Pitfall 2: Non-Idempotent Webhook Handler (Duplicate Order Processing)

**What goes wrong:**
Stripe retries webhook delivery for up to 72 hours on non-200 responses. If your handler takes too long (over 20 seconds) or crashes after processing but before responding, Stripe retries. Without idempotency checks, the handler runs twice: two orders get fulfilled, two confirmation emails get sent, or two kitchen tickets print.

**Why it happens:**
Developers handle the business logic synchronously in the webhook handler and return 200 only after all processing is done. The handler times out under load. Stripe retries. The second invocation has no guard.

**How to avoid:**
1. Return 200 immediately after signature verification — within the 20-second window Stripe requires.
2. Enqueue the event to a background job (a simple `orders_events` table or a queue) for actual processing.
3. Store each `stripe_event_id` in the database with a unique constraint. Before processing, check if the ID already exists. If it does, skip processing and return 200.

**Warning signs:**
- Webhook handler contains `await sendConfirmationEmail(...)` or similar blocking calls before returning
- No `processed_stripe_events` table or equivalent deduplication store
- Integration tests only cover the success path, never the "same event arrives twice" scenario

**Phase to address:**
Payment integration phase — build idempotency into the webhook handler from day one. Adding it after the fact requires auditing historical duplicate events.

---

### Pitfall 3: Multi-Tenant Data Leak via Missing or Bypassed Tenant Scoping

**What goes wrong:**
A venue owner authenticates and requests orders. The query returns orders from all venues because the `WHERE venue_id = ?` clause was omitted from one service method. With PostgreSQL row-level security (RLS), the same leak happens if the session variable `app.current_tenant` is not set before every query — especially in connection-pooled environments.

**Why it happens:**
With a shared-schema multi-tenant approach, tenant scoping is a developer responsibility on every query. In a large codebase, one missing `WHERE venue_id = ?` in a new endpoint is all it takes. Connection pools (PgBouncer) reuse connections; if the previous request set `app.current_tenant` to venue A and the next request forgets to overwrite it, RLS policies read the wrong tenant context.

**How to avoid:**
- Never rely on application-layer scoping alone. Use PostgreSQL RLS with policies on every tenant-data table that enforce `venue_id = current_setting('app.current_tenant')::uuid`.
- Add `FORCE ROW LEVEL SECURITY` to tables so even the table owner is subject to policies.
- In NestJS, set `app.current_tenant` in a middleware/interceptor at the start of every request, before any query runs. Use `SET LOCAL` (not `SET`) so the value is scoped to the transaction and cannot bleed across pooled connections.
- Write integration tests that prove venue A's token cannot retrieve venue B's orders.

**Warning signs:**
- Tenant context set only in some service methods, not in a central interceptor
- No RLS policies on new tables added after initial setup
- The app role has `BYPASSRLS` or `SUPERUSER` privileges
- Integration tests only use one tenant; cross-tenant access is never tested

**Phase to address:**
Core data model / multi-tenancy foundation phase — set up RLS before writing any business logic. Retrofit is painful and risky.

---

### Pitfall 4: WebSocket State Lost on Reconnection — Kitchen Misses Orders

**What goes wrong:**
The venue's kitchen display loses its WebSocket connection (mobile network hiccup, server restart, Railway deploy). When it reconnects, it re-subscribes but has no mechanism to receive events it missed during the gap. Orders that came in during the disconnection are invisible until page refresh. In a busy service, this means missed orders.

**Why it happens:**
Socket.IO / WebSocket libraries reconnect automatically, which feels like it solved the problem. But reconnection establishes a new connection — it does not replay missed events. The client's state is stale without knowing it.

**How to avoid:**
- On reconnect, the client fetches current order state via REST (a `GET /orders?status=pending,preparing&since=<last_seen_timestamp>`) before trusting the live WebSocket feed.
- Alternatively, store a last-seen event sequence number on the client; on reconnect, request a replay from that sequence number.
- Never design the kitchen display to be purely WebSocket-driven. REST is the source of truth; WebSocket is the update accelerator.

**Warning signs:**
- The venue dashboard fetches orders once on mount and then only listens to WebSocket events
- No reconnection handler that re-fetches current state
- Local testing never simulates a disconnect-reconnect cycle

**Phase to address:**
Real-time / WebSocket phase — build the hybrid REST+WebSocket pattern from the first implementation.

---

### Pitfall 5: Vercel + WebSockets Architectural Mismatch

**What goes wrong:**
The NestJS WebSocket gateway is deployed on Railway (correct). But if any developer tries to move WebSocket handling to a Next.js API route or Vercel function, it silently fails — Vercel serverless functions do not support persistent WebSocket connections. The timeout is enforced at the infrastructure level, not surfaced clearly in development.

**Why it happens:**
The architecture is clear in planning but under pressure to ship, someone adds a quick "WebSocket endpoint" in a Next.js API route. It works locally (Next.js dev server supports it) but breaks on Vercel.

**How to avoid:**
- All WebSocket/Socket.IO code lives exclusively in the NestJS backend on Railway.
- Next.js communicates with the NestJS backend — it never owns WebSocket connections.
- Document this constraint explicitly in the repo (ADR or README) so future contributors don't move WS logic to Next.js.
- Vercel's "Fluid Compute" extends function duration to 800s but still does not support true bidirectional WebSockets (as of early 2026).

**Warning signs:**
- A `socket.io` or `ws` import appears in `apps/web/app/api/` routes
- Local dev works but production Vercel deploy shows connection errors for real-time features

**Phase to address:**
Architecture/infrastructure setup phase — enforce the NestJS-only WebSocket boundary in the initial project structure before any feature code is written.

---

### Pitfall 6: Order Items Store Reference Price, Not Snapshot Price

**What goes wrong:**
Order items store a foreign key to the `menu_items` table without snapshotting the price at time of order. A venue owner edits a menu item's price. All historical `order_items` now show the new price when queried. Revenue reports are wrong. A customer disputes a charge because the receipt shows a different amount than they paid.

**Why it happens:**
Normalizing the schema feels correct — "don't duplicate data." The price change scenario is not considered until a real price change breaks production reporting.

**How to avoid:**
The `order_items` table must store `unit_price_at_order` (decimal, not a foreign key to current price). Also store `item_name_at_order` because items can be renamed or deleted. The current `menu_items` record is for reference; the `order_items` snapshot is the financial record.

Schema:
```sql
order_items (
  id uuid primary key,
  order_id uuid references orders(id),
  menu_item_id uuid references menu_items(id),  -- for analytics linkage only
  item_name_at_order text not null,              -- snapshot
  unit_price_at_order numeric(10,2) not null,   -- snapshot
  quantity integer not null,
  ...
)
```

**Warning signs:**
- `order_items` has `menu_item_id` but no `unit_price_at_order` column
- Order total is computed at query time by joining to current `menu_items.price`
- No test for "change menu price after order is placed, verify historical order total is unchanged"

**Phase to address:**
Core data model phase — correct this in initial schema design. Migration after orders exist is painful.

---

### Pitfall 7: Menu Schema Too Rigid to Accommodate Modifiers Later

**What goes wrong:**
The initial schema models menu items as flat rows with no extensibility hook. When modifiers are needed (size options, add-ons, dietary flags), the entire order and cart data model must be refactored, including historical order data.

**Why it happens:**
"We're deferring modifiers to v2" leads to designing a schema that actively prevents them. The constraint is not "we won't build modifiers" but "the schema must not break when we do."

**How to avoid:**
Use a JSONB `metadata` column on `menu_items` for unstructured extensibility now. Leave room for a `modifier_groups` table join in the schema design even if unpopulated in v1. The `order_items` table can have a JSONB `selected_modifiers` column (empty array in v1).

This costs zero implementation effort in v1 and avoids a breaking schema migration later.

**Warning signs:**
- `order_items` has no column to record customizations (even if empty)
- `menu_items` has no extensibility hook
- Data model docs say "modifiers are v2" without noting schema implications

**Phase to address:**
Core data model phase — plan for extensibility in schema, even if not implemented in v1 UI.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Trust client-side payment status instead of webhook | Faster to build | Silent payment failures, double-charging, financial discrepancy | Never |
| No idempotency on webhook handler | Simpler code | Duplicate order fulfillment under retry load | Never |
| Skip `venue_id` WHERE clause on one endpoint | Faster feature dev | Cross-tenant data leak, potential legal liability | Never |
| WebSocket-only kitchen display (no REST fallback) | Simpler state management | Missed orders on reconnect, silent data staleness | Never |
| Reference price instead of snapshot price on order items | Normalized schema | Broken financial history, revenue reports | Never |
| Use static (hardcoded URL) QR codes | No QR generation complexity | Printed codes cannot be updated; reprinting required for any URL change | Only if self-hosted QR pointing to a permanent URL pattern |
| Defer connection pooling setup | Faster initial dev | PostgreSQL exhausts connections under modest concurrent load | Acceptable until first load test; add before production |
| Skip RLS, rely on application scoping only | Simpler initial code | Any query that forgets WHERE clause leaks data | Acceptable for single-tenant prototype only |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Stripe | Using test API keys in production (or vice versa) | Separate `.env.test` and `.env.production`; validate key prefix (`sk_test_` vs `sk_live_`) at startup |
| Stripe | Creating a new PaymentIntent on retry instead of reusing the existing one | Store PaymentIntent ID on the order record; on retry, retrieve and reuse it |
| Stripe | Processing webhook events synchronously before returning 200 | Return 200 immediately after signature verification; enqueue for async processing |
| Stripe | Not verifying webhook signatures | Always use `stripe.webhooks.constructEvent(body, sig, secret)` — reject anything that fails |
| Stripe | Storing card data | Never store cards; use Stripe Elements / Payment Element; store only Stripe IDs |
| Socket.IO (NestJS) | Single server instance in production with horizontal scale | Requires Redis adapter (`@socket.io/redis-adapter`) for multi-instance message broadcast |
| Socket.IO (NestJS) | No sticky sessions behind load balancer | WebSocket connections must hit the same server instance; configure sticky sessions or use Redis adapter |
| PostgreSQL + PgBouncer | Using `SET` instead of `SET LOCAL` for tenant context | `SET LOCAL` scopes the variable to the current transaction; `SET` persists for the connection lifetime, leaking across pooled connections |
| PostgreSQL + PgBouncer | Prisma creating unbounded connections in clustered mode | Set `connection_limit` in Prisma connection string; size pool based on PgBouncer's `max_client_conn` |
| QR code generation | Generating QR codes that point to absolute hardcoded URLs | Point QR codes to a URL pattern like `/order/<venue-slug>` that resolves dynamically; allows domain changes without reprinting |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 queries in order list endpoints | Venue dashboard slows down as order count grows; DB CPU spikes on menu pages | Use joins or eager loading; audit all list endpoints with query logging | ~50 concurrent venue dashboard users |
| No database connection pool | "too many connections" errors under load; Railway Postgres crashes | Configure PgBouncer or set ORM connection limits appropriate to Railway's Postgres tier | ~20+ concurrent requests |
| Broadcasting all WebSocket events to all connected clients | High bandwidth consumption; irrelevant updates trigger client re-renders | Scope rooms by `venue_id`; kitchen display subscribes only to its venue's room | ~10+ active venues simultaneously |
| Fetching full menu on every cart update | Slow cart interactions; excessive DB reads | Cache menu in memory/Redis with venue_id key; invalidate on menu edit | Menus with 50+ items, multiple concurrent customers |
| Storing QR code images in the database (as blobs) | Large database size; slow QR endpoint responses | Generate QR codes on-demand server-side or store in object storage; never in DB | First venue with high-scan volume |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing Stripe secret key in frontend code | Complete account compromise — attacker can issue refunds, read customer data, cancel subscriptions | Stripe secret key lives only in NestJS backend; Next.js receives only Stripe publishable key and client secrets |
| No webhook signature verification | Attacker posts fake payment success events; free orders | Always call `stripe.webhooks.constructEvent()` with the raw request body and endpoint secret |
| Missing authorization check on order status update | Customer marks their own order as "completed" | Order status updates (except cancellation by customer) require venue owner authentication and venue ownership check |
| Serving another venue's menu via venue ID enumeration | Menu and pricing data exposure across venues | Validate that the requested `venue_id` matches an active, public venue; use UUIDs not sequential IDs |
| No rate limiting on QR scan / order creation endpoint | Spam orders; DoS against kitchen display | Rate limit order creation by IP; add CAPTCHA if abuse detected |
| Storing any PII in QR code payload | GDPR/privacy exposure embedded in printed materials | QR codes contain only the venue URL slug — no user data, no session tokens |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Requiring account creation before ordering | Up to 40% of users abandon at registration gate | Default to guest checkout; offer "save your order history" account creation as a post-order option |
| Slow initial menu load over mobile data (no optimization) | Customers put phone down before menu renders; "QR doesn't work" complaints | Optimize images (WebP, responsive sizes); SSR or static generation for menu page; target <2s LCP on 4G |
| No indication that order was received by kitchen | Customer re-submits order thinking it failed | Show an immediate order ID confirmation screen; real-time status updates via WebSocket |
| Single long scrolling menu without categories | Customers can't find items; poor experience with 20+ items | Sticky category navigation; anchor links to sections |
| Payment error with no recovery path | Customer's card declined → dead end → abandons | Show specific Stripe decline reason (when available); allow retry with different card without re-entering order |
| Mobile viewport issues on iOS Safari (100vh includes bottom bar) | Order button hidden behind Safari's bottom bar | Use `min-height: 100dvh` (dynamic viewport) instead of `100vh`; test on real iOS Safari, not just Chrome |
| No visual feedback on item add to cart | Customer adds item, unsure if it registered; taps again | Immediate cart animation/count increment; optimistic UI updates |

---

## "Looks Done But Isn't" Checklist

- [ ] **Payment flow:** Has the `payment_intent.succeeded` webhook been tested — not just the happy-path redirect? Verify an order only becomes `paid` via webhook, never via redirect URL.
- [ ] **Webhook idempotency:** Send the same webhook event twice. Does the system process it once? Is there a duplicate-prevention mechanism?
- [ ] **Multi-tenant isolation:** Can a token for venue A retrieve orders for venue B? Run a cross-tenant access test before marking auth complete.
- [ ] **WebSocket reconnection:** Kill the NestJS server while the kitchen display is connected. Does it reconnect and show current order state, or does it show a stale snapshot?
- [ ] **Price snapshot:** Change a menu item's price. Do historical orders show the original price? Check the order detail view AND any revenue analytics.
- [ ] **iOS Safari mobile:** Test the full order flow on a real iPhone in Safari. Check for viewport issues, payment sheet rendering, camera permissions for QR scanner.
- [ ] **Stripe live keys:** Is the production deployment using `sk_live_` keys? Is the webhook endpoint secret the live secret (not the test secret)?
- [ ] **Tenant context in pooled connections:** After adding PgBouncer, does a request to `/orders` always return only the authenticated venue's orders? Test with concurrent requests.
- [ ] **Order item snapshot:** Is `item_name_at_order` and `unit_price_at_order` populated at order creation time — not computed at query time via JOIN?
- [ ] **QR code URL format:** If the domain or URL structure changes, can existing printed QR codes still route correctly? (They should point to a permanent slug pattern.)

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong payment source of truth (client-side) | HIGH | Audit orders with `status=paid` but no confirmed webhook event; manually reconcile against Stripe dashboard; rewrite payment flow |
| Non-idempotent webhook handler (duplicate orders exist) | HIGH | Identify duplicate orders in DB via Stripe event ID matching; issue refunds for duplicates; add idempotency guards; notify affected customers |
| Cross-tenant data leak discovered in production | HIGH | Immediately restrict access; audit access logs for scope of leak; notify affected venues; add RLS policies; may require regulatory reporting |
| Order items without price snapshot | MEDIUM | Backfill `unit_price_at_order` from Stripe PaymentIntent line items for existing orders; add column and populate going forward |
| WebSocket-only kitchen display misses orders | MEDIUM | Add REST polling fallback as temporary measure; implement reconnect+fetch pattern; no data loss if orders exist in DB |
| Vercel WebSocket deployment failure | LOW | Move any accidentally-deployed WS routes to NestJS; Vercel deployment continues serving Next.js normally |
| Static QR codes after URL change | LOW | Generate new QR codes pointing to the new URL; reprint; existing codes point to redirects if old URL is maintained |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Payment state driven by client | Payment integration phase | Integration test: simulate redirect without webhook → order stays `pending_payment` |
| Non-idempotent webhook handler | Payment integration phase | Test: send identical Stripe event twice → only one order processed |
| Cross-tenant data leak | Core data model / auth phase | Security test: cross-tenant API call with valid token → 403 or empty result |
| WebSocket state lost on reconnect | Real-time / WebSocket phase | Test: disconnect WS mid-session, reconnect → current order state visible without page refresh |
| Vercel + WebSocket mismatch | Architecture/infrastructure phase | CI check: no `ws`/`socket.io` imports in `apps/web/api/` routes |
| Order item reference price | Core data model phase | Test: update menu price, verify historical order total unchanged |
| Menu schema too rigid | Core data model phase | Schema review: `order_items` has `selected_modifiers` column; `menu_items` has JSONB hook |
| iOS Safari viewport issues | Frontend/mobile phase | Manual test on real iOS Safari; automated visual regression if possible |
| No price at order item level | Data model phase | Query: `SELECT unit_price_at_order FROM order_items` — column must exist and be populated |
| Missing PgBouncer tenant context leak | Infrastructure / deployment phase | Load test with concurrent multi-tenant requests; verify no cross-tenant bleed |

---

## Sources

- [Common Mistakes Developers Make When Using Stripe — MoldStud](https://moldstud.com/articles/p-common-mistakes-developers-make-when-using-stripe-payment-processing-avoid-these-pitfalls) — MEDIUM confidence (industry article, consistent with official Stripe docs)
- [Handling Payment Webhooks Reliably — Medium](https://medium.com/@sohail_saifii/handling-payment-webhooks-reliably-idempotency-retries-validation-69b762720bf5) — MEDIUM confidence
- [Stripe Webhooks Official Documentation](https://docs.stripe.com/webhooks) — HIGH confidence
- [Stripe PaymentIntents Lifecycle](https://docs.stripe.com/payments/paymentintents/lifecycle) — HIGH confidence
- [Stripe: Nobody Likes Being Charged Twice](https://stripe.dev/blog/because-nobody-likes-being-charged-twice) — HIGH confidence (official Stripe engineering blog)
- [Multi-Tenant Data Isolation with PostgreSQL RLS — AWS](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/) — HIGH confidence
- [Postgres RLS Implementation Guide — permit.io](https://www.permit.io/blog/postgres-rls-implementation-guide) — MEDIUM confidence
- [NestJS WebSockets at Scale — Medium](https://medium.com/@hadiyolworld007/nestjs-websockets-at-scale-real-time-without-the-chaos-01547e01f124) — MEDIUM confidence
- [Vercel Serverless Functions and WebSockets — Vercel KB](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections) — HIGH confidence
- [From Polling to WebSockets: Wolt Engineering](https://careers.wolt.com/en/blog/engineering/from-polling-to-websockets-improving-order-tracking-user-experience) — HIGH confidence (production post-mortem from food delivery company)
- [PWA on iOS — Current Status — BrainHub](https://brainhub.eu/library/pwa-on-ios) — MEDIUM confidence
- [Railway Database Connection Pooling](https://blog.railway.com/p/database-connection-pooling) — HIGH confidence (official Railway docs)
- [A Restaurant Delivery Data Model — Redgate](https://www.red-gate.com/blog/a-restaurant-delivery-data-model) — MEDIUM confidence
- [QR Code Payment What Restaurants Get Wrong — sundayapp.com](https://sundayapp.com/qr-code-payment-what-most-restaurants-still-get-wrong/) — MEDIUM confidence (industry operator perspective)
- [Next.js Hydration Errors — Official Docs](https://nextjs.org/docs/messages/react-hydration-error) — HIGH confidence

---
*Pitfalls research for: QR code food ordering platform (Bite Byte)*
*Researched: 2026-03-02*
