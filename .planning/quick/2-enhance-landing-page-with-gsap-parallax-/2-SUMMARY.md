---
phase: quick
plan: 2
subsystem: web/landing
tags: [gsap, animations, parallax, landing-page, tailwind]
dependency_graph:
  requires: [quick-1]
  provides: [animated-landing]
  affects: [apps/web/src/app/page.tsx]
tech_stack:
  added: [gsap@3.14.2, gsap/ScrollTrigger]
  patterns: [gsap-context-cleanup, scroll-trigger-animations, parallax-blobs]
key_files:
  created:
    - apps/web/src/components/landing/animated-landing.tsx
  modified:
    - apps/web/src/app/page.tsx
    - apps/web/package.json
    - pnpm-lock.yaml
decisions:
  - gsap.registerPlugin(ScrollTrigger) called at module level in "use client" component — safe, no window check needed
  - gsap.context() used for animation cleanup on unmount
  - data-* attributes (data-feature-card, data-step, etc.) used as GSAP selectors — avoids fragile CSS class selectors
  - Wave SVG dividers use hsl(var(--muted)) and hsl(var(--background)) to match Tailwind theme tokens
metrics:
  duration: 8min
  completed_date: 2026-03-15
  tasks_completed: 2
  files_modified: 4
---

# Quick Task 2: Enhance Landing Page with GSAP Parallax — Summary

**One-liner:** GSAP ScrollTrigger parallax landing with hero entrance, stagger reveals, glassmorphism nav, gradient headline, and wave SVG section dividers.

## What Was Built

The plain static landing page was upgraded into a visually polished animated page using GSAP and ScrollTrigger.

### Task 1 — Install GSAP and create animated landing client component

- Installed `gsap@3.14.2` via pnpm in the `apps/web` workspace.
- Created `apps/web/src/components/landing/animated-landing.tsx` as a `"use client"` component.
- All GSAP animations managed inside a single `useEffect` with `gsap.context()` for proper cleanup.
- Animations implemented:
  - **Hero entrance**: headline fades up from 30px + scale 0.95, subtext follows at 0.2s, CTA buttons stagger at 0.4s
  - **Parallax blobs**: two radial gradient divs behind hero translate at -100px and -60px over hero scroll range via `scrub: true`
  - **Social proof bar**: 3 columns stagger fade-up at `start: "top 80%"`
  - **Feature cards**: 4 cards stagger-reveal from y:40px + opacity 0; CSS hover applies `scale-[1.02] shadow-lg` and `border-orange-500/30`
  - **How-it-works**: 3 step divs fade-up staggered 0.2s; numbered circles scale from 0 with `back.out(1.7)` bounce
  - **CTA section**: inner container fade-up on scroll enter
  - **Decorative elements**: 2 dot-grid SVGs and a circle border with independent parallax speeds
- Aesthetic enhancements:
  - Glassmorphism nav: `bg-white/80 backdrop-blur-md`
  - Hero headline gradient: `from-gray-900 via-orange-600 to-orange-500 bg-clip-text text-transparent` on "60 Seconds"
  - Grain texture overlay: inline SVG feTurbulence noise at 3% opacity, fixed, pointer-events-none
  - Wave SVG dividers between all major sections using `preserveAspectRatio="none"`
  - Feature card hover borders: `hover:border-orange-500/30 transition-all duration-300`

### Task 2 — Wire server component wrapper and verify build

- Replaced `apps/web/src/app/page.tsx` with a 5-line thin server component wrapper that imports `AnimatedLanding`.
- `pnpm build` completed successfully with no errors or SSR warnings from GSAP.
- Landing page route `/` outputs 49.9 kB component chunk (164 kB first load JS including GSAP).

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `apps/web/src/components/landing/animated-landing.tsx` — exists, 325 lines (above 150 minimum)
- `apps/web/src/app/page.tsx` — exists, imports AnimatedLanding
- Commits: f4f4f9c (Task 1), eec7552 (Task 2)
- TypeScript: no errors (`tsc --noEmit` clean)
- Build: `pnpm build` succeeded
