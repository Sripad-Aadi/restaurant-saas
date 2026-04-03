import { z } from 'zod';

export const createCategorySchema = z.object({
  name:      z.string().min(1, 'Category name is required'),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = z.object({
  name:      z.string().min(1).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive:  z.boolean().optional(),
});

export const reorderCategorySchema = z.object({
  sortOrder: z.number().int().min(0),
});