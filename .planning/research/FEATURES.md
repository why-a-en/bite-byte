# Feature Research

**Domain:** QR code food ordering platform (multi-venue, mobile-web, dine-in/pickup)
**Researched:** 2026-03-02
**Confidence:** MEDIUM (WebSearch-verified across multiple industry sources; competitor feature sets cross-confirmed)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

#### Customer-Facing

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| QR code scan to menu (no app, no account) | Industry standard since 2020; 70%+ of restaurants use QR menus; any friction here kills the product | LOW | Static HTML served at venue slug; mobile-browser-first; no redirect chains |
| Browse menu organized by category | Every digital menu does this; absence feels broken | LOW | Categories with images and descriptions; category anchors for fast scroll |
| Item detail view with photo and description | Customers want to know what they're ordering; high-quality food photography drives +15-20% AOV | LOW | Photo, name, description, price — modifiers deferred to v2 |
| Cart building with quantity adjustment | Users expect to review and modify before ordering | LOW | Persist cart in local storage; survive page refresh |
| Guest checkout (no account required) | Forced account creation is the #1 abandonment cause in e-commerce; QR ordering specifically must be frictionless | LOW | Guest checkout as default; account creation optional after order |
| Place order and receive confirmation | Core transaction loop; without this there is no product | MEDIUM | Order confirmed on screen; optionally via SMS or email |
| Real-time order status tracking | Expected by 2026; customers want to know "is my food being made?" | MEDIUM | Pending → Preparing → Ready; WebSocket push to customer order page |
| Online payment via card / Apple Pay / Google Pay | 61% of consumers already use QR-powered payments; not offering payment = major drop-off for prepay venues | MEDIUM | Stripe PaymentIntent + Stripe.js; Apple/Google Pay via Payment Request API |
| Pay at counter option | Many venues (especially food trucks) prefer cash or counter payment | LOW | Venue-configurable; show "pay at counter" path if enabled |
| Order status visible after page close | Users close browser and return; losing status is frustrating | MEDIUM | Persist order ID in localStorage; re-fetch status on return to order URL |

