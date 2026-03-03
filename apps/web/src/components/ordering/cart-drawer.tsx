'use client';

import Link from 'next/link';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import type { CartItem } from '@/lib/cart';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  venueSlug: string;
  onUpdateQuantity: (id: string, qty: number) => void;
}

export function CartDrawer({
  open,
  onClose,
  items,
  total,
  venueSlug,
  onUpdateQuantity,
}: CartDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={isOpen => { if (!isOpen) onClose(); }} direction="bottom">
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-bold">Your Cart</DrawerTitle>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close cart"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </DrawerHeader>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="mb-3 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="text-sm font-medium">Your cart is empty</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map(item => (
                <li key={item.menuItemId} className="flex items-center gap-4 px-4 py-3">
                  {/* Item info */}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      £{parseFloat(item.price).toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                      aria-label="Decrease quantity"
                    >
                      <span className="text-base leading-none">−</span>
                    </button>

                    <span className="w-6 text-center text-sm font-semibold tabular-nums">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                      aria-label="Increase quantity"
                    >
                      <span className="text-base leading-none">+</span>
                    </button>
                  </div>

                  {/* Subtotal */}
                  <p className="w-14 text-right text-sm font-semibold text-gray-900">
                    £{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.menuItemId, 0)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <DrawerFooter className="border-t border-gray-100">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-base font-bold text-gray-900">
                £{total.toFixed(2)}
              </span>
            </div>
            <Link
              href={`/menu/${venueSlug}/checkout`}
              className="block w-full rounded-full bg-black py-3 text-center text-base font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
              onClick={onClose}
            >
              Checkout
            </Link>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
