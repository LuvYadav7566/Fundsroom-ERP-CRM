import { z } from 'zod';

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, 'Customer selection is required'),
    items: z
      .array(
        z.object({
          productId: z.string().min(1, 'Product ID is required'),
          quantity: z.number().int().positive('Quantity must be greater than zero'),
        })
      )
      .min(1, 'At least one product item is required in the sales challan'),
  }),
});

export const confirmChallanSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Challan ID is required'),
  }),
});
