import { z } from 'zod';
import { ORDER_STATUSES } from '@restaurant-saas/shared';

export const createOrderSchema = z.object({
  tableId:        z.string().min(1, 'Table ID is required'),
  idempotencyKey: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity:  z.number().int().min(1, 'Quantity must be at least 1'),
  })).min(1, 'Order must have at least one item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(Object.values(ORDER_STATUSES)),
});