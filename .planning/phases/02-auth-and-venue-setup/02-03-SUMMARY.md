---
phase: 02-auth-and-venue-setup
plan: "03"
subsystem: ui
tags: [tailwindcss, shadcn, nextjs, middleware, jwt, jose, react-hook-form, zod, httponly-cookie]

# Dependency graph
requires:
  - phase: 02-auth-and-venue-setup
    provides: "Plan 01 — NestJS AuthModule with POST /auth/register and POST /auth/login returning JWT"

provides:
  - Tailwind CSS v4 with CSS-first @import config and brand color theme
  - shadcn/ui initialized (new-york style) with button, input, label, card, form components
  - Next.js middleware verifying JWT httpOnly cookie via jose jwtVerify on /dashboard/:path* and /venues/:path*
  - Server actions: registerAction, loginAction, logoutAction in apps/web/src/actions/auth.ts
  - Login page at /login with email+password form, error display, link to /register
  - Register page at /register with email+password form, error display, link to /login
  - Auth route group layout (auth) with centered max-w-md container
  - Placeholder /dashboard page with logout button
  - apps/web/.env.example with API_URL and JWT_SECRET placeholders

affects:
  - 02-04-venue-management
  - 02-05-menu-management
  - all dashboard UI plans in Phase 2

# Tech tracking
tech-stack:
  added:
    - "tailwindcss@^4.2.1 — CSS-first utility framework, @import 'tailwindcss' in globals.css"
    - "@tailwindcss/postcss@^4.2.1 — PostCSS plugin for Tailwind v4 (Next.js auto-detects)"
    - "postcss@^8.5.6 — PostCSS processor"
    - "jose@^6.1.3 — Edge-compatible JWT verification (jwtVerify) for Next.js middleware"
    - "react-hook-form@^7.71.2 — Form state management, installed via shadcn form component"
    - "@hookform/resolvers@^5.2.2 — Zod resolver for react-hook-form, installed via shadcn"
    - "shadcn (new-york style) — components: button, input, label, card, form; also installed: class-variance-authority, clsx, tailwind-merge, lucide-react, radix-ui, tw-animate-css"
  patterns:
    - "Tailwind v4 CSS-first: @import 'tailwindcss' in globals.css, @theme {} for custom tokens, no tailwind.config.js"
    - "shadcn/ui initialized from apps/web/ directory (Pitfall 7 — CLI detects framework from local package.json)"
    - "jose jwtVerify in middleware.ts (not jsonwebtoken) — Edge Runtime compatible (Pitfall 1)"
    - "useActionState (React 19) + react-hook-form + Zod — server action state with client-side validation"
    - "httpOnly cookie pattern: server action calls NestJS API, sets access_token cookie, middleware verifies on protected routes"
    - "logoutAction deletes access_token cookie and redirects to /login — no server-side session invalidation needed for v1"

key-files:
  created:
    - "apps/web/src/app/globals.css — Tailwind v4 import + shadcn theme CSS vars + brand colors"
    - "apps/web/components.json — shadcn/ui configuration (new-york style, src/components path)"
    - "apps/web/src/lib/utils.ts — cn() utility (clsx + tailwind-merge)"
    - "apps/web/src/components/ui/button.tsx — shadcn Button component"
    - "apps/web/src/components/ui/input.tsx — shadcn Input component"
    - "apps/web/src/components/ui/label.tsx — shadcn Label component"
    - "apps/web/src/components/ui/card.tsx — shadcn Card component"
    - "apps/web/src/components/ui/form.tsx — shadcn Form component (react-hook-form integration)"
    - "apps/web/src/middleware.ts — JWT cookie verification via jose, protects /dashboard/* and /venues/*"
    - "apps/web/src/actions/auth.ts — registerAction, loginAction, logoutAction server actions"
    - "apps/web/src/app/(auth)/layout.tsx — centered auth layout with project name/logo"
    - "apps/web/src/app/(auth)/login/page.tsx — login form with email+password, useActionState, RHF"
    - "apps/web/src/app/(auth)/register/page.tsx — register form with email+password, useActionState, RHF"
    - "apps/web/src/app/dashboard/page.tsx — placeholder dashboard page with logout button"
    - "apps/web/.env.example — API_URL and JWT_SECRET placeholders"
  modified:
    - "apps/web/src/app/layout.tsx — added globals.css import"
    - "apps/web/package.json — added tailwindcss, jose, shadcn deps (react-hook-form, @hookform/resolvers, etc.)"

key-decisions:
  - "shadcn new-york style selected — cleaner aesthetic for a business dashboard tool"
  - "useActionState (React 19) primary form mechanism, react-hook-form layered for client-side validation before submission"
  - "Middleware clears cookie on invalid JWT and redirects — prevents stale cookie loops"
  - "Placeholder /dashboard page included — needed for auth redirect target to work end-to-end"

patterns-established:
  - "Pattern: auth route group (auth)/ — no dashboard layout, clean centered card"
  - "Pattern: server actions with AuthFormState type — {error?, fieldErrors?} union for both server and field errors"
  - "Pattern: middleware cookie clearing on invalid token — response.cookies.delete() before redirect"
  - "Pattern: jose TextEncoder().encode(secret) — standard Uint8Array secret encoding for jwtVerify"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03]

