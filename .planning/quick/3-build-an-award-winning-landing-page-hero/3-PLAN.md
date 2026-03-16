---
phase: quick-3
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/package.json
  - apps/web/src/components/landing/animated-landing.tsx
  - apps/web/src/components/landing/magnetic-cursor.tsx
  - apps/web/src/components/landing/smooth-scroll-provider.tsx
  - apps/web/src/components/landing/split-text.tsx
  - apps/web/src/components/landing/horizontal-scroll-section.tsx
  - apps/web/src/app/page.tsx
autonomous: true
requirements: [QUICK-3]
must_haves:
  truths:
    - "Page loads with a cinematic split-text headline reveal animated by Motion"
    - "Scrolling past the hero enters a GSAP ScrollTrigger horizontal-scroll pinned section"
    - "Page uses Lenis for buttery smooth scroll behavior"
    - "Buttons and interactive elements have a magnetic cursor follow effect"
    - "Design uses a light theme with orange as the single accent color"
  artifacts:
    - path: "apps/web/src/components/landing/animated-landing.tsx"
      provides: "Main award-winning landing page component"
    - path: "apps/web/src/components/landing/split-text.tsx"
      provides: "Motion-powered split text reveal component"
    - path: "apps/web/src/components/landing/horizontal-scroll-section.tsx"
      provides: "GSAP ScrollTrigger horizontal scroll pinned section"
    - path: "apps/web/src/components/landing/smooth-scroll-provider.tsx"
      provides: "Lenis smooth scroll initialization"
    - path: "apps/web/src/components/landing/magnetic-cursor.tsx"
      provides: "Magnetic cursor effect component"
  key_links:
    - from: "apps/web/src/app/page.tsx"
      to: "animated-landing.tsx"
      via: "default import"
    - from: "animated-landing.tsx"
      to: "smooth-scroll-provider.tsx"
      via: "LenisSmoothScroll wraps page"
    - from: "animated-landing.tsx"
      to: "horizontal-scroll-section.tsx"
      via: "HorizontalScrollSection component"
    - from: "animated-landing.tsx"
      to: "split-text.tsx"
      via: "SplitText component in hero"
---

<objective>
Build an award-winning hero section and landing page with cinematic animations.

Purpose: Replace the current GSAP-only landing page with a premium experience combining Motion (framer-motion) for entrance animations, GSAP ScrollTrigger for a horizontal-scroll pinned showcase section, Lenis for smooth scrolling, and a magnetic cursor effect. Light theme with orange accent.

Output: Complete landing page rewrite with split-text hero reveal, horizontal scroll section, smooth scrolling, and magnetic cursor.
</objective>

