'use client';

import { useState, useActionState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ItemCard } from './item-card';
import { ItemForm } from './item-form';
import {
  updateCategoryAction,
  deleteCategoryAction,
  type CategoryFormState,
} from '@/actions/menu';
import type { Category, MenuItem } from './category-list';

interface SortableCategoryProps {
  category: Category;
  venueId: string;
  onDeleted: (categoryId: string) => void;
  onUpdated: (categoryId: string, newName: string) => void;
}

const initialState: CategoryFormState = {};

export function SortableCategory({
  category,
  venueId,
  onDeleted,
  onUpdated,
}: SortableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(category.name);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [items, setItems] = useState<MenuItem[]>(category.items);
  const [isPending, startTransition] = useTransition();

  // Sync items when server re-renders with fresh data (after router.refresh())
  useEffect(() => {
    setItems(category.items);
  }, [category.items]);

  const boundUpdateAction = updateCategoryAction.bind(null, venueId, category.id);
  const [updateState, updateAction, isUpdating] = useActionState(boundUpdateAction, initialState);

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set('name', editNameValue);
    startTransition(async () => {
      const result = await updateCategoryAction(venueId, category.id, initialState, formData);
      if (!result.error && !result.fieldErrors) {
        onUpdated(category.id, editNameValue);
        setEditingName(false);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteCategoryAction(venueId, category.id);
      onDeleted(category.id);
    });
  }

  function handleItemDeleted(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  function handleAvailabilityChanged(itemId: string, isAvailable: boolean) {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, isAvailable } : item)),
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'border rounded-lg bg-card transition-shadow',
        isDragging ? 'shadow-lg opacity-80' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Category header */}
      <div className="flex items-center gap-2 px-3 py-3">
        {/* Drag handle */}
        <button
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Expand/collapse */}
        <button
          className="text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? 'Collapse category' : 'Expand category'}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Name / Edit */}
        {editingName ? (
          <form onSubmit={handleEditSubmit} className="flex items-center gap-1 flex-1">
            <Input
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              autoFocus
              className="h-7 text-sm"
            />
            <Button type="submit" size="icon" className="h-7 w-7" disabled={isPending || isUpdating}>
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setEditingName(false);
                setEditNameValue(category.name);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            {updateState?.error && (
              <span className="text-destructive text-xs ml-1">{updateState.error}</span>
            )}
          </form>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <span className="font-medium text-sm">{category.name}</span>
            <Badge variant="secondary" className="text-xs">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        )}

        {/* Category actions */}
        {!editingName && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setEditingName(true)}
              aria-label="Rename category"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  aria-label="Delete category"
                  disabled={isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete &quot;{category.name}&quot;?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {items.length > 0
                      ? `This category has ${items.length} item${items.length === 1 ? '' : 's'}. You must delete all items before deleting the category.`
                      : 'This will permanently delete this category. This action cannot be undone.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  {items.length === 0 && (
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Items list (expanded) */}
      {expanded && (
        <div className="px-3 pb-3 border-t">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No items yet. Add your first item.
            </p>
          ) : (
            <div className="space-y-2 pt-3">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  venueId={venueId}
                  categoryId={category.id}
                  item={item}
                  onDeleted={handleItemDeleted}
                  onAvailabilityChanged={handleAvailabilityChanged}
                />
              ))}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full border-dashed"
            onClick={() => setAddItemOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Item
          </Button>
        </div>
      )}

      {/* Add item dialog */}
      <ItemForm
        venueId={venueId}
        categoryId={category.id}
        open={addItemOpen}
        onClose={(saved) => {
          setAddItemOpen(false);
          if (saved) router.refresh();
        }}
      />
    </div>
  );
}
