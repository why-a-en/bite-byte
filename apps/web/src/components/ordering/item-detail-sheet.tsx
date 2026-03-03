'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import type { PublicMenuItem } from '@/app/(menu)/menu/[slug]/page';

interface ItemDetailSheetProps {
  item: PublicMenuItem | null;
  onClose: () => void;
  onAddToCart: (item: PublicMenuItem) => void;
}

export function ItemDetailSheet({ item, onClose, onAddToCart }: ItemDetailSheetProps) {
  function handleAddToCart() {
    if (!item) return;
    onAddToCart(item);
    onClose();
  }

  return (
    <Drawer open={item !== null} onOpenChange={open => { if (!open) onClose(); }} direction="bottom">
      <DrawerContent className="max-h-[85vh]">
        {item && (
          <>
            {/* Full-width image */}
            {item.imageUrl && (
              <div className="h-56 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <DrawerHeader className="text-left">
              <DrawerTitle className="text-xl font-bold">{item.name}</DrawerTitle>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                £{parseFloat(item.price).toFixed(2)}
              </p>
              {item.description && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              )}
            </DrawerHeader>

            <DrawerFooter>
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full rounded-full bg-black py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
              >
                Add to Cart
              </button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
