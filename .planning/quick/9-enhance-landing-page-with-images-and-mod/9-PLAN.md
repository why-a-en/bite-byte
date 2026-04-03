---
phase: quick-9
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/landing/animated-landing.tsx
  - apps/web/src/components/landing/phone-mockup.tsx
  - apps/web/src/components/landing/dashboard-mockup.tsx
  - apps/web/src/components/landing/decorative-elements.tsx
autonomous: true
requirements: [QUICK-9]
must_haves:
  truths:
    - "Hero section has a visible product mockup showing the ordering flow"
    - "Page has visual depth with gradients, glass effects, and layered elements"
    - "Feature cards include visual mockup representations, not just icons"
    - "Page feels visually rich and modern, not plain text-and-icons"
  artifacts:
    - path: "apps/web/src/components/landing/phone-mockup.tsx"
      provides: "Reusable phone frame component with styled inner content"
    - path: "apps/web/src/components/landing/dashboard-mockup.tsx"
      provides: "Browser-frame dashboard mockup for features section"
    - path: "apps/web/src/components/landing/decorative-elements.tsx"
      provides: "SVG blobs, gradient shapes, dot grids for visual depth"
    - path: "apps/web/src/components/landing/animated-landing.tsx"
      provides: "Enhanced landing page integrating all visual elements"
  key_links:
    - from: "apps/web/src/components/landing/animated-landing.tsx"
      to: "phone-mockup.tsx, dashboard-mockup.tsx, decorative-elements.tsx"
      via: "import and render in hero/features/how-it-works sections"
      pattern: "import.*from.*mockup"
---

<objective>
Enhance the landing page from plain text+icons to a visually rich, modern design with product mockups, glass effects, gradient backgrounds, and layered decorative elements. No external images — all visuals are CSS/SVG/JSX.

Purpose: The current page is functional but visually flat. Modern landing pages (Linear, Vercel, Stripe) use product visuals, depth, and layering to create impact.
Output: A visually stunning landing page with phone mockups, dashboard previews, and decorative elements.
</objective>

<execution_context>
@/home/alfie/.claude/get-shit-done/workflows/execute-plan.md
@/home/alfie/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/components/landing/animated-landing.tsx
@apps/web/src/components/landing/smooth-scroll-provider.tsx

The page uses: Next.js App Router, shadcn/ui, Tailwind v4, Motion (framer-motion), lucide-react icons.
Color scheme: white background, orange-500 accent, gray text. Keep this palette.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create visual mockup components and decorative elements</name>
  <files>
    apps/web/src/components/landing/phone-mockup.tsx
    apps/web/src/components/landing/dashboard-mockup.tsx
    apps/web/src/components/landing/decorative-elements.tsx
  </files>
  <action>
Create three component files that provide all the visual richness:

**phone-mockup.tsx** — A phone frame component (iPhone-style rounded rectangle with notch) containing styled JSX that represents the Bite Byte ordering flow:
- Phone bezel: rounded-[2.5rem] border, dark frame with inner screen area
- Screen content variant "menu": Shows a mini menu UI — venue name header, 2-3 food item rows with colored placeholder thumbnails, prices, and an "Add to cart" button styled in orange
- Screen content variant "qr": Shows a QR code scanning visualization — camera viewfinder frame with a stylized QR code in the center
- Screen content variant "order": Shows order confirmation — checkmark, "Order #ABC123", item summary
- Accept a `className` prop for sizing. Default ~w-64 h-[500px]. All content is pure JSX/CSS, no images.
- Add a subtle glow/shadow effect behind the phone (orange-tinted box-shadow)

**dashboard-mockup.tsx** — A browser window frame component showing a mini dashboard:
- Browser chrome: rounded top with three colored dots (red/yellow/green), URL bar showing "bitebyte.app/dashboard"
- Inner content: A simplified dashboard layout with:
  - Left sidebar with nav items (colored rectangles)
  - Main area with a header "Orders" and 2-3 order cards showing status badges (green "Ready", orange "Preparing", gray "New")
  - A small chart area (simple bar chart using CSS grid bars of varying heights in orange shades)
- Dimensions: ~w-full max-w-lg, aspect-video
- Accept `className` prop

**decorative-elements.tsx** — Export multiple decorative components:
- `GradientBlob`: An absolutely-positioned radial gradient blob. Props: color (orange/amber/rose), size, position, opacity. Uses CSS blur and mix-blend-mode for soft organic shapes.
- `DotGrid`: A repeating dot pattern (using CSS radial-gradient background-image) for subtle texture. Props: opacity, className.
- `GlowOrb`: A circular gradient with animated pulse (motion). Props: color, size, position.
- `FloatingShapes`: 3-4 small geometric shapes (circles, rounded squares) that float with subtle motion animation (y oscillation via motion animate). Positioned absolute, z-0, pointer-events-none.

