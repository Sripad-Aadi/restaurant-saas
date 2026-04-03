import { z } from 'zod';

export const createStoreSchema = z.object({
  name:          z.string().min(2, 'Store name must be at least 2 characters'),
  slug:          z.string()
                   .min(2)
                   .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and hyphens'),
  logo:          z.string().url('Logo must be a valid URL').optional(),
  timezone:      z.string().optional(),
  adminName:     z.string().min(2, 'Admin name is required'),
  adminEmail:    z.string().email('Invalid admin email'),
  adminPassword: z.string().min(6, 'Admin password must be at least 6 characters'),
});

export const updateStoreSchema = z.object({
  name:     z.string().min(2).optional(),
  logo:     z.string().url().optional(),
  timezone: z.string().optional(),
});