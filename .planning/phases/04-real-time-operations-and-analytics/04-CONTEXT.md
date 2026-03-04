# Phase 4: Real-Time Operations and Analytics - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Venue owner gets a live dashboard where incoming orders appear instantly via WebSocket, can transition orders through RECEIVED → PREPARING → READY → COMPLETED, can view order history, and can see basic sales analytics (revenue totals, top items, order volume chart). Customer order status page upgrades from polling to WebSocket push. WebSocket lives exclusively in NestJS (Railway) — never in Next.js API routes (Vercel constraint).

</domain>

<decisions>
## Implementation Decisions

### Live orders dashboard
- Kanban board layout with columns for each status: Received, Preparing, Ready
- Order cards show: reference code, customer name, item count, time since placed, total amount (minimal — not full item list)
- Clicking an order card expands it inline to show full item list and action buttons (no modal or side panel)
- New orders trigger an audio alert notification sound; owner can mute/unmute from the dashboard
- New order cards animate in with a highlight effect

### Order status transitions
- Single "Next" button per order card: "Start Preparing" → "Mark Ready" → "Complete"
- No drag-and-drop between columns — button-only for simplicity
- Cancel button on order card with confirmation dialog
- Completed orders auto-hide from the board after 30 seconds; viewable in order history
- No undo — status only moves forward

### Sales analytics
- Revenue summary: three cards — Today, This Week, This Month
- Order volume bar chart: orders per day for the selected period
- Top 5 selling items by order count
- Order history on a separate dedicated page with date filter

### WebSocket behavior
- Yellow/red banner at top of dashboard: "Connection lost — reconnecting..." when WebSocket disconnects; auto-hides on reconnect
- On reconnect: re-fetch all active orders via REST API before resuming WebSocket feed — no missed orders
- Customer order status page upgrades to WebSocket push (replaces 5-second polling from Phase 3)
- REST polling fallback: if WebSocket can't connect after 3 attempts, fall back to 5s REST polling silently

### Claude's Discretion
- Exact audio alert sound choice and implementation
- Animation timing for card transitions and auto-hide
- Chart library choice for analytics
- WebSocket reconnection backoff strategy
- Order history table design and search/filter UX

</decisions>

<specifics>
## Specific Ideas

- Kanban columns should feel like a kitchen order board — clear, scannable, no clutter
- Audio alert is important for real kitchens where the owner isn't watching the screen constantly
- The 30-second auto-hide for completed orders keeps the board clean during busy periods
- WebSocket reconnection must be invisible to the owner when it works — only show banner when it fails

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-real-time-operations-and-analytics*
*Context gathered: 2026-03-04*
