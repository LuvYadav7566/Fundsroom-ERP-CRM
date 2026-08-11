import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
    mobile: z.string().min(8, 'Mobile number must be at least 8 characters'),
    email: z.string().email('Please provide a valid email address'),
    businessName: z.string().min(2, 'Business name is required'),
    gstNumber: z.string().optional().nullable(),
    customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('LEAD'),
    followUpDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Customer ID is required'),
  }),
  body: z.object({
    customerName: z.string().min(2).optional(),
    mobile: z.string().min(8).optional(),
    email: z.string().email().optional(),
    businessName: z.string().min(2).optional(),
    gstNumber: z.string().optional().nullable(),
    customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']).optional(),
    address: z.string().min(5).optional(),
    status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional(),
    followUpDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});
