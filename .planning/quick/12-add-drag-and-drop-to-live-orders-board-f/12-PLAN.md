---
phase: quick-12
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/dashboard/orders-board.tsx
  - apps/web/src/components/dashboard/order-card.tsx
autonomous: true
requirements: [QUICK-12]
must_haves:
  truths:
    - "Owner can drag an order card from one status column to another"
    - "Dropping a card into a different column triggers the same status update as clicking the status button"
    - "A drag overlay shows a preview of the card being dragged"
    - "Columns visually highlight when a card is dragged over them"
    - "Click-to-expand on order cards still works without triggering drag"
    - "Buttons inside expanded cards (status update, cancel) still work"
  artifacts:
    - path: "apps/web/src/components/dashboard/orders-board.tsx"
      provides: "DndContext with droppable columns and DragOverlay"
      contains: "DndContext"
    - path: "apps/web/src/components/dashboard/order-card.tsx"
      provides: "Draggable order card with click vs drag differentiation"
      contains: "useDraggable"
  key_links:
    - from: "orders-board.tsx DndContext onDragEnd"
      to: "handleStatusUpdate"
      via: "extracts orderId from active.id, column status from over.id"
      pattern: "handleStatusUpdate.*active.*over"
    - from: "order-card.tsx useDraggable"
      to: "DndContext in orders-board.tsx"
      via: "id={order.id} passed to useDraggable"
      pattern: "useDraggable.*order\\.id"
---

<objective>
Add drag-and-drop to the live orders kanban board so venue owners can move order cards between RECEIVED, PREPARING, and READY columns by dragging.

Purpose: Faster, more intuitive order status management -- drag is faster than click-expand-click-button for high-volume kitchens.
Output: Updated orders-board.tsx with DndContext/droppable columns/DragOverlay, updated order-card.tsx with useDraggable.
</objective>

<execution_context>
@/home/alfie/.claude/get-shit-done/workflows/execute-plan.md
@/home/alfie/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/components/dashboard/orders-board.tsx
@apps/web/src/components/dashboard/order-card.tsx
@apps/web/src/components/menu/category-list.tsx (reference for existing @dnd-kit pattern)
@apps/web/src/actions/orders.ts

<interfaces>
<!-- Existing patterns and types the executor needs -->

From apps/web/src/actions/orders.ts:
```typescript
export interface Order {
  id: string;
  referenceCode: string;
  status: 'PENDING_PAYMENT' | 'RECEIVED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  customerName: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}
```

From apps/web/src/components/dashboard/orders-board.tsx:
```typescript
// Already exists -- reuse for drag-end logic:
const handleStatusUpdate = useCallback(async (orderId: string, newStatus: string) => { ... });

// Column definitions -- use status as droppable id:
const COLUMNS: { label: string; status: Order['status'] }[] = [
  { label: 'Received', status: 'RECEIVED' },
  { label: 'Preparing', status: 'PREPARING' },
  { label: 'Ready', status: 'READY' },
];
```

