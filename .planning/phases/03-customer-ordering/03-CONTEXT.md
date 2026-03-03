# Phase 3: Customer Ordering - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Mobile-first public ordering flow — customer scans QR code, browses venue menu, builds a cart, places an order (Stripe prepay or pay-at-counter depending on venue setting), and tracks their order status. No account required, no app download.

Creating/editing menu items, managing orders from the venue side, and real-time WebSocket push are out of scope for this phase.

</domain>

<decisions>
## Implementation Decisions

### Menu Page Layout
- Stacked list layout (full-width rows), not a card grid
- Each row shows: item name, description preview, price, and a photo thumbnail on the right
- Tapping an item opens a **bottom sheet** showing the full photo, complete description, and an "Add to Cart" button — not an inline + button on the row
- Unavailable items should be visually dimmed/disabled so customers can see them but not add them

### Cart Experience
- A **floating "View Cart" button** (persistent, not a sticky bar) shows item count and total
- Tapping it opens a **slide-up drawer** with the full cart contents
- Drawer has **full quantity controls**: +/- buttons per item and a remove option
- Cart persists in **localStorage** — survives full page refresh, scoped per venue slug
- Drawer has a "Checkout" CTA at the bottom

### Checkout Form
- Collect **customer name only** (required) — no table number, no order notes
- For **prepay venues**: Stripe payment form (card, Apple Pay, Google Pay) embedded on the checkout page — no redirect
- For **pay-at-counter venues**: show clear instructions ("Pay when you collect your order") and a "Place Order" button — no payment fields
- Order is created on the server; for prepay, transitions to RECEIVED only after `payment_intent.succeeded` webhook fires

### Order Tracking Page
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

</decisions>

<specifics>
## Specific Ideas

- The menu should feel like a native food ordering app (think Uber Eats / DoorDash item list) but simpler — no restaurant-level complexity
- The bottom sheet for item detail is a key UX moment — make it feel smooth and native on mobile
- The floating cart button should be hard to miss but not obtrusive when the cart is empty (consider hiding it or showing it dimmed when empty)

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-customer-ordering*
*Context gathered: 2026-03-03*
