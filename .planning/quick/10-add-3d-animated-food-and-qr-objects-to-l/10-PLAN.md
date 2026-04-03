---
phase: quick-10
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/landing/landing-3d-scene.tsx
  - apps/web/src/components/landing/animated-landing.tsx
autonomous: true
requirements: [QUICK-10]
must_haves:
  truths:
    - "Hero section displays a 3D scene with floating food plate, QR code element, phone silhouette, and ambient spheres instead of a static image"
    - "3D objects have glass/chrome materials with orange-tinted reflections matching brand palette"
    - "Objects gently bob and rotate using Drei Float component"
    - "Page loads without blocking on the 3D scene (Suspense fallback)"
    - "Landing page remains fully functional on mobile (3D hidden on small screens via existing lg:block)"
  artifacts:
    - path: "apps/web/src/components/landing/landing-3d-scene.tsx"
      provides: "R3F Canvas with 3D food/QR/phone scene"
      min_lines: 120
    - path: "apps/web/src/components/landing/animated-landing.tsx"
      provides: "Hero section updated to render 3D scene instead of static image"
  key_links:
    - from: "apps/web/src/components/landing/animated-landing.tsx"
      to: "apps/web/src/components/landing/landing-3d-scene.tsx"
      via: "dynamic import with Suspense"
      pattern: "Suspense.*Landing3DScene"
---

<objective>
Replace the hero section's static restaurant photo with a stunning 3D scene built entirely from code-only R3F/Drei primitives. The scene features a floating food plate, a rotating QR code element, a phone silhouette, and ambient glossy spheres — all with glass/chrome materials and soft environment lighting.

Purpose: Transform the landing page hero from a stock photo into an eye-catching, interactive 3D showcase that communicates the product's core concept (scan QR, order food, see it on your phone).
Output: New `landing-3d-scene.tsx` component and updated `animated-landing.tsx` hero section.
</objective>

<execution_context>
@/home/alfie/.claude/get-shit-done/workflows/execute-plan.md
@/home/alfie/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/components/landing/animated-landing.tsx
@apps/web/package.json

Dependencies already installed: `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`.

