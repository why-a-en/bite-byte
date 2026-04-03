'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
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
      <header className="relative border-b border-primary/10 px-5 pb-5 pt-6">
        {/* Orange accent strip */}
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/80 via-primary to-primary/80" />
        <div className="flex items-center gap-4">
          {venue.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={venue.logoUrl}
              alt={`${venue.name} logo`}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20 shadow-sm"
            />
          )}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{venue.name}</h1>
            <p className="text-sm font-medium text-gray-400 mt-0.5">Menu</p>
          </div>
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
          venue.categories.map((category, index) => (
            <motion.section
              key={category.id}
              id={category.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {/* Category heading */}
              <div className="scroll-mt-14 border-l-3 border-primary bg-white px-5 py-4">
                <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
              </div>

              {/* Items */}
              {category.items.length === 0 ? (
                <p className="px-5 py-3 text-sm text-gray-400">No items in this category.</p>
              ) : (
                category.items.map(item => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    onTap={setSelectedItem}
                  />
                ))
              )}
            </motion.section>
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
