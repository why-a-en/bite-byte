'use client'; // This file is only used in Client Components

import { useState, useEffect } from 'react';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: string;        // Decimal string e.g. "9.50"
  imageUrl: string | null;
  quantity: number;
}

export interface Cart {
  venueSlug: string;
  items: CartItem[];
}

export function useCart(venueSlug: string) {
  const key = `cart:${venueSlug}`;
  const [items, setItems] = useState<CartItem[]>([]);  // Server-safe initial value — empty
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // corrupt JSON — ignore
    }
    setHydrated(true);
  }, [key]);

  // Persist every change (only after hydration to avoid overwriting with empty)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch { /* storage full */ }
  }, [items, key, hydrated]);

  function addItem(item: Omit<CartItem, 'quantity'>) {
    setItems(prev => {
      const existing = prev.find(i => i.menuItemId === item.menuItemId);
      if (existing) return prev.map(i => i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function updateQuantity(menuItemId: string, quantity: number) {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.menuItemId !== menuItemId));
    } else {
      setItems(prev => prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i));
    }
  }

  function clearCart() { setItems([]); }

  const total = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, addItem, updateQuantity, clearCart, total, itemCount, hydrated };
}