# Metrics
duration: 6min
completed: 2026-03-03
---

# Phase 2 Plan 03: shadcn/ui + Tailwind v4 + Auth Pages Summary

**shadcn/ui initialized with Tailwind v4, Next.js middleware verifying JWT httpOnly cookie via jose, login and register pages calling NestJS auth API via server actions**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-02T21:05:26Z
- **Completed:** 2026-03-02T21:11:26Z
- **Tasks:** 2 of 2
- **Files modified:** 16

## Accomplishments

- Tailwind CSS v4 installed with CSS-first @import config and brand orange color token
- shadcn/ui fully initialized (new-york style): button, input, label, card, form components in src/components/ui/
- Next.js middleware at src/middleware.ts uses jose jwtVerify to protect /dashboard/* and /venues/* routes — redirects to /login on missing or invalid JWT
- Login and register pages with useActionState (React 19), react-hook-form client validation, and Zod schema validation
- Server actions POST to NestJS /auth/login and /auth/register, set httpOnly cookie (7 days, sameSite=lax), redirect to /dashboard
- TypeScript compiles with 0 errors across all files

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize shadcn/ui + Tailwind v4 and configure Next.js middleware** - `ddf9417` (feat)
2. **Task 2: Build login and register pages with server actions** - `4538d30` (feat)

**Plan metadata:** _(this commit)_ (docs: complete plan)

## Files Created/Modified

- `apps/web/src/app/globals.css` - Tailwind v4 @import, shadcn CSS vars, brand color @theme variables
- `apps/web/components.json` - shadcn/ui configuration: new-york style, src/components path, CSS variables mode
- `apps/web/src/lib/utils.ts` - cn() utility combining clsx + tailwind-merge
- `apps/web/src/components/ui/button.tsx` - shadcn Button with variants (default, outline, ghost, etc.)
- `apps/web/src/components/ui/input.tsx` - shadcn Input component
- `apps/web/src/components/ui/label.tsx` - shadcn Label component
- `apps/web/src/components/ui/card.tsx` - shadcn Card, CardHeader, CardContent, CardFooter, etc.
- `apps/web/src/components/ui/form.tsx` - shadcn Form component with react-hook-form Controller integration
- `apps/web/src/middleware.ts` - jwtVerify via jose on access_token cookie; clears stale cookie on invalid JWT
- `apps/web/src/actions/auth.ts` - registerAction, loginAction (set httpOnly cookie + redirect), logoutAction (delete cookie + redirect)
- `apps/web/src/app/(auth)/layout.tsx` - Centered auth layout with "Bite Byte" heading
- `apps/web/src/app/(auth)/login/page.tsx` - Login form (119 lines): email+password, error display, link to /register
- `apps/web/src/app/(auth)/register/page.tsx` - Register form (120 lines): email+password, error display, link to /login
- `apps/web/src/app/dashboard/page.tsx` - Placeholder dashboard with logout form action
- `apps/web/src/app/layout.tsx` - Added globals.css import
- `apps/web/package.json` - Added tailwindcss, @tailwindcss/postcss, postcss, jose, shadcn deps
- `apps/web/.env.example` - API_URL and JWT_SECRET placeholder env vars

## Decisions Made

- **shadcn new-york style**: Selected for its cleaner, more modern aesthetic compared to default style — appropriate for a business dashboard tool used by restaurant/food truck owners.
- **useActionState primary, react-hook-form secondary**: useActionState handles server-round-trip state (errors from API); react-hook-form handles client-side validation before submission for instant feedback. The handleSubmit wrapper intercepts the form onSubmit to run client validation first, then calls requestSubmit() to trigger the action form submission.
- **Middleware cookie clearing on invalid JWT**: When jwtVerify throws (expired or invalid token), the middleware deletes the cookie before redirecting — prevents a stale cookie from causing infinite redirect loops on browsers that cache cookies aggressively.
- **Placeholder /dashboard page included**: Needed immediately so the redirect after login resolves to a real page, making the auth flow testable end-to-end without waiting for Phase 2 Plan 04 (venue management dashboard).

## Deviations from Plan

None — plan executed exactly as written. shadcn init updated globals.css with additional CSS variables and dark mode theme (beyond the minimal @theme block in the plan) — this is expected shadcn behavior and improves the design system.

## Issues Encountered

None. All installations completed without errors. TypeScript type checks passed on first run.

## User Setup Required

None for development. In production, the following environment variables must be set in Vercel:
- `API_URL` — URL of the deployed NestJS API (e.g., `https://api.your-domain.railway.app/api`)
- `JWT_SECRET` — Same value as set in the NestJS API environment (Railway)

For local development, `apps/web/.env.local` is already created with values from the API's `.env`.

## Next Phase Readiness

- All Phase 2 dashboard pages can now use shadcn/ui components directly
- Middleware protects /dashboard/* — any new dashboard pages are auto-protected
- JwtAuthGuard (from Plan 01) + httpOnly cookie auth = full auth flow ready for venue/menu CRUD
- No blockers for Plan 04 (venue management) or Plan 05 (menu management)

---
*Phase: 02-auth-and-venue-setup*
*Completed: 2026-03-03*

## Self-Check: PASSED

All files confirmed on disk. All commits verified in git history.
