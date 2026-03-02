---
phase: 02-auth-and-venue-setup
plan: "05"
subsystem: menu-builder-ui
tags: [nextjs, dnd-kit, react-hook-form, zod, vercel-blob, shadcn, server-actions, optimistic-ui]

# Dependency graph
requires:
  - phase: 02-auth-and-venue-setup
    plan: "02"
    provides: "NestJS category/item CRUD endpoints including PATCH /categories/reorder and PATCH /items/:id/availability"
  - phase: 02-auth-and-venue-setup
    plan: "03"
    provides: "shadcn/ui components, react-hook-form, Tailwind v4 setup"

provides:
  - Menu builder page at (dashboard)/venues/[venueId]/menu/page.tsx
  - CategoryList with DndContext + SortableContext drag-and-drop reorder
  - SortableCategory with useSortable drag handle, inline name edit, delete confirmation, item list
  - ItemForm dialog with react-hook-form + Zod: name, price, description, photo upload with client-side preview
  - ItemCard with availability toggle (Switch), edit dialog, delete AlertDialog
  - All CRUD server actions in menu.ts: category and item create/update/delete, reorder, availability toggle

affects:
  - 03-customer-ordering (reads menu structure built here)

# Tech tracking
tech-stack:
  added:
    - "@dnd-kit/core@^6.3.1 — drag-and-drop core context and sensors"
    - "@dnd-kit/sortable@^10.0.0 — SortableContext, useSortable, arrayMove, verticalListSortingStrategy"
    - "@dnd-kit/utilities@^3.2.2 — CSS.Transform.toString for sortable style"
    - "shadcn textarea — installed via shadcn@latest add textarea"
    - "shadcn switch — installed via shadcn@latest add switch"
  patterns:
    - "CategoryList uses stable UUID item IDs (not array index) for SortableContext — prevents dnd-kit ID collision"
    - "Optimistic update on drag: arrayMove local state first, then reorderCategoriesAction — snappy UX"
    - "Optimistic availability toggle: setIsAvailable(checked) before API call, rollback on error"
    - "BLOB_READ_WRITE_TOKEN guard: photo upload silently skipped in local dev without Vercel Blob token"
    - "useActionState (React 19) for server action state + react-hook-form for client validation"
    - "ItemForm as shared create/edit component — isEdit determined by presence of existingItem prop"
    - "Category delete shows item count warning instead of confirm button when category has items (API returns 409)"

key-files:
  created:
    - "apps/web/src/actions/menu.ts — All category + item server actions: createCategory, updateCategory, deleteCategory, reorderCategories, createItem, updateItem, deleteItem, toggleAvailability"
    - "apps/web/src/components/menu/category-list.tsx — DndContext + SortableContext wrapper, optimistic reorder, Add Category inline form"
    - "apps/web/src/components/menu/sortable-category.tsx — useSortable drag handle, inline name edit, AlertDialog delete, expanded item list, Add Item button"
    - "apps/web/src/components/menu/item-form.tsx — Dialog form with RHF + Zod, photo file input with FileReader preview, max 4MB client check"
    - "apps/web/src/components/menu/item-card.tsx — horizontal card layout, Switch availability toggle with optimistic update, edit/delete actions"
    - "apps/web/src/app/(dashboard)/venues/[venueId]/menu/page.tsx — Server component fetching categories with nested items, empty state, CategoryList render"
    - "apps/web/src/components/ui/switch.tsx — shadcn Switch component"
    - "apps/web/src/components/ui/textarea.tsx — shadcn Textarea component"
  modified:
    - "apps/web/package.json — added @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities"

key-decisions:
  - "Stable UUID IDs for SortableContext — using category.id (Prisma UUID) not array index prevents dnd-kit collision on reorder"
  - "@dnd-kit/modifiers not installed — removed restrictToVerticalAxis import; vertical-only constraint not critical for functionality"
  - "Photo upload silently skipped without BLOB_READ_WRITE_TOKEN — imageUrl stays null in dev, no crash or error shown to user"
  - "Category delete warns about existing items — matches API 409 behavior; no 'Delete' button shown when items.length > 0"
  - "Optimistic availability toggle with rollback — fast one-click UX, rollback on API failure"

requirements-completed: [MENU-01, MENU-02, MENU-03, MENU-04, MENU-05, MENU-06]

# Metrics
duration: 5min
completed: 2026-03-03
---

# Phase 2 Plan 05: Menu Builder UI Summary

**Interactive menu builder with @dnd-kit/sortable drag-and-drop category reorder, item CRUD via react-hook-form + Zod with client-side photo preview, and one-click availability toggle (86 an item) using optimistic updates**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-02T21:17:00Z
- **Completed:** 2026-03-02T21:22:00Z
- **Tasks:** 2 of 2
- **Files modified:** 8

## Accomplishments

