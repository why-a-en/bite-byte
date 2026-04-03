---
phase: quick-5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/app/layout.tsx
  - apps/web/src/components/ui/sonner.tsx
  - apps/web/src/components/ui/skeleton.tsx
  - apps/web/src/components/ui/spinner.tsx
  - apps/web/src/app/(dashboard)/dashboard/loading.tsx
  - apps/web/src/app/(dashboard)/venues/[venueId]/menu/loading.tsx
  - apps/web/src/app/(dashboard)/venues/[venueId]/orders/loading.tsx
  - apps/web/src/app/(dashboard)/venues/[venueId]/analytics/loading.tsx
  - apps/web/src/app/(dashboard)/venues/[venueId]/history/loading.tsx
  - apps/web/src/app/(dashboard)/venues/[venueId]/loading.tsx
  - apps/web/src/app/(dashboard)/venues/[venueId]/qrcode/loading.tsx
  - apps/web/src/components/menu/category-list.tsx
  - apps/web/src/components/menu/sortable-category.tsx
  - apps/web/src/components/menu/item-card.tsx
  - apps/web/src/components/menu/item-form.tsx
  - apps/web/src/components/dashboard/venue-settings-form.tsx
  - apps/web/src/components/dashboard/orders-board.tsx
  - apps/web/src/components/ordering/checkout-form.tsx
autonomous: true
requirements: [UX-LOADING, UX-ERRORS, UX-EMPTY, UX-TRANSITIONS]

must_haves:
  truths:
    - "Dashboard pages show skeleton loaders while data fetches"
    - "Form submissions show toast notifications on success and failure"
    - "Delete and destructive actions show toast feedback"
    - "Empty states have friendly illustrations and clear CTAs"
    - "Buttons show spinner/loading state during async operations"
  artifacts:
    - path: "apps/web/src/components/ui/sonner.tsx"
      provides: "Toast provider component"
    - path: "apps/web/src/components/ui/skeleton.tsx"
      provides: "Skeleton loading primitive"
    - path: "apps/web/src/app/(dashboard)/dashboard/loading.tsx"
      provides: "Dashboard skeleton loader"
  key_links:
    - from: "apps/web/src/app/layout.tsx"
      to: "sonner Toaster"
      via: "import and render in root layout"
      pattern: "Toaster"
---

<objective>
Add loading states, toast notifications, and polished empty states across the Bite Byte app.

Purpose: The app currently has minimal loading feedback (no skeleton loaders for page transitions), no toast notifications for action success/failure, and sparse empty states. This creates a rough UX where users don't know if actions succeeded or if the app is loading.

Output: Skeleton loading.tsx files for all dashboard routes, sonner toast integration for action feedback, enhanced empty states with icons and CTAs, and spinner states on all async buttons.
</objective>

<execution_context>
@/home/alfie/.claude/get-shit-done/workflows/execute-plan.md
@/home/alfie/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/app/layout.tsx
@apps/web/src/app/(dashboard)/dashboard/page.tsx
@apps/web/src/app/(dashboard)/venues/[venueId]/menu/page.tsx
@apps/web/src/app/(dashboard)/venues/[venueId]/orders/page.tsx
@apps/web/src/app/(dashboard)/venues/[venueId]/page.tsx
@apps/web/src/components/menu/category-list.tsx
@apps/web/src/components/menu/sortable-category.tsx
@apps/web/src/components/menu/item-card.tsx
@apps/web/src/components/menu/item-form.tsx
@apps/web/src/components/dashboard/venue-settings-form.tsx
@apps/web/src/components/dashboard/orders-board.tsx
@apps/web/src/components/ordering/checkout-form.tsx
@apps/web/src/components/ui/button.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install sonner, add Skeleton/Spinner UI primitives, create loading.tsx skeletons for all dashboard routes</name>
  <files>
    apps/web/package.json
    apps/web/src/app/layout.tsx
    apps/web/src/components/ui/sonner.tsx
    apps/web/src/components/ui/skeleton.tsx
    apps/web/src/components/ui/spinner.tsx
    apps/web/src/app/(dashboard)/dashboard/loading.tsx
    apps/web/src/app/(dashboard)/venues/[venueId]/loading.tsx
    apps/web/src/app/(dashboard)/venues/[venueId]/menu/loading.tsx
    apps/web/src/app/(dashboard)/venues/[venueId]/orders/loading.tsx
    apps/web/src/app/(dashboard)/venues/[venueId]/analytics/loading.tsx
    apps/web/src/app/(dashboard)/venues/[venueId]/history/loading.tsx
    apps/web/src/app/(dashboard)/venues/[venueId]/qrcode/loading.tsx
  </files>
  <action>
