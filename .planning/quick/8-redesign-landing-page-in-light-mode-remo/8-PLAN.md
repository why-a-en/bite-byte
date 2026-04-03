---
phase: quick-8
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/landing/animated-landing.tsx
  - apps/web/src/components/landing/magnetic-cursor.tsx
  - apps/web/src/app/page.tsx
autonomous: true
requirements: [LANDING-REDESIGN]
must_haves:
  truths:
    - "Landing page loads in light mode with clean, airy aesthetic"
    - "No magnetic cursor effect anywhere on the page"
    - "Hero section immediately communicates QR-code ordering value prop"
    - "Page guides user eye naturally: hero -> social proof -> features -> how-it-works -> CTA"
    - "All sections fully responsive on mobile"
    - "Animations are subtle and purposeful, never overwhelming"
  artifacts:
    - path: "apps/web/src/components/landing/animated-landing.tsx"
      provides: "Complete redesigned landing page"
      min_lines: 300
  key_links:
    - from: "apps/web/src/app/page.tsx"
      to: "apps/web/src/components/landing/animated-landing.tsx"
      via: "default import"
      pattern: "import AnimatedLanding"
---

<objective>
Complete redesign of the Bite Byte landing page with a clean, light, UX-first approach.

Purpose: The current landing page feels heavy and overwhelming (magnetic cursor, dense GSAP animations, horizontal scroll sections). Users land here first — the page must immediately communicate the product's value (QR code to kitchen in 60 seconds) with a light, modern aesthetic inspired by Linear/Vercel/Stripe.

Output: A fully rewritten animated-landing.tsx with clean design, subtle Motion animations, and deleted magnetic cursor.
</objective>

<execution_context>
@/home/alfie/.claude/get-shit-done/workflows/execute-plan.md
@/home/alfie/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/components/landing/animated-landing.tsx (REWRITE — current 629-line file)
@apps/web/src/components/landing/magnetic-cursor.tsx (DELETE)
@apps/web/src/components/landing/smooth-scroll-provider.tsx (keep if useful, remove if heavy)
@apps/web/src/components/landing/split-text.tsx (keep if useful, remove if heavy)
@apps/web/src/components/landing/horizontal-scroll-section.tsx (DELETE — too heavy for this design)
@apps/web/src/app/page.tsx (entry point — keep simple)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Delete heavy components and clean up imports</name>
  <files>apps/web/src/components/landing/magnetic-cursor.tsx, apps/web/src/components/landing/horizontal-scroll-section.tsx</files>
  <action>
Delete these files entirely:
- `apps/web/src/components/landing/magnetic-cursor.tsx` — the magnetic cursor effect is heavy and distracting
- `apps/web/src/components/landing/horizontal-scroll-section.tsx` — horizontal scroll is a jarring UX pattern for a landing page

Keep `smooth-scroll-provider.tsx` (Lenis smooth scroll is lightweight and pleasant) and `split-text.tsx` (may be useful for subtle text reveals).
  </action>
  <verify>ls apps/web/src/components/landing/ shows only animated-landing.tsx, smooth-scroll-provider.tsx, split-text.tsx</verify>
  <done>magnetic-cursor.tsx and horizontal-scroll-section.tsx deleted</done>
</task>

<task type="auto">
  <name>Task 2: Rewrite animated-landing.tsx as a clean, light, UX-first landing page</name>
  <files>apps/web/src/components/landing/animated-landing.tsx</files>
  <action>
COMPLETE REWRITE of animated-landing.tsx. Do NOT patch the existing code. Start fresh.