All components must be 'use client' and use motion/react for animations where appropriate. Use only Tailwind classes — no inline style objects except for dynamic positioning.
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte && npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | head -30</automated>
  </verify>
  <done>Three component files exist, export their components, and compile without TypeScript errors</done>
</task>

<task type="auto">
  <name>Task 2: Integrate visual elements into the landing page</name>
  <files>apps/web/src/components/landing/animated-landing.tsx</files>
  <action>
Rewrite animated-landing.tsx to integrate the new visual components. Keep all existing content (nav, hero text, stats, features, how-it-works, CTA, footer) but enhance every section visually:

**Hero section enhancements:**
- Split into two-column layout on desktop (text left, visual right). On mobile, stack with visual below text.
- Right column: Render `PhoneMockup` variant="menu" with a slight rotation (rotate-2 or -2) and motion entry animation (slide in from right + fade). Add a second smaller phone behind it (variant="qr", rotated opposite, partially hidden, lower opacity) for depth.
- Add `FloatingShapes` behind the hero for organic movement
- Replace the single gradient blob with 2-3 `GradientBlob` components at different positions for richer background
- Add a `DotGrid` with very low opacity (0.03-0.05) behind the hero for texture

**Stats section:**
- Add glass effect to the section: backdrop-blur-sm, bg-white/60, subtle border
- Each stat gets a subtle gradient underline or colored dot accent

**Features section enhancements:**
- Keep the 2x2 grid of feature cards
- Add glass morphism to cards: bg-white/70 backdrop-blur-sm border-white/20
- For the first feature card (QR Code Ordering), add a small PhoneMockup (variant="qr", scaled down ~w-32) floating to the right of the card content
- For the second feature card (Real-Time Dashboard), add a small DashboardMockup (scaled down) below or beside the description
- Other cards: add subtle gradient backgrounds (very light orange-to-transparent) and decorative GlowOrb elements
- Add a decorative GradientBlob behind the features grid

**How It Works section:**
- Step 1 (Create Venue): Replace the icon box with a mini browser mockup showing a form
- Step 2 (Print QR): Replace icon box with a stylized QR code SVG (inline, ~80x80, made of rounded squares in orange shades)
- Step 3 (Take Orders): Replace icon box with PhoneMockup variant="order" scaled very small
- Add connecting gradient line between steps (already exists, make it thicker/more visible with a glow effect)

**CTA section:**
- Add decorative floating shapes around the CTA card
- Add a subtle radial gradient glow behind the card
- Consider adding a small phone mockup to one side of the CTA

**Global enhancements:**
- Add more gradient depth to the page background: subtle gradient sections between major blocks
- Ensure all new visual elements are pointer-events-none and aria-hidden="true" where decorative
- All mockups should have motion entry animations (fade + slide) triggered by useInView
- Maintain mobile responsiveness: mockups hide or scale down on small screens (hidden sm:block or scale-75)
- Keep the orange-500 / white / gray color scheme throughout

Do NOT change the nav, footer structure, text content, or CTA button destinations. Only enhance visuals.
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte && npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | head -30 && cd apps/web && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>Landing page builds successfully, renders with phone mockups in hero, glass-effect feature cards, visual mockups in how-it-works steps, and decorative gradient/blob elements throughout. Mobile responsive — mockups hidden or scaled on small screens.</done>
</task>

</tasks>

<verification>
- TypeScript compiles with no errors
- Next.js build succeeds
- Visual inspection: hero has phone mockup, features have glass cards with visual elements, how-it-works has visual step representations
- Mobile: page is usable, mockups scale/hide appropriately
- Performance: no external images loaded, all visuals are CSS/SVG/JSX
</verification>

<success_criteria>
- Landing page is visually rich with product mockups showing the app in action
- Glass morphism effects on cards and sections add depth
- Gradient blobs and decorative elements create layered, modern aesthetic
- Phone mockup in hero immediately communicates "this is a mobile ordering product"
- Dashboard mockup shows the owner experience
- Page maintains light theme with orange accent palette
- No external image dependencies — all visuals are code-generated
- Mobile responsive with graceful degradation of visual elements
</success_criteria>

<output>
After completion, create `.planning/quick/9-enhance-landing-page-with-images-and-mod/9-SUMMARY.md`
</output>
