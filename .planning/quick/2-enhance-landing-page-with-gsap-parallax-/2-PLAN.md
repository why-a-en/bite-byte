---
phase: quick
plan: 2
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/package.json
  - apps/web/src/app/page.tsx
  - apps/web/src/components/landing/animated-landing.tsx
  - pnpm-lock.yaml
autonomous: true
requirements: [QUICK-2]

must_haves:
  truths:
    - "Landing page loads with smooth hero entrance animation"
    - "Sections animate in on scroll with parallax effects"
    - "Feature cards stagger-reveal as user scrolls down"
    - "Page remains functional with JavaScript disabled (content visible, animations absent)"
  artifacts:
    - path: "apps/web/src/components/landing/animated-landing.tsx"
      provides: "Client component with all GSAP animations"
      min_lines: 150
    - path: "apps/web/src/app/page.tsx"
      provides: "Server component wrapper importing animated client component"
  key_links:
    - from: "apps/web/src/app/page.tsx"
      to: "apps/web/src/components/landing/animated-landing.tsx"
      via: "default import"
      pattern: "import.*AnimatedLanding"
---

<objective>
Enhance the Bite Byte landing page with GSAP-powered parallax scroll animations and aesthetic visual upgrades (gradient text, glassmorphism nav, staggered card reveals, decorative background elements).

Purpose: Transform the functional but plain landing page into a visually impressive, modern SaaS landing that builds trust and converts visitors.
Output: A polished, animated landing page using GSAP ScrollTrigger.
</objective>

<execution_context>
@/home/alfie/.claude/get-shit-done/workflows/execute-plan.md
@/home/alfie/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/app/page.tsx
@apps/web/package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install GSAP and create animated landing client component</name>
  <files>apps/web/package.json, pnpm-lock.yaml, apps/web/src/components/landing/animated-landing.tsx</files>
  <action>
1. Install GSAP in apps/web workspace:
   ```
   cd apps/web && pnpm add gsap
   ```

2. Create `apps/web/src/components/landing/animated-landing.tsx` as a "use client" component that contains the FULL landing page content (moved from page.tsx) with GSAP animations wired in via useGSAP or useEffect + useRef.

   GSAP setup pattern:
   - Import gsap and ScrollTrigger plugin
   - Register ScrollTrigger: `gsap.registerPlugin(ScrollTrigger)`
   - Use a single `useEffect` with a GSAP context (`gsap.context()`) for cleanup
   - Attach refs to section wrappers for ScrollTrigger targeting

   Animations to implement:

   a) **Hero entrance** (on page load, no scroll needed):
      - Headline: fade up from 30px below + slight scale from 0.95, duration 1s, ease "power3.out"
      - Subtext: fade up, 0.2s delay after headline
      - CTA buttons: fade up, 0.4s delay, stagger 0.1s between buttons

   b) **Parallax background drift on hero**:
      - Add a decorative div with a large soft radial gradient (orange-500/20 blurred circle) positioned absolute behind hero content
      - ScrollTrigger: translate Y by -100px over the hero scroll range, creating a slow parallax drift
      - Add a second gradient blob (blue-500/10) offset to the right, moving at a different speed for depth

   c) **Social proof bar**:
      - Each stat column fades up with stagger 0.15s on scroll into view
      - Use ScrollTrigger with `start: "top 80%"` so it triggers before fully in view

   d) **Feature cards staggered reveal**:
      - All 4 cards start opacity 0, y: 40px
      - ScrollTrigger batch or stagger: cards animate in 0.15s apart
      - Add subtle hover effect via CSS (not GSAP): `hover:scale-[1.02] hover:shadow-lg transition-all duration-300`

   e) **How-it-works sequential reveal**:
      - Each step fades up on scroll, staggered 0.2s
      - The numbered circles scale from 0 to 1 with a bounce ease ("back.out(1.7)")

   f) **CTA section parallax**:
      - The orange gradient background shifts slightly on scroll (background-position or translateY on a pseudo-element)

   Aesthetic enhancements (Tailwind classes, no GSAP needed):

   a) **Nav glassmorphism**: Change nav `bg-white` to `bg-white/80 backdrop-blur-md`

   b) **Hero headline gradient text**: Apply `bg-gradient-to-r from-gray-900 via-orange-600 to-orange-500 bg-clip-text text-transparent` to the headline (or just the key phrase)

   c) **Subtle grain overlay**: Add a full-page fixed div with a CSS noise texture using a tiny inline SVG data URI as background, opacity 3-5%, pointer-events-none. This adds visual texture.

   d) **Feature cards**: Add `border border-border/50 hover:border-orange-500/30 transition-all duration-300` for a subtle animated border on hover

   e) **Section dividers**: Use angled/wave SVG dividers between major sections instead of flat color transitions. Use inline SVG (not external files) with `preserveAspectRatio="none"` and absolute positioning.

   f) **Decorative floating elements**: Add 2-3 small decorative SVG shapes (circles, dots grid) positioned absolute in the features section, low opacity (5-10%), parallax-animated at different speeds via ScrollTrigger.

   Keep all existing content, links, button hrefs, and section IDs intact. The component receives no props.
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte/apps/web && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>animated-landing.tsx exists as a "use client" component with GSAP ScrollTrigger animations on all sections, aesthetic Tailwind enhancements applied, TypeScript compiles clean</done>
</task>

<task type="auto">
  <name>Task 2: Wire server component wrapper and verify build</name>
  <files>apps/web/src/app/page.tsx</files>
  <action>
Replace the contents of `apps/web/src/app/page.tsx` with a thin server component wrapper:

```tsx
import AnimatedLanding from '@/components/landing/animated-landing';

export default function HomePage() {
  return <AnimatedLanding />;
}
```

This keeps page.tsx as a server component (for metadata export capability in future) while delegating all rendering to the client component.

Then run a full build to confirm no SSR issues with GSAP (GSAP must only execute client-side, which "use client" handles — gsap.registerPlugin should be guarded or simply called at module level in the client component since "use client" ensures it only runs in the browser).

If the build shows any SSR-related GSAP errors (window/document undefined), wrap the gsap.registerPlugin call in a `typeof window !== 'undefined'` check, though this should not be needed with "use client".
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte/apps/web && pnpm build 2>&1 | tail -20</automated>
  </verify>
  <done>page.tsx imports AnimatedLanding, `pnpm build` succeeds with no errors, landing page renders with all animations functional</done>
</task>

</tasks>

<verification>
- `cd apps/web && pnpm build` completes successfully
- `cd apps/web && npx tsc --noEmit` reports no type errors
- Landing page at localhost:3000 shows animated sections on scroll
- All existing links (/login, /register, #how-it-works) still work
</verification>

<success_criteria>
- GSAP installed and ScrollTrigger animations active on all landing sections
- Hero has entrance animation + parallax gradient blobs
- Feature cards stagger-reveal on scroll
- How-it-works steps animate sequentially
- Nav has glassmorphism (backdrop-blur)
- Hero headline has gradient text treatment
- Build passes clean with no SSR errors
</success_criteria>

<output>
After completion, create `.planning/quick/2-enhance-landing-page-with-gsap-parallax-/2-SUMMARY.md`
</output>
