import { z } from 'zod';

export const createProductSchema = z.object({
  categoryId:  z.string().min(1, 'Category is required'),
  name:        z.string().min(1, 'Product name is required'),
  description: z.string().optional().or(z.literal('')),
  price:       z.number().int().min(1, 'Price must be at least 1 paise'),
  image:       z.string().url('Must be a valid URL').optional().or(z.literal('')),
  foodType:    z.enum(['veg', 'non-veg', 'egg']).optional(),
  allergens:   z.array(z.string()).optional(),
  sortOrder:   z.number().int().min(0).optional(),
});

export const updateProductSchema = z.object({
  categoryId:  z.string().optional(),
  name:        z.string().min(1).optional(),
  description: z.string().optional().or(z.literal('')),
  price:       z.number().int().min(1).optional(),
  image:       z.string().url().optional().or(z.literal('')),
  foodType:    z.enum(['veg', 'non-veg', 'egg']).optional(),
  allergens:   z.array(z.string()).optional(),
  isAvailable: z.boolean().optional(),
  sortOrder:   z.number().int().min(0).optional(),
});