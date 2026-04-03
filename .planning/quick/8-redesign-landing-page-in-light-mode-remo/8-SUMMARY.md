---
phase: quick-8
plan: 01
subsystem: landing-page
tags: [ux, landing, redesign, light-mode]
dependency-graph:
  requires: []
  provides: [clean-landing-page]
  affects: [apps/web/src/components/landing/]
tech-stack:
  added: []
  patterns: [motion-whileInView, lucide-react-icons, mobile-first-responsive]
key-files:
  created: []
  modified:
    - apps/web/src/components/landing/animated-landing.tsx
  deleted:
    - apps/web/src/components/landing/magnetic-cursor.tsx
    - apps/web/src/components/landing/horizontal-scroll-section.tsx
decisions:
  - Motion whileInView replaces all GSAP ScrollTrigger animations — lighter, simpler, sufficient
  - lucide-react icons replace inline SVG components for consistency with project iconography
  - LenisSmoothScroll retained (lightweight smooth scroll) while SplitText import removed (not needed for clean design)
  - Mobile nav uses full-screen overlay instead of hamburger dropdown for better UX
metrics:
  duration: 2min
  completed: 2026-04-03
---

# Quick Task 8: Redesign Landing Page in Light Mode

Complete rewrite of animated-landing.tsx from a heavy GSAP/parallax/magnetic-cursor page to a clean, light, UX-first landing page with Motion animations and lucide-react icons.

## One-liner

Clean light-mode landing page rewrite with Motion fade-ups, lucide-react icons, mobile-first responsive layout, and zero GSAP

## What Changed

### Task 1: Delete heavy components
- Removed `magnetic-cursor.tsx` (distracting cursor effect)
- Removed `horizontal-scroll-section.tsx` (jarring horizontal scroll UX)
- Retained `smooth-scroll-provider.tsx` and `split-text.tsx`

### Task 2: Rewrite animated-landing.tsx
Complete rewrite with 7 clean sections:

1. **Navigation** — Sticky white/blur header, logo + auth links, mobile hamburger with full-screen overlay
2. **Hero** — Large headline "From QR Scan to Kitchen in 60 Seconds", subtitle, dual CTA buttons (Get Started Free + See How It Works), subtle gradient background
3. **Stats Bar** — 4 key metrics (60s, 0 apps, 5min setup, 100% mobile) with staggered fade-up
4. **Features** — 2x2 grid of feature cards with hover effects (QR Ordering, Dashboard, Payments, Analytics)
5. **How It Works** — 3-step flow with icons, connecting line on desktop, vertical stack on mobile
6. **CTA** — Orange gradient card with "Ready to modernize your ordering?" and signup button
7. **Footer** — Minimal: logo, tagline, copyright

**Design decisions:**
- White (#ffffff) background with gray-50 section separators
- Orange-500 as primary accent color
- All animations: `whileInView` with `viewport={{ once: true }}`, translateY(24px) + opacity, 0.5-0.6s duration
- No GSAP, no parallax, no floating orbs, no magnetic effects
- Mobile-first Tailwind classes throughout

## Commits

| # | Hash | Message |
|---|------|---------|
| 1 | ae0ad7c | chore(quick-8): delete magnetic cursor and horizontal scroll components |
| 2 | 53c1678 | feat(quick-8): rewrite landing page with clean light UX-first design |

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- Build passes cleanly with no errors
- No references to magnetic-cursor.tsx or horizontal-scroll-section.tsx in any import
- No GSAP import in animated-landing.tsx
- All 7 sections present and responsive
- Component is 327 lines (meets min_lines: 300 requirement)