<execution_context>
@/home/alfie/.claude/get-shit-done/workflows/execute-plan.md
@/home/alfie/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/components/landing/animated-landing.tsx
@apps/web/src/app/page.tsx
@apps/web/package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install dependencies and create utility components</name>
  <files>
    apps/web/package.json
    apps/web/src/components/landing/split-text.tsx
    apps/web/src/components/landing/smooth-scroll-provider.tsx
    apps/web/src/components/landing/magnetic-cursor.tsx
    apps/web/src/components/landing/horizontal-scroll-section.tsx
  </files>
  <action>
    1. Install Motion and Lenis from apps/web/:
       `pnpm add motion @studio-freight/lenis`
       (motion is the new package name for framer-motion v11+)

    2. Create `split-text.tsx` — a reusable Motion component:
       - Accept `text: string`, `className?: string`, `delay?: number` props
       - Split text into individual characters (preserve spaces as word boundaries)
       - Each character wrapped in a span with `overflow-hidden` parent
       - Use Motion's `motion.span` with `variants` for staggered reveal:
         - hidden: `{ y: '100%', opacity: 0, rotateX: -80 }`
         - visible: `{ y: 0, opacity: 1, rotateX: 0 }` with spring transition
       - Parent uses `motion.div` with `staggerChildren: 0.03` and `delayChildren: delay`
       - Add perspective to parent for 3D rotation effect
       - Use `whileInView` with `once: true` for viewport-triggered animation

    3. Create `smooth-scroll-provider.tsx` — Lenis wrapper:
       - 'use client' component
       - Initialize Lenis in useEffect with options: `{ lerp: 0.1, duration: 1.2, smoothWheel: true }`
       - Use requestAnimationFrame loop to call `lenis.raf(time)`
       - Connect Lenis to GSAP ScrollTrigger via `ScrollTrigger.scrollerProxy` is NOT needed — Lenis works with native scroll, just call `ScrollTrigger.update()` in the raf callback
       - Actually simpler: just `lenis.on('scroll', ScrollTrigger.update)` and use `gsap.ticker.add((time) => lenis.raf(time * 1000))` plus `gsap.ticker.lagSmoothing(0)`
       - Cleanup on unmount: `lenis.destroy()`
       - Wrap children: `<>{children}</>`

    4. Create `magnetic-cursor.tsx` — a custom cursor that magnetically attracts to interactive elements:
       - 'use client' component
       - Render a 40px circle div with `position: fixed`, `pointer-events: none`, `z-index: 9999`
       - Track mouse position with `mousemove` listener on window
       - Use `motion.div` with `animate={{ x: mouseX, y: mouseY }}` and spring transition for smooth follow
       - On hover over elements with `data-magnetic` attribute: cursor scales up (1.5x), changes border color to orange
       - When mouse enters a `data-magnetic` element, calculate offset from center and apply magnetic pull (element moves toward cursor slightly using GSAP)
       - Hide on mobile (check for touch device or use media query `pointer: fine`)
       - Style: transparent fill, 2px border in gray-300, mix-blend-mode difference on dark sections

    5. Create `horizontal-scroll-section.tsx` — GSAP ScrollTrigger pinned horizontal scroll:
       - 'use client' component
       - Accept `children` and render them in a horizontal flex row
       - Outer container is the trigger, inner container scrolls horizontally
       - Use `useEffect` with `gsap.to(innerRef, { xPercent: -100 * (panelCount - 1) / panelCount * 100 })` — actually calculate the exact scroll amount: `x: -(innerScrollWidth - viewportWidth)`
       - ScrollTrigger config: `{ trigger: outerRef, pin: true, scrub: 1, end: () => '+=' + innerRef.scrollWidth, anticipatePin: 1 }`
       - Each panel is 100vw wide, `flex-shrink: 0`
       - Use this to showcase 3-4 feature panels with large typography, illustrations/icons, and descriptive text
       - Panels should have alternating light backgrounds (white, orange-50, white, amber-50)
       - Clean up ScrollTrigger on unmount
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte/apps/web && node -e "require('motion'); require('@studio-freight/lenis')" && echo "deps OK" && ls src/components/landing/split-text.tsx src/components/landing/smooth-scroll-provider.tsx src/components/landing/magnetic-cursor.tsx src/components/landing/horizontal-scroll-section.tsx && echo "files OK"</automated>
  </verify>
  <done>All 4 utility components exist with correct exports. motion and @studio-freight/lenis installed.</done>
</task>

