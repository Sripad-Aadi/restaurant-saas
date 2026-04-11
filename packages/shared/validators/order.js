import { z } from 'zod';

export const createOrderSchema = z.object({
  tableId: z.string().min(1, 'Table ID is required'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().min(1)
  })).min(1, 'Order must contain at least one item'),
  idempotencyKey: z.string().min(1, 'Idempotency Key is required')
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'])
});
