'use client';

import { motion } from 'motion/react';

interface CartButtonProps {
  itemCount: number;
  total: number;
  onClick: () => void;
}

export function CartButton({ itemCount, total, onClick }: CartButtonProps) {
  // Hidden when cart is empty
  if (itemCount === 0) return null;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ y: 4, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 min-h-13 text-white shadow-[0_4px_20px_rgba(249,115,22,0.4)] transition-transform hover:scale-105 cursor-pointer"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
        {itemCount}
      </span>
      <span className="font-medium">View Cart</span>
      <span className="font-semibold">£{total.toFixed(2)}</span>
    </motion.button>
  );
}
