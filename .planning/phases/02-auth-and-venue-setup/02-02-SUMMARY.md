---
phase: 02-auth-and-venue-setup
plan: "02"
subsystem: venues-and-menu
tags: [nestjs, crud, jwt, prisma, venues, categories, items, owner-scoped]

# Dependency graph
requires:
  - phase: 02-auth-and-venue-setup
    plan: "01"
    provides: JwtAuthGuard, JwtStrategy (req.user.userId), PrismaModule, AuthModule

provides:
  - POST /venues — create venue for authenticated owner
  - GET /venues — list owner's venues with category count
  - GET /venues/:id — get single venue (owner-scoped)
  - PATCH /venues/:id — update venue settings (owner-scoped)
  - DELETE /venues/:id — delete venue (owner-scoped)
  - POST /venues/:venueId/categories — create category (venue ownership verified)
  - GET /venues/:venueId/categories — list categories with items (sorted by sortOrder)
  - PATCH /venues/:venueId/categories/reorder — bulk sortOrder update in transaction
  - PATCH /venues/:venueId/categories/:id — update category
  - DELETE /venues/:venueId/categories/:id — delete category (409 if has items)
  - POST /venues/:venueId/categories/:categoryId/items — create item
  - GET /venues/:venueId/items — list all venue items
  - PATCH /venues/:venueId/items/:id — update item
  - DELETE /venues/:venueId/items/:id — delete item
  - PATCH /venues/:venueId/items/:id/availability — toggle isAvailable (MENU-06)

affects:
  - 02-04-dashboard-ui (depends on these endpoints)
  - 02-05-frontend-auth (frontend will consume these endpoints)
  - 03-customer-ordering (reads MenuCategory and MenuItem via RLS)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "JwtAuthGuard applied at controller class level — all methods in class are protected"
    - "Venue ownership check inlined in each service (not delegated to VenuesService) to avoid circular deps"
    - "Categories DELETE rejects with 409 if items exist — prefer explicit rejection over silent cascade"
    - "Reorder endpoint declared before :id PATCH route — prevents 'reorder' matching dynamic :id param"
    - "prisma.$transaction([...updates]) for atomic category reorder bulk write"
    - "MenuItem.venueId set on creation — doubles as RLS denormalization for Phase 3 customer queries"
    - "verifyVenueOwnership helper: 403 if venue exists but not owned, 404 if venue doesn't exist"
    - "P2002 Prisma error code caught and rethrown as 409 ConflictException for slug uniqueness"

key-files:
  created:
    - "apps/api/src/venues/venues.service.ts — Venue CRUD scoped to ownerId; P2002 -> 409 conversion"
    - "apps/api/src/venues/venues.controller.ts — 5 endpoints all protected by JwtAuthGuard"
    - "apps/api/src/venues/venues.module.ts — exports VenuesService for downstream use"
    - "apps/api/src/categories/categories.service.ts — Category CRUD + reorder; inline venue ownership check"
    - "apps/api/src/categories/categories.controller.ts — reorder route before :id route (ordering matters)"
    - "apps/api/src/categories/categories.module.ts — exports CategoriesService"
    - "apps/api/src/items/items.service.ts — Item CRUD + availability toggle; inline venue ownership check"
    - "apps/api/src/items/items.controller.ts — mixed route prefix (categories/:categoryId/items and items/:id)"
    - "apps/api/src/items/items.module.ts — exports ItemsService"
  modified:
    - "apps/api/src/app.module.ts — added VenuesModule, CategoriesModule, ItemsModule to imports"

key-decisions:
  - "Venue ownership check inlined in CategoriesService and ItemsService — no circular deps between modules"
  - "Category delete returns 409 if category has items — explicit rejection prevents accidental data loss"
  - "Item venueId set on creation — denormalization for Phase 3 RLS customer routes (no join needed)"
  - "PATCH /reorder route declared before PATCH /:id — NestJS routes match in declaration order"
  - "ForbiddenException (403) vs NotFoundException (404) based on whether venue exists vs not owned"

requirements-completed: [VNUE-01, VNUE-02, VNUE-04, MENU-01, MENU-02, MENU-03, MENU-04, MENU-06]

# Metrics
duration: 5min
completed: 2026-03-03
---

