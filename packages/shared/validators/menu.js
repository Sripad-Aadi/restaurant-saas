import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional()
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProductSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().int().min(0, 'Price cannot be negative'), // stored in paise
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});

export const updateProductSchema = createProductSchema.partial();
