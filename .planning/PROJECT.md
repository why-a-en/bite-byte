# Bite Byte

## What This Is

A multi-venue QR code food ordering platform for restaurants and food trucks. Customers scan a venue's QR code on their phone, browse the menu, place an order, optionally pay online, and track their order status in real-time — no app download, no staff interaction required. Venue owners manage everything through a full-featured dashboard.

## Core Value

Customers can go from scanning a QR code to having their order in the kitchen in under 60 seconds, with zero friction and zero staff interaction.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Customer scans venue QR code and sees that venue's menu
- [ ] Customer can browse menu items organized by category
- [ ] Customer can build a cart and place an order
- [ ] Customer can optionally pay online (Stripe) or pay at counter
- [ ] Customer can track their order status in real-time
- [ ] Customer can optionally create an account for faster reordering
- [ ] Venue owner can manage their menu (add/edit/remove items, categories)
- [ ] Venue owner sees incoming orders in real-time (WebSocket push)
- [ ] Venue owner can update order status (received → preparing → ready → completed)
- [ ] Venue owner can view order analytics
- [ ] Venue owner can configure payment preference (prepay required vs. pay at counter)
- [ ] Venue owner can generate QR codes for their venue
- [ ] Multi-venue support — each venue operates independently with its own menu and orders

### Out of Scope

- Table-specific QR codes — one QR per venue for v1
- Menu item modifiers/customization — simple items for v1, but data model should be extensible
- Mobile native app — web-first, responsive design
- Delivery/logistics — pickup/dine-in only
- Multi-language support — English only for v1
- Loyalty programs / rewards — defer to v2+

## Context

- Personal project — building for real-world use across multiple venues
- User (builder) is less familiar with payment integration, feature scoping for this domain, and system architecture patterns — research phase will fill these gaps
- Target users: small-to-medium restaurants and food trucks that want self-service ordering without expensive platform fees
- Customers interact entirely through mobile browser — no app install

## Constraints

- **Tech stack**: Turborepo monorepo, Next.js (frontend), NestJS (backend), PostgreSQL
- **Real-time**: WebSocket-based live order push to venue dashboard
- **Payments**: Stripe for online payment processing
- **Deployment**: Vercel (Next.js) + Railway or similar (NestJS + PostgreSQL) — easiest path
- **Menu model**: Simple now (name, description, price, photo) but schema must accommodate modifiers later
- **Multi-tenancy**: Each venue is an isolated tenant with its own menu, orders, and settings

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Turborepo monorepo | Shared types/models between Next.js and NestJS, single repo management | — Pending |
| PostgreSQL over MongoDB | Relational data (venues, menus, orders, users) fits SQL well | — Pending |
| One QR per venue (not per table) | Simpler for v1, especially for food trucks with no tables | — Pending |
| Optional customer accounts | Reduces friction (guest ordering) while enabling reorder convenience | — Pending |
| Venue-configurable payment flow | Different venues have different needs (food trucks often prefer prepay, restaurants may allow pay at counter) | — Pending |
| Simple menu with extensible schema | Ship fast with simple items, but don't paint ourselves into a corner on modifiers | — Pending |

---
*Last updated: 2026-03-02 after initialization*