# Phase 2 Plan 02: Venue and Menu CRUD Summary

**NestJS owner-scoped REST API for venue settings and menu management: 15 endpoints across VenuesModule, CategoriesModule, and ItemsModule — all guarded by JwtAuthGuard with inline venue ownership verification**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-02T21:05:35Z
- **Completed:** 2026-03-02T21:10:37Z
- **Tasks:** 2 of 2
- **Files modified:** 10

## Accomplishments

- VenuesModule: complete venue CRUD (5 endpoints) scoped to authenticated owner via WHERE ownerId = userId; slug uniqueness enforced with P2002 -> 409 Conflict conversion
- CategoriesModule: category CRUD + bulk reorder endpoint using prisma.$transaction for atomic sortOrder updates; DELETE rejects with 409 if category has items
- ItemsModule: item CRUD + availability toggle (PATCH /availability — the "86 an item" endpoint, MENU-06); venueId set on items for Phase 3 RLS denormalization
- All 3 modules registered in AppModule; TypeScript compiles with 0 errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Build VenuesModule with owner-scoped CRUD** - `0b38261` (feat)
2. **Task 2: Build CategoriesModule and ItemsModule with reorder and availability toggle** - `df88baa` (feat)

**Plan metadata:** _(this commit)_ (docs: complete plan)

## Files Created/Modified

- `apps/api/src/venues/venues.service.ts` - Venue CRUD: create/findAllForOwner/findOneForOwner/update/remove; all WHERE ownerId = userId; P2002 -> ConflictException
- `apps/api/src/venues/venues.controller.ts` - POST/GET/GET:id/PATCH/DELETE /venues; class-level @UseGuards(JwtAuthGuard)
- `apps/api/src/venues/venues.module.ts` - Imports PrismaModule, exports VenuesService
- `apps/api/src/categories/categories.service.ts` - Category CRUD + reorder; verifyVenueOwnership inline; 409 on delete with items
- `apps/api/src/categories/categories.controller.ts` - PATCH reorder before PATCH :id (declaration order); 5 endpoints
- `apps/api/src/categories/categories.module.ts` - Imports PrismaModule, exports CategoriesService
- `apps/api/src/items/items.service.ts` - Item CRUD + toggleAvailability; inline venue ownership check; sets venueId on create
- `apps/api/src/items/items.controller.ts` - Mixed route prefix: categories/:categoryId/items (create) + items/:id (get/patch/delete/availability)
- `apps/api/src/items/items.module.ts` - Imports PrismaModule, exports ItemsService
- `apps/api/src/app.module.ts` - Added VenuesModule, CategoriesModule, ItemsModule imports

## Decisions Made

- **Venue ownership check inlined**: CategoriesService and ItemsService inline `prisma.venue.findFirst({ where: { id: venueId, ownerId: userId } })` rather than injecting VenuesService — avoids circular dependency between modules.
- **Category delete rejects with 409 if items exist**: Prefer explicit rejection over silent cascade to prevent accidental data loss. Callers must delete items first.
- **Item venueId set on creation**: MenuItem.venueId is a denormalized field — useful for Phase 3 RLS customer queries (customers query menu items by venue without needing a category join).
- **Reorder route before :id route**: NestJS matches routes in declaration order. `PATCH /reorder` must come before `PATCH /:id` or "reorder" would be captured as a dynamic :id value.
- **ForbiddenException vs NotFoundException**: verifyVenueOwnership checks whether venue exists at all — returns 404 if not found, 403 if found but not owned. This avoids information leakage (403 reveals venue exists; 404 would not).

## Deviations from Plan

None - plan executed exactly as written. TypeScript compiled cleanly on first attempt for both tasks.

## User Setup Required

None. All endpoints require a Bearer token from POST /auth/login or /auth/register (established in Plan 01).

## Next Phase Readiness

- VenuesModule, CategoriesModule, ItemsModule are all registered in AppModule and ready for use
- All endpoints return 401 without JWT, 403/404 if venue not owned
- Plan 03 (image upload) and Plan 04 (dashboard UI) can consume these endpoints immediately

---
*Phase: 02-auth-and-venue-setup*
*Completed: 2026-03-03*

## Self-Check: PASSED

All files confirmed on disk. All commits verified in git history.
