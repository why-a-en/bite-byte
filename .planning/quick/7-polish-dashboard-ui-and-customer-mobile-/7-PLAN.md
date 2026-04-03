---
phase: quick-7
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/dashboard/analytics/order-volume-chart.tsx
  - apps/web/src/components/dashboard/analytics/revenue-cards.tsx
  - apps/web/src/components/dashboard/analytics/top-items-list.tsx
  - apps/web/src/app/(dashboard)/venues/[venueId]/analytics/page.tsx
  - apps/web/src/components/dashboard/orders-board.tsx
  - apps/web/src/components/dashboard/order-card.tsx
  - apps/web/src/components/dashboard/venue-card.tsx
  - apps/web/src/app/(dashboard)/dashboard/page.tsx
  - apps/web/src/components/ordering/menu-page.tsx
  - apps/web/src/components/ordering/menu-item-row.tsx
  - apps/web/src/components/ordering/cart-button.tsx
  - apps/web/src/components/ordering/cart-drawer.tsx
  - apps/web/src/components/ordering/category-nav.tsx
  - apps/web/src/components/ordering/item-detail-sheet.tsx
  - apps/web/src/components/ordering/checkout-form.tsx
  - apps/web/src/components/ordering/order-status.tsx
  - apps/web/src/app/(menu)/menu/[slug]/checkout/page.tsx
  - apps/web/src/app/(menu)/menu/[slug]/order/[orderId]/page.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Dashboard analytics charts have polished styling with proper spacing, rounded bars, gradient fills, and clear axis labels"
    - "Dashboard cards (revenue, venue, order) have consistent spacing, subtle hover effects, and professional typography"
    - "Customer mobile ordering flow (menu, cart, checkout, order status) is comfortable to use on a 375px-wide phone screen"
    - "Category nav pills have proper tap targets (min 44px height) and smooth horizontal scroll on mobile"
    - "Cart drawer, item detail sheet, and checkout form have mobile-friendly spacing, large tap targets, and readable text"
  artifacts:
    - path: "apps/web/src/components/dashboard/analytics/order-volume-chart.tsx"
      provides: "Polished bar chart with gradient fill and rounded corners"
    - path: "apps/web/src/components/ordering/menu-page.tsx"
      provides: "Mobile-optimized menu layout with proper safe areas"
  key_links:
    - from: "all ordering components"
      to: "mobile viewport"
      via: "Tailwind responsive classes"
      pattern: "px-4|py-3|min-h-\\[44px\\]|text-base"
---

<objective>
Polish the dashboard UI (analytics charts, cards, typography, spacing) and optimize the customer-facing mobile ordering flow for phone screens.

Purpose: The dashboard should look professional for venue owners, and the customer ordering flow (scanned via QR code on phones) must feel native and comfortable on small screens.
Output: Polished dashboard analytics + mobile-optimized customer ordering components.
</objective>

