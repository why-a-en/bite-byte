---
phase: 02-auth-and-venue-setup
plan: "04"
subsystem: ui
tags: [nextjs, react, tailwindcss, shadcn, vercel-blob, qrcode, react-hook-form, zod, server-actions]

# Dependency graph
requires:
  - phase: 02-auth-and-venue-setup
    plan: "02"
    provides: "NestJS venue CRUD API (POST/GET/PATCH/DELETE /venues) with JwtAuthGuard"
  - phase: 02-auth-and-venue-setup
    plan: "03"
    provides: "shadcn/ui initialized, Tailwind v4, middleware JWT verification, auth server actions"

provides:
  - fetchApi helper reading access_token cookie and forwarding Bearer auth to NestJS API
  - Dashboard layout with responsive sidebar (desktop fixed, mobile hamburger overlay)
  - Dashboard home page with venue grid (1/2/3 columns) and empty state
  - Venue list in sidebar with per-venue navigation links
  - /venues/new page with react-hook-form + Zod and auto-slug generation from name
  - createVenueAction, updateVenueAction, deleteVenueAction, uploadLogoAction server actions
  - Venue settings page (/venues/[venueId]) with name/slug/paymentMode form and delete confirmation
  - Logo upload via @vercel/blob put() CDN storage with graceful fallback when token missing
  - QR code page with 512x512 PNG preview generated server-side via qrcode library
  - /api/venues/[venueId]/qrcode route handler returning authenticated PNG download

affects:
  - 02-05-menu-management (sidebar navigation extends to menu pages)
  - 03-customer-ordering (QR code points to /menu/[slug] URLs)

# Tech tracking
tech-stack:
  added:
    - "@vercel/blob — CDN image upload for venue logos via put() with public access"
    - "qrcode@^1.5.x + @types/qrcode — server-side QR code PNG generation"
    - "@dnd-kit/modifiers — drag modifier for category list (missing dep from 02-05, fixed here)"
    - "shadcn components: select, dialog, alert-dialog, separator, tabs, badge"
  patterns:
    - "fetchApi server helper: reads access_token cookie, adds Authorization Bearer header, throws on non-OK responses"
    - "Dashboard (dashboard)/ route group: Server Component layout fetches venues, passes to Sidebar Client Component"
    - "Bound server actions pattern: updateVenueAction.bind(null, venueId) for per-venue actions"
    - "Vercel Blob graceful degradation: catches missing BLOB_READ_WRITE_TOKEN and returns descriptive error without crash"
    - "QR code PNG download via Next.js route handler with JWT verification — not server action (binary response)"
    - "Buffer to Uint8Array conversion for qrcode toBuffer result in Response constructor"

key-files:
  created:
    - "apps/web/src/lib/api.ts — fetchApi helper with cookie-based Bearer auth forwarding"
    - "apps/web/src/actions/venues.ts — createVenueAction, updateVenueAction, deleteVenueAction, uploadLogoAction"
    - "apps/web/src/app/(dashboard)/layout.tsx — dashboard layout fetching venues for sidebar"
    - "apps/web/src/app/(dashboard)/dashboard/page.tsx — venue grid dashboard home"
    - "apps/web/src/app/(dashboard)/venues/new/page.tsx — create venue form with auto-slug"
    - "apps/web/src/app/(dashboard)/venues/[venueId]/page.tsx — venue settings Server Component"
    - "apps/web/src/app/(dashboard)/venues/[venueId]/qrcode/page.tsx — QR code preview page"
    - "apps/web/src/app/api/venues/[venueId]/qrcode/route.ts — authenticated PNG download route handler"
    - "apps/web/src/components/dashboard/sidebar.tsx — responsive sidebar with venue list and mobile hamburger"
    - "apps/web/src/components/dashboard/venue-card.tsx — VenueCard and CreateVenueCard components"
    - "apps/web/src/components/dashboard/venue-settings-form.tsx — VenueSettingsForm client component"
    - "apps/web/src/components/ui/select.tsx — shadcn Select component"
    - "apps/web/src/components/ui/dialog.tsx — shadcn Dialog component"
    - "apps/web/src/components/ui/alert-dialog.tsx — shadcn AlertDialog for delete confirmation"
    - "apps/web/src/components/ui/separator.tsx — shadcn Separator"
    - "apps/web/src/components/ui/tabs.tsx — shadcn Tabs"
    - "apps/web/src/components/ui/badge.tsx — shadcn Badge for payment mode display"
  modified:
    - "apps/web/package.json — added @vercel/blob, qrcode, @types/qrcode, @dnd-kit/modifiers, shadcn components"
    - "apps/web/.env.example — added NEXT_PUBLIC_APP_URL and BLOB_READ_WRITE_TOKEN comments"

