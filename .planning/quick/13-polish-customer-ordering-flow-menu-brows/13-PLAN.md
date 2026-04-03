---
phase: quick-13
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/app/(menu)/layout.tsx
  - apps/web/src/components/ordering/menu-page.tsx
  - apps/web/src/components/ordering/menu-item-row.tsx
  - apps/web/src/components/ordering/category-nav.tsx
  - apps/web/src/components/ordering/cart-button.tsx
  - apps/web/src/components/ordering/cart-drawer.tsx
  - apps/web/src/components/ordering/item-detail-sheet.tsx
  - apps/web/src/components/ordering/checkout-form.tsx
  - apps/web/src/components/ordering/stripe-payment-form.tsx
  - apps/web/src/components/ordering/order-status.tsx
  - apps/web/src/app/(menu)/menu/[slug]/checkout/page.tsx
  - apps/web/src/app/(menu)/menu/[slug]/order/[orderId]/page.tsx
autonomous: true
requirements: [QUICK-13]

must_haves:
  truths:
    - "Menu page feels like a premium restaurant app on mobile — branded header, smooth nav, appealing item cards"
    - "Cart drawer has polished item display with clear quantity controls and totals"
    - "Checkout page has clean form with prominent payment options and trust signals"
    - "Order status page has large clear status indicator with smooth visual progression"
    - "All pages share a cohesive premium visual language — consistent spacing, typography, color, and orange brand accents"
  artifacts:
    - path: "apps/web/src/components/ordering/menu-page.tsx"
      provides: "Premium branded menu header and category layout"
    - path: "apps/web/src/components/ordering/cart-drawer.tsx"
      provides: "Polished cart with better item display and visual hierarchy"
    - path: "apps/web/src/components/ordering/checkout-form.tsx"
      provides: "Clean checkout with trust signals and premium feel"
    - path: "apps/web/src/components/ordering/order-status.tsx"
      provides: "Large status indicator with refined step progression"
  key_links:
    - from: "menu-page.tsx"
      to: "category-nav.tsx, menu-item-row.tsx, item-detail-sheet.tsx"
      via: "component composition"
      pattern: "consistent premium styling across all sub-components"
    - from: "cart-drawer.tsx"
      to: "checkout page"
      via: "Link to /menu/[slug]/checkout"
      pattern: "visual continuity from cart to checkout"
---

<objective>
Polish the entire customer ordering flow to feel like a premium, modern mobile restaurant ordering app.

Purpose: Customers scanning QR codes land on these pages on their phones. The current UI is functional but plain. Premium visual refinement — better typography, spacing, color usage, subtle Motion animations, and cohesive brand presence — will make the experience feel trustworthy and delightful, directly impacting order completion rates.

Output: All customer-facing ordering components visually refined with consistent premium styling.
</objective>

<execution_context>
@/home/alfie/.claude/get-shit-done/workflows/execute-plan.md
@/home/alfie/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/app/globals.css
@apps/web/src/app/(menu)/layout.tsx
@apps/web/src/app/(menu)/menu/[slug]/page.tsx
@apps/web/src/app/(menu)/menu/[slug]/checkout/page.tsx
@apps/web/src/app/(menu)/menu/[slug]/order/[orderId]/page.tsx
@apps/web/src/components/ordering/menu-page.tsx
@apps/web/src/components/ordering/menu-item-row.tsx
@apps/web/src/components/ordering/category-nav.tsx
@apps/web/src/components/ordering/cart-button.tsx
@apps/web/src/components/ordering/cart-drawer.tsx
@apps/web/src/components/ordering/item-detail-sheet.tsx
@apps/web/src/components/ordering/checkout-form.tsx
@apps/web/src/components/ordering/stripe-payment-form.tsx
@apps/web/src/components/ordering/order-status.tsx

<interfaces>
<!-- Brand system from globals.css -->
CSS custom properties:
  --color-brand: #f97316 (orange)
  --color-brand-dark: #ea580c
  --primary: oklch(0.65 0.19 45) (warm orange in oklch)
  Font: Inter with font-feature-settings "cv02", "cv03", "cv04", "cv11"

<!-- Types from page.tsx -->
From apps/web/src/app/(menu)/menu/[slug]/page.tsx:
```typescript
export interface PublicMenuItem {
  id: string; name: string; description: string | null;
  price: string; imageUrl: string | null; isAvailable: boolean; sortOrder: number;
}
export interface PublicCategory { id: string; name: string; sortOrder: number; items: PublicMenuItem[]; }
export interface PublicVenue {
  id: string; name: string; slug: string; logoUrl: string | null;
  paymentMode: 'PREPAY_REQUIRED' | 'PAY_AT_COUNTER' | 'BOTH';
  categories: PublicCategory[];
}
```

From apps/web/src/app/(menu)/menu/[slug]/order/[orderId]/page.tsx:
```typescript
export interface PublicOrder {
  id: string; referenceCode: string;
  status: 'PENDING_PAYMENT' | 'RECEIVED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  customerName: string; totalAmount: string; createdAt: string;
  items: Array<{ itemNameAtOrder: string; unitPriceAtOrder: string; quantity: number; }>;
}
```