1. Install sonner: `cd apps/web && pnpm add sonner`

2. Create `apps/web/src/components/ui/skeleton.tsx` — a simple Skeleton component using Tailwind:
```tsx
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
```
Use the `cn` utility from `@/lib/utils` (already exists in shadcn projects).

3. Create `apps/web/src/components/ui/spinner.tsx` — a small Loader2 spinner component:
```tsx
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} />;
}
```

4. Create `apps/web/src/components/ui/sonner.tsx` — re-export sonner's Toaster with app theme:
```tsx
'use client';
import { Toaster as SonnerToaster } from 'sonner';
export function Toaster() {
  return <SonnerToaster position="bottom-right" richColors closeButton />;
}
```

5. Update `apps/web/src/app/layout.tsx` — add `<Toaster />` inside `<body>` after `{children}`. Keep the existing minimal layout structure.

6. Create loading.tsx files for each dashboard route. Each should export a default function that returns skeleton UI matching the page layout:

- `dashboard/loading.tsx`: Header skeleton (h-8 w-48) + grid of 3 card skeletons (h-32 each) matching the venue card grid layout
- `venues/[venueId]/loading.tsx`: Back link skeleton + h1 skeleton + form skeleton blocks
- `venues/[venueId]/menu/loading.tsx`: Header skeleton + 3 category-shaped skeletons (h-24 rounded-lg border) stacked vertically
- `venues/[venueId]/orders/loading.tsx`: Header skeleton + 3-column grid of card skeletons (matching the kanban board layout)
- `venues/[venueId]/analytics/loading.tsx`: Header skeleton + 2x2 grid of chart-shaped skeletons (h-64)
- `venues/[venueId]/history/loading.tsx`: Header skeleton + table-shaped skeleton (h-8 rows x 5)
- `venues/[venueId]/qrcode/loading.tsx`: Header skeleton + centered square skeleton (h-64 w-64)

Each loading.tsx should use the Skeleton component and match the approximate layout of its corresponding page.tsx so content doesn't jump on load.
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte/apps/web && pnpm build 2>&1 | tail -20</automated>
  </verify>
  <done>
    - sonner installed and Toaster rendered in root layout
    - Skeleton and Spinner UI primitives exist
    - Every dashboard route has a loading.tsx with layout-matched skeletons
    - Build succeeds with no errors
  </done>
</task>

<task type="auto">
  <name>Task 2: Add toast notifications to all mutations and enhance empty states</name>
  <files>
    apps/web/src/components/menu/category-list.tsx
    apps/web/src/components/menu/sortable-category.tsx
    apps/web/src/components/menu/item-card.tsx
    apps/web/src/components/menu/item-form.tsx
    apps/web/src/components/dashboard/venue-settings-form.tsx
    apps/web/src/components/dashboard/orders-board.tsx
    apps/web/src/components/ordering/checkout-form.tsx
    apps/web/src/app/(dashboard)/dashboard/page.tsx
    apps/web/src/app/(dashboard)/venues/[venueId]/orders/page.tsx
  </files>
  <action>
