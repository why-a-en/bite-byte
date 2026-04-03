---
phase: quick-5
plan: 01
subsystem: web-ux
tags: [loading-states, toasts, empty-states, skeletons, sonner]
dependency_graph:
  requires: []
  provides: [skeleton-loaders, toast-notifications, spinner-component, empty-states]
  affects: [dashboard, menu-builder, orders-board, checkout, venue-settings]
tech_stack:
  added: [sonner]
  patterns: [loading.tsx-skeletons, useEffect-toast-pattern, hasSubmittedRef-guard]
key_files:
  created:
    - apps/web/src/components/ui/skeleton.tsx
    - apps/web/src/components/ui/spinner.tsx
    - apps/web/src/components/ui/sonner.tsx
    - apps/web/src/app/(dashboard)/dashboard/loading.tsx
    - apps/web/src/app/(dashboard)/venues/[venueId]/loading.tsx
    - apps/web/src/app/(dashboard)/venues/[venueId]/menu/loading.tsx
    - apps/web/src/app/(dashboard)/venues/[venueId]/orders/loading.tsx
    - apps/web/src/app/(dashboard)/venues/[venueId]/analytics/loading.tsx
    - apps/web/src/app/(dashboard)/venues/[venueId]/history/loading.tsx
    - apps/web/src/app/(dashboard)/venues/[venueId]/qrcode/loading.tsx
  modified:
    - apps/web/src/app/layout.tsx
    - apps/web/src/components/menu/category-list.tsx
    - apps/web/src/components/menu/sortable-category.tsx
    - apps/web/src/components/menu/item-card.tsx
    - apps/web/src/components/menu/item-form.tsx
    - apps/web/src/components/dashboard/venue-settings-form.tsx
    - apps/web/src/components/dashboard/orders-board.tsx
    - apps/web/src/components/ordering/checkout-form.tsx
    - apps/web/src/app/(dashboard)/dashboard/page.tsx
decisions:
  - "useEffect + hasSubmittedRef pattern for useActionState toast notifications -- formAction returns void so cannot check result inline"
  - "Toasts supplement existing inline validation errors, do not replace them"
metrics:
  duration: 5min
  completed: 2026-04-03
---

# Quick Task 5: UX Improvements -- Loading States, Toast Notifications, Empty States

Skeleton loading.tsx for all 7 dashboard routes, sonner toast integration for every mutation, Spinner component for async buttons, and polished empty states for dashboard and orders board.

## Task Completion

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Install sonner, add Skeleton/Spinner UI primitives, create loading.tsx skeletons | f1e2dad | skeleton.tsx, spinner.tsx, sonner.tsx, 7 loading.tsx files |
| 2 | Add toast notifications to all mutations and enhance empty states | 6814c43 | category-list.tsx, sortable-category.tsx, item-card.tsx, item-form.tsx, venue-settings-form.tsx, orders-board.tsx, checkout-form.tsx, dashboard/page.tsx |

## What Was Built

### Skeleton Loading States (Task 1)
- Installed `sonner` toast library
- Created `Skeleton` component (animate-pulse + bg-muted)
- Created `Spinner` component (Loader2 animate-spin)
- Created `Toaster` wrapper for sonner with bottom-right position and rich colors
- Added `<Toaster />` to root layout
- Created layout-matched loading.tsx files for: dashboard, venue settings, menu builder, orders board, analytics, history, QR code

### Toast Notifications (Task 2)
- **category-list.tsx**: Toast on category create success/failure, reorder failure
- **sortable-category.tsx**: Toast on rename success/failure, delete success/failure (409 items guard), Spinner on delete button
- **item-card.tsx**: Toast on availability toggle success/failure (with rollback), delete success/failure
- **item-form.tsx**: Toast on create/update success, error on failure
- **venue-settings-form.tsx**: Toast on save success/failure, Spinner on save button
- **orders-board.tsx**: Toast on status update success/failure with column label
- **checkout-form.tsx**: Toast on PAC order error, Stripe initiation error

### Enhanced Empty States (Task 2)
- **Dashboard (no venues)**: Centered Store icon (h-16 w-16), "No venues yet" heading, descriptive copy, CreateVenueCard CTA
- **Orders board (no orders)**: ClipboardList icon, "No active orders" heading, real-time description

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] useActionState formAction returns void, not state**
- **Found during:** Task 2
- **Issue:** Plan suggested checking `formAction()` return value for toast, but `useActionState` dispatch returns void
- **Fix:** Used `useEffect` watching `formState` with a `hasSubmittedRef` guard to prevent toasting on initial render
- **Files modified:** category-list.tsx
- **Commit:** 6814c43

## Verification

- Build passes cleanly with no type errors
- All 7 loading.tsx files exist for dashboard routes
- Toaster rendered in root layout
- Toast imports present in all 7 mutation components

## Self-Check: PASSED
