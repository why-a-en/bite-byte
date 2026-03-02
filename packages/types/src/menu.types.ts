import { z } from 'zod';

// v1: empty object, passthrough for v2 modifier support
export const MenuItemMetadataSchema = z.object({}).passthrough();
export type MenuItemMetadata = z.infer<typeof MenuItemMetadataSchema>;

export const MenuCategorySchema = z.object({
  id: z.string().uuid(),
  venueId: z.string().uuid(),
  name: z.string().min(1),
  sortOrder: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type MenuCategory = z.infer<typeof MenuCategorySchema>;

export const MenuItemSchema = z.object({
  id: z.string().uuid(),
  venueId: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  price: z.string().regex(/^\d+\.\d{2}$/), // Decimal as string to avoid float precision
  imageUrl: z.string().url().nullable(),
  isAvailable: z.boolean(),
  sortOrder: z.number().int(),
  metadata: MenuItemMetadataSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type MenuItem = z.infer<typeof MenuItemSchema>;