- Menu builder page at `/venues/[venueId]/menu` — server component fetching categories with nested items, empty state guides first use
- CategoryList with dnd-kit: DndContext + SortableContext with verticalListSortingStrategy; optimistic arrayMove on drag + reorderCategoriesAction to persist
- SortableCategory: drag handle (GripVertical), expand/collapse, inline name edit with check/X buttons, AlertDialog delete with item-count warning, ItemCard grid, Add Item button
- ItemForm dialog: react-hook-form + Zod validation (name required, price >= 0.01, description optional), client-side FileReader image preview with 4MB size check, graceful Vercel Blob skip when token absent
- ItemCard: horizontal layout (thumbnail + name/description/price + Switch toggle), availability badge, edit (opens ItemForm), delete (AlertDialog)
- All 8 server actions in menu.ts use fetchApi helper and call revalidatePath after mutation
- TypeScript compiles with 0 errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Category management with drag-and-drop reorder** - `33c08e3` (feat)
2. **Task 2: Item CRUD with photo upload and availability toggle** - `c88635f` (feat)

**Plan metadata:** _(this commit)_ (docs: complete plan)

## Files Created/Modified

- `apps/web/src/actions/menu.ts` - 8 server actions: createCategoryAction, updateCategoryAction, deleteCategoryAction, reorderCategoriesAction, createItemAction, updateItemAction, deleteItemAction, toggleAvailabilityAction
- `apps/web/src/components/menu/category-list.tsx` - CategoryList: DndContext + SortableContext, optimistic reorder, Add Category form
- `apps/web/src/components/menu/sortable-category.tsx` - SortableCategory: useSortable, drag handle, inline edit, AlertDialog delete, item list render
- `apps/web/src/components/menu/item-form.tsx` - ItemForm: Dialog, react-hook-form + Zod, photo FileReader preview, create/edit modes
- `apps/web/src/components/menu/item-card.tsx` - ItemCard: thumbnail, price, Switch availability toggle, edit/delete
- `apps/web/src/app/(dashboard)/venues/[venueId]/menu/page.tsx` - Menu builder page (Server Component)
- `apps/web/src/components/ui/switch.tsx` - shadcn Switch component
- `apps/web/src/components/ui/textarea.tsx` - shadcn Textarea component
- `apps/web/package.json` - Added @dnd-kit packages

## Decisions Made

- **Stable UUID IDs for SortableContext**: Used category.id (Prisma UUID) as DnD item IDs rather than array index — prevents dnd-kit collision when categories are reordered.
- **@dnd-kit/modifiers removed**: Package not listed in plan dependencies. The `restrictToVerticalAxis` modifier is a nice-to-have UX enhancement but not required for correctness — removed to avoid installing unlisted deps.
- **Silent photo upload skip**: When BLOB_READ_WRITE_TOKEN is absent (local dev), photo upload is silently skipped and imageUrl stays null. No error shown, no crash. Matches Plan 04's logo upload pattern.
- **Category delete with item count warning**: When items.length > 0, AlertDialog shows a warning and no Delete button — this matches the NestJS API's 409 response on delete with items.
- **Optimistic toggle with rollback**: toggleAvailabilityAction success is assumed immediately (single state update), then rolled back if API returns error. Makes the "86 an item" toggle feel instant.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed QR code route Buffer compat with Web Response API**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** `QRCode.toBuffer()` returns `Buffer<ArrayBufferLike>` which TypeScript 5+ rejects as `BodyInit` for `new Response()`
- **Fix:** Linter had already applied `new Uint8Array(pngBuffer)` conversion before this commit
- **Files modified:** `apps/web/src/app/api/venues/[venueId]/qrcode/route.ts`
- **Commit:** Included in Task 1 commit `33c08e3`

**2. [Rule 3 - Blocking] Removed @dnd-kit/modifiers import**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** `import { restrictToVerticalAxis } from '@dnd-kit/modifiers'` caused TS2307 (module not found) — @dnd-kit/modifiers was not in the plan's install list
- **Fix:** Removed import and removed `modifiers={[restrictToVerticalAxis]}` from DndContext props — vertical restriction is a UX enhancement, not required for correctness
- **Files modified:** `apps/web/src/components/menu/category-list.tsx`
- **Commit:** Included in Task 1 commit `33c08e3`

## User Setup Required

For photo upload to work in production:
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob store token (see Plan 04 setup instructions)

In local development, photos are skipped silently (imageUrl = null). The form submits successfully without a photo.

## Next Phase Readiness

- Menu builder is fully functional — venue owners can manage categories, items, photos, and availability
- Phase 3 (customer ordering) can read menu data built here via the NestJS categories API with RLS
- All Phase 2 requirements (MENU-01 through MENU-06) are satisfied

---
*Phase: 02-auth-and-venue-setup*
*Completed: 2026-03-03*

## Self-Check: PASSED

All files confirmed on disk. All commits verified in git history.
