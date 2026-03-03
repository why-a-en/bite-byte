---
phase: 03-customer-ordering
plan: 02
subsystem: ui
tags: [nextjs, react, vaul, shadcn, localStorage, cart, mobile, ordering]

# Dependency graph
requires:
  - phase: 03-customer-ordering
    plan: 01
    provides: GET /api/public/venues/:slug/menu — PublicMenuModule serving venue+categories+items

provides:
  - Public (menu) Next.js route group — no auth, no sidebar
  - GET /menu/[slug] — Server Component page fetching venue menu via fetchPublicApi
  - useCart hook — SSR-safe cart with localStorage persistence keyed by venue slug
  - 6 ordering Client Components: MenuPage, CategoryNav, MenuItemRow, ItemDetailSheet, CartButton, CartDrawer
  - api-public.ts — unauthenticated fetch helper (no cookie forwarding)

affects:
  - 03-03 (checkout UI — links from CartDrawer to /menu/[slug]/checkout, cart items passed to checkout)
  - 03-04 (order status — no dependency but consistent layout pattern)

# Tech tracking
tech-stack:
  added:
    - vaul (via shadcn Drawer) — gesture-physics bottom sheet and drawer primitive for mobile-native UX
  patterns:
    - SSR-safe localStorage: useState([]) initializer + useEffect load after mount (avoids hydration mismatch)
    - hydration guard: separate `hydrated` state prevents persisting empty [] to localStorage before mount load
    - CartButton null-return: returns null when itemCount === 0 rather than hidden via CSS
    - Server Component calls fetchPublicApi (no cookies) — public data, no auth needed
    - (menu) route group isolates public pages from (dashboard) — different layout, no sidebar

key-files:
  created:
    - apps/web/src/lib/api-public.ts
    - apps/web/src/lib/cart.ts
    - apps/web/src/app/(menu)/layout.tsx
    - apps/web/src/app/(menu)/menu/[slug]/page.tsx
    - apps/web/src/components/ordering/menu-page.tsx
    - apps/web/src/components/ordering/category-nav.tsx
    - apps/web/src/components/ordering/menu-item-row.tsx
    - apps/web/src/components/ordering/item-detail-sheet.tsx
    - apps/web/src/components/ordering/cart-button.tsx
    - apps/web/src/components/ordering/cart-drawer.tsx
    - apps/web/src/components/ui/drawer.tsx
  modified:
    - apps/web/package.json (vaul added as transitive dep via shadcn)
    - pnpm-lock.yaml

key-decisions:
  - "api-public.ts omits cookie forwarding entirely — public endpoints need no auth, simplest possible fetch helper"
  - "useCart initialises items as [] (not from localStorage) and loads in useEffect to prevent SSR hydration mismatch"
  - "hydrated boolean guard prevents persisting empty [] to localStorage before the initial load useEffect runs"
  - "img tag used instead of Next.js Image for item/logo thumbnails — external CDN URLs require domain allowlist configuration which isn't worth the overhead for v1"
  - "CartButton returns null (not display:none) — cleaner React pattern, no hidden DOM element"
  - "direction=bottom for both ItemDetailSheet and CartDrawer — mobile-native bottom-up pattern with vaul swipe-to-close"
  - "Category section id matches category.id for CategoryNav scroll targets"
  - "Main content has pb-28 to prevent floating CartButton from covering last item"

patterns-established:
  - "Public route group: (menu)/ with minimal layout, no sidebar, no auth — all customer-facing pages go here"
  - "Server Component fetches data, passes typed props to 'use client' page component — clean client/server boundary"
  - "Type exports from page.tsx (PublicVenue, PublicCategory, PublicMenuItem) shared across ordering components"
  - "useCart hook encapsulates all cart state: add, updateQuantity (qty<=0 removes), clearCart, total, itemCount, hydrated"

requirements-completed: [ORDR-01, ORDR-02, ORDR-03, ORDR-04]

# Metrics
duration: 3min
completed: 2026-03-03
---

# Phase 3 Plan 02: Menu Page + Cart Summary

