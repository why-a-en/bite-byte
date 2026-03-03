'use client';

interface CartButtonProps {
  itemCount: number;
  total: number;
  onClick: () => void;
}

export function CartButton({ itemCount, total, onClick }: CartButtonProps) {
  // Hidden when cart is empty
  if (itemCount === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full bg-black px-6 py-3 text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
        {itemCount}
      </span>
      <span className="font-medium">View Cart</span>
      <span className="font-semibold">£{total.toFixed(2)}</span>
    </button>
  );
}
