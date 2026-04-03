'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { CategoryNav } from './category-nav';
import { MenuItemRow } from './menu-item-row';
import { ItemDetailSheet } from './item-detail-sheet';
import { CartButton } from './cart-button';
import { CartDrawer } from './cart-drawer';
import type { PublicVenue, PublicMenuItem } from '@/app/(menu)/menu/[slug]/page';

interface MenuPageProps {
  venue: PublicVenue;
}

export function MenuPage({ venue }: MenuPageProps) {
  const { items: cartItems, addItem, updateQuantity, total, itemCount } = useCart(venue.slug);
  const [selectedItem, setSelectedItem] = useState<PublicMenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  function handleAddToCart(item: PublicMenuItem) {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
    });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          {venue.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={venue.logoUrl}
              alt={`${venue.name} logo`}
              className="h-10 w-10 rounded-full object-cover"
            />
          )}
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{venue.name}</h1>
        </div>
      </header>

      {/* Category navigation */}
      {venue.categories.length > 0 && (
        <CategoryNav categories={venue.categories} />
      )}

      {/* Menu categories and items */}
      <main className="pb-32 max-w-lg mx-auto">
        {venue.categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-base">No menu items available yet.</p>
          </div>
        ) : (
          venue.categories.map(category => (
            <section key={category.id} id={category.id}>
              {/* Category heading */}
              <div className="bg-gray-50 px-4 py-2">
                <h2 className="text-base font-semibold text-gray-700">{category.name}</h2>
              </div>

              {/* Items */}
              {category.items.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">No items in this category.</p>
              ) : (
                category.items.map(item => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    onTap={setSelectedItem}
                  />
                ))
              )}
            </section>
          ))
        )}
      </main>

      {/* Item detail bottom sheet */}
      <ItemDetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Floating cart button */}
      <CartButton
        itemCount={itemCount}
        total={total}
        onClick={() => setCartOpen(true)}
      />

      {/* Cart drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        total={total}
        venueSlug={venue.slug}
        onUpdateQuantity={updateQuantity}
      />
    </div>
  );
}