key-decisions:
  - "Dashboard route group (dashboard)/ uses Server Component layout to fetch venues once and pass to Sidebar — avoids duplicate API calls"
  - "Vercel Blob upload gracefully degrades when BLOB_READ_WRITE_TOKEN is missing — returns user-friendly error, no crash in dev"
  - "QR code PNG download uses a Next.js Route Handler (not server action) — binary responses require Response object, not server action return value"
  - "Buffer to Uint8Array conversion needed — qrcode.toBuffer() returns Node.js Buffer, but Response constructor expects BodyInit (Uint8Array)"
  - "PaymentMode enum uses PREPAY_REQUIRED (not PREPAY) — matched actual Prisma schema enum values"

patterns-established:
  - "Pattern: fetchApi helper — single point for auth token forwarding; all server components and actions use this"
  - "Pattern: Route handler for binary downloads — GET /api/venues/[venueId]/qrcode with JWT cookie verification"
  - "Pattern: bound server actions — updateVenueAction.bind(null, venueId) curries venueId before passing to useActionState"

requirements-completed: [VNUE-01, VNUE-02, VNUE-03, VNUE-04, MENU-05]

# Metrics
duration: 7min
completed: 2026-03-03
---

# Phase 2 Plan 04: Dashboard Layout, Venue Management, and QR Code Summary

**Next.js dashboard shell with responsive sidebar navigation, venue CRUD UI, Vercel Blob logo upload, and server-side QR code PNG generation for customer menu scanning**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-02T21:15:21Z
- **Completed:** 2026-03-02T21:22:21Z
- **Tasks:** 2 of 2
- **Files modified:** 18

## Accomplishments

- Dashboard layout with persistent sidebar showing venue list, responsive mobile hamburger, and logout button
- Venue CRUD: create form with auto-slug generation, settings page with name/slug/paymentMode editing, delete with AlertDialog confirmation
- Logo upload via Vercel Blob CDN storage with file type/size validation and graceful error when token not configured
- QR code: server-side 512x512 PNG preview on /venues/[venueId]/qrcode page, download via authenticated /api/venues/[venueId]/qrcode route handler
- TypeScript compiles with 0 errors across all new files

## Task Commits

Each task was committed atomically:

1. **Task 1: Build dashboard layout, API client, and venue list/create pages** - `fbc9a18` (feat)
2. **Task 2: Build venue settings page with logo upload, payment mode config, and QR code download** - `33c08e3` (feat, committed as part of 02-05 prior session)

**Plan metadata:** _(this commit)_ (docs: complete plan)

## Files Created/Modified

- `apps/web/src/lib/api.ts` - fetchApi: reads access_token cookie, adds Authorization Bearer header, throws Error on non-OK
- `apps/web/src/actions/venues.ts` - createVenueAction (POST /venues + redirect), updateVenueAction (PATCH), deleteVenueAction (DELETE + redirect), uploadLogoAction (@vercel/blob put())
- `apps/web/src/app/(dashboard)/layout.tsx` - Server Component fetching /venues, passing to Sidebar, main content area
- `apps/web/src/app/(dashboard)/dashboard/page.tsx` - Venue grid with VenueCard components, empty state with CreateVenueCard
- `apps/web/src/app/(dashboard)/venues/new/page.tsx` - Create venue form: name input, auto-slugified slug field, useActionState
- `apps/web/src/components/dashboard/sidebar.tsx` - Sidebar Client Component: venue list nav, Desktop fixed + Mobile overlay hamburger
- `apps/web/src/components/dashboard/venue-card.tsx` - VenueCard (name/slug/category count/date) and CreateVenueCard (dashed border CTA)
- `apps/web/src/app/(dashboard)/venues/[venueId]/page.tsx` - Server Component fetching venue, rendering VenueSettingsForm
- `apps/web/src/components/dashboard/venue-settings-form.tsx` - Client Component: RHF form, Select for paymentMode, logo upload with preview, AlertDialog delete
- `apps/web/src/app/(dashboard)/venues/[venueId]/qrcode/page.tsx` - QRCode.toDataURL for preview img, link to download route handler
- `apps/web/src/app/api/venues/[venueId]/qrcode/route.ts` - JWT verification, fetchApi for venue slug, QRCode.toBuffer -> Uint8Array, PNG response
- `apps/web/src/components/ui/select.tsx` - shadcn Select (radix dropdown)
- `apps/web/src/components/ui/alert-dialog.tsx` - shadcn AlertDialog for delete confirmations
- `apps/web/src/components/ui/dialog.tsx` - shadcn Dialog
- `apps/web/src/components/ui/separator.tsx` - shadcn Separator
- `apps/web/src/components/ui/tabs.tsx` - shadcn Tabs
- `apps/web/src/components/ui/badge.tsx` - shadcn Badge
- `apps/web/.env.example` - Added NEXT_PUBLIC_APP_URL and BLOB_READ_WRITE_TOKEN env var docs