<execution_context>
@/home/alfie/.claude/get-shit-done/workflows/execute-plan.md
@/home/alfie/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/components/dashboard/analytics/order-volume-chart.tsx
@apps/web/src/components/dashboard/analytics/revenue-cards.tsx
@apps/web/src/components/dashboard/analytics/top-items-list.tsx
@apps/web/src/app/(dashboard)/venues/[venueId]/analytics/page.tsx
@apps/web/src/components/dashboard/orders-board.tsx
@apps/web/src/components/dashboard/order-card.tsx
@apps/web/src/components/dashboard/venue-card.tsx
@apps/web/src/app/(dashboard)/dashboard/page.tsx
@apps/web/src/components/ordering/menu-page.tsx
@apps/web/src/components/ordering/menu-item-row.tsx
@apps/web/src/components/ordering/cart-button.tsx
@apps/web/src/components/ordering/cart-drawer.tsx
@apps/web/src/components/ordering/category-nav.tsx
@apps/web/src/components/ordering/item-detail-sheet.tsx
@apps/web/src/components/ordering/checkout-form.tsx
@apps/web/src/components/ordering/order-status.tsx
@apps/web/src/app/(menu)/menu/[slug]/checkout/page.tsx
@apps/web/src/app/(menu)/menu/[slug]/order/[orderId]/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Polish dashboard analytics and cards</name>
  <files>
    apps/web/src/components/dashboard/analytics/order-volume-chart.tsx
    apps/web/src/components/dashboard/analytics/revenue-cards.tsx
    apps/web/src/components/dashboard/analytics/top-items-list.tsx
    apps/web/src/app/(dashboard)/venues/[venueId]/analytics/page.tsx
    apps/web/src/components/dashboard/orders-board.tsx
    apps/web/src/components/dashboard/order-card.tsx
    apps/web/src/components/dashboard/venue-card.tsx
    apps/web/src/app/(dashboard)/dashboard/page.tsx
  </files>
  <action>
    Polish the dashboard owner-facing UI with these specific changes:

    **order-volume-chart.tsx:**
    - Add a `YAxis` with formatted tick labels (hide grid lines on Y axis for clean look)
    - Change bar fill to use a gradient: add a `<defs>` with `<linearGradient>` from `hsl(var(--chart-1))` to a lighter tint
    - Increase `radius` to `[4, 4, 0, 0]` (rounded top corners only, flat bottom)
    - Set `min-h-[250px]` on ChartContainer instead of 200px for more visual presence
    - Add `strokeDasharray="3 3"` to CartesianGrid for subtle dashed grid lines
    - Format XAxis ticks to show day name abbreviation (Mon, Tue, etc.) using `new Date(d).toLocaleDateString('en-GB', { weekday: 'short' })`

    **revenue-cards.tsx:**
    - Add a subtle gradient background to each card: `bg-gradient-to-br from-background to-muted/30`
    - Make the amount text slightly larger: `text-3xl` instead of `text-2xl`
    - Add a secondary line under each amount showing "+X% vs last period" as placeholder text in `text-xs text-emerald-600` (hardcode "+0%" for now since we have no comparison data yet — just the visual scaffold)
    - Add `tracking-tight` to the amount for tighter number spacing

    **top-items-list.tsx:**
    - Add a horizontal bar behind each item as a visual proportion indicator: compute max count, then render a `div` with `w-[${(count/max)*100}%]` using inline style for the width, `h-1.5 rounded-full bg-primary/15` below each item row
    - Increase spacing between items from `space-y-3` to `space-y-4`
    - Make rank badge slightly larger: `h-7 w-7` with `text-sm` instead of `h-6 w-6` with `text-xs`

    **analytics/page.tsx:**
    - Add `tracking-tight` to the h1
    - Increase gap between sections from `space-y-6` to `space-y-8`

    **orders-board.tsx:**
    - Add subtle colored background to each Kanban column header area: RECEIVED gets `bg-blue-50`, PREPARING gets `bg-amber-50`, READY gets `bg-green-50` — apply as a rounded-lg background on the column container div
    - Add `p-3 rounded-xl` to each column container for visual separation
    - Increase the "No active orders" empty state icon to `h-20 w-20`

    **order-card.tsx:**
    - Change `border-l-4` to `border-l-[3px]` for a more refined left border
    - Add `shadow-sm hover:shadow-md transition-shadow` to the Card for depth
    - Make the reference code slightly more prominent: add `bg-muted/50 px-1.5 py-0.5 rounded` around it

    **venue-card.tsx:**
    - Add `hover:border-primary/20` to the Card for subtle color hint on hover
    - Make the icon container slightly larger: `w-10 h-10` with `h-5 w-5` icon

    **dashboard/page.tsx:**
    - Add `tracking-tight` to the h1
    - Increase bottom margin from `mb-6` to `mb-8`
  </action>
  <verify>
    cd apps/web && npx next build 2>&1 | tail -5
  </verify>
  <done>Dashboard analytics page has polished charts with gradients/rounded bars, revenue cards have larger typography, top items show proportion bars, Kanban columns have colored backgrounds, all cards have refined hover states.</done>
</task>