Motion library: `motion` (formerly framer-motion) is installed — use `import { motion, AnimatePresence } from 'motion/react'`
shadcn/ui Drawer: already used in cart-drawer.tsx and item-detail-sheet.tsx
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Polish menu browsing — header, category nav, item cards, item detail sheet, and cart</name>
  <files>
    apps/web/src/app/(menu)/layout.tsx
    apps/web/src/components/ordering/menu-page.tsx
    apps/web/src/components/ordering/menu-item-row.tsx
    apps/web/src/components/ordering/category-nav.tsx
    apps/web/src/components/ordering/cart-button.tsx
    apps/web/src/components/ordering/cart-drawer.tsx
    apps/web/src/components/ordering/item-detail-sheet.tsx
  </files>
  <action>
    Redesign the menu browsing experience to feel like a premium mobile restaurant app. All changes are visual/CSS — no logic changes. Use `motion/react` for subtle entrance animations. Use the orange brand color (`text-primary`, `bg-primary`, `border-primary`) as the accent instead of plain black.

    **layout.tsx:**
    - Change bg from `bg-gray-50/50` to `bg-white` — white is cleaner for a food ordering app on mobile.

    **menu-page.tsx — Header:**
    - Make the header more branded and prominent. Add a warm gradient or subtle orange accent strip at the top.
    - Increase venue name size to `text-3xl` with `font-extrabold`. Add a "Menu" subtitle below in lighter weight.
    - If venue has a logo, show it larger (h-14 w-14) with a subtle ring/shadow.
    - Add bottom padding and a more refined bottom border (e.g. a thin orange line or soft shadow instead of plain gray border).
    - Wrap category sections in a `motion.section` with subtle fade-up on mount: `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}`.

    **menu-page.tsx — Category headings:**
    - Replace the plain gray `bg-gray-50` category heading with a more refined look: larger text (`text-lg font-bold`), left orange accent bar (3px left border in primary color), white bg, more padding (`px-5 py-4`). Add `scroll-mt-14` so the sticky nav doesn't overlap when scrolling to a category.

    **category-nav.tsx:**
    - Make active pill use the brand orange (`bg-primary text-white`) instead of black.
    - Increase pill padding slightly. Add a subtle bottom shadow to the sticky nav bar.
    - Add `snap-x snap-mandatory` to the nav and `snap-start` to each button for smoother horizontal scrolling on mobile.

    **menu-item-row.tsx:**
    - Improve spacing: increase padding to `px-5 py-4`.
    - Make the item name slightly smaller (`text-[15px]`) but with `font-semibold` for better visual balance.
    - Add a subtle hover/active state with a left orange border that slides in: `border-l-3 border-transparent active:border-primary transition-all`.
    - Make the price use `text-primary font-bold` for brand consistency.
    - For the thumbnail, increase to `h-[76px] w-[76px]` with `rounded-2xl` for more modern feel.

    **item-detail-sheet.tsx:**
    - Add a small orange accent line at the top of the drawer content (a decorative `<div className="mx-auto mt-2 h-1 w-12 rounded-full bg-primary/30" />`).
    - Use `text-primary` for the price display.
    - Change "Add to Cart" button from `bg-black` to `bg-primary hover:bg-primary/90 active:bg-primary/80` with white text.
    - Add a `motion.div` wrapper around the button with `whileTap={{ scale: 0.97 }}`.

    **cart-button.tsx:**
    - Change from `bg-black` to `bg-primary` orange. The count badge becomes `bg-white text-primary`.
    - Add a subtle `motion.button` with `whileTap={{ scale: 0.95 }}` and `animate={{ y: [4, 0] }}` on mount for a small bounce-in.
    - Add `shadow-[0_4px_20px_rgba(249,115,22,0.4)]` for a branded glow effect.

    **cart-drawer.tsx:**
    - Change the "Checkout" button from `bg-black` to `bg-primary hover:bg-primary/90` with white text.
    - Make quantity control buttons use orange accent on hover: `hover:border-primary hover:text-primary`.
    - Add a small item count summary next to "Your Cart" title (e.g., "Your Cart (3)").
    - Improve the total display: make the price `text-lg font-bold text-primary`.
    - Add subtle `motion.li` fade-in for each cart item: `initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}`.
  </action>
  <verify>
    cd /home/alfie/bite-byte/apps/web && npx next build 2>&1 | tail -5
  </verify>
  <done>
    Menu page has branded orange header with prominent venue name, category nav uses orange active pills with snap scrolling, item rows have refined typography and orange price accents, item detail sheet and cart use orange branded buttons, cart button is orange with glow, cart drawer has orange checkout CTA — all with subtle Motion entrance animations. Build succeeds with no errors.
  </done>
</task>

