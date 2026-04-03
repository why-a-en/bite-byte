---
phase: quick-15
plan: 01
subsystem: api-tests
tags: [testing, unit-tests, auth, orders, categories]
dependency_graph:
  requires: []
  provides: [auth-service-tests, orders-service-tests, categories-service-tests]
  affects: [api-test-coverage]
tech_stack:
  added: []
  patterns: [direct-instantiation-unit-tests, vi-mock-modules, vi-fn-dependency-mocking]
key_files:
  created:
    - apps/api/src/auth/__tests__/auth.service.spec.ts
    - apps/api/src/orders/__tests__/orders.service.spec.ts
    - apps/api/src/categories/__tests__/categories.service.spec.ts
  modified: []
decisions:
  - Direct instantiation over NestJS TestingModule for pure unit tests (faster, simpler)
  - vi.mock('bcrypt') to avoid slow real hashing in auth tests
  - vi.mock('nanoid') for deterministic reference codes in order tests
metrics:
  duration: 2min
  completed: "2026-04-04T03:23:30Z"
  tasks_completed: 3
  tasks_total: 3
  tests_added: 24
---

# Quick Task 15: Write Tests for Key API Services

Unit tests with mocked dependencies for AuthService (6 tests), OrdersService (9 tests), and CategoriesService (9 tests) -- 24 total tests all passing.

## Task Summary

| # | Task | Commit | Tests | Key Coverage |
|---|------|--------|-------|-------------|
| 1 | AuthService unit tests | 65fa451 | 6 | register (success + conflict), validateUser (success + not found + wrong pw), login |
| 2 | OrdersService unit tests | eabb2a1 | 9 | create (PAC + Stripe + missing venue + invalid items), updateStatus (valid + invalid + not found), findPublic (match + mismatch) |
| 3 | CategoriesService unit tests | 7c7d4d9 | 9 | create (success + forbidden + not found), findAll, update (success + not found), remove (success + conflict), reorder |

## Test Coverage Details

### AuthService (6 tests)
- **register:** Verifies bcrypt hashing, user creation, JWT signing; ConflictException on duplicate email
- **validateUser:** Returns SafeUser without passwordHash on match; null on missing user or wrong password
- **login:** Signs JWT with {sub, email} payload

### OrdersService (9 tests)
- **create:** PAY_AT_COUNTER creates in RECEIVED status and emits order:new; STRIPE creates in PENDING_PAYMENT without emission; totalAmount calculated server-side from menu item prices x quantities
- **updateStatus:** Valid transitions (RECEIVED->PREPARING) succeed and emit; invalid transitions (COMPLETED->PREPARING) throw BadRequestException; missing orders throw NotFoundException
- **findPublic:** Returns order when venue slug matches; throws NotFoundException when slug mismatches (prevents cross-venue order snooping)

### CategoriesService (9 tests)
- **Venue ownership:** Tested indirectly -- ForbiddenException for wrong owner, NotFoundException for missing venue
- **CRUD:** Create with sortOrder default, findAll with items included, update specific fields, delete guarded by item count
- **reorder:** $transaction called with batch update array

## Deviations from Plan

None -- plan executed exactly as written.

## Notes

- Pre-existing `tenant-isolation.spec.ts` integration test has 2 failures (requires real DB connection) -- these are pre-existing and out of scope per plan instructions
- All 24 new unit tests use mocked dependencies with zero DB calls
- Tests use direct constructor instantiation (not NestJS TestingModule) for speed and simplicity

## Self-Check: PASSED
