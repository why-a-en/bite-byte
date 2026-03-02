import { z } from 'zod';

export const PaymentModeSchema = z.enum(['PREPAY_REQUIRED', 'PAY_AT_COUNTER', 'BOTH']);
export type PaymentMode = z.infer<typeof PaymentModeSchema>;

export const VenueSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().nullable(),
  paymentMode: PaymentModeSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Venue = z.infer<typeof VenueSchema>;
