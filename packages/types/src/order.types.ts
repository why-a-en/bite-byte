import { z } from 'zod';

export const OrderStatusSchema = z.enum([
  'PENDING_PAYMENT', 'RECEIVED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED',
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const PaymentMethodSchema = z.enum(['STRIPE', 'PAY_AT_COUNTER']);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

// v1: empty array, extensible for v2 modifier selections
export const OrderItemModifiersSchema = z.array(z.unknown());
export type OrderItemModifiers = z.infer<typeof OrderItemModifiersSchema>;

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  menuItemId: z.string().uuid().nullable(),
  itemNameAtOrder: z.string().min(1),
  unitPriceAtOrder: z.string().regex(/^\d+\.\d{2}$/),
  quantity: z.number().int().positive(),
  selectedModifiers: OrderItemModifiersSchema,
  createdAt: z.string().datetime(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  venueId: z.string().uuid(),
  status: OrderStatusSchema,
  paymentMethod: PaymentMethodSchema,
  paymentIntentId: z.string().nullable(),
  totalAmount: z.string().regex(/^\d+\.\d{2}$/),
  referenceCode: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Order = z.infer<typeof OrderSchema>;
