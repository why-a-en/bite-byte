---
phase: quick-4
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/landing/animated-landing.tsx
  - apps/web/src/components/landing/magnetic-cursor.tsx
  - apps/web/src/components/landing/horizontal-scroll-section.tsx
autonomous: true
requirements: [QUICK-4]
must_haves:
  truths:
    - "Landing page has a white/light background instead of dark #0C0C0C"
    - "All text is dark (gray-900/gray-700) on light backgrounds, readable and clean"
    - "Orange accent color preserved for brand elements (buttons, gradients, badges)"
    - "Nav, stats, steps, features, CTA sections all render correctly in light mode"
    - "Mobile and desktop layouts remain intact"
  artifacts:
    - path: "apps/web/src/components/landing/animated-landing.tsx"
      provides: "Light-mode landing page"
    - path: "apps/web/src/components/landing/magnetic-cursor.tsx"
      provides: "Cursor adapted for light backgrounds"
  key_links:
    - from: "animated-landing.tsx"
      to: "body background"
      via: "useEffect setting document.body.style.backgroundColor"
      pattern: "backgroundColor.*white|#fff"
---

<objective>
Retheme the entire landing page from dark mode (#0C0C0C bg, white text) to a clean, light mode (white/light bg, dark text) while preserving the orange brand accent, all animations, and layout structure.

Purpose: Give the landing page a cleaner, more modern, lighter aesthetic.
Output: Updated landing page components rendering in light mode.
</objective>

<execution_context>
@/home/alfie/.claude/get-shit-done/workflows/execute-plan.md
@/home/alfie/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/components/landing/animated-landing.tsx
@apps/web/src/components/landing/magnetic-cursor.tsx
@apps/web/src/components/landing/horizontal-scroll-section.tsx
@apps/web/src/app/layout.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Retheme animated-landing.tsx to light mode</name>
  <files>apps/web/src/components/landing/animated-landing.tsx</files>
  <action>
Transform all color values from dark to light throughout the component. Specific changes:

**Body and base background:**
- `document.body.style.backgroundColor` from `'#0C0C0C'` to `'#ffffff'`
- Root div: `bg-[#0C0C0C]` to `bg-white`, `text-white` to `text-gray-900`

**Nav:**
- `bg-[#0C0C0C]/80` to `bg-white/80`
- `border-white/[0.06]` to `border-gray-200`
- Logo: `text-white` to `text-gray-900`, keep `text-orange-500` span
- Login link: `text-gray-400 hover:text-white` to `text-gray-500 hover:text-gray-900`
- Get Started button: keep orange (already good)

**Hero section:**
- Dark overlay `bg-[#0C0C0C]/75` to `bg-white/60` (lighter overlay so hero image shows through subtly)
- Bottom gradient: `from-[#0C0C0C]` to `from-white`
- Blob radial gradients: keep orange tones but adjust opacity for light bg (increase slightly so they show against white)
- Badge: `bg-orange-500/10` keep, `text-orange-400` keep, `border-orange-500/20` keep (these work on light)
- Headline `text-white` to `text-gray-900`
- Keep the orange gradient text line as-is
- Subtitle: `text-gray-400` to `text-gray-500`
- "See How It Works" border button: `border-white/30 text-white hover:border-orange-400 hover:bg-orange-500/10` to `border-gray-300 text-gray-700 hover:border-orange-400 hover:bg-orange-50`
- Floating orbs: change `bg-orange-500/20` etc to slightly higher opacity like `bg-orange-500/15` (they need to show on white)

**Stats section:**
- `bg-white/[0.03]` to `bg-gray-50`, `border-white/[0.06]` to `border-gray-100`
- Stat values: keep `text-orange-500`
- Labels: `text-gray-500` stays fine

**Features heading:**
- `text-white` to `text-gray-900`, keep orange gradient span

**Mobile feature cards:**
- `bg-white/[0.04] border-white/[0.08]` to `bg-white border border-gray-100 shadow-sm`
- Number watermark: `text-white/[0.04]` to `text-gray-100`
- Icon box: keep `bg-orange-500/10 text-orange-500`
- Title: `text-white` to `text-gray-900`
- Desc: `text-gray-400` to `text-gray-500`

**Desktop horizontal scroll panels:**
- Panel wrapper: `bg-[#0C0C0C]` to `bg-white`
- Dark gradient overlays: change `rgba(12,12,12,...)` to `rgba(255,255,255,...)` — white gradient overlays over images for text readability on light bg
- Keep subtle orange radial tint
- Number watermark: `text-white/[0.03]` to `text-gray-900/[0.04]`
- Number pill: keep orange styling
- Title: `text-white` to `text-gray-900`
- Desc: `text-gray-400` to `text-gray-600`

**How It Works section:**
- `bg-gradient-to-b from-white/[0.02] to-transparent` to `bg-gradient-to-b from-gray-50 to-transparent`
- Background glow: keep orange radial, works fine on light
- Badge: keep as-is (orange on light works)
- Heading: `text-white` to `text-gray-900`, keep orange gradient span
- Connecting line: keep orange gradient
- Step circles: keep orange gradient (these are the brand element)
- Step title: `text-white` to `text-gray-900`
- Step desc: `text-gray-500` stays fine

**Dark Stats Banner → Light Stats Banner:**
- `bg-white/[0.03] border-white/[0.06]` to `bg-gray-50 border-gray-100`
- Keep orange gradient text values
- Labels: `text-gray-500` stays

**CTA section:**
- Keep the full orange gradient background — this is the hero CTA, it should stay bold
- All white text on orange background stays correct
- Footer text: keep white/white-alpha on orange bg

Do NOT change: any animation logic, GSAP ScrollTrigger config, data attributes, component structure, imports, or responsive breakpoints. Only change color/style classes and inline style color values.
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte && npx next build --no-lint 2>&1 | tail -5</automated>
  </verify>
  <done>All sections render with light backgrounds, dark text, orange accents preserved. No dark-mode remnants visible. Build succeeds.</done>
</task>

<task type="auto">
  <name>Task 2: Update magnetic cursor for light backgrounds</name>
  <files>apps/web/src/components/landing/magnetic-cursor.tsx</files>
  <action>
Update cursor colors for visibility on white/light backgrounds:

- Default ring border: `rgba(255,255,255,0.7)` to `rgba(0,0,0,0.5)` (dark ring on light bg)
- Default shadow: `rgba(255,255,255,0.1)` to `rgba(0,0,0,0.08)`
- Magnetic hover: keep orange (`rgba(249,115,22,...)`) — orange works on both
- Center dot: `background: '#ffffff'` to `background: '#1a1a1a'` (dark dot on light bg)
- Remove or adjust `mixBlendMode: 'difference'` — on a white background, difference mode inverts to black which is fine, but test that it looks clean. If the blend mode causes odd artifacts on the orange CTA section (which has colored bg), consider removing mixBlendMode entirely and using direct colors instead.

Do NOT change: spring config, sizing, event listeners, visibility logic, or animation behavior.
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte && npx next build --no-lint 2>&1 | tail -5</automated>
  </verify>
  <done>Custom cursor ring and dot are visible on light backgrounds. Orange hover state preserved.</done>
</task>

</tasks>

<verification>
- `cd /home/alfie/bite-byte && pnpm --filter web build` succeeds without errors
- Visual: landing page loads with white/light background, dark text, orange accents
- All scroll animations still trigger correctly
- Mobile layout (vertical cards) renders with light styling
- Desktop horizontal scroll panels readable with light overlays
- CTA section retains bold orange gradient background
</verification>

<success_criteria>
- Landing page is fully light-mode: white backgrounds, dark text, no #0C0C0C remnants
- Orange brand color preserved on buttons, badges, gradients, step circles, stats
- All GSAP and Motion animations work unchanged
- Mobile and desktop responsive layouts intact
- Build passes
</success_criteria>

<output>
After completion, create `.planning/quick/4-retheme-landing-page-to-light-mode-with-/4-SUMMARY.md`
</output>