#### Venue Owner Dashboard

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Real-time incoming order view | The core operational loop; without this owners can't run the venue | MEDIUM | WebSocket push; sound/visual alert on new order; persistent order list |
| Order status management (received → preparing → ready → completed) | Operators need to communicate kitchen progress to customers | LOW | Status updates propagate to customer order tracking in real-time |
| Menu management (add/edit/remove items) | Menu changes constantly (prices, availability, specials); must be self-serve | MEDIUM | CRUD for items; toggle item availability without deleting; drag-sort categories |
| Category management | Grouping items is universal; "no categories" feels amateur | LOW | Create/reorder/delete categories; assign items |
| Item photo upload | Visual menus convert better; text-only menus feel incomplete | MEDIUM | Image upload + CDN storage; resize/optimize on ingest |
| QR code generation and download | Owners need to print QR codes for signage; this is literally how customers access the product | LOW | Generate PNG/SVG; link to venue URL slug; re-generate doesn't break existing codes |
| Item availability toggle (86'ing) | Out-of-stock items visible to customers = cancelled orders and complaints; real-time sync critical | LOW | Toggle per-item; customers see "unavailable" not the item removed |
| Venue settings (name, logo, payment preference) | Basic business identity; configuring prepay vs pay-at-counter is core | LOW | Business name, logo, slug, payment mode, operating hours |
| Order history (completed orders) | Owners review what was sold; baseline accountability | LOW | Paginated list; filter by date; show totals |
| Basic sales analytics | Owners make menu decisions based on what sells; even minimal data is valuable | MEDIUM | Revenue today/this week; top-selling items; order volume over time |

---

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Sub-60 second scan-to-order UX | Core value prop from PROJECT.md; most competitors have bloat (popups, loyalty prompts, upsells) that slow down the first order | MEDIUM | Ruthless optimization of the critical path; no signup modal, no push notification prompt, no interstitial; measure time from QR scan to order confirmed |
| No platform fees (flat/zero commission model) | Small venues hate percentage-of-sale fees (Toast, Sunday, etc. take 1-3%); positioning as "your platform, your revenue" is a real differentiator | LOW | Business model decision, not a feature — but informs pricing page messaging |
| Food-truck-first design (no table numbers required) | Most competitors assume fixed tables; food trucks and pop-ups are underserved; single-venue QR with no table assignment works for any format | LOW | Venue QR links to /order/:venueSlug; no table-ID in the flow v1 |
| Configurable payment flow per venue | Some venues want prepay (food trucks); others want pay-at-counter (fine dining); most platforms pick one model | LOW | Setting in venue config; customer sees the right flow for their venue |
| Customer account for reordering (optional) | Returning customers can reorder in one tap; reduces friction for regulars | MEDIUM | Account creation post-order ("save your order?"); stores past orders; autofill on next visit |
| Live order dashboard with sound alerts | Many competitor dashboards require manual refresh; WebSocket push with audible alert prevents missed orders — a real pain point for busy venues | MEDIUM | Browser notification + audio alert on new order; mobile-responsive dashboard for phone-based venues |
| Lightweight onboarding (venue live in under 10 min) | SaaS restaurant tools are notoriously hard to set up; winning on simplicity is achievable | LOW | Guided setup flow: create venue → add items → download QR; no required POS integration |
| Multi-venue management under one account | Restaurant groups or owners with multiple locations (food trucks at different spots) want one login | MEDIUM | Tenant isolation per venue; owner account scoped to N venues |

---

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Table-specific QR codes (v1) | Seems like table service standard | Adds significant complexity (table state, order routing per table, merge checks); useless for food trucks; not needed to validate core ordering loop | One QR per venue v1; add table-scoped QRs in v2 after validating demand |
| Menu item modifiers / customization (v1) | Customers want to customize orders (no onions, extra sauce) | Explodes UI/UX complexity (required vs optional modifiers, nested groups, pricing logic, kitchen display rendering); 30% of edge cases require extensive testing | Build extensible data model that supports modifiers but don't surface UI until v2; use "special instructions" free-text field as pressure valve |
| Loyalty/rewards program | Every food app has points; venues ask for it | Requires customer accounts, complex points logic, redemption flows, potential regulatory considerations; no clear winner until product-market fit established | Defer to v2+; design customer account schema to accommodate loyalty later |
| Delivery/logistics | Customers ask "can I get delivery?" | Completely different operational model (driver dispatch, zones, ETAs); out of scope and would dilute focus | Pickup/dine-in only; clearly communicate scope |
| SMS/push order notifications to customers | "Let me know when my food is ready" is a natural ask | SMS costs money per message; push notifications require service workers and permission flows; adds ops complexity; in-venue customers can just watch the screen | Real-time status visible in browser tab; customers keep browser open; revisit SMS for v2 with venue funding |
| AI upselling / smart recommendations | Trendy, cited in industry research | Requires purchase history data (chicken-and-egg), adds latency, can feel manipulative; empty data = useless recommendations | Manual "featured items" section controlled by venue owner — same outcome, zero ML complexity |
| Multi-language support (v1) | Venues in diverse cities want it | Doubles all content management complexity; UI layout challenges with RTL languages; no data suggesting this is blocking adoption for target venues | English-only v1; design i18n architecture (next-intl) for v2 readiness |
| Full POS integration | Enterprise venues expect POS sync | Webhook-based POS integrations are notoriously fragile, vendor-specific, and require long certification cycles; not needed for small venues that are the target market | Venues run Bite Byte as standalone; export order CSV for reconciliation |
| Dynamic pricing (happy hour automation) | Sounds powerful | Requires price scheduling, timezone logic, staff confusion risk, potential customer trust issues if prices change mid-cart | Manual price editing by venue owner; scheduled pricing deferred to v2 |
| AR menu visualization | Buzzword in 2026 research | Technically immature, requires 3D assets venues don't have, poor mobile performance | High-quality 2D photography is proven effective and far simpler |

---

## Feature Dependencies

```
[QR Code Generation]
    └──required for──> [Customer Menu Access]
                           └──required for──> [Cart Building]
                                                  └──required for──> [Order Placement]
                                                                         ├──requires──> [Stripe Integration] (prepay path)
                                                                         └──requires──> [Pay-at-Counter Config] (deferred payment path)

[Order Placement]
    └──triggers──> [Real-Time Order Push] (WebSocket)
                       ├──delivers to──> [Venue Owner Dashboard: Incoming Orders]
                       └──delivers to──> [Customer Order Status Page]

[Menu Management (CRUD)]
    └──required for──> [Item Availability Toggle]
    └──required for──> [Category Management]
    └──enhances──> [Customer Menu Access] (menu must exist before customers browse)

[Customer Account (Optional)]
    └──enhances──> [Order History / Reordering]
    └──enables (future)──> [Loyalty Program]

[Basic Sales Analytics]
    └──requires──> [Order History]
    └──enhances (future)──> [AI Upselling] (needs historical data)

[Multi-Venue Support]
    └──requires──> [Venue Settings]
    └──requires──> [QR Code Generation per Venue]
```

### Dependency Notes

- **Order Placement requires Stripe Integration:** Even for pay-at-counter venues, Stripe must be initialized to handle prepay venues; keep payment mode as a venue setting.
- **Real-Time Order Push requires WebSocket infrastructure:** Must be built before venue dashboard and customer tracking can work; implement early.
- **Menu must exist before customers can order:** Onboarding flow must guide venue owner through menu creation before generating QR codes.
- **Item Availability Toggle enhances Menu Management:** Simple boolean on each item; should be in same phase as menu CRUD.
- **Customer Account is isolated from core ordering loop:** Guest ordering must work without accounts; accounts are additive, not foundational.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] QR code that routes customer to venue-specific menu — core product access
- [ ] Browse menu by category with item photos and descriptions — without this the menu is unusable
- [ ] Cart building (add/remove/adjust quantity) — cannot order without this
- [ ] Guest checkout (no account required) — forced registration kills conversions
- [ ] Stripe payment (card + Apple/Google Pay) for prepay venues — food trucks need this
- [ ] Pay-at-counter option for dine-in venues — restaurants need this
- [ ] Order confirmation page with order reference — customer needs proof of order
- [ ] Real-time order status page (Pending → Preparing → Ready) — the "is my food done?" loop
- [ ] Venue owner: incoming orders dashboard with WebSocket push — kitchen must see new orders instantly
- [ ] Venue owner: order status management — must close the loop back to customer
- [ ] Venue owner: menu management (add/edit/delete items, categories, toggle availability) — self-serve is essential
- [ ] Venue owner: QR code generation and download — this is how customers reach the menu
- [ ] Venue owner: venue settings (name, logo, payment mode) — basic identity and configuration
- [ ] Multi-venue tenant isolation — the platform is multi-venue from day 1

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Customer account creation and saved order history — add when repeat customer behavior is observed
- [ ] Basic sales analytics (revenue, top items, order volume charts) — add once venues are active and asking for data
- [ ] Item photo optimization / CDN pipeline — add when image load performance becomes a complaint
- [ ] Special instructions free-text field on cart — add as pressure valve when modifier requests come in

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Menu item modifiers / customization — build when venues report losing customers over limited customization
- [ ] Table-specific QR codes — build when full-service dine-in restaurants are primary growth segment
- [ ] Loyalty / rewards — build after customer accounts have meaningful history
- [ ] SMS notifications for order ready — build when venues report customers missing their orders
- [ ] Multi-language support — build when non-English venues represent meaningful adoption
- [ ] POS integrations — build for enterprise tier once revenue justifies certification overhead
- [ ] AI upselling recommendations — requires sufficient purchase history data; premature without scale

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| QR scan to menu (no app) | HIGH | LOW | P1 |
| Browse menu by category | HIGH | LOW | P1 |
| Cart + guest checkout | HIGH | LOW | P1 |
| Stripe payment (prepay) | HIGH | MEDIUM | P1 |
| Pay-at-counter option | HIGH | LOW | P1 |
| Order confirmation | HIGH | LOW | P1 |
| Real-time order status (customer) | HIGH | MEDIUM | P1 |
| Venue incoming orders dashboard | HIGH | MEDIUM | P1 |
| Order status management (venue) | HIGH | LOW | P1 |
| Menu management CRUD | HIGH | MEDIUM | P1 |
| Item availability toggle | HIGH | LOW | P1 |
| QR code generation | HIGH | LOW | P1 |
| Venue settings | HIGH | LOW | P1 |
| Multi-venue tenant isolation | HIGH | MEDIUM | P1 |
| Customer account / reorder | MEDIUM | MEDIUM | P2 |
| Basic sales analytics | MEDIUM | MEDIUM | P2 |
| Special instructions free-text | MEDIUM | LOW | P2 |
| Menu item modifiers | HIGH | HIGH | P3 |
| Table-specific QR codes | MEDIUM | HIGH | P3 |
| Loyalty program | MEDIUM | HIGH | P3 |
| SMS order notifications | LOW | MEDIUM | P3 |
| Multi-language | LOW | HIGH | P3 |
| AI upselling | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Toast Mobile Order & Pay | Sunday | MenuTiger | Our Approach |
|---------|--------------------------|--------|-----------|--------------|
| QR scan to menu | Yes (table-specific) | Yes (table-specific) | Yes (venue or table) | Venue-level QR for v1; simpler for food trucks |
| Guest ordering | Yes | Yes | Yes | Yes, default path |
| Stripe/card payment | Yes (Toast payments) | Yes | Yes (Stripe, PayPal) | Stripe; Apple/Google Pay via Stripe |
| Pay at counter | Yes | No (always digital pay) | Yes | Yes, venue-configurable |
| Real-time order dashboard | Yes (KDS integration) | Yes | Yes | Yes, WebSocket; no KDS dependency |
| Order status to customer | Yes | Yes | Yes (Pending/In-Progress/Completed) | Yes |
| Menu modifiers | Yes (full) | Yes (full) | Yes (add-ons) | Deferred to v2; free-text special instructions as stopgap |
| Loyalty / CRM | Yes (Toast loyalty) | Limited | Email campaigns | Out of scope v1 |
| Analytics | Advanced (Toast POS data) | Menu/revenue analytics | Sales + menu analytics | Basic for v1; item popularity, revenue totals |
| Multi-venue | Yes (complex enterprise) | Limited | Yes (2-5 venues by plan) | Yes, first-class multi-tenancy |
| Pricing model | % of transaction + SaaS | % of transaction | SaaS flat ($17-$119/mo) | Flat/zero commission (TBD) |
| No app required | Yes | Yes | Yes | Yes |
| Table-specific QRs | Yes (required) | Yes (required) | Optional | Not in v1; food-truck-first |
| Food truck suitability | Poor (table-centric) | Poor (table-centric) | Moderate | First-class target |

