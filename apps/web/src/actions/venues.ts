'use server';

import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';
import { z } from 'zod';
import { fetchApi } from '@/lib/api';

const createVenueSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
});

const updateVenueSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only')
    .optional(),
  paymentMode: z.enum(['PREPAY_REQUIRED', 'PAY_AT_COUNTER', 'BOTH']).optional(),
});

export type VenueFormState = {
  error?: string;
  fieldErrors?: {
    name?: string[];
    slug?: string[];
    paymentMode?: string[];
  };
};

export async function createVenueAction(
  _prevState: VenueFormState,
  formData: FormData,
): Promise<VenueFormState> {
  const rawData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
  };

  const parsed = createVenueSchema.safeParse(rawData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let venue: { id: string };
  try {
    venue = await fetchApi('/venues', {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create venue';
    if (message.includes('already exists') || message.includes('duplicate')) {
      return { error: 'A venue with that slug already exists. Please choose a different slug.' };
    }
    return { error: message };
  }

  redirect(`/venues/${venue.id}`);
}

export async function updateVenueAction(
  venueId: string,
  _prevState: VenueFormState,
  formData: FormData,
): Promise<VenueFormState> {
  const rawData: Record<string, string> = {};
  if (formData.get('name')) rawData.name = formData.get('name') as string;
  if (formData.get('slug')) rawData.slug = formData.get('slug') as string;
  if (formData.get('paymentMode')) rawData.paymentMode = formData.get('paymentMode') as string;

  const parsed = updateVenueSchema.safeParse(rawData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await fetchApi(`/venues/${venueId}`, {
      method: 'PATCH',
      body: JSON.stringify(parsed.data),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update venue';
    return { error: message };
  }

  return {};
}

export async function deleteVenueAction(venueId: string): Promise<void> {
  try {
    await fetchApi(`/venues/${venueId}`, { method: 'DELETE' });
  } catch {
    // Ignore errors on delete — venue may already not exist
  }
  redirect('/dashboard');
}

export async function uploadLogoAction(
  venueId: string,
  formData: FormData,
): Promise<{ error?: string; logoUrl?: string }> {
  const file = formData.get('logo') as File | null;
  if (!file || file.size === 0) {
    return { error: 'No file selected' };
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { error: 'File must be an image' };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Image must be smaller than 5MB' };
  }

  let logoUrl: string;
  try {
    const blob = await put(`venues/${venueId}/logo-${Date.now()}`, file, {
      access: 'public',
    });
    logoUrl = blob.url;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    // Gracefully handle missing token in dev
    if (message.includes('BLOB_READ_WRITE_TOKEN') || message.includes('token')) {
      return { error: 'Image upload is not configured in this environment. Set BLOB_READ_WRITE_TOKEN.' };
    }
    return { error: message };
  }

  try {
    await fetchApi(`/venues/${venueId}`, {
      method: 'PATCH',
      body: JSON.stringify({ logoUrl }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save logo URL';
    return { error: message };
  }

  return { logoUrl };
}
