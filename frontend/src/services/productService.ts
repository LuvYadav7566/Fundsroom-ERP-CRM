import { api } from './api';
import { ApiResponse, Product } from '../types';

export const productService = {
  getProducts: async (params?: {
    search?: string;
    category?: string;
    lowStock?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get<ApiResponse<Product[]>>('/products', { params });
    return res.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const res = await api.post<ApiResponse<Product>>('/products', data);
    return res.data.data;
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data.data;
  },
};
