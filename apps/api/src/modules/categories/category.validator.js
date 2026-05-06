import { z } from 'zod';

export const createCategorySchema = z.object({
  name:        z.string().min(1, 'Category name is required'),
  description: z.string().max(300).optional().or(z.literal('')),
  image:       z.string().url().optional().or(z.literal('')),
  sortOrder:   z.number().int().min(0).optional(),
});

export const updateCategorySchema = z.object({
  name:        z.string().min(1).optional(),
  description: z.string().max(300).optional().or(z.literal('')),
  image:       z.string().url().optional().or(z.literal('')),
  sortOrder:   z.number().int().min(0).optional(),
  isActive:    z.boolean().optional(),
});

export const reorderCategorySchema = z.object({
  sortOrder: z.number().int().min(0),
});