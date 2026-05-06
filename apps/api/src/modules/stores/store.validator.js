import { z } from 'zod';

export const createStoreSchema = z.object({
  name:          z.string().min(2, 'Store name must be at least 2 characters'),
  slug:          z.string()
                   .min(2)
                   .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and hyphens'),
  logo:          z.string().url('Logo must be a valid URL').optional(),
  coverImage:    z.string().url('Cover image must be a valid URL').optional(),
  description:   z.string().max(500).optional(),
  cuisineType:   z.string().optional(),
  timezone:      z.string().optional(),
  avgWaitTime:   z.string().optional(),
  razorpay:      z.object({
                   keyId: z.string().nullable().optional(),
                   keySecret: z.string().nullable().optional(),
                 }).optional(),
  adminName:     z.string().min(2, 'Admin name is required'),
  adminEmail:    z.string().email('Invalid admin email'),
  adminPassword: z.string().min(6, 'Admin password must be at least 6 characters'),
});

export const updateStoreSchema = z.object({
  name:        z.string().min(2).optional(),
  logo:        z.union([z.string().url(), z.literal('')]).optional(),
  timezone:    z.string().optional(),
  description: z.string().max(500).optional(),
  cuisineType: z.string().optional(),
  avgWaitTime: z.string().optional(),
});

export const getStoresQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['true', 'false', 'all']).optional(),
  page:   z.string().regex(/^\d+$/).transform(Number).optional(),
  limit:  z.string().regex(/^\d+$/).transform(Number).optional(),
  stats:  z.string().optional().transform(v => v === 'true'),
});