Add `import { toast } from 'sonner'` to each client component that performs mutations. Add toast calls after successful and failed operations. CRITICAL: Do NOT use react-hook-form (per MEMORY.md). All forms use plain `action={formAction}` from `useActionState`.

**category-list.tsx:**
- After successful category create (when formAction returns no error): `toast.success('Category created')`
- On reorder failure: `toast.error('Failed to reorder categories')`
- On reorder success is implicit (optimistic), no toast needed

**sortable-category.tsx:**
- After successful rename: `toast.success('Category renamed')`
- After successful delete: `toast.success('Category deleted')`
- On delete failure (409 has items): `toast.error('Remove all items before deleting this category')`
- On rename failure: `toast.error('Failed to rename category')`
- Add Spinner to the delete confirmation button while isPending

**item-card.tsx:**
- Read the file first to see current patterns
- After availability toggle success: `toast.success(isAvailable ? 'Item available' : 'Item unavailable')` 
- On toggle failure (rollback): `toast.error('Failed to update availability')`
- After delete success: `toast.success('Item deleted')`
- On delete failure: `toast.error('Failed to delete item')`

**item-form.tsx:**
- After successful create/edit: `toast.success(editItem ? 'Item updated' : 'Item created')`
- On failure: `toast.error(state.error || 'Failed to save item')`

**venue-settings-form.tsx:**
- Read the file first
- After successful update: `toast.success('Venue settings saved')`
- On failure: `toast.error(state.error || 'Failed to save settings')`
- Add Spinner to save button while pending

**orders-board.tsx:**
- After status update success: `toast.success('Order moved to [status]')`
- On status update failure: `toast.error('Failed to update order status')`

**checkout-form.tsx:**
- On PAC order placed error: existing error state is fine, but add `toast.error(message)` too for consistency
- On Stripe initiation error: same pattern

**Enhanced empty states:**

**dashboard/page.tsx** (venues.length === 0 section):
- Replace the plain text with a more visual empty state: centered layout with a large Store icon (h-16 w-16 text-muted-foreground/50), a heading "No venues yet", a description "Create your first venue to start building menus and accepting orders.", and the existing CreateVenueCard below it. Wrap in a `flex flex-col items-center justify-center py-20 text-center` container.

**orders page** (when initialOrders is empty):
- In orders/page.tsx, when initialOrders is empty AND no error, pass an `isEmpty` prop or handle in OrdersBoard
- In orders-board.tsx, when orders array is empty across all columns, show a centered empty state: ClipboardList icon (from lucide-react, h-16 w-16), "No active orders", "Orders will appear here in real-time when customers place them."

Keep all existing inline error messages (the red text below forms) as they are — toasts supplement, not replace.
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte/apps/web && pnpm build 2>&1 | tail -20</automated>
  </verify>
  <done>
    - Every mutation (create, update, delete, toggle, reorder, status change) shows a toast on success and failure
    - Dashboard empty state shows friendly illustration with CTA
    - Orders board empty state shows friendly illustration
    - All existing inline validation errors preserved
    - Build succeeds with no errors
  </done>
</task>

</tasks>

<verification>
- `cd apps/web && pnpm build` completes without errors
- All loading.tsx files exist for dashboard routes: `ls apps/web/src/app/\(dashboard\)/*/loading.tsx apps/web/src/app/\(dashboard\)/venues/\[venueId\]/*/loading.tsx`
- Toaster is rendered in root layout: `grep -n 'Toaster' apps/web/src/app/layout.tsx`
- Toast imports exist in mutation components: `grep -rn "from 'sonner'" apps/web/src/components/`
</verification>

<success_criteria>
- Every dashboard route shows skeleton loaders during navigation (loading.tsx files)
- Toast notifications fire on all create/update/delete/toggle operations (success + error)
- Empty states for dashboard (no venues) and orders board (no orders) show friendly illustrations with clear CTAs
- Spinner component available and used on async buttons
- Build passes cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/5-ux-improvements-loading-states-error-fee/5-SUMMARY.md`
</output>
