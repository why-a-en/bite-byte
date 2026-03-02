'use client';

import { useState, useActionState, useTransition } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SortableCategory } from './sortable-category';
import {
  createCategoryAction,
  reorderCategoriesAction,
  type CategoryFormState,
} from '@/actions/menu';

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

interface CategoryListProps {
  venueId: string;
  initialCategories: Category[];
}

const initialState: CategoryFormState = {};

export function CategoryList({ venueId, initialCategories }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const boundCreateAction = createCategoryAction.bind(null, venueId);
  const [formState, formAction, isFormPending] = useActionState(boundCreateAction, initialState);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic update
    const reordered = arrayMove(categories, oldIndex, newIndex).map((cat, idx) => ({
      ...cat,
      sortOrder: idx,
    }));
    setCategories(reordered);

    // Persist to API
    startTransition(async () => {
      await reorderCategoriesAction(
        venueId,
        reordered.map((cat) => ({ id: cat.id, sortOrder: cat.sortOrder })),
      );
    });
  }

  function handleCategoryDeleted(categoryId: string) {
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  }

  function handleCategoryUpdated(categoryId: string, newName: string) {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, name: newName } : cat)),
    );
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((cat) => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((category) => (
            <SortableCategory
              key={category.id}
              category={category}
              venueId={venueId}
              onDeleted={handleCategoryDeleted}
              onUpdated={handleCategoryUpdated}
            />
          ))}
        </SortableContext>
      </DndContext>

      {isPending && (
        <p className="text-xs text-muted-foreground text-center">Saving order...</p>
      )}

      {/* Add Category */}
      {showAddForm ? (
        <form
          action={async (formData) => {
            await formAction(formData);
            setShowAddForm(false);
          }}
          className="border rounded-lg p-4 bg-card"
        >
          <p className="font-medium text-sm mb-2">New Category</p>
          <div className="flex gap-2">
            <Input
              name="name"
              placeholder="Category name"
              autoFocus
              required
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={isFormPending}>
              {isFormPending ? 'Adding...' : 'Add'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
          </div>
          {formState?.error && (
            <p className="text-destructive text-xs mt-1">{formState.error}</p>
          )}
          {formState?.fieldErrors?.name && (
            <p className="text-destructive text-xs mt-1">{formState.fieldErrors.name[0]}</p>
          )}
        </form>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      )}
    </div>
  );
}