<task type="auto">
  <name>Task 2: Polish checkout and order status pages</name>
  <files>
    apps/web/src/app/(menu)/menu/[slug]/checkout/page.tsx
    apps/web/src/components/ordering/checkout-form.tsx
    apps/web/src/components/ordering/stripe-payment-form.tsx
    apps/web/src/app/(menu)/menu/[slug]/order/[orderId]/page.tsx
    apps/web/src/components/ordering/order-status.tsx
  </files>
  <action>
    Polish the checkout and order status pages to match the premium orange-branded feel established in Task 1. All changes are visual — no logic changes. Use `motion/react` for subtle animations.

    **checkout/page.tsx:**
    - Add a branded header strip at the top: venue name in a compact bar with an orange left accent or small orange icon.
    - Style the back arrow as a proper rounded button: `h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200`.
    - Make "Checkout" heading `text-2xl font-extrabold tracking-tight`.

    **checkout-form.tsx:**
    - Wrap the entire form in a `motion.form` with `initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}` for a smooth entrance.
    - Style the name input focus ring to orange: `focus:ring-primary/30 focus:border-primary` instead of `focus:ring-black`.
    - For payment method radio cards (BOTH mode), use orange for the selected state: `border-primary bg-primary/5` instead of `border-black bg-gray-50`. Add a small icon for each option — a credit card icon for Stripe, a building icon for PAY_AT_COUNTER (inline SVGs).
    - In the Order Summary section: give it a more premium card feel with `rounded-2xl shadow-sm`. Make the header `bg-primary/5` with `text-primary` text instead of plain gray. Make the total row use `text-primary font-bold` for the amount.
    - Change the submit button from `bg-black` to `bg-primary hover:bg-primary/90 active:bg-primary/80 rounded-2xl`. Add `motion.button` with `whileTap={{ scale: 0.98 }}`.
    - Add a trust signal below the button: a small lock icon + "Secure & encrypted" text in muted gray, centered. Simple inline SVG lock icon.
    - For the PAC info box, keep `bg-blue-50` — it's informational, not brand-colored.
    - In the Stripe payment view (clientSecret set), style the summary box with `bg-primary/5 border-primary/20` instead of `bg-gray-50`.

    **stripe-payment-form.tsx:**
    - Change "Pay Now" button from `bg-black` to `bg-primary hover:bg-primary/90 rounded-2xl`. Add `motion.button` with `whileTap={{ scale: 0.98 }}`.

    **order/[orderId]/page.tsx:**
    - Make the page heading more celebratory: larger `text-3xl font-extrabold` "Order Status". The subtitle should feel warmer: "Sit tight — we'll keep you updated."
    - Wrap content in a `motion.div` with fade-in.

    **order-status.tsx:**
    - **Reference code card:** Make it more prominent with an orange-accented design. Use `bg-primary/5 border-primary/20` instead of `bg-gray-50 border-gray-200`. Make the reference code `text-primary` instead of `text-black`. Add a subtle pulsing dot animation next to the reference when status is RECEIVED or PREPARING (using `motion.div` with `animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}`).
    - **Step progression:** Change current step indicator from `bg-black` to `bg-primary`. Completed steps stay `bg-green-500`. Current step label becomes `text-primary` instead of `text-black`. Add `motion.div` with `initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}` on the current step circle for a pop-in effect.
    - **READY state:** When status is READY, add a celebratory visual — a green checkmark circle that's larger (`h-16 w-16`) with a confetti-like animation (scale bounce: `motion.div` with `animate={{ scale: [0, 1.2, 1] }} transition={{ type: 'spring', bounce: 0.5 }}`), placed above the steps. Add text "Your order is ready!" in `text-green-600 font-bold text-xl`.
    - **Order items summary:** Match the checkout's premium card style — `rounded-2xl shadow-sm`, orange-accented header `bg-primary/5`.
    - **Back to menu link:** Style as a proper button: `inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium hover:bg-gray-50`.
  </action>
  <verify>
    cd /home/alfie/bite-byte/apps/web && npx next build 2>&1 | tail -5
  </verify>
  <done>
    Checkout page has branded header, orange-accented form inputs, premium order summary card, orange submit button with trust signal below, orange-accented Stripe view. Order status page has orange-themed reference card with pulsing indicator, orange current-step progression, celebratory READY state animation, premium items card, and styled back-to-menu button. Build succeeds with no errors.
  </done>
</task>

</tasks>

<verification>
- `cd /home/alfie/bite-byte/apps/web && npx next build` completes without errors
- All customer-facing pages use consistent orange brand accent instead of plain black
- Motion animations are subtle (< 0.4s durations) and don't block interaction
- No logic, state management, or API call changes — purely visual refinement
</verification>

<success_criteria>
- Menu browsing page: branded orange header, snap-scrolling category nav with orange active pills, refined item cards with orange price accents, orange branded buttons throughout
- Cart: orange checkout CTA, orange quantity control hover states, motion entrance animations on items
- Checkout: orange-accented form, premium order summary card, orange submit with trust signal, payment radio cards with icons
- Order status: orange reference card with live pulse, orange step progression, celebratory READY animation, premium items card
- Cohesive premium feel across all four pages — consistent typography, spacing, color usage, and subtle animations
- Build passes with zero errors
</success_criteria>

<output>
After completion, create `.planning/quick/13-polish-customer-ordering-flow-menu-brows/13-SUMMARY.md`
</output>