## Decisions Made

- **Dashboard Server Component layout pattern**: The `(dashboard)/layout.tsx` is a Server Component that fetches venues once and passes to the Sidebar Client Component — avoids N duplicate API calls if individual pages also fetched venues.
- **Vercel Blob graceful degradation**: `uploadLogoAction` catches missing BLOB_READ_WRITE_TOKEN and returns a descriptive error string rather than throwing — keeps the form functional in dev environments without blob storage configured.
- **QR code download as Route Handler**: Binary PNG responses require `new Response(bytes)` which isn't possible from server actions (they can only return serializable data). A Next.js Route Handler at `/api/venues/[venueId]/qrcode` handles the download with JWT cookie verification.
- **Buffer → Uint8Array conversion**: `qrcode.toBuffer()` returns a Node.js `Buffer`, which TypeScript's `Response` constructor doesn't accept as `BodyInit`. Wrapping with `new Uint8Array(buffer)` resolves the type error.
- **PaymentMode enum values**: Plan spec said `PREPAY`, but the actual Prisma schema uses `PREPAY_REQUIRED`. Fixed in venues.ts actions and VenueSettingsForm Select options.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed PaymentMode enum value mismatch**
- **Found during:** Task 2 (venues.ts Zod schema)
- **Issue:** Plan specified `PREPAY` but Prisma schema has `PREPAY_REQUIRED`
- **Fix:** Updated Zod enum and Select options to use correct `PREPAY_REQUIRED` value
- **Files modified:** apps/web/src/actions/venues.ts, apps/web/src/components/dashboard/venue-settings-form.tsx
- **Verification:** TypeScript type check passes; enum values match Prisma schema
- **Committed in:** fbc9a18 (Task 1), 33c08e3 (Task 2)

**2. [Rule 1 - Bug] Fixed Buffer → Uint8Array type error in QR code route handler**
- **Found during:** Task 2 (QR code route handler)
- **Issue:** `qrcode.toBuffer()` returns Node.js `Buffer` which TypeScript reports as incompatible with `Response` `BodyInit`
- **Fix:** Added `const png = new Uint8Array(pngBuffer)` conversion before passing to `new Response()`
- **Files modified:** apps/web/src/app/api/venues/[venueId]/qrcode/route.ts
- **Verification:** TypeScript compiles with 0 errors
- **Committed in:** 33c08e3 (Task 2)

**3. [Rule 3 - Blocking] Installed missing @dnd-kit/modifiers dependency**
- **Found during:** Task 2 TypeScript check
- **Issue:** Pre-existing file `src/components/menu/category-list.tsx` (from 02-05 prior run) imports `@dnd-kit/modifiers` which was not installed, blocking tsc --noEmit
- **Fix:** Ran `pnpm add --filter @bite-byte/web @dnd-kit/modifiers`
- **Files modified:** apps/web/package.json, pnpm-lock.yaml
- **Verification:** TypeScript compiles with 0 errors
- **Committed in:** 33c08e3 (Task 2)

---

**Total deviations:** 3 auto-fixed (1 bug enum mismatch, 1 bug type error, 1 blocking missing dep)
**Impact on plan:** All auto-fixes were required for correctness and TypeScript compilation. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviations above.

## User Setup Required

**Vercel Blob for logo uploads requires manual configuration:**

1. Go to Vercel Dashboard → Storage → Create → Blob
2. Add `BLOB_READ_WRITE_TOKEN` to apps/web/.env.local (or run `vercel env pull .env.local` after linking the project)

Without `BLOB_READ_WRITE_TOKEN`, logo upload returns a descriptive error. All other venue features work without it.

**Environment variables needed in .env.local:**
- `NEXT_PUBLIC_APP_URL=http://localhost:3000` (for QR code menu URLs)
- `BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...` (for logo uploads)

## Next Phase Readiness

- All venue management pages protected by middleware (redirect to /login on missing/invalid JWT)
- fetchApi helper available for all future server components and actions
- Sidebar auto-shows new venues as they're created (layout re-fetches on every navigation)
- QR codes point to /menu/[slug] which will be built in Phase 3
- No blockers for Phase 3 (customer ordering) or remaining Phase 2 plans

---
*Phase: 02-auth-and-venue-setup*
*Completed: 2026-03-03*

## Self-Check: PASSED

All files confirmed on disk. Task 1 commit fbc9a18 and Task 2 files (committed in 33c08e3) verified in git history.
