'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
import { ItemForm } from './item-form';
import { deleteItemAction, toggleAvailabilityAction } from '@/actions/menu';
import type { MenuItem } from './category-list';

interface ItemCardProps {
  venueId: string;
  categoryId: string;
  item: MenuItem;
  onDeleted: (itemId: string) => void;
  onAvailabilityChanged: (itemId: string, isAvailable: boolean) => void;
}

export function ItemCard({ venueId, categoryId, item, onDeleted, onAvailabilityChanged }: ItemCardProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(item.isAvailable);
  const [isPending, startTransition] = useTransition();

  function handleToggleAvailability(checked: boolean) {
    // Optimistic update
    setIsAvailable(checked);
    onAvailabilityChanged(item.id, checked);

    startTransition(async () => {
      const result = await toggleAvailabilityAction(venueId, item.id, checked);
      if (result.error) {
        // Roll back on error
        setIsAvailable(!checked);
        onAvailabilityChanged(item.id, !checked);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteItemAction(venueId, item.id);
      onDeleted(item.id);
    });
  }

  return (
    <>
      <div
        className={[
          'flex items-center gap-3 p-3 rounded-md border bg-background transition-opacity',
          !isAvailable ? 'opacity-60' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Thumbnail */}
        <div className="h-16 w-16 rounded-md overflow-hidden border bg-muted shrink-0 flex items-center justify-center">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <span className="text-xs text-muted-foreground text-center px-1">No photo</span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {item.description}
                </p>
              )}
              <p className="text-sm font-medium text-brand mt-1">
                ${Number(item.price).toFixed(2)}
              </p>
            </div>

            {!isAvailable && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Unavailable
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Availability toggle — the "86" toggle */}
          <div className="flex flex-col items-center gap-0.5">
            <Switch
              checked={isAvailable}
              onCheckedChange={handleToggleAvailability}
              disabled={isPending}
              aria-label={isAvailable ? 'Mark unavailable' : 'Mark available'}
            />
            <span className="text-xs text-muted-foreground">
              {isAvailable ? 'Available' : '86\'d'}
            </span>
          </div>

          {/* Edit */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setEditOpen(true)}
            aria-label="Edit item"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                aria-label="Delete item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{item.name}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this item. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Edit dialog */}
      <ItemForm
        venueId={venueId}
        categoryId={categoryId}
        existingItem={item}
        open={editOpen}
        onClose={(saved) => {
          setEditOpen(false);
          if (saved) router.refresh();
        }}
      />
    </>
  );
}
