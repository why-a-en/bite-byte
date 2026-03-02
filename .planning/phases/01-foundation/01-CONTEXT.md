# Phase 1: Foundation - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold the Turborepo monorepo with Next.js and NestJS apps, define the PostgreSQL schema via Prisma with multi-tenant isolation (RLS + Prisma extension), and set up the development environment. This phase delivers a compiling project with a correct, modifier-ready schema — no features, no UI, no API endpoints beyond health checks.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

User deferred all foundation decisions to Claude's judgment, informed by research. Claude has full flexibility on:

- **Monorepo structure** — Package names, app organization, shared types package, Turborepo pipeline config
- **Data model design** — Entity relationships, column naming, index strategy, RLS policy design
- **Dev environment** — Docker Compose for PostgreSQL, seed data strategy, dev tooling (ESLint, Prettier, etc.)
- **Code conventions** — Naming style, file organization, import patterns, TypeScript strictness level
- **Testing setup** — Vitest configuration, test file conventions, SWC integration for NestJS decorators

All decisions should follow patterns from research (STACK.md, ARCHITECTURE.md) and prioritize:
1. Correctness of tenant isolation (this is load-bearing)
2. Modifier-extensible schema (avoid future migrations)
3. Developer experience (hot reload, type sharing, minimal config)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Use research-recommended stack:
- Prisma 7.x with `$extends` for tenant scoping
- PostgreSQL RLS as defense-in-depth
- Zod schemas in shared `packages/types` for cross-app validation
- Socket.IO stubs (actual implementation in Phase 4)
- Stripe webhook handler stub with idempotency table

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-02*
