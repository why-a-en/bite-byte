# Requirements: Bite Byte

**Defined:** 2026-03-02
**Core Value:** Customers can go from scanning a QR code to having their order in the kitchen in under 60 seconds, with zero friction and zero staff interaction.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [x] **AUTH-01**: Venue owner can create an account with email and password
- [x] **AUTH-02**: Venue owner can log in and stay logged in across browser refresh
- [x] **AUTH-03**: Venue owner can log out from any page

### Venue Setup

- [x] **VNUE-01**: Venue owner can create a venue with name, logo, and URL slug
- [x] **VNUE-02**: Venue owner can configure payment preference (prepay required vs. pay at counter vs. both)
- [x] **VNUE-03**: Venue owner can generate and download a QR code linking to their venue's menu
- [x] **VNUE-04**: Venue owner can manage multiple venues under one account

### Menu Management

- [x] **MENU-01**: Venue owner can create, edit, and delete menu categories
- [x] **MENU-02**: Venue owner can reorder categories via drag-and-drop
- [x] **MENU-03**: Venue owner can create menu items with name, description, price, and photo
- [x] **MENU-04**: Venue owner can edit and delete menu items
- [x] **MENU-05**: Venue owner can upload item photos that are optimized and served via CDN
- [x] **MENU-06**: Venue owner can toggle item availability (86 an item without deleting it)

### Customer Ordering

- [x] **ORDR-01**: Customer can scan a venue's QR code and see that venue's menu on their phone browser
- [x] **ORDR-02**: Customer can browse menu items organized by category with photos and descriptions
- [x] **ORDR-03**: Customer can add items to a cart and adjust quantities
- [x] **ORDR-04**: Customer's cart persists across page refresh (localStorage)
- [x] **ORDR-05**: Customer can place an order as a guest (no account required)
- [x] **ORDR-06**: Customer can pay online via Stripe (card, Apple Pay, Google Pay) when venue requires prepay
- [x] **ORDR-07**: Customer sees "pay at counter" instructions when venue allows deferred payment
- [x] **ORDR-08**: Customer receives an order confirmation with a reference number after placing an order
- [x] **ORDR-09**: Customer can view real-time order status (Pending → Preparing → Ready) via WebSocket
- [x] **ORDR-10**: Customer can return to their order status page after closing the browser (order ID persisted in localStorage)

### Order Management

- [ ] **MGMT-01**: Venue owner sees incoming orders appear in real-time via WebSocket push
- [ ] **MGMT-02**: Venue owner hears an audio alert when a new order arrives
- [ ] **MGMT-03**: Venue owner can update order status (Received → Preparing → Ready → Completed)
- [ ] **MGMT-04**: Order status changes push to the customer's status page in real-time
- [x] **MGMT-05**: Venue owner can view order history with date filtering

### Analytics

- [x] **ANLY-01**: Venue owner can view revenue summary (today, this week, this month)
- [x] **ANLY-02**: Venue owner can view top-selling items
- [x] **ANLY-03**: Venue owner can view order volume over time (chart)

### Infrastructure

- [x] **INFR-01**: Multi-tenant data isolation — each venue's data is scoped and inaccessible to other venues
- [x] **INFR-02**: Payment state is driven exclusively by Stripe webhooks (never client-side)
- [x] **INFR-03**: Order records snapshot item prices at time of order (not references to mutable menu prices)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Customer Accounts

- **ACCT-01**: Customer can optionally create an account after placing an order
- **ACCT-02**: Customer can view past order history when logged in
- **ACCT-03**: Customer can reorder a previous order in one tap

### Menu Enhancements

- **MODF-01**: Venue owner can add modifiers to menu items (size, toppings, extras)
- **MODF-02**: Customer can customize items with required and optional modifiers
- **INST-01**: Customer can add special instructions to individual items or the whole order

### Notifications

- **NOTF-01**: Customer receives SMS notification when order status changes to Ready
- **NOTF-02**: Venue owner receives email summary of daily orders

### Advanced Venue Features

- **ADVN-01**: Venue owner can create table-specific QR codes
- **ADVN-02**: Orders from table QR codes include table number

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Loyalty / rewards program | Requires customer accounts + complex points logic; defer until PMF established |
| Delivery / logistics | Completely different operational model; pickup/dine-in only |
| Multi-language support | Doubles content management complexity; English-only for v1 |
| POS integration | Vendor-specific, fragile, long certification cycles; not needed for small venues |
| Dynamic pricing / happy hour | Complex scheduling logic; manual price editing sufficient for v1 |
| AR menu visualization | Technically immature, requires 3D assets venues don't have |
| AI upselling / recommendations | Requires purchase history at scale; premature without data |
| OAuth / social login | Email/password sufficient for venue owners; customers are guests |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 2 | Complete |
| VNUE-01 | Phase 2 | Complete |
| VNUE-02 | Phase 2 | Complete |
| VNUE-03 | Phase 2 | Complete |
| VNUE-04 | Phase 2 | Complete |
| MENU-01 | Phase 2 | Complete |
| MENU-02 | Phase 2 | Complete |
| MENU-03 | Phase 2 | Complete |
| MENU-04 | Phase 2 | Complete |
| MENU-05 | Phase 2 | Complete |
| MENU-06 | Phase 2 | Complete |
| ORDR-01 | Phase 3 | Complete |
| ORDR-02 | Phase 3 | Complete |
| ORDR-03 | Phase 3 | Complete |
| ORDR-04 | Phase 3 | Complete |
| ORDR-05 | Phase 3 | Complete |
| ORDR-06 | Phase 3 | Complete |
| ORDR-07 | Phase 3 | Complete |
| ORDR-08 | Phase 3 | Complete |
| ORDR-09 | Phase 3 | Complete |
| ORDR-10 | Phase 3 | Complete |
| MGMT-01 | Phase 4 | Pending |
| MGMT-02 | Phase 4 | Pending |
| MGMT-03 | Phase 4 | Pending |
| MGMT-04 | Phase 4 | Pending |
| MGMT-05 | Phase 4 | Complete |
| ANLY-01 | Phase 4 | Complete |
| ANLY-02 | Phase 4 | Complete |
| ANLY-03 | Phase 4 | Complete |
| INFR-01 | Phase 1 | Complete |
| INFR-02 | Phase 1 | Complete |
| INFR-03 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0

---
*Requirements defined: 2026-03-02*
*Last updated: 2026-03-02 after roadmap creation*
