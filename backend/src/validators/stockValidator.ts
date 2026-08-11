import { z } from 'zod';

export const addStockSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity added must be a positive integer'),
    reason: z.string().min(3, 'Reason for inward stock movement is required'),
  }),
});
