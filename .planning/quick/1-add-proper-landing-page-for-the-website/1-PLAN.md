---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/app/page.tsx
autonomous: false
requirements: [LANDING-01]

must_haves:
  truths:
    - "Visitor sees a compelling hero section explaining what Bite Byte does"
    - "Visitor sees key value propositions (speed, no app, no account, real-time)"
    - "Visitor has clear CTAs to sign up as a venue owner or try a demo menu"
    - "Page is fully responsive (mobile-first, looks good on all breakpoints)"
  artifacts:
    - path: "apps/web/src/app/page.tsx"
      provides: "Complete landing page with hero, features, how-it-works, and CTA sections"
      min_lines: 80
  key_links:
    - from: "apps/web/src/app/page.tsx"
      to: "/register"
      via: "Link component CTA button"
      pattern: "href.*register"
    - from: "apps/web/src/app/page.tsx"
      to: "/login"
      via: "Link component in nav"
      pattern: "href.*login"
---

<objective>
Replace the bare placeholder landing page with a proper marketing page that communicates Bite Byte's value proposition and drives venue owner sign-ups.

Purpose: First impression for visitors — convert interest into sign-ups.
Output: A complete, responsive landing page at `/`.
</objective>

<execution_context>
@/home/alfie/.claude/get-shit-done/workflows/execute-plan.md
@/home/alfie/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/app/page.tsx
@apps/web/src/app/layout.tsx
@apps/web/src/app/globals.css

Brand color is orange: `--color-brand: #f97316` / `--color-brand-dark: #ea580c`.
shadcn/ui components available: Button, Card, Badge, Separator.
Tailwind v4 with CSS-first config. No external icon library installed — use inline SVGs or unicode/emoji-free text symbols.
Auth pages: `/login`, `/register`.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build complete landing page</name>
  <files>apps/web/src/app/page.tsx</files>
  <action>
Replace the placeholder page.tsx with a full landing page. This is a Server Component (no "use client" needed). Use Next.js Link for navigation and import Button from @/components/ui/button.

Structure the page with these sections, all using Tailwind classes directly:

1. **Nav bar** — sticky top, white background, subtle bottom border. Left: "Bite Byte" text logo (font-bold text-xl, the "Byte" portion in text-orange-500). Right: Link to /login ("Log in" text link) and Link to /register (Button with orange bg using `bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white`).

2. **Hero section** — centered text, generous vertical padding (py-24 md:py-32). Headline: "From QR Scan to Kitchen in 60 Seconds" (text-4xl md:text-6xl font-bold tracking-tight). Subheadline: "Let your customers order from their phone. No app download. No account required. Just scan, order, done." (text-lg md:text-xl text-muted-foreground, max-w-2xl mx-auto). Two CTA buttons: "Get Started Free" (Link to /register, orange bg, large) and "See How It Works" (anchor to #how-it-works, secondary/outline variant, large).

3. **Social proof bar** — simple row of 3 stats in a muted background strip: "Zero friction ordering", "Works on any phone", "Setup in minutes". Use text only, no icons.

4. **Features grid** — heading "Everything You Need to Modernize Ordering". 2-col grid on md, 1-col on mobile. 4 feature cards using Card component:
   - "Instant QR Ordering" — Customers scan a QR code at their table and browse your full menu on their phone. No app install needed.
   - "Real-Time Order Tracking" — Orders appear on your live dashboard the moment they're placed. Track status from received to completed.
   - "Flexible Payments" — Accept card payments via Stripe or let customers pay at the counter. You choose.
   - "Analytics Dashboard" — See your top-selling items, daily revenue, and order volume at a glance.

5. **How It Works** — id="how-it-works", heading "Up and Running in 3 Steps". Three numbered steps in a horizontal row (md) / vertical stack (mobile):
   - Step 1: "Create Your Venue" — Sign up, add your restaurant or food truck, and build your menu.
   - Step 2: "Print Your QR Code" — Download your unique QR code and place it on tables or at the counter.
   - Step 3: "Start Taking Orders" — Customers scan, order, and pay. You see it all in real time.

6. **Bottom CTA** — orange gradient background (bg-gradient-to-r from-orange-500 to-orange-600), white text. "Ready to Ditch the Paper Menu?" heading. "Get Started Free" button (white bg, orange text, Link to /register).

7. **Footer** — minimal, muted text. "Bite Byte" on left, "Built for restaurants and food trucks" center, copyright right. Single row on md, stacked on mobile.

Spacing: use consistent section padding (py-16 md:py-24). Max content width: max-w-6xl mx-auto px-4 md:px-6.

Do NOT install any new dependencies. Do NOT use any icon libraries. Keep feature descriptions concise (1-2 sentences each).
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte && pnpm --filter web build 2>&1 | tail -5</automated>
  </verify>
  <done>Landing page builds without errors, contains hero with CTA linking to /register, features grid, how-it-works section, and footer. Page is responsive via Tailwind breakpoint classes.</done>
</task>

<task type="checkpoint:human-verify" gate="non-blocking">
  <name>Task 2: Visual verification of landing page</name>
  <files>apps/web/src/app/page.tsx</files>
  <action>User visually verifies the landing page looks correct and all links work.</action>
  <what-built>Complete landing page replacing the placeholder at /</what-built>
  <how-to-verify>
    1. Run `pnpm --filter web dev` and visit http://localhost:3000
    2. Verify hero section with headline and two CTA buttons
    3. Verify features grid shows 4 cards
    4. Verify "How It Works" shows 3 steps
    5. Click "Get Started Free" — should navigate to /register
    6. Click "Log in" in nav — should navigate to /login
    7. Resize browser to mobile width — verify responsive layout
  </how-to-verify>
  <verify>User confirms page looks good</verify>
  <done>Landing page visually approved by user</done>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- `pnpm --filter web build` completes without errors
- Landing page renders at / with all sections
- Links to /register and /login work
</verification>

<success_criteria>
- Placeholder page replaced with a professional landing page
- All 7 sections present: nav, hero, social proof, features, how-it-works, bottom CTA, footer
- CTAs link to /register and /login
- Responsive layout works on mobile and desktop
- No new dependencies added
</success_criteria>

<output>
After completion, create `.planning/quick/1-add-proper-landing-page-for-the-website/1-SUMMARY.md`
</output>
