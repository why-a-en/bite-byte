---
phase: quick-12
plan: 01
subsystem: ui
tags: [dnd-kit, react, kanban, drag-and-drop, useDraggable, useDroppable]

# Dependency graph
requires:
  - phase: 04-real-time-operations-and-analytics
    provides: "Live orders board with WebSocket + polling, handleStatusUpdate callback"
provides:
  - "Drag-and-drop order card movement between kanban columns"
  - "DragOverlay with lightweight card preview"
  - "DroppableColumn with visual highlight on drag-over"
affects: [orders-board, order-card]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useDraggable + useDroppable for cross-container drag (not @dnd-kit/sortable)"
    - "DroppableColumn wrapper with isOver ring highlight"
    - "DragOverlay with lightweight preview (not full card clone)"

key-files:
  created: []
  modified:
    - apps/web/src/components/dashboard/orders-board.tsx
    - apps/web/src/components/dashboard/order-card.tsx

key-decisions:
  - "Used closestCorners collision detection (better for large rectangular droppable zones than closestCenter)"
  - "DroppableColumn IDs are status strings directly ('RECEIVED', 'PREPARING', 'READY') for zero-mapping drag-end logic"
  - "Lightweight OrderCardDragPreview instead of full OrderCard clone -- avoids complex state/timers in overlay"

patterns-established:
  - "Cross-container drag pattern: useDraggable on items + useDroppable on containers + DragOverlay for preview"

requirements-completed: [QUICK-12]

# Metrics
duration: 12min
completed: 2026-04-03
---

# Quick Task 12: Add Drag-and-Drop to Live Orders Board

**Drag-and-drop order status transitions on kanban board using @dnd-kit useDraggable/useDroppable with visual overlay and column highlights**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-03T17:28:15Z
- **Completed:** 2026-04-03T17:40:42Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Order cards are draggable between RECEIVED, PREPARING, and READY columns
- Dropping a card in a different column triggers the existing handleStatusUpdate (optimistic update + API call + error rollback)
- DragOverlay shows lightweight preview with reference code, customer name, and item count
- Columns highlight with ring-2 ring-primary/60 when a card is dragged over them
- Click-to-expand and button interactions preserved via PointerSensor distance:5 threshold

## Task Commits

Each task was committed atomically:

1. **Task 1: Make order cards draggable and columns droppable with DragOverlay** - `adf7cc3` (feat)

**Plan metadata:** [pending] (docs: complete plan)

## Files Created/Modified
- `apps/web/src/components/dashboard/order-card.tsx` - Added useDraggable hook, opacity-50 ghost state, exported OrderCardDragPreview component
- `apps/web/src/components/dashboard/orders-board.tsx` - Added DndContext with sensors/collision/modifiers, DroppableColumn with isOver highlight, DragOverlay with preview, drag event handlers

## Decisions Made
- Used `closestCorners` collision detection instead of `closestCenter` -- better for large rectangular droppable zones (columns) vs small sortable items
- Droppable IDs are the status strings directly ('RECEIVED', 'PREPARING', 'READY') so onDragEnd can pass `over.id` straight to `handleStatusUpdate` with no mapping
- OrderCardDragPreview is a lightweight component (ref code + name + count) rather than a full OrderCard clone -- avoids dragging expanded state, timers, and complex interactions into the overlay
- Applied `restrictToWindowEdges` modifier to prevent dragging cards outside the viewport

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Drag-and-drop is additive -- all existing click-based status updates, WebSocket real-time sync, and polling fallback work unchanged
- Touch support works automatically via PointerSensor (same sensor handles both mouse and touch with distance threshold)

---
*Quick Task: 12-add-drag-and-drop-to-live-orders-board*
*Completed: 2026-04-03*