Brand color: orange-500 (#f97316). Light theme. The hero is a two-column grid: text left, visual right. The right column is currently `hidden lg:block` — the 3D scene inherits this responsive behavior.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create the 3D scene component</name>
  <files>apps/web/src/components/landing/landing-3d-scene.tsx</files>
  <action>
Create `apps/web/src/components/landing/landing-3d-scene.tsx` as a `'use client'` component that exports a default `Landing3DScene` component rendering an R3F `<Canvas>` with the following scene:

**Canvas setup:**
- `<Canvas camera={{ position: [0, 0, 6], fov: 45 }} style={{ width: '100%', height: '100%' }} gl={{ antialias: true, alpha: true }}>` — transparent background so the page gradient shows through
- `frameloop="always"` (animations need continuous rendering)
- Wrap inner scene in `<Suspense fallback={null}>`

**Environment and lighting:**
- `<Environment preset="city" />` from Drei for realistic reflections
- `<ambientLight intensity={0.3} />`
- `<directionalLight position={[5, 5, 5]} intensity={0.8} />`
- `<ContactShadows position={[0, -2.2, 0]} opacity={0.3} scale={8} blur={2.5} far={4} color="#f97316" />` — orange-tinted shadow for brand feel

**Object 1 — Floating food plate (center):**
- Wrap in `<Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>`
- A `<Torus args={[1.2, 0.15, 16, 48]} position={[0, 0, 0]}>` for the plate rim with `<MeshPhysicalMaterial color="#ffffff" metalness={0.1} roughness={0.05} clearcoat={1} clearcoatRoughness={0.1} />`
- A `<RoundedBox args={[1.4, 0.3, 1.4]} radius={0.15} position={[0, 0.15, 0]}>` for the food dome on top, with `<MeshPhysicalMaterial color="#f97316" metalness={0.3} roughness={0.15} transmission={0.4} thickness={0.5} ior={1.5} />` — glossy orange, semi-transparent glass look

**Object 2 — QR code element (right side):**
- Wrap in `<Float speed={2} rotationIntensity={0.5} floatIntensity={0.4}>`
- Position at `[2.2, 0.5, -0.5]`, rotation `[0, -0.3, 0.1]`
- A `<RoundedBox args={[1.2, 1.2, 0.08]} radius={0.08}>` as the QR card base with `<MeshPhysicalMaterial color="#ffffff" metalness={0.05} roughness={0.1} clearcoat={1} />`
- On the front face, create a stylized QR pattern using a group of 12-16 small `<Box args={[0.1, 0.1, 0.02]}>` meshes arranged in a grid pattern on the face (z offset +0.05), colored `#1a1a1a` with slight metalness. Include 3 corner squares (larger boxes, 0.2x0.2) to suggest QR finder patterns. This is a decorative suggestion of a QR code, not a real one.
- Add a subtle auto-rotation via `useFrame`: rotate on Y axis slowly (`ref.current.rotation.y += delta * 0.2`)

**Object 3 — Phone silhouette (left side):**
- Wrap in `<Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.5}>`
- Position at `[-2, -0.3, 0.5]`, rotation `[0.1, 0.3, -0.05]`
- A `<RoundedBox args={[0.8, 1.5, 0.06]} radius={0.1}>` for the phone body with `<MeshPhysicalMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />`
- A `<RoundedBox args={[0.65, 1.2, 0.01]} radius={0.06} position={[0, 0, 0.04]}>` for the screen face with `<MeshPhysicalMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.4} metalness={0} roughness={0.3} />` — glowing orange screen suggesting the ordering interface

**Object 4 — Ambient spheres (scattered):**
- Create 8-10 small `<Sphere args={[0.08, 16, 16]}>` at varied positions around the scene (use an array of hardcoded positions like `[1.5, 1.2, 1], [-1.8, -1, 0.5], [0.5, -1.5, 1.5]`, etc.)
- Each wrapped in its own `<Float>` with randomized speed (1-3) and floatIntensity (0.3-0.8)
- Material: `<MeshPhysicalMaterial color="#f97316" metalness={0.9} roughness={0} clearcoat={1} />` — chrome-like orange spheres
- A few spheres should be white/silver for contrast

**Auto-rotation of entire scene group:**
- Wrap all objects in a `<group>` with a ref
- `useFrame((_, delta) => { group.current.rotation.y += delta * 0.08 })` for very slow overall rotation

**Performance:**
- Keep polygon counts low (16 segments on spheres, torus, etc.)
- Total meshes should be under 30
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte && npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | head -30</automated>
  </verify>
  <done>landing-3d-scene.tsx exists, exports a Landing3DScene component, TypeScript compiles without errors, scene contains food plate (torus + rounded box), QR card with dot pattern, phone with glowing screen, ambient spheres, environment lighting, and contact shadows</done>
</task>

<task type="auto">
  <name>Task 2: Integrate 3D scene into hero section</name>
  <files>apps/web/src/components/landing/animated-landing.tsx</files>
  <action>
Modify `apps/web/src/components/landing/animated-landing.tsx` to replace the static hero image with the 3D scene:

1. **Add imports at top of file:**
   - `import { Suspense } from 'react'` (add Suspense to existing react import)
   - `import dynamic from 'next/dynamic'`
   - `const Landing3DScene = dynamic(() => import('./landing-3d-scene'), { ssr: false })` — SSR disabled because R3F requires browser WebGL context

2. **Replace the right column content (lines ~307-338):**
   Remove the entire `<motion.div>` block that contains the `<Image src="/images/hero-restaurant.jpg" ...>` and its floating card overlay.

   Replace with:
   ```tsx
   <motion.div
     initial={{ opacity: 0, scale: 0.9 }}
     animate={{ opacity: 1, scale: 1 }}
     transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
     className="hidden lg:block relative h-[480px]"
   >
     <Suspense fallback={
       <div className="w-full h-full rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 animate-pulse" />
     }>
       <Landing3DScene />
     </Suspense>
   </motion.div>
   ```

3. **Clean up unused imports:** If the `Image` import from `next/image` is no longer used in the hero section, check if it is still used elsewhere in the file (features, CTA sections). It IS used in features and CTA sections, so keep the import.

Do NOT modify anything else in the file — stats, features, how-it-works, CTA, footer, nav all stay exactly as they are.
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte && npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | head -30 && cd apps/web && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>Hero section renders the 3D scene on desktop (lg+) with a Suspense fallback, page builds successfully, all other landing page sections unchanged, Image import retained for features/CTA sections</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with no type errors
2. `npx next build` succeeds
3. Visual check: landing page loads, hero right column shows 3D scene with floating objects on desktop, hidden on mobile
4. 3D scene has: orange food plate, white QR card with dot pattern, dark phone with glowing screen, scattered chrome spheres
5. Objects gently float and the scene slowly rotates
6. Page is not blocked during 3D load (Suspense fallback shows first)
</verification>

<success_criteria>
- The hero section displays an interactive 3D scene instead of a static photo
- All four object types are visible (plate, QR card, phone, spheres)
- Materials are glass/chrome with orange brand accents
- Scene has environment reflections and contact shadows
- Objects animate with gentle floating motion
- Build passes, no TypeScript errors
- Page load is not blocked by 3D scene initialization
</success_criteria>

<output>
After completion, create `.planning/quick/10-add-3d-animated-food-and-qr-objects-to-l/10-SUMMARY.md`
</output>