<task type="auto">
  <name>Task 2: Rebuild the landing page with award-winning hero</name>
  <files>
    apps/web/src/components/landing/animated-landing.tsx
    apps/web/src/app/page.tsx
  </files>
  <action>
    Completely rewrite `animated-landing.tsx` to create an award-winning landing page. The page should feel premium, cinematic, and modern — inspired by sites like Linear, Raycast, and Vercel.

    **Overall structure wrapped in `LenisSmoothScroll` provider.**

    **NAV (sticky):**
    - Clean minimal nav with "Bite Byte" wordmark left, "Log in" + "Get Started" right
    - All interactive elements get `data-magnetic` attribute
    - Frosted glass effect: `bg-white/70 backdrop-blur-xl`
    - Subtle border bottom

    **HERO SECTION — the showpiece:**
    - Full viewport height (`min-h-screen flex items-center justify-center`)
    - Use `SplitText` component for the main headline: "From QR Scan to Kitchen in 60 Seconds"
      - First line in dark text, "in 60 Seconds" line in gradient orange
      - Use two SplitText instances with different delays for a cascading effect
    - Below headline: subtitle fades in with Motion (`motion.p` with fade-up, delay 0.8s)
    - CTA buttons animate in with Motion (`motion.div` stagger, delay 1s)
    - Background: subtle animated gradient mesh using CSS — 2-3 large radial gradients in orange/amber at very low opacity, animated with CSS `@keyframes` for gentle movement (NOT GSAP, keep it lightweight)
    - Small floating particles/dots scattered around hero using `motion.div` with `animate` infinite loop for gentle drift
    - The whole hero should feel like it "breathes"

    **HORIZONTAL SCROLL SHOWCASE (pinned section):**
    - Use `HorizontalScrollSection` component
    - 4 panels, each 100vw:
      - Panel 1: "Instant QR Ordering" — large icon/illustration (use SVG), big bold text, short description. Clean white bg.
      - Panel 2: "Real-Time Dashboard" — show a stylized mockup of the dashboard using CSS shapes/borders (not an image). Light orange-50 bg.
      - Panel 3: "Flexible Payments" — Stripe + counter pay icons, description. White bg.
      - Panel 4: "Analytics at a Glance" — stylized chart shapes in CSS. Amber-50 bg.
    - Each panel has a large number (01, 02, 03, 04) in light gray as a watermark
    - Content within each panel should animate in as it becomes visible (use GSAP ScrollTrigger with the horizontal position)

    **HOW IT WORKS (vertical section after horizontal):**
    - 3-step process with large numbered circles
    - Connecting line that draws in on scroll (GSAP)
    - Each step reveals on scroll with Motion `whileInView`
    - Keep the existing step data but elevate the design:
      - Larger step numbers in gradient circles
      - More whitespace, more premium feel

    **SOCIAL PROOF / STATS BANNER:**
    - Dark section (gray-900) with animated counters (GSAP)
    - Stats: "60s average order", "0 apps to download", "5min setup", "100% mobile friendly"
    - Counters animate when scrolled into view

    **FINAL CTA:**
    - Full-width orange gradient section
    - Large headline with SplitText animation
    - Single CTA button with magnetic effect
    - Floating geometric shapes animated with GSAP

    **FOOTER:**
    - Minimal footer, same as current

    **Magnetic cursor:**
    - Render `MagneticCursor` component at the top level inside the landing
    - Add `data-magnetic` to all buttons and links

    **Design principles:**
    - Light theme throughout, orange-500 as the single accent
    - Generous whitespace (py-32, py-40 for sections)
    - Large typography (text-6xl to text-8xl for headlines on desktop)
    - Subtle animations that enhance, not distract
    - Every section should have a scroll-triggered entrance animation
    - Use Motion for entrance animations (whileInView), GSAP for scroll-linked animations (scrub)

    **page.tsx stays the same** — just imports AnimatedLanding. No changes needed unless the import path changes.
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte && pnpm --filter web build 2>&1 | tail -20</automated>
  </verify>
  <done>
    Landing page builds without errors. Hero section has split-text Motion reveal. Horizontal scroll pinned section works with 4 feature panels. Lenis smooth scrolling active. Magnetic cursor follows mouse on desktop. Light theme with orange accent throughout.
  </done>
</task>

</tasks>

<verification>
1. `pnpm --filter web build` completes without errors
2. `pnpm --filter web dev` — visit http://localhost:3000:
   - Hero text animates in character-by-character on page load
   - Scrolling is smooth (Lenis)
   - Scrolling past hero enters a pinned horizontal scroll section with 4 panels
   - Continuing to scroll exits the horizontal section and enters vertical content
   - Custom cursor follows mouse on desktop, magnetically attracted to buttons
   - All sections have scroll-triggered entrance animations
   - Mobile responsive (no horizontal scroll section issues on mobile — should stack vertically or be skipped)
</verification>

<success_criteria>
- Split-text reveal animation plays on page load using Motion
- Horizontal scroll section pins and scrolls 4 feature panels using GSAP ScrollTrigger
- Lenis provides smooth scroll behavior across the page
- Magnetic cursor effect works on desktop for all interactive elements
- Light theme with orange-500 accent, premium whitespace and typography
- Page builds and renders without errors on both desktop and mobile
</success_criteria>

<output>
After completion, create `.planning/quick/3-build-an-award-winning-landing-page-hero/3-SUMMARY.md`
</output>