**Design philosophy:** Linear/Vercel/Stripe aesthetic. Light background (#ffffff or very subtle warm gray). Generous whitespace. Typography-driven hierarchy. Subtle motion that enhances, never distracts.

**Tech stack:**
- Motion (framer-motion) for scroll-triggered fade-ins and subtle entrance animations. NO GSAP — remove the dependency entirely from this component. Motion's whileInView is sufficient and lighter.
- Tailwind CSS for all styling
- Keep LenisSmoothScroll wrapper for buttery scrolling
- NO magnetic cursor import

**Page structure (top to bottom):**

1. **Navigation** — Fixed top bar, white/transparent with backdrop blur. Logo "Bite Byte" on left, "Sign In" + "Get Started" buttons on right. Clean, minimal. Mobile: hamburger menu or just CTA buttons.

2. **Hero Section** — THE most important section. Must communicate the entire product in 5 seconds.
   - Large headline: "QR Code Ordering for Modern Restaurants" or similar (concise, benefit-driven)
   - Subheadline: "Scan. Order. Done. From table to kitchen in 60 seconds — no app downloads, no waiting for staff."
   - Two CTAs: "Get Started Free" (primary, solid) + "See How It Works" (secondary, outline, scrolls to how-it-works)
   - Visual: A clean illustration area or a subtle gradient/mesh background. NO heavy hero images that slow load. Consider a simple phone mockup or abstract geometric shapes in soft brand colors.
   - Animation: Fade-up stagger for headline -> subheadline -> CTAs. Subtle, 0.3-0.5s duration, ease-out.

3. **Social Proof / Stats Bar** — Thin horizontal section with key numbers.
   - "60s average order time" / "Zero apps to download" / "5 min setup" / "100% mobile friendly"
   - Simple count-up animation on scroll into view using Motion
   - Light gray or very subtle tinted background to separate from hero

4. **Features Section** — 3-4 feature cards in a grid.
   - QR Code Ordering, Real-Time Dashboard, Flexible Payments, Analytics
   - Each card: icon (use simple SVG or lucide-react icons), title, 1-2 line description
   - Cards should be clean with subtle border or shadow, generous padding
   - Grid: 2x2 on desktop, single column on mobile
   - Animation: Stagger fade-up as they enter viewport

5. **How It Works** — 3-step visual flow.
   - Step 1: Create Your Venue / Step 2: Print QR Code / Step 3: Start Taking Orders
   - Numbered steps with connecting line or arrow between them
   - Clean layout, horizontal on desktop, vertical on mobile
   - Animation: Sequential reveal as user scrolls

6. **CTA Section** — Final conversion push.
   - "Ready to modernize your ordering?" or similar
   - "Get Started Free" button (large, prominent)
   - Maybe a secondary line: "Free to set up. No credit card required."
   - Subtle gradient or brand-color background to stand out

7. **Footer** — Minimal.
   - "Bite Byte" logo, copyright, maybe links to Sign In / Dashboard
   - Keep it super light

**Color palette:**
- Background: #ffffff (pure white) with occasional #f9fafb (gray-50) section separators
- Text: #111827 (gray-900) for headings, #6b7280 (gray-500) for body
- Accent/Brand: Use a warm orange or vibrant coral as the primary CTA color (something appetizing for a food platform). Suggest #f97316 (orange-500) or similar.
- Avoid: Heavy blacks, dark backgrounds, neon colors

**Animation guidelines:**
- Use Motion's `whileInView` with `viewport={{ once: true }}` for all scroll animations
- Entrance animations: translateY(20-30px) + opacity 0->1, duration 0.5-0.6s
- Stagger children by 0.1-0.15s intervals
- NO parallax, NO horizontal scroll, NO floating orbs, NO magnetic effects
- Total motion on page should feel like a gentle breeze, not a storm

**Typography:**
- Hero heading: text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight
- Section headings: text-3xl md:text-4xl font-bold
- Body: text-lg text-gray-500 leading-relaxed
- Use the project's existing font stack

**Responsive:**
- Mobile-first approach
- Hero: stack vertically, text-center on mobile
- Features grid: 1 col mobile, 2 cols tablet, 2x2 desktop
- How it works: vertical stack on mobile, horizontal on desktop
- Nav: simplify for mobile (just logo + CTA)
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>
- Landing page renders with light, clean aesthetic
- No GSAP imports in the component (Motion only)
- No MagneticCursor import or usage
- All 7 sections present: nav, hero, stats, features, how-it-works, CTA, footer
- Fully responsive (mobile-first Tailwind classes throughout)
- Animations are subtle fade-ups with whileInView, no heavy effects
  </done>
</task>

</tasks>

<verification>
- `npx next build` completes without errors
- No references to magnetic-cursor.tsx or horizontal-scroll-section.tsx in any import
- No GSAP import in animated-landing.tsx
- Page loads with white/light background
- All sections render and are responsive
</verification>

<success_criteria>
- Landing page feels light, clean, and modern — not heavy or overwhelming
- Value proposition (QR code ordering) is immediately clear within 5 seconds of landing
- Animations enhance rather than distract
- magnetic-cursor.tsx and horizontal-scroll-section.tsx are deleted
- Build passes with no errors
</success_criteria>

<output>
After completion, create `.planning/quick/8-redesign-landing-page-in-light-mode-remo/8-SUMMARY.md`
</output>