From apps/web/src/components/menu/category-list.tsx (established dnd-kit pattern):
```typescript
// Stable id prop on DndContext -- MANDATORY per CLAUDE.md to prevent hydration mismatch
<DndContext id="menu-category-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>

// PointerSensor with distance constraint to differentiate click from drag
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  useSensor(KeyboardSensor),
);
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Make order cards draggable and columns droppable with DragOverlay</name>
  <files>apps/web/src/components/dashboard/orders-board.tsx, apps/web/src/components/dashboard/order-card.tsx</files>
  <action>
**order-card.tsx changes:**

1. Add `useDraggable` from `@dnd-kit/core`. Call it with `id: order.id`. Destructure `{ attributes, listeners, setNodeRef, isDragging }`.
2. Apply `ref={setNodeRef}`, spread `{...listeners}`, `{...attributes}` on the Card root element.
3. When `isDragging` is true, apply `opacity-50` to the Card to show it is being moved.
4. The existing `onClick={handleCardClick}` will NOT conflict with drag because the PointerSensor has `activationConstraint: { distance: 5 }` -- clicks with <5px movement fire click, drags with >=5px movement fire drag. No extra logic needed.
5. Export a new `OrderCardDragPreview` component (or just reuse OrderCard) for the DragOverlay. The simplest approach: export a lightweight preview that shows the reference code, customer name, and item count (does NOT need expand/buttons). This avoids complex state in the overlay. Something like:
   ```tsx
   export function OrderCardDragPreview({ order }: { order: Order }) {
     return (
       <Card className="border-l-[3px] border-l-blue-500 shadow-lg w-[280px] rotate-2">
         <CardContent className="p-3">
           <div className="flex items-center gap-2">
             <span className="font-mono font-semibold text-sm">{order.referenceCode}</span>
             <span className="text-sm font-medium">{order.customerName}</span>
           </div>
           <div className="text-xs text-muted-foreground mt-1">
             {order.items.length} item{order.items.length !== 1 ? 's' : ''}
           </div>
         </CardContent>
       </Card>
     );
   }
   ```

**orders-board.tsx changes:**

1. Import from `@dnd-kit/core`: `DndContext`, `DragOverlay`, `useDroppable`, `PointerSensor`, `KeyboardSensor`, `useSensor`, `useSensors`, `closestCorners` (not closestCenter -- closestCorners works better for droppable zones that are large rectangular areas rather than sortable lists).
2. Import `restrictToWindowEdges` from `@dnd-kit/modifiers`.
3. Import `OrderCardDragPreview` from `./order-card`.
4. Add `useState` for `activeOrderId: string | null` (tracks which order is being dragged).
5. Set up sensors following the established pattern from category-list.tsx:
   ```tsx
   const sensors = useSensors(
     useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
     useSensor(KeyboardSensor),
   );
   ```
6. Create a `DroppableColumn` wrapper component (inline in this file or extracted):
   ```tsx
   function DroppableColumn({ status, children, isOver }: { status: string; children: React.ReactNode; isOver: boolean }) {
     const { setNodeRef } = useDroppable({ id: status });
     return (
       <div ref={setNodeRef} className={`... ${isOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}>
         {children}
       </div>
     );
   }
   ```
   Actually, `useDroppable` returns `isOver` directly. Restructure: call `useDroppable` inside the column component and use its `isOver` for styling. Each column's droppable id = the column status string ('RECEIVED', 'PREPARING', 'READY').
7. Wrap the kanban grid in `<DndContext>` with:
   - `id="orders-kanban-dnd"` (stable id, per CLAUDE.md hydration mismatch pattern)
   - `sensors={sensors}`
   - `collisionDetection={closestCorners}`
   - `modifiers={[restrictToWindowEdges]}`
   - `onDragStart`: set `activeOrderId` to `event.active.id as string`
   - `onDragEnd`: if `event.over` exists and `event.over.id !== currentOrderStatus`, call `handleStatusUpdate(orderId, event.over.id as string)`. Then set `activeOrderId` to null.
   - `onDragCancel`: set `activeOrderId` to null.
8. After the `DndContext` children, add `<DragOverlay>`:
   ```tsx
   <DragOverlay>
     {activeOrderId ? (
       <OrderCardDragPreview order={visibleOrders.find(o => o.id === activeOrderId)!} />
     ) : null}
   </DragOverlay>
   ```
9. Replace the plain column `<div>` with `<DroppableColumn status={status}>`. The column highlight styling: when `isOver` is true, add a ring/outline highlight. Keep the existing `COLUMN_BG_COLORS` and layer the drag-over highlight on top (e.g., `ring-2 ring-primary ring-offset-1` or a brighter version of the column bg).
10. Ensure the empty state (visibleOrders.length === 0) is OUTSIDE the DndContext so drag-and-drop is only active when there are orders.

**What NOT to do:**
- Do NOT use `@dnd-kit/sortable` -- this is cross-container drag (column-to-column), not reordering within a list. `useDraggable` + `useDroppable` is the correct approach.
- Do NOT add touch delay sensor -- PointerSensor with distance constraint works for both mouse and touch.
- Do NOT modify the WebSocket, polling, or status update logic -- those are already correct.
  </action>
  <verify>
    <automated>cd /home/alfie/bite-byte && pnpm --filter web build 2>&1 | tail -5</automated>
  </verify>
  <done>
- Order cards are draggable with useDraggable (opacity-50 when dragging)
- Columns are droppable zones with useDroppable (visual highlight ring when drag-over)
- DragOverlay shows lightweight card preview during drag
- DndContext has stable id="orders-kanban-dnd"
- PointerSensor distance:5 differentiates click from drag
- Dropping card in different column calls handleStatusUpdate with new column status
- Click-to-expand still works on order cards
- Buttons inside expanded cards still work (stopPropagation already handles this)
- Build succeeds with no TypeScript errors
  </done>
</task>

</tasks>

<verification>
1. `pnpm --filter web build` succeeds with no errors
2. Manual verification: open orders board, drag a card from Received to Preparing -- card moves and toast confirms status update
3. Manual verification: click a card without dragging -- expands/collapses as before
4. Manual verification: drag a card and see the overlay preview and column highlight
</verification>

<success_criteria>
- Drag-and-drop works across all 3 columns (RECEIVED, PREPARING, READY)
- Dropping triggers the same optimistic update + API call as button clicks
- Click-to-expand and button interactions remain functional
- Visual feedback: card ghost (opacity-50), column highlight (ring), drag overlay preview
- Build passes cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/12-add-drag-and-drop-to-live-orders-board-f/12-SUMMARY.md`
</output>
