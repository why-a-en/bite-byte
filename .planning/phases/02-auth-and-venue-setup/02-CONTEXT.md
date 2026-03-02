# Phase 2: Auth and Venue Setup - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Venue owner authentication (signup, login, session persistence, logout), venue creation and configuration (name, logo, slug, payment mode), multi-venue management, full menu management (categories CRUD with drag-and-drop reorder, items CRUD with photo upload, availability toggle), and QR code generation. This is the owner-facing half of the platform — everything a venue owner needs before customers can order.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

User deferred all Phase 2 decisions to Claude's judgment. Claude has full flexibility on:

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

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Research should investigate:
- Modern restaurant dashboard patterns (Toast, Square, MenuTiger admin panels)
- shadcn/ui component library for consistent, accessible components
- Best practices for drag-and-drop category reordering (dnd-kit or similar)
- Image upload patterns in Next.js (client-side preview + server upload)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-auth-and-venue-setup*
*Context gathered: 2026-03-03*
