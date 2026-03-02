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
    // Fetch venue name for page title
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Menu Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">{venueName}</p>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-card">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">No categories yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
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
