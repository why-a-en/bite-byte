'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { createItemAction, updateItemAction, type ItemFormState } from '@/actions/menu';
import type { MenuItem } from './category-list';

const MAX_FILE_SIZE_MB = 4;

interface ItemFormProps {
  venueId: string;
  categoryId: string;
  existingItem?: MenuItem;
  open: boolean;
  onClose: (saved?: boolean) => void;
}

const initialState: ItemFormState = {};

export function ItemForm({ venueId, categoryId, existingItem, open, onClose }: ItemFormProps) {
  const isEdit = Boolean(existingItem);

  const boundAction = isEdit
    ? updateItemAction.bind(null, venueId, existingItem!.id)
    : createItemAction.bind(null, venueId, categoryId);

  const [formState, formAction, isPending] = useActionState(boundAction, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingItem?.imageUrl ?? null);
  const [fileSizeWarning, setFileSizeWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep a ref to onClose so the effect below doesn't re-run each time the
  // parent re-renders and creates a new inline arrow function. Without this,
  // router.refresh() → re-render → new onClose ref → effect fires → refresh loop.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (formState.success) {
      onCloseRef.current(true);
    }
  }, [formState.success]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(existingItem?.imageUrl ?? null);
      setFileSizeWarning(null);
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      setFileSizeWarning(`File is ${sizeMB.toFixed(1)} MB — max is ${MAX_FILE_SIZE_MB} MB. Please choose a smaller image.`);
    } else {
      setFileSizeWarning(null);
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleClose() {
    setPreviewUrl(existingItem?.imageUrl ?? null);
    setFileSizeWarning(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Item' : 'Add Item'}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="item-name">Name *</Label>
            <Input
              id="item-name"
              name="name"
              defaultValue={existingItem?.name ?? ''}
              placeholder="e.g. Cheeseburger"
              required
            />
            {formState.fieldErrors?.name && (
              <p className="text-destructive text-xs">{formState.fieldErrors.name[0]}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1">
            <Label htmlFor="item-price">Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                id="item-price"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={existingItem?.price ?? ''}
                placeholder="0.00"
                className="pl-7"
                required
              />
            </div>
            {formState.fieldErrors?.price && (
              <p className="text-destructive text-xs">{formState.fieldErrors.price[0]}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="item-description">Description</Label>
            <Textarea
              id="item-description"
              name="description"
              defaultValue={existingItem?.description ?? ''}
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          {/* Photo */}
          <div className="space-y-1">
            <Label htmlFor="item-photo">Photo</Label>
            <div className="flex items-start gap-3">
              {previewUrl ? (
                <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-muted shrink-0">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-md border border-dashed bg-muted flex items-center justify-center shrink-0">
                  <span className="text-xs text-muted-foreground">Photo</span>
                </div>
              )}
              <div className="flex-1 space-y-1">
                <input
                  id="item-photo"
                  ref={fileInputRef}
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-sm file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">Max {MAX_FILE_SIZE_MB} MB</p>
                {fileSizeWarning && (
                  <p className="text-destructive text-xs">{fileSizeWarning}</p>
                )}
              </div>
            </div>
          </div>

          {/* Server errors */}
          {formState?.error && (
            <p className="text-destructive text-sm">{formState.error}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || Boolean(fileSizeWarning)}>
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
