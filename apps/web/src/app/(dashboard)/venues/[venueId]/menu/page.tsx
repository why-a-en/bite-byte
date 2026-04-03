import { fetchApi } from '@/lib/api';
import { CategoryList, type Category } from '@/components/menu/category-list';
import { UtensilsCrossed } from 'lucide-react';

interface MenuPageProps {
  params: Promise<{ venueId: string }>;
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { venueId } = await params;

  let categories: Category[] = [];
  let venueName = 'Menu';

  try {
    const venue = await fetchApi(`/venues/${venueId}`);
    venueName = venue.name ?? 'Menu';
  } catch {
    // Non-fatal — render without venue name
  }

  try {
    categories = await fetchApi(`/venues/${venueId}/categories`);
  } catch {
    categories = [];
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Menu Builder
        </h1>
        <p className="text-sm text-gray-500 mt-1">{venueName}</p>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
            <UtensilsCrossed className="h-6 w-6 text-gray-300" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            No categories yet
          </h2>
          <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">
            Add your first category to start building your menu.
          </p>
          <CategoryList venueId={venueId} initialCategories={[]} />
        </div>
      ) : (
        <CategoryList venueId={venueId} initialCategories={categories} />
      )}
    </div>
  );
}
