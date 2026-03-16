---
phase: quick-3
plan: "01"
subsystem: landing-page
tags: [motion, framer-motion, lenis, gsap, scroll-trigger, animations, landing-page]
dependency_graph:
  requires: [gsap]
  provides: [landing-page-v3, split-text-component, smooth-scroll, magnetic-cursor, horizontal-scroll]
  affects: [apps/web/src/app/page.tsx]
tech_stack:
  added: [motion@12.36.0, "@studio-freight/lenis@1.0.42"]
  patterns: [split-text-reveal, lenis-gsap-integration, magnetic-cursor, pinned-horizontal-scroll, whileInView-entrance]
key_files:
  created:
    - apps/web/src/components/landing/split-text.tsx
    - apps/web/src/components/landing/smooth-scroll-provider.tsx
    - apps/web/src/components/landing/magnetic-cursor.tsx
    - apps/web/src/components/landing/horizontal-scroll-section.tsx
  modified:
    - apps/web/src/components/landing/animated-landing.tsx
    - apps/web/package.json
    - pnpm-lock.yaml
decisions:
  - "motion (framer-motion v11+) used for entrance animations (whileInView), GSAP for scroll-linked scrub animations"
  - "Lenis integrated via gsap.ticker.add pattern instead of scrollerProxy — simpler and fully compatible"
  - "HorizontalScrollSection disabled on mobile (max-width 767px) with vertical card fallback"
  - "MagneticCursor hidden on touch devices via pointer:coarse media query"
  - "data-magnetic attribute pattern for cursor hover detection — decoupled from component logic"
metrics:
  duration: 3min
  completed: "2026-03-16"
  tasks_completed: 2
  files_changed: 7
---

# Quick Task 3: Award-Winning Landing Page Hero Summary

**One-liner:** Premium landing page combining Motion split-text hero reveal, GSAP ScrollTrigger horizontal-scroll pinned showcase, Lenis smooth scrolling, and magnetic cursor with orange accent on light theme.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Install dependencies and create utility components | 7f8166b | split-text.tsx, smooth-scroll-provider.tsx, magnetic-cursor.tsx, horizontal-scroll-section.tsx, package.json |
| 2 | Rebuild the landing page with award-winning hero | 778f1ad | animated-landing.tsx |

## What Was Built

### Utility Components

**`split-text.tsx`** — Motion-powered character-by-character reveal:
- Splits text into words, then individual characters
- Each character wrapped with `overflow: hidden` parent to mask the reveal
- `rotateX: -80 → 0` with spring physics for 3D cinematic feel
- `staggerChildren: 0.03` and configurable `delayChildren` for cascading effect
- `whileInView` with `once: true` for viewport-triggered playback

**`smooth-scroll-provider.tsx`** — Lenis + GSAP integration:
- Lenis initialized with `lerp: 0.1, duration: 1.2, smoothWheel: true`
- Connected to GSAP via `gsap.ticker.add` pattern (not `scrollerProxy`)
- `lenis.on('scroll', ScrollTrigger.update)` keeps ScrollTrigger in sync
- Full cleanup on unmount

**`magnetic-cursor.tsx`** — Custom cursor with spring physics:
- `useSpring` from motion for smooth mouse tracking
- `data-magnetic` attribute detection via `mouseover/mouseout`
- Scales 1.5x and turns orange on magnetic element hover
- Hidden on touch devices (`pointer: coarse` media query)

**`horizontal-scroll-section.tsx`** — GSAP pinned horizontal scroll:
- Calculates exact scroll amount: `innerScrollWidth - viewportWidth`
- `pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true`
- Disabled on mobile (returns early for `max-width: 767px`)
- Accepts `panelCount` prop for precise width calculation

### Landing Page Rebuild (`animated-landing.tsx`)

**Hero section:**
- `SplitText` for "From QR Scan to Kitchen" (delay 0.2) and "in 60 Seconds" (delay 0.5)
- Motion badge, subtitle, and CTA buttons with staggered entrance
- Parallax blobs and floating orbs via GSAP
- Large responsive typography (5xl → 7xl → 8xl)

**Horizontal Scroll Showcase:**
- 4 feature panels (Instant QR Ordering, Real-Time Dashboard, Flexible Payments, Analytics)
- Large watermark numbers (01–04) in light gray
- Alternating backgrounds: white, orange-50, white, amber-50
- Mobile fallback: vertical card list

**How It Works:** Step circles with pop-in animation, connecting line draws left-to-right on scroll

**Dark Stats Banner:** Motion `whileInView` stagger for Free / 2min / 24/7 / 100% stats

**CTA Section:** Full-width orange gradient, `SplitText` headline, floating GSAP shapes

**Magnetic cursor:** Rendered at top level inside landing; all buttons and links have `data-magnetic`

## Deviations from Plan

None — plan executed exactly as written.

## Success Criteria Verification

- [x] Split-text reveal animation plays on page load using Motion
- [x] Horizontal scroll section pins and scrolls 4 feature panels using GSAP ScrollTrigger
- [x] Lenis provides smooth scroll behavior across the page
- [x] Magnetic cursor effect works on desktop for all interactive elements
- [x] Light theme with orange-500 accent, premium whitespace and typography
- [x] Page builds and renders without errors on both desktop and mobile

## Self-Check: PASSED

All created files exist on disk. Both task commits verified in git log.
