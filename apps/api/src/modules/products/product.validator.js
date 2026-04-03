import { z } from 'zod';

export const createProductSchema = z.object({
  categoryId:  z.string().min(1, 'Category is required'),
  name:        z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price:       z.number().int().min(1, 'Price must be at least 1 paise'),
  imageUrl:    z.string().url('Must be a valid URL').optional(),
  sortOrder:   z.number().int().min(0).optional(),
});

export const updateProductSchema = z.object({
  categoryId:  z.string().optional(),
  name:        z.string().min(1).optional(),
  description: z.string().optional(),
  price:       z.number().int().min(1).optional(),
  imageUrl:    z.string().url().optional(),
  isAvailable: z.boolean().optional(),
  sortOrder:   z.number().int().min(0).optional(),
});