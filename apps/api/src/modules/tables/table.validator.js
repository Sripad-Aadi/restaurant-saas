import { z } from 'zod';

export const createTableSchema = z.object({
  tableNumber: z.number().int().min(1, 'Table number must be at least 1'),
  label:       z.string().optional(),
});

export const updateTableSchema = z.object({
  label:    z.string().optional(),
  isActive: z.boolean().optional(),
});