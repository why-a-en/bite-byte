'use client';

import { motion } from 'motion/react';
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
            {/* Decorative orange accent */}
            <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-primary/30" />

            {/* Full-width image */}
            {item.imageUrl && (
              <div className="h-64 w-full overflow-hidden rounded-t-xl">
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
              <p className="mt-1 text-2xl font-bold text-primary">
                £{parseFloat(item.price).toFixed(2)}
              </p>
              {item.description && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              )}
            </DrawerHeader>

            <DrawerFooter>
              <motion.button
                type="button"
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-full bg-primary py-4 text-lg font-semibold text-white transition-colors hover:bg-primary/90 active:bg-primary/80 cursor-pointer"
              >
                Add to Cart
              </motion.button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