---

## Sources

- [9 Must-Have Features for Restaurant Table Ordering System 2026 (Eats365)](https://www.eats365pos.com/au/blog/post/restaurant-table-ordering-features-2025) — MEDIUM confidence
- [Everything You Need to Know About Restaurant QR Code Table Ordering (Restolabs)](https://www.restolabs.com/blog/restaurant-qr-code-table-ordering-guide) — MEDIUM confidence
- [QR Code Ordering: From Trend to Standard in 2025 (Sunday)](https://sundayapp.com/qr-code-ordering-from-trend-to-standard-in-2025/) — MEDIUM confidence
- [MenuTiger Features Page](https://www.menutiger.com/features) — MEDIUM confidence (direct competitor feature set)
- [Three Ways QR Codes Will Reshape Restaurant Hospitality in 2026 (Modern Restaurant Management)](https://modernrestaurantmanagement.com/three-ways-qr-codes-will-reshape-restaurant-hospitality-in-2026/) — MEDIUM confidence
- [QR Code Menu Ordering Trends: The Future Of Dining In 2025 (Orders.co)](https://orders.co/blog/the-future-of-qr-menus-emerging-trends-to-watch/) — LOW confidence (single source)
- [How Guests Really Feel About QR Code Menus (Toast)](https://pos.toasttab.com/blog/on-the-line/qr-code-menu-insights) — MEDIUM confidence (primary research)
- [Trends in QR Code Payment for Restaurants in 2025 (Sunday)](https://sundayapp.com/trends-in-qr-code-payment-for-restaurants-in-2025/) — MEDIUM confidence
- [Handle payment events with webhooks (Stripe official docs)](https://docs.stripe.com/webhooks/handling-payment-events) — HIGH confidence
- [Restaurant Management Software All-in-One Platforms 2025 (MenuTiger)](https://www.menutiger.com/blog/restaurant-management-software) — LOW confidence (vendor-produced)
- [QR Food Ordering System with Data Analytics (ResearchGate)](https://www.researchgate.net/publication/373896215_QR_Food_Ordering_System_with_Data_Analytics) — MEDIUM confidence (peer-reviewed)

---
*Feature research for: QR food ordering platform (Bite Byte)*
*Researched: 2026-03-02*
