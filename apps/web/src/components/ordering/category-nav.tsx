'use client';

import type { PublicCategory } from '@/app/(menu)/menu/[slug]/page';

interface CategoryNavProps {
  categories: PublicCategory[];
  activeId?: string;
}

export function CategoryNav({ categories, activeId }: CategoryNavProps) {
  function scrollToCategory(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <nav
      className="sticky top-0 z-40 flex gap-2 overflow-x-auto border-b border-gray-100 bg-white px-4 py-2"
      aria-label="Menu categories"
    >
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => scrollToCategory(category.id)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeId === category.id
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </nav>
  );
}