**Mobile-first public menu page: (menu) route group with Server Component data fetch, vaul bottom sheet item detail, useCart hook with SSR-safe localStorage persistence, floating cart button, and slide-up cart drawer with quantity controls**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-03T20:04:58Z
- **Completed:** 2026-03-03T20:08:25Z
- **Tasks:** 2
- **Files modified:** 13 (11 new, 2 updated for vaul dependency)

## Accomplishments
- (menu) route group provides public access to /menu/[slug] without auth or sidebar — middleware matcher excludes it
- useCart hook implements SSR-safe hydration: items initialised as [] then loaded from localStorage in useEffect with hydration guard preventing empty overwrite
- 6 mobile-first ordering components: sticky category tabs, stacked item rows with thumbnails, bottom sheet item detail, floating cart button (hidden when empty), slide-up cart drawer with +/- quantity controls and checkout link
- TypeScript compiles with zero errors across all 10 new files

## Task Commits

Each task was committed atomically:

1. **Tasks 1 + 2: Route group + all UI components** - `7a559e9` (feat)

Note: Task 1 and Task 2 were committed together because the Server Component page.tsx imports MenuPage (Task 2 component) — TypeScript only passes with both present. The commit covers all 10 files plus the shadcn Drawer installation.

**Plan metadata:** _(pending final commit)_

## Files Created/Modified
- `apps/web/src/lib/api-public.ts` — Unauthenticated fetch helper; strips cookie forwarding vs api.ts
- `apps/web/src/lib/cart.ts` — useCart hook + CartItem/Cart types; SSR-safe with hydrated guard
- `apps/web/src/app/(menu)/layout.tsx` — Minimal white-background layout with title metadata
- `apps/web/src/app/(menu)/menu/[slug]/page.tsx` — Server Component; awaits params, calls fetchPublicApi, passes venue to MenuPage
- `apps/web/src/components/ordering/menu-page.tsx` — Client Component root; orchestrates cart state, sheet state, drawer state
- `apps/web/src/components/ordering/category-nav.tsx` — Sticky horizontal tabs; scrollIntoView on click
- `apps/web/src/components/ordering/menu-item-row.tsx` — Full-width row with name/description/price and 64x64 thumbnail; dimmed when unavailable
- `apps/web/src/components/ordering/item-detail-sheet.tsx` — vaul bottom sheet; full image, name, price, description, Add to Cart button
- `apps/web/src/components/ordering/cart-button.tsx` — Fixed floating pill; returns null when empty; shows count badge + total
- `apps/web/src/components/ordering/cart-drawer.tsx` — Bottom drawer; item list with +/- controls, remove, subtotals; Checkout link to /menu/[slug]/checkout
- `apps/web/src/components/ui/drawer.tsx` — Installed via pnpm dlx shadcn@latest add drawer

## Decisions Made
- **api-public.ts omits cookie forwarding** — public endpoints need no auth; cleaner than stripping cookies from the existing fetchApi
- **img tag for thumbnails** — external CDN URLs (Vercel Blob) require `remotePatterns` config in next.config.ts; using plain `<img>` avoids that configuration overhead in v1
- **hydrated boolean in useCart** — a separate `hydrated` flag ensures the persistence `useEffect` never runs before the load `useEffect` finishes, preventing the race condition where an empty `[]` would overwrite stored cart data
- **Types exported from page.tsx** — PublicVenue, PublicCategory, PublicMenuItem defined once in the Server Component and imported by all ordering Client Components
- **pb-28 on main content** — prevents the fixed CartButton from obscuring the last item on the list

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- /menu/[slug] renders venue menu from API with full browse-and-cart UX
- CartDrawer Checkout link points to /menu/[slug]/checkout — ready for 03-03 to implement the checkout page
- useCart hook exports clearCart for post-order reset in 03-03 checkout flow
- fetchPublicApi ready for checkout page (POST /public/venues/:slug/orders)
- TypeScript zero errors, all files compile cleanly

---
*Phase: 03-customer-ordering*
*Completed: 2026-03-03*