<task type="auto">
  <name>Task 2: Optimize customer ordering flow for mobile</name>
  <files>
    apps/web/src/components/ordering/menu-page.tsx
    apps/web/src/components/ordering/menu-item-row.tsx
    apps/web/src/components/ordering/cart-button.tsx
    apps/web/src/components/ordering/cart-drawer.tsx
    apps/web/src/components/ordering/category-nav.tsx
    apps/web/src/components/ordering/item-detail-sheet.tsx
    apps/web/src/components/ordering/checkout-form.tsx
    apps/web/src/components/ordering/order-status.tsx
    apps/web/src/app/(menu)/menu/[slug]/checkout/page.tsx
    apps/web/src/app/(menu)/menu/[slug]/order/[orderId]/page.tsx
  </files>
  <action>
    Optimize all customer-facing ordering components for mobile phone screens (375px primary target). These are scanned via QR code on phones, so mobile UX is critical.

    **menu-page.tsx:**
    - Add `pb-safe` or `pb-32` (increased from `pb-28`) to main to ensure content is not hidden behind the floating cart button on phones with home indicator bars
    - Add `max-w-lg mx-auto` wrapper around the entire content for tablet/desktop so it does not stretch too wide
    - Make venue header slightly more prominent: venue name `text-2xl` instead of `text-xl`, add `tracking-tight`

    **menu-item-row.tsx:**
    - Increase padding from `p-4` to `px-4 py-5` for more breathing room between items
    - Make item name `text-base font-bold` instead of just `font-semibold` for better readability at arm's length
    - Increase thumbnail from `h-16 w-16` to `h-20 w-20` and add `shadow-sm` to the image
    - Add `rounded-xl` instead of `rounded-lg` to thumbnails for softer corners
    - Price text: change from `font-medium` to `font-semibold text-primary` to make price pop (use brand color)

    **cart-button.tsx:**
    - Increase vertical padding from `py-3` to `py-3.5` for a larger tap target
    - Add `safe-area-inset-bottom` awareness: change `bottom-6` to `bottom-8` to clear phone home indicators
    - Add `min-h-[52px]` for consistent button height
    - Increase shadow from `shadow-xl` to `shadow-2xl` for more floating effect

    **cart-drawer.tsx:**
    - Increase quantity control button size from `h-7 w-7` to `h-9 w-9` for better tap targets (44px minimum)
    - Increase the minus/plus text from `text-base` to `text-lg`
    - Increase padding on cart items from `py-3` to `py-4`
    - Make the checkout button taller: `py-4` instead of `py-3`
    - Add `text-lg` to the Checkout button text

    **category-nav.tsx:**
    - Increase pill padding from `px-4 py-1.5` to `px-5 py-2` for larger tap targets (meets 44px minimum)
    - Add `-webkit-overflow-scrolling: touch` via `scroll-smooth` class for smoother iOS scroll
    - Add `scrollbar-hide` class (or `[&::-webkit-scrollbar]:hidden`) to hide the scrollbar on mobile
    - Increase nav padding from `py-2` to `py-3` for more visual weight
    - Add a subtle shadow: `shadow-[0_1px_3px_rgba(0,0,0,0.05)]` to the sticky nav to separate it from scrolling content

    **item-detail-sheet.tsx:**
    - Increase image height from `h-56` to `h-64` for more visual impact
    - Add `rounded-t-xl overflow-hidden` to the image container if not already rounded
    - Make the "Add to Cart" button taller: `py-4` instead of `py-3`, and `text-lg`
    - Add price as a larger element: `text-2xl font-bold` instead of `text-lg font-semibold`

    **checkout-form.tsx:**
    - Increase input padding from `py-3` to `py-3.5` and make font `text-base` (prevents iOS zoom on focus which happens with font-size < 16px — CRITICAL for mobile)
    - Increase submit button to `py-4 text-lg rounded-xl` for a premium feel and larger tap target
    - Radio button labels: increase gap and add `py-3` padding for easier tapping
    - Add `rounded-xl` to the order summary card instead of `rounded-lg`
    - Payment method radio: wrap each option in a bordered card-like container `border rounded-xl p-4` with selected state having `border-black bg-gray-50`

    **order-status.tsx:**
    - Increase step indicator circles from `h-8 w-8` to `h-10 w-10` for better visibility
    - Make reference code even more prominent: `text-4xl` instead of `text-3xl`
    - Add more padding to the reference card: `px-6 py-6` instead of `px-4 py-4`
    - Increase connector line height from `h-8` to `h-10` for more breathing room
    - Make step labels `text-base` instead of default (which is text-sm-ish)

    **checkout/page.tsx:**
    - Add `max-w-lg mx-auto` if not already present (it is, good)
    - Increase top padding from `py-6` to `py-8`
    - Make back arrow and title more tappable: wrap back link in a larger touch area with `py-2`

    **order/[orderId]/page.tsx:**
    - Increase top padding from `py-6` to `py-8`
    - Make heading `text-2xl tracking-tight` instead of `text-xl`

    IMPORTANT: All `<input>` elements MUST have `text-base` (16px) to prevent iOS auto-zoom on focus. Do NOT use text-sm on any input.
  </action>
  <verify>
    cd apps/web && npx next build 2>&1 | tail -5
  </verify>
  <done>Customer ordering flow is optimized for mobile: larger tap targets (min 44px), comfortable spacing, larger thumbnails, iOS-safe input sizing, floating cart clears home indicators, category nav scrolls smoothly without visible scrollbar, checkout has premium card-style payment selectors.</done>
</task>

</tasks>

<verification>
- `cd apps/web && npx next build` completes without errors
- Visually inspect dashboard analytics at /venues/{id}/analytics — charts have gradients, revenue cards have large numbers, top items show proportion bars
- Visually inspect customer menu at /menu/{slug} on a 375px viewport — items have breathing room, thumbnails are larger, category pills are easy to tap, cart button floats above home indicator area
- Visually inspect checkout flow at /menu/{slug}/checkout — inputs do not trigger iOS zoom, buttons are large and tappable, payment method selector uses card-style layout
</verification>

<success_criteria>
- Build passes with zero errors
- All dashboard analytics components have enhanced visual styling (gradients, proportion bars, colored columns)
- All customer ordering components have mobile-optimized spacing, tap targets >= 44px, and iOS-safe input sizing
- No regressions in functionality (forms still submit, cart still works, charts still render data)
</success_criteria>

<output>
After completion, create `.planning/quick/7-polish-dashboard-ui-and-customer-mobile-/7-SUMMARY.md`
</output>
