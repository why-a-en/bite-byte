---
phase: quick-6
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/landing/animated-landing.tsx
autonomous: true
requirements: [QUICK-6]
must_haves:
  truths:
    - "Sections have distinct visual separation without feeling disjointed"
    - "Typography hierarchy guides the eye: headings feel weighty, body text is comfortable"
    - "The page feels premium and intentionally light-themed, not like an inverted dark theme"
  artifacts:
    - path: "apps/web/src/components/landing/animated-landing.tsx"
      provides: "Polished light-theme landing page"
  key_links: []
---

<objective>
Polish the light-themed landing page so it feels intentionally designed rather than mechanically converted from dark mode. Refine section differentiation, typography hierarchy, spacing rhythm, and subtle visual details.

Purpose: The quick-4 dark-to-light conversion was a color swap. This pass adds the craft -- alternating section backgrounds, refined type scale, improved spacing, and subtle depth cues that make a light theme feel premium.
Output: A single polished `animated-landing.tsx` with improved visual hierarchy and section contrast.
</objective>

<execution_context>
@/home/alfie/.claude/get-shit-done/workflows/execute-plan.md
@/home/alfie/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/components/landing/animated-landing.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Refine section backgrounds, spacing, and visual rhythm</name>
  <files>apps/web/src/components/landing/animated-landing.tsx</files>
  <action>
Improve section differentiation and spacing throughout animated-landing.tsx. All changes are Tailwind classes and inline styles within this single file:

**Section backgrounds -- create visual rhythm via alternating treatments:**
- Hero: keep white bg with the existing background image. Increase bottom padding to pb-36 md:pb-48 for more breathing room before stats.
- Stats (first): change from `bg-gray-50` to white with a very subtle top border only (`border-t border-gray-100`). Remove `border-y`. Add `py-16` (up from py-14).
- Features heading area: keep white. Tighten bottom spacing.
- How It Works: change from `bg-gradient-to-b from-gray-50 to-transparent` to `bg-gray-50/80` (flat subtle gray). Increase vertical padding to `py-28 md:py-44`.
- Second stats banner: change to white background (remove `bg-gray-50 border-y border-gray-100`), add `py-24` for more space. This creates white-gray-white-gray alternation.
- CTA: keep the orange gradient -- it already stands out well.

**Typography hierarchy refinements:**
- Hero badge: change `text-orange-400` to `text-orange-600` for better contrast on light bg. Change `bg-orange-500/10` to `bg-orange-100` and `border-orange-500/20` to `border-orange-200`.
- Hero subtitle: change `text-gray-500` to `text-gray-600` for better readability.
- Stats labels: change `text-gray-500` to `text-gray-600`.
- Section label pills (Features, How It Works): change `text-orange-400` to `text-orange-600`, `bg-orange-500/10` to `bg-orange-100`, `border-orange-500/20` to `border-orange-200`.
- Step descriptions and feature card descriptions: change `text-gray-500` to `text-gray-600`.
- How It Works step titles: add `text-lg` alongside existing classes for slightly larger text.

**Spacing and padding tweaks:**
- Nav: increase height from `h-16` to `h-18` for a more premium feel.
- Mobile feature cards: increase padding from `p-8` to `p-8 pb-10` and add `shadow-md` (up from shadow-sm) with `border-gray-200` (up from gray-100).
- How It Works section heading margin: increase `mb-20` to `mb-24`.
- Step circle: keep current size but add `ring-4 ring-orange-500/10` for a subtle halo effect.

**Subtle depth and polish:**
- Add a very subtle `shadow-sm` to the stats section containers (individual stat items, not the section itself).
- For the second stats banner values, ensure the gradient text uses `from-orange-500 to-amber-500` (slightly more saturated than current from-orange-400 to-amber-400).
- Feature section heading: add `mb-4` after the subtitle for more space before the horizontal scroll.
- Footer text in CTA: change `text-white/60` to `text-white/70` for slightly better legibility.

Do NOT change any GSAP animations, data attributes, component structure, or the Motion animation props. This is purely a visual polish pass on classes and inline styles.
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte && npx next build --no-lint 2>&1 | tail -5</automated>
  </verify>
  <done>Landing page builds without errors. Sections have distinct visual separation via alternating backgrounds. Typography uses darker grays (600 vs 500) for body text. Section pills use consistent orange-100/orange-600 treatment. Spacing is more generous throughout. The page reads as an intentionally light design.</done>
</task>

</tasks>

<verification>
- `cd /home/alfie/bite-byte && npx next build --no-lint` completes successfully
- Visual inspection: sections alternate between white and subtle gray backgrounds
- Typography: no text uses gray-400 or gray-500 for body copy (all upgraded to gray-600)
- Section pills: consistent bg-orange-100 / text-orange-600 / border-orange-200 treatment
</verification>

<success_criteria>
The landing page feels like a premium, intentionally designed light theme. Sections are visually distinct. Text is comfortable to read with proper contrast. Spacing creates visual rhythm. No GSAP or animation behavior has changed.
</success_criteria>

<output>
After completion, create `.planning/quick/6-polish-landing-page-refine-light-theme-i/6-SUMMARY.md`
</output>
