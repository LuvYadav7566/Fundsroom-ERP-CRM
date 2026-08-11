import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    productName: z.string().min(2, 'Product name is required'),
    sku: z.string().min(2, 'SKU code is required'),
    category: z.string().min(2, 'Category is required'),
    unitPrice: z.number().min(0, 'Unit price cannot be negative'),
    currentStock: z.number().int().min(0, 'Current stock cannot be negative').default(0),
    minimumStock: z.number().int().min(0, 'Minimum stock cannot be negative').default(5),
    warehouseLocation: z.string().min(2, 'Warehouse location is required'),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
  body: z.object({
    productName: z.string().min(2).optional(),
    sku: z.string().min(2).optional(),
    category: z.string().min(2).optional(),
    unitPrice: z.number().min(0).optional(),
    currentStock: z.number().int().min(0).optional(),
    minimumStock: z.number().int().min(0).optional(),
    warehouseLocation: z.string().min(2).optional(),
  }),
});
