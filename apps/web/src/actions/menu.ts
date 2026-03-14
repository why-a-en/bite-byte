'use server';

import { revalidatePath } from 'next/cache';
import { put } from '@vercel/blob';
import { fetchApi } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CategoryFormState = {
  error?: string;
  fieldErrors?: {
    name?: string[];
  };
};

export type ItemFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string[];
    price?: string[];
    description?: string[];
  };
};

// ---------------------------------------------------------------------------
// Category actions
// ---------------------------------------------------------------------------

export async function createCategoryAction(
  venueId: string,
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const name = (formData.get('name') as string)?.trim();
  if (!name || name.length === 0) {
    return { fieldErrors: { name: ['Category name is required'] } };
  }

  try {
    await fetchApi(`/venues/${venueId}/categories`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create category';
    return { error: message };
  }

  revalidatePath(`/venues/${venueId}/menu`);
  return {};
}

export async function updateCategoryAction(
  venueId: string,
  categoryId: string,
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const name = (formData.get('name') as string)?.trim();
  if (!name || name.length === 0) {
    return { fieldErrors: { name: ['Category name is required'] } };
  }

  try {
    await fetchApi(`/venues/${venueId}/categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update category';
    return { error: message };
  }

  revalidatePath(`/venues/${venueId}/menu`);
  return {};
}

export async function deleteCategoryAction(
  venueId: string,
  categoryId: string,
): Promise<{ error?: string }> {
  try {
    await fetchApi(`/venues/${venueId}/categories/${categoryId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete category';
    return { error: message };
  }

  revalidatePath(`/venues/${venueId}/menu`);
  return {};
}

export async function reorderCategoriesAction(
  venueId: string,
  items: { id: string; sortOrder: number }[],
): Promise<{ error?: string }> {
  try {
    await fetchApi(`/venues/${venueId}/categories/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(items),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to reorder categories';
    return { error: message };
  }

  revalidatePath(`/venues/${venueId}/menu`);
  return {};
}

// ---------------------------------------------------------------------------
// Item actions
// ---------------------------------------------------------------------------

export async function createItemAction(
  venueId: string,
  categoryId: string,
  _prevState: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || undefined;
  const priceRaw = formData.get('price') as string;
  const photo = formData.get('photo') as File | null;

  if (!name || name.length === 0) {
    return { fieldErrors: { name: ['Item name is required'] } };
  }

  const price = parseFloat(priceRaw);
  if (isNaN(price) || price < 0.01) {
    return { fieldErrors: { price: ['Price must be at least 0.01'] } };
  }

  let imageUrl: string | undefined;

  if (photo && photo.size > 0) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // Skip upload gracefully in dev without token
    } else {
      try {
        const blob = await put(`venues/${venueId}/items/${Date.now()}`, photo, {
          access: 'public',
        });
        imageUrl = blob.url;
      } catch {
        // Non-fatal: proceed without image
      }
    }
  }

  try {
    await fetchApi(`/venues/${venueId}/categories/${categoryId}/items`, {
      method: 'POST',
      body: JSON.stringify({ name, description, price, imageUrl }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create item';
    return { error: message };
  }

  revalidatePath(`/venues/${venueId}/menu`);
  return { success: true };
}

export async function updateItemAction(
  venueId: string,
  itemId: string,
  _prevState: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || undefined;
  const priceRaw = formData.get('price') as string;
  const photo = formData.get('photo') as File | null;

  if (!name || name.length === 0) {
    return { fieldErrors: { name: ['Item name is required'] } };
  }

  const price = parseFloat(priceRaw);
  if (isNaN(price) || price < 0.01) {
    return { fieldErrors: { price: ['Price must be at least 0.01'] } };
  }

  let imageUrl: string | undefined;

  if (photo && photo.size > 0) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // Skip upload gracefully in dev without token
    } else {
      try {
        const blob = await put(`venues/${venueId}/items/${Date.now()}`, photo, {
          access: 'public',
        });
        imageUrl = blob.url;
      } catch {
        // Non-fatal: proceed without image update
      }
    }
  }

  const body: Record<string, unknown> = { name, price };
  if (description !== undefined) body.description = description;
  if (imageUrl !== undefined) body.imageUrl = imageUrl;

  try {
    await fetchApi(`/venues/${venueId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update item';
    return { error: message };
  }

  revalidatePath(`/venues/${venueId}/menu`);
  return { success: true };
}

export async function deleteItemAction(
  venueId: string,
  itemId: string,
): Promise<{ error?: string }> {
  try {
    await fetchApi(`/venues/${venueId}/items/${itemId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete item';
    return { error: message };
  }

  revalidatePath(`/venues/${venueId}/menu`);
  return {};
}

export async function toggleAvailabilityAction(
  venueId: string,
  itemId: string,
  isAvailable: boolean,
): Promise<{ error?: string }> {
  try {
    await fetchApi(`/venues/${venueId}/items/${itemId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update availability';
    return { error: message };
  }

  revalidatePath(`/venues/${venueId}/menu`);
  return {};
}
