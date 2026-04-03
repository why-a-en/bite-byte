'use client';

import type { PublicMenuItem } from '@/app/(menu)/menu/[slug]/page';

interface MenuItemRowProps {
  item: PublicMenuItem;
  onTap: (item: PublicMenuItem) => void;
}

export function MenuItemRow({ item, onTap }: MenuItemRowProps) {
  const available = item.isAvailable;

  return (
    <button
      type="button"
      onClick={() => available && onTap(item)}
      disabled={!available}
      className={`flex w-full items-center gap-4 border-b border-gray-100 px-4 py-5 text-left transition-colors ${
        available
          ? 'active:bg-gray-50 cursor-pointer'
          : 'opacity-50 cursor-not-allowed'
      }`}
    >
      {/* Left: text content */}
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold text-gray-900">{item.name}</p>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">
            {item.description}
          </p>
        )}
        <p className="mt-1 font-semibold text-primary">
          £{parseFloat(item.price).toFixed(2)}
        </p>
      </div>

      {/* Right: thumbnail */}
      {item.imageUrl && (
        <div className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-20 w-20 rounded-xl object-cover shadow-sm"
          />
        </div>
      )}
    </button>
  );
}